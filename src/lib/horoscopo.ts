import { getFirestore } from 'firebase-admin/firestore';
import {
  ALIAS_CHAVES_FIRESTORE,
  CHAVES_FIRESTORE_PT,
} from './signos';

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

interface ResultadoHoroscopo {
  texto: string;
  chaveUsada: string;
  dataUsada: string;
}

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function chavesParaSigno(signo: string): string[] {
  const aliases = ALIAS_CHAVES_FIRESTORE[signo];
  if (aliases && aliases.length > 0) {
    return aliases;
  }
  const principal = CHAVES_FIRESTORE_PT[signo];
  return principal ? [principal] : [signo];
}

function extrairTextoSigno(
  dados: DadosSiteDaily | undefined,
  signo: string,
): { texto: string; chaveUsada: string } | undefined {
  const mapaPt = dados?.horoscopes?.pt ?? dados?.pack?.horoscopes?.pt;

  if (!mapaPt) {
    return undefined;
  }

  for (const chave of chavesParaSigno(signo)) {
    if (mapaPt[chave]) {
      return { texto: mapaPt[chave], chaveUsada: chave };
    }
  }

  const chavesAlvo = chavesParaSigno(signo).map(normalizar);
  for (const [chave, valor] of Object.entries(mapaPt)) {
    if (chavesAlvo.includes(normalizar(chave))) {
      return { texto: valor, chaveUsada: chave };
    }
  }

  return undefined;
}

function permitirFallbackDiasAnteriores(): boolean {
  return process.env.HOROSCOPE_ALLOW_FALLBACK === 'true';
}

export async function obterTextoHoroscopo(signo: string, data: string): Promise<string> {
  const fallback = 'Os astros guiam o teu caminho hoje no SidusAstro.';
  const chavesEsperadas = chavesParaSigno(signo).join(' / ');

  try {
    const db = getFirestore();
    const snapshot = await db.collection('siteDaily').doc(data).get();

    if (!snapshot.exists) {
      console.log('');
      console.log('❌ siteDaily/' + data + ' não existe no Firestore.');
      console.log('   O site SidusAstro deve gerar este documento antes do bot correr.');
      console.log('');

      if (!permitirFallbackDiasAnteriores()) {
        console.log('⚠️ Fallback desativado — a usar texto genérico.');
        return fallback;
      }
    } else {
      const resultado = extrairTextoSigno(snapshot.data() as DadosSiteDaily, signo);

      if (resultado) {
        console.log(
          '✅ Horóscopo de HOJE: siteDaily/' +
            data +
            ' [' +
            resultado.chaveUsada +
            '] (chaves: ' +
            chavesEsperadas +
            ')',
        );
        console.log('📄 Texto completo: "' + resultado.texto + '"');
        return resultado.texto;
      }

      console.log(
        '⚠️ Signo ' +
          chavesEsperadas +
          ' em falta em siteDaily/' +
          data +
          ' (chaves no doc: ' +
          Object.keys(snapshot.data()?.horoscopes?.pt ?? {}).join(', ') +
          ')',
      );
    }

    if (!permitirFallbackDiasAnteriores()) {
      console.log('⚠️ Sem fallback — a usar texto genérico (não usa dias anteriores).');
      return fallback;
    }

    console.log('ℹ️ HOROSCOPE_ALLOW_FALLBACK=true — a tentar dias anteriores...');
    return obterTextoHoroscopoFallback(signo, data, fallback);
  } catch (erro) {
    console.log('⚠️ Erro Firestore para ' + signo + '. A usar texto genérico.');
    console.log(String(erro));
    return fallback;
  }
}

async function obterTextoHoroscopoFallback(
  signo: string,
  data: string,
  fallback: string,
): Promise<string> {
  const db = getFirestore();
  const [ano, mes, dia] = data.split('-').map(Number);
  const base = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0));

  for (let i = 1; i < 7; i++) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() - i);
    const dataTentativa = d.toISOString().split('T')[0];
    const snapshot = await db.collection('siteDaily').doc(dataTentativa).get();

    if (!snapshot.exists) {
      continue;
    }

    const resultado = extrairTextoSigno(snapshot.data() as DadosSiteDaily, signo);
    if (resultado) {
      console.log('');
      console.log(
        '⚠️ ATENÇÃO: a usar horóscopo de ' +
          dataTentativa +
          ' (siteDaily/' +
          data +
          ' indisponível ou signo em falta).',
      );
      console.log('');
      return resultado.texto;
    }
  }

  return fallback;
}

export type { ResultadoHoroscopo };
