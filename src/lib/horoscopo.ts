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

function extrairTextoSigno(dados: DadosSiteDaily | undefined, signo: string): string | undefined {
  const chavePt = CHAVES_FIRESTORE_PT[signo] ?? signo;
  return (
    dados?.horoscopes?.pt?.[chavePt] ??
    dados?.pack?.horoscopes?.pt?.[signo] ??
    dados?.pack?.horoscopes?.pt?.[chavePt]
  );
}

function obterDatasFallback(dataInicial: string, dias: number): string[] {
  const datas: string[] = [];
  const base = new Date(dataInicial + 'T12:00:00Z');

  for (let i = 0; i < dias; i++) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() - i);
    datas.push(d.toISOString().split('T')[0]);
  }

  return datas;
}

export async function obterTextoHoroscopo(signo: string, data: string): Promise<string> {
  const fallback = 'Os astros guiam o seu caminho hoje no SidusAstro.';
  const chavePt = CHAVES_FIRESTORE_PT[signo] ?? signo;

  try {
    const db = getFirestore();

    for (const dataTentativa of obterDatasFallback(data, 7)) {
      const snapshot = await db.collection('siteDaily').doc(dataTentativa).get();

      if (!snapshot.exists) {
        continue;
      }

      const texto = extrairTextoSigno(snapshot.data() as DadosSiteDaily, signo);

      if (texto) {
        if (dataTentativa !== data) {
          console.log(
            'ℹ️ A usar horóscopo de ' + dataTentativa + ' (ainda sem siteDaily/' + data + ').',
          );
        }
        return texto;
      }

      console.log('⚠️ Signo ' + chavePt + ' em falta em siteDaily/' + dataTentativa);
    }

    console.log('⚠️ Nenhum horóscopo recente para ' + chavePt + '. A usar fallback.');
    return fallback;
  } catch (erro) {
    console.log('⚠️ Erro Firestore para ' + signo + '. A usar fallback.');
    console.log(String(erro));
    return fallback;
  }
}
