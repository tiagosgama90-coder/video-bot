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

function aguardar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function narrarComRetry(
  texto: string,
  genero: 'feminina' | 'masculina',
  tentativas = 3,
): Promise<void> {
  let ultimoErro: unknown;
  for (let i = 0; i < tentativas; i++) {
    try {
      await gerarNarracao(texto, './public/narracao.mp3', genero);
      return;
    } catch (erro) {
      ultimoErro = erro;
      console.log('⚠️ Narração falhou (tentativa ' + (i + 1) + '/' + tentativas + '): ' + String(erro));
      if (i < tentativas - 1) {
        await aguardar(4000 * (i + 1));
      }
    }
  }
  throw ultimoErro;
}

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

  await narrarComRetry(textoNarracao, genero);

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

async function publicarPreviewsOnline(caminhos: string[]): Promise<void> {
  if (!process.env.CLOUDINARY_CLOUD_NAME?.trim()) {
    console.log('ℹ️ Cloudinary não configurado — previews só em output/ local.');
    return;
  }
  const { uploadVideoPublico } = await import('../src/lib/storage-video');
  for (const caminho of caminhos) {
    const id = path.basename(caminho, '.mp4');
    const url = await uploadVideoPublico(caminho, id, DATA, 'previews-us');
    console.log('\n🔗 Preview online (' + id + '):\n   ' + url);
    if (process.env.GITHUB_STEP_SUMMARY) {
      fs.appendFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        '\n### ' + id + '\n\n[Abrir vídeo](' + url + ')\n\n',
      );
    }
  }
}

async function executar(): Promise<void> {
  garantirPastas();
  console.log('🎬 A gerar previews US (Leo) — Ava feminina + Andrew masculina...');

  const gerados: string[] = [];
  for (const genero of ['feminina', 'masculina'] as const) {
    try {
      gerados.push(await gerarPreview(genero));
      await aguardar(5000);
    } catch (erro) {
      console.error('❌ Falha preview ' + genero + ':', erro);
    }
  }

  if (gerados.length === 0) {
    throw new Error('Nenhum preview US foi gerado');
  }

  console.log('\n✅ Previews US prontos (' + gerados.length + '/2):');
  gerados.forEach((caminho) => console.log('   ' + caminho));
  await publicarPreviewsOnline(gerados);
}

executar().catch((erro) => {
  console.error('❌ Erro:', erro);
  process.exit(1);
});
