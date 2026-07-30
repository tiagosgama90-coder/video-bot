/** Símbolos Unicode do zodíaco — partilhados entre fundo e geometria central */
export const SIMBOLOS_ZODIACO_UNICODE = [
  '♈',
  '♉',
  '♊',
  '♋',
  '♌',
  '♍',
  '♎',
  '♏',
  '♐',
  '♑',
  '♒',
  '♓',
] as const;

/** Chaves internas dos signos — seguro para Remotion (sem Node crypto) */
export const CHAVES_SIGNOS_ZODIACO = [
  'carneiro',
  'touro',
  'gemeos',
  'caranguejo',
  'leao',
  'virgem',
  'balanca',
  'escorpiao',
  'sagitario',
  'capricornio',
  'aquario',
  'peixes',
] as const;

export function indiceSignoFromChave(chave: string | undefined): number {
  if (!chave) {
    return 0;
  }
  const idx = CHAVES_SIGNOS_ZODIACO.indexOf(chave as (typeof CHAVES_SIGNOS_ZODIACO)[number]);
  return idx >= 0 ? idx : 0;
}

/** Cores tradicionais por signo — fogo, terra, ar, água */
export const CORES_SIGNO_ZODIACO = [
  '#ff5c5c', // carneiro — vermelho fogo
  '#5ee87a', // touro — verde terra
  '#fde047', // gemeos — amarelo ar
  '#5eb8ff', // caranguejo — azul água
  '#ff9f43', // leao — laranja solar
  '#c4b5fd', // virgem — lavanda terra
  '#f9a8d4', // balanca — rosa ar
  '#e11d48', // escorpiao — carmesim água
  '#c084fc', // sagitario — roxo fogo
  '#a8a29e', // capricornio — pedra terra
  '#38bdf8', // aquario — ciano ar
  '#818cf8', // peixes — índigo água
] as const;

/** Brilho / glow por signo */
export const BRILHO_SIGNO_ZODIACO = [
  'rgba(255, 92, 92, 0.65)',
  'rgba(94, 232, 122, 0.65)',
  'rgba(253, 224, 71, 0.65)',
  'rgba(94, 184, 255, 0.65)',
  'rgba(255, 159, 67, 0.65)',
  'rgba(196, 181, 253, 0.65)',
  'rgba(249, 168, 212, 0.65)',
  'rgba(225, 29, 72, 0.65)',
  'rgba(192, 132, 252, 0.65)',
  'rgba(168, 162, 158, 0.65)',
  'rgba(56, 189, 248, 0.65)',
  'rgba(129, 140, 248, 0.65)',
] as const;

/** Paletas cósmicas por variante de geometria (primária, secundária, acento) */
export const PALETAS_VARIANTE_GEOMETRIA = [
  ['#ff9f43', '#ff5c5c', '#fde047'], // roda zodiacal — fogo/sol
  ['#c084fc', '#f9a8d4', '#818cf8'], // mandala — roxo/rosa/índigo
  ['#38bdf8', '#5ee87a', '#fde047'], // signo central — céu/terra/sol
  ['#5eb8ff', '#818cf8', '#f9a8d4'], // órbitas — azul/lavanda/rosa
  ['#ff5c5c', '#ff9f43', '#c084fc'], // anéis — fogo/laranja/roxo
  ['#a78bfa', '#38bdf8', '#fde047'], // metatron — violeta/ciano/dourado
  ['#f472b6', '#818cf8', '#5ee87a'], // estrela-8
  ['#5ee87a', '#38bdf8', '#c084fc'], // flor cósmica
  ['#38bdf8', '#818cf8', '#f9a8d4'], // grade
  ['#ff9f43', '#e11d48', '#38bdf8'], // cruz
] as const;

export function normalizarIndiceSigno(indice: number): number {
  return ((indice % 12) + 12) % 12;
}

export function corSignoZodiaco(indice: number): string {
  return CORES_SIGNO_ZODIACO[normalizarIndiceSigno(indice)];
}

export function brilhoSignoZodiaco(indice: number): string {
  return BRILHO_SIGNO_ZODIACO[normalizarIndiceSigno(indice)];
}

export function paletaVarianteGeometria(varianteIndice: number): readonly [string, string, string] {
  const i = normalizarIndiceSigno(varianteIndice) % PALETAS_VARIANTE_GEOMETRIA.length;
  return PALETAS_VARIANTE_GEOMETRIA[i];
}

/** Cor com opacidade hex (00–ff) */
export function corComAlpha(cor: string, alpha: number): string {
  const hex = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${cor}${hex}`;
}
