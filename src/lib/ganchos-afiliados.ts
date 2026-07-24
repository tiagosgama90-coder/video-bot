/* eslint-disable @remotion/deterministic-randomness -- script Node apenas */
import crypto from 'crypto';
import { isLocaleUS } from './locale';
import { sanitizarTextoPublico } from './texto-publico';

type GanchoFn = () => string;

/** Ganchos psicológicos — curiosidade + rendimento + astrologia (PT-PT) */
const GANCHOS_AFILIADOS_PT: GanchoFn[] = [
  () => 'Ninguém te conta isto, mas podes ganhar com astrologia sem aparecer em vídeo',
  () => 'Parece mentira, mas há gente a levar comissões só por partilhar o SidusAstro',
  () => 'Eu não devia revelar isto, mas cinquenta por cento por venda é real',
  () => 'O segredo que os programas de afiliados escondem está no link certo',
  () => 'Se gostas de signos, isto vai parecer que leio a tua mente',
  () => 'Não ignores isto — o universo também recompensa quem partilha o que ama',
  () => 'Pouca gente percebe: podes monetizar a tua paixão pelo zodíaco hoje',
  () => 'Respira — o que vais ouvir muda a forma como vês rendimento extra',
  () => 'Isto não apareceu no teu feed por acaso — talvez seja o sinal que pedias',
  () => 'A verdade que ninguém diz sobre ganhar com astrologia está aqui',
  () => 'Se já recomendas apps de horóscopo, estás a perder dinheiro',
  () => 'Prepara-te: isto é mais simples do que imaginas e paga cinquenta por cento',
  () => 'Não é paranoia — muita gente já ganha em silêncio com afiliados',
  () => 'O que evitas pensar sobre renda extra tem solução no SidusAstro',
  () => 'Último aviso — depois disto vais ver o teu perfil de outra forma',
  () => 'Confessa: já pensaste em ganhar com o que gostas de falar',
  () => 'Ninguém te preparou para isto — mas o programa de afiliados sim',
  () => 'Parece invasivo, mas sei que procuras algo além do salário',
  () => 'Se andas a repetir que precisas de renda extra, escuta isto',
  () => 'O silêncio sobre comissões de cinquenta por cento acaba agora',
  () => 'Não precisas de ser influencer — precisas do link certo',
  () => 'Algo em ti já sabe que astrologia vende — falta só o passo seguinte',
  () => 'Vais achar que exagero, mas o registo é grátis e a comissão não',
  () => 'Isto não é para todos — é para quem já fala de Lua, signos e mapas',
  () => 'A tua intuição grita rendimento — os astros só confirmam o timing',
];

const GANCHOS_AFILIADOS_EN: GanchoFn[] = [
  () => 'Nobody tells you this, but you can earn from astrology without going on camera',
  () => 'Sounds crazy, but people already earn commissions just sharing SidusAstro',
  () => "I shouldn't reveal this, but fifty percent per sale is real",
  () => 'The secret affiliate programs hide is the right link',
  () => 'If you love zodiac talk, this will feel like I read your mind',
  () => "Don't ignore this — the universe rewards those who share what they love",
  () => 'Few people get it: you can monetize your passion for the stars today',
  () => 'Breathe — what you hear changes how you see extra income',
  () => 'This did not land on your feed by accident — maybe it is the sign you asked for',
  () => 'The truth nobody says about earning from astrology is right here',
  () => 'If you already recommend horoscope apps, you are leaving money on the table',
  () => 'Get ready: this is simpler than you think and pays fifty percent',
  () => 'It is not paranoia — many already earn quietly as affiliates',
  () => 'What you avoid thinking about side income has an answer at SidusAstro',
  () => 'Last warning — after this you will see your profile differently',
  () => 'Admit it: you already thought about earning from what you love to talk about',
  () => 'Nobody prepared you for this — but the affiliate program did',
  () => 'Feels invasive, but I know you want something beyond your paycheck',
  () => 'If you keep replaying that you need extra income, listen to this',
  () => 'The silence about fifty percent commissions ends now',
  () => 'You do not need to be an influencer — you need the right link',
  () => 'Something in you already knows astrology sells — you just need the next step',
  () => 'You will think I exaggerate, but sign-up is free and the commission is not',
  () => 'This is not for everyone — it is for those who already talk Moon, signs and charts',
  () => 'Your intuition screams income — the stars only confirm the timing',
];

function hashGancho(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Gancho narrado + overlay — um por data (ter/sáb/quarta). */
export function escolherGanchoAfiliados(data: string, contexto: string = 'afiliados'): string {
  const pool = isLocaleUS() ? GANCHOS_AFILIADOS_EN : GANCHOS_AFILIADOS_PT;
  if (process.env.TESTE_LOCAL === '1') {
    return sanitizarTextoPublico(pool[crypto.randomInt(0, pool.length)]());
  }
  const indice = hashGancho('gancho-afiliados-' + contexto + '-' + data) % pool.length;
  return sanitizarTextoPublico(pool[indice]());
}
