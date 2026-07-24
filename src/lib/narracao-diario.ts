import { calcularSegmentosProgressivos } from './texto-progressivo';

export interface PartesNarracaoDiaria {
  hook: string;
  previsao: string;
  fecho: string;
}

export interface QuadrosNarracaoDiaria {
  frameInicioPrevisao: number;
  frameInicioFecho: number;
}

/** Texto completo para TTS: gancho → previsão → fecho (ordem natural de leitura) */
export function montarTextoNarracaoDiaria(partes: PartesNarracaoDiaria): string {
  const hook = partes.hook.trim();
  const previsao = partes.previsao.trim();
  const fecho = textoFechoParaNarracao(partes.fecho);

  return [hook, previsao, fecho].filter(Boolean).join('. ');
}

/** Fecho legível em voz (evita "seta" no TTS) */
function textoFechoParaNarracao(fecho: string): string {
  return fecho
    .trim()
    .replace(/\s*→\s*/g, ', em ')
    .replace(/\s*\/\s*/g, ' ')
    .replace(/\s+/g, ' ');
}

/** Sincroniza ecrã com a narração — quadros proporcionais ao nº de palavras */
export function calcularQuadrosNarracaoDiaria(
  partes: PartesNarracaoDiaria,
  duracaoFrames: number,
): QuadrosNarracaoDiaria {
  const textos = [
    partes.hook.trim(),
    partes.previsao.trim(),
    textoFechoParaNarracao(partes.fecho),
  ].filter(Boolean);

  const segmentos = calcularSegmentosProgressivos(textos, duracaoFrames);

  if (segmentos.length >= 3) {
    return {
      frameInicioPrevisao: segmentos[1].frameInicio,
      frameInicioFecho: segmentos[2].frameInicio,
    };
  }

  if (segmentos.length === 2) {
    return {
      frameInicioPrevisao: segmentos[1].frameInicio,
      frameInicioFecho: Math.round(duracaoFrames * 0.78),
    };
  }

  return {
    frameInicioPrevisao: Math.round(duracaoFrames * 0.28),
    frameInicioFecho: Math.round(duracaoFrames * 0.78),
  };
}
