import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';
import type { TipoMusica } from '../types/horoscopo';

const TIPOS_MUSICA: TipoMusica[] = ['zen', 'celta', 'meditacao'];

/** Frequências suaves para gerar ambiente offline via FFmpeg (Hz) */
const FREQUENCIAS_AMBIENTE: Record<TipoMusica, number> = {
  zen: 174,
  celta: 396,
  meditacao: 528,
};

const URLS_MUSICA: Record<TipoMusica, string[]> = {
  zen: [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  ],
  celta: [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  ],
  meditacao: [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  ],
};

function caminhoMusica(tipo: TipoMusica): string {
  return path.resolve('./public/musica-' + tipo + '.mp3');
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

function gerarMusicaOffline(destino: string, tipo: TipoMusica): void {
  const freq = FREQUENCIAS_AMBIENTE[tipo];
  const destinoWin = destino.replace(/\//g, path.sep);

  try {
    execSync(
      'ffmpeg -y -f lavfi -i "sine=frequency=' +
        freq +
        ':duration=45" -af "volume=0.06,afade=t=in:st=0:d=2,afade=t=out:st=43:d=2" -ar 44100 -ac 1 -b:a 96k "' +
        destinoWin +
        '"',
      { stdio: 'ignore' },
    );
    console.log('✅ Música ' + tipo + ' gerada offline com FFmpeg.');
    return;
  } catch {
    console.log('⚠️ FFmpeg indisponível para ' + tipo + '. A usar cópia de fallback.');
  }

  const fallback = caminhoMusica('zen');
  if (fs.existsSync(fallback) && fallback !== destino) {
    fs.copyFileSync(fallback, destino);
    return;
  }

  throw new Error('Não foi possível criar musica-' + tipo + '.mp3');
}

async function garantirMusicaTipo(tipo: TipoMusica): Promise<void> {
  const destino = caminhoMusica(tipo);
  if (fs.existsSync(destino) && fs.statSync(destino).size > 10_000) {
    return;
  }

  for (const url of URLS_MUSICA[tipo]) {
    try {
      console.log('🎵 A descarregar música ' + tipo + '...');
      await descarregarMusica(url, destino);
      console.log('✅ Música ' + tipo + ' descarregada.');
      return;
    } catch (erro) {
      console.log('⚠️ URL falhou para ' + tipo + ': ' + String(erro));
    }
  }

  console.log('🎵 A gerar música ' + tipo + ' localmente...');
  gerarMusicaOffline(destino, tipo);
}

export async function garantirMusicasAmbiente(): Promise<void> {
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public', { recursive: true });
  }

  for (const tipo of TIPOS_MUSICA) {
    await garantirMusicaTipo(tipo);
  }

  for (const tipo of TIPOS_MUSICA) {
    const destino = caminhoMusica(tipo);
    if (!fs.existsSync(destino) || fs.statSync(destino).size < 1000) {
      throw new Error('Ficheiro em falta após setup: ' + destino);
    }
  }
}

export function nomeFicheiroMusica(tipo: TipoMusica): string {
  return 'musica-' + tipo + '.mp3';
}
