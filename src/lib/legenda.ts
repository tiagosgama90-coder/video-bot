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
  'Ninguém te mostra isto nas apps grátis - mapa astral completo em sidusastro.com',
  'O que o teu signo esconde está em sidusastro.com - vê antes que tires isto do feed',
  'Parece mentira, mas o teu mapa astral grátis está em sidusastro.com',
  'Eu não devia dizer-te isto, mas o resto da previsão está em sidusastro.com',
  'O segredo que falta no vídeo está no teu mapa em sidusastro.com',
  'Não pares aqui - descobre tudo no mapa astral grátis em sidusastro.com',
  'O que vais ler a seguir no site muda tudo - sidusastro.com',
  'Mapa astral grátis em sidusastro.com - o que lá está não está nas apps',
  'A verdade completa do teu dia está em sidusastro.com',
  'Última peça do puzzle: mapa astral grátis em sidusastro.com',
  'Descobre já a afinidade do teu parceiro com o teu em sidusastro.com',
  'Se a relação te consome ou a traição te ronda, o mapa em sidusastro.com esclarece',
] as const;

export const FINAL_CLOSINGS_EN = [
  'Nobody shows you this in free apps - full birth chart at sidusastro.com/en',
  'What your sign hides is at sidusastro.com/en - see it before you scroll away',
  'Sounds crazy, but your free birth chart is at sidusastro.com/en',
  "I shouldn't tell you this, but the rest is at sidusastro.com/en",
  'The missing piece of this video is on your chart at sidusastro.com/en',
  "Don't stop here - discover everything free at sidusastro.com/en",
  'What you read next on the site changes everything - sidusastro.com/en',
  'Free birth chart at sidusastro.com/en - not in the apps',
  'The full truth of your day is at sidusastro.com/en',
  'Last piece of the puzzle: free chart at sidusastro.com/en',
  'Discover your partner affinity with yours at sidusastro.com/en',
  'If the relationship drains you or betrayal haunts you, the chart at sidusastro.com/en clarifies',
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

/** Frase final de despedimento - narrada em voz e sincronizada no ecrã */
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
