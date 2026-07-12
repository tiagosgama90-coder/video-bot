import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';
import dotenv from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import {
  montarLegendaBuffer,
  publicarEmTodosOsCanais,
} from './src/lib/buffer';
import { obterTextoHoroscopo } from './src/lib/horoscopo';
import { gerarNarracaoPtPt } from './src/lib/voz';
import type { TipoMusica } from './src/types/horoscopo';

dotenv.config();

const serviceAccount = require('./firebase-admin.json');

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

function escolherSignosAleatoriosDoDia(): (typeof SIGNOS_ZODIACO)[number][] {
  const pool = [...SIGNOS_ZODIACO];
  const quantidade = Math.random() < 0.5 ? 2 : 3;
  const escolhidos: (typeof SIGNOS_ZODIACO)[number][] = [];

  for (let i = 0; i < quantidade; i++) {
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
      console.log('⚠️ Falha ao descarregar música ' + tipo + '.');
      console.log(String(erro));
    }
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

  await gerarNarracaoPtPt(previsao, './public/narracao.mp3');

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
    const caminhoOutput = path.resolve('./output/' + signo + '-diario.mp4');
    await publicarEmTodosOsCanais(signo, caminhoOutput, data, (s) =>
      montarLegendaBuffer(s, NOMES_SIGNOS),
    );
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

  const signosDoDia = escolherSignosAleatoriosDoDia();
  console.log(
    '🎲 Signos escolhidos hoje (' + signosDoDia.length + '): ' +
      signosDoDia.map((s) => NOMES_SIGNOS[s]).join(', '),
  );

  const data = obterDataHoje();

  for (const signo of signosDoDia) {
    await processarSigno(signo, data);
  }

  console.log('\n🏁 Automação concluída — vídeos publicados em Instagram + TikTok!');
}

executarRoboSidusAstro().catch((erro) => {
  console.error('❌ Erro fatal na automação:', erro);
  process.exit(1);
});
