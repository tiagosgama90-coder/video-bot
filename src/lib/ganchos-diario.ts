/* eslint-disable @remotion/deterministic-randomness -- script Node apenas */
import crypto from 'crypto';
import { isLocaleUS } from './locale';
import { obterNomeSigno, type SignoZodiaco } from './signos';
import { escolherGanchoViralComTema } from './ganchos-virais';
import type { GanchoComTema, TemaNarracao } from './fechos-narracao';
import { sanitizarTextoPublico } from './texto-publico';

type GanchoFn = (n: string) => string;

interface GanchoTemado {
  tema: TemaNarracao;
  fn: GanchoFn;
}

function gancho(tema: TemaNarracao, fn: GanchoFn): GanchoTemado {
  return { tema, fn };
}

const GANCHOS_PSICOLOGIA_PT: GanchoTemado[] = [
  gancho('geral', (n) => n + ', paraste o scroll por um motivo - em 20 segundos percebes qual'),
  gancho('geral', (n) => 'Algo em ti já sabe o que vou dizer, ' + n + ' - os astros só confirmam'),
  gancho('geral', (n) => n + ': a sensação estranha de hoje tem nome no teu horóscopo'),
  gancho('geral', (n) => 'Se és ' + n + ', isto vai bater certo com o que pensaste ao acordar'),
  gancho('amor', (n) => n + ', alguém perto de ti não está a ser totalmente honesto - lê isto'),
  gancho('geral', (n) => 'Não era suposto veres isto hoje, ' + n + ', mas a Lua insistiu'),
  gancho('geral', (n) => n + ': o que evitas sentir é exactamente o que o dia traz à tona'),
  gancho('geral', (n) => 'Pouca gente fala disto em voz alta, ' + n + ' - o teu signo sim'),
  gancho('depressao', (n) => n + ', o silêncio que te pesa hoje não é coincidência'),
  gancho('geral', (n) => 'Respira, ' + n + ' - o que vem a seguir parece escrito para ti'),
  gancho('geral', (n) => n + ': se repetiste a mesma cena na cabeça, não estás sozinho'),
  gancho('geral', (n) => 'O universo deixou isto no teu feed por um motivo, ' + n),
  gancho('geral', (n) => n + ', a tua intuição grita - o horóscopo traduz'),
  gancho('geral', (n) => 'Se és ' + n + ' e sentes que algo não encaixa, fica até ao fim'),
  gancho('geral', (n) => n + ': o que te tira o sono esta noite aparece nos astros'),
  gancho('geral', (n) => 'Confessa, ' + n + ' - já sentiste que hoje seria diferente'),
  gancho('geral', (n) => n + ', parece que leio a tua mente, mas é o mapa de hoje'),
  gancho('geral', (n) => 'Último aviso, ' + n + ': depois disto o dia não se vê igual'),
  gancho('geral', (n) => n + ': há uma decisão que adias - o céu fala disso agora'),
  gancho('geral', (n) => 'Se és ' + n + ', o que sentes no peito hoje faz sentido'),
  gancho('geral', (n) => n + ', alguém vai surpreender-te hoje - os planetas já sabem'),
  gancho('geral', (n) => 'Isto não é coincidência, ' + n + ' - é energia do teu signo'),
  gancho('geral', (n) => n + ': o que pensas e não dizes em voz alta está aqui'),
  gancho('geral', (n) => 'Prepara-te, ' + n + ' - a mensagem de hoje é directa'),
  gancho('geral', (n) => n + ', o teu coração já sabe; deixa o horóscopo confirmar'),
  gancho('geral', (n) => 'Ninguém te preparou para o que ' + n + ' sente hoje - eu preparo'),
  gancho('geral', (n) => n + ': a resposta que procuras está no teu signo, não no Google'),
  gancho('geral', (n) => 'Se és ' + n + ', o que te bloqueia tem solução nos astros'),
  gancho('ego', (n) => n + ', hoje o universo pede-te coragem - lê porquê'),
  gancho('geral', (n) => 'Parece invasivo, ' + n + ', mas o teu horóscopo é preciso hoje'),
  gancho('geral', (n) => n + ': o que te distrai de ti mesmo aparece na previsão'),
  gancho('geral', (n) => 'Não ignores o sinal, ' + n + ' - é pequeno mas real'),
  gancho('amor', (n) => n + ', a pessoa em quem pensaste agora aparece nos astros'),
  gancho('geral', (n) => 'Se és ' + n + ', o medo de hoje tem explicação cósmica'),
  gancho('geral', (n) => n + ': o que te faz hesitar é o que o dia quer resolver'),
  gancho('geral', (n) => 'Isto vai parecer demasiado pessoal, ' + n + ' - e é'),
  gancho('geral', (n) => n + ', a calma que finges hoje não engana os planetas'),
  gancho('geral', (n) => 'O que ninguém te diz sobre ' + n + ' está na previsão de hoje'),
  gancho('geral', (n) => n + ': se sentes que o tempo aperta, os astros concordam'),
  gancho('geral', (n) => 'Fica mais 20 segundos, ' + n + ' - vale a pena'),
  gancho('depressao', (n) => n + ', se hoje acordaste vazio por dentro, o horoscopo explica sem te julgar'),
  gancho('depressao', (n) => n + ': a tristeza que carregas nao e fraqueza - os astros veem a causa'),
  gancho('depressao', (n) => 'Se es ' + n + ' e sentes que ninguem percebe, esta mensagem e para ti'),
  gancho('depressao', (n) => n + ', quando a mente nao desliga a noite, o mapa de hoje traduz o porquê'),
  gancho('depressao', (n) => n + ': nao estas sozinho nesta fase pesada - o ceu descreve o que sentes'),
  gancho('depressao', (n) => 'Pouca gente fala de depressao em voz alta, ' + n + ' - o teu signo fala por ti'),
  gancho('depressao', (n) => n + ', se o peito aperta sem motivo claro, le isto antes de te culpares'),
  gancho('amor', (n) => n + ': a relacao que te consome aparece nos astros de hoje'),
  gancho('amor', (n) => 'Se es ' + n + ', alguem que amas pode estar a esconder algo - fica ate ao fim'),
  gancho('amor', (n) => n + ', a sensacao de traicao no ar pode nao ser paranoia - o horoscopo confirma'),
  gancho('amor', (n) => n + ': o parceiro que pensaste agora tem mais a dizer do que mostra'),
  gancho('amor', (n) => 'Descobre ja a afinidade do teu parceiro com o teu em sidusastro.com - ' + n + ', isto muda tudo'),
  gancho('amor', (n) => n + ', o amor que procuras e o que te bloqueia podem ser a mesma pessoa - le isto'),
  gancho('amor', (n) => 'Se es ' + n + ' e repetiste a mesma historia amorosa, o padrao tem nome no mapa'),
  gancho('amor', (n) => n + ': quem te desleal nao aparece de cara - os planetas mostram o sinal'),
];

const GANCHOS_PSICOLOGIA_EN: GanchoTemado[] = [
  gancho('geral', (n) => n + ', you stopped scrolling for a reason - in 20 seconds you will know why'),
  gancho('geral', (n) => 'Something in you already knows what I will say, ' + n + ' - the stars just confirm'),
  gancho('geral', (n) => n + ': that strange feeling today has a name in your horoscope'),
  gancho('geral', (n) => "If you're " + n + ', this will match what you thought when you woke up'),
  gancho('amor', (n) => n + ', someone close is not being fully honest - read this'),
  gancho('geral', (n) => "You weren't supposed to see this today, " + n + ', but the Moon insisted'),
  gancho('geral', (n) => n + ': what you avoid feeling is exactly what today surfaces'),
  gancho('geral', (n) => 'Few people say this out loud, ' + n + ' - your sign does'),
  gancho('depressao', (n) => n + ', the silence weighing on you today is not random'),
  gancho('geral', (n) => 'Breathe, ' + n + ' - what comes next feels written for you'),
  gancho('geral', (n) => n + ': if you replayed the same scene in your head, you are not alone'),
  gancho('geral', (n) => 'The universe left this on your feed for a reason, ' + n),
  gancho('geral', (n) => n + ', your intuition screams - the horoscope translates'),
  gancho('geral', (n) => "If you're " + n + ' and something feels off, stay until the end'),
  gancho('geral', (n) => n + ': what keeps you up tonight shows in the stars'),
  gancho('geral', (n) => 'Admit it, ' + n + ' - you already felt today would be different'),
  gancho('geral', (n) => n + ', feels like I read your mind, but it is today\'s chart'),
  gancho('geral', (n) => 'Last warning, ' + n + ': after this your day will not look the same'),
  gancho('geral', (n) => n + ': there is a decision you delay - the sky talks about it now'),
  gancho('geral', (n) => "If you're " + n + ', what you feel in your chest today makes sense'),
  gancho('geral', (n) => n + ', someone will surprise you today - the planets already know'),
  gancho('geral', (n) => 'This is not coincidence, ' + n + ' - it is your sign\'s energy'),
  gancho('geral', (n) => n + ': what you think and do not say out loud is right here'),
  gancho('geral', (n) => 'Get ready, ' + n + ' - today\'s message is direct'),
  gancho('geral', (n) => n + ', your heart already knows; let the horoscope confirm'),
  gancho('geral', (n) => 'Nobody prepared you for what ' + n + ' feels today - I will'),
  gancho('geral', (n) => n + ': the answer you seek is in your sign, not on Google'),
  gancho('geral', (n) => "If you're " + n + ', what blocks you has a solution in the stars'),
  gancho('ego', (n) => n + ', today the universe asks for courage - read why'),
  gancho('geral', (n) => 'Feels invasive, ' + n + ', but your horoscope is precise today'),
  gancho('geral', (n) => n + ': what distracts you from yourself appears in the forecast'),
  gancho('geral', (n) => 'Do not ignore the sign, ' + n + ' - it is small but real'),
  gancho('amor', (n) => n + ', the person you just thought of appears in the stars'),
  gancho('geral', (n) => "If you're " + n + ", today's fear has a cosmic explanation"),
  gancho('geral', (n) => n + ': what makes you hesitate is what today wants to resolve'),
  gancho('geral', (n) => 'This will feel too personal, ' + n + ' - and it is'),
  gancho('geral', (n) => n + ', the calm you fake today does not fool the planets'),
  gancho('geral', (n) => 'What nobody tells ' + n + ' is in today\'s forecast'),
  gancho('geral', (n) => n + ': if you feel time is tight, the stars agree'),
  gancho('geral', (n) => 'Stay 20 more seconds, ' + n + ' - worth it'),
  gancho('depressao', (n) => n + ', if you woke up empty inside today, your horoscope explains without judging'),
  gancho('depressao', (n) => n + ': the sadness you carry is not weakness - the stars see the cause'),
  gancho('depressao', (n) => "If you're " + n + ' and feel nobody understands, this message is for you'),
  gancho('depressao', (n) => n + ', when your mind will not shut off at night, today chart explains why'),
  gancho('depressao', (n) => n + ': you are not alone in this heavy phase - the sky describes what you feel'),
  gancho('depressao', (n) => 'Few people say depression out loud, ' + n + ' - your sign speaks for you'),
  gancho('depressao', (n) => n + ', if your chest tightens with no clear reason, read this before blaming yourself'),
  gancho('amor', (n) => n + ': the relationship draining you shows in today stars'),
  gancho('amor', (n) => "If you're " + n + ', someone you love may be hiding something - stay until the end'),
  gancho('amor', (n) => n + ', that betrayal feeling in the air may not be paranoia - the horoscope confirms'),
  gancho('amor', (n) => n + ': the partner you just thought of has more to say than they show'),
  gancho('amor', (n) => 'Discover your partner affinity with yours at sidusastro.com/en - ' + n + ', this changes everything'),
  gancho('amor', (n) => n + ', the love you seek and what blocks you might be the same person - read this'),
  gancho('amor', (n) => "If you're " + n + ' and repeated the same love story, the pattern has a name in your chart'),
  gancho('amor', (n) => n + ': who is disloyal does not show their face - the planets show the sign'),
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

function ganchoDaPrevisao(
  nomeSigno: string,
  previsao: string,
  signo: SignoZodiaco,
  data: string,
): GanchoComTema | null {
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
  return {
    texto: sanitizarTextoPublico(prefixos[indice](nomeSigno) + frase),
    tema: 'geral',
  };
}

/**
 * Gancho narrado - 55% viral (dinheiro/amor/ego) | resto psicologia + horóscopo.
 * O tema devolvido alinha o fecho de despedida.
 */
export function escolherGanchoDiario(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): GanchoComTema {
  const nomeSigno = obterNomeSigno(signo);
  const dataRef = data ?? new Date().toISOString().slice(0, 10);

  if (escolherIndiceGancho(signo, dataRef + '-viral', 100) < 55) {
    return escolherGanchoViralComTema(signo, dataRef);
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

  if (usarHoroscopo) {
    const indice = escolherIndiceGancho(signo, dataRef + '-horo', horo.length);
    return { texto: sanitizarTextoPublico(horo[indice](nomeSigno)), tema: 'geral' };
  }

  const indice = escolherIndiceGancho(signo, dataRef + '-psico', psico.length);
  const escolhido = psico[indice];
  return { texto: sanitizarTextoPublico(escolhido.fn(nomeSigno)), tema: escolhido.tema };
}

/** Compatibilidade — só o texto do gancho */
export function escolherTextoGanchoDiario(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): string {
  return escolherGanchoDiario(signo, previsao, data).texto;
}
