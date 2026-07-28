import crypto from 'crypto';
import axios from 'axios';
import { getDownloadURL, getStorage } from 'firebase-admin/storage';
import { inicializarFirebase } from './inicializar-app';
import { obterDueAtSlot, resolverDueAtFuturo, rotuloHorarioAgenda } from './buffer-agenda';
import { isLocaleUS, subpastaVideosFirebase } from './locale';
import { sanitizarTextoPublico } from './texto-publico';

interface BufferChannel {
  id: string;
  name: string;
  service: string;
}

const ORGANIZATIONS_QUERY = `
  query ListarOrganizacoes {
    account {
      organizations {
        id
        name
      }
    }
  }
`;

const CANAIS_QUERY = `
  query ListarCanais($organizationId: OrganizationId!) {
    channels(input: { organizationId: $organizationId }) {
      id
      name
      service
    }
  }
`;

const CREATE_POST_MUTATION = `
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      ... on PostActionSuccess {
        post { id text }
      }
      ... on MutationError {
        message
      }
    }
  }
`;

function obterAccessToken(): string {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  if (!token) {
    throw new Error('BUFFER_ACCESS_TOKEN em falta no .env');
  }
  return token;
}

async function dormir(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function chamarBuffer<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const maxTentativas = 3;
  let ultimoErro: unknown;

  for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
    try {
      const resposta = await axios.post(
        'https://api.buffer.com',
        { query, variables },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + obterAccessToken(),
          },
          timeout: 60_000,
        },
      );

      const erros = resposta.data?.errors;
      if (erros?.length) {
        throw new Error('Buffer GraphQL: ' + JSON.stringify(erros));
      }

      return resposta.data as T;
    } catch (erro) {
      ultimoErro = erro;
      if (tentativa < maxTentativas) {
        const esperaMs = tentativa * 3000;
        console.log(
          '⚠️ Buffer API falhou (tentativa ' +
            tentativa +
            '/' +
            maxTentativas +
            '). A repetir em ' +
            esperaMs / 1000 +
            's...',
        );
        await dormir(esperaMs);
      }
    }
  }

  throw ultimoErro;
}

export async function listarCanaisBuffer(): Promise<BufferChannel[]> {
  const orgPayload = await chamarBuffer<{
    data?: { account?: { organizations?: Array<{ id: string; name: string }> } };
  }>(ORGANIZATIONS_QUERY);

  const organizacoes = orgPayload.data?.account?.organizations ?? [];
  if (organizacoes.length === 0) {
    return [];
  }

  const organizationId =
    process.env.BUFFER_ORGANIZATION_ID ?? organizacoes[0].id;

  const payload = await chamarBuffer<{
    data?: { channels?: BufferChannel[] };
  }>(CANAIS_QUERY, { organizationId });

  return payload.data?.channels ?? [];
}

function normalizar(texto: string): string {
  return texto.toLowerCase().replace('@', '').trim();
}

export async function resolverCanaisPublicacao(): Promise<BufferChannel[]> {
  const canais = await listarCanaisBuffer();
  if (canais.length === 0) {
    throw new Error('Nenhum canal encontrado na conta Buffer.');
  }

  if (isLocaleUS()) {
    const tiktokUser = normalizar(process.env.BUFFER_TIKTOK_US_USERNAME ?? 'sidusastro_en');
    const instagramId = process.env.BUFFER_INSTAGRAM_US_CHANNEL_ID;

    const tiktok =
      canais.find((c) => c.id === process.env.BUFFER_TIKTOK_US_CHANNEL_ID) ??
      canais.find(
        (c) =>
          c.service.toLowerCase() === 'tiktok' &&
          (normalizar(c.name).includes(tiktokUser) || normalizar(c.name).includes('sidusastro_en')),
      ) ??
      canais.find((c) => c.service.toLowerCase() === 'tiktok' && normalizar(c.name).includes('en'));

    if (!tiktok) {
      throw new Error(
        'Canal TikTok US não encontrado. Define BUFFER_TIKTOK_US_CHANNEL_ID (sidusastro_en).',
      );
    }

    const instagram =
      instagramId != null && instagramId !== ''
        ? (canais.find((c) => c.id === instagramId) ??
          canais.find(
            (c) =>
              c.service.toLowerCase() === 'instagram' &&
              (normalizar(c.name).includes('en') || normalizar(c.name).includes('sidusastro')),
          ))
        : undefined;

    return instagram ? [instagram, tiktok] : [tiktok];
  }

  const instagramId = process.env.BUFFER_INSTAGRAM_CHANNEL_ID ?? '14967289874';
  const tiktokUser = normalizar(process.env.BUFFER_TIKTOK_USERNAME ?? 'sidusastro');

  const instagram =
    canais.find((c) => c.id === instagramId) ??
    canais.find((c) => c.service.toLowerCase() === 'instagram') ??
    canais.find((c) => normalizar(c.name).includes('instagram'));

  const tiktok =
    canais.find((c) => c.id === process.env.BUFFER_TIKTOK_CHANNEL_ID) ??
    canais.find(
      (c) =>
        c.service.toLowerCase() === 'tiktok' &&
        (normalizar(c.name).includes(tiktokUser) || normalizar(c.name).includes('sidusastro')),
    ) ??
    canais.find((c) => c.service.toLowerCase() === 'tiktok');

  const selecionados = [instagram, tiktok].filter(Boolean) as BufferChannel[];

  if (selecionados.length === 0) {
    const legacy = process.env.BUFFER_CHANNEL_ID;
    if (legacy) {
      const canal = canais.find((c) => c.id === legacy);
      if (canal) {
        return [canal];
      }
    }
    throw new Error(
      'Canais Instagram/TikTok não encontrados. Corre: npm run canais',
    );
  }

  return selecionados;
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

async function lerTokensDownloadExistentes(bucket: { file: (path: string) => import('@google-cloud/storage').File }, destino: string): Promise<string[]> {
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

/** Garante que o Buffer consegue descarregar o vídeo (GET com Range, como o TikTok). */
async function verificarUrlVideoAcessivel(url: string): Promise<void> {
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
    !contentType.includes('application/mp4')
  ) {
    throw new Error(
      'URL do vídeo não é acessível para o Buffer (Content-Type: ' + contentType + ')',
    );
  }

  if (!resposta.data || resposta.data.byteLength < 1024) {
    throw new Error('URL do vídeo devolveu ficheiro demasiado pequeno para o Buffer');
  }
}

/**
 * Envia vídeo para Firebase Storage com URL pública para o Buffer.
 * Preserva tokens antigos ao re-substituir o ficheiro — evita que posts já
 * agendados no Buffer fiquem com URL inválida após recuperação do workflow.
 */
export async function uploadVideoPublico(
  caminhoLocal: string,
  identificador: string,
  data: string,
  subpasta = 'videos',
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
  } catch (erroVerificacao) {
    const urlLegada = montarUrlFirebaseDownload(bucketName, destino, novoToken);
    console.log('⚠️ getDownloadURL falhou verificação — a tentar URL com token novo...');
    await verificarUrlVideoAcessivel(urlLegada);
    console.log('✅ URL legada verificada (GET com Range)');
    return urlLegada;
  }

  return urlDownload;
}

export async function publicarVideoNoCanal(
  canal: BufferChannel,
  legenda: string,
  videoUrl: string,
  opcoes?: { data?: string; indiceSlot?: number; dueAtCustom?: string },
): Promise<string> {
  const metadata: Record<string, unknown> = {};

  if (canal.service.toLowerCase() === 'instagram') {
    metadata.instagram = {
      type: 'reel',
      shouldShareToFeed: true,
    };
  }

  if (canal.service.toLowerCase() === 'tiktok') {
    metadata.tiktok = {
      isAiGenerated: false,
    };
  }

  const data = opcoes?.data;
  const indiceSlot = opcoes?.indiceSlot;
  const dueAtCustom = opcoes?.dueAtCustom;

  let mode: 'addToQueue' | 'customScheduled' = 'addToQueue';
  let dueAt: string | undefined;

  if (dueAtCustom) {
    dueAt = resolverDueAtFuturo(dueAtCustom);
  } else if (data !== undefined && indiceSlot !== undefined && indiceSlot >= 0) {
    dueAt = obterDueAtSlot(data, indiceSlot);
  }

  if (dueAt) {
    mode = 'customScheduled';
    console.log(
      '📅 Agendamento Buffer [' + canal.service + '] → ' + dueAt + ' (horário ' + rotuloHorarioAgenda() + ')',
    );
  } else if (dueAtCustom || (indiceSlot !== undefined && indiceSlot >= 0)) {
    console.log(
      '⚠️ Horário Buffer já passou hoje [' +
        canal.service +
        '] — a enfileirar na próxima vaga disponível (addToQueue).',
    );
  }

  const input: Record<string, unknown> = {
    text: legenda,
    channelId: canal.id,
    schedulingType: 'automatic',
    mode,
    metadata,
    assets: [{ video: { url: videoUrl } }],
  };

  if (dueAt) {
    input.dueAt = dueAt;
  }

  const payload = await chamarBuffer<{
    data?: {
      createPost?: { post?: { id?: string }; message?: string };
    };
  }>(CREATE_POST_MUTATION, { input });

  const resultado = payload.data?.createPost;
  if (resultado?.message) {
    throw new Error('Buffer [' + canal.service + ']: ' + resultado.message);
  }

  if (!resultado?.post?.id) {
    throw new Error(
      'Buffer [' + canal.service + ']: resposta inesperada — ' + JSON.stringify(payload.data),
    );
  }

  return resultado.post.id;
}

export async function publicarEmTodosOsCanais(
  identificador: string,
  caminhoVideo: string,
  data: string,
  obterLegenda: (service: string) => string,
  opcoes?: { indiceSlot?: number; subpasta?: string; dueAtCustom?: string },
): Promise<void> {
  if (!process.env.BUFFER_ACCESS_TOKEN) {
    console.log('⚠️ BUFFER_ACCESS_TOKEN em falta. Publicação ignorada.');
    return;
  }

  if (process.env.SKIP_PUBLICAR === '1') {
    console.log('⏭️ SKIP_PUBLICAR=1 — vídeo gerado localmente, sem enviar ao Buffer.');
    return;
  }

  const canais = await resolverCanaisPublicacao();
  console.log(
    '📱 Canais selecionados: ' +
      canais.map((c) => c.service + '=' + c.name + ' (ID:' + c.id + ')').join(' | '),
  );

  const videoUrl = await uploadVideoPublico(
    caminhoVideo,
    identificador,
    data,
    opcoes?.subpasta ?? subpastaVideosFirebase(),
  );

  for (const canal of canais) {
    const legenda = sanitizarTextoPublico(obterLegenda(canal.service));
    console.log('📱 A enfileirar em ' + canal.service + ' (' + canal.name + ')...');
    console.log('📋 Legenda [' + canal.service + ']:\n' + legenda);
    const postId = await publicarVideoNoCanal(canal, legenda, videoUrl, {
      data,
      indiceSlot: opcoes?.indiceSlot,
      dueAtCustom: opcoes?.dueAtCustom,
    });
    console.log('✅ Enfileirado no Buffer [' + canal.service + '] Post ID: ' + postId);
  }
}

export async function imprimirCanaisBuffer(): Promise<void> {
  const canais = await listarCanaisBuffer();
  if (canais.length === 0) {
    console.log('Nenhum canal encontrado.');
    return;
  }

  console.log('\nCanais Buffer disponíveis:\n');
  for (const canal of canais) {
    console.log('- ' + canal.service + ' | ' + canal.name + ' | ID: ' + canal.id);
  }
  console.log('\nUsa estes IDs no .env como BUFFER_INSTAGRAM_CHANNEL_ID / BUFFER_TIKTOK_CHANNEL_ID\n');
}
