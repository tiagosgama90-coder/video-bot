import { getFirestore } from 'firebase-admin/firestore';
import { getApps } from 'firebase-admin/app';
import {
  ALIAS_CHAVES_FIRESTORE,
  CHAVES_FIRESTORE_PT,
  NOMES_SIGNOS,
  type SignoZodiaco,
} from './signos';
import { gerarTextoHoroscopoHome } from './horoscopoSite';

/**
 * O site sidusastro.com mostra o Horóscopo Diário na página /home.
 * O texto é gerado por trânsitos reais (horoscopoDiarioTransitos.js) +
 * opcionalmente o pack IA do Firestore siteDaily/{date}.horoscopes.pt.
 *
 * Este módulo replica essa lógica para que o vídeo mostre o MESMO texto
 * que aparece na home do site.
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

/**
 * Extrai o texto até ao SEGUNDO ponto final (incluindo o segundo ponto).
 * Se não houver 2 pontos finais, retorna o texto completo.
 * Exemplo: "Frase um. Frase dois. Frase três." → "Frase um. Frase dois."
 */
export function extrairAteSegundoPontoFinal(texto: string): string {
  let count = 0;
  let pos = -1;
  for (let i = 0; i < texto.length; i++) {
    if (texto[i] === '.') {
      count++;
      if (count === 2) {
        pos = i + 1;
        break;
      }
    }
  }
  if (pos === -1) {
    return texto.trim();
  }
  return texto.slice(0, pos).trim();
}

function chavesParaSigno(signo: string): string[] {
  const aliases = ALIAS_CHAVES_FIRESTORE[signo];
  if (aliases && aliases.length > 0) {
    return aliases;
  }
  const principal = CHAVES_FIRESTORE_PT[signo];
  return principal ? [principal] : [signo];
}

function extrairApiTextSigno(
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

function dormir(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function obterPackSiteDaily(data: string): Promise<DadosSiteDaily | undefined> {
  const db = getFirestore();
  const snapshot = await db.collection('siteDaily').doc(data).get();
  return snapshot.exists ? (snapshot.data() as DadosSiteDaily) : undefined;
}

/**
 * Espera até o siteDaily/{data} existir (horóscopo diário gerado ~07:00 Lisboa).
 * Tenta a cada 5 minutos, máximo 6 tentativas (30 min).
 */
async function aguardarSiteDaily(data: string): Promise<DadosSiteDaily | undefined> {
  const maxTentativas = 6;
  const intervaloMs = 5 * 60 * 1000;

  for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
    const pack = await obterPackSiteDaily(data);
    if (pack?.horoscopes?.pt || pack?.pack?.horoscopes?.pt) {
      if (tentativa > 1) {
        console.log(`✅ siteDaily/${data} disponível após ${tentativa} tentativa(s).`);
      }
      return pack;
    }

    if (tentativa < maxTentativas) {
      console.log(
        `⏳ siteDaily/${data} ainda não disponível (tentativa ${tentativa}/${maxTentativas}). ` +
          'A aguardar 5 min...',
      );
      await dormir(intervaloMs);
    }
  }

  console.log(`⚠️ siteDaily/${data} não encontrado após ${maxTentativas} tentativas.`);
  return undefined;
}

export async function obterTextoHoroscopo(signo: SignoZodiaco, data: string): Promise<string> {
  const nomeSigno = NOMES_SIGNOS[signo];
  const chavesEsperadas = chavesParaSigno(signo).join(' / ');

  try {
    let pack: DadosSiteDaily | undefined;
    if (getApps().length > 0) {
      pack = await aguardarSiteDaily(data);
    } else {
      console.log('ℹ️ Firebase não inicializado — horóscopo só por trânsitos (teste local).');
    }
    const apiResultado = pack ? extrairApiTextSigno(pack, signo) : undefined;

    if (apiResultado) {
      console.log(
        '✅ Pack IA: siteDaily/' + data + ' [' + apiResultado.chaveUsada + '] (chaves: ' + chavesEsperadas + ')',
      );
    }

    const dataLisboa = new Date(data + 'T12:00:00+01:00');
    const textoHome = gerarTextoHoroscopoHome(signo, apiResultado?.texto, dataLisboa);

    if (textoHome && textoHome.length > 20) {
      console.log('✅ Horóscopo HOME (trânsitos): ' + nomeSigno);
      console.log('📄 Texto completo: "' + textoHome + '"');
      return textoHome;
    }

    if (apiResultado?.texto) {
      console.log('⚠️ Trânsitos vazios — a usar pack IA para ' + nomeSigno);
      return apiResultado.texto;
    }

    console.log('⚠️ Sem horóscopo para ' + nomeSigno + ' — texto genérico.');
    return `Os astros guiam o teu caminho hoje no SidusAstro, ${nomeSigno}.`;
  } catch (erro) {
    console.log('⚠️ Erro ao obter horóscopo para ' + nomeSigno + '. A usar trânsitos locais.');
    console.log(String(erro));

    try {
      const dataLisboa = new Date(data + 'T12:00:00+01:00');
      const textoHome = gerarTextoHoroscopoHome(signo, undefined, dataLisboa);
      if (textoHome && textoHome.length > 20) {
        return textoHome;
      }
    } catch {
      // ignora
    }

    return `Os astros guiam o teu caminho hoje no SidusAstro, ${nomeSigno}.`;
  }
}
