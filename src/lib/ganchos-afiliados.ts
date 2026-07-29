/* eslint-disable @remotion/deterministic-randomness -- script Node apenas */
import crypto from 'crypto';
import { isLocaleUS } from './locale';
import type { GanchoComTema } from './fechos-narracao';
import { filtrarTextoParaVideo, sanitizarTextoPublico } from './texto-publico';

type GanchoFn = () => string;

const GANCHOS_AFILIADOS_PT: GanchoFn[] = [
  () => 'Você parou o scroll - talvez seja porque busca renda extra com astrologia',
  () => 'Isso não é para todo mundo: é para quem já fala de signos e mapa astral',
  () => 'Cinquenta por cento por venda parece mentira até você ver o link',
  () => 'Se você já recomenda horóscopo, está deixando dinheiro na mesa',
  () => 'O universo paga quem compartilha o que ama - o SidusAstro também',
  () => 'Não precisa de câmera: precisa do link certo e compartilhar',
  () => 'Sua intuição trouxe você aqui - renda extra sem investir',
  () => 'Pouca gente sabe que dá para ganhar só falando de astrologia',
  () => 'Cadastro grátis, comissão real - isso muda o jogo',
  () => 'Se pensou em renda extra esta semana, escuta isso',
  () => 'Não é influencer? Melhor - afiliados ganham em silêncio',
  () => 'O que você evita tentar por medo de falhar tem resposta aqui',
  () => 'Parece anúncio - mas é oportunidade para quem já usa o app',
  () => 'Compartilhe o SidusAstro no seu nicho e ganhe em cada venda',
  () => 'A energia de hoje pede um passo - monetize o que você já sabe',
  () => 'Alguém vai ganhar com astrologia hoje - por que não você',
  () => 'O segredo não é viralizar - é ter o link certo em sidusastro.com',
  () => 'Se você ama o zodíaco, esse é o passo que faltava',
  () => 'Cinquenta por cento não é hype quando a venda é real',
  () => 'Fique 20 segundos - pode abrir uma porta que você ignorou',
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
  () => "Today's energy asks for a step - monetize what you already know",
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

export function escolherGanchoAfiliadosComTema(
  data: string,
  contexto: string = 'afiliados',
): GanchoComTema {
  const pool = isLocaleUS() ? GANCHOS_AFILIADOS_EN : GANCHOS_AFILIADOS_PT;
  if (process.env.TESTE_LOCAL === '1') {
    return {
      texto: sanitizarTextoPublico(pool[crypto.randomInt(0, pool.length)]()),
      tema: 'financas',
    };
  }
  const indice = hashGancho('gancho-afiliados-' + contexto + '-' + data) % pool.length;
  return {
    texto: filtrarTextoParaVideo(pool[indice]()),
    tema: 'financas',
  };
}

export function escolherGanchoAfiliados(data: string, contexto: string = 'afiliados'): string {
  return escolherGanchoAfiliadosComTema(data, contexto).texto;
}
