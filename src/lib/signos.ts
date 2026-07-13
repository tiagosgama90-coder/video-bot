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

/** 2 ou 3 signos diferentes, determinísticos por dia (Lisboa) — muda todos os dias */
export function escolherSignosDoDia(data: string): SignoZodiaco[] {
  const seed = hashString('sidusastro-' + data);
  const baralhado = baralharComSeed([...SIGNOS_ZODIACO], seed);
  const quantidade = 2 + (seed % 2);
  return baralhado.slice(0, quantidade);
}

export function seedImagemSigno(data: string, signo: string): number {
  return hashString(data + '-' + signo + '-' + Date.now()) % 999_999;
}
