/* eslint-disable @remotion/deterministic-randomness -- usado apenas no script Node, não no render Remotion */
import { NOMES_SIGNOS, type SignoZodiaco } from './signos';

export const FINAL_CLOSINGS = [
  'Aprofunda esta análise no sidusastro.com.',
  'Vê o teu mapa completo em sidusastro.com.',
  'Mais detalhes sobre o teu dia em sidusastro.com.',
] as const;

const HOOKS_LEGENDA: Array<(nomeSigno: string) => string> = [
  (nome) => 'Como será o dia de hoje para ' + nome + '?',
  (nome) => 'A energia astrológica para ' + nome,
  (nome) => 'O que os astros dizem a ' + nome + '?',
  (nome) => 'Previsão diária para ' + nome + ' ✨',
  (nome) => nome + ': o que o céu reserva para ti hoje?',
  (nome) => 'Horóscopo de hoje para ' + nome,
];

function normalizarHashtag(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '');
}

/** Fecho aleatório da narração — independente da legenda do post */
export function escolherFechoNarracao(): string {
  const indice = Math.floor(Math.random() * FINAL_CLOSINGS.length);
  return ' ' + FINAL_CLOSINGS[indice];
}

/** Legenda do Buffer (Instagram/TikTok) — gerada separadamente da voz */
export function gerarLegenda(signo: SignoZodiaco): string {
  const nomeSigno = NOMES_SIGNOS[signo];
  const indiceHook = Math.floor(Math.random() * HOOKS_LEGENDA.length);
  const hook = HOOKS_LEGENDA[indiceHook](nomeSigno);
  const tagSigno = '#' + normalizarHashtag(nomeSigno);
  const tagPrevisoes = '#previsoes' + normalizarHashtag(nomeSigno);

  return (
    hook +
    '\n\n🔗 sidusastro.com\n\n' +
    '#astrologia #sidusastro #horoscopo #tarot ' +
    tagSigno +
    ' ' +
    tagPrevisoes
  );
}
