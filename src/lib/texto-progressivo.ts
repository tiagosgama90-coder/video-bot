export interface SegmentoEcra {
  texto: string;
  frameInicio: number;
}

/** Distribui frames por segmento proporcionalmente ao nº de palavras (sincronizado com a narração). */
export function calcularSegmentosProgressivos(
  textos: string[],
  duracaoFrames: number,
  margemInicio = 12,
  margemFim = 8,
  antecipacaoFrames = 15,
): SegmentoEcra[] {
  if (textos.length === 0) {
    return [];
  }

  const palavrasPorSegmento = textos.map((t) => t.trim().split(/\s+/).filter(Boolean).length);
  const totalPalavras = palavrasPorSegmento.reduce((s, n) => s + n, 0) || textos.length;
  const framesUteis = Math.max(textos.length * 30, duracaoFrames - margemInicio - margemFim);

  let frame = margemInicio;
  return textos.map((texto, i) => {
    const peso = palavrasPorSegmento[i] / totalPalavras;
    const framesSegmento = Math.max(24, Math.round(peso * framesUteis));
    const inicio =
      i === 0 ? frame : Math.max(margemInicio, frame - antecipacaoFrames);
    const segmento: SegmentoEcra = { texto: texto.trim(), frameInicio: inicio };
    frame += framesSegmento;
    return segmento;
  });
}
