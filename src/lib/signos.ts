import crypto from 'crypto';

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

export function obterDataLisboa(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Lisbon' });
}

function hashString(texto: string): number {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function baralharComSeed<T>(lista: T[], seed: number): T[] {
  const copia = [...lista];
  let estado = seed || 1;

  for (let i = copia.length - 1; i > 0; i--) {
    estado = (estado * 1664525 + 1013904223) >>> 0;
    const j = estado % (i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }

  return copia;
}

/** 2 ou 3 signos diferentes por dia (Lisboa) — muda todos os dias, usado no GitHub Actions */
export function escolherSignosDoDia(data: string): SignoZodiaco[] {
  const seed = hashString('sidusastro-' + data);
  const baralhado = baralharComSeed([...SIGNOS_ZODIACO], seed);
  const quantidade = 2 + (seed % 2);
  return baralhado.slice(0, quantidade);
}

function escolherSignoAleatorio(excluir: SignoZodiaco[] = []): SignoZodiaco {
  const candidatos = SIGNOS_ZODIACO.filter((s) => !excluir.includes(s));
  const pool = candidatos.length > 0 ? candidatos : [...SIGNOS_ZODIACO];
  return pool[crypto.randomInt(0, pool.length)];
}

/**
 * Local (TESTE_LOCAL=1): 1 signo aleatório por execução — diferente a cada npm run gerar.
 * Local (produção simulada): signos do dia que ainda não têm vídeo em output/.
 * GitHub Actions (CI): 2 ou 3 signos fixos do dia.
 */
export function escolherSignosParaExecucao(
  data: string,
  signosJaGerados: SignoZodiaco[] = [],
): SignoZodiaco[] {
  if (process.env.CI === 'true') {
    return escolherSignosDoDia(data);
  }

  if (process.env.TESTE_LOCAL === '1') {
    const signo = escolherSignoAleatorio(signosJaGerados);
    return [signo];
  }

  const signosDoDia = escolherSignosDoDia(data);
  const pendentes = signosDoDia.filter((s) => !signosJaGerados.includes(s));

  if (pendentes.length > 0) {
    return pendentes;
  }

  return [escolherSignoAleatorio(signosJaGerados)];
}

export function signoChaveFromNome(nome: string): SignoZodiaco | undefined {
  const alvo = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  for (const [chave, valor] of Object.entries(NOMES_SIGNOS)) {
    const norm = valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (norm === alvo) {
      return chave as SignoZodiaco;
    }
  }
  return undefined;
}
