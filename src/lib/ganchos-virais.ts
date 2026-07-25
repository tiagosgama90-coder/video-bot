import { isLocaleUS } from './locale';
import { obterNomeSigno, type SignoZodiaco } from './signos';
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
      ? 'Se és ' +
        n +
        ' (ou ascendente ' +
        n +
        '): tens um trânsito astrológico raro a começar amanhã que pode desbloquear a tua área financeira. Só tens de saber onde olhar. Lê a legenda urgente 🚨'
      : 'Se o teu signo ou ascendente é Touro, Capricórnio, Escorpião ou Virgem: tens um trânsito raro a começar amanhã que desbloqueia dinheiro. ' +
        n +
        ', o teu mapa diz onde olhar. Legenda urgente 🚨',
  (n) =>
    n +
    ', para de ignorar os sinais: Júpiter e Vénus estão a abrir uma janela financeira entre hoje e os próximos 7 dias. Quem tem mapa astral vê o ponto exacto. Comenta MAPA 🚨',
  (n) =>
    'Aviso para ' +
    n +
    ' e para quem tem Sol em Touro, Capricórnio, Escorpião ou Virgem: o céu está a reorganizar a tua carreira e rendimento. Isto não volta tão cedo. Lê a legenda 🚨',
  (n) =>
    n +
    ', se sentes que o dinheiro trava sempre no mesmo sítio, não é azar - é um trânsito que termina em breve. O mapa natal mostra a saída. Urgente 🚨',
  (n) =>
    'Trânsito financeiro raro para ' +
    n +
    ': a partir de amanhã, Saturno deixa de bloquear uma casa que governa rendimento. Só quem sabe o ascendente aproveita. Legenda 🚨',
];

const GANCHOS_AMOR_PT: GanchoViralFn[] = [
  () =>
    'Diz-me em que Casa tens a tua Vénus e eu digo-te exactamente por que razão os teus relacionamentos dão sempre errado ou parecem travar no mesmo sítio.',
  (n) =>
    n +
    ', a Casa da tua Vénus explica porque repetiste a mesma história amorosa. Não é coincidência - é padrão no mapa. Comenta MAPA para saberes qual é 🚨',
  (n) =>
    'Se és ' +
    n +
    ' e ainda não sabes onde está a tua Vénus natal, estás a namorar no escuro. Uma casa errada = sempre o mesmo bloqueio. Legenda urgente 🚨',
  () =>
    'Por que é que atraís sempre o mesmo tipo de pessoa? A resposta está na Casa de Vénus + aspectos a Marte. Quem comenta MAPA recebe o caminho.',
  (n) =>
    n +
    ', o teu coração não está partido - o teu mapa está a pedir um ajuste na Casa 7. Relacionamentos mudam quando vês isto. Urgente 🚨',
];

const GANCHOS_EGO_PT: GanchoViralFn[] = [
  (n, s) =>
    SIGNOS_EGO.includes(s)
      ? 'Aviso astrológico para quem tem Ascendente em ' +
        n +
        ': o universo cansou-se de te ver a ignorar a tua verdadeira missão de vida. O teu mapa natal avisa-te disto todos os dias...'
      : 'Aviso para Ascendente em Leão, Carneiro, Gémeos ou Sagitário: o universo cansou-se de te ver a ignorar a tua missão. ' +
        n +
        ', o teu Sol também fala disto. Legenda 🚨',
  (n) =>
    n +
    ', não é drama - é alerta: Plutão está a pressionar quem foge do propósito. O mapa natal mostra o que evitas há anos. Comenta MAPA 🚨',
  (n) =>
    'Se és ' +
    n +
    ' e sentes que nasceste para mais mas travas no meio, o ascendente + Meio-Céu explicam o porquê. Isto é para ti. Urgente 🚨',
  (n) =>
    n +
    ': o universo não te manda sinais por acaso. Ignorar a missão de vida custa caro em 2026. O teu mapa já avisou - vês ou não vês?',
  (n) =>
    'Ascendente + Nodo Norte = missão de alma. ' +
    n +
    ', se te doeu ao ouvir isto, é porque o mapa está certo. Comenta MAPA ou VIP 🚨',
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
export function escolherGanchoViral(signo: SignoZodiaco, data: string): string {
  const nomeSigno = obterNomeSigno(signo);
  const categoria = escolherCategoria(signo, data);
  const pool = poolPorCategoria(categoria);
  const indice = hashGancho('viral-' + signo + '-' + data + '-' + categoria) % pool.length;
  return sanitizarTextoPublico(pool[indice](nomeSigno, signo));
}

export function ehGanchoViralLongo(texto: string): boolean {
  return texto.length > 95 || texto.includes('🚨') || texto.toLowerCase().includes('legenda');
}
