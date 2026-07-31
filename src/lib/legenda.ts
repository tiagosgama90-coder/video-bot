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
import { escolherGanchoNarracao, escolherGanchoLegendaTikTok } from './ganchos-diario';
import { escolherGanchoViral } from './ganchos-virais';
import {
  escolherCtaCorpoDiario,
  escolherPrefixoInstagramDiario,
} from './legendas-rotativas';
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

function gerarCorpoLegenda(previsao: string, hook: string, signo: SignoZodiaco, data?: string): string {
  const limpa = sanitizarTextoPublico(previsao);
  const resumo = limpa.length > 95 ? limpa.slice(0, 92).trim() + '...' : limpa;
  const linhaCta = escolherCtaCorpoDiario(signo, data ?? new Date().toISOString().slice(0, 10));
  return sanitizarTextoPublico(hook + '\n\n' + resumo + '\n\n' + linhaCta);
}

function sufixoTikTok(signo: SignoZodiaco): string {
  const tagSigno = hashtagSigno(signo);
  if (isLocaleUS()) {
    return CTA_DIARIO_EN + '\n\n' + HASHTAGS_DIARIO_EN_TIKTOK + ' ' + tagSigno;
  }
  return CTA_DIARIO_PT + '\n\n' + HASHTAGS_DIARIO_PT_TIKTOK + ' ' + tagSigno;
}

function prefixoInstagramProfissional(signo: SignoZodiaco, data?: string): string {
  return escolherPrefixoInstagramDiario(signo, data ?? new Date().toISOString().slice(0, 10));
}

function sufixoInstagram(signo: SignoZodiaco, data?: string): string {
  const tagSigno = hashtagSigno(signo);
  if (isLocaleUS()) {
    return (
      prefixoInstagramProfissional(signo, data) +
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
    prefixoInstagramProfissional(signo, data) +
    CTA_DIARIO_PT +
    '\n\n' +
    CTA_COMENTARIO_INSTAGRAM_PT +
    '\n\n' +
    HASHTAGS_DIARIO_PT_INSTAGRAM +
    ' ' +
    tagSigno
  );
}

/** Legenda TikTok - gancho próprio + previsão + CTA (diferente da narração) */
export function gerarLegendaTikTok(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): string {
  const dataRef = data ?? new Date().toISOString().slice(0, 10);
  const hook = escolherGanchoLegendaTikTok(signo, previsao, dataRef);
  return sanitizarTextoPublico(
    gerarCorpoLegenda(previsao, hook, signo, dataRef) + '\n\n' + sufixoTikTok(signo),
  );
}

/** Legenda Instagram - gancho viral + previsão + CTA rotativo */
export function gerarLegendaInstagram(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): string {
  const dataRef = data ?? new Date().toISOString().slice(0, 10);
  const hook = escolherGanchoViral(signo, dataRef);
  return sanitizarTextoPublico(
    gerarCorpoLegenda(previsao, hook, signo, dataRef) + '\n\n' + sufixoInstagram(signo, dataRef),
  );
}

/** Gera ambas as legendas: gancho do vídeo (narração) + legendas distintas por plataforma */
export function gerarLegendas(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): { tiktok: string; instagram: string; hook: string; tema: TemaNarracao } {
  const dataRef = data ?? new Date().toISOString().slice(0, 10);
  const { texto: hook, tema } = escolherGanchoNarracao(signo, previsao, dataRef);
  const hookTiktok = escolherGanchoLegendaTikTok(signo, previsao, dataRef);
  const hookInstagram = escolherGanchoViral(signo, dataRef);
  return {
    hook,
    tema,
    tiktok: sanitizarTextoPublico(
      gerarCorpoLegenda(previsao, hookTiktok, signo, dataRef) + '\n\n' + sufixoTikTok(signo),
    ),
    instagram: sanitizarTextoPublico(
      gerarCorpoLegenda(previsao, hookInstagram, signo, dataRef) +
        '\n\n' +
        sufixoInstagram(signo, dataRef),
    ),
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
