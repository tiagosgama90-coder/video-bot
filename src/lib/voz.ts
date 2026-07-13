import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import say from 'say';

interface VozPtPt {
  id: string;
  genero: 'feminina' | 'masculina';
  origem: 'azure' | 'helia';
}

/** Vozes neurais Azure pt-PT — feminina e masculina */
const VOZES_AZURE: VozPtPt[] = [
  { id: 'pt-PT-RaquelNeural', genero: 'feminina', origem: 'azure' },
  { id: 'pt-PT-DuarteNeural', genero: 'masculina', origem: 'azure' },
];

const VOZ_HELIA: VozPtPt = {
  id: 'Microsoft Helia',
  genero: 'feminina',
  origem: 'helia',
};

const VELOCIDADE_HELIA = 0.85;

function escapeXml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Escolhe aleatoriamente voz feminina ou masculina (Azure) */
export function escolherVozAleatoria(): VozPtPt {
  return VOZES_AZURE[crypto.randomInt(0, VOZES_AZURE.length)];
}

async function gerarNarracaoAzure(
  texto: string,
  destino: string,
  voz: VozPtPt,
): Promise<void> {
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION;

  if (!speechKey || !speechRegion) {
    throw new Error('Azure Speech não configurado');
  }

  const pitch = voz.genero === 'masculina' ? '-4%' : '-2%';

  const ssml =
    "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='pt-PT'>" +
    "<voice name='" +
    voz.id +
    "'>" +
    "<prosody rate='-12%' pitch='" +
    pitch +
    "'>" +
    escapeXml(texto) +
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

export async function gerarNarracaoPtPt(
  texto: string,
  destinoRelativo = './public/narracao.mp3',
): Promise<void> {
  const destino = path.resolve(destinoRelativo);
  const vozEscolhida = escolherVozAleatoria();

  console.log(
    '🗣️ Voz aleatória: ' +
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
