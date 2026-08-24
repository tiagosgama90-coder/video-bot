import fs from 'fs';
import path from 'path';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { isLocaleUS } from './locale';
import { carregarConfigProjeto, type PreferenciaVoz } from './project-config';
import { prepararTextoNarracao } from './texto-publico';

interface VozEdge {
  id: string;
  genero: 'feminina' | 'masculina';
  lang: string;
}

/**
 * Seleciona as vozes Neurais brasileiras suaves, calmas e "Zen" gratuitas da Microsoft via Edge TTS.
 */
function obterVozesEdge(): { feminina: VozEdge; masculina: VozEdge } {
  if (isLocaleUS()) {
    return {
      feminina: { id: 'en-US-JennyNeural', genero: 'feminina', lang: 'en-US' },
      masculina: { id: 'en-US-GuyNeural', genero: 'masculina', lang: 'en-US' },
    };
  }

  // Vozes PT-BR muito fluidas e naturais
  return {
    feminina: { id: 'pt-BR-FranciscaNeural', genero: 'feminina', lang: 'pt-BR' },
    masculina: { id: 'pt-BR-FabioNeural', genero: 'masculina', lang: 'pt-BR' },
  };
}

export function obterPreferenciaVozConfig(): PreferenciaVoz {
  return carregarConfigProjeto().voz.preferencia;
}

export function escolherVoz(preferencia: PreferenciaVoz = 'aleatoria'): VozEdge {
  const vozes = obterVozesEdge();

  if (preferencia === 'feminina') {
    return vozes.feminina;
  }
  if (preferencia === 'masculina') {
    return vozes.masculina;
  }

  return Math.random() > 0.5 ? vozes.feminina : vozes.masculina;
}

/**
 * Executa a síntese com até 4 tentativas para evitar falhas de fecho de WebSocket.
 */
async function sintetizarComRetry(
  vozId: string,
  texto: string,
  pastaDestino: string,
  maxTentativas = 4
): Promise<string> {
  let erroUltimo: any = null;

  for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(vozId, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

      const resultado = await tts.toFile(pastaDestino, texto);
      const caminhoGerado = (resultado && typeof resultado === 'string')
        ? resultado
        : path.join(pastaDestino, 'audio.mp3');

      if (fs.existsSync(caminhoGerado) && fs.statSync(caminhoGerado).size > 0) {
        return caminhoGerado;
      }
    } catch (err) {
      erroUltimo = err;
      console.warn(`⚠️ Tentativa ${tentativa}/${maxTentativas} falhou ao sintetizar áudio (${vozId}). A tentar novamente...`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  throw erroUltimo || new Error('Falha ao sintetizar áudio após várias tentativas.');
}

/**
 * Gera a narração de áudio em PT-BR via Microsoft Edge TTS com retries e tratamento de ficheiros.
 */
export async function gerarNarracao(
  texto: string,
  destinoRelativo = './public/narracao.mp3',
  preferenciaVoz?: PreferenciaVoz
): Promise<void> {
  const destinoFinal = path.resolve(destinoRelativo);
  const pastaDestino = path.dirname(destinoFinal);

  if (!fs.existsSync(pastaDestino)) {
    fs.mkdirSync(pastaDestino, { recursive: true });
  }

  const textoLimpo = prepararTextoNarracao(texto);
  if (!textoLimpo) {
    throw new Error('Texto de narração vazio após sanitização');
  }

  const pref = preferenciaVoz ?? obterPreferenciaVozConfig();
  const vozEscolhida = escolherVoz(pref);

  console.log(
    `🗣️ Gerando áudio via Edge-TTS (PT-BR) | Voz: ${vozEscolhida.id} (${vozEscolhida.genero}, ${vozEscolhida.lang})`
  );

  try {
    const caminhoGerado = await sintetizarComRetry(vozEscolhida.id, textoLimpo, pastaDestino);

    if (fs.existsSync(caminhoGerado) && caminhoGerado !== destinoFinal) {
      if (fs.existsSync(destinoFinal)) {
        fs.unlinkSync(destinoFinal);
      }
      fs.renameSync(caminhoGerado, destinoFinal);
    }

    console.log(`✅ Áudio de narração gravado com sucesso em: ${destinoFinal}`);
  } catch (erro) {
    console.error(`❌ Erro ao gerar narração com Edge-TTS:`, erro);
    throw erro;
  }
}

/** @deprecated usar gerarNarracao */
export async function gerarNarracaoPtPt(
  texto: string,
  destinoRelativo = './public/narracao.mp3',
  preferenciaVoz?: PreferenciaVoz
): Promise<void> {
  return gerarNarracao(texto, destinoRelativo, preferenciaVoz);
}
