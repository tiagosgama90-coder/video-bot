/* eslint-disable @remotion/deterministic-randomness -- usado apenas no script Node */
import crypto from 'crypto';
import fs from 'fs';
import { execSync } from 'child_process';
import axios from 'axios';
import { carregarConfigProjeto } from './project-config';
import {
  escolherModoPaletaImagem,
  MODIFICADORES_COLOR,
  MODIFICADORES_MONO,
  PALETAS_COLOR,
  PALETAS_MONOCROMATICAS,
  PROMPTS_FALLBACK_COLOR,
  PROMPTS_FALLBACK_MONO,
  SUFIXO_PROMPT_COLOR,
  SUFIXO_PROMPT_MONO,
  TEMAS_COLOR,
  TEMAS_MONOCROMATICOS,
  type ModoPaletaImagem,
} from './imagem-prompts';
import type { SignoZodiaco } from './signos';
import { NOMES_SIGNOS } from './signos';

export type { ModoPaletaImagem } from './imagem-prompts';
export { escolherModoPaletaImagem } from './imagem-prompts';

export interface ImagemFundoGerada {
  ficheiro: string;
  modo: ModoPaletaImagem;
}

/** Dimensões nativas do reel Instagram/TikTok (9:16) */
export const REEL_LARGURA = 1080;
export const REEL_ALTURA = 1920;
const RATIO_REEL = REEL_LARGURA / REEL_ALTURA;

/** JPEG mínimo 1x1 (roxo escuro #08060e) — fallback local */
const JPEG_MINIMO_BASE64 =
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAEBAREA/8QAJgABAAAAAAAAAAAAAAAAAAAAAxABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAAPwCf/9k=';

function lerDimensoesJpeg(dados: Buffer): { width: number; height: number } | null {
  if (dados.length < 4 || dados[0] !== 0xff || dados[1] !== 0xd8) {
    return null;
  }

  let i = 2;
  while (i < dados.length - 9) {
    if (dados[i] !== 0xff) {
      i++;
      continue;
    }
    const marcador = dados[i + 1];
    if (marcador === 0xc0 || marcador === 0xc2 || marcador === 0xc1) {
      const altura = dados.readUInt16BE(i + 5);
      const largura = dados.readUInt16BE(i + 7);
      if (largura > 0 && altura > 0) {
        return { width: largura, height: altura };
      }
      return null;
    }
    const segmento = dados.readUInt16BE(i + 2);
    if (segmento < 2) {
      return null;
    }
    i += 2 + segmento;
  }
  return null;
}

export function validarRatioReel(largura: number, altura: number): boolean {
  const ratio = largura / altura;
  return Math.abs(ratio - RATIO_REEL) < 0.012;
}

export function validarImagemReel(largura: number, altura: number): boolean {
  const ratioOk = validarRatioReel(largura, altura);
  const tamanhoMinimo = largura >= 360 && altura >= 640;
  return ratioOk && tamanhoMinimo;
}

export function normalizarImagemReel(destino: string): void {
  const dados = fs.readFileSync(destino);
  const dimensoes = lerDimensoesJpeg(dados);
  if (!dimensoes) {
    return;
  }

  if (dimensoes.width < 360 || dimensoes.height < 640) {
    throw new Error('Imagem demasiado pequena para reel: ' + dimensoes.width + '×' + dimensoes.height);
  }

  const tmp = destino + '.reel.jpg';
  const filtro =
    'scale=' +
    REEL_LARGURA +
    ':' +
    REEL_ALTURA +
    ':force_original_aspect_ratio=increase,crop=' +
    REEL_LARGURA +
    ':' +
    REEL_ALTURA;
  execSync(
    'ffmpeg -y -i "' +
      destino.replace(/"/g, '\\"') +
      '" -vf "' +
      filtro +
      '" -q:v 2 "' +
      tmp.replace(/"/g, '\\"') +
      '"',
    { stdio: 'pipe' },
  );
  fs.renameSync(tmp, destino);
  console.log(
    '📐 Imagem recortada para reel (sem esticar): ' +
      dimensoes.width +
      '×' +
      dimensoes.height +
      ' → ' +
      REEL_LARGURA +
      '×' +
      REEL_ALTURA,
  );
}

function montarUrlPollinations(prompt: string, seed: number): string {
  return (
    'https://image.pollinations.ai/prompt/' +
    encodeURIComponent(prompt) +
    '?width=' +
    REEL_LARGURA +
    '&height=' +
    REEL_ALTURA +
    '&nologo=true&seed=' +
    seed +
    '&model=flux'
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

function obterListasPromptPorModo(modo: ModoPaletaImagem) {
  if (modo === 'mono') {
    return {
      temas: TEMAS_MONOCROMATICOS,
      modificadores: MODIFICADORES_MONO,
      paletas: PALETAS_MONOCROMATICAS,
      sufixo: SUFIXO_PROMPT_MONO,
      fallbacks: PROMPTS_FALLBACK_MONO,
    };
  }

  const cfg = carregarConfigProjeto().imagem;
  return {
    temas: (cfg.temas.length ? cfg.temas : TEMAS_COLOR) as readonly string[],
    modificadores: (cfg.modificadores.length ? cfg.modificadores : MODIFICADORES_COLOR) as readonly string[],
    paletas: (cfg.paletas.length ? cfg.paletas : PALETAS_COLOR) as readonly string[],
    sufixo: cfg.sufixoPrompt || SUFIXO_PROMPT_COLOR,
    fallbacks: PROMPTS_FALLBACK_COLOR,
  };
}

function montarPrompt(chave: string, data: string, extraSigno?: string): { prompt: string; modo: ModoPaletaImagem } {
  const modo = escolherModoPaletaImagem(chave, data);
  const { temas, modificadores, paletas, sufixo } = obterListasPromptPorModo(modo);
  const tema = escolher(temas);
  const modificador = escolher(modificadores);
  const paleta = escolher(paletas);

  const prompt =
    tema +
    ', ' +
    modificador +
    ', color palette ' +
    paleta +
    (extraSigno ? ', zodiac sign ' + extraSigno : '') +
    sufixo;

  return { prompt, modo };
}

function urlsFallback(modo: ModoPaletaImagem, seed: number): string[] {
  const fallbacks = obterListasPromptPorModo(modo).fallbacks;
  return fallbacks.map((prompt, i) => montarUrlPollinations(prompt, seed + i * 19));
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

  const dimensoes = lerDimensoesJpeg(dados);
  if (!dimensoes) {
    throw new Error('Não foi possível ler dimensões JPEG');
  }
  fs.writeFileSync(destino, dados);
  normalizarImagemReel(destino);
  const finais = lerDimensoesJpeg(fs.readFileSync(destino));
  console.log(
    '📐 Imagem reel validada: ' +
      (finais ? finais.width + '×' + finais.height : dimensoes.width + '×' + dimensoes.height),
  );
}

function escreverJpegMinimo(destino: string): void {
  fs.writeFileSync(destino, Buffer.from(JPEG_MINIMO_BASE64, 'base64'));
}

async function gerarImagemFundo(
  chave: string,
  data: string,
  prefixoFicheiro: string,
  extraSigno?: string,
): Promise<ImagemFundoGerada> {
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public', { recursive: true });
  }

  const { prompt, modo } = montarPrompt(chave, data, extraSigno);
  const seed = gerarSeedUnico(chave, data);
  const sufixo = crypto.randomBytes(4).toString('hex');
  const nomeFicheiro = prefixoFicheiro + '-' + sufixo + '.jpg';
  const imagemLocal = './public/' + nomeFicheiro;
  const urlPollinations = montarUrlPollinations(prompt, seed);

  const etiquetaModo = modo === 'mono' ? 'monocromático' : 'colorido';
  console.log('🎨 Prompt IA [' + chave + '] (' + etiquetaModo + '): ' + prompt.slice(0, 120) + '...');
  console.log('🎨 Seed único: ' + seed);

  const fontes = [urlPollinations, ...urlsFallback(modo, seed)];

  for (const url of fontes) {
    try {
      await descarregarFicheiro(url, imagemLocal);
      console.log('✅ Imagem guardada (' + etiquetaModo + '): ' + nomeFicheiro);
      return { ficheiro: nomeFicheiro, modo };
    } catch (erro) {
      console.log('⚠️ Fonte indisponível: ' + url.slice(0, 80) + '...');
      console.log(String(erro));
    }
  }

  console.log('⚠️ Todas as fontes falharam — a usar JPEG local mínimo.');
  escreverJpegMinimo(imagemLocal);
  return { ficheiro: nomeFicheiro, modo };
}

export async function obterImagemFundo(signo: SignoZodiaco, data: string): Promise<ImagemFundoGerada> {
  return gerarImagemFundo(signo, data, 'fundo-' + signo, NOMES_SIGNOS[signo]);
}

export async function obterImagemFundoZenAstrologia(id: string, data: string): Promise<ImagemFundoGerada> {
  return gerarImagemFundo(id, data, 'fundo-zen-' + id);
}
