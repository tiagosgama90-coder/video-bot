/**
 * Texto visto pelo público (legendas Buffer + overlay no vídeo).
 * Proibido traço tipográfico longo (em dash). Usar sempre hífen simples "-".
 */
export function sanitizarTextoPublico(texto: string): string {
  return String(texto || '')
    .replace(/\u2014/g, '-') // —
    .replace(/\u2013/g, '-') // –
    .replace(/\u2212/g, '-') // −
    .replace(/ {2,}/g, ' ')
    .trim();
}

/** Texto para TTS Azure — remove emojis e símbolos que quebram SSML */
export function prepararTextoNarracao(texto: string): string {
  return sanitizarTextoPublico(texto)
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
