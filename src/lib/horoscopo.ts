import { getFirestore } from 'firebase-admin/firestore';

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

interface DadosSiteDaily {
  horoscopes?: {
    pt?: Record<string, string>;
  };
  pack?: {
    horoscopes?: {
      pt?: Record<string, string>;
    };
  };
}

export async function obterTextoHoroscopo(signo: string, data: string): Promise<string> {
  const fallback = 'Os astros guiam o seu caminho hoje no SidusAstro.';
  const chavePt = CHAVES_FIRESTORE_PT[signo] ?? signo;

  try {
    const db = getFirestore();
    const snapshot = await db.collection('siteDaily').doc(data).get();

    if (!snapshot.exists) {
      console.log('⚠️ siteDaily/' + data + ' não existe. A usar fallback.');
      return fallback;
    }

    const dados = snapshot.data() as DadosSiteDaily | undefined;
    const texto =
      dados?.horoscopes?.pt?.[chavePt] ??
      dados?.pack?.horoscopes?.pt?.[signo] ??
      dados?.pack?.horoscopes?.pt?.[chavePt];

    if (!texto) {
      console.log('⚠️ Signo ' + chavePt + ' não encontrado em siteDaily/' + data);
      return fallback;
    }

    return texto;
  } catch (erro) {
    console.log('⚠️ Erro Firestore para ' + signo + '. A usar fallback.');
    console.log(String(erro));
    return fallback;
  }
}
