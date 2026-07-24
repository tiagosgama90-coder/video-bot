/* eslint-disable @remotion/deterministic-randomness -- script Node apenas */
import crypto from 'crypto';
import { isLocaleUS } from './locale';
import { obterNomeSigno, type SignoZodiaco } from './signos';
import { sanitizarTextoPublico } from './texto-publico';

type GanchoFn = (n: string) => string;

/**
 * Ganchos psicológicos PT-PT — como se soubesses o que a pessoa pensa.
 * Cada um liga ao horóscopo / astros / energia do dia.
 */
const GANCHOS_PSICOLOGIA_PT: GanchoFn[] = [
  (n) => 'Ninguém te diz isto, mas eu vou-te contar, ' + n + ': o que sentes hoje tem explicação nos astros',
  (n) => 'Parece mentira, ' + n + ', mas o que vais saber agora muda o teu dia',
  (n) => 'Eu não devia estar a contar-te isto, ' + n + ', mas o teu horóscopo obriga-me',
  (n) => 'O segredo que as apps de horóscopo escondem de ti, ' + n + ', está aqui',
  (n) => 'Não sei bem como te dizer isto, ' + n + ', mas a verdade está no teu signo hoje',
  (n) => n + ', isto vai parecer que leio a tua mente - e é o horóscopo que explica',
  (n) => 'Algo em ti já sabe a resposta, ' + n + ' - deixa os astros confirmar',
  (n) => 'Se és ' + n + ', não é paranoia: a energia de hoje bate certo com o que pensas',
  (n) => n + ', ninguém fala disto em voz alta, mas o teu coração já sabe',
  (n) => 'Vais achar que exagero, ' + n + ', mas o que os planetas dizem hoje é directo',
  (n) => 'Prepara-te, ' + n + ': isto descreve exactamente o que tens na cabeça',
  (n) => n + ', a sensação estranha que tens hoje não é coincidência',
  (n) => 'Não ignores isto, ' + n + ' - é como se o universo soubesse o teu nome',
  (n) => 'Se és ' + n + ' e sentes que algo não encaixa, lê até ao fim',
  (n) => n + ': o que evitas pensar é o que o horóscopo traz à superfície',
  (n) => 'Isto não devia aparecer no teu feed por acaso, ' + n,
  (n) => n + ', a tua intuição grita e os astros só confirmam',
  (n) => 'Pouca gente percebe isto, ' + n + ', mas o teu signo explica tudo hoje',
  (n) => 'Respira, ' + n + ' - o que vais ouvir parece feito à tua medida',
  (n) => n + ', se andas a repetir a mesma cena na cabeça, não estás sozinho',
  (n) => 'Ninguém te preparou para o que ' + n + ' sente hoje - eu preparo',
  (n) => 'Parece que invado a tua privacidade, ' + n + ', mas é o horóscopo a falar',
  (n) => n + ': o silêncio que te incomoda tem nome nos astros',
  (n) => 'Se és ' + n + ', o que pensas à noite finalmente faz sentido',
  (n) => n + ', não é o primeiro vídeo que vês - mas pode ser o que precisavas',
  (n) => 'A verdade que ninguém te conta sobre ' + n + ' está na previsão de hoje',
  (n) => n + ', o que te tira o sono hoje aparece no teu mapa astral',
  (n) => 'Confessa, ' + n + ': já sentiste que o dia ia ser diferente',
  (n) => n + ': parece que te conheço, mas são os astros a ser precisos',
  (n) => 'Último aviso, ' + n + ' - depois disto o teu dia não se vê igual',
];

const GANCHOS_PSICOLOGIA_EN: GanchoFn[] = [
  (n) => "Nobody tells you this, but I will, " + n + ': what you feel today is in the stars',
  (n) => 'Sounds crazy, ' + n + ', but what you hear now changes your day',
  (n) => "I shouldn't be telling you this, " + n + ', but your horoscope makes me',
  (n) => 'The secret free horoscope apps hide from you, ' + n + ', is right here',
  (n) => "I don't know how to say this, " + n + ', but the truth is in your sign today',
  (n) => n + ', this will feel like I read your mind - the horoscope explains it',
  (n) => 'Something in you already knows, ' + n + ' - let the stars confirm',
  (n) => "If you're " + n + ", it's not paranoia: today's energy matches your thoughts",
  (n) => n + ', nobody says this out loud, but your heart already knows',
  (n) => 'You will think I exaggerate, ' + n + ', but the planets are direct today',
  (n) => 'Get ready, ' + n + ': this describes exactly what is on your mind',
  (n) => n + ', that strange feeling today is not random',
  (n) => "Don't ignore this, " + n + ' - it is like the universe knows your name',
  (n) => "If you're " + n + ' and something feels off, stay until the end',
  (n) => n + ': what you avoid thinking is what the horoscope surfaces',
  (n) => "This shouldn't land on your feed by accident, " + n,
  (n) => n + ', your intuition screams and the stars only confirm',
  (n) => 'Few people get this, ' + n + ', but your sign explains everything today',
  (n) => 'Breathe, ' + n + ' - what you hear feels tailor-made for you',
  (n) => n + ', if you keep replaying the same scene in your head, you are not alone',
  (n) => 'Nobody prepared you for what ' + n + ' feels today - I will',
  (n) => 'Feels invasive, ' + n + ', but it is the horoscope speaking',
  (n) => n + ': the silence that bothers you has a name in the stars',
  (n) => "If you're " + n + ', what keeps you up at night finally makes sense',
  (n) => n + ', not your first video - but maybe the one you needed',
  (n) => 'The truth nobody tells ' + n + ' is in today\'s forecast',
  (n) => n + ', what steals your sleep tonight shows in your birth chart',
  (n) => 'Admit it, ' + n + ': you already felt today would be different',
  (n) => n + ': feels personal, but the stars are just precise',
  (n) => 'Last warning, ' + n + ' - after this your day will not look the same',
];

/** Horóscopo directo — complemento (~15%) */
const GANCHOS_HOROSCOPO_PT: GanchoFn[] = [
  (n) => n + ', o teu horóscopo de hoje não é o que estás à espera',
  (n) => 'Previsão do dia para ' + n + ' - os astros não mentem',
  (n) => n + ': Lua e planetas alinhados - lê a mensagem de hoje',
  (n) => 'Horóscopo ' + n + ' - isto é para ti e só para ti',
  (n) => n + ', a energia cósmica de hoje explica o teu estado de espírito',
];

const GANCHOS_HOROSCOPO_EN: GanchoFn[] = [
  (n) => n + ", today's horoscope is not what you expect",
  (n) => 'Daily forecast for ' + n + ' - the stars do not lie',
  (n) => n + ': Moon and planets aligned - read today\'s message',
  (n) => 'Horoscope ' + n + ' - this is for you and only you',
  (n) => n + ", today's cosmic energy explains your mood",
];

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

function ganchoDaPrevisao(nomeSigno: string, previsao: string): string | null {
  const limpa = sanitizarTextoPublico(previsao);
  const primeira = limpa.split(/[.!?]/)[0]?.trim();
  if (!primeira || primeira.length < 14 || primeira.length > 78) {
    return null;
  }
  const prefixo = 'Não sei bem como te dizer isto, ' + nomeSigno + ', mas ';
  const frase =
    primeira.charAt(0).toLowerCase() === primeira.charAt(0)
      ? primeira
      : primeira.charAt(0).toLowerCase() + primeira.slice(1);
  return sanitizarTextoPublico(prefixo + frase);
}

/**
 * Gancho narrado — psicologia + horóscopo (PT-PT).
 * 85% mind-reading emocional | 15% horóscopo directo | 12% derivado da previsão real.
 */
export function escolherGanchoDiario(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): string {
  const nomeSigno = obterNomeSigno(signo);
  const dataRef = data ?? new Date().toISOString().slice(0, 10);

  if (escolherIndiceGancho(signo, dataRef + '-prev', 100) < 12) {
    const daPrevisao = ganchoDaPrevisao(nomeSigno, previsao);
    if (daPrevisao) {
      return daPrevisao;
    }
  }

  const psico = isLocaleUS() ? GANCHOS_PSICOLOGIA_EN : GANCHOS_PSICOLOGIA_PT;
  const horo = isLocaleUS() ? GANCHOS_HOROSCOPO_EN : GANCHOS_HOROSCOPO_PT;
  const usarHoroscopo = escolherIndiceGancho(signo, dataRef + '-horo', 100) < 15;
  const pool = usarHoroscopo ? horo : psico;
  const sufixo = usarHoroscopo ? 'horo' : 'psico';
  const indice = escolherIndiceGancho(signo, dataRef + '-' + sufixo, pool.length);
  return sanitizarTextoPublico(pool[indice](nomeSigno));
}
