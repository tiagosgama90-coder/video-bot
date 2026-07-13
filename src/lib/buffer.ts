import axios from 'axios';
import { getStorage } from 'firebase-admin/storage';

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

async function chamarBuffer<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
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

export async function uploadVideoPublico(
  caminhoLocal: string,
  signo: string,
  data: string,
): Promise<string> {
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error('FIREBASE_STORAGE_BUCKET não definido no .env');
  }

  const bucket = getStorage().bucket(bucketName);
  const destino = 'videos/' + data + '/' + signo + '-diario.mp4';

  await bucket.upload(caminhoLocal, {
    destination: destino,
    metadata: { contentType: 'video/mp4', cacheControl: 'public, max-age=31536000' },
  });

  await bucket.file(destino).makePublic();

  return 'https://storage.googleapis.com/' + bucket.name + '/' + destino;
}

export async function publicarVideoNoCanal(
  channelId: string,
  legenda: string,
  videoUrl: string,
): Promise<string> {
  const payload = await chamarBuffer<{
    data?: {
      createPost?: { post?: { id?: string }; message?: string };
    };
  }>(CREATE_POST_MUTATION, {
    input: {
      text: legenda,
      channelId,
      schedulingType: 'automatic',
      mode: 'addToQueue',
      assets: [{ video: { url: videoUrl } }],
    },
  });

  const resultado = payload.data?.createPost;
  if (resultado?.message) {
    throw new Error('Buffer: ' + resultado.message);
  }

  return resultado?.post?.id ?? 'ok';
}

export async function publicarEmTodosOsCanais(
  signo: string,
  caminhoVideo: string,
  data: string,
  obterLegenda: () => string,
): Promise<void> {
  if (!process.env.BUFFER_ACCESS_TOKEN) {
    console.log('⚠️ BUFFER_ACCESS_TOKEN em falta. Publicação ignorada.');
    return;
  }

  const canais = await resolverCanaisPublicacao();
  const legenda = obterLegenda();
  const videoUrl = await uploadVideoPublico(caminhoVideo, signo, data);

  console.log('📤 Vídeo público: ' + videoUrl);

  for (const canal of canais) {
    console.log('📱 A publicar em ' + canal.service + ' (' + canal.name + ')...');
    const postId = await publicarVideoNoCanal(canal.id, legenda, videoUrl);
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
