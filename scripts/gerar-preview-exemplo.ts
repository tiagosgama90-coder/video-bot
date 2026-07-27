/**
 * Gera um MP4 de exemplo local (sem publicar) — fundo cósmico + logo Sidus.
 * Uso: SKIP_PUBLICAR=1 npx ts-node scripts/gerar-preview-exemplo.ts
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { calcularDuracaoFrames } from '../src/lib/duracao-video';
import { escolherFundoVideoZen } from '../src/lib/fundo-video';
import { obterImagemFundoZenAstrologia } from '../src/lib/imagem-fundo';
import { prepararMusicaEspecial } from '../src/lib/musicas';
import { obterVolumeMusica } from '../src/lib/project-config';

const ID = 'preview-marketing';
const DATA = '2026-07-27';
const OUTPUT = './output/preview-cosmico-nebulosa.mp4';

function gerarNarracaoPreview(texto: string, destino: string): void {
  const wav = destino.replace(/\.mp3$/, '.wav');
  const textoSeguro = texto.replace(/"/g, '').replace(/'/g, '');

  try {
    execSync('espeak-ng -v pt -s 148 "' + textoSeguro + '" -w "' + wav + '"', {
      stdio: 'pipe',
    });
    execSync(
      'ffmpeg -y -i "' + wav + '" -codec:a libmp3lame -qscale:a 4 "' + destino + '"',
      { stdio: 'pipe' },
    );
    if (fs.existsSync(wav)) {
      fs.unlinkSync(wav);
    }
    console.log('🎙️ Narração preview (espeak-ng)');
    return;
  } catch {
    console.log('⚠️ espeak-ng indisponível — narração silenciosa de 18s');
  }

  execSync(
    'ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t 18 -q:a 9 "' + destino + '"',
    { stdio: 'pipe' },
  );
}

async function executar(): Promise<void> {
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public', { recursive: true });
  }
  if (!fs.existsSync('./output')) {
    fs.mkdirSync('./output', { recursive: true });
  }

  console.log('🎬 A gerar vídeo de exemplo (fundo cósmico + logo Sidus)...');

  const textoNarracao =
    'Peixes, a pessoa em quem pensaste agora aparece nos astros. A tua intuição está aguçada hoje. O segredo que falta no vídeo está no teu mapa em sidusastro.com';

  gerarNarracaoPreview(textoNarracao, './public/narracao.mp3');
  const duracaoFrames = calcularDuracaoFrames('./public/narracao.mp3', 22);

  const { seed: fundoVideoSeed } = escolherFundoVideoZen(ID, DATA);
  const { ficheiro: imagemFundoUrl, modo: imagemFundoModo } = await obterImagemFundoZenAstrologia(ID, DATA);
  const musicaFundoArquivo = await prepararMusicaEspecial(ID, DATA, 'zen');

  const props = {
    signo: 'PEIXES',
    previsao:
      'A tua intuição está aguçada hoje. Confia nos sinais que o universo te envia e segue o teu coração com serenidade.',
    hookTexto: 'Peixes, a pessoa em quem pensaste agora aparece nos astros',
    fechoTexto: 'Não pares aqui - descobre tudo no mapa astral grátis em sidusastro.com',
    frameInicioPrevisao: Math.round(30 * 3),
    frameInicioFecho: duracaoFrames - Math.round(30 * 4.8),
    fundoVideoSeed,
    imagemFundoUrl,
    imagemFundoModo,
    musicaFundoArquivo,
    duracaoFrames,
    siteMarca: 'sidusastro.com',
    volumeMusica: obterVolumeMusica(),
  };

  const caminhoProps = './public/props-temporarias.json';
  fs.writeFileSync(caminhoProps, JSON.stringify(props, null, 2));

  const comando =
    'npx remotion render src/index.ts HoroscopoComposition "' +
    OUTPUT +
    '" --props="./public/props-temporarias.json"';

  console.log('🚀 A renderizar: ' + OUTPUT);
  execSync(comando, { stdio: 'inherit', cwd: process.cwd() });

  const artefactos = '/opt/cursor/artifacts';
  if (!fs.existsSync(artefactos)) {
    fs.mkdirSync(artefactos, { recursive: true });
  }
  const destinoArtefacto = path.join(artefactos, 'preview-cosmico-nebulosa.mp4');
  fs.copyFileSync(OUTPUT, destinoArtefacto);

  if (fs.existsSync(caminhoProps)) {
    fs.unlinkSync(caminhoProps);
  }

  console.log('\n✅ Exemplo pronto:');
  console.log('   ' + path.resolve(OUTPUT));
  console.log('   ' + destinoArtefacto);
}

executar().catch((erro) => {
  console.error('❌ Erro:', erro);
  process.exit(1);
});
