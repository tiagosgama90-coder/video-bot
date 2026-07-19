/* eslint-disable @remotion/deterministic-randomness -- usado apenas no script Node */
import crypto from 'crypto';
import fs from 'fs';
import axios from 'axios';
import { carregarConfigProjeto } from './project-config';
import type { SignoZodiaco } from './signos';
import { NOMES_SIGNOS } from './signos';

const TEMAS_ZEN_ASTROLOGIA = [
  'peaceful zen meditation space zodiac wheel astrology chart soft golden candlelight',
  'calm night sky zodiac constellations horoscope map stars serene atmosphere',
  'minimalist astrology horoscope chart moon phases zen garden peaceful',
  'soft purple cosmic nebula zodiac symbols meditation calm spiritual',
  'zen japanese garden stone lantern zodiac wheel moon astrology tranquil',
  'astrology birth chart celestial map soft glow peaceful zen aesthetic',
  'horoscope wheel golden symbols starry sky calm meditation temple',
  'gentle aurora borealis zodiac constellation peaceful night zen mood',
  'crystal healing altar zodiac glyphs soft light astrology spiritual calm',
  'moon phases astrology chart candles zen sanctuary peaceful purple gold',
  'stargazing terrace zodiac map telescope calm night peaceful atmosphere',
  'mandala zodiac wheel soft bokeh stars meditation zen horoscope art',
];

const MODIFICADORES_ZEN = [
  'soft cinematic lighting peaceful composition',
  'minimalist zen aesthetic clean calm golden hour',
  'ethereal soft glow dreamy peaceful atmosphere',
  'watercolor soft pastel calm spiritual mood',
  'wide angle serene stars soft bokeh depth',
];

const PALETAS = [
  'deep indigo and gold',
  'lavender and rose gold',
  'midnight blue and silver',
  'soft purple and celestial white',
];

const SUFIXO_NEGATIVO =
  ', astrology horoscope zodiac theme, vertical portrait 9:16, no text, no watermark, no cars, no vehicles, no people, no modern city, calm spiritual masterpiece';

/** JPEG mínimo 1x1 (roxo escuro) — fallback local se todas as URLs falharem */
const JPEG_MINIMO_BASE64 =
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAEBAREA/8QAJgABAAAAAAAAAAAAAAAAAAAAAxABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAAPwCf/9k=';

const PROMPTS_FALLBACK_ASTROLOGIA = [
  'peaceful zen astrology zodiac horoscope night sky stars calm purple gold meditation',
  'zen horoscope wheel moon phases calm spiritual astrology chart',
  'cosmic nebula zodiac constellations meditation serene purple indigo gold',
  'astrology birth chart celestial map candles soft glow zen sanctuary',
  'mandala zodiac wheel soft bokeh stars meditation calm horoscope art',
];

function montarUrlPollinations(prompt: string, seed: number): string {
  return (
    'https://image.pollinations.ai/prompt/' +
    encodeURIComponent(prompt) +
    '?width=1080&height=1920&nologo=true&seed=' +
    seed +
    '&model=flux'
  );
}

function urlsPollinationsAstrologia(seed: number): string[] {
  return PROMPTS_FALLBACK_ASTROLOGIA.map((prompt, i) =>
    montarUrlPollinations(prompt, seed + i * 17),
  );
}

function urlsFallbackZen(seed: number): string[] {
  return urlsPollinationsAstrologia(seed + 2);
}

function urlsFallback(seed: number): string[] {
  return urlsPollinationsAstrologia(seed + 1);
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

function montarPromptZenAstrologia(): string {
  const cfg = carregarConfigProjeto().imagem;
  const tema = escolher(cfg.temas.length ? cfg.temas : TEMAS_ZEN_ASTROLOGIA);
  const modificador = escolher(cfg.modificadores.length ? cfg.modificadores : MODIFICADORES_ZEN);
  const paleta = escolher(cfg.paletas.length ? cfg.paletas : PALETAS);

  return (
    tema +
    ', ' +
    modificador +
    ', color palette ' +
    paleta +
    (cfg.sufixoPrompt || SUFIXO_NEGATIVO)
  );
}

function montarPrompt(signo: SignoZodiaco): string {
  const cfg = carregarConfigProjeto().imagem;
  const temas = cfg.temas.length ? cfg.temas : TEMAS_ZEN_ASTROLOGIA;
  const mods = cfg.modificadores.length ? cfg.modificadores : MODIFICADORES_ZEN;
  const pals = cfg.paletas.length ? cfg.paletas : PALETAS;
  const tema = escolher(temas);
  const modificador = escolher(mods);
  const paleta = escolher(pals);
  const nomeSigno = NOMES_SIGNOS[signo];

  return (
    tema +
    ', ' +
    modificador +
    ', color palette ' +
    paleta +
    ', zodiac sign ' +
    nomeSigno +
    (cfg.sufixoPrompt || SUFIXO_NEGATIVO)
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

/** Imagem IA única por execução — sempre zen + astrologia (sem fotos aleatórias) */
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

/** Fundo zen + astrologia + horóscopo — para vídeos especiais (afiliados, motivacional) */
export async function obterImagemFundoZenAstrologia(id: string, data: string): Promise<string> {
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public', { recursive: true });
  }

  const prompt = montarPromptZenAstrologia();
  const seed = gerarSeedUnico(id, data);
  const sufixo = crypto.randomBytes(4).toString('hex');
  const nomeFicheiro = 'fundo-zen-' + id + '-' + sufixo + '.jpg';
  const imagemLocal = './public/' + nomeFicheiro;
  const urlPollinations = montarUrlPollinations(prompt, seed);

  console.log('🎨 Prompt zen/astrologia [' + id + ']: ' + prompt.slice(0, 100) + '...');
  console.log('🎨 Seed único: ' + seed);

  const fontes = [urlPollinations, ...urlsFallbackZen(seed)];

  for (const url of fontes) {
    try {
      await descarregarFicheiro(url, imagemLocal);
      console.log('✅ Imagem zen guardada: ' + nomeFicheiro);
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
