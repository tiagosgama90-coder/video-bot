import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';
import dotenv from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { publicarEmTodosOsCanais } from './src/lib/buffer';
import { obterTextoHoroscopo } from './src/lib/horoscopo';
import { escolherFechoNarracao, gerarLegenda } from './src/lib/legenda';
import { prepararMusicaParaVideo } from './src/lib/musicas';
import {
  escolherSignosDoDia,
  NOMES_SIGNOS,
  obterDataLisboa,
  type SignoZodiaco,
} from './src/lib/signos';
import { gerarNarracaoPtPt } from './src/lib/voz';
dotenv.config();

const serviceAccount = require('./firebase-admin.json');

const TEMAS_MISTICOS = [
  'zen meditation room zodiac wheel astrology symbols candles purple gold',
  'mystical wizard fortune teller crystal ball tarot esoteric dark',
  'ancient astrology chart horoscope symbols celestial map stars',
  'cosmic nebula galaxy zodiac constellations meditation zen atmosphere',
  'vidente tarot cards oracle mystical smoke candles astrology',
  'magician alchemist spell books glowing potions zodiac symbols',
  'temple of stars esoteric astrology wheel zen peaceful night',
  'mystic seer reading horoscope chart crystal ball candles',
  'astrology observatory zodiac gold symbols cosmic energy zen',
  'fortune teller neon mystical tarot astrology purple ambiance',
  'wizard tower star map horoscope symbols meditation zen fantasy',
  'esoteric sanctuary zodiac mandala candles astrology spiritual',
];

const IMAGEM_FALLBACK_WIKI =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/NGC_604.jpg/1080px-NGC_604.jpg';

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
  musicaFundoArquivo: string;
}

function garantirPasta(pasta: string): void {
  if (!fs.existsSync(pasta)) {
    fs.mkdirSync(pasta, { recursive: true });
  }
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

async function obterImagemFundo(signo: SignoZodiaco, data: string): Promise<string> {
  const indiceTema = Math.floor(Math.random() * TEMAS_MISTICOS.length);
  const tema = TEMAS_MISTICOS[indiceTema];
  const seed =
    Math.floor(Math.random() * 999_999) +
    data.split('-').join('').charCodeAt(0) +
    signo.charCodeAt(0);

  const nomeFicheiro = 'fundo-' + signo + '.jpg';
  const imagemLocal = './public/' + nomeFicheiro;
  const urlPollinations = montarUrlPollinations(tema, seed);

  console.log('🎨 Tema IA [' + signo + ']: ' + tema);
  console.log('🎨 URL: ' + urlPollinations);

  try {
    await descarregarFicheiro(urlPollinations, imagemLocal);
    console.log('✅ Imagem única guardada: ' + nomeFicheiro);
    return nomeFicheiro;
  } catch (erroPoll) {
    console.log('⚠️ Pollinations indisponível. A tentar Wikipedia...');
    console.log(String(erroPoll));
  }

  try {
    await descarregarFicheiro(IMAGEM_FALLBACK_WIKI, imagemLocal);
    return nomeFicheiro;
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

async function processarSigno(signo: SignoZodiaco, data: string): Promise<void> {
  console.log('\n══════════════════════════════════════');
  console.log('🔮 A processar signo: ' + NOMES_SIGNOS[signo]);
  console.log('══════════════════════════════════════\n');

  const previsao = await obterTextoHoroscopo(signo, data);
  console.log('📝 Previsão: "' + previsao.slice(0, 120) + '..."');

  const imagemFundoUrl = await obterImagemFundo(signo, data);
  const musicaFundoArquivo = await prepararMusicaParaVideo(signo, data);

  const fechoNarracao = escolherFechoNarracao();
  const textoNarracao = previsao + fechoNarracao;
  console.log('🎙️ Fecho narração:' + fechoNarracao);
  await gerarNarracaoPtPt(textoNarracao, './public/narracao.mp3');

  const legenda = gerarLegenda(signo);
  console.log('📋 Legenda:\n' + legenda);

  const props: PropsVideo = {
    signo: NOMES_SIGNOS[signo],
    previsao,
    imagemFundoUrl,
    musicaFundoArquivo,
  };

  const caminhoProps = './public/props-temporarias.json';
  fs.writeFileSync(caminhoProps, JSON.stringify(props, null, 2));

  try {
    renderizarVideo(signo);
    const caminhoOutput = path.resolve('./output/' + signo + '-diario.mp4');
    await publicarEmTodosOsCanais(signo, caminhoOutput, data, () => legenda);
  } finally {
    if (fs.existsSync(caminhoProps)) {
      fs.unlinkSync(caminhoProps);
    }
  }
}

async function executarRoboSidusAstro(): Promise<void> {
  const data = obterDataLisboa();
  console.log('🌌 SidusAstro Video Bot — automação diária iniciada');
  console.log('📅 Data (Lisboa): ' + data);

  garantirPasta('./public');
  garantirPasta('./output');
  const signosDoDia = escolherSignosDoDia(data);
  console.log(
    '🎲 Signos do dia (' +
      signosDoDia.length +
      '): ' +
      signosDoDia.map((s) => NOMES_SIGNOS[s]).join(', '),
  );

  for (const signo of signosDoDia) {
    await processarSigno(signo, data);
  }

  console.log('\n🏁 Automação concluída — vídeos publicados em Instagram + TikTok!');
}

executarRoboSidusAstro().catch((erro) => {
  console.error('❌ Erro fatal na automação:', erro);
  process.exit(1);
});
