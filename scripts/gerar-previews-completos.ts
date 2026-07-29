/**
 * Gera 2 vídeos de exemplo: horóscopo diário + motivacional zen Pinterest.
 * Uso: SKIP_PUBLICAR=1 npx ts-node scripts/gerar-previews-completos.ts
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { escolherGanchoDiario } from '../src/lib/ganchos-diario';
import { escolherGanchoEspecialComTema } from '../src/lib/ganchos-especial';
import { obterEtiquetaGanchoMotivacional } from '../src/lib/conteudo-especial';
import { calcularDuracaoFrames } from '../src/lib/duracao-video';
import { escolherFundoVideo, escolherFundoVideoZen, escolherIndiceGeometriaCentro } from '../src/lib/fundo-video';
import { obterImagemFundo } from '../src/lib/imagem-fundo';
import { obterImagemFundoZenAstrologia } from '../src/lib/imagem-fundo';
import { escolherFechoNarracao } from '../src/lib/legenda';
import {
  calcularQuadrosNarracaoDiaria,
  montarTextoNarracaoDiaria,
} from '../src/lib/narracao-diario';
import { prepararMusicaEspecial, prepararMusicaParaVideo, SLOT_MUSICA } from '../src/lib/musicas';
import { obterVolumeMusica } from '../src/lib/project-config';
import { gerarNarracao } from '../src/lib/voz';

const DATA = '2026-07-26';
const ARTEFACTOS = '/opt/cursor/artifacts';

async function renderizarPreview(
  nome: string,
  props: Record<string, unknown>,
): Promise<string> {
  const output = './output/' + nome + '.mp4';
  const caminhoProps = './public/props-preview-' + nome + '.json';
  fs.writeFileSync(caminhoProps, JSON.stringify(props, null, 2));
  const comando =
    'npx remotion render src/index.ts HoroscopoComposition "' +
    output +
    '" --props="' +
    caminhoProps +
    '"';
  console.log('\n🚀 A renderizar: ' + output);
  execSync(comando, { stdio: 'inherit', cwd: process.cwd() });
  if (fs.existsSync(caminhoProps)) {
    fs.unlinkSync(caminhoProps);
  }
  const destino = path.join(ARTEFACTOS, nome + '.mp4');
  fs.copyFileSync(output, destino);
  return destino;
}

async function narrar(partes: { hook: string; previsao: string; fecho: string }): Promise<{
  duracaoFrames: number;
  frameInicioPrevisao: number;
  frameInicioFecho: number;
}> {
  const texto = montarTextoNarracaoDiaria(partes);
  try {
    await gerarNarracao(texto, './public/narracao.mp3', 'feminina');
  } catch (erro) {
    console.log('⚠️ Azure indisponível - narração silenciosa: ' + String(erro));
    execSync(
      'ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t 22 -q:a 9 "./public/narracao.mp3"',
      { stdio: 'pipe' },
    );
  }
  const duracaoFrames = calcularDuracaoFrames('./public/narracao.mp3', 32);
  const quadros = calcularQuadrosNarracaoDiaria(partes, duracaoFrames);
  return { duracaoFrames, ...quadros };
}

async function previewDiario(): Promise<string> {
  const signo = 'touro';
  const previsao =
    'Hoje a energia favorece decisões práticas no trabalho. Confia na tua intuição ao falar de dinheiro.';
  const { texto: hook, tema } = escolherGanchoDiario(signo, previsao, DATA);
  const fecho = escolherFechoNarracao(tema, signo, DATA);
  const { duracaoFrames, frameInicioPrevisao, frameInicioFecho } = await narrar({
    hook,
    previsao,
    fecho,
  });
  const fundo = escolherFundoVideo(signo, DATA);
  const fundoVideoGeometria = escolherIndiceGeometriaCentro(signo, DATA);
  const { ficheiro: imagem, modo: imagemFundoModo } = await obterImagemFundo(signo, DATA);
  const musica = await prepararMusicaParaVideo(signo, DATA, SLOT_MUSICA.HOROSCOPO_0);

  return renderizarPreview('preview-diario-touro', {
    signo: 'Touro',
    previsao,
    hookTexto: hook,
    fechoTexto: fecho,
    frameInicioPrevisao,
    frameInicioFecho,
    imagemFundoUrl: imagem,
    imagemFundoModo,
    fundoVideoSeed: fundo.seed,
    signoChave: signo,
    fundoVideoGeometria,
    musicaFundoArquivo: musica,
    duracaoFrames,
    siteMarca: 'sidusastro.com',
    volumeMusica: obterVolumeMusica(),
  });
}

async function previewMotivacionalZen(): Promise<string> {
  const frase =
    'Hoje o universo conspira a teu favor. Respira fundo e confia no teu caminho espiritual.';
  const { texto: hook, tema } = escolherGanchoEspecialComTema('motivacao-quinta', DATA);
  const fecho = escolherFechoNarracao(tema, undefined, DATA);
  const { duracaoFrames, frameInicioPrevisao, frameInicioFecho } = await narrar({
    hook,
    previsao: frase,
    fecho,
  });
  const { ficheiro: imagem, modo: imagemFundoModo } = await obterImagemFundoZenAstrologia('preview-motivacional', DATA);
  const fundo = escolherFundoVideoZen('preview-motivacional', DATA);
  const fundoVideoGeometria = escolherIndiceGeometriaCentro('preview-motivacional', DATA);
  const musica = await prepararMusicaEspecial('preview-motivacional', DATA, 'zen');

  return renderizarPreview('preview-motivacional-zen', {
    signo: obterEtiquetaGanchoMotivacional(DATA, 'quinta'),
    previsao: frase,
    hookTexto: hook,
    fechoTexto: fecho,
    frameInicioPrevisao,
    frameInicioFecho,
    imagemFundoUrl: imagem,
    imagemFundoModo,
    fundoVideoSeed: fundo.seed,
    signoChave: 'caranguejo',
    fundoVideoGeometria,
    musicaFundoArquivo: musica,
    duracaoFrames,
    siteMarca: 'sidusastro.com',
    volumeMusica: obterVolumeMusica(),
  });
}

async function executar(): Promise<void> {
  if (!fs.existsSync('./public')) fs.mkdirSync('./public', { recursive: true });
  if (!fs.existsSync('./output')) fs.mkdirSync('./output', { recursive: true });
  if (!fs.existsSync(ARTEFACTOS)) fs.mkdirSync(ARTEFACTOS, { recursive: true });

  console.log('🎬 A gerar previews completos (gancho + corpo + fecho + voz)...');
  const diario = await previewDiario();
  const motivacional = await previewMotivacionalZen();

  console.log('\n✅ Previews prontos:');
  console.log('   Diário:       ' + diario);
  console.log('   Motivacional: ' + motivacional);
}

executar().catch((erro) => {
  console.error('❌ Erro:', erro);
  process.exit(1);
});
