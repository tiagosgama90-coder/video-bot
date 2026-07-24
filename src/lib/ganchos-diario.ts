/* eslint-disable @remotion/deterministic-randomness -- script Node apenas */
import crypto from 'crypto';
import { isLocaleUS } from './locale';
import { obterNomeSigno, type SignoZodiaco } from './signos';
import { sanitizarTextoPublico } from './texto-publico';

type GanchoFn = (n: string) => string;
type CategoriaGancho = 'horoscopo' | 'emocional' | 'relacionamento';

/** Horóscopo / astrologia / energia do dia — núcleo do conteúdo */
const GANCHOS_HOROSCOPO_PT: GanchoFn[] = [
  (n) => n + ', o teu horóscopo de hoje não é o que estás à espera',
  (n) => 'Se és ' + n + ', os astros têm uma mensagem só para ti hoje',
  (n) => n + ': a Lua e os planetas alinham-se a teu favor hoje',
  (n) => 'Horóscopo do dia para ' + n + ' - lê antes de saíres de casa',
  (n) => n + ', a energia cósmica de hoje bate certo com o que sentes',
  (n) => 'O teu signo ' + n + ' está em destaque nos astros hoje',
  (n) => n + ': o mapa astral revela o que este dia te reserva',
  (n) => 'Previsão diária ' + n + ' - isto muda o teu dia',
  (n) => n + ', Mercúrio e a Lua falam contigo hoje',
  (n) => 'Se és ' + n + ', o universo deixou-te o horóscopo mais directo',
  (n) => n + ': o que os planetas dizem sobre o teu dia',
  (n) => 'Astrologia do dia para ' + n + ' - não é genérico',
  (n) => n + ', os astros pedem-te atenção nas próximas horas',
  (n) => 'Hoje é dia de ' + n + ' brilhar - mas lê isto primeiro',
  (n) => n + ': a previsão que a maioria ignora e tu não devias',
];

const GANCHOS_HOROSCOPO_EN: GanchoFn[] = [
  (n) => n + ", today's horoscope is not what you expect",
  (n) => "If you're a " + n + ', the stars have a message just for you today',
  (n) => n + ': the Moon and planets align in your favor today',
  (n) => "Daily horoscope for " + n + ' - read before you leave home',
  (n) => n + ", today's cosmic energy matches what you feel",
  (n) => 'Your sign ' + n + ' is highlighted in the stars today',
  (n) => n + ': your birth chart reveals what this day holds',
  (n) => 'Daily forecast ' + n + ' - this can shift your day',
  (n) => n + ', Mercury and the Moon speak to you today',
  (n) => "If you're " + n + ', the universe left you a direct horoscope',
  (n) => n + ': what the planets say about your day',
  (n) => "Today's astrology for " + n + ' - not generic',
  (n) => n + ', the stars ask for your attention in the next hours',
  (n) => "Today is " + n + "'s day to shine - but read this first",
  (n) => n + ': the forecast most people ignore and you should not',
];

/** Emocional / psicológico — sem fugir ao tema do dia */
const GANCHOS_EMOCIONAIS_PT: GanchoFn[] = [
  (n) => n + ', o teu coração já sabia disto antes do horóscopo',
  (n) => 'Se és ' + n + ', não ignores o que sentes hoje por dentro',
  (n) => n + ': há algo que precisas de ouvir antes de adormecer',
  (n) => 'Não é coincidência teres este vídeo no feed, ' + n,
  (n) => n + ', a tensão que sentes hoje tem explicação nos astros',
  (n) => 'Para quem é ' + n + ': respira, isto é para ti',
  (n) => n + ', alguém precisava de te dizer isto hoje',
  (n) => 'Se és ' + n + ' e andas confuso, lê até ao fim',
  (n) => n + ': o teu dia pode mudar depois disto',
  (n) => 'Isto não é horóscopo genérico, ' + n + ' - é o teu dia',
  (n) => n + ': o que evitas sentir hoje está nos astros',
  (n) => 'A tua intuição estava certa, ' + n,
  (n) => n + ', és mais sensível hoje do que pensas',
  (n) => 'Mensagem directa para ' + n + ' - não para os outros signos',
  (n) => n + ': 30 segundos que podem aliviar o teu dia',
];

const GANCHOS_EMOCIONAIS_EN: GanchoFn[] = [
  (n) => n + ', your heart already knew this before the horoscope',
  (n) => "If you're a " + n + ", don't ignore what you feel inside today",
  (n) => n + ': you need to hear this before tonight',
  (n) => "It's not random that this showed up on your feed, " + n,
  (n) => n + ', the tension you feel today has a reason in the stars',
  (n) => 'For ' + n + ' only: breathe, this is for you',
  (n) => n + ', someone needed to tell you this today',
  (n) => "If you're " + n + ' and feeling lost, stay until the end',
  (n) => n + ': your day might shift after this',
  (n) => "This isn't a generic horoscope, " + n + ' - it is your day',
  (n) => n + ': what you avoid feeling today is in the stars',
  (n) => 'Your intuition was right, ' + n,
  (n) => n + ", you're more sensitive today than you think",
  (n) => 'Direct message for ' + n + ' - not the other signs',
  (n) => n + ': 30 seconds that might ease your day',
];

/**
 * Amor / relacionamento — parte do mix, não dominante.
 * Mistura atração, compatibilidade, distância e intuição (não só traição).
 */
const GANCHOS_RELACIONAMENTO_PT: GanchoFn[] = [
  (n) => n + ', o amor no teu horóscopo de hoje merece atenção',
  (n) => 'Se és ' + n + ', a energia do parceiro muda com os astros hoje',
  (n) => n + ': compatibilidade, distância ou reencontro? O teu signo responde',
  (n) => 'A tua intuição sobre o amor está certa, ' + n + ' - os astros confirmam',
  (n) => n + ', há algo no teu relacionamento que o mapa astral explica',
  (n) => 'Quem é ' + n + ' e sente o coração acelerado hoje, lê isto',
  (n) => n + ': o que Vénus diz sobre o teu amor hoje',
  (n) => 'Amor ou dúvida, ' + n + '? O horóscopo de hoje esclarece',
  (n) => n + ', alguém que amas precisa de ouvir o que os astros dizem',
  (n) => 'Se és ' + n + ' e o parceiro está distante, isto não é acaso',
  (n) => n + ': o coração e os astros falam a mesma língua hoje',
  (n) => 'Relacionamento em foco para ' + n + ' - previsão do dia',
  (n) => n + ', cuidado com o que o silêncio dele ou dela esconde hoje',
  (n) => 'Para ' + n + ': o que evitas sentir no amor está no horóscopo',
  (n) => n + ', a Lua revela segredos do teu coração hoje',
];

const GANCHOS_RELACIONAMENTO_EN: GanchoFn[] = [
  (n) => n + ', love in your horoscope today deserves attention',
  (n) => "If you're a " + n + ", your partner's energy shifts with the stars today",
  (n) => n + ': compatibility, distance or reunion? Your sign answers',
  (n) => 'Your intuition about love is right, ' + n + ' - the stars confirm',
  (n) => n + ', something in your relationship the birth chart explains',
  (n) => "If you're " + n + ' and your heart races today, read this',
  (n) => n + ': what Venus says about your love today',
  (n) => 'Love or doubt, ' + n + "? today's horoscope clarifies",
  (n) => n + ', someone you love needs to hear what the stars say',
  (n) => "If you're " + n + ' and your partner feels distant, this is not random',
  (n) => n + ': heart and stars speak the same language today',
  (n) => 'Relationship in focus for ' + n + ' - daily forecast',
  (n) => n + ', watch what their silence might hide today',
  (n) => 'For ' + n + ': what you avoid feeling in love is in the horoscope',
  (n) => n + ', the Moon reveals secrets of your heart today',
];

const PESOS_CATEGORIA: Record<CategoriaGancho, number> = {
  horoscopo: 45,
  emocional: 35,
  relacionamento: 20,
};

function hashGancho(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function escolherIndiceGancho(signo: SignoZodiaco, data: string, total: number): number {
  if (process.env.TESTE_LOCAL === '1') {
    return crypto.randomInt(0, total);
  }
  return hashGancho('gancho-' + signo + '-' + data) % total;
}

function escolherCategoria(signo: SignoZodiaco, data: string): CategoriaGancho {
  const roll = escolherIndiceGancho(signo, data + '-cat', 100);
  if (roll < PESOS_CATEGORIA.horoscopo) {
    return 'horoscopo';
  }
  if (roll < PESOS_CATEGORIA.horoscopo + PESOS_CATEGORIA.emocional) {
    return 'emocional';
  }
  return 'relacionamento';
}

function poolPorCategoria(categoria: CategoriaGancho): GanchoFn[] {
  const pt = {
    horoscopo: GANCHOS_HOROSCOPO_PT,
    emocional: GANCHOS_EMOCIONAIS_PT,
    relacionamento: GANCHOS_RELACIONAMENTO_PT,
  };
  const en = {
    horoscopo: GANCHOS_HOROSCOPO_EN,
    emocional: GANCHOS_EMOCIONAIS_EN,
    relacionamento: GANCHOS_RELACIONAMENTO_EN,
  };
  return isLocaleUS() ? en[categoria] : pt[categoria];
}

/** Gancho derivado da 1.ª frase da previsão do dia — liga gancho ao horóscopo real */
function ganchoDaPrevisao(nomeSigno: string, previsao: string): string | null {
  const limpa = sanitizarTextoPublico(previsao);
  const primeira = limpa.split(/[.!?]/)[0]?.trim();
  if (!primeira || primeira.length < 14 || primeira.length > 78) {
    return null;
  }
  if (/^(hoje|today|os astros|the stars|para ti|for you)/i.test(primeira)) {
    return null;
  }
  const frase =
    primeira.charAt(0).toLowerCase() === primeira.charAt(0)
      ? primeira
      : primeira.charAt(0).toLowerCase() + primeira.slice(1);
  return sanitizarTextoPublico(nomeSigno + ', ' + frase);
}

/**
 * Gancho narrado + overlay.
 * Mix: 45% horóscopo/astrologia, 35% emocional, 20% amor/relacionamento.
 * 12% chance de gancho derivado da previsão real do dia.
 */
export function escolherGanchoDiario(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): string {
  const nomeSigno = obterNomeSigno(signo);
  const dataRef = data ?? new Date().toISOString().slice(0, 10);

  const usarPrevisao = escolherIndiceGancho(signo, dataRef + '-prev', 100) < 12;
  if (usarPrevisao) {
    const daPrevisao = ganchoDaPrevisao(nomeSigno, previsao);
    if (daPrevisao) {
      return daPrevisao;
    }
  }

  const categoria = escolherCategoria(signo, dataRef);
  const ganchos = poolPorCategoria(categoria);
  const indice = escolherIndiceGancho(signo, dataRef + '-' + categoria, ganchos.length);
  return sanitizarTextoPublico(ganchos[indice](nomeSigno));
}
