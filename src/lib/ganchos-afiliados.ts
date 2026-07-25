/* eslint-disable @remotion/deterministic-randomness -- script Node apenas */
import crypto from 'crypto';
import { isLocaleUS } from './locale';
import { sanitizarTextoPublico } from './texto-publico';

type GanchoFn = () => string;

const GANCHOS_AFILIADOS_PT: GanchoFn[] = [
  () => 'Paraste o scroll - talvez seja porque procuras rendimento com astrologia',
  () => 'Isto não é para todos: é para quem já fala de signos e mapas astrais',
  () => 'Cinquenta por cento por venda soa a mentira até veres o link',
  () => 'Se já recomendas horóscopos, estás a deixar dinheiro na mesa',
  () => 'O universo paga quem partilha o que ama - o SidusAstro também',
  () => 'Não precisas de câmara: precisas do link certo e de partilhar',
  () => 'A tua intuição trouxe-te aqui - rendimento extra sem investir',
  () => 'Pouca gente sabe que dá para ganhar só por falar de astrologia',
  () => 'Registo grátis, comissão real - isto muda o jogo',
  () => 'Se pensaste em renda extra esta semana, escuta isto',
  () => 'Não é influencer? Melhor - afiliados ganham em silêncio',
  () => 'O que evitas tentar por medo de falhar tem resposta aqui',
  () => 'Isto parece anúncio - mas é oportunidade para quem já usa o app',
  () => 'Comenta menos, ganha mais: partilha o SidusAstro no teu nicho',
  () => 'A energia de hoje pede-te um passo - monetiza o que já sabes',
  () => 'Alguém vai ganhar com astrologia hoje - porquê não tu',
  () => 'O segredo não é viralizar - é ter o link certo',
  () => 'Se gostas do zodíaco, isto é o passo que faltava',
  () => 'Cinquenta por cento não é hype quando a venda é real',
  () => 'Fica 20 segundos - pode abrir uma porta que ignoraste',
];

const GANCHOS_AFILIADOS_EN: GanchoFn[] = [
  () => 'You stopped scrolling - maybe because you want income from astrology',
  () => 'Not for everyone: for those who already talk signs and birth charts',
  () => 'Fifty percent per sale sounds fake until you see the link',
  () => 'If you already recommend horoscope apps, you are leaving money behind',
  () => 'The universe pays those who share what they love - SidusAstro too',
  () => 'No camera needed: you need the right link and to share',
  () => 'Your intuition brought you here - extra income with no investment',
  () => 'Few know you can earn just by talking astrology',
  () => 'Free sign-up, real commission - this changes the game',
  () => 'If you thought about side income this week, listen',
  () => 'Not an influencer? Better - affiliates earn quietly',
  () => 'What you avoid trying out of fear has an answer here',
  () => 'Looks like an ad - but it is opportunity if you already use the app',
  () => 'Share SidusAstro in your niche and earn on every sale',
  () => 'Today\'s energy asks for a step - monetize what you already know',
  () => 'Someone will earn from astrology today - why not you',
  () => 'The secret is not going viral - it is the right link',
  () => 'If you love the zodiac, this was the missing step',
  () => 'Fifty percent is not hype when the sale is real',
  () => 'Stay 20 seconds - it may open a door you ignored',
];

function hashGancho(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function escolherGanchoAfiliados(data: string, contexto: string = 'afiliados'): string {
  const pool = isLocaleUS() ? GANCHOS_AFILIADOS_EN : GANCHOS_AFILIADOS_PT;
  if (process.env.TESTE_LOCAL === '1') {
    return sanitizarTextoPublico(pool[crypto.randomInt(0, pool.length)]());
  }
  const indice = hashGancho('gancho-afiliados-' + contexto + '-' + data) % pool.length;
  return sanitizarTextoPublico(pool[indice]());
}
