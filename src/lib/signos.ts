import crypto from 'crypto';
import { isLocaleUS, type AppLocale } from './locale';
import { indiceSignoFromChave } from './geometria-zodiaco';

export const CHAVES_FIRESTORE_EN: Record<string, string> = {
  carneiro: 'Aries',
  touro: 'Taurus',
  gemeos: 'Gemini',
  caranguejo: 'Cancer',
  leao: 'Leo',
  virgem: 'Virgo',
  balanca: 'Libra',
  escorpiao: 'Scorpio',
  sagitario: 'Sagittarius',
  capricornio: 'Capricorn',
  aquario: 'Aquarius',
  peixes: 'Pisces',
};

export const ALIAS_CHAVES_FIRESTORE_EN: Record<string, string[]> = {
  carneiro: ['Aries'],
  touro: ['Taurus'],
  gemeos: ['Gemini', 'Gemeos'],
  caranguejo: ['Cancer'],
  leao: ['Leo'],
  virgem: ['Virgo'],
  balanca: ['Libra'],
  escorpiao: ['Scorpio', 'Scorpius'],
  sagitario: ['Sagittarius'],
  capricornio: ['Capricorn'],
  aquario: ['Aquarius'],
  peixes: ['Pisces'],
};

/** Chaves internas do bot → nomes exatos no Firestore siteDaily.horoscopes.pt */
export const CHAVES_FIRESTORE_PT: Record<string, string> = {
  carneiro: 'Carneiro',
  touro: 'Touro',
  gemeos: 'Gêmeos',
  caranguejo: 'Câncer',
  leao: 'Leão',
  virgem: 'Virgem',
  balanca: 'Libra',
  escorpiao: 'Escorpião',
  sagitario: 'Sagitário',
  capricornio: 'Capricórnio',
  aquario: 'Aquário',
  peixes: 'Peixes',
};

/** Ordem de tentativa — o site mostra "Caranguejo" mas o Firestore pode usar "Câncer" ou "Caranguejo" */
export const ALIAS_CHAVES_FIRESTORE: Record<string, string[]> = {
  carneiro: ['Carneiro'],
  touro: ['Touro'],
  gemeos: ['Gémeos', 'Gemeos', 'Gêmeos'],
  caranguejo: ['Câncer', 'Caranguejo', 'Cancer'],
  leao: ['Leão', 'Leao'],
  virgem: ['Virgem'],
  balanca: ['Libra', 'Balança', 'Balanca'],
  escorpiao: ['Escorpião', 'Escorpiao'],
  sagitario: ['Sagitário', 'Sagitario'],
  capricornio: ['Capricórnio', 'Capricornio'],
  aquario: ['Aquário', 'Aquario'],
  peixes: ['Peixes'],
};

export const SIGNOS_ZODIACO = [
  'carneiro',
  'touro',
  'gemeos',
  'caranguejo',
  'leao',
  'virgem',
  'balanca',
  'escorpiao',
  'sagitario',
  'capricornio',
  'aquario',
  'peixes',
] as const;

export type SignoZodiaco = (typeof SIGNOS_ZODIACO)[number];

export function obterIndiceSigno(signo: SignoZodiaco): number {
  return indiceSignoFromChave(signo);
}

export const NOMES_SIGNOS: Record<SignoZodiaco, string> = {
  carneiro: 'Carneiro',
  touro: 'Touro',
  gemeos: 'Gémeos',
  caranguejo: 'Caranguejo',
  leao: 'Leão',
  virgem: 'Virgem',
  balanca: 'Balança',
  escorpiao: 'Escorpião',
  sagitario: 'Sagitário',
  capricornio: 'Capricórnio',
  aquario: 'Aquário',
  peixes: 'Peixes',
};

export const NOMES_SIGNOS_EN: Record<SignoZodiaco, string> = {
  carneiro: 'Aries',
  touro: 'Taurus',
  gemeos: 'Gemini',
  caranguejo: 'Cancer',
  leao: 'Leo',
  virgem: 'Virgo',
  balanca: 'Libra',
  escorpiao: 'Scorpio',
  sagitario: 'Sagittarius',
  capricornio: 'Capricorn',
  aquario: 'Aquarius',
  peixes: 'Pisces',
};

export function obterNomeSigno(signo: SignoZodiaco, locale?: AppLocale): string {
  const us = locale ? locale === 'en-US' : isLocaleUS();
  return us ? NOMES_SIGNOS_EN[signo] : NOMES_SIGNOS[signo];
}

export function obterChavesFirestore(signo: string): string[] {
  if (isLocaleUS()) {
    const aliases = ALIAS_CHAVES_FIRESTORE_EN[signo];
    if (aliases && aliases.length > 0) {
      return aliases;
    }
    const principal = CHAVES_FIRESTORE_EN[signo];
    return principal ? [principal] : [signo];
  }

  const aliases = ALIAS_CHAVES_FIRESTORE[signo];
  if (aliases && aliases.length > 0) {
    return aliases;
  }
  const principal = CHAVES_FIRESTORE_PT[signo];
  return principal ? [principal] : [signo];
}

export function obterDataPublicacao(): string {
  const fuso = isLocaleUS() ? 'America/New_York' : 'Europe/Lisbon';
  return new Date().toLocaleDateString('sv-SE', { timeZone: fuso });
}

export function obterDataLisboa(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Lisbon' });
}

function sortearDoPool(quantidade: number, pool: SignoZodiaco[]): SignoZodiaco[] {
  const escolhidos: SignoZodiaco[] = [];
  const restante = [...pool];
  while (escolhidos.length < quantidade && restante.length > 0) {
    const indice = crypto.randomInt(0, restante.length);
    escolhidos.push(restante.splice(indice, 1)[0]);
  }
  return escolhidos;
}

/**
 * Escolhe N signos priorizando os que há MAIS TEMPO não saem (rotação pelos 12).
 * Só exclui os já publicados hoje — o resto sorteia entre os mais "em atraso".
 */
function escolherSignosComRodacao(
  quantidade: number,
  signosJaPublicadosHoje: SignoZodiaco[],
  ultimaPublicacao: Map<SignoZodiaco, number>,
): SignoZodiaco[] {
  const faltam = Math.max(0, quantidade - signosJaPublicadosHoje.length);
  if (faltam === 0) {
    return [];
  }

  const candidatos = SIGNOS_ZODIACO.filter((s) => !signosJaPublicadosHoje.includes(s));
  candidatos.sort((a, b) => (ultimaPublicacao.get(a) ?? 0) - (ultimaPublicacao.get(b) ?? 0));

  const nuncaSairam = candidatos.filter((s) => (ultimaPublicacao.get(s) ?? 0) === 0);
  const escolhidos: SignoZodiaco[] = [];

  if (nuncaSairam.length >= faltam) {
    escolhidos.push(...sortearDoPool(faltam, nuncaSairam));
  } else {
    escolhidos.push(...nuncaSairam);
    const restantes = faltam - escolhidos.length;
    const comHistorico = candidatos.filter((s) => !escolhidos.includes(s));
    const poolAntigos = comHistorico.slice(0, Math.max(restantes + 2, Math.ceil(comHistorico.length * 0.6)));
    escolhidos.push(...sortearDoPool(restantes, poolAntigos));
  }

  return escolhidos;
}

/**
 * 3 (ou 2) signos/dia — rotação justa pelos 12, aleatório entre os que há mais tempo não saem.
 */
export function escolherSignosParaExecucao(
  quantidade: number,
  signosJaPublicadosHoje: SignoZodiaco[] = [],
  ultimaPublicacao: Map<SignoZodiaco, number> = new Map(),
): SignoZodiaco[] {
  if (process.env.TESTE_LOCAL === '1') {
    const excluir = [...signosJaPublicadosHoje];
    const candidatos = SIGNOS_ZODIACO.filter((s) => !excluir.includes(s))
      .sort((a, b) => (ultimaPublicacao.get(a) ?? 0) - (ultimaPublicacao.get(b) ?? 0));
    const pool = candidatos.slice(0, Math.max(4, Math.ceil(candidatos.length / 2)));
    return sortearDoPool(1, pool.length > 0 ? pool : [...SIGNOS_ZODIACO]);
  }

  return escolherSignosComRodacao(quantidade, signosJaPublicadosHoje, ultimaPublicacao);
}

export function signoChaveFromNome(nome: string): SignoZodiaco | undefined {
  const alvo = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  for (const [chave, valor] of Object.entries(NOMES_SIGNOS)) {
    const norm = valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (norm === alvo) {
      return chave as SignoZodiaco;
    }
  }
  for (const [chave, valor] of Object.entries(NOMES_SIGNOS_EN)) {
    const norm = valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (norm === alvo) {
      return chave as SignoZodiaco;
    }
  }
  return undefined;
}

/** Extrai signo de uma legenda Buffer (#leo, Forecast Leo, etc.). */
export function extrairSignoDaLegendaBuffer(texto: string): SignoZodiaco | undefined {
  const hashtags = texto.match(/#[\w\u00C0-\u024f]+/gi) ?? [];
  for (const tag of hashtags) {
    const nome = tag.slice(1);
    const porHashtag = signoChaveFromNome(nome);
    if (porHashtag) {
      return porHashtag;
    }
    const chave = SIGNOS_ZODIACO.find(
      (s) =>
        obterNomeSigno(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '') ===
        nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(),
    );
    if (chave) {
      return chave;
    }
  }

  const forecast = texto.match(/Forecast\s+([A-Za-z\u00C0-\u024f]+)/i);
  if (forecast?.[1]) {
    return signoChaveFromNome(forecast[1]);
  }

  const previsao = texto.match(/Previs[aã]o\s+([A-Za-z\u00C0-\u024f]+)/i);
  if (previsao?.[1]) {
    return signoChaveFromNome(previsao[1]);
  }

  return undefined;
}
