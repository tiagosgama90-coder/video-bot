import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import say from 'say';
import { isLocaleUS } from './locale';
import { carregarConfigProjeto, type PreferenciaVoz, type ProsodiaLocale } from './project-config';
import { prepararTextoNarracao } from './texto-publico';

interface VozNeural {
  id: string;
  genero: 'feminina' | 'masculina';
  origem: 'azure' | 'helia';
  lang: string;
}

const VOZ_HELIA: VozNeural = {
  id: 'Microsoft Helia',
  genero: 'feminina',
  origem: 'helia',
  lang: 'pt-PT',
};

const VELOCIDADE_HELIA = 1.05;

function obterVozesAzure(): VozNeural[] {
  const cfg = carregarConfigProjeto();
  if (isLocaleUS()) {
    return [
      { id: cfg.voz.en.femininaId, genero: 'feminina', origem: 'azure', lang: 'en-US' },
      { id: cfg.voz.en.masculinaId, genero: 'masculina', origem: 'azure', lang: 'en-US' },
    ];
  }
  return [
    { id: cfg.voz.pt.femininaId, genero: 'feminina', origem: 'azure', lang: 'pt-BR' },
    { id: cfg.voz.pt.masculinaId, genero: 'masculina', origem: 'azure', lang: 'pt-BR' },
  ];
}

function ehLocalePortugues(lang: string): boolean {
  return lang === 'pt-BR' || lang === 'pt-PT';
}

function escapeXml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function prepararTextoSsml(texto: string, comEnfase = true): string {
  const cfg = carregarConfigProjeto();
  const escapado = escapeXml(texto);
  const pausaFrase = cfg.voz.pausaFraseMs;
  const pausaVirgula = cfg.voz.pausaVirgulaMs;

  const comPausas = escapado
    .replace(/([.!?…])\s+/g, '$1<break time="' + pausaFrase + 'ms"/> ')
    .replace(/([,;:])\s+/g, '$1<break time="' + pausaVirgula + 'ms"/> ');

  if (!comEnfase) {
    return comPausas;
  }

  const primeiraFrase = comPausas.match(/^[^<]+/);
  if (!primeiraFrase) {
    return comPausas;
  }

  const resto = comPausas.slice(primeiraFrase[0].length);
  return (
    '<emphasis level="moderate">' +
    primeiraFrase[0].trim() +
    '</emphasis>' +
    resto
  );
}

function obterBlocoVoz(voz: VozNeural): ProsodiaLocale {
  const cfg = carregarConfigProjeto();
  return ehLocalePortugues(voz.lang) ? cfg.voz.pt : cfg.voz.en;
}

function obterProsodiaExpressiva(voz: VozNeural): { rate: string; pitch: string; volume: string } {
  const bloco = obterBlocoVoz(voz);

  if (voz.genero === 'feminina') {
    return { rate: bloco.femininaRate, pitch: bloco.femininaPitch, volume: bloco.volume };
  }
  return { rate: bloco.masculinaRate, pitch: bloco.masculinaPitch, volume: bloco.volume };
}

function obterEstiloAzure(voz: VozNeural, bloco: ProsodiaLocale): { estilo: string; grau: number } {
  if (voz.genero === 'feminina') {
    const estilo =
      bloco.estiloAzureFeminina?.trim() || bloco.estiloAzure?.trim() || '';
    const grau = bloco.grauEstiloFeminina ?? bloco.grauEstilo ?? 1.1;
    return { estilo, grau };
  }
  const estilo =
    bloco.estiloAzureMasculina?.trim() || bloco.estiloAzure?.trim() || '';
  const grau = bloco.grauEstiloMasculina ?? bloco.grauEstilo ?? 1.2;
  return { estilo, grau };
}

interface OpcoesSsml {
  comEstilo?: boolean;
  comEnfase?: boolean;
}

function montarCorpoSsml(texto: string, voz: VozNeural, opcoes: OpcoesSsml = {}): string {
  const comEstilo = opcoes.comEstilo !== false;
  const comEnfase = opcoes.comEnfase !== false;
  const bloco = obterBlocoVoz(voz);
  const prosodia = obterProsodiaExpressiva(voz);
  const conteudo = prepararTextoSsml(texto, comEnfase);
  const { estilo, grau } = obterEstiloAzure(voz, bloco);

  const prosody =
    "<prosody rate='" +
    prosodia.rate +
    "' pitch='" +
    prosodia.pitch +
    "' volume='" +
    prosodia.volume +
    "'>" +
    conteudo +
    '</prosody>';

  if (comEstilo && estilo) {
    return (
      "<mstts:express-as style='" +
      escapeXml(estilo) +
      "' styledegree='" +
      grau +
      "'>" +
      prosody +
      '</mstts:express-as>'
    );
  }

  return prosody;
}

function montarSsmlCompleto(texto: string, voz: VozNeural, opcoes: OpcoesSsml = {}): string {
  return (
    "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' " +
    "xmlns:mstts='https://www.w3.org/2001/m10/synthesis' xml:lang='" +
    voz.lang +
    "'>" +
    "<voice name='" +
    voz.id +
    "'>" +
    montarCorpoSsml(texto, voz, opcoes) +
    '</voice></speak>'
  );
}

function ehErroAzureSsml(erro: unknown): boolean {
  if (!axios.isAxiosError(erro)) {
    return false;
  }
  return erro.response?.status === 400;
}

export function obterPreferenciaVozConfig(): PreferenciaVoz {
  return carregarConfigProjeto().voz.preferencia;
}

export function escolherVozAleatoria(
  preferencia: PreferenciaVoz = 'aleatoria',
): VozNeural {
  const vozes = obterVozesAzure();
  if (preferencia === 'feminina') {
    return vozes.find((v) => v.genero === 'feminina') ?? vozes[0];
  }
  if (preferencia === 'masculina') {
    return vozes.find((v) => v.genero === 'masculina') ?? vozes[1];
  }
  return vozes[crypto.randomInt(0, vozes.length)];
}

async function enviarSsmlAzure(ssml: string): Promise<ArrayBuffer> {
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION;

  if (!speechKey || !speechRegion) {
    throw new Error('Azure Speech não configurado');
  }

  const endpoint =
    'https://' + speechRegion + '.tts.speech.microsoft.com/cognitiveservices/v1';

  const resposta = await axios.post<ArrayBuffer>(endpoint, ssml, {
    responseType: 'arraybuffer',
    timeout: 120_000,
    headers: {
      'Ocp-Apim-Subscription-Key': speechKey,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
    },
  });

  return resposta.data;
}

async function gerarNarracaoAzure(
  texto: string,
  destino: string,
  voz: VozNeural,
): Promise<void> {
  const textoLimpo = prepararTextoNarracao(texto);
  if (!textoLimpo) {
    throw new Error('Texto de narração vazio após sanitização');
  }

  const tentativas: OpcoesSsml[] = [
    { comEstilo: true, comEnfase: true },
    { comEstilo: false, comEnfase: true },
    { comEstilo: false, comEnfase: false },
  ];

  let ultimoErro: unknown;
  for (let i = 0; i < tentativas.length; i++) {
    const ssml = montarSsmlCompleto(textoLimpo, voz, tentativas[i]);
    try {
      const audio = await enviarSsmlAzure(ssml);
      fs.writeFileSync(destino, Buffer.from(audio));
      if (i > 0) {
        console.log('ℹ️ Narração Azure OK com SSML simplificado (tentativa ' + (i + 1) + ').');
      }
      return;
    } catch (erro) {
      ultimoErro = erro;
      if (!ehErroAzureSsml(erro) || i === tentativas.length - 1) {
        throw erro;
      }
      console.log('⚠️ Azure SSML rejeitado (400) — a simplificar e repetir...');
    }
  }

  throw ultimoErro;
}

function gerarNarracaoHelia(texto: string, destino: string): Promise<void> {
  return new Promise((resolve, reject) => {
    say.export(texto, VOZ_HELIA.id, VELOCIDADE_HELIA, destino, (err) => {
      if (err) {
        reject(new Error(String(err)));
        return;
      }
      resolve();
    });
  });
}

export async function gerarNarracao(
  texto: string,
  destinoRelativo = './public/narracao.mp3',
  preferenciaVoz?: PreferenciaVoz,
): Promise<void> {
  const destino = path.resolve(destinoRelativo);
  const pref = preferenciaVoz ?? obterPreferenciaVozConfig();
  const vozEscolhida = escolherVozAleatoria(pref);
  const bloco = obterBlocoVoz(vozEscolhida);
  const prosodia = obterProsodiaExpressiva(vozEscolhida);
  const { estilo } = obterEstiloAzure(vozEscolhida, bloco);

  console.log(
    '🗣️ Voz: ' +
      vozEscolhida.id +
      ' (' +
      vozEscolhida.genero +
      ', Azure Neural' +
      (estilo ? ', estilo ' + estilo : ', prosódia natural') +
      ', rate ' +
      prosodia.rate +
      ', pitch ' +
      prosodia.pitch +
      ')',
  );

  try {
    await gerarNarracaoAzure(prepararTextoNarracao(texto), destino, vozEscolhida);
    console.log('✅ Narração neural Azure gravada.');
    return;
  } catch (erroAzure) {
    if (isLocaleUS()) {
      throw new Error('Azure Speech obrigatório para narração en-US: ' + String(erroAzure));
    }
    console.log('⚠️ Azure Speech indisponível. A usar fallback Microsoft Helia...');
    console.log(String(erroAzure));
  }

  if (vozEscolhida.genero === 'masculina') {
    console.log(
      'ℹ️ Fallback local só tem voz feminina (Helia). A usar Helia neste vídeo.',
    );
  }

  console.log('🗣️ A gerar voz local ' + VOZ_HELIA.id + '...');
  await gerarNarracaoHelia(prepararTextoNarracao(texto), destino);
  console.log('✅ Narração Helia gravada.');
}

/** @deprecated usar gerarNarracao */
export async function gerarNarracaoPtPt(
  texto: string,
  destinoRelativo = './public/narracao.mp3',
  preferenciaVoz?: PreferenciaVoz,
): Promise<void> {
  return gerarNarracao(texto, destinoRelativo, preferenciaVoz);
}
