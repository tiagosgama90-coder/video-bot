import { getFirestore } from 'firebase-admin/firestore';
import { CHAVES_FIRESTORE_PT } from './signos';

/**
 * O site sidusastro.com mostra o Horóscopo Diário na página /home.
 * Esse conteúdo vem do Firestore: coleção `siteDaily`, documento `YYYY-MM-DD`.
 *
 * O bot NÃO cria este documento — o teu backend/site SidusAstro gera-o
 * automaticamente quando produz as interpretações diárias (a mesma rotina que
 * alimenta a secção "Horóscopo Diário" no site). O bot apenas LÊ esse texto.
 */

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

function apenasHoroscopoDeHoje(): boolean {
  return process.env.HOROSCOPE_APENAS_HOJE === 'true';
}

export async function obterTextoHoroscopo(signo: string, data: string): Promise<string> {
  const fallback = 'Os astros guiam o teu caminho hoje no SidusAstro.';
  const chavePt = CHAVES_FIRESTORE_PT[signo] ?? signo;
  const diasFallback = apenasHoroscopoDeHoje() ? 1 : 7;

  try {
    const db = getFirestore();

    for (const dataTentativa of obterDatasFallback(data, diasFallback)) {
      const snapshot = await db.collection('siteDaily').doc(dataTentativa).get();

      if (!snapshot.exists) {
        if (dataTentativa === data) {
          console.log('');
          console.log('❌ siteDaily/' + data + ' ainda não existe no Firestore.');
          console.log(
            '   Isto é criado automaticamente pelo teu site SidusAstro quando gera',
          );
          console.log('   as interpretações do Horóscopo Diário — não precisas de o criar à mão.');
          console.log(
            '   Verifica se o job diário do site correu hoje antes do bot (GitHub Actions 07:00 UTC).',
          );
          console.log('');
        } else {
          console.log('⚠️ siteDaily/' + dataTentativa + ' não encontrado.');
        }
        continue;
      }

      const texto = extrairTextoSigno(snapshot.data() as DadosSiteDaily, signo);

      if (texto) {
        if (dataTentativa === data) {
          console.log(
            '✅ Horóscopo de HOJE lido de siteDaily/' + data + ' [' + chavePt + '] (igual ao site)',
          );
        } else {
          console.log('');
          console.log(
            '⚠️ ATENÇÃO: siteDaily/' +
              data +
              ' indisponível — a usar texto de ' +
              dataTentativa +
              '.',
          );
          console.log(
            '   O vídeo NÃO terá a interpretação de hoje. Confirma o job diário do site SidusAstro.',
          );
          console.log('');
        }
        return texto;
      }

      console.log('⚠️ Signo ' + chavePt + ' em falta em siteDaily/' + dataTentativa);
    }

    console.log('⚠️ Nenhum horóscopo recente para ' + chavePt + '. A usar texto genérico.');
    return fallback;
  } catch (erro) {
    console.log('⚠️ Erro Firestore para ' + signo + '. A usar texto genérico.');
    console.log(String(erro));
    return fallback;
  }
}
