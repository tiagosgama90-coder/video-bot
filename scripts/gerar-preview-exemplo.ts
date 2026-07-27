/**
 * Gera um MP4 de exemplo local (sem publicar) — fundo cósmico + logo Sidus.
 * Uso: SKIP_PUBLICAR=1 npx ts-node scripts/gerar-preview-exemplo.ts
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { calcularDuracaoFrames } from '../src/lib/duracao-video';
import { escolherFundoVideoZen } from '../src/lib/fundo-video';
import { obterImagemFundoCosmico } from '../src/lib/imagem-fundo';
import { prepararMusicaEspecial } from '../src/lib/musicas';
import { obterVolumeMusica } from '../src/lib/project-config';
import { gerarNarracao } from '../src/lib/voz';

const ID = 'preview-marketing';
const DATA = '2026-07-27';
const OUTPUT = './output/preview-logo-voz-masculina.mp4';

async function executar(): Promise<void> {
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public', { recursive: true });
  }
  if (!fs.existsSync('./output')) {
    fs.mkdirSync('./output', { recursive: true });
  }

  console.log('🎬 A gerar vídeo de exemplo (fundo cósmico + logo Sidus)...');

  const textoNarracao =
    'Peixes, a pessoa em quem pensaste agora aparece nos astros. A tua intuição está aguçada hoje. Visite o SidusAstro em sidusastro.com';

  try {
    await gerarNarracao(textoNarracao, './public/narracao.mp3', 'masculina');
  } catch (erro) {
    console.log('⚠️ Azure indisponível — narração silenciosa: ' + String(erro));
    execSync(
      'ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t 18 -q:a 9 "./public/narracao.mp3"',
      { stdio: 'pipe' },
    );
  }
  const duracaoFrames = calcularDuracaoFrames('./public/narracao.mp3', 22);

  const { seed: fundoVideoSeed } = escolherFundoVideoZen(ID, DATA);
  const { ficheiro: imagemFundoUrl } = await obterImagemFundoCosmico(ID, DATA);
  const musicaFundoArquivo = await prepararMusicaEspecial(ID, DATA, 'zen');

  const props = {
    signo: 'PEIXES',
    previsao:
      'A tua intuição está aguçada hoje. Confia nos sinais que o universo te envia e segue o teu coração com serenidade.',
    hookTexto: 'Peixes, a pessoa em quem pensaste agora aparece nos astros',
    fechoTexto: 'Visite o SidusAstro — mapa astral completo grátis em sidusastro.com',
    frameInicioPrevisao: Math.round(30 * 3),
    frameInicioFecho: duracaoFrames - Math.round(30 * 4.8),
    fundoVideoSeed,
    imagemFundoUrl,
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
  const destinoArtefacto = path.join(artefactos, 'preview-logo-voz-masculina.mp4');
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
