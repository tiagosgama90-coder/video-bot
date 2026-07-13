/* eslint-disable @remotion/deterministic-randomness -- usado apenas no script Node, não no render Remotion */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';

/** 12+ faixas zen/calmas — SoundHelix royalty-free */
const POOL_MUSICAS_ZEN: string[] = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
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

/** Probabilidade de escolher faixa estilo viral (royalty-free) */
const PROBABILIDADE_ESTILO_VIRAL = 0.3;

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

function gerarMusicaOffline(destino: string, indice: number): void {
  const frequencias = [174, 285, 396, 417, 432, 528, 639, 741];
  const freq = frequencias[indice % frequencias.length];
  const destinoWin = destino.replace(/\//g, path.sep);

  execSync(
    'ffmpeg -y -f lavfi -i "sine=frequency=' +
      freq +
      ':duration=45" -af "volume=0.06,afade=t=in:st=0:d=2,afade=t=out:st=43:d=2" -ar 44100 -ac 1 -b:a 96k "' +
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
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public', { recursive: true });
  }

  const { pool, tipo } = escolherPoolMusica();
  const indice = escolherIndice(pool, signo, data);
  const nomeFicheiro = 'musica-' + signo + '.mp3';
  const destino = caminhoPublico(nomeFicheiro);
  const urls = [
    pool[indice],
    pool[(indice + 2) % pool.length],
    pool[(indice + 5) % pool.length],
  ];

  const etiqueta =
    tipo === 'zen'
      ? 'zen [' + (indice + 1) + '/' + POOL_MUSICAS_ZEN.length + ']'
      : 'estilo viral royalty-free [' + (indice + 1) + '/' + POOL_MUSICAS_ESTILO_VIRAL.length + ']';

  console.log('🎵 Música ' + etiqueta + ' para ' + signo);

  for (const url of urls) {
    try {
      await descarregarMusica(url, destino);
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
    throw new Error('Não foi possível preparar música para ' + signo);
  }
}
