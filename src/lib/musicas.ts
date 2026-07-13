/* eslint-disable @remotion/deterministic-randomness -- usado apenas no script Node, não no render Remotion */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';

/** Faixas royalty-free (SoundHelix) — uma escolhida aleatoriamente por vídeo */
const POOL_MUSICAS_AMBIENTE: string[] = Array.from({ length: 16 }, (_, i) => {
  return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-' + (i + 1) + '.mp3';
});

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

function escolherIndiceMusica(signo: string, data: string): number {
  const mistura = data + '-' + signo + '-' + Date.now() + '-' + Math.random();
  let hash = 0;
  for (let i = 0; i < mistura.length; i++) {
    hash = (hash * 31 + mistura.charCodeAt(i)) >>> 0;
  }
  return hash % POOL_MUSICAS_AMBIENTE.length;
}

/**
 * Descarrega uma faixa diferente para cada vídeo/signo.
 * Nota: músicas virais do TikTok são protegidas por copyright e não têm API
 * pública para uso automático em vídeos publicados via Buffer.
 */
export async function prepararMusicaParaVideo(signo: string, data: string): Promise<string> {
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public', { recursive: true });
  }

  const indice = escolherIndiceMusica(signo, data);
  const nomeFicheiro = 'musica-' + signo + '.mp3';
  const destino = caminhoPublico(nomeFicheiro);
  const urls = [
    POOL_MUSICAS_AMBIENTE[indice],
    POOL_MUSICAS_AMBIENTE[(indice + 3) % POOL_MUSICAS_AMBIENTE.length],
    POOL_MUSICAS_AMBIENTE[(indice + 7) % POOL_MUSICAS_AMBIENTE.length],
  ];

  console.log('🎵 Música aleatória [' + (indice + 1) + '/16] para ' + signo);

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
