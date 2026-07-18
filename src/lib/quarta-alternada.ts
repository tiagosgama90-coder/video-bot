/** Primeira quarta de referência — semana par = afiliados, ímpar = VIP divulgação */
const ANCHOR_QUARTA = '2026-07-15';

export type VarianteQuarta = 'afiliados' | 'vip';

export function obterVarianteQuarta(data: string): VarianteQuarta {
  const forcar = process.env.FORCAR_QUARTA?.toLowerCase();
  if (forcar === 'vip' || forcar === 'divulgacao') {
    return 'vip';
  }
  if (forcar === 'afiliados') {
    return 'afiliados';
  }

  const anchor = new Date(ANCHOR_QUARTA + 'T12:00:00');
  const atual = new Date(data + 'T12:00:00');
  const semanas = Math.round((atual.getTime() - anchor.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return semanas % 2 === 0 ? 'afiliados' : 'vip';
}

export function obterIdBaseQuarta(variante: VarianteQuarta): string {
  return variante === 'vip' ? 'vip-divulgacao-quarta' : 'afiliados-quarta';
}

export function rotuloVarianteQuarta(variante: VarianteQuarta): string {
  return variante === 'vip' ? 'VIP por Divulgação' : 'Afiliados';
}
