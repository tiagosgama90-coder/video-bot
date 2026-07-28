import { isLocaleUS } from './locale';
import { obterNomeSigno, type SignoZodiaco } from './signos';
import type { GanchoComTema, TemaNarracao } from './fechos-narracao';
import { sanitizarTextoPublico } from './texto-publico';

export type CategoriaGanchoViral = 'financas' | 'amor' | 'ego';

const SIGNOS_FINANCAS: SignoZodiaco[] = ['touro', 'capricornio', 'escorpiao', 'virgem'];
const SIGNOS_EGO: SignoZodiaco[] = ['leao', 'carneiro', 'gemeos', 'sagitario'];
const SIGNOS_AMOR: SignoZodiaco[] = ['touro', 'balanca', 'peixes', 'caranguejo'];

function hashGancho(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function escolherCategoria(signo: SignoZodiaco, data: string): CategoriaGanchoViral {
  if (SIGNOS_FINANCAS.includes(signo)) {
    return 'financas';
  }
  if (SIGNOS_EGO.includes(signo)) {
    return 'ego';
  }
  if (SIGNOS_AMOR.includes(signo)) {
    return 'amor';
  }
  const h = hashGancho('viral-cat-' + signo + '-' + data) % 100;
  if (h < 34) {
    return 'financas';
  }
  if (h < 67) {
    return 'ego';
  }
  return 'amor';
}

type GanchoViralFn = (nomeSigno: string, signo: SignoZodiaco) => string;

const GANCHOS_FINANCAS_PT: GanchoViralFn[] = [
  (n, s) =>
    SIGNOS_FINANCAS.includes(s)
      ? 'Se você é ' +
        n +
        ' (ou ascendente ' +
        n +
        '): tem um trânsito astrológico raro começando amanhã que pode desbloquear sua área financeira. Só precisa saber onde olhar. Leia a legenda urgente 🚨'
      : 'Se seu signo ou ascendente é Touro, Capricórnio, Escorpião ou Virgem: tem um trânsito raro amanhã que desbloqueia dinheiro. ' +
        n +
        ', seu mapa mostra onde olhar. Legenda urgente 🚨',
  (n) =>
    n +
    ', pare de ignorar os sinais: Júpiter e Vênus estão abrindo uma janela financeira nos próximos 7 dias. Quem tem mapa astral vê o ponto exato. Comenta MAPA 🚨',
  (n) =>
    'Atenção ' +
    n +
    ' e quem tem Sol em Touro, Capricórnio, Escorpião ou Virgem: o céu está reorganizando sua carreira e renda. Isso não volta tão cedo. Leia a legenda 🚨',
  (n) =>
    n +
    ', se sente que o dinheiro trava sempre no mesmo lugar, não é azar - é um trânsito que termina em breve. O mapa natal mostra a saída em sidusastro.com 🚨',
  (n) =>
    'Trânsito financeiro raro para ' +
    n +
    ': a partir de amanhã, Saturno deixa de bloquear a casa da renda. Só quem sabe o ascendente aproveita. Legenda 🚨',
];

const GANCHOS_AMOR_PT: GanchoViralFn[] = [
  () =>
    'Me diz em qual Casa está sua Vênus e eu te digo exatamente por que seus relacionamentos travam no mesmo lugar.',
  (n) =>
    n +
    ', a Casa da sua Vênus explica por que você repetiu a mesma história amorosa. Não é coincidência - é padrão no mapa. Comenta MAPA 🚨',
  (n) =>
    'Se você é ' +
    n +
    ' e ainda não sabe onde está sua Vênus natal, está namorando no escuro. Legenda urgente 🚨',
  () =>
    'Por que você atrai sempre o mesmo tipo de pessoa? A resposta está na Casa de Vênus e Marte. Comenta MAPA 🚨',
  (n) =>
    n +
    ', seu coração não está partido - seu mapa pede ajuste na Casa 7. Relacionamentos mudam quando você vê isso. Urgente 🚨',
  () =>
    'Descubra já a afinidade do seu parceiro com a sua em sidusastro.com - o mapa mostra o que a conversa não diz. Comenta MAPA 🚨',
  (n) =>
    n +
    ', se sente que te traem em silêncio, a Casa 7 e Marte no seu mapa contam a verdade. Legenda urgente 🚨',
  (n) =>
    n +
    ': traição nem sempre é óbvia - Vênus e Plutão no seu mapa revelam quem joga dos dois lados. sidusastro.com 🚨',
  (n) =>
    'Relacionamento travando, ' +
    n +
    '? A compatibilidade real do casal está na sinastria grátis em sidusastro.com 🚨',
];

const GANCHOS_EGO_PT: GanchoViralFn[] = [
  (n, s) =>
    SIGNOS_EGO.includes(s)
      ? 'Aviso astrológico para quem tem Ascendente em ' +
        n +
        ': o universo cansou de ver você ignorar sua verdadeira missão de vida. Seu mapa natal avisa isso todo dia...'
      : 'Aviso para Ascendente em Leão, Áries, Gêmeos ou Sagitário: o universo cansou de ver você ignorar sua missão. ' +
        n +
        ', seu Sol também fala disso. Legenda 🚨',
  (n) =>
    n +
    ', não é drama - é alerta: Plutão está pressionando quem foge do propósito. O mapa natal mostra o que você evita há anos. Comenta MAPA 🚨',
  (n) =>
    'Se você é ' +
    n +
    ' e sente que nasceu para mais mas trava no meio, ascendente e Meio-Céu explicam o porquê. Isso é para você. Urgente 🚨',
  (n) =>
    n +
    ': o universo não manda sinais por acaso. Ignorar a missão de vida custa caro em 2026. Seu mapa já avisou - você vê ou não vê?',
  (n) =>
    'Ascendente + Nodo Norte = missão de alma. ' +
    n +
    ', se doeu ouvir isso, é porque o mapa está certo. Comenta MAPA ou PREMIUM 🚨',
];

const GANCHOS_FINANCAS_EN: GanchoViralFn[] = [
  (n, s) =>
    SIGNOS_FINANCAS.includes(s)
      ? "If you're " +
        n +
        ' (or ' +
        n +
        ' rising): a rare transit starts tomorrow that can unlock your financial zone. You just need to know where to look. Read the caption 🚨'
      : 'If your sign or rising is Taurus, Capricorn, Scorpio or Virgo: a rare transit starts tomorrow that unlocks money. ' +
        n +
        ', your chart shows where. Urgent caption 🚨',
  (n) =>
    n +
    ', stop ignoring the signs: Jupiter and Venus are opening a money window in the next 7 days. Your birth chart shows the exact spot. Comment MAP 🚨',
];

const GANCHOS_AMOR_EN: GanchoViralFn[] = [
  () =>
    "Tell me which House your Venus is in and I'll tell you exactly why your relationships keep failing or stalling in the same place.",
  (n) =>
    n +
    ", your Venus House explains why you repeated the same love story. Comment MAP to find out which one 🚨",
  () =>
    'Discover your partner affinity with yours at sidusastro.com/en - the chart shows what the talk does not. Comment MAP 🚨',
  (n) =>
    n +
    ', if you feel betrayed in silence, House 7 and Mars on your chart tell the truth. Urgent caption 🚨',
  (n) =>
    n +
    ': betrayal is not always obvious - Venus and Pluto on your chart reveal who plays two games. sidusastro.com/en 🚨',
];

const GANCHOS_EGO_EN: GanchoViralFn[] = [
  (n, s) =>
    SIGNOS_EGO.includes(s)
      ? 'Astrology alert for ' +
        n +
        ' rising: the universe is tired of watching you ignore your real life mission. Your birth chart warns you about this every day...'
      : 'Alert for Leo, Aries, Gemini or Sagittarius rising: stop ignoring your mission. ' +
        n +
        ', your Sun says the same. Caption 🚨',
];

function poolPorCategoria(categoria: CategoriaGanchoViral): GanchoViralFn[] {
  if (isLocaleUS()) {
    switch (categoria) {
      case 'financas':
        return GANCHOS_FINANCAS_EN;
      case 'amor':
        return GANCHOS_AMOR_EN;
      default:
        return GANCHOS_EGO_EN;
    }
  }
  switch (categoria) {
    case 'financas':
      return GANCHOS_FINANCAS_PT;
    case 'amor':
      return GANCHOS_AMOR_PT;
    default:
      return GANCHOS_EGO_PT;
  }
}

/** Gancho viral estilo Reels - dinheiro, amor/Vénus ou ego/missão */
export function escolherGanchoViralComTema(signo: SignoZodiaco, data: string): GanchoComTema {
  const nomeSigno = obterNomeSigno(signo);
  const categoria = escolherCategoria(signo, data);
  const pool = poolPorCategoria(categoria);
  const indice = hashGancho('viral-' + signo + '-' + data + '-' + categoria) % pool.length;
  return {
    texto: sanitizarTextoPublico(pool[indice](nomeSigno, signo)),
    tema: categoria as TemaNarracao,
  };
}

export function escolherGanchoViral(signo: SignoZodiaco, data: string): string {
  return escolherGanchoViralComTema(signo, data).texto;
}

export function ehGanchoViralLongo(texto: string): boolean {
  return texto.length > 95 || texto.includes('🚨') || texto.toLowerCase().includes('legenda');
}
