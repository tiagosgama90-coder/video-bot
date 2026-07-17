import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import say from 'say';
import { isLocaleUS } from './locale';

interface VozNeural {
  id: string;
  genero: 'feminina' | 'masculina';
  origem: 'azure' | 'helia';
  lang: string;
}

const VOZES_AZURE_PT: VozNeural[] = [
  { id: 'pt-PT-RaquelNeural', genero: 'feminina', origem: 'azure', lang: 'pt-PT' },
  { id: 'pt-PT-DuarteNeural', genero: 'masculina', origem: 'azure', lang: 'pt-PT' },
];

const VOZES_AZURE_EN: VozNeural[] = [
  { id: 'en-US-AriaNeural', genero: 'feminina', origem: 'azure', lang: 'en-US' },
  { id: 'en-US-RogerNeural', genero: 'masculina', origem: 'azure', lang: 'en-US' },
];

const VOZ_HELIA: VozNeural = {
  id: 'Microsoft Helia',
  genero: 'feminina',
  origem: 'helia',
  lang: 'pt-PT',
};

const VELOCIDADE_HELIA = 0.8;

function obterVozesAzure(): VozNeural[] {
  return isLocaleUS() ? VOZES_AZURE_EN : VOZES_AZURE_PT;
}

function escapeXml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Pausas suaves entre frases — narração zen, calma e humana */
function prepararTextoSsml(texto: string): string {
  const escapado = escapeXml(texto);
  return escapado
    .replace(/([.!?…])\s+/g, '$1<break time="550ms"/> ')
    .replace(/([,;:])\s+/g, '$1<break time="250ms"/> ');
}

/** Tom sereno: suave e relaxado — sem voz grave */
function obterProsodiaSerena(voz: VozNeural): { rate: string; pitch: string; volume: string } {
  if (voz.lang === 'pt-PT') {
    return voz.genero === 'feminina'
      ? { rate: '-15%', pitch: '+3%', volume: 'soft' }
      : { rate: '-14%', pitch: '+1%', volume: 'soft' };
  }

  return voz.genero === 'feminina'
    ? { rate: '-12%', pitch: '+2%', volume: 'soft' }
    : { rate: '-11%', pitch: '0%', volume: 'soft' };
}

export function escolherVozAleatoria(
  preferencia: 'feminina' | 'masculina' | 'aleatoria' = 'aleatoria',
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

async function gerarNarracaoAzure(
  texto: string,
  destino: string,
  voz: VozNeural,
): Promise<void> {
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION;

  if (!speechKey || !speechRegion) {
    throw new Error('Azure Speech não configurado');
  }

  const prosodia = obterProsodiaSerena(voz);

  const ssml =
    "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='" +
    voz.lang +
    "'>" +
    "<voice name='" +
    voz.id +
    "'>" +
    "<prosody rate='" +
    prosodia.rate +
    "' pitch='" +
    prosodia.pitch +
    "' volume='" +
    prosodia.volume +
    "'>" +
    prepararTextoSsml(texto) +
    '</prosody></voice></speak>';

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

  fs.writeFileSync(destino, Buffer.from(resposta.data));
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
  preferenciaVoz: 'feminina' | 'masculina' | 'aleatoria' = 'aleatoria',
): Promise<void> {
  const destino = path.resolve(destinoRelativo);
  const vozEscolhida = escolherVozAleatoria(preferenciaVoz);

  console.log(
    '🗣️ Voz: ' +
      vozEscolhida.id +
      ' (' +
      vozEscolhida.genero +
      ', Azure Neural)',
  );

  try {
    await gerarNarracaoAzure(texto, destino, vozEscolhida);
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
  await gerarNarracaoHelia(texto, destino);
  console.log('✅ Narração Helia gravada.');
}

/** @deprecated usar gerarNarracao */
export async function gerarNarracaoPtPt(
  texto: string,
  destinoRelativo = './public/narracao.mp3',
  preferenciaVoz: 'feminina' | 'masculina' | 'aleatoria' = 'aleatoria',
): Promise<void> {
  return gerarNarracao(texto, destinoRelativo, preferenciaVoz);
}
