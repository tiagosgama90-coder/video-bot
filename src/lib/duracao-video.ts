import { execSync } from 'child_process';
import path from 'path';

export const FPS_VIDEO = 30;
export const DURACAO_MINIMA_SEG = 15;
export const DURACAO_MAXIMA_SEG = 25;
/** Máximo do vídeo diário com gancho + previsão + fecho narrados */
export const DURACAO_MAXIMA_DIARIO_SEG = 38;
/** Margem após a narração terminar — garante que a frase final não é cortada */
export const MARGEM_FINAL_SEG = 2;

export function obterDuracaoAudioSegundos(caminhoMp3: string): number {
  const caminho = path.resolve(caminhoMp3).replace(/\//g, path.sep);

  try {
    const saida = execSync(
      'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "' +
        caminho +
        '"',
      { encoding: 'utf8' },
    );
    const segundos = parseFloat(saida.trim());
    if (Number.isFinite(segundos) && segundos > 0) {
      return segundos;
    }
  } catch {
    console.log('⚠️ ffprobe indisponível — a usar duração mínima de ' + DURACAO_MINIMA_SEG + 's');
  }

  return DURACAO_MINIMA_SEG;
}

export function calcularDuracaoFrames(
  caminhoNarracao: string,
  maxSegundos = DURACAO_MAXIMA_SEG,
): number {
  const audioSeg = obterDuracaoAudioSegundos(caminhoNarracao);
  const totalSeg = Math.min(
    maxSegundos,
    Math.max(DURACAO_MINIMA_SEG, Math.ceil(audioSeg + MARGEM_FINAL_SEG)),
  );
  const frames = totalSeg * FPS_VIDEO;

  console.log(
    '🎬 Duração vídeo: ' +
      totalSeg +
      's (máx ' +
      maxSegundos +
      's, ' +
      frames +
      ' frames) — áudio ' +
      audioSeg.toFixed(1) +
      's + margem ' +
      MARGEM_FINAL_SEG +
      's',
  );

  return frames;
}
