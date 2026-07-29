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
      '❌ Firebase Storage indisponível: a faturação do projeto Google Cloud está desativada.\n' +
      '   → Abre https://console.cloud.google.com/billing e reativa a faturação do projeto sidus-app.\n' +
      '   → Alternativa: adiciona secrets CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET no GitHub.'
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
 * Firebase primeiro; Cloudinary como fallback se billing estiver desativado.
 */
export async function uploadVideoPublico(
  caminhoLocal: string,
  identificador: string,
  data: string,
  subpasta = 'videos',
): Promise<string> {
  try {
    return await uploadFirebaseVideo(caminhoLocal, identificador, data, subpasta);
  } catch (erro) {
    if (cloudinaryConfigurado() && (ehErroBillingFirebase(erro) || process.env.STORAGE_PROVIDER === 'cloudinary')) {
      console.log('⚠️ Firebase indisponível — a usar Cloudinary como fallback...');
      return uploadCloudinaryVideo(caminhoLocal, subpasta + '/' + data, identificador);
    }
    throw new Error(mensagemErroStoragePt(erro));
  }
}

/** Falha em segundos se Storage não estiver gravável — evita renderizar 5 min à toa. */
export async function verificarGravacaoStorage(): Promise<ProvedorStorage> {
  if (process.env.SKIP_STORAGE_CHECK === '1') {
    console.log('⏭️ SKIP_STORAGE_CHECK=1 — verificação de Storage ignorada.');
    return cloudinaryConfigurado() ? 'cloudinary' : 'firebase';
  }

  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error('FIREBASE_STORAGE_BUCKET não definido');
  }

  console.log('\n🔍 A verificar gravação de Storage (antes de renderizar vídeos)...');

  const ficheiroProbe = path.join(os.tmpdir(), 'sidus-storage-probe-' + Date.now() + '.txt');
  fs.writeFileSync(ficheiroProbe, 'sidusastro-storage-probe');

  try {
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
    if (cloudinaryConfigurado()) {
      await uploadCloudinaryArquivo(ficheiroProbe, 'healthcheck', 'probe-' + Date.now(), 'raw');
      console.log('✅ Cloudinary OK — Firebase sem billing, fallback activo\n');
      return 'cloudinary';
    }
    throw new Error(mensagemErroStoragePt(erro));
  } finally {
    if (fs.existsSync(ficheiroProbe)) {
      fs.unlinkSync(ficheiroProbe);
    }
  }
}
