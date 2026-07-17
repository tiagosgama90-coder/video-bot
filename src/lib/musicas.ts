/* eslint-disable @remotion/deterministic-randomness -- usado apenas no script Node, não no render Remotion */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';

/**
 * New age / Enigma / worldbeat — pads etéreos, ritmos tribais suaves, atmosfera zen.
 * Mixkit License — royalty-free. Aplica-se a PT-PT e en-US (mesmo pool).
 */
const POOL_MUSICAS_ZEN: string[] = [
  // Worldbeat / étnico suave
  'https://assets.mixkit.co/music/21/21.mp3',
  'https://assets.mixkit.co/music/37/37.mp3',
  'https://assets.mixkit.co/music/45/45.mp3',
  'https://assets.mixkit.co/music/178/178.mp3',
  'https://assets.mixkit.co/music/233/233.mp3',
  'https://assets.mixkit.co/music/1084/1084.mp3',
  // Místico / Enigma
  'https://assets.mixkit.co/music/114/114.mp3',
  'https://assets.mixkit.co/music/138/138.mp3',
  'https://assets.mixkit.co/music/139/139.mp3',
  'https://assets.mixkit.co/music/141/141.mp3',
  'https://assets.mixkit.co/music/325/325.mp3',
  'https://assets.mixkit.co/music/538/538.mp3',
  'https://assets.mixkit.co/music/578/578.mp3',
  // New age / ambient
  'https://assets.mixkit.co/music/324/324.mp3',
  'https://assets.mixkit.co/music/441/441.mp3',
  'https://assets.mixkit.co/music/442/442.mp3',
];

/**
 * Faixas mais rítmicas/upbeat — estilo "viral TikTok" mas royalty-free.
 * Sons virais reais do TikTok são copyright e não podem ser usados automaticamente.
 * ~30% dos vídeos escolhem deste pool.
 */
const POOL_MUSICAS_ESTILO_VIRAL: string[] = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
];

/** Sempre zen — sem faixas upbeat nos vídeos diários */
const PROBABILIDADE_ESTILO_VIRAL = 0;

function caminhoPublico(nomeFicheiro: string): string {
  return path.resolve('./public/' + nomeFicheiro);
}

async function descarregarMusica(url: string, destino: string): Promise<void> {
  const resposta = await axios.get<ArrayBuffer>(url, {
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

function escolherPoolMusica(): { pool: string[]; tipo: 'zen' | 'viral-estilo' } {
  const usarViral = crypto.randomInt(0, 100) < PROBABILIDADE_ESTILO_VIRAL * 100;
  if (usarViral) {
    return { pool: POOL_MUSICAS_ESTILO_VIRAL, tipo: 'viral-estilo' };
  }
  return { pool: POOL_MUSICAS_ZEN, tipo: 'zen' };
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
  return prepararMusicaEspecial(signo, data, 'aleatoria');
}

export async function prepararMusicaEspecial(
  id: string,
  data: string,
  tipo: 'zen' | 'mistico' | 'viral' | 'aleatoria' = 'aleatoria',
): Promise<string> {
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public', { recursive: true });
  }

  let pool: string[];
  let etiqueta: string;

  if (tipo === 'zen') {
    pool = POOL_MUSICAS_ZEN;
    etiqueta = 'zen';
  } else if (tipo === 'viral') {
    pool = POOL_MUSICAS_ESTILO_VIRAL;
    etiqueta = 'viral';
  } else if (tipo === 'mistico') {
    pool = [...POOL_MUSICAS_ZEN, ...POOL_MUSICAS_ESTILO_VIRAL];
    etiqueta = 'místico';
  } else {
    const escolha = escolherPoolMusica();
    pool = escolha.pool;
    etiqueta = escolha.tipo;
  }

  const indice = escolherIndice(pool, id, data);
  const nomeFicheiro = 'musica-' + id + '.mp3';
  const destino = caminhoPublico(nomeFicheiro);
  const urls = [
    pool[indice],
    pool[(indice + 2) % pool.length],
    pool[(indice + 5) % pool.length],
  ];

  const etiquetaFinal =
    tipo === 'aleatoria'
      ? etiqueta + ' [' + (indice + 1) + '/' + pool.length + ']'
      : etiqueta + ' [' + (indice + 1) + '/' + pool.length + ']';

  console.log('🎵 Música ' + etiquetaFinal + ' para ' + id);

  for (const url of urls) {
    try {
      await descarregarMusica(url, destino);
      prepararMusicaZen(destino);
      console.log('✅ Música guardada: ' + nomeFicheiro);
      return nomeFicheiro;
    } catch (erro) {
      console.log('⚠️ URL música falhou: ' + url);
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
