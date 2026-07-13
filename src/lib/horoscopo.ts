import { getFirestore } from 'firebase-admin/firestore';
import { CHAVES_FIRESTORE_PT } from './signos';

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

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function extrairTextoSigno(dados: DadosSiteDaily | undefined, signo: string): string | undefined {
  const chavePt = CHAVES_FIRESTORE_PT[signo] ?? signo;
  const mapaPt = dados?.horoscopes?.pt ?? dados?.pack?.horoscopes?.pt;

  if (!mapaPt) {
    return undefined;
  }

  if (mapaPt[chavePt]) {
    return mapaPt[chavePt];
  }

  const alvo = normalizar(chavePt);
  for (const [chave, valor] of Object.entries(mapaPt)) {
    if (normalizar(chave) === alvo) {
      return valor;
    }
  }

  return undefined;
}

function obterDatasFallback(dataInicial: string, dias: number): string[] {
  const datas: string[] = [];
  const [ano, mes, dia] = dataInicial.split('-').map(Number);
  const base = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0));

  for (let i = 0; i < dias; i++) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() - i);
    datas.push(d.toISOString().split('T')[0]);
  }

  return datas;
}

export async function obterTextoHoroscopo(signo: string, data: string): Promise<string> {
  const fallback = 'Os astros guiam o teu caminho hoje no SidusAstro.';
  const chavePt = CHAVES_FIRESTORE_PT[signo] ?? signo;

  try {
    const db = getFirestore();

    for (const dataTentativa of obterDatasFallback(data, 7)) {
      const snapshot = await db.collection('siteDaily').doc(dataTentativa).get();

      if (!snapshot.exists) {
        console.log('⚠️ siteDaily/' + dataTentativa + ' não encontrado.');
        continue;
      }

      const texto = extrairTextoSigno(snapshot.data() as DadosSiteDaily, signo);

      if (texto) {
        if (dataTentativa !== data) {
          console.log(
            'ℹ️ Horóscopo de ' + dataTentativa + ' (siteDaily/' + data + ' indisponível).',
          );
        } else {
          console.log('✅ Horóscopo lido de siteDaily/' + data + ' [' + chavePt + ']');
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
