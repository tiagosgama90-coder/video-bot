/**
 * Prompts IA — Pinterest reel 9:16 vertical (pins espirituais para stories/reels).
 */

import {
  FALLBACKS_REEL_PINTEREST_COLOR,
  FALLBACKS_REEL_PINTEREST_MONO,
  MODIFICADORES_REEL_PINTEREST_COLOR,
  MODIFICADORES_REEL_PINTEREST_MONO,
  SUFIXO_REEL_PINTEREST_COLOR,
  SUFIXO_REEL_PINTEREST_MONO,
  TEMAS_REEL_PINTEREST_COLOR,
  TEMAS_REEL_PINTEREST_MONO,
} from './imagem-pinterest-reel';

export type ModoPaletaImagem = 'color' | 'mono';

export { PREFIXO_PROMPT_REEL_PINTEREST } from './imagem-pinterest-reel';

export const PALETAS_COLOR = [
  '60% midnight navy #08060e, 30% rich amethyst violet #6b3fa0, 10% luminous gold #f3cc63 and soft rose pink #e8a0bf accents',
  '60% deep indigo void #08060e, 30% cosmic purple nebula #4a2d7a, 10% teal cyan healing light #5ec8c8 and golden glow #f3cc63',
  '60% dark cosmic blue #08060e, 30% emerald spiritual green #2d6b5a, 10% warm amber gold #d4af37 and coral rose aura #e07a8a',
  '60% midnight purple base #08060e, 30% lavender mist #7b5ea7, 10% aurora magenta teal and gold multicolor spiritual highlights',
] as const;

export const PALETAS_MONOCROMATICAS = [
  '60% charcoal black #08060e, 30% deep graphite grey #1a1a24, 10% antique silver white #d8d8e8 and aged gold #c9a227 accents only',
  '60% midnight black #08060e, 30% cool grey mist #2a2a38, 10% moonlight silver #e8e8f0 fine line art no color',
  '60% deep void black #08060e, 30% sepia shadow #1c1814, 10% tarnished gold engraving #b8963e monochrome spiritual',
  '60% cosmic black #08060e, 30% slate grey nebula #252530, 10% white silver stardust highlights no chroma',
] as const;

/** @deprecated alias */
export const PALETAS_60_30_10 = PALETAS_COLOR;

export const TEMAS_COLOR = TEMAS_REEL_PINTEREST_COLOR;
export const TEMAS_MONOCROMATICOS = TEMAS_REEL_PINTEREST_MONO;

export const TEMAS_IMAGEM_ZEN_ESPIRITUAL = [...TEMAS_COLOR, ...TEMAS_MONOCROMATICOS] as const;

/** @deprecated alias */
export const TEMAS_IMAGEM_BRUTAL = TEMAS_IMAGEM_ZEN_ESPIRITUAL;

export const MODIFICADORES_COLOR = MODIFICADORES_REEL_PINTEREST_COLOR;
export const MODIFICADORES_MONO = MODIFICADORES_REEL_PINTEREST_MONO;

/** @deprecated alias */
export const MODIFICADORES_IMAGEM_ZEN = [...MODIFICADORES_COLOR, ...MODIFICADORES_MONO] as const;
export const MODIFICADORES_IMAGEM_BRUTAL = MODIFICADORES_IMAGEM_ZEN;

export const SUFIXO_PROMPT_COLOR = SUFIXO_REEL_PINTEREST_COLOR;
export const SUFIXO_PROMPT_MONO = SUFIXO_REEL_PINTEREST_MONO;

/** @deprecated alias — cor por omissão em imports antigos */
export const SUFIXO_PROMPT_IMAGEM = SUFIXO_PROMPT_COLOR;

export const PROMPTS_FALLBACK_COLOR = FALLBACKS_REEL_PINTEREST_COLOR;
export const PROMPTS_FALLBACK_MONO = FALLBACKS_REEL_PINTEREST_MONO;

export const PROMPTS_FALLBACK_ZEN = [...PROMPTS_FALLBACK_COLOR, ...PROMPTS_FALLBACK_MONO] as const;
export const PROMPTS_FALLBACK_BRUTAL = PROMPTS_FALLBACK_ZEN;

export function escolherModoPaletaImagem(chave: string, data: string): ModoPaletaImagem {
  let hash = 0;
  const seed = data + '|' + chave + '|modo-cor-mono-v2';
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % 4 === 0 ? 'mono' : 'color';
}
