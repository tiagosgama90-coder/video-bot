import fs from 'fs';
import path from 'path';
import axios from 'axios';
import say from 'say';

const VOZ_AZURE_NEURAL = 'pt-PT-RaquelNeural';
const VOZ_HELIA_FALLBACK = 'Microsoft Helia';
const VELOCIDADE_HELIA = 0.85;

function escapeXml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function gerarNarracaoAzure(texto: string, destino: string): Promise<void> {
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION;

  if (!speechKey || !speechRegion) {
    throw new Error('Azure Speech não configurado');
  }

  const ssml =
    "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='pt-PT'>" +
    "<voice name='" +
    VOZ_AZURE_NEURAL +
    "'>" +
    "<prosody rate='-12%' pitch='-2%'>" +
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
    say.export(texto, VOZ_HELIA_FALLBACK, VELOCIDADE_HELIA, destino, (err) => {
      if (err) {
        reject(new Error(String(err)));
        return;
      }
      resolve();
    });
  });
}

export async function gerarNarracaoPtPt(texto: string, destinoRelativo = './public/narracao.mp3'): Promise<void> {
  const destino = path.resolve(destinoRelativo);

  try {
    console.log('🗣️ A gerar voz neural Azure (' + VOZ_AZURE_NEURAL + ')...');
    await gerarNarracaoAzure(texto, destino);
    console.log('✅ Narração neural Azure gravada.');
    return;
  } catch (erroAzure) {
    console.log('⚠️ Azure Speech indisponível. A usar fallback Microsoft Helia...');
    console.log(String(erroAzure));
  }

  console.log('🗣️ A gerar voz local ' + VOZ_HELIA_FALLBACK + ' (speed ' + VELOCIDADE_HELIA + ')...');
  await gerarNarracaoHelia(texto, destino);
  console.log('✅ Narração Helia gravada.');
}
