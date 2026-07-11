import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';
import dotenv from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import say from 'say';
import type { TipoMusica } from './src/types/horoscopo';

dotenv.config();

const serviceAccount = require('./firebase-admin.json');

const VOZ_PT_PT = 'Microsoft Helia';
const VELOCIDADE_NARRACAO = 0.85;

const SIGNOS_ZODIACO = [
  'carneiro',
  'touro',
  'gemeos',
  'caranguejo',
  'leao',
  'virgem',
  'balanca',
  'escorpiao',
  'sagitario',
  'capricornio',
  'aquario',
  'peixes',
] as const;

const NOMES_SIGNOS: Record<(typeof SIGNOS_ZODIACO)[number], string> = {
  carneiro: 'Carneiro',
  touro: 'Touro',
  gemeos: 'Gémeos',
  caranguejo: 'Caranguejo',
  leao: 'Leão',
  virgem: 'Virgem',
  balanca: 'Balança',
  escorpiao: 'Escorpião',
  sagitario: 'Sagitário',
  capricornio: 'Capricórnio',
  aquario: 'Aquário',
  peixes: 'Peixes',
};

const TIPOS_MUSICA: TipoMusica[] = ['zen', 'celta', 'meditacao'];

const TEMAS_MISTICOS = [
  'mystical cantic wizard room with candles and crystal ball',
  'fortune teller crystal ball tarot cards esoteric neon',
  'ancient astrology wheel zodiac gold purple mystical',
  'cosmic nebula galaxy esoteric symbols meditation zen',
  'wizard spell books glowing potions alchemy dark room',
  'mystic seer reading stars celestial map candles',
];

const IMAGEM_FALLBACK_WIKI =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/NGC_604.jpg/1080px-NGC_604.jpg';

const MUSICAS_DOWNLOAD: Record<TipoMusica, { ficheiro: string; url: string }> = {
  zen: {
    ficheiro: './public/musica-zen.mp3',
    url: 'https://assets.mixkit.co/music/preview/mixkit-spiritual-369.mp3',
  },
  celta: {
    ficheiro: './public/musica-celta.mp3',
    url: 'https://assets.mixkit.co/music/preview/mixkit-harp-celebration-627.mp3',
  },
  meditacao: {
    ficheiro: './public/musica-meditacao.mp3',
    url: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
  },
};

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const db = getFirestore();

interface DadosHoroscopoFirestore {
  pack?: {
    horoscopes?: {
      pt?: Record<string, string>;
    };
  };
}

interface PropsVideo {
  signo: string;
  previsao: string;
  imagemFundoUrl: string;
  tipoMusica: TipoMusica;
}

function garantirPasta(pasta: string): void {
  if (!fs.existsSync(pasta)) {
    fs.mkdirSync(pasta, { recursive: true });
  }
}

function escolherTresSignosAleatorios(): (typeof SIGNOS_ZODIACO)[number][] {
  const pool = [...SIGNOS_ZODIACO];
  const escolhidos: (typeof SIGNOS_ZODIACO)[number][] = [];

  for (let i = 0; i < 3; i++) {
    const indice = Math.floor(Math.random() * pool.length);
    escolhidos.push(pool.splice(indice, 1)[0]);
  }

  return escolhidos;
}

function escolherTipoMusica(): TipoMusica {
  return TIPOS_MUSICA[Math.floor(Math.random() * TIPOS_MUSICA.length)];
}

function obterDataHoje(): string {
  return new Date().toISOString().split('T')[0];
}

function montarUrlPollinations(tema: string, seed: number): string {
  return (
    'https://image.pollinations.ai/prompt/' +
    encodeURIComponent(tema) +
    '?width=1080&height=1920&nologo=true&seed=' +
    seed
  );
}

function montarLegendaBuffer(signo: string): string {
  const nomeSigno = NOMES_SIGNOS[signo as (typeof SIGNOS_ZODIACO)[number]] ?? signo;
  return (
    'Previsão astrológica diária para o signo de ' +
    nomeSigno +
    '! ✨ 🔗 Visite o nosso site para ver o seu mapa completo: sidusastro.com ' +
    '#astrologia #horoscopo #sidusastro #signos #mapaastral #meditacao #zen'
  );
}

function gerarNarracao(texto: string, destino: string): Promise<void> {
  return new Promise((resolve, reject) => {
    say.export(texto, VOZ_PT_PT, VELOCIDADE_NARRACAO, destino, (err) => {
      if (err) {
        reject(new Error(String(err)));
        return;
      }
      resolve();
    });
  });
}

async function descarregarFicheiro(url: string, destino: string): Promise<void> {
  const resposta = await axios.get<ArrayBuffer>(url, {
    responseType: 'arraybuffer',
    timeout: 120_000,
    headers: { 'User-Agent': 'SidusAstro-VideoBot/1.0' },
  });
  fs.writeFileSync(destino, Buffer.from(resposta.data));
}

async function garantirMusicasAmbiente(): Promise<void> {
  garantirPasta('./public');

  for (const tipo of TIPOS_MUSICA) {
    const { ficheiro, url } = MUSICAS_DOWNLOAD[tipo];
    if (fs.existsSync(ficheiro)) {
      continue;
    }

    try {
      console.log('🎵 A descarregar música ' + tipo + '...');
      await descarregarFicheiro(url, ficheiro);
      console.log('✅ Música ' + tipo + ' pronta.');
    } catch (erro) {
      console.log('⚠️ Falha ao descarregar música ' + tipo + '. A usar fallback local.');
      console.log(String(erro));
      if (fs.existsSync('./public/narracao.mp3')) {
        fs.copyFileSync('./public/narracao.mp3', ficheiro);
      }
    }
  }
}

async function obterTextoHoroscopo(signo: string, data: string): Promise<string> {
  const fallback = 'Os astros guiam o seu caminho hoje no SidusAstro.';

  try {
    const snapshot = await db.collection('siteDaily').doc(data).get();

    if (!snapshot.exists) {
      console.log('⚠️ Documento ' + data + ' não encontrado. A usar fallback.');
      return fallback;
    }

    const dados = snapshot.data() as DadosHoroscopoFirestore | undefined;
    return dados?.pack?.horoscopes?.pt?.[signo] ?? fallback;
  } catch (erro) {
    console.log('⚠️ Erro Firestore para ' + signo + '. A usar fallback.');
    console.log(String(erro));
    return fallback;
  }
}

async function obterImagemFundo(tema: string, seed: number): Promise<string> {
  const imagemLocal = './public/fundo-ia.jpg';
  const urlPollinations = montarUrlPollinations(tema, seed);

  console.log('🎨 URL Pollinations: ' + urlPollinations);

  try {
    await descarregarFicheiro(urlPollinations, imagemLocal);
    console.log('✅ Imagem IA guardada localmente.');
    return 'fundo-ia.jpg';
  } catch (erroPoll) {
    console.log('⚠️ Pollinations indisponível. A tentar Wikipedia...');
    console.log(String(erroPoll));
  }

  try {
    await descarregarFicheiro(IMAGEM_FALLBACK_WIKI, imagemLocal);
    return 'fundo-ia.jpg';
  } catch {
    return IMAGEM_FALLBACK_WIKI;
  }
}

function renderizarVideo(signo: string): void {
  const outputPath = './output/' + signo + '-diario.mp4';
  const comando =
    'npx remotion render src/index.ts HoroscopoComposition "' +
    outputPath +
    '" --props="./public/props-temporarias.json"';

  console.log('🚀 A renderizar: ' + outputPath);
  execSync(comando, { stdio: 'inherit', cwd: process.cwd() });
  console.log('✨ Vídeo concluído: ' + outputPath);
}

async function uploadVideoPublico(caminhoLocal: string, signo: string): Promise<string> {
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;

  if (!bucketName) {
    throw new Error('FIREBASE_STORAGE_BUCKET não definido no .env');
  }

  const bucket = getStorage().bucket(bucketName);
  const data = obterDataHoje();
  const destino = 'videos/' + data + '/' + signo + '-diario.mp4';

  await bucket.upload(caminhoLocal, {
    destination: destino,
    metadata: { contentType: 'video/mp4', cacheControl: 'public, max-age=31536000' },
  });

  await bucket.file(destino).makePublic();

  return 'https://storage.googleapis.com/' + bucket.name + '/' + destino;
}

async function publicarNoBuffer(signo: string, caminhoVideo: string): Promise<void> {
  const accessToken = process.env.BUFFER_ACCESS_TOKEN;
  const channelId = process.env.BUFFER_CHANNEL_ID;

  if (!accessToken || !channelId) {
    console.log('⚠️ BUFFER_ACCESS_TOKEN ou BUFFER_CHANNEL_ID em falta. Publicação ignorada.');
    return;
  }

  const legenda = montarLegendaBuffer(signo);
  const videoUrl = await uploadVideoPublico(caminhoVideo, signo);

  console.log('📤 A publicar no Buffer: ' + videoUrl);

  const mutation = `
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

  const resposta = await axios.post(
    'https://api.buffer.com',
    {
      query: mutation,
      variables: {
        input: {
          text: legenda,
          channelId,
          schedulingType: 'automatic',
          mode: 'addToQueue',
          assets: [{ video: { url: videoUrl } }],
        },
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken,
      },
      timeout: 60_000,
    },
  );

  const erros = resposta.data?.errors;
  if (erros?.length) {
    throw new Error('Buffer GraphQL: ' + JSON.stringify(erros));
  }

  const resultado = resposta.data?.data?.createPost;
  if (resultado?.message) {
    throw new Error('Buffer: ' + resultado.message);
  }

  console.log('✅ Publicado no Buffer. Post ID: ' + (resultado?.post?.id ?? 'ok'));
}

async function processarSigno(signo: (typeof SIGNOS_ZODIACO)[number], data: string): Promise<void> {
  console.log('\n══════════════════════════════════════');
  console.log('🔮 A processar signo: ' + NOMES_SIGNOS[signo]);
  console.log('══════════════════════════════════════\n');

  const previsao = await obterTextoHoroscopo(signo, data);
  console.log('📝 Previsão: "' + previsao + '"');

  const tema = TEMAS_MISTICOS[Math.floor(Math.random() * TEMAS_MISTICOS.length)];
  const seed = Math.floor(Math.random() * 100_000);
  const imagemFundoUrl = await obterImagemFundo(tema, seed);
  const tipoMusica = escolherTipoMusica();

  console.log('🗣️ A gerar narração com voz ' + VOZ_PT_PT + ' (speed ' + VELOCIDADE_NARRACAO + ')...');
  const audioPath = path.resolve('./public/narracao.mp3');
  await gerarNarracao(previsao, audioPath);
  console.log('🎵 Narração gravada em ./public/narracao.mp3');

  const props: PropsVideo = {
    signo: NOMES_SIGNOS[signo],
    previsao,
    imagemFundoUrl,
    tipoMusica,
  };

  const caminhoProps = './public/props-temporarias.json';
  fs.writeFileSync(caminhoProps, JSON.stringify(props, null, 2));

  try {
    renderizarVideo(signo);
    const caminhoOutput = './output/' + signo + '-diario.mp4';
    await publicarNoBuffer(signo, caminhoOutput);
  } finally {
    if (fs.existsSync(caminhoProps)) {
      fs.unlinkSync(caminhoProps);
    }
  }
}

async function executarRoboSidusAstro(): Promise<void> {
  console.log('🌌 SidusAstro Video Bot — automação diária iniciada');
  console.log('📅 Data: ' + obterDataHoje());

  garantirPasta('./public');
  garantirPasta('./output');
  await garantirMusicasAmbiente();

  const signosDoDia = escolherTresSignosAleatorios();
  console.log(
    '🎲 Signos escolhidos hoje: ' + signosDoDia.map((s) => NOMES_SIGNOS[s]).join(', '),
  );

  const data = obterDataHoje();

  for (const signo of signosDoDia) {
    await processarSigno(signo, data);
  }

  console.log('\n🏁 Automação concluída com sucesso para os 3 signos do dia!');
}

executarRoboSidusAstro().catch((erro) => {
  console.error('❌ Erro fatal na automação:', erro);
  process.exit(1);
});
