/* eslint-disable @remotion/deterministic-randomness -- usado apenas no script Node, não no render Remotion */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';
import {
  carregarConfigProjeto,
  obterFontesMusica,
  resolverFonteMusica,
} from './project-config';

const ESTADO_ROTACAO = path.resolve('./config/musica-rotacao.json');

/** Slots fixos por tipo de vídeo — garantem faixas diferentes no mesmo dia (PT/US têm ordens distintas). */
export const SLOT_MUSICA = {
  /** Horóscopo diário: slots 0–4 (ver gerar-e-publicar.ts) */
  HOROSCOPO_0: 0,
  HOROSCOPO_1: 1,
  HOROSCOPO_2: 2,
  HOROSCOPO_3: 6,
  HOROSCOPO_4: 7,
  /** Segunda-feira motivacional */
  MOTIVACIONAL_SEGUNDA: 3,
  /** Quarta-feira VIP por divulgação */
  VIP_DIVULGACAO_QUARTA: 4,
  /** Sexta-feira VIP por divulgação */
  VIP_DIVULGACAO_SEXTA: 8,
  /** Domingo VIP por divulgação */
  VIP_DIVULGACAO_DOMINGO: 9,
  /** Quinta-feira motivacional */
  MOTIVACIONAL_QUINTA: 5,
  /** Terça e sábado — afiliados de manhã */
  AFILIADOS_MANHA: 10,
} as const;

/** Pool único: horóscopo diário, motivacional, VIP — PT-PT e en-US */
function obterPoolMusica(): string[] {
  const fontes = obterFontesMusica();
  if (fontes.length > 0) {
    return fontes;
  }
  return carregarConfigProjeto().musica.entradas.map((e) => e.fonte);
}

function caminhoPublico(nomeFicheiro: string): string {
  return path.resolve('./public/' + nomeFicheiro);
}

function fonteEhLocal(fonte: string): boolean {
  return !fonte.startsWith('http://') && !fonte.startsWith('https://');
}

function hashString(texto: string): number {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function baralharComSeed<T>(lista: T[], seed: number): T[] {
  const copia = [...lista];
  let estado = seed || 1;

  for (let i = copia.length - 1; i > 0; i--) {
    estado = (estado * 1664525 + 1013904223) >>> 0;
    const j = estado % (i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }

  return copia;
}

/** Ordem baralhada das faixas — muda todos os dias e entre PT/US */
function ordemMusicasDoDia(data: string, poolSize: number): number[] {
  const locale = process.env.LOCALE === 'en-US' ? 'us' : 'pt';
  const seed = hashString(`sidusastro-musica-v2-${data}-${locale}`);
  return baralharComSeed(
    Array.from({ length: poolSize }, (_, i) => i),
    seed,
  );
}

/** Contador persistente para execuções locais no mesmo dia */
function reservarSlotDoDia(data: string): number {
  const locale = process.env.LOCALE === 'en-US' ? 'us' : 'pt';
  let estado = { data: '', locale: '', slot: 0 };

  if (fs.existsSync(ESTADO_ROTACAO)) {
    try {
      estado = JSON.parse(fs.readFileSync(ESTADO_ROTACAO, 'utf8'));
    } catch {
      /* ficheiro corrompido — recomeça */
    }
  }

  if (estado.data !== data || estado.locale !== locale) {
    estado = { data, locale, slot: 0 };
  }

  const atual = estado.slot;
  estado.slot = atual + 1;

  fs.mkdirSync(path.dirname(ESTADO_ROTACAO), { recursive: true });
  fs.writeFileSync(ESTADO_ROTACAO, JSON.stringify(estado, null, 2));

  return atual;
}

/**
 * Escolhe índice no pool: rotação diária + slot único por vídeo.
 * Com ~38 faixas e 3 vídeos/dia, os 3 slots usam sempre músicas diferentes.
 */
export function escolherIndiceMusica(
  poolSize: number,
  data: string,
  slotNoDia?: number,
): number {
  if (poolSize <= 0) {
    return 0;
  }
  const ordem = ordemMusicasDoDia(data, poolSize);
  const slot =
    slotNoDia !== undefined ? slotNoDia : reservarSlotDoDia(data);
  return ordem[slot % poolSize];
}

async function dormir(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function obterMusicaDeFonte(fonte: string, destino: string): Promise<void> {
  if (fonteEhLocal(fonte)) {
    const origem = resolverFonteMusica(fonte);
    if (!fs.existsSync(origem)) {
      throw new Error('Ficheiro local não encontrado: ' + origem);
    }
    fs.copyFileSync(origem, destino);
    return;
  }

  const maxTentativas = 3;
  let ultimoErro: unknown;

  for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
    try {
      const resposta = await axios.get<ArrayBuffer>(fonte, {
        responseType: 'arraybuffer',
        timeout: 90_000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SidusAstro/1.0',
          Accept: 'audio/mpeg,audio/*,*/*',
        },
        maxRedirects: 5,
      });

      if (resposta.data.byteLength < 10_000) {
        throw new Error('Ficheiro de áudio demasiado pequeno');
      }

      fs.writeFileSync(destino, Buffer.from(resposta.data));
      return;
    } catch (erro) {
      ultimoErro = erro;
      if (tentativa < maxTentativas) {
        const esperaMs = tentativa * 2000;
        console.log(
          '⚠️ Download música falhou (tentativa ' +
            tentativa +
            '/' +
            maxTentativas +
            ') — a repetir em ' +
            esperaMs / 1000 +
            's...',
        );
        await dormir(esperaMs);
      }
    }
  }

  throw ultimoErro;
}

/** Remove silêncio inicial — muitas faixas ambient começam em mute */
function prepararMusicaZen(destino: string): void {
  const destinoWin = destino.replace(/\//g, path.sep);
  const temp = destino.replace(/\.mp3$/i, '') + '-trim.mp3';
  const tempWin = temp.replace(/\//g, path.sep);

  execSync(
    'ffmpeg -y -i "' +
      destinoWin +
      '" -af "silenceremove=start_periods=1:start_duration=0.1:start_threshold=-40dB,afade=t=in:st=0:d=1.5" -ar 44100 -ac 2 -b:a 192k "' +
      tempWin +
      '"',
    { stdio: 'ignore' },
  );
  fs.renameSync(temp, destino);
}

function gerarMusicaOffline(destino: string, indice: number): void {
  const frequencias = [174, 285, 396, 417, 432, 528, 639, 741];
  const freq = frequencias[indice % frequencias.length];
  const harmonia = Math.round(freq * 1.5);
  const destinoWin = destino.replace(/\//g, path.sep);

  execSync(
    'ffmpeg -y -f lavfi -i "sine=frequency=' +
      freq +
      ':duration=50" -f lavfi -i "sine=frequency=' +
      harmonia +
      ':duration=50" -filter_complex "[0:a][1:a]amix=inputs=2:duration=first,volume=0.04,afade=t=in:st=0:d=3,afade=t=out:st=47:d=3" -ar 44100 -ac 2 -b:a 128k "' +
      destinoWin +
      '"',
    { stdio: 'ignore' },
  );
}

export async function prepararMusicaParaVideo(
  signo: string,
  data: string,
  slotNoDia?: number,
): Promise<string> {
  return prepararMusicaEspecial(signo, data, 'zen', slotNoDia);
}

export async function prepararMusicaEspecial(
  id: string,
  data: string,
  tipo: 'zen' | 'mistico' | 'viral' | 'aleatoria' = 'zen',
  slotNoDia?: number,
): Promise<string> {
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public', { recursive: true });
  }

  const pool = obterPoolMusica();
  const etiqueta =
    tipo === 'viral'
      ? 'zen-viral'
      : tipo === 'mistico'
        ? 'zen-místico'
        : tipo === 'aleatoria'
          ? 'zen'
          : 'zen';

  if (pool.length === 0) {
    throw new Error('Pool de músicas vazio — edita config/sidusastro.json');
  }

  const slot =
    slotNoDia ??
    hashString(`sidusastro-slot-${data}-${id}-${process.env.LOCALE ?? 'pt'}`) %
      10_000;

  const indice = escolherIndiceMusica(pool.length, data, slot);
  const nomeFicheiro = 'musica-' + id + '.mp3';
  const destino = caminhoPublico(nomeFicheiro);
  const fontes = [
    pool[indice],
    pool[(indice + 1) % pool.length],
    pool[(indice + 2) % pool.length],
  ];

  const etiquetaFinal =
    etiqueta +
    ' [faixa ' +
    (indice + 1) +
    '/' +
    pool.length +
    ', slot ' +
    slot +
    ', ' +
    data +
    ']';
  console.log('🎵 Música ' + etiquetaFinal + ' para ' + id);

  for (const fonte of fontes) {
    try {
      await obterMusicaDeFonte(fonte, destino);
      prepararMusicaZen(destino);
      console.log('✅ Música guardada: ' + nomeFicheiro);
      return nomeFicheiro;
    } catch (erro) {
      console.log('⚠️ Fonte música falhou: ' + fonte);
      console.log(String(erro));
    }
  }

  try {
    console.log('🎵 A gerar música ambiente offline (FFmpeg)...');
    gerarMusicaOffline(destino, indice);
    return nomeFicheiro;
  } catch (erro) {
    console.log('⚠️ FFmpeg indisponível: ' + String(erro));
    throw new Error('Não foi possível preparar música para ' + id);
  }
}
