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
import { escolherGanchoDiario } from './ganchos-diario';
import { isLocaleUS } from './locale';
import { obterNomeSigno, type SignoZodiaco } from './signos';
import { sanitizarTextoPublico } from './texto-publico';

export const FINAL_CLOSINGS = [
  'Mapa astral grátis → sidusastro.com',
  'Vê o teu mapa → sidusastro.com',
  'Detalhes do teu dia → sidusastro.com',
] as const;

export const FINAL_CLOSINGS_EN = [
  'Free birth chart → sidusastro.com/en',
  'Your full chart → sidusastro.com/en',
  'More today → sidusastro.com/en',
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
    ? 'Free birth chart in bio link'
    : 'Mapa astral grátis no link da bio';
  return sanitizarTextoPublico(hook + '\n\n' + resumo + '\n\n' + linhaCta);
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
    gerarCorpoLegenda(previsao, hook) + '\n\n' + sufixoInstagram(signo),
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
    instagram: sanitizarTextoPublico(corpo + '\n\n' + sufixoInstagram(signo)),
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
