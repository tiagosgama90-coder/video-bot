import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import axios from 'axios';
import { getDownloadURL, getStorage } from 'firebase-admin/storage';
import { inicializarFirebase } from './inicializar-app';

export type ProvedorStorage = 'firebase' | 'cloudinary';

function cloudinaryConfigurado(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim(),
  );
}

/** Cloudinary configurado = hospedagem principal (não precisa de cartão no Google). */
function usarCloudinaryComoPrincipal(): boolean {
  if (process.env.STORAGE_PROVIDER === 'firebase') {
    return false;
  }
  return process.env.STORAGE_PROVIDER === 'cloudinary' || cloudinaryConfigurado();
}

export function ehErroBillingFirebase(erro: unknown): boolean {
  const texto = String(erro);
  return (
    texto.includes('billing account') ||
    texto.includes('accountDisabled') ||
    texto.includes('The billing account for the owning project is disabled')
  );
}

export function mensagemErroStoragePt(erro: unknown): string {
  if (ehErroBillingFirebase(erro)) {
    return (
      '❌ Firebase Storage bloqueado — o Google exige cartão associado (plano Blaze), mesmo para uso grátis.\n' +
      '   Se não consegues associar cartão, usa Cloudinary (grátis, sem cartão):\n' +
      '   1. Cria conta em https://cloudinary.com/users/register_free\n' +
      '   2. No GitHub → Settings → Secrets, adiciona CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET\n' +
      '   3. Volta a disparar o workflow — o bot ignora o Firebase automaticamente.'
    );
  }
  return '❌ Falha ao gravar vídeo para o Buffer: ' + String(erro);
}

function montarUrlFirebaseDownload(bucketName: string, destino: string, token: string): string {
  return (
    'https://firebasestorage.googleapis.com/v0/b/' +
    bucketName +
    '/o/' +
    encodeURIComponent(destino) +
    '?alt=media&token=' +
    token
  );
}

async function lerTokensDownloadExistentes(
  bucket: { file: (path: string) => import('@google-cloud/storage').File },
  destino: string,
): Promise<string[]> {
  try {
    const file = bucket.file(destino);
    const [existe] = await file.exists();
    if (!existe) {
      return [];
    }
    const [metadata] = await file.getMetadata();
    const raw = metadata.metadata?.firebaseStorageDownloadTokens;
    if (!raw || typeof raw !== 'string') {
      return [];
    }
    return raw
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

/** Garante que o Buffer consegue descarregar o vídeo (GET com Range). */
export async function verificarUrlVideoAcessivel(url: string): Promise<void> {
  const resposta = await axios.get<ArrayBuffer>(url, {
    timeout: 60_000,
    responseType: 'arraybuffer',
    headers: { Range: 'bytes=0-65535' },
    maxContentLength: 1024 * 1024,
    validateStatus: (status) => status === 200 || status === 206,
  });

  const contentType = String(resposta.headers['content-type'] ?? '');
  if (
    !contentType.includes('video') &&
    !contentType.includes('octet-stream') &&
    !contentType.includes('application/mp4') &&
    !contentType.includes('text/plain')
  ) {
    throw new Error(
      'URL do vídeo não é acessível para o Buffer (Content-Type: ' + contentType + ')',
    );
  }

  if (!resposta.data || resposta.data.byteLength < 16) {
    throw new Error('URL do vídeo devolveu ficheiro demasiado pequeno para o Buffer');
  }
}

function assinarCloudinary(params: Record<string, string>, apiSecret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((chave) => chave + '=' + params[chave])
    .join('&');
  return crypto.createHash('sha1').update(sorted + apiSecret).digest('hex');
}

async function uploadCloudinaryArquivo(
  caminhoLocal: string,
  pasta: string,
  identificador: string,
  tipo: 'video' | 'raw',
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY!.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET!.trim();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const publicId = pasta + '/' + identificador;
  const params = {
    folder: 'sidusastro/' + pasta,
    public_id: identificador,
    timestamp,
  };
  const signature = assinarCloudinary(params, apiSecret);

  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(caminhoLocal)]), path.basename(caminhoLocal));
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp);
  form.append('signature', signature);
  form.append('folder', params.folder);
  form.append('public_id', params.public_id);

  console.log('☁️ A enviar vídeo para Cloudinary: ' + publicId);

  const resposta = await fetch(
    'https://api.cloudinary.com/v1_1/' + cloudName + '/' + tipo + '/upload',
    { method: 'POST', body: form },
  );

  const json = (await resposta.json()) as { secure_url?: string; error?: { message?: string } };
  if (!resposta.ok || !json.secure_url) {
    throw new Error(
      'Cloudinary: ' + (json.error?.message ?? 'upload falhou (HTTP ' + resposta.status + ')'),
    );
  }

  console.log('✅ URL Cloudinary para Buffer: ' + json.secure_url.slice(0, 80) + '...');
  await verificarUrlVideoAcessivel(json.secure_url);
  console.log('✅ URL Cloudinary verificada (GET com Range)');
  return json.secure_url;
}

async function uploadCloudinaryVideo(
  caminhoLocal: string,
  pasta: string,
  identificador: string,
): Promise<string> {
  return uploadCloudinaryArquivo(caminhoLocal, pasta, identificador, 'video');
}

function credenciaisCloudinary(): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  authHeader: string;
} {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY!.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET!.trim();
  const authHeader =
    'Basic ' + Buffer.from(apiKey + ':' + apiSecret).toString('base64');
  return { cloudName, apiKey, apiSecret, authHeader };
}

/** Dias a manter vídeos no Cloudinary (Buffer já descarregou). Default: 14. */
export function diasRetencaoCloudinary(): number {
  const raw = process.env.CLOUDINARY_RETENTION_DAYS?.trim();
  const dias = raw ? Number.parseInt(raw, 10) : 14;
  if (!Number.isFinite(dias) || dias < 1) {
    return 14;
  }
  return Math.min(dias, 90);
}

interface RecursoCloudinary {
  public_id: string;
  created_at: string;
  bytes?: number;
}

async function listarRecursosCloudinary(
  tipo: 'video' | 'raw',
  prefixo: string,
): Promise<RecursoCloudinary[]> {
  const { cloudName, authHeader } = credenciaisCloudinary();
  const recursos: RecursoCloudinary[] = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({
      type: 'upload',
      prefix: prefixo,
      max_results: '500',
    });
    if (cursor) {
      params.set('next_cursor', cursor);
    }

    const url =
      'https://api.cloudinary.com/v1_1/' +
      cloudName +
      '/resources/' +
      tipo +
      '?' +
      params.toString();

    const resposta = await axios.get<{
      resources?: RecursoCloudinary[];
      next_cursor?: string;
    }>(url, {
      headers: { Authorization: authHeader },
      timeout: 60_000,
    });

    recursos.push(...(resposta.data.resources ?? []));
    cursor = resposta.data.next_cursor;
  } while (cursor);

  return recursos;
}

async function apagarRecursosCloudinary(
  tipo: 'video' | 'raw',
  publicIds: string[],
): Promise<void> {
  if (publicIds.length === 0) {
    return;
  }

  const { cloudName, authHeader } = credenciaisCloudinary();
  const lote = 100;

  for (let i = 0; i < publicIds.length; i += lote) {
    const pedaco = publicIds.slice(i, i + lote);
    const body = new URLSearchParams();
    for (const id of pedaco) {
      body.append('public_ids[]', id);
    }

    const url =
      'https://api.cloudinary.com/v1_1/' +
      cloudName +
      '/resources/' +
      tipo +
      '/upload';

    await axios.delete(url, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: body.toString(),
      timeout: 60_000,
    });
  }
}

/**
 * Apaga vídeos e probes antigos no Cloudinary para não esgotar os 25 créditos grátis.
 * Chamado automaticamente antes de renderizar (verificarGravacaoStorage).
 */
export async function limparCloudinaryAntigos(): Promise<{
  apagados: number;
  megabytes: number;
}> {
  if (!cloudinaryConfigurado()) {
    return { apagados: 0, megabytes: 0 };
  }

  const diasVideos = diasRetencaoCloudinary();
  const limiteVideos = Date.now() - diasVideos * 24 * 60 * 60 * 1000;
  const limiteProbes = Date.now() - 24 * 60 * 60 * 1000;

  console.log(
    '\n🧹 Limpeza Cloudinary — vídeos > ' +
      diasVideos +
      ' dias, probes healthcheck > 1 dia...',
  );

  const [videos, raw] = await Promise.all([
    listarRecursosCloudinary('video', 'sidusastro/'),
    listarRecursosCloudinary('raw', 'sidusastro/healthcheck'),
  ]);

  const paraApagarVideo: string[] = [];
  const paraApagarRaw: string[] = [];
  let bytesTotal = 0;

  for (const item of videos) {
    const criado = Date.parse(item.created_at);
    if (Number.isFinite(criado) && criado < limiteVideos) {
      paraApagarVideo.push(item.public_id);
      bytesTotal += item.bytes ?? 0;
    }
  }

  for (const item of raw) {
    const criado = Date.parse(item.created_at);
    if (Number.isFinite(criado) && criado < limiteProbes) {
      paraApagarRaw.push(item.public_id);
      bytesTotal += item.bytes ?? 0;
    }
  }

  await apagarRecursosCloudinary('video', paraApagarVideo);
  await apagarRecursosCloudinary('raw', paraApagarRaw);

  const apagados = paraApagarVideo.length + paraApagarRaw.length;
  const megabytes = Math.round((bytesTotal / 1024 / 1024) * 10) / 10;

  if (apagados === 0) {
    console.log('✅ Cloudinary limpo — nada antigo para apagar.\n');
  } else {
    console.log(
      '✅ Cloudinary: ' +
        apagados +
        ' ficheiro(s) antigo(s) apagado(s) (~' +
        megabytes +
        ' MB libertados).\n',
    );
  }

  return { apagados, megabytes };
}

async function uploadFirebaseVideo(
  caminhoLocal: string,
  identificador: string,
  data: string,
  subpasta: string,
): Promise<string> {
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error('FIREBASE_STORAGE_BUCKET não definido no .env');
  }

  inicializarFirebase();

  const destino = subpasta + '/' + data + '/' + identificador + '.mp4';
  const novoToken = crypto.randomUUID();

  console.log('☁️ A enviar vídeo para Firebase Storage: ' + destino);

  const bucket = getStorage().bucket(bucketName);
  const tokensAntigos = await lerTokensDownloadExistentes(bucket, destino);
  const todosTokens = [...new Set([...tokensAntigos, novoToken])].join(',');

  if (tokensAntigos.length > 0) {
    console.log(
      '♻️ Ficheiro já existia — a preservar ' +
        tokensAntigos.length +
        ' token(s) de download para não invalidar posts Buffer antigos',
    );
  }

  await bucket.upload(caminhoLocal, {
    destination: destino,
    metadata: {
      contentType: 'video/mp4',
      cacheControl: 'public, max-age=31536000',
      metadata: {
        firebaseStorageDownloadTokens: todosTokens,
      },
    },
  });

  const file = bucket.file(destino);
  const urlDownload = await getDownloadURL(file);
  console.log('✅ URL Firebase para Buffer: ' + urlDownload.slice(0, 80) + '...');

  try {
    await verificarUrlVideoAcessivel(urlDownload);
    console.log('✅ URL verificada (GET com Range — acessível para Buffer/TikTok)');
  } catch {
    const urlLegada = montarUrlFirebaseDownload(bucketName, destino, novoToken);
    console.log('⚠️ getDownloadURL falhou verificação — a tentar URL com token novo...');
    await verificarUrlVideoAcessivel(urlLegada);
    console.log('✅ URL legada verificada (GET com Range)');
    return urlLegada;
  }

  return urlDownload;
}

/**
 * Envia vídeo com URL pública estável para o Buffer.
 * Com Cloudinary configurado: usa só Cloudinary (sem cartão Google).
 * Senão: Firebase.
 */
export async function uploadVideoPublico(
  caminhoLocal: string,
  identificador: string,
  data: string,
  subpasta = 'videos',
): Promise<string> {
  if (usarCloudinaryComoPrincipal()) {
    console.log('☁️ Storage: Cloudinary (sem Firebase / sem cartão Google)');
    return uploadCloudinaryVideo(caminhoLocal, subpasta + '/' + data, identificador);
  }

  try {
    return await uploadFirebaseVideo(caminhoLocal, identificador, data, subpasta);
  } catch (erro) {
    if (cloudinaryConfigurado()) {
      console.log('⚠️ Firebase falhou — a usar Cloudinary...');
      return uploadCloudinaryVideo(caminhoLocal, subpasta + '/' + data, identificador);
    }
    throw new Error(mensagemErroStoragePt(erro));
  }
}

/** Falha em segundos se Storage não estiver gravável — evita renderizar 5 min à toa. */
export async function verificarGravacaoStorage(): Promise<ProvedorStorage> {
  if (process.env.SKIP_STORAGE_CHECK === '1') {
    console.log('⏭️ SKIP_STORAGE_CHECK=1 — verificação de Storage ignorada.');
    return usarCloudinaryComoPrincipal() ? 'cloudinary' : 'firebase';
  }

  console.log('\n🔍 A verificar gravação de Storage (antes de renderizar vídeos)...');

  if (usarCloudinaryComoPrincipal() && process.env.SKIP_CLOUDINARY_CLEANUP !== '1') {
    try {
      await limparCloudinaryAntigos();
    } catch (erro) {
      console.warn(
        '⚠️ Limpeza Cloudinary falhou (não bloqueia geração): ' + String(erro),
      );
    }
  }

  const ficheiroProbe = path.join(os.tmpdir(), 'sidus-storage-probe-' + Date.now() + '.txt');
  fs.writeFileSync(ficheiroProbe, 'sidusastro-storage-probe');

  try {
    if (usarCloudinaryComoPrincipal()) {
      await uploadCloudinaryArquivo(ficheiroProbe, 'healthcheck', 'probe-' + Date.now(), 'raw');
      console.log('✅ Cloudinary OK — vídeos vão para o Buffer sem Firebase\n');
      return 'cloudinary';
    }

    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      throw new Error('FIREBASE_STORAGE_BUCKET não definido');
    }

    inicializarFirebase();
    const bucket = getStorage().bucket(bucketName);
    const destino = 'healthcheck/probe-' + Date.now() + '.txt';
    await bucket.upload(ficheiroProbe, {
      destination: destino,
      metadata: { contentType: 'text/plain' },
    });
    try {
      await bucket.file(destino).delete();
    } catch {
      /* ignorar limpeza */
    }
    console.log('✅ Firebase Storage OK — gravação disponível\n');
    return 'firebase';
  } catch (erro) {
    if (cloudinaryConfigurado() && !usarCloudinaryComoPrincipal()) {
      await uploadCloudinaryArquivo(ficheiroProbe, 'healthcheck', 'probe-' + Date.now(), 'raw');
      console.log('✅ Cloudinary OK — Firebase indisponível, fallback activo\n');
      return 'cloudinary';
    }
    throw new Error(mensagemErroStoragePt(erro));
  } finally {
    if (fs.existsSync(ficheiroProbe)) {
      fs.unlinkSync(ficheiroProbe);
    }
  }
}
