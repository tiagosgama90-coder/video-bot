import crypto from 'crypto';

/**
 * Temas de fundo animado — gótico, zen, místico, celta, astrologia, velas, tarot.
 * Sem pessoas; paleta dark; movimento contínuo.
 */
export const TEMAS_FUNDO_MISTICO = [
  'velas',
  'mesa_tarot',
  'mapa_astral',
  'horoscopo',
  'gotico',
  'celta',
  'zen_escuro',
  'oraculo',
  'nebula',
  'lua',
] as const;

export type TemaFundoMistico = (typeof TEMAS_FUNDO_MISTICO)[number];

export interface ConfigFundoVideo {
  tema: TemaFundoMistico;
  seed: number;
}

function hashChave(chave: string): number {
  const digest = crypto.createHash('sha256').update(chave).digest();
  return digest.readUInt32BE(0);
}

/** Escolhe um tema animado único por signo + data — vídeo diferente a cada publicação */
export function escolherFundoVideo(signo: string, data: string): ConfigFundoVideo {
  const hash = hashChave(`${data}|${signo}|fundo-video-v2`);
  const tema = TEMAS_FUNDO_MISTICO[hash % TEMAS_FUNDO_MISTICO.length];
  const seed = hash % 9_999_999;
  return { tema, seed };
}
