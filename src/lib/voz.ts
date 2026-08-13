import fs from 'fs';
import path from 'path';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'edge-tts';
import { isLocaleUS } from './locale';
import { carregarConfigProjeto, type PreferenciaVoz } from './project-config';
import { prepararTextoNarracao } from './texto-publico';

interface VozEdge {
  id: string;
  genero: 'feminina' | 'masculina';
  lang: string;
}

/**
 * Seleciona as vozes Neurais gratuitas da Microsoft via Edge TTS.
 */
function obterVozesEdge(): { feminina: VozEdge; masculina: VozEdge } {
  if (isLocaleUS()) {
    return {
      feminina: { id: 'en-US-AvaNeural', genero: 'feminina', lang: 'en-US' },
      masculina: { id: 'en-US-AndrewNeural', genero: 'masculina', lang: 'en-US' },
    };
  }

  // Padrão em Português
  return {
    feminina: { id: 'pt-BR-ThalitaNeural', genero: 'feminina', lang: 'pt-BR' },
    masculina: { id: 'pt-BR-AntonioNeural', genero: 'masculina', lang: 'pt-BR' },
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

  // Escolha aleatória entre masculina e feminina
  return Math.random() > 0.5 ? vozes.feminina : vozes.masculina;
}

/**
 * Gera a narração de áudio via Microsoft Edge TTS (Gratuito, sem necessidade de Azure/Keys)
 */
export async function gerarNarracao(
  texto: string,
  destinoRelativo = './public/narracao.mp3',
  preferenciaVoz?: PreferenciaVoz
): Promise<void> {
  const destino = path.resolve(destinoRelativo);
  const pastaDestino = path.dirname(destino);

  // Garante que a pasta de destino existe
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
    `🗣️ A gerar áudio via Edge-TTS | Voz: ${vozEscolhida.id} (${vozEscolhida.genero}, ${vozEscolhida.lang})`
  );

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(
      vozEscolhida.id,
      OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_STEREO
    );
    await tts.toFile(destino, textoLimpo);

    console.log(`✅ Áudio de narração gravado com sucesso em: ${destino}`);
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
