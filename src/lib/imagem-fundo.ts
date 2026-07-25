/* eslint-disable @remotion/deterministic-randomness -- usado apenas no script Node */
import crypto from 'crypto';
import fs from 'fs';
import axios from 'axios';
import { carregarConfigProjeto } from './project-config';
import {
  MODIFICADORES_IMAGEM_BRUTAL,
  PALETAS_60_30_10,
  PROMPTS_FALLBACK_BRUTAL,
  SUFIXO_PROMPT_IMAGEM,
  TEMAS_IMAGEM_BRUTAL,
} from './imagem-prompts';
import type { SignoZodiaco } from './signos';
import { NOMES_SIGNOS } from './signos';

/** JPEG mínimo 1x1 (roxo escuro #08060e) — fallback local */
const JPEG_MINIMO_BASE64 =
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAEBAREA/8QAJgABAAAAAAAAAAAAAAAAAAAAAxABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAAPwCf/9k=';

function montarUrlPollinations(prompt: string, seed: number): string {
  return (
    'https://image.pollinations.ai/prompt/' +
    encodeURIComponent(prompt) +
    '?width=1080&height=1920&nologo=true&seed=' +
    seed +
    '&model=flux'
  );
}

function urlsFallback(seed: number): string[] {
  return PROMPTS_FALLBACK_BRUTAL.map((prompt, i) =>
    montarUrlPollinations(prompt, seed + i * 19),
  );
}

function escolher<T>(lista: readonly T[]): T {
  return lista[crypto.randomInt(0, lista.length)];
}

function gerarSeedUnico(chave: string, data: string): number {
  const bytes = crypto.randomBytes(4);
  const aleatorio = bytes.readUInt32BE(0);
  let hash = aleatorio;
  const mistura = data + chave + Date.now() + process.hrtime.bigint().toString();
  for (let i = 0; i < mistura.length; i++) {
    hash = (hash * 31 + mistura.charCodeAt(i)) >>> 0;
  }
  return hash % 9_999_999;
}

function obterListasPrompt() {
  const cfg = carregarConfigProjeto().imagem;
  return {
    temas: cfg.temas.length ? cfg.temas : [...TEMAS_IMAGEM_BRUTAL],
    modificadores: cfg.modificadores.length ? cfg.modificadores : [...MODIFICADORES_IMAGEM_BRUTAL],
    paletas: cfg.paletas.length ? cfg.paletas : [...PALETAS_60_30_10],
    sufixo: cfg.sufixoPrompt || SUFIXO_PROMPT_IMAGEM,
  };
}

function montarPromptBase(extraSigno?: string): string {
  const { temas, modificadores, paletas, sufixo } = obterListasPrompt();
  const tema = escolher(temas);
  const modificador = escolher(modificadores);
  const paleta = escolher(paletas);

  return (
    tema +
    ', ' +
    modificador +
    ', color palette ' +
    paleta +
    (extraSigno ? ', zodiac sign ' + extraSigno : '') +
    sufixo
  );
}

function montarPromptZenAstrologia(): string {
  return montarPromptBase();
}

function montarPrompt(signo: SignoZodiaco): string {
  return montarPromptBase(NOMES_SIGNOS[signo]);
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

  console.log('🎨 Prompt IA [' + signo + ']: ' + prompt.slice(0, 120) + '...');
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

/** Fundo zen brutal + astrologia — motivacional, VIP, afiliados */
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

  console.log('🎨 Prompt zen brutal [' + id + ']: ' + prompt.slice(0, 120) + '...');
  console.log('🎨 Seed único: ' + seed);

  const fontes = [urlPollinations, ...urlsFallback(seed + 3)];

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
