import { escolherGanchoAfiliadosComTema } from './ganchos-afiliados';
import { limparGanchoParaNarracao } from './ganchos-diario';
import type { GanchoComTema } from './fechos-narracao';
import { isLocaleUS } from './locale';

const GANCHOS_MOTIVACIONAL_PT = [
  'Respira fundo. O universo pede calma antes de qualquer decisão hoje',
  'Este momento é seu. Deixe o barulho lá fora e escute o que o céu sussurra',
  'Não precisa correr. A energia de hoje pede presença, não pressa',
  'Feche os olhos por um instante. O que vem a seguir é para acalmar sua mente',
  'Hoje não é sobre provar nada. É sobre voltar ao seu centro com gentileza',
];

const GANCHOS_MOTIVACIONAL_EN = [
  'Take a deep breath. The universe asks for calm before any decision today',
  'This moment is yours. Let the noise outside go and listen to what the sky whispers',
  'You do not need to rush. Today energy asks for presence, not pressure',
  'Close your eyes for a moment. What comes next is meant to soothe your mind',
  'Today is not about proving anything. It is about returning to your center with kindness',
];

function hashGancho(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Gancho de abertura para vídeos especiais (motivacional, VIP, afiliados) */
export function escolherGanchoEspecial(id: string, data: string): string {
  return escolherGanchoEspecialComTema(id, data).texto;
}

export function escolherGanchoEspecialComTema(id: string, data: string): GanchoComTema {
  const chave = id.toLowerCase();
  if (chave.includes('afiliados')) {
    return escolherGanchoAfiliadosComTema(data, id);
  }
  if (chave.includes('vip')) {
    return { texto: '', tema: 'geral' };
  }
  const pool = isLocaleUS() ? GANCHOS_MOTIVACIONAL_EN : GANCHOS_MOTIVACIONAL_PT;
  const indice = hashGancho('motiv-' + id + '-' + data) % pool.length;
  return { texto: limparGanchoParaNarracao(pool[indice]), tema: 'geral' };
}
