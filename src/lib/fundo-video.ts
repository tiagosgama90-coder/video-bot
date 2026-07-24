import crypto from 'crypto';

/** Temas de fundo animado — cada um com movimento próprio (nebulosa, zodíaco, aurora, etc.) */
export const TEMAS_FUNDO_MISTICO = [
  'nebula',
  'constelacoes',
  'zodiaco',
  'aurora',
  'lua',
  'cosmos',
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
  const hash = hashChave(`${data}|${signo}|fundo-video`);
  const tema = TEMAS_FUNDO_MISTICO[hash % TEMAS_FUNDO_MISTICO.length];
  const seed = hash % 9_999_999;
  return { tema, seed };
}
