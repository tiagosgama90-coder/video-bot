/* eslint-disable @remotion/deterministic-randomness -- usado apenas no script Node, não no render Remotion */
import crypto from 'crypto';
import {
  CTA_COMENTARIO_INSTAGRAM_EN,
  CTA_COMENTARIO_INSTAGRAM_PT,
  CTA_DIARIO_EN,
  CTA_DIARIO_PT,
  HASHTAGS_DIARIO_EN_INSTAGRAM,
  HASHTAGS_DIARIO_EN_TIKTOK,
  HASHTAGS_DIARIO_PT_INSTAGRAM,
  HASHTAGS_DIARIO_PT_TIKTOK,
} from './legendas-marketing';
import { escolherGanchoDiario } from './ganchos-diario';
import { ehGanchoViralLongo } from './ganchos-virais';
import { isLocaleUS } from './locale';
import { obterNomeSigno, type SignoZodiaco } from './signos';
import { sanitizarTextoPublico } from './texto-publico';

export const FINAL_CLOSINGS = [
  'Visite o SidusAstro — mapa astral completo grátis em sidusastro.com',
  'Descubra tudo no SidusAstro — o teu mapa astral grátis espera-te',
  'SidusAstro — previsões que as apps grátis não mostram. sidusastro.com',
  'O teu mapa astral completo está no SidusAstro — visita sidusastro.com',
  'Não pares aqui — visita o SidusAstro e vê o que falta no teu dia',
  'Mapa astral grátis no SidusAstro — sidusastro.com',
  'Visite o SidusAstro e descubra o que os astros reservam para ti',
  'Tudo o que precisas está no SidusAstro — sidusastro.com',
  'SidusAstro — astrologia séria, mapa astral grátis, link na bio',
  'Visite sidusastro.com — o SidusAstro revela o que este vídeo não conta',
] as const;

export const FINAL_CLOSINGS_EN = [
  'Visit SidusAstro — free full birth chart at sidusastro.com/en',
  'Discover everything at SidusAstro — your free chart is waiting',
  'SidusAstro — insights free apps never show. sidusastro.com/en',
  'Your full birth chart is on SidusAstro — visit sidusastro.com/en',
  "Don't stop here — visit SidusAstro and see what's missing today",
  'Free birth chart at SidusAstro — sidusastro.com/en',
  'Visit SidusAstro and discover what the stars hold for you',
  'Everything you need is on SidusAstro — sidusastro.com/en',
  'SidusAstro — serious astrology, free chart, link in bio',
  'Visit sidusastro.com/en — SidusAstro reveals what this video cannot',
] as const;

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

function gerarCorpoLegenda(previsao: string, hook: string): string {
  const limpa = sanitizarTextoPublico(previsao);
  const resumo = limpa.length > 95 ? limpa.slice(0, 92).trim() + '...' : limpa;
  const linhaCta = isLocaleUS()
    ? 'The full chart is free - link in bio (sidusastro.com/en)'
    : 'Mapa astral completo grátis - link na bio (sidusastro.com)';
  return sanitizarTextoPublico(hook + '\n\n' + resumo + '\n\n' + linhaCta);
}

function sufixoTikTok(signo: SignoZodiaco): string {
  const tagSigno = hashtagSigno(signo);
  if (isLocaleUS()) {
    return CTA_DIARIO_EN + '\n\n' + HASHTAGS_DIARIO_EN_TIKTOK + ' ' + tagSigno;
  }
  return CTA_DIARIO_PT + '\n\n' + HASHTAGS_DIARIO_PT_TIKTOK + ' ' + tagSigno;
}

function prefixoUrgenciaInstagram(hook: string): string {
  if (!ehGanchoViralLongo(hook)) {
    return '';
  }
  return isLocaleUS()
    ? '🚨 URGENT - read the full caption!\n\n'
    : '🚨 URGENTE - lê a legenda completa!\n\n';
}

function sufixoInstagram(signo: SignoZodiaco, hook: string): string {
  const tagSigno = hashtagSigno(signo);
  const urgencia = prefixoUrgenciaInstagram(hook);
  if (isLocaleUS()) {
    return (
      urgencia +
      CTA_DIARIO_EN +
      '\n\n' +
      CTA_COMENTARIO_INSTAGRAM_EN +
      '\n\n' +
      HASHTAGS_DIARIO_EN_INSTAGRAM +
      ' ' +
      tagSigno
    );
  }
  return (
    urgencia +
    CTA_DIARIO_PT +
    '\n\n' +
    CTA_COMENTARIO_INSTAGRAM_PT +
    '\n\n' +
    HASHTAGS_DIARIO_PT_INSTAGRAM +
    ' ' +
    tagSigno
  );
}

/** Frase final no ecrã (não narrada) */
export function escolherFechoNarracao(): string {
  const fechos = isLocaleUS() ? FINAL_CLOSINGS_EN : FINAL_CLOSINGS;
  const indice = crypto.randomInt(0, fechos.length);
  return sanitizarTextoPublico(fechos[indice]);
}

/** Legenda TikTok - gancho emocional + previsão + CTA */
export function gerarLegendaTikTok(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): string {
  const hook = escolherGanchoDiario(signo, previsao, data);
  return sanitizarTextoPublico(
    gerarCorpoLegenda(previsao, hook) + '\n\n' + sufixoTikTok(signo),
  );
}

/** Legenda Instagram - gancho emocional + previsão + CTA */
export function gerarLegendaInstagram(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): string {
  const hook = escolherGanchoDiario(signo, previsao, data);
  return sanitizarTextoPublico(
    gerarCorpoLegenda(previsao, hook) + '\n\n' + sufixoInstagram(signo, hook),
  );
}

/** Gera ambas as legendas com o mesmo gancho (overlay 3s + Buffer) */
export function gerarLegendas(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): { tiktok: string; instagram: string; hook: string } {
  const hook = escolherGanchoDiario(signo, previsao, data);
  const corpo = gerarCorpoLegenda(previsao, hook);
  return {
    hook,
    tiktok: sanitizarTextoPublico(corpo + '\n\n' + sufixoTikTok(signo)),
    instagram: sanitizarTextoPublico(corpo + '\n\n' + sufixoInstagram(signo, hook)),
  };
}

/** Escolhe legenda conforme a plataforma Buffer */
export function gerarLegendaParaCanal(
  service: string,
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): string {
  if (service.toLowerCase() === 'instagram') {
    return gerarLegendaInstagram(signo, previsao, data);
  }
  return gerarLegendaTikTok(signo, previsao, data);
}

/** @deprecated usar gerarLegendaTikTok */
export function gerarLegenda(signo: SignoZodiaco, previsao: string): string {
  return gerarLegendaTikTok(signo, previsao);
}
