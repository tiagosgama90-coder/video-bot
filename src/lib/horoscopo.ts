import { getFirestore } from 'firebase-admin/firestore';
import { getApps } from 'firebase-admin/app';
import {
  obterChavesFirestore,
  obterNomeSigno,
  type SignoZodiaco,
} from './signos';
import { gerarTextoHoroscopoHome } from './horoscopoSite';
import { chaveHoroscopoFirestore, isLocaleUS } from './locale';

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
    en?: Record<string, string>;
  };
  pack?: {
    horoscopes?: {
      pt?: Record<string, string>;
      en?: Record<string, string>;
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
 * Extrai as 2 primeiras frases (até ao 2.º ponto final real).
 * Ignora pontos em decimais (ex: 3.1°, 11.0°) para não cortar a meio.
 * Exemplo: "Frase um. Frase dois. Frase três." → "Frase um. Frase dois."
 */
export function extrairAteSegundoPontoFinal(texto: string): string {
  const limpo = texto
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')
    .replace(/\u2212/g, '-')
    .trim();
  if (!limpo) {
    return limpo;
  }

  const frases: string[] = [];
  let inicio = 0;
  // Ponto final de frase: não precedido nem seguido por dígito (evita 3.1°, 11.0)
  const regex = /(?<![0-9])\.(?![0-9])/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(limpo)) !== null) {
    const fim = match.index + 1;
    const frase = limpo.slice(inicio, fim).trim();
    if (frase.length > 0) {
      frases.push(frase);
      if (frases.length === 2) {
        return frases.join(' ');
      }
    }
    inicio = fim;
    while (inicio < limpo.length && /\s/.test(limpo[inicio])) {
      inicio++;
    }
  }

  if (frases.length > 0) {
    return frases.join(' ');
  }

  return limpo;
}

function chavesParaSigno(signo: string): string[] {
  return obterChavesFirestore(signo);
}

function extrairApiTextSigno(
  dados: DadosSiteDaily | undefined,
  signo: string,
): { texto: string; chaveUsada: string } | undefined {
  const idioma = chaveHoroscopoFirestore();
  const mapa =
    dados?.horoscopes?.[idioma] ?? dados?.pack?.horoscopes?.[idioma];

  if (!mapa) {
    return undefined;
  }

  for (const chave of chavesParaSigno(signo)) {
    if (mapa[chave]) {
      return { texto: mapa[chave], chaveUsada: chave };
    }
  }

  const chavesAlvo = chavesParaSigno(signo).map(normalizar);
  for (const [chave, valor] of Object.entries(mapa)) {
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
  const idioma = chaveHoroscopoFirestore();

  for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
    const pack = await obterPackSiteDaily(data);
    if (pack?.horoscopes?.[idioma] || pack?.pack?.horoscopes?.[idioma]) {
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

async function resolverHoroscopoSigno(
  signo: SignoZodiaco,
  data: string,
): Promise<{ apiTexto?: string; dataLisboa: Date }> {
  const chavesEsperadas = chavesParaSigno(signo).join(' / ');
  let apiTexto: string | undefined;

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
    apiTexto = apiResultado.texto;
  }

  return { apiTexto, dataLisboa: new Date(data + 'T12:00:00+01:00') };
}

/** Texto completo do horóscopo (como na home do site) */
export async function obterTextoHoroscopo(signo: SignoZodiaco, data: string): Promise<string> {
  const nomeSigno = obterNomeSigno(signo);

  try {
    const { apiTexto, dataLisboa } = await resolverHoroscopoSigno(signo, data);

    if (isLocaleUS()) {
      if (apiTexto && apiTexto.trim().length > 20) {
        console.log('✅ Horóscopo EN (pack IA): ' + nomeSigno);
        console.log('📄 Texto completo: "' + apiTexto + '"');
        return apiTexto.trim();
      }

      console.log('⚠️ Sem horóscopo EN no Firestore para ' + nomeSigno + ' — texto genérico.');
      return `The stars are guiding your path today, ${nomeSigno}. Check your full reading at sidusastro.com/en`;
    }

    const textoHome = gerarTextoHoroscopoHome(signo, apiTexto, dataLisboa);

    if (textoHome && textoHome.length > 20) {
      console.log('✅ Horóscopo HOME (trânsitos): ' + nomeSigno);
      console.log('📄 Texto completo: "' + textoHome + '"');
      return textoHome;
    }

    if (apiTexto) {
      console.log('⚠️ Trânsitos vazios — a usar pack IA para ' + nomeSigno);
      return apiTexto;
    }

    console.log('⚠️ Sem horóscopo para ' + nomeSigno + ' — texto genérico.');
    return isLocaleUS()
      ? `The stars are guiding your path today, ${nomeSigno}. Check your full reading at sidusastro.com/en`
      : `Os astros guiam o teu caminho hoje no SidusAstro, ${nomeSigno}.`;
  } catch (erro) {
    console.log('⚠️ Erro ao obter horóscopo para ' + nomeSigno + '. A usar fallback.');
    console.log(String(erro));

    if (!isLocaleUS()) {
      try {
        const dataLisboa = new Date(data + 'T12:00:00+01:00');
        const textoHome = gerarTextoHoroscopoHome(signo, undefined, dataLisboa);
        if (textoHome && textoHome.length > 20) {
          return textoHome;
        }
      } catch {
        // ignora
      }
    }

    return isLocaleUS()
      ? `The stars are guiding your path today, ${nomeSigno}. Check your full reading at sidusastro.com/en`
      : `Os astros guiam o teu caminho hoje no SidusAstro, ${nomeSigno}.`;
  }
}

/** Apenas as 2 primeiras frases do texto (por ponto final, ignora decimais 3.1°) */
export async function obterDuasFrasesHoroscopo(signo: SignoZodiaco, data: string): Promise<string> {
  const completo = await obterTextoHoroscopo(signo, data);
  return extrairAteSegundoPontoFinal(completo);
}
