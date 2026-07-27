import { isLocaleUS } from './locale';
import type { SignoZodiaco } from './signos';
import { sanitizarTextoPublico } from './texto-publico';

/** Tema narrativo — o fecho deve corresponder sempre ao gancho */
export type TemaNarracao = 'financas' | 'amor' | 'ego' | 'depressao' | 'geral';

export interface GanchoComTema {
  texto: string;
  tema: TemaNarracao;
}

const FECHOS_FINANCAS_PT = [
  'A janela financeira que falámos está no teu mapa grátis em sidusastro.com',
  'O bloqueio de dinheiro tem saída no mapa natal - vê em sidusastro.com',
  'O trânsito de rendimento continua detalhado no teu mapa em sidusastro.com',
  'Ninguém te mostra a casa do dinheiro nas apps - mapa completo em sidusastro.com',
  'A área financeira que mencionámos abre-se no mapa astral grátis em sidusastro.com',
] as const;

const FECHOS_FINANCAS_EN = [
  'The money window we mentioned is on your free chart at sidusastro.com/en',
  'The financial block has an exit on your birth chart - see sidusastro.com/en',
  'The income transit continues in detail on your chart at sidusastro.com/en',
  'Nobody shows your money houses in free apps - full chart at sidusastro.com/en',
  'The financial zone we talked about opens on your free chart at sidusastro.com/en',
] as const;

const FECHOS_AMOR_PT = [
  'Descobre já a afinidade do teu parceiro com o teu em sidusastro.com',
  'A Casa da Vénus no teu mapa explica o padrão - sidusastro.com grátis',
  'Se a relação te consome ou a traição te ronda, o mapa em sidusastro.com esclarece',
  'A compatibilidade real do casal está no mapa em sidusastro.com - grátis',
  'O que a conversa não diz, o mapa de sinastria mostra em sidusastro.com',
] as const;

const FECHOS_AMOR_EN = [
  'Discover your partner affinity with yours at sidusastro.com/en',
  'Your Venus House explains the pattern - free at sidusastro.com/en',
  'If the relationship drains you or betrayal haunts you, sidusastro.com/en clarifies',
  'Real couple compatibility is on the chart at sidusastro.com/en - free',
  'What the talk hides, the synastry chart shows at sidusastro.com/en',
] as const;

const FECHOS_EGO_PT = [
  'A tua missão de vida está no mapa natal grátis em sidusastro.com',
  'O propósito que evitas há anos aparece no teu mapa em sidusastro.com',
  'O que o universo te pede hoje está escrito no teu mapa em sidusastro.com',
  'Ascendente e Nodo Norte explicados no mapa grátis em sidusastro.com',
  'Nasceste para mais - o mapa natal confirma em sidusastro.com',
] as const;

const FECHOS_EGO_EN = [
  'Your life mission is on your free birth chart at sidusastro.com/en',
  'The purpose you avoided for years appears on your chart at sidusastro.com/en',
  'What the universe asks of you today is written on your chart at sidusastro.com/en',
  'Rising sign and North Node explained free at sidusastro.com/en',
  'You were born for more - your birth chart confirms at sidusastro.com/en',
] as const;

const FECHOS_DEPRESSAO_PT = [
  'Não és fraco - o teu mapa explica o que sentes em sidusastro.com',
  'O que pesa hoje tem resposta no mapa astral grátis em sidusastro.com',
  'A fase pesada que vives tem nome no teu mapa em sidusastro.com',
  'O que a mente não descansa, o mapa traduz em sidusastro.com - grátis',
  'Não estás sozinho - o teu mapa mostra o porquê em sidusastro.com',
] as const;

const FECHOS_DEPRESSAO_EN = [
  'You are not weak - your chart explains what you feel at sidusastro.com/en',
  'What weighs on you today has an answer on your free chart at sidusastro.com/en',
  'The heavy phase you live has a name on your chart at sidusastro.com/en',
  'What your mind cannot rest from, your chart translates at sidusastro.com/en',
  'You are not alone - your chart shows why at sidusastro.com/en',
] as const;

const FECHOS_GERAL_PT = [
  'Ninguém te mostra isto nas apps grátis - mapa astral completo em sidusastro.com',
  'O segredo que falta no vídeo está no teu mapa em sidusastro.com',
  'Não pares aqui - descobre tudo no mapa astral grátis em sidusastro.com',
  'A verdade completa do teu dia está em sidusastro.com',
  'Mapa astral grátis em sidusastro.com - o que lá está não está nas apps',
  'O que vais ler a seguir no site muda tudo - sidusastro.com',
  'Última peça do puzzle: mapa astral grátis em sidusastro.com',
  'Parece mentira, mas o teu mapa astral grátis está em sidusastro.com',
] as const;

const FECHOS_GERAL_EN = [
  'Nobody shows you this in free apps - full birth chart at sidusastro.com/en',
  'The missing piece of this video is on your chart at sidusastro.com/en',
  "Don't stop here - discover everything free at sidusastro.com/en",
  'The full truth of your day is at sidusastro.com/en',
  'Free birth chart at sidusastro.com/en - not in the apps',
  'What you read next on the site changes everything - sidusastro.com/en',
  'Last piece of the puzzle: free chart at sidusastro.com/en',
  'Sounds crazy, but your free birth chart is at sidusastro.com/en',
] as const;

function hashFecho(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function poolPorTema(tema: TemaNarracao): readonly string[] {
  if (isLocaleUS()) {
    switch (tema) {
      case 'financas':
        return FECHOS_FINANCAS_EN;
      case 'amor':
        return FECHOS_AMOR_EN;
      case 'ego':
        return FECHOS_EGO_EN;
      case 'depressao':
        return FECHOS_DEPRESSAO_EN;
      default:
        return FECHOS_GERAL_EN;
    }
  }
  switch (tema) {
    case 'financas':
      return FECHOS_FINANCAS_PT;
    case 'amor':
      return FECHOS_AMOR_PT;
    case 'ego':
      return FECHOS_EGO_PT;
    case 'depressao':
      return FECHOS_DEPRESSAO_PT;
    default:
      return FECHOS_GERAL_PT;
  }
}

/** Fecho de despedida alinhado ao tema do gancho — nunca misturar dinheiro com amor, etc. */
export function escolherFechoNarracao(
  tema: TemaNarracao,
  signo?: SignoZodiaco,
  data?: string,
): string {
  const pool = poolPorTema(tema);
  const chave = 'fecho-' + tema + '-' + (signo ?? 'geral') + '-' + (data ?? 'hoje');
  const indice = hashFecho(chave) % pool.length;
  return sanitizarTextoPublico(pool[indice]);
}

/** @deprecated usar pools temáticos em fechos-narracao.ts */
export const FINAL_CLOSINGS = FECHOS_GERAL_PT;
export const FINAL_CLOSINGS_EN = FECHOS_GERAL_EN;
