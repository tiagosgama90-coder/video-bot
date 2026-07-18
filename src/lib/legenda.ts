/* eslint-disable @remotion/deterministic-randomness -- usado apenas no script Node, não no render Remotion */
import crypto from 'crypto';
import {
  CTA_DIARIO_EN,
  CTA_DIARIO_PT,
  HASHTAGS_DIARIO_EN_INSTAGRAM,
  HASHTAGS_DIARIO_EN_TIKTOK,
  HASHTAGS_DIARIO_PT_INSTAGRAM,
  HASHTAGS_DIARIO_PT_TIKTOK,
} from './legendas-marketing';
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
  (nome) => nome + ' — horóscopo de hoje ✨',
  (nome) => 'O céu deixou uma mensagem para ' + nome + ' hoje',
  (nome) => 'Se és ' + nome + ', lê isto antes de começares o dia',
  (nome) => 'A energia de hoje para ' + nome + ' 🔮',
  (nome) => 'Horóscopo de ' + nome + ' — o que os astros revelam',
  (nome) => nome + ': o que precisas de saber hoje',
  (nome) => 'Como será o dia de ' + nome + '?',
];

const HOOKS_LEGENDA_EN: Array<(nomeSigno: string) => string> = [
  (nome) => nome + ' — today\'s horoscope ✨',
  (nome) => 'Today\'s cosmic message for ' + nome,
  (nome) => 'If you\'re a ' + nome + ', read this before your day starts',
  (nome) => nome + ' energy today 🔮',
  (nome) => 'Daily horoscope for ' + nome,
  (nome) => 'What ' + nome + ' needs to hear today',
  (nome) => 'How will ' + nome + '\'s day unfold?',
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
    previsao.length > 100 ? previsao.slice(0, 97).trim() + '...' : previsao;

  return hook + '\n\n' + resumo;
}

function sufixoTikTok(signo: SignoZodiaco): string {
  const tagSigno = hashtagSigno(signo);
  if (isLocaleUS()) {
    return CTA_DIARIO_EN + '\n\n' + HASHTAGS_DIARIO_EN_TIKTOK + ' ' + tagSigno;
  }
  return CTA_DIARIO_PT + '\n\n' + HASHTAGS_DIARIO_PT_TIKTOK + ' ' + tagSigno;
}

function sufixoInstagram(signo: SignoZodiaco): string {
  const tagSigno = hashtagSigno(signo);
  if (isLocaleUS()) {
    return CTA_DIARIO_EN + '\n\n' + HASHTAGS_DIARIO_EN_INSTAGRAM + ' ' + tagSigno;
  }
  return CTA_DIARIO_PT + '\n\n' + HASHTAGS_DIARIO_PT_INSTAGRAM + ' ' + tagSigno;
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
