/* eslint-disable @remotion/deterministic-randomness -- usado apenas no script Node, não no render Remotion */
import crypto from 'crypto';
import { isLocaleUS } from './locale';
import { obterNomeSigno, type SignoZodiaco } from './signos';

export const FINAL_CLOSINGS = [
  'Aprofunda esta análise no sidusastro.com',
  'Vê o teu mapa completo em sidusastro.com',
  'Mais detalhes sobre o teu dia em sidusastro.com',
] as const;

export const FINAL_CLOSINGS_EN = [
  'Get your full reading at sidusastro.com/en',
  'See your complete birth chart at sidusastro.com/en',
  'More details about your day at sidusastro.com/en',
] as const;

const HOOKS_LEGENDA: Array<(nomeSigno: string) => string> = [
  (nome) => 'Como será o dia de hoje para ' + nome + '?',
  (nome) => 'A energia astrológica para ' + nome,
  (nome) => 'O que os astros dizem a ' + nome + '?',
  (nome) => 'Previsão diária para ' + nome + ' ✨',
  (nome) => nome + ': o que o céu reserva para ti hoje?',
  (nome) => 'Horóscopo de hoje para ' + nome,
];

const HOOKS_LEGENDA_EN: Array<(nomeSigno: string) => string> = [
  (nome) => 'What does today hold for ' + nome + '?',
  (nome) => 'Today\'s cosmic energy for ' + nome + ' ✨',
  (nome) => 'If you\'re a ' + nome + ', stop scrolling — this is for you',
  (nome) => 'Daily horoscope for ' + nome,
  (nome) => nome + ': what the stars have in store today',
  (nome) => 'Your sign today: ' + nome,
];

function normalizarHashtag(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '');
}

function hashtagSigno(signo: SignoZodiaco): string {
  const nome = obterNomeSigno(signo);
  return '#' + normalizarHashtag(nome);
}

function obterHooks(): Array<(nomeSigno: string) => string> {
  return isLocaleUS() ? HOOKS_LEGENDA_EN : HOOKS_LEGENDA;
}

function gerarCorpoLegenda(signo: SignoZodiaco, previsao: string): string {
  const nomeSigno = obterNomeSigno(signo);
  const hooks = obterHooks();
  const indiceHook = crypto.randomInt(0, hooks.length);
  const hook = hooks[indiceHook](nomeSigno);
  const resumo =
    previsao.length > 140 ? previsao.slice(0, 137).trim() + '...' : previsao;

  return hook + '\n\n' + resumo;
}

function sufixoTikTok(signo: SignoZodiaco): string {
  const tagSigno = hashtagSigno(signo);
  if (isLocaleUS()) {
    return (
      '👉 FREE birth chart (Sun, Moon & Rising)\n' +
      '🔗 sidusastro.com/en/login\n\n' +
      '#horoscope #zodiac #astrology #sidusastro #birthchart #zodiacsigns ' +
      tagSigno
    );
  }

  return (
    '👉 Mapa astral GRÁTIS (Sol, Lua e Ascendente)\n' +
    '🔗 sidusastro.com/login\n\n' +
    '#astrologia #horoscopo #sidusastro #mapastral #ascendente ' +
    tagSigno
  );
}

function sufixoInstagram(signo: SignoZodiaco): string {
  const tagSigno = hashtagSigno(signo);
  return (
    '✨ Mapa astral GRÁTIS\n' +
    '☀️ Sol · 🌙 Lua · ⬆️ Ascendente\n' +
    '👆 Link na bio\n\n' +
    '#astrologia #horoscopo #sidusastro #mapastral #reels #astrologiapt ' +
    tagSigno
  );
}

/** Sempre uma das 3 frases de fecho definidas (com pausa antes) */
export function escolherFechoNarracao(): string {
  const fechos = isLocaleUS() ? FINAL_CLOSINGS_EN : FINAL_CLOSINGS;
  const indice = crypto.randomInt(0, fechos.length);
  return '. ' + fechos[indice];
}

/** Legenda TikTok — hook + resumo + CTA + hashtags */
export function gerarLegendaTikTok(signo: SignoZodiaco, previsao: string): string {
  return gerarCorpoLegenda(signo, previsao) + '\n\n' + sufixoTikTok(signo);
}

/** Legenda Instagram — hook + resumo + CTA + hashtags */
export function gerarLegendaInstagram(signo: SignoZodiaco, previsao: string): string {
  return gerarCorpoLegenda(signo, previsao) + '\n\n' + sufixoInstagram(signo);
}

/** Gera ambas as legendas com o mesmo hook e resumo */
export function gerarLegendas(
  signo: SignoZodiaco,
  previsao: string,
): { tiktok: string; instagram: string } {
  const corpo = gerarCorpoLegenda(signo, previsao);
  return {
    tiktok: corpo + '\n\n' + sufixoTikTok(signo),
    instagram: corpo + '\n\n' + sufixoInstagram(signo),
  };
}

/** Escolhe legenda conforme a plataforma Buffer */
export function gerarLegendaParaCanal(
  service: string,
  signo: SignoZodiaco,
  previsao: string,
): string {
  if (service.toLowerCase() === 'instagram') {
    return gerarLegendaInstagram(signo, previsao);
  }
  return gerarLegendaTikTok(signo, previsao);
}

/** @deprecated usar gerarLegendaTikTok */
export function gerarLegenda(signo: SignoZodiaco, previsao: string): string {
  return gerarLegendaTikTok(signo, previsao);
}
