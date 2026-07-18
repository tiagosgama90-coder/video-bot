/* eslint-disable @remotion/deterministic-randomness -- usado apenas no script Node, não no render Remotion */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';
import {
  carregarConfigProjeto,
  obterFontesMusica,
  resolverFonteMusica,
} from './project-config';

/** Pool único: diário, viral, motivacional, afiliados — PT-PT e en-US */
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

async function obterMusicaDeFonte(fonte: string, destino: string): Promise<void> {
  if (fonteEhLocal(fonte)) {
    const origem = resolverFonteMusica(fonte);
    if (!fs.existsSync(origem)) {
      throw new Error('Ficheiro local não encontrado: ' + origem);
    }
    fs.copyFileSync(origem, destino);
    return;
  }

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

function escolherIndice(pool: string[], signo: string, data: string): number {
  const bytes = crypto.randomBytes(4);
  let hash = bytes.readUInt32BE(0);
  const mistura = data + signo + Date.now();
  for (let i = 0; i < mistura.length; i++) {
    hash = (hash * 31 + mistura.charCodeAt(i)) >>> 0;
  }
  return hash % pool.length;
}

export async function prepararMusicaParaVideo(signo: string, data: string): Promise<string> {
  return prepararMusicaEspecial(signo, data, 'zen');
}

export async function prepararMusicaEspecial(
  id: string,
  data: string,
  tipo: 'zen' | 'mistico' | 'viral' | 'aleatoria' = 'zen',
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

  const indice = escolherIndice(pool, id, data);
  const nomeFicheiro = 'musica-' + id + '.mp3';
  const destino = caminhoPublico(nomeFicheiro);
  const fontes = [
    pool[indice],
    pool[(indice + 2) % pool.length],
    pool[(indice + 5) % pool.length],
  ];

  const etiquetaFinal = etiqueta + ' [' + (indice + 1) + '/' + pool.length + ']';
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
