/* eslint-disable @remotion/deterministic-randomness -- usado apenas no script Node, não no render Remotion */
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
import { escolherGanchoNarracao } from './ganchos-diario';
import { ehGanchoViralLongo } from './ganchos-virais';
import type { TemaNarracao } from './fechos-narracao';
import { isLocaleUS } from './locale';
import { obterNomeSigno, type SignoZodiaco } from './signos';
import { sanitizarTextoPublico } from './texto-publico';

export { escolherFechoNarracao, escolherFechoVoz, escolherFechoEcra, type TemaNarracao } from './fechos-narracao';

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
    : 'Mapa astral, tarot e vidente grátis - link na bio (sidusastro.com)';
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
    : '🚨 URGENTE - leia a legenda completa!\n\n';
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

/** Legenda TikTok - gancho emocional + previsão + CTA */
export function gerarLegendaTikTok(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): string {
  const { texto: hook } = escolherGanchoNarracao(signo, previsao, data);
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
  const { texto: hook } = escolherGanchoNarracao(signo, previsao, data);
  return sanitizarTextoPublico(
    gerarCorpoLegenda(previsao, hook) + '\n\n' + sufixoInstagram(signo, hook),
  );
}

/** Gera ambas as legendas: gancho do vídeo (narração) + corpo; caption pode ter extra viral */
export function gerarLegendas(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): { tiktok: string; instagram: string; hook: string; tema: TemaNarracao } {
  const { texto: hook, tema } = escolherGanchoNarracao(signo, previsao, data);
  const corpo = gerarCorpoLegenda(previsao, hook);
  return {
    hook,
    tema,
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
