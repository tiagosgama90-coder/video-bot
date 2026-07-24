/* eslint-disable @remotion/deterministic-randomness -- script Node apenas */
import crypto from 'crypto';
import { isLocaleUS } from './locale';
import { obterNomeSigno, type SignoZodiaco } from './signos';
import { sanitizarTextoPublico } from './texto-publico';

type GanchoFn = (nome: string) => string;

/** Ganchos psicológicos/emocionais - retenção nos primeiros 3s do vídeo */
const GANCHOS_EMOCIONAIS_PT: GanchoFn[] = [
  (n) => n + ', o teu coração já sabia disto antes do horóscopo',
  (n) => 'Se és ' + n + ', não ignores o que sentes hoje por dentro',
  (n) => n + ': há algo que precisas de ouvir antes de adormecer',
  (n) => 'Não é coincidência teres este vídeo no feed, ' + n,
  (n) => n + ', a tensão que sentes hoje tem explicação',
  (n) => 'Para quem é ' + n + ': respira, isto é para ti',
  (n) => n + ', alguém precisava de te dizer isto hoje',
  (n) => 'Se és ' + n + ' e andas confuso, lê até ao fim',
  (n) => n + ': o teu dia pode mudar depois disto',
  (n) => 'Guarda isto, ' + n + ' - vais precisar mais tarde',
  (n) => n + ', não leves isto para a cama sem ler',
  (n) => 'Isto não é horóscopo genérico, ' + n + ' - é o teu dia',
  (n) => n + ': o que evitas sentir hoje está nos astros',
  (n) => 'Se és ' + n + ', o universo deixou-te um recado',
  (n) => n + ', para. Isto importa para ti hoje',
  (n) => 'A tua intuição estava certa, ' + n,
  (n) => n + ': 30 segundos que podem aliviar o teu dia',
  (n) => 'Nem toda a gente devia ver isto - mas ' + n + ', sim',
  (n) => n + ', és mais sensível hoje do que pensas',
  (n) => 'Se és ' + n + ', isto vai fazer-te sentido',
  (n) => n + ': o que as apps grátis não te contam',
  (n) => 'Hoje pesa-te algo, ' + n + '? Isto ajuda',
  (n) => n + ', deixa de te culpar - lê isto',
  (n) => 'Mensagem directa para ' + n + ' - não para os outros signos',
  (n) => n + ', se sentes que o dia está pesado, não estás sozinho',
  (n) => 'Antes de desistires do dia, ' + n + ', lê isto',
];

const GANCHOS_EMOCIONAIS_EN: GanchoFn[] = [
  (n) => n + ', your heart already knew this before the horoscope',
  (n) => "If you're a " + n + ", don't ignore what you feel inside today",
  (n) => n + ': you need to hear this before tonight',
  (n) => "It's not random that this showed up on your feed, " + n,
  (n) => n + ', the tension you feel today has a reason',
  (n) => 'For ' + n + ' only: breathe, this is for you',
  (n) => n + ', someone needed to tell you this today',
  (n) => "If you're " + n + ' and feeling lost, stay until the end',
  (n) => n + ': your day might shift after this',
  (n) => 'Save this, ' + n + ' - you will need it later',
  (n) => n + ", don't go to bed without reading this",
  (n) => "This isn't a generic horoscope, " + n + ' - it is your day',
  (n) => n + ': what you avoid feeling today is in the stars',
  (n) => "If you're " + n + ', the universe left you a message',
  (n) => n + ', stop. This matters for you today',
  (n) => 'Your intuition was right, ' + n,
  (n) => n + ': 30 seconds that might ease your day',
  (n) => 'Not everyone should see this - but ' + n + ', yes',
  (n) => n + ", you're more sensitive today than you think",
  (n) => "If you're " + n + ', this will click for you',
  (n) => n + ': what free apps do not tell you',
  (n) => 'Something feels heavy today, ' + n + '? This helps',
  (n) => n + ', stop blaming yourself - read this',
  (n) => 'Direct message for ' + n + ' - not the other signs',
  (n) => n + ', if today feels heavy, you are not alone',
  (n) => 'Before you give up on today, ' + n + ', read this',
];

function hashGancho(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Gancho a partir da 1.ª frase da previsão (mais pessoal e emocional) */
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

function escolherIndiceGancho(signo: SignoZodiaco, data: string, total: number): number {
  if (process.env.TESTE_LOCAL === '1') {
    return crypto.randomInt(0, total);
  }
  return hashGancho('gancho-' + signo + '-' + data) % total;
}

/**
 * Gancho de 3s no ecrã + abertura da legenda.
 * Mistura templates emocionais com gancho derivado da previsão do dia.
 */
export function escolherGanchoDiario(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): string {
  const nomeSigno = obterNomeSigno(signo);
  const dataRef = data ?? new Date().toISOString().slice(0, 10);
  const ganchos = isLocaleUS() ? GANCHOS_EMOCIONAIS_EN : GANCHOS_EMOCIONAIS_PT;

  const indice = escolherIndiceGancho(signo, dataRef, ganchos.length);
  const usarPrevisao = escolherIndiceGancho(signo, dataRef + '-prev', 5) === 0;
  if (usarPrevisao) {
    const daPrevisao = ganchoDaPrevisao(nomeSigno, previsao);
    if (daPrevisao) {
      return daPrevisao;
    }
  }

  return sanitizarTextoPublico(ganchos[indice](nomeSigno));
}
