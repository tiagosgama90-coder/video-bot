/* eslint-disable @remotion/deterministic-randomness -- script Node apenas */
import crypto from 'crypto';
import {
  CTA_AFILIADOS_EN,
  CTA_AFILIADOS_PT,
  CTA_COMENTARIO_INSTAGRAM_EN,
  CTA_COMENTARIO_INSTAGRAM_PT,
  CTA_MOTIVACIONAL_EN,
  CTA_MOTIVACIONAL_PT,
  CTA_VIP_EN,
  CTA_VIP_PT,
  HASHTAGS_AFILIADOS_EN_INSTAGRAM,
  HASHTAGS_AFILIADOS_EN_TIKTOK,
  HASHTAGS_AFILIADOS_PT_INSTAGRAM,
  HASHTAGS_AFILIADOS_PT_TIKTOK,
  HASHTAGS_VIP_EN_INSTAGRAM,
  HASHTAGS_VIP_EN_TIKTOK,
  HASHTAGS_VIP_PT_INSTAGRAM,
  HASHTAGS_VIP_PT_TIKTOK,
} from './legendas-marketing';
import { escolherGanchoAfiliados } from './ganchos-afiliados';
import { isLocaleUS } from './locale';
import { sanitizarTextoPublico } from './texto-publico';
import type { SignoZodiaco } from './signos';

export function hashLegenda(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function escolherItemRotativo<T>(seed: string, pool: readonly T[]): T {
  if (pool.length === 0) {
    throw new Error('Pool de legendas vazio');
  }
  if (process.env.TESTE_LOCAL === '1') {
    return pool[crypto.randomInt(0, pool.length)];
  }
  return pool[hashLegenda(seed) % pool.length];
}

const PREFIXOS_INSTAGRAM_DIARIO_PT = [
  '✨ Sua mensagem cósmica do dia\n\n',
  '✨ O céu mandou isso para você hoje\n\n',
  '✨ Previsão do dia — guarde se fizer sentido\n\n',
  '✨ Astrologia real para o seu momento\n\n',
  '✨ Se parou o scroll, era para você\n\n',
  '✨ Horóscopo do dia com mapa astral grátis\n\n',
] as const;

const PREFIXOS_INSTAGRAM_DIARIO_EN = [
  '✨ Your daily cosmic message\n\n',
  '✨ The sky sent this for you today\n\n',
  '✨ Daily forecast — save if it resonates\n\n',
  '✨ Real astrology for your moment\n\n',
  '✨ If you stopped scrolling, this is for you\n\n',
  '✨ Daily horoscope + free birth chart\n\n',
] as const;

const CTAS_CORPO_DIARIO_PT = [
  'Mapa astral, tarot e vidente grátis - link na bio (sidusastro.com)',
  'O que falta ver está no mapa natal grátis - link na bio (sidusastro.com)',
  'Sinastria, tarot e oráculo sem pagar - sidusastro.com (link na bio)',
  'Descubra ascendente e casas no mapa grátis - sidusastro.com',
  'Mapa completo + tarot ilimitado grátis - link na bio',
] as const;

const CTAS_CORPO_DIARIO_EN = [
  'The full chart is free - link in bio (sidusastro.com/en)',
  'What you still need is on your free birth chart - link in bio',
  'Synastry, tarot and oracle free - sidusastro.com/en',
  'Rising sign and houses on your free chart - link in bio',
  'Full chart + unlimited tarot free - link in bio',
] as const;

const FECHOS_LEGENDA_PT = [
  'Resposta em até 48h 👇',
  'Vagas limitadas — corre 👇',
  'Só para quem já ama o app 👇',
  'Passo a passo no link 👇',
  'Vale a pena ver até ao fim 👇',
] as const;

const FECHOS_LEGENDA_EN = [
  'Usually within 48 hours 👇',
  'Limited spots — check it 👇',
  'Only if you already love the app 👇',
  'Step by step at the link 👇',
  'Worth watching till the end 👇',
] as const;

const ABERTURAS_VIP_PT = [
  'Ok, isso é real: você pode ter Premium vitalício no SidusAstro só por compartilhar ✨',
  'Se você já ama o SidusAstro, isso pode mudar tudo ✨',
  'Premium vitalício sem pagar? Sim — só por divulgar o app ✨',
  'Pouca gente sabe disso: Premium grátis para sempre no SidusAstro ✨',
  'Isso não é sorteio — é Premium vitalício por compartilhar ✨',
  'Mapa astral + tarot + oráculo para sempre? Dá para conseguir assim ✨',
] as const;

const ABERTURAS_VIP_EN = [
  'Okay this is real: lifetime Premium on SidusAstro just by sharing ✨',
  'If you already love SidusAstro, this one hits different ✨',
  'Lifetime Premium without paying? Yes — just share the app ✨',
  'Few people know: free Premium forever on SidusAstro ✨',
  'Not a giveaway — lifetime Premium for sharing ✨',
  'Birth chart + tarot + oracle forever? You can get it this way ✨',
] as const;

const CORPOS_VIP_PT = [
  'Grave um vídeo com o mapa, tarot ou oráculo, marque @sidusastro e envie o pedido.',
  'Compartilhe um reel mostrando como usa o SidusAstro, marque @sidusastro e solicite.',
  'Mostre seu mapa ou uma tiragem, marque @sidusastro e envie em divulgacao-vip.',
  'Um vídeo curto + marcação @sidusastro = pedido de Premium vitalício.',
  'Conte sua experiência no app, marque @sidusastro e peça o Premium na página VIP.',
] as const;

const CORPOS_VIP_EN = [
  'Post a short video with your chart, tarot or oracle, tag @sidusastro and submit.',
  'Share a reel showing how you use SidusAstro, tag @sidusastro and apply.',
  'Show your chart or a reading, tag @sidusastro and submit at divulgacao-vip.',
  'One short video + @sidusastro tag = lifetime Premium request.',
  'Tell your experience with the app, tag @sidusastro and request Premium on the VIP page.',
] as const;

const ABERTURAS_AFILIADOS_PT = [
  'Se você gosta de astrologia e quer ganhar com isso, isso é para você 💸',
  'Falar de signos pode virar renda extra — sem investir 💸',
  'Quem já recomenda horóscopo pode monetizar de verdade 💸',
  'Renda extra com astrologia? O SidusAstro paga 50% por venda 💸',
  'Não precisa ser influencer para ganhar com o zodíaco 💸',
  'Se você ama mapa astral, esse programa foi feito para você 💸',
] as const;

const ABERTURAS_AFILIADOS_EN = [
  'If you love astrology and want to earn from it, this is for you 💸',
  'Talking about signs can become side income — no investment 💸',
  'If you already recommend horoscope apps, monetize for real 💸',
  'Side income with astrology? SidusAstro pays 50% per sale 💸',
  'You do not need to be an influencer to earn with the zodiac 💸',
  'If you love birth charts, this program was made for you 💸',
] as const;

const CORPOS_AFILIADOS_PT = [
  'No SidusAstro você pode levar 50% de comissão por cada venda. Cadastro grátis, link seu, compartilhe onde quiser.',
  'Programa de afiliados: metade de cada venda é sua. Sem taxas, link exclusivo, compartilhe no seu nicho.',
  'Cinquenta por cento por venda real — cadastro grátis e link só seu para divulgar.',
  'Ganhe com cada pessoa que assina pelo seu link. Astrologia + renda extra no mesmo lugar.',
  'Comissão de 50%, zero investimento inicial. Ideal para quem já fala de signos online.',
] as const;

const CORPOS_AFILIADOS_EN = [
  'At SidusAstro you get 50% commission on every sale. Free sign-up, your link, share anywhere.',
  'Affiliate program: half of every sale is yours. No fees, exclusive link, share in your niche.',
  'Fifty percent per real sale — free sign-up and your own link to promote.',
  'Earn on everyone who subscribes through your link. Astrology + side income in one place.',
  '50% commission, zero upfront cost. Perfect if you already talk zodiac online.',
] as const;

export function escolherPrefixoInstagramDiario(signo: SignoZodiaco, data: string): string {
  const pool = isLocaleUS() ? PREFIXOS_INSTAGRAM_DIARIO_EN : PREFIXOS_INSTAGRAM_DIARIO_PT;
  return escolherItemRotativo('prefixo-ig-' + signo + '-' + data, pool);
}

export function escolherCtaCorpoDiario(signo: SignoZodiaco, data: string): string {
  const pool = isLocaleUS() ? CTAS_CORPO_DIARIO_EN : CTAS_CORPO_DIARIO_PT;
  return escolherItemRotativo('cta-corpo-' + signo + '-' + data, pool);
}

export function obterLegendasVip(data: string): { tiktok: string; instagram: string } {
  const aberturas = isLocaleUS() ? ABERTURAS_VIP_EN : ABERTURAS_VIP_PT;
  const corpos = isLocaleUS() ? CORPOS_VIP_EN : CORPOS_VIP_PT;
  const fechos = isLocaleUS() ? FECHOS_LEGENDA_EN : FECHOS_LEGENDA_PT;
  const abertura = escolherItemRotativo('vip-abertura-' + data, aberturas);
  const corpo = escolherItemRotativo('vip-corpo-' + data, corpos);
  const fecho = escolherItemRotativo('vip-fecho-' + data, fechos);

  if (isLocaleUS()) {
    return {
      tiktok: sanitizarTextoPublico(
        abertura + '\n\n' + corpo + '\n\n' + fecho + '\n\n' + CTA_VIP_EN + '\n\n' + HASHTAGS_VIP_EN_TIKTOK,
      ),
      instagram: sanitizarTextoPublico(
        abertura +
          '\n\n' +
          corpo +
          '\n\n' +
          fecho +
          '\n\n' +
          CTA_COMENTARIO_INSTAGRAM_EN +
          '\n\n' +
          CTA_VIP_EN +
          '\n\n' +
          HASHTAGS_VIP_EN_INSTAGRAM,
      ),
    };
  }

  return {
    tiktok: sanitizarTextoPublico(
      abertura + '\n\n' + corpo + '\n\n' + fecho + '\n\n' + CTA_VIP_PT + '\n\n' + HASHTAGS_VIP_PT_TIKTOK,
    ),
    instagram: sanitizarTextoPublico(
      abertura +
        '\n\n' +
        corpo +
        '\n\n' +
        fecho +
        '\n\n' +
        CTA_COMENTARIO_INSTAGRAM_PT +
        '\n\n' +
        CTA_VIP_PT +
        '\n\n' +
        HASHTAGS_VIP_PT_INSTAGRAM,
    ),
  };
}

export function obterLegendasAfiliados(
  data: string,
  contexto: string = 'afiliados',
): { tiktok: string; instagram: string } {
  const aberturas = isLocaleUS() ? ABERTURAS_AFILIADOS_EN : ABERTURAS_AFILIADOS_PT;
  const corpos = isLocaleUS() ? CORPOS_AFILIADOS_EN : CORPOS_AFILIADOS_PT;
  const gancho = escolherGanchoAfiliados(data, contexto);
  const abertura = escolherItemRotativo('afiliados-abertura-' + contexto + '-' + data, aberturas);
  const corpo = escolherItemRotativo('afiliados-corpo-' + contexto + '-' + data, corpos);

  if (isLocaleUS()) {
    return {
      tiktok: sanitizarTextoPublico(
        gancho + '\n\n' + abertura + '\n\n' + corpo + '\n\n' + CTA_AFILIADOS_EN + '\n\n' + HASHTAGS_AFILIADOS_EN_TIKTOK,
      ),
      instagram: sanitizarTextoPublico(
        gancho +
          '\n\n' +
          abertura +
          '\n\n' +
          corpo +
          '\n\n' +
          CTA_COMENTARIO_INSTAGRAM_EN +
          '\n\n' +
          CTA_AFILIADOS_EN +
          '\n\n' +
          HASHTAGS_AFILIADOS_EN_INSTAGRAM,
      ),
    };
  }

  return {
    tiktok: sanitizarTextoPublico(
      gancho + '\n\n' + abertura + '\n\n' + corpo + '\n\n' + CTA_AFILIADOS_PT + '\n\n' + HASHTAGS_AFILIADOS_PT_TIKTOK,
    ),
    instagram: sanitizarTextoPublico(
      gancho +
        '\n\n' +
        abertura +
        '\n\n' +
        corpo +
        '\n\n' +
        CTA_COMENTARIO_INSTAGRAM_PT +
        '\n\n' +
        CTA_AFILIADOS_PT +
        '\n\n' +
        HASHTAGS_AFILIADOS_PT_INSTAGRAM,
    ),
  };
}

export function escolherCtaMotivacionalRotativo(data: string, variante: string): string {
  const pool = isLocaleUS()
    ? [CTA_MOTIVACIONAL_EN, '✨ Your chart has answers → sidusastro.com/en', '✨ Free tarot + birth chart → sidusastro.com/en']
    : [CTA_MOTIVACIONAL_PT, '✨ Seu mapa tem respostas → sidusastro.com', '✨ Tarot + mapa astral grátis → sidusastro.com'];
  return escolherItemRotativo('cta-motiv-' + variante + '-' + data, pool);
}
