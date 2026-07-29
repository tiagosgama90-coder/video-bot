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
  'reiki_energia',
  'mandala_sagrada',
  'energia_cosmica',
] as const;

/** Temas suaves zen/espiritual — para vídeos especiais com fundo animado (estilo Pinterest) */
export const TEMAS_FUNDO_ZEN_ESPIRITUAL = [
  'zen_escuro',
  'horoscopo',
  'nebula',
  'lua',
  'oraculo',
  'reiki_energia',
  'mandala_sagrada',
  'energia_cosmica',
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

/** Diário: fundo cósmico espiritual (sem gótico/tarot pesado) */
export function escolherFundoVideo(signo: string, data: string): ConfigFundoVideo {
  return escolherFundoVideoZen(signo, data);
}

/** Fundo animado zen/espiritual — motivacional, VIP, afiliados (sem gótico/tarot pesado) */
export function escolherFundoVideoZen(id: string, data: string): ConfigFundoVideo {
  const hash = hashChave(`${data}|${id}|fundo-zen-espiritual-v1`);
  const tema = TEMAS_FUNDO_ZEN_ESPIRITUAL[hash % TEMAS_FUNDO_ZEN_ESPIRITUAL.length];
  const seed = hash % 9_999_999;
  return { tema, seed };
}

/** Índice da geometria central — independente do seed de estrelas/nebulosas (varia por signo + dia) */
export function escolherIndiceGeometriaCentro(signo: string, data: string): number {
  return hashChave(`${data}|${signo}|geometria-centro-zodiaco-v2`) % 10;
}

/** Vídeos zen usam fundo cósmico preto animado (sem imagens IA esticadas) */
export function deveUsarFundoAnimadoZen(_id: string, _data: string): boolean {
  return true;
}
