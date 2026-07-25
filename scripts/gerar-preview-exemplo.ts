/**
 * Gera um MP4 de exemplo local (sem publicar) para rever o fundo zen/reel.
 * Uso: SKIP_PUBLICAR=1 npx ts-node scripts/gerar-preview-exemplo.ts
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { calcularDuracaoFrames } from '../src/lib/duracao-video';
import { obterEtiquetaGanchoMotivacional } from '../src/lib/conteudo-especial';
import { escolherGanchoEspecial } from '../src/lib/ganchos-especial';
import { escolherFundoVideoZen } from '../src/lib/fundo-video';
import { obterImagemFundoZenAstrologia } from '../src/lib/imagem-fundo';
import { escolherFechoNarracao } from '../src/lib/legenda';
import { prepararMusicaEspecial } from '../src/lib/musicas';
import { obterVolumeMusica } from '../src/lib/project-config';

const ID = 'preview-exemplo';
const DATA = '2026-07-26';
const FRASE =
  'Hoje o universo conspira a teu favor. Respira fundo e confia no teu caminho espiritual.';
const OUTPUT = './output/preview-exemplo-zen.mp4';

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

  console.log('🎬 A gerar vídeo de exemplo zen/reel...');

  const hook = escolherGanchoEspecial('motivacao-quinta', DATA);
  const fecho = escolherFechoNarracao();
  const { ficheiro: imagemFundoUrl, modo: imagemFundoModo } = await obterImagemFundoZenAstrologia(ID, DATA);
  const fundo = escolherFundoVideoZen(ID, DATA);
  const musicaFundoArquivo = await prepararMusicaEspecial(ID, DATA, 'zen');

  gerarNarracaoPreview(FRASE, './public/narracao.mp3');
  const duracaoFrames = calcularDuracaoFrames('./public/narracao.mp3', 22);

  const props = {
    signo: obterEtiquetaGanchoMotivacional(DATA, 'quinta'),
    previsao: FRASE,
    hookTexto: hook,
    fechoTexto: fecho,
    frameInicioPrevisao: Math.round(30 * 3),
    frameInicioFecho: duracaoFrames - Math.round(30 * 4.8),
    fundoVideoSeed: fundo.seed,
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
  const destinoArtefacto = path.join(artefactos, 'preview-exemplo-zen.mp4');
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
