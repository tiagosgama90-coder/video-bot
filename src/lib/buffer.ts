import axios from 'axios';
import { obterDueAtSlot, resolverDueAtFuturo, rotuloHorarioAgenda } from './buffer-agenda';
import { isLocaleUS, obterFusoPublicacao, subpastaVideosFirebase } from './locale';
import {
  criarMarcadorVideo,
  postCorrespondeAoVideo,
  type PostBufferParaDuplicado,
} from './anti-duplicado';
import { SIGNOS_ZODIACO, extrairSignoDaLegendaBuffer, type SignoZodiaco } from './signos';
import { uploadVideoPublico } from './storage-video';
import { sanitizarTextoPublico } from './texto-publico';

export { uploadVideoPublico } from './storage-video';

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

/** Limite do plano Buffer (posts com horário fixo por canal). */
const LIMITE_POSTS_AGENDADOS_BUFFER = 10;

const POSTS_AGENDADOS_QUERY = `
  query PostsAgendados($organizationId: OrganizationId!, $channelId: ChannelId!, $first: Int!, $after: String) {
    posts(
      first: $first
      after: $after
      input: {
        organizationId: $organizationId
        filter: {
          status: [scheduled]
          channelIds: [$channelId]
        }
        sort: [{ field: dueAt, direction: asc }]
      }
    ) {
      edges { node { id dueAt } }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const DELETE_POST_MUTATION = `
  mutation DeletePost($id: PostId!) {
    deletePost(input: { id: $id }) {
      ... on DeletePostSuccess { id }
      ... on MutationError { message }
    }
  }
`;

interface PostAgendado extends PostBufferParaDuplicado {
  id: string;
}

const POSTS_CANAL_QUERY_COM_ASSETS = `
  query PostsCanal($organizationId: OrganizationId!, $channelId: ChannelId!, $first: Int!, $after: String) {
    posts(
      first: $first
      after: $after
      input: {
        organizationId: $organizationId
        filter: {
          status: [scheduled, sent]
          channelIds: [$channelId]
        }
      }
    ) {
      edges {
        node {
          id
          dueAt
          text
          assets {
            ... on VideoAsset {
              url
            }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const POSTS_CANAL_QUERY = `
  query PostsCanal($organizationId: OrganizationId!, $channelId: ChannelId!, $first: Int!, $after: String) {
    posts(
      first: $first
      after: $after
      input: {
        organizationId: $organizationId
        filter: {
          status: [scheduled, sent]
          channelIds: [$channelId]
        }
      }
    ) {
      edges { node { id dueAt text } }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

let usarQueryPostsComAssets = true;

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

async function obterOrganizationId(): Promise<string> {
  const orgPayload = await chamarBuffer<{
    data?: { account?: { organizations?: Array<{ id: string; name: string }> } };
  }>(ORGANIZATIONS_QUERY);

  const organizacoes = orgPayload.data?.account?.organizations ?? [];
  if (organizacoes.length === 0) {
    throw new Error('Nenhuma organização Buffer encontrada.');
  }

  return process.env.BUFFER_ORGANIZATION_ID ?? organizacoes[0].id;
}

/** Conta posts agendados (customScheduled) num canal — limite Buffer = 10. */
export async function contarPostsAgendados(channelId: string): Promise<number> {
  const organizationId = await obterOrganizationId();
  let total = 0;
  let after: string | undefined;

  for (;;) {
    const payload = await chamarBuffer<{
      data?: {
        posts?: {
          edges?: Array<{ node?: { id: string } }>;
          pageInfo?: { hasNextPage?: boolean; endCursor?: string };
        };
      };
    }>(POSTS_AGENDADOS_QUERY, {
      organizationId,
      channelId,
      first: 50,
      after: after ?? null,
    });

    const posts = payload.data?.posts;
    total += posts?.edges?.length ?? 0;

    if (!posts?.pageInfo?.hasNextPage) {
      break;
    }
    after = posts.pageInfo.endCursor;
  }

  return total;
}

async function listarPostsAgendados(channelId: string): Promise<PostAgendado[]> {
  const organizationId = await obterOrganizationId();
  const posts: PostAgendado[] = [];
  let after: string | undefined;

  for (;;) {
    const payload = await chamarBuffer<{
      data?: {
        posts?: {
          edges?: Array<{ node?: PostAgendado }>;
          pageInfo?: { hasNextPage?: boolean; endCursor?: string };
        };
      };
    }>(POSTS_AGENDADOS_QUERY, {
      organizationId,
      channelId,
      first: 50,
      after: after ?? null,
    });

    const bloco = payload.data?.posts;
    for (const edge of bloco?.edges ?? []) {
      if (edge.node?.id) {
        posts.push(edge.node);
      }
    }

    if (!bloco?.pageInfo?.hasNextPage) {
      break;
    }
    after = bloco.pageInfo.endCursor;
  }

  return posts.sort((a, b) => {
    const ta = a.dueAt ? new Date(a.dueAt).getTime() : 0;
    const tb = b.dueAt ? new Date(b.dueAt).getTime() : 0;
    return ta - tb;
  });
}

function legendaPareceHoroscopoDiario(texto: string): boolean {
  const t = texto.toLowerCase();
  return (
    t.includes('#horoscope') ||
    t.includes('#horoscopo') ||
    t.includes('forecast ') ||
    t.includes('previsão') ||
    t.includes('previsao') ||
    t.includes('sidusastro')
  );
}

function postHoroscopoDeHoje(post: PostAgendado, data: string, fuso: string): boolean {
  if (!post.text || !legendaPareceHoroscopoDiario(post.text)) {
    return false;
  }
  if (!post.dueAt) {
    return true;
  }
  const dia = new Date(post.dueAt).toLocaleDateString('en-CA', { timeZone: fuso });
  return dia === data;
}

async function listarPostsCanal(channelId: string): Promise<PostAgendado[]> {
  const organizationId = await obterOrganizationId();
  const posts: PostAgendado[] = [];
  let after: string | undefined;
  const query = usarQueryPostsComAssets ? POSTS_CANAL_QUERY_COM_ASSETS : POSTS_CANAL_QUERY;

  for (;;) {
    let payload: {
      data?: {
        posts?: {
          edges?: Array<{ node?: PostAgendado & { assets?: Array<{ url?: string }> } }>;
          pageInfo?: { hasNextPage?: boolean; endCursor?: string };
        };
      };
    };

    try {
      payload = await chamarBuffer(query, {
        organizationId,
        channelId,
        first: 50,
        after: after ?? null,
      });
    } catch (erro) {
      const msg = erro instanceof Error ? erro.message : String(erro);
      if (usarQueryPostsComAssets && (msg.includes('assets') || msg.includes('VideoAsset'))) {
        console.log('⚠️ Buffer API sem campo assets — a usar query simplificada.');
        usarQueryPostsComAssets = false;
        return listarPostsCanal(channelId);
      }
      throw erro;
    }

    const bloco = payload.data?.posts;
    for (const edge of bloco?.edges ?? []) {
      const node = edge.node;
      if (!node?.id) {
        continue;
      }
      const videoUrls =
        usarQueryPostsComAssets && node.assets
          ? node.assets.map((a) => a.url).filter((u): u is string => Boolean(u))
          : [];
      posts.push({ id: node.id, dueAt: node.dueAt, text: node.text, videoUrls });
    }

    if (!bloco?.pageInfo?.hasNextPage) {
      break;
    }
    after = bloco.pageInfo.endCursor;
  }

  return posts;
}

/**
 * Verifica se o vídeo (identificador + data) já está no Buffer — todos os jobs.
 * Cobre horóscopo, VIP, afiliados e especiais. Respeita FORCE_PUBLICAR=1 para emergências.
 */
export async function videoJaPublicadoNoBuffer(identificador: string, data: string): Promise<boolean> {
  if (!process.env.BUFFER_ACCESS_TOKEN || process.env.SKIP_PUBLICAR === '1') {
    return false;
  }
  if (process.env.FORCE_PUBLICAR === '1') {
    console.log('⚠️ FORCE_PUBLICAR=1 — verificação de duplicados desactivada.');
    return false;
  }

  const fuso = obterFusoPublicacao();
  const canais = await resolverCanaisPublicacao();

  for (const canal of canais) {
    const posts = await listarPostsCanal(canal.id);
    for (const post of posts) {
      if (postCorrespondeAoVideo(post, identificador, data, fuso)) {
        console.log(
          '🔁 Duplicado detectado no Buffer [' +
            canal.service +
            '] — ' +
            identificador +
            ' (' +
            data +
            ')',
        );
        return true;
      }
    }
  }

  return false;
}

/** Signos com horóscopo diário já na fila Buffer hoje (evita republicar com Forçar). */
export async function obterSignosJaPublicadosHoje(data: string): Promise<SignoZodiaco[]> {
  if (!process.env.BUFFER_ACCESS_TOKEN || process.env.SKIP_PUBLICAR === '1') {
    return [];
  }

  const fuso = obterFusoPublicacao();
  const canais = await resolverCanaisPublicacao();
  const encontrados = new Set<SignoZodiaco>();

  for (const canal of canais) {
    const posts = await listarPostsCanal(canal.id);
    for (const post of posts) {
      if (!postHoroscopoDeHoje(post, data, fuso)) {
        continue;
      }
      const signo = extrairSignoDaLegendaBuffer(post.text ?? '');
      if (signo) {
        encontrados.add(signo);
      }
    }
  }

  return [...encontrados];
}

/**
 * Data da última publicação de cada signo no Buffer (0 = nunca ou há muito tempo).
 * Usado para rodar pelos 12 signos — prioriza os que saíram há mais tempo.
 */
export async function obterUltimaPublicacaoPorSigno(): Promise<Map<SignoZodiaco, number>> {
  const ultima = new Map<SignoZodiaco, number>();
  for (const signo of SIGNOS_ZODIACO) {
    ultima.set(signo, 0);
  }

  if (!process.env.BUFFER_ACCESS_TOKEN || process.env.SKIP_PUBLICAR === '1') {
    return ultima;
  }

  const canais = await resolverCanaisPublicacao();

  for (const canal of canais) {
    const posts = await listarPostsCanal(canal.id);
    for (const post of posts) {
      if (!post.text || !legendaPareceHoroscopoDiario(post.text)) {
        continue;
      }
      const signo = extrairSignoDaLegendaBuffer(post.text);
      if (!signo) {
        continue;
      }
      const quando = post.dueAt ? new Date(post.dueAt).getTime() : Date.now();
      const atual = ultima.get(signo) ?? 0;
      if (quando > atual) {
        ultima.set(signo, quando);
      }
    }
  }

  return ultima;
}

async function apagarPostBuffer(postId: string): Promise<void> {
  const payload = await chamarBuffer<{
    data?: {
      deletePost?: { id?: string; message?: string };
    };
  }>(DELETE_POST_MUTATION, { id: postId });

  const resultado = payload.data?.deletePost;
  if (resultado?.message) {
    throw new Error('Buffer deletePost: ' + resultado.message);
  }
}

/** Remove os posts agendados mais antigos para libertar espaço (limite Buffer = 10). */
export async function liberarEspacoBufferSeNecessario(
  channelId: string,
  vagasNecessarias: number,
): Promise<number> {
  if (vagasNecessarias <= 0) {
    return 0;
  }

  let agendados = await contarPostsAgendados(channelId);
  const livres = LIMITE_POSTS_AGENDADOS_BUFFER - agendados;
  if (livres >= vagasNecessarias) {
    return 0;
  }

  const aApagar = vagasNecessarias - livres;
  const posts = await listarPostsAgendados(channelId);
  let apagados = 0;

  for (const post of posts.slice(0, aApagar)) {
    await apagarPostBuffer(post.id);
    apagados++;
    console.log(
      '🗑️ Buffer: removido post agendado antigo' +
        (post.dueAt ? ' (' + post.dueAt + ')' : '') +
        ' — ' +
        apagados +
        '/' +
        aApagar,
    );
  }

  return apagados;
}

/** Verifica fila Buffer antes de renderizar — evita 30+ min de CI à toa. */
export async function verificarCapacidadeBuffer(vagasNecessarias = 3): Promise<void> {
  if (!process.env.BUFFER_ACCESS_TOKEN || process.env.SKIP_PUBLICAR === '1') {
    return;
  }

  const canais = await resolverCanaisPublicacao();
  for (const canal of canais) {
    const apagados = await liberarEspacoBufferSeNecessario(canal.id, vagasNecessarias);
    if (apagados > 0) {
      console.log(
        '♻️ Buffer [' + canal.service + ']: ' + apagados + ' post(s) antigo(s) removido(s) para libertar espaço.',
      );
    }

    const agendados = await contarPostsAgendados(canal.id);
    console.log(
      '📊 Buffer [' + canal.service + ' / ' + canal.name + ']: ' + agendados + '/' + LIMITE_POSTS_AGENDADOS_BUFFER + ' posts agendados',
    );
    if (agendados + vagasNecessarias > LIMITE_POSTS_AGENDADOS_BUFFER) {
      console.log(
        '⚠️ Ainda perto do limite — novos vídeos podem ir para addToQueue se necessário.',
      );
    }
  }
}

function erroLimiteAgendados(message: string | undefined): boolean {
  return (message ?? '').toLowerCase().includes('scheduled posts limit reached');
}

async function criarPostBuffer(input: Record<string, unknown>, etiqueta: string): Promise<string> {
  const payload = await chamarBuffer<{
    data?: {
      createPost?: { post?: { id?: string }; message?: string };
    };
  }>(CREATE_POST_MUTATION, { input });

  const resultado = payload.data?.createPost;
  if (resultado?.message) {
    throw new Error('Buffer [' + etiqueta + ']: ' + resultado.message);
  }

  if (!resultado?.post?.id) {
    throw new Error(
      'Buffer: resposta inesperada — ' + JSON.stringify(payload.data),
    );
  }

  return resultado.post.id;
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
  let filaPorLimiteBuffer = false;

  if (dueAtCustom) {
    dueAt = resolverDueAtFuturo(dueAtCustom);
  } else if (data !== undefined && indiceSlot !== undefined && indiceSlot >= 0) {
    dueAt = obterDueAtSlot(data, indiceSlot);
  }

  if (dueAt) {
    mode = 'customScheduled';
    try {
      await liberarEspacoBufferSeNecessario(canal.id, 1);
      const agendados = await contarPostsAgendados(canal.id);
      if (agendados >= LIMITE_POSTS_AGENDADOS_BUFFER) {
        console.log(
          '⚠️ Buffer [' +
            canal.service +
            ']: ' +
            agendados +
            '/' +
            LIMITE_POSTS_AGENDADOS_BUFFER +
            ' agendados — a usar addToQueue (sem horário fixo).',
        );
        dueAt = undefined;
        mode = 'addToQueue';
        filaPorLimiteBuffer = true;
      }
    } catch (erro) {
      console.log('⚠️ Não foi possível verificar fila Buffer — a tentar agendamento normal.');
    }
  }

  if (dueAt) {
    console.log(
      '📅 Agendamento Buffer [' + canal.service + '] → ' + dueAt + ' (horário ' + rotuloHorarioAgenda() + ')',
    );
  } else if (
    !filaPorLimiteBuffer &&
    (dueAtCustom || (indiceSlot !== undefined && indiceSlot >= 0))
  ) {
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

  try {
    return await criarPostBuffer(input, canal.service);
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);
    if (!dueAt || !erroLimiteAgendados(mensagem)) {
      throw erro;
    }

    console.log(
      '⚠️ Buffer [' +
        canal.service +
        ']: limite de agendados — a repetir com addToQueue (sem horário fixo).',
    );
    const inputFila: Record<string, unknown> = { ...input, mode: 'addToQueue' };
    delete inputFila.dueAt;
    return await criarPostBuffer(inputFila, canal.service);
  }
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

  if (await videoJaPublicadoNoBuffer(identificador, data)) {
    console.log(
      '⏭️ Vídeo já publicado no Buffer — republicação bloqueada (' + identificador + ', ' + data + ').',
    );
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

  const marcador = criarMarcadorVideo(identificador, data);

  for (const canal of canais) {
    const legenda = sanitizarTextoPublico(obterLegenda(canal.service) + marcador);
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
