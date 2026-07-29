/**
 * Texto visto pelo público (legendas Buffer + overlay no vídeo + narração).
 * Proibido: aspas e traços tipográficos longos. Usar sempre hífen simples "-".
 */
export function sanitizarTextoPublico(texto: string): string {
  return String(texto || '')
    .replace(/\u2014/g, '-') // —
    .replace(/\u2013/g, '-') // –
    .replace(/\u2212/g, '-') // −
    .replace(/\u2015/g, '-') // ―
    .replace(/[\u201C\u201D\u00AB\u00BB\u2039\u203A\u0022]/g, '') // aspas duplas / guillemets
    .replace(/[\u2018\u2019\u0060\u00B4\u0027]/g, '') // aspas simples / apóstrofos
    .replace(/\s+-\s+/g, ' - ')
    .replace(/ {2,}/g, ' ')
    .trim();
}

/** Padrões proibidos no vídeo (narração + overlay) — só legendas Buffer podem ter CTA viral */
const PADROES_PROIBIDOS_VIDEO: RegExp[] = [
  /\bleia\s+a\s+legenda[^.!?]*/gi,
  /\bleia\s+com\s+aten[cç][aã]o/gi,
  /\blegenda\s+urgente/gi,
  /\burgente\s*legenda/gi,
  /\blegenda\b/gi,
  /\bcomenta\s+(mapa|premium|map)[^.!?]*/gi,
  /\bcomente\s+(mapa|premium)[^.!?]*/gi,
  /\bcomment\s+(map|premium)[^.!?]*/gi,
  /\bcomente\s+menos[^.!?]*/gi,
  /\brespondemos\s+no\s+direct/gi,
  /\bwe\s+reply\s+in\s+dm/gi,
  /\bread\s+the\s+(full\s+)?caption/gi,
  /\burgent\s+caption/gi,
  /🚨/g,
];

/**
 * Texto seguro para narração e overlay no vídeo — sem CTAs de legenda/comentário.
 * Marketing profissional fica no rodapé (sidusastro.com) e nas legendas Buffer.
 */
export function filtrarTextoParaVideo(texto: string): string {
  let limpo = sanitizarTextoPublico(texto);
  for (const padrao of PADROES_PROIBIDOS_VIDEO) {
    limpo = limpo.replace(padrao, '');
  }
  return limpo
    .replace(/\burgente\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/^[,.!?;:\s]+/, '')
    .trim();
}

/** Texto para TTS Azure — remove emojis, CTAs proibidos e símbolos que quebram SSML */
export function prepararTextoNarracao(texto: string): string {
  return filtrarTextoParaVideo(texto)
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\u2600-\u27BF]/g, '')
    .replace(/[\uFE00-\uFE0F]/g, '')
    .replace(/\u200D/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function sanitizarLegendas(legendas: {
  tiktok: string;
  instagram: string;
  hook?: string;
}): { tiktok: string; instagram: string; hook?: string } {
  return {
    tiktok: sanitizarTextoPublico(legendas.tiktok),
    instagram: sanitizarTextoPublico(legendas.instagram),
    ...(legendas.hook !== undefined
      ? { hook: sanitizarTextoPublico(legendas.hook) }
      : {}),
  };
}
