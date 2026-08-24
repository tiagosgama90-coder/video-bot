import fs from 'fs';
import path from 'path';
import https from 'https';
import { isLocaleUS } from './locale';
import { carregarConfigProjeto, type PreferenciaVoz } from './project-config';
import { prepararTextoNarracao } from './texto-publico';

export function obterPreferenciaVozConfig(): PreferenciaVoz {
  return carregarConfigProjeto().voz.preferencia;
}

/**
 * Descarrega o áudio via requisição HTTP direta (Google TTS fallback).
 * Inviolável no GitHub Actions porque usa REST HTTP simples em vez de WebSockets instáveis.
 */
function descarregarAudioHTTP(texto: string, lang: string, caminhoDestino: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const textoCodificado = encodeURIComponent(texto);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${textoCodificado}&tl=${lang}&client=tw-ob`;

    const file = fs.createWriteStream(caminhoDestino);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Falha no download HTTP TTS: Status Code ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(caminhoDestino, () => {});
      reject(err);
    });
  });
}

export async function gerarNarracao(
  texto: string,
  destinoRelativo = './public/narracao.mp3',
  _preferenciaVoz?: PreferenciaVoz
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

  const lang = isLocaleUS() ? 'en' : 'pt-BR';

  console.log(`🗣️ Gerando áudio via HTTP TTS Gratuito (Lang: ${lang})...`);

  try {
    // Caso o texto seja muito longo, divide em blocos para respeitar o limite HTTP
    const frases = textoLimpo.match(/[^.!?]+[.!?]+/g) || [textoLimpo];
    const ficheirosTemporarios: string[] = [];

    for (let i = 0; i < frases.length; i++) {
      const parte = frases[i].trim();
      if (!parte) continue;

      const tempFile = path.join(pastaDestino, `part_${Date.now()}_${i}.mp3`);
      await descarregarAudioHTTP(parte, lang, tempFile);
      ficheirosTemporarios.push(tempFile);
    }

    // Se gerou apenas 1 ficheiro, move diretamente para o destino
    if (ficheirosTemporarios.length === 1) {
      if (fs.existsSync(destinoFinal)) fs.unlinkSync(destinoFinal);
      fs.renameSync(ficheirosTemporarios[0], destinoFinal);
    } else {
      // Junta os fragmentos no ficheiro final
      const writeStream = fs.createWriteStream(destinoFinal);
      for (const f of ficheirosTemporarios) {
        const buf = fs.readFileSync(f);
        writeStream.write(buf);
        fs.unlinkSync(f);
      }
      writeStream.end();
    }

    console.log(`✅ Áudio de narração gravado com sucesso em: ${destinoFinal}`);
  } catch (erro) {
    console.error(`❌ Erro ao gerar narração:`, erro);
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
