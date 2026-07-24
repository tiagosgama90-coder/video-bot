/**
 * Regra 60-30-10 — SidusAstro vídeo vertical
 * 60% base escura | 30% identidade roxa | 10% dourado CTA
 */
export const PALETA_SIDUS = {
  /** 60% — fundo, base, descanso visual */
  fundo: '#08060e',
  fundoVeil: 'rgba(8, 6, 14, 0.55)',
  /** 30% — marca, caixas, estrutura */
  marca: '#1a1028',
  marcaMedia: '#2a1848',
  marcaClara: '#4a3070',
  marcaBorda: 'rgba(74, 48, 112, 0.7)',
  textoCorpo: '#ebe6f2',
  textoSuave: '#b8b0c8',
  /** 10% — CTA, signo, gancho, fecho */
  destaque: '#f3cc63',
  destaqueForte: '#ffda6a',
  destaqueBorda: 'rgba(243, 204, 99, 0.9)',
  destaqueSombra: 'rgba(243, 204, 99, 0.4)',
} as const;
