/* eslint-disable @remotion/deterministic-randomness -- usado apenas no script Node */
import crypto from 'crypto';
import fs from 'fs';
import axios from 'axios';
import type { SignoZodiaco } from './signos';
import { NOMES_SIGNOS } from './signos';

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
  'shaman stargazing ritual zodiac fire smoke night sky',
  'enchanted library astrology scrolls quill moonlight mystical',
  'crystal cave zodiac glyphs glowing amethyst zen meditation',
  'oracle priestess moon phase chart tarot spread candles',
  'astrology clock tower midnight stars zodiac bronze gears',
  'desert mystic oasis palm stars zodiac sand meditation',
  'underwater zen temple zodiac bioluminescent jellyfish calm',
  'northern lights aurora zodiac constellation snow peaceful',
  'japanese zen garden zodiac stone lantern moon astrology',
  'gothic cathedral stained glass zodiac planets mystical light',
  'sage burning ritual zodiac circle chalk stars incense',
  'celestial goddess zodiac belt stars flowing robes cosmic',
];

const MODIFICADORES_VISUAIS = [
  'cinematic lighting volumetric fog unique composition',
  'soft watercolor dreamlike pastel unique art style',
  'hyper detailed digital painting dramatic shadows',
  'minimalist zen aesthetic clean lines golden hour',
  'dark moody purple and gold palette mystical',
  'ethereal glow particles floating magical realism',
  'oil painting texture rich colors renaissance style',
  'neon cyber mysticism holographic zodiac symbols',
  'film grain vintage astrology poster unique layout',
  'wide angle epic scale stars bokeh depth of field',
];

const PALETAS = [
  'deep indigo and gold',
  'emerald green and silver',
  'crimson and midnight blue',
  'lavender and rose gold',
  'teal and copper',
  'black and celestial white',
];

/** JPEG mínimo 1x1 (roxo escuro) — fallback local se todas as URLs falharem */
const JPEG_MINIMO_BASE64 =
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAEBAREA/8QAJgABAAAAAAAAAAAAAAAAAAAAAxABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAAPwCf/9k=';

function urlsFallback(seed: number): string[] {
  return [
    'https://picsum.photos/seed/sidusastro-' + seed + '/1080/1920',
    'https://image.pollinations.ai/prompt/dark%20purple%20cosmic%20nebula%20stars?width=1080&height=1920&nologo=true&seed=' +
      (seed + 1),
  ];
}

function escolher<T>(lista: T[]): T {
  return lista[crypto.randomInt(0, lista.length)];
}

function gerarSeedUnico(signo: string, data: string): number {
  const bytes = crypto.randomBytes(4);
  const aleatorio = bytes.readUInt32BE(0);
  let hash = aleatorio;
  const mistura = data + signo + Date.now() + process.hrtime.bigint().toString();
  for (let i = 0; i < mistura.length; i++) {
    hash = (hash * 31 + mistura.charCodeAt(i)) >>> 0;
  }
  return hash % 9_999_999;
}

function montarPrompt(signo: SignoZodiaco): string {
  const tema = escolher(TEMAS_MISTICOS);
  const modificador = escolher(MODIFICADORES_VISUAIS);
  const paleta = escolher(PALETAS);
  const nomeSigno = NOMES_SIGNOS[signo];

  return (
    tema +
    ', ' +
    modificador +
    ', color palette ' +
    paleta +
    ', zodiac sign ' +
    nomeSigno +
    ', vertical portrait 9:16, no text, no watermark, unique masterpiece'
  );
}

function montarUrlPollinations(prompt: string, seed: number): string {
  return (
    'https://image.pollinations.ai/prompt/' +
    encodeURIComponent(prompt) +
    '?width=1080&height=1920&nologo=true&seed=' +
    seed +
    '&model=flux'
  );
}

async function descarregarFicheiro(url: string, destino: string): Promise<void> {
  const resposta = await axios.get<ArrayBuffer>(url, {
    responseType: 'arraybuffer',
    timeout: 120_000,
    maxRedirects: 5,
    headers: { 'User-Agent': 'SidusAstro-VideoBot/1.0' },
    validateStatus: (status) => status >= 200 && status < 300,
  });
  const dados = Buffer.from(resposta.data);
  if (dados.length < 1000) {
    throw new Error('Resposta demasiado pequena (' + dados.length + ' bytes)');
  }
  fs.writeFileSync(destino, dados);
}

function escreverJpegMinimo(destino: string): void {
  fs.writeFileSync(destino, Buffer.from(JPEG_MINIMO_BASE64, 'base64'));
}

/** Imagem IA única por execução — tema, estilo, paleta e seed nunca repetidos de forma previsível */
export async function obterImagemFundo(signo: SignoZodiaco, data: string): Promise<string> {
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public', { recursive: true });
  }

  const prompt = montarPrompt(signo);
  const seed = gerarSeedUnico(signo, data);
  const sufixo = crypto.randomBytes(4).toString('hex');
  const nomeFicheiro = 'fundo-' + signo + '-' + sufixo + '.jpg';
  const imagemLocal = './public/' + nomeFicheiro;
  const urlPollinations = montarUrlPollinations(prompt, seed);

  console.log('🎨 Prompt IA [' + signo + ']: ' + prompt.slice(0, 100) + '...');
  console.log('🎨 Seed único: ' + seed);

  const fontes = [urlPollinations, ...urlsFallback(seed)];

  for (const url of fontes) {
    try {
      await descarregarFicheiro(url, imagemLocal);
      console.log('✅ Imagem única guardada: ' + nomeFicheiro);
      return nomeFicheiro;
    } catch (erro) {
      console.log('⚠️ Fonte indisponível: ' + url.slice(0, 80) + '...');
      console.log(String(erro));
    }
  }

  console.log('⚠️ Todas as fontes falharam — a usar JPEG local mínimo.');
  escreverJpegMinimo(imagemLocal);
  return nomeFicheiro;
}
