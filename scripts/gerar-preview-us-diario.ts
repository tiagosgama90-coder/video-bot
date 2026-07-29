/**
 * Preview vídeo horóscopo diário US — voz feminina + masculina (Azure Neural).
 * Uso: LOCALE=en-US npx ts-node scripts/gerar-preview-us-diario.ts
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

process.env.LOCALE = 'en-US';
dotenv.config();

import { calcularDuracaoFrames, DURACAO_MAXIMA_DIARIO_SEG } from '../src/lib/duracao-video';
import { escolherFechoVoz } from '../src/lib/fechos-narracao';
import { escolherFundoVideoZen } from '../src/lib/fundo-video';
import { gerarLegendas } from '../src/lib/legenda';
import { urlSiteMarca } from '../src/lib/locale';
import {
  calcularQuadrosNarracaoDiaria,
  montarTextoNarracaoDiaria,
} from '../src/lib/narracao-diario';
import { prepararMusicaParaVideo, SLOT_MUSICA } from '../src/lib/musicas';
import { obterVolumeMusica } from '../src/lib/project-config';
import { obterNomeSigno, type SignoZodiaco } from '../src/lib/signos';
import { calcularSegmentosProgressivos } from '../src/lib/texto-progressivo';
import { filtrarTextoParaVideo } from '../src/lib/texto-publico';
import { gerarNarracao } from '../src/lib/voz';

const DATA = '2026-07-29';
const SIGNO: SignoZodiaco = 'leao';
const ARTEFACTOS = '/opt/cursor/artifacts';

const PREVISAO_EXEMPLO =
  'Today your creative energy peaks at midday. Trust your instincts in love and let conversations flow naturally.';

function garantirPastas(): void {
  for (const pasta of ['./public', './output', ARTEFACTOS]) {
    if (!fs.existsSync(pasta)) {
      fs.mkdirSync(pasta, { recursive: true });
    }
  }
}

async function renderizarPreview(
  nome: string,
  props: Record<string, unknown>,
): Promise<string> {
  const output = './output/' + nome + '.mp4';
  const caminhoProps = './public/props-preview-' + nome + '.json';
  fs.writeFileSync(caminhoProps, JSON.stringify(props, null, 2));
  execSync(
    'npx remotion render src/index.ts HoroscopoComposition "' +
      output +
      '" --props="' +
      caminhoProps +
      '"',
    { stdio: 'inherit', cwd: process.cwd() },
  );
  if (fs.existsSync(caminhoProps)) {
    fs.unlinkSync(caminhoProps);
  }
  const destino = path.join(ARTEFACTOS, nome + '.mp4');
  fs.copyFileSync(output, destino);
  return destino;
}

async function gerarPreview(genero: 'feminina' | 'masculina'): Promise<string> {
  const nome = 'preview-us-leo-' + genero;
  const previsaoVideo = filtrarTextoParaVideo(PREVISAO_EXEMPLO);
  const legendas = gerarLegendas(SIGNO, previsaoVideo, DATA);
  const hookTexto = filtrarTextoParaVideo(legendas.hook);
  const fechoVoz = filtrarTextoParaVideo(escolherFechoVoz(legendas.tema, SIGNO, DATA));

  const partesNarracao = {
    hook: hookTexto,
    previsao: previsaoVideo,
    fecho: fechoVoz,
  };
  const textoNarracao = montarTextoNarracaoDiaria(partesNarracao);

  console.log('\n══════════════════════════════════════');
  console.log('🎙️ Preview US — voz ' + genero);
  console.log('📝 Hook: ' + hookTexto);
  console.log('📝 Previsão: ' + previsaoVideo);
  console.log('📝 Fecho: ' + fechoVoz);
  console.log('══════════════════════════════════════\n');

  await gerarNarracao(textoNarracao, './public/narracao.mp3', genero);

  const duracaoFrames = calcularDuracaoFrames('./public/narracao.mp3', DURACAO_MAXIMA_DIARIO_SEG);
  const { frameInicioPrevisao, frameInicioFecho } = calcularQuadrosNarracaoDiaria(
    partesNarracao,
    duracaoFrames,
  );
  const segmentosEcra = calcularSegmentosProgressivos(
    [hookTexto, previsaoVideo, fechoVoz],
    duracaoFrames,
  );

  const { seed: fundoVideoSeed } = escolherFundoVideoZen(SIGNO, DATA);
  const musicaFundoArquivo = await prepararMusicaParaVideo(SIGNO, DATA, SLOT_MUSICA.HOROSCOPO_0);

  return renderizarPreview(nome, {
    signo: obterNomeSigno(SIGNO),
    previsao: previsaoVideo,
    hookTexto,
    fechoTexto: fechoVoz,
    frameInicioPrevisao,
    frameInicioFecho,
    fundoVideoSeed,
    musicaFundoArquivo,
    duracaoFrames,
    segmentosEcra,
    siteMarca: urlSiteMarca(),
    volumeMusica: obterVolumeMusica(),
  });
}

async function executar(): Promise<void> {
  garantirPastas();
  console.log('🎬 A gerar previews US (Leo) — Ava feminina + Andrew masculina...');

  const feminina = await gerarPreview('feminina');
  const masculina = await gerarPreview('masculina');

  console.log('\n✅ Previews US prontos:');
  console.log('   Feminina: ' + feminina);
  console.log('   Masculina: ' + masculina);
}

executar().catch((erro) => {
  console.error('❌ Erro:', erro);
  process.exit(1);
});
