/* eslint-disable @remotion/deterministic-randomness -- script Node apenas */
import crypto from 'crypto';
import { isLocaleUS } from './locale';
import { obterNomeSigno, type SignoZodiaco } from './signos';
import { escolherGanchoViral } from './ganchos-virais';
import { sanitizarTextoPublico } from './texto-publico';

type GanchoFn = (n: string) => string;

/**
 * Ganchos PT-PT - curiosidade, leitura emocional, ligação directa ao dia.
 * Curtos, específicos, sem fórmulas repetidas.
 */
const GANCHOS_PSICOLOGIA_PT: GanchoFn[] = [
  (n) => n + ', paraste o scroll por um motivo - em 20 segundos percebes qual',
  (n) => 'Algo em ti já sabe o que vou dizer, ' + n + ' - os astros só confirmam',
  (n) => n + ': a sensação estranha de hoje tem nome no teu horóscopo',
  (n) => 'Se és ' + n + ', isto vai bater certo com o que pensaste ao acordar',
  (n) => n + ', alguém perto de ti não está a ser totalmente honesto - lê isto',
  (n) => 'Não era suposto veres isto hoje, ' + n + ', mas a Lua insistiu',
  (n) => n + ': o que evitas sentir é exactamente o que o dia traz à tona',
  (n) => 'Pouca gente fala disto em voz alta, ' + n + ' - o teu signo sim',
  (n) => n + ', o silêncio que te pesa hoje não é coincidência',
  (n) => 'Respira, ' + n + ' - o que vem a seguir parece escrito para ti',
  (n) => n + ': se repetiste a mesma cena na cabeça, não estás sozinho',
  (n) => 'O universo deixou isto no teu feed por um motivo, ' + n,
  (n) => n + ', a tua intuição grita - o horóscopo traduz',
  (n) => 'Se és ' + n + ' e sentes que algo não encaixa, fica até ao fim',
  (n) => n + ': o que te tira o sono esta noite aparece nos astros',
  (n) => 'Confessa, ' + n + ' - já sentiste que hoje seria diferente',
  (n) => n + ', parece que leio a tua mente, mas é o mapa de hoje',
  (n) => 'Último aviso, ' + n + ': depois disto o dia não se vê igual',
  (n) => n + ': há uma decisão que adias - o céu fala disso agora',
  (n) => 'Se és ' + n + ', o que sentes no peito hoje faz sentido',
  (n) => n + ', alguém vai surpreender-te hoje - os planetas já sabem',
  (n) => 'Isto não é coincidência, ' + n + ' - é energia do teu signo',
  (n) => n + ': o que pensas e não dizes em voz alta está aqui',
  (n) => 'Prepara-te, ' + n + ' - a mensagem de hoje é directa',
  (n) => n + ', o teu coração já sabe; deixa o horóscopo confirmar',
  (n) => 'Ninguém te preparou para o que ' + n + ' sente hoje - eu preparo',
  (n) => n + ': a resposta que procuras está no teu signo, não no Google',
  (n) => 'Se és ' + n + ', o que te bloqueia tem solução nos astros',
  (n) => n + ', hoje o universo pede-te coragem - lê porquê',
  (n) => 'Parece invasivo, ' + n + ', mas o teu horóscopo é preciso hoje',
  (n) => n + ': o que te distrai de ti mesmo aparece na previsão',
  (n) => 'Não ignores o sinal, ' + n + ' - é pequeno mas real',
  (n) => n + ', a pessoa em quem pensaste agora aparece nos astros',
  (n) => 'Se és ' + n + ', o medo de hoje tem explicação cósmica',
  (n) => n + ': o que te faz hesitar é o que o dia quer resolver',
  (n) => 'Isto vai parecer demasiado pessoal, ' + n + ' - e é',
  (n) => n + ', a calma que finges hoje não engana os planetas',
  (n) => 'O que ninguém te diz sobre ' + n + ' está na previsão de hoje',
  (n) => n + ': se sentes que o tempo aperta, os astros concordam',
  (n) => 'Fica mais 20 segundos, ' + n + ' - vale a pena',
];

const GANCHOS_PSICOLOGIA_EN: GanchoFn[] = [
  (n) => n + ', you stopped scrolling for a reason - in 20 seconds you will know why',
  (n) => 'Something in you already knows what I will say, ' + n + ' - the stars just confirm',
  (n) => n + ': that strange feeling today has a name in your horoscope',
  (n) => "If you're " + n + ', this will match what you thought when you woke up',
  (n) => n + ', someone close is not being fully honest - read this',
  (n) => "You weren't supposed to see this today, " + n + ', but the Moon insisted',
  (n) => n + ': what you avoid feeling is exactly what today surfaces',
  (n) => 'Few people say this out loud, ' + n + ' - your sign does',
  (n) => n + ', the silence weighing on you today is not random',
  (n) => 'Breathe, ' + n + ' - what comes next feels written for you',
  (n) => n + ': if you replayed the same scene in your head, you are not alone',
  (n) => 'The universe left this on your feed for a reason, ' + n,
  (n) => n + ', your intuition screams - the horoscope translates',
  (n) => "If you're " + n + ' and something feels off, stay until the end',
  (n) => n + ': what keeps you up tonight shows in the stars',
  (n) => 'Admit it, ' + n + ' - you already felt today would be different',
  (n) => n + ', feels like I read your mind, but it is today\'s chart',
  (n) => 'Last warning, ' + n + ': after this your day will not look the same',
  (n) => n + ': there is a decision you delay - the sky talks about it now',
  (n) => "If you're " + n + ', what you feel in your chest today makes sense',
  (n) => n + ', someone will surprise you today - the planets already know',
  (n) => 'This is not coincidence, ' + n + ' - it is your sign\'s energy',
  (n) => n + ': what you think and do not say out loud is right here',
  (n) => 'Get ready, ' + n + ' - today\'s message is direct',
  (n) => n + ', your heart already knows; let the horoscope confirm',
  (n) => 'Nobody prepared you for what ' + n + ' feels today - I will',
  (n) => n + ': the answer you seek is in your sign, not on Google',
  (n) => "If you're " + n + ', what blocks you has a solution in the stars',
  (n) => n + ', today the universe asks for courage - read why',
  (n) => 'Feels invasive, ' + n + ', but your horoscope is precise today',
  (n) => n + ': what distracts you from yourself appears in the forecast',
  (n) => 'Do not ignore the sign, ' + n + ' - it is small but real',
  (n) => n + ', the person you just thought of appears in the stars',
  (n) => "If you're " + n + ", today's fear has a cosmic explanation",
  (n) => n + ': what makes you hesitate is what today wants to resolve',
  (n) => 'This will feel too personal, ' + n + ' - and it is',
  (n) => n + ', the calm you fake today does not fool the planets',
  (n) => 'What nobody tells ' + n + ' is in today\'s forecast',
  (n) => n + ': if you feel time is tight, the stars agree',
  (n) => 'Stay 20 more seconds, ' + n + ' - worth it',
];

const GANCHOS_HOROSCOPO_PT: GanchoFn[] = [
  (n) => n + ', o horóscopo de hoje não é o que esperavas',
  (n) => 'Mensagem do dia para ' + n + ' - os astros não mentem',
  (n) => n + ': Lua e planetas alinhados - lê agora',
  (n) => 'Previsão ' + n + ' - feita para ti e só para ti',
  (n) => n + ', a energia de hoje explica o teu humor',
];

const GANCHOS_HOROSCOPO_EN: GanchoFn[] = [
  (n) => n + ", today's horoscope is not what you expected",
  (n) => 'Daily message for ' + n + ' - the stars do not lie',
  (n) => n + ': Moon and planets aligned - read now',
  (n) => 'Forecast ' + n + ' - for you and only you',
  (n) => n + ", today's energy explains your mood",
];

const PREFIXOS_PREVISAO_PT = [
  (n: string) => 'Não sei bem como te dizer isto, ' + n + ', mas ',
  (n: string) => n + ', escuta isto com calma: ',
  (n: string) => 'O que os astros dizem sobre ti hoje, ' + n + ': ',
  (n: string) => n + ', a verdade do dia é esta: ',
];

const PREFIXOS_PREVISAO_EN = [
  (n: string) => "I don't know how to tell you this, " + n + ', but ',
  (n: string) => n + ', listen calmly: ',
  (n: string) => 'What the stars say about you today, ' + n + ': ',
  (n: string) => n + ', the truth of the day is this: ',
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

function ganchoDaPrevisao(nomeSigno: string, previsao: string, signo: SignoZodiaco, data: string): string | null {
  const limpa = sanitizarTextoPublico(previsao);
  const primeira = limpa.split(/[.!?]/)[0]?.trim();
  if (!primeira || primeira.length < 12 || primeira.length > 72) {
    return null;
  }
  const prefixos = isLocaleUS() ? PREFIXOS_PREVISAO_EN : PREFIXOS_PREVISAO_PT;
  const indice = escolherIndiceGancho(signo, data + '-pref', prefixos.length);
  const frase =
    primeira.charAt(0).toLowerCase() === primeira.charAt(0)
      ? primeira
      : primeira.charAt(0).toLowerCase() + primeira.slice(1);
  return sanitizarTextoPublico(prefixos[indice](nomeSigno) + frase);
}

/**
 * Gancho narrado - 55% viral (dinheiro/amor/ego) | resto psicologia + horóscopo.
 */
export function escolherGanchoDiario(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): string {
  const nomeSigno = obterNomeSigno(signo);
  const dataRef = data ?? new Date().toISOString().slice(0, 10);

  if (escolherIndiceGancho(signo, dataRef + '-viral', 100) < 55) {
    return escolherGanchoViral(signo, dataRef);
  }

  if (escolherIndiceGancho(signo, dataRef + '-prev', 100) < 20) {
    const daPrevisao = ganchoDaPrevisao(nomeSigno, previsao, signo, dataRef);
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
