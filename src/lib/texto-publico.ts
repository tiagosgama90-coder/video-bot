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
