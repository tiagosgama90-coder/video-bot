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

export function normalizarIndiceSigno(indice: number): number {
  return ((indice % 12) + 12) % 12;
}
