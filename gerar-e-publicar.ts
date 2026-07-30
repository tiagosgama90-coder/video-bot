import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { publicarEmTodosOsCanais, verificarCapacidadeBuffer, obterSignosJaPublicadosHoje, obterUltimaPublicacaoPorSigno } from './src/lib/buffer';
import { obterTextoHoroscopo, extrairAteSegundoPontoFinal } from './src/lib/horoscopo';
import { gerarLegendas } from './src/lib/legenda';
import { escolherFechoVoz } from './src/lib/fechos-narracao';
import { escolherFundoVideoZen, escolherIndiceGeometriaCentro } from './src/lib/fundo-video';
import { calcularDuracaoFrames, DURACAO_MAXIMA_DIARIO_SEG } from './src/lib/duracao-video';
import { calcularSegmentosProgressivos } from './src/lib/texto-progressivo';
import {
  calcularQuadrosNarracaoDiaria,
  montarTextoNarracaoDiaria,
} from './src/lib/narracao-diario';
import { prepararMusicaParaVideo, SLOT_MUSICA } from './src/lib/musicas';
import {
  escolherSignosParaExecucao,
  obterDataPublicacao,
  obterNomeSigno,
  SIGNOS_ZODIACO,
  type SignoZodiaco,
} from './src/lib/signos';
import { VIDEOS_HOROSCOPO_POR_DIA, HOROSCOPOS_EM_DIA_AFILIADOS } from './src/lib/publicacao-alcance';
import { ehDiaAfiliados } from './src/lib/dia-semana';
import { afiliadosDiaJaGerado, gerarAfiliadosDia } from './src/lib/afiliados-dia';
import { obterVolumeMusica } from './src/lib/project-config';
import { gerarNarracao, obterPreferenciaVozConfig } from './src/lib/voz';
import { inicializarFirebaseSeNecessario } from './src/lib/inicializar-app';
import { isLocaleUS, sufixoVideoDiario, urlSiteMarca } from './src/lib/locale';
import { sanitizarTextoPublico, filtrarTextoParaVideo } from './src/lib/texto-publico';
dotenv.config();

inicializarFirebaseSeNecessario({ obrigatorio: process.env.SKIP_PUBLICAR !== '1' });

const SLOTS_MUSICA_HOROSCOPO = [
  SLOT_MUSICA.HOROSCOPO_0,
  SLOT_MUSICA.HOROSCOPO_1,
  SLOT_MUSICA.HOROSCOPO_2,
] as const;

interface PropsVideo {
  signo: string;
  previsao: string;
  hookTexto: string;
  fechoTexto: string;
  fundoVideoSeed?: number;
  signoChave?: string;
  fundoVideoGeometria?: number;
  musicaFundoArquivo: string;
  duracaoFrames: number;
  frameInicioPrevisao: number;
  frameInicioFecho: number;
  segmentosEcra?: Array<{ texto: string; frameInicio: number }>;
  siteMarca: string;
  volumeMusica: number;
}

function garantirPasta(pasta: string): void {
  if (!fs.existsSync(pasta)) {
    fs.mkdirSync(pasta, { recursive: true });
  }
}

function renderizarVideo(signo: string): void {
  const outputPath = './output/' + signo + sufixoVideoDiario();
  const comando =
    'npx remotion render src/index.ts HoroscopoComposition "' +
    outputPath +
    '" --props="./public/props-temporarias.json"';

  console.log('🚀 A renderizar: ' + outputPath);
  execSync(comando, { stdio: 'inherit', cwd: process.cwd() });
  console.log('✨ Vídeo concluído: ' + outputPath);
}

function obterSignosJaGerados(): SignoZodiaco[] {
  if (!fs.existsSync('./output')) {
    return [];
  }

  const sufixo = sufixoVideoDiario();
  const gerados: SignoZodiaco[] = [];
  for (const ficheiro of fs.readdirSync('./output')) {
    if (!ficheiro.endsWith(sufixo)) {
      continue;
    }
    const chave = ficheiro.replace(sufixo, '') as SignoZodiaco;
    if (SIGNOS_ZODIACO.includes(chave)) {
      gerados.push(chave);
    }
  }
  return gerados;
}

async function processarSigno(
  signo: SignoZodiaco,
  data: string,
  indiceSlot: number,
): Promise<void> {
  console.log('\n══════════════════════════════════════');
  console.log('🔮 A processar signo: ' + obterNomeSigno(signo));
  console.log('══════════════════════════════════════\n');

  const previsao = await obterTextoHoroscopo(signo, data);
  const previsaoVideo = sanitizarTextoPublico(extrairAteSegundoPontoFinal(previsao));
  console.log('📝 Texto completo: "' + previsao.slice(0, 150) + '..."');
  console.log('✂️ Vídeo (1.ª + 2.ª frase por ponto final): "' + previsaoVideo + '"');

  const { seed: fundoVideoSeed } = escolherFundoVideoZen(signo, data);
  const fundoVideoGeometria = escolherIndiceGeometriaCentro(signo, data);
  console.log('🌌 Fundo cosmos animado (seed ' + fundoVideoSeed + ', geometria ' + fundoVideoGeometria + ')');
  const slotMusica =
    SLOTS_MUSICA_HOROSCOPO[indiceSlot] ??
    SLOTS_MUSICA_HOROSCOPO[indiceSlot % SLOTS_MUSICA_HOROSCOPO.length];
  const musicaFundoArquivo = await prepararMusicaParaVideo(signo, data, slotMusica);

  const legendas = gerarLegendas(signo, previsaoVideo, data);
  const hookTexto = filtrarTextoParaVideo(legendas.hook);
  const fechoVoz = filtrarTextoParaVideo(escolherFechoVoz(legendas.tema, signo, data));
  const fechoEcra = fechoVoz;

  const partesNarracao = {
    hook: hookTexto,
    previsao: previsaoVideo,
    fecho: fechoVoz,
  };
  const textoNarracao = montarTextoNarracaoDiaria(partesNarracao);
  console.log('🎙️ Narração completa: gancho → previsão → fecho');
  console.log('   "' + textoNarracao.slice(0, 120) + '..."');
  await gerarNarracao(textoNarracao, './public/narracao.mp3', obterPreferenciaVozConfig());

  const duracaoFrames = calcularDuracaoFrames(
    './public/narracao.mp3',
    DURACAO_MAXIMA_DIARIO_SEG,
  );
  const { frameInicioPrevisao, frameInicioFecho } = calcularQuadrosNarracaoDiaria(
    partesNarracao,
    duracaoFrames,
  );
  const segmentosEcra = calcularSegmentosProgressivos(
    [hookTexto, filtrarTextoParaVideo(previsaoVideo), fechoEcra],
    duracaoFrames,
  );
  console.log(
    '📺 Sincronização ecrã: previsão @ frame ' +
      frameInicioPrevisao +
      ', fecho @ frame ' +
      frameInicioFecho +
      ' (segmentos: ' +
      segmentosEcra.map((s) => s.frameInicio).join(', ') +
      ')',
  );

  console.log('📋 Legenda TikTok:\n' + legendas.tiktok);
  console.log('📋 Legenda Instagram:\n' + legendas.instagram);

  const props: PropsVideo = {
    signo: obterNomeSigno(signo),
    previsao: previsaoVideo,
    hookTexto,
    fechoTexto: fechoEcra,
    fundoVideoSeed,
    signoChave: signo,
    fundoVideoGeometria,
    musicaFundoArquivo,
    duracaoFrames,
    frameInicioPrevisao,
    frameInicioFecho,
    segmentosEcra,
    siteMarca: urlSiteMarca(),
    volumeMusica: obterVolumeMusica(),
  };

  const caminhoProps = './public/props-temporarias.json';
  fs.writeFileSync(caminhoProps, JSON.stringify(props, null, 2));

  try {
    renderizarVideo(signo);
    const caminhoOutput = path.resolve('./output/' + signo + sufixoVideoDiario());
    await publicarEmTodosOsCanais(signo + (isLocaleUS() ? '-diario-us' : '-diario'), caminhoOutput, data, (service) =>
      service.toLowerCase() === 'instagram' ? legendas.instagram : legendas.tiktok,
    { indiceSlot },
    );
  } finally {
    if (fs.existsSync(caminhoProps)) {
      fs.unlinkSync(caminhoProps);
    }
  }
}

async function executarRoboSidusAstro(): Promise<void> {
  const { verificarGravacaoStorage } = await import('./src/lib/storage-video');
  await verificarGravacaoStorage();

  const data = obterDataPublicacao();
  const diaAfiliados = ehDiaAfiliados();
  const maxHoroscopos = diaAfiliados ? HOROSCOPOS_EM_DIA_AFILIADOS : VIDEOS_HOROSCOPO_POR_DIA;
  await verificarCapacidadeBuffer(maxHoroscopos);

  const mercado = isLocaleUS() ? 'US (@sidusastro_en)' : 'PT (Instagram + TikTok)';
  console.log('🌌 SidusAstro Video Bot — automação diária iniciada [' + mercado + ']');
  console.log('📅 Data: ' + data);
  if (diaAfiliados) {
    console.log('💸 Dia de afiliados — 1 afiliado (fila livre) + 2 horóscopos');
  }

  garantirPasta('./public');
  garantirPasta('./output');

  if (diaAfiliados) {
    if (!afiliadosDiaJaGerado()) {
      try {
        await gerarAfiliadosDia(data);
      } catch (erro) {
        console.error('\n❌ ERRO no vídeo afiliados:');
        console.error(erro);
        throw erro;
      }
    } else {
      console.log('✅ Afiliados já gerados — a continuar com horóscopos.');
    }
  }

  const signosLocais = obterSignosJaGerados();
  const signosBufferHoje = await obterSignosJaPublicadosHoje(data);
  const ultimaPublicacao = await obterUltimaPublicacaoPorSigno();
  const signosJaGerados = [...new Set([...signosLocais, ...signosBufferHoje])];

  if (signosBufferHoje.length > 0) {
    console.log(
      '📋 Já no Buffer hoje: ' + signosBufferHoje.map((s) => obterNomeSigno(s)).join(', '),
    );
  }

  const candidatosRodacao = SIGNOS_ZODIACO.filter((s) => !signosJaGerados.includes(s)).sort(
    (a, b) => (ultimaPublicacao.get(a) ?? 0) - (ultimaPublicacao.get(b) ?? 0),
  );
  if (candidatosRodacao.length > 0) {
    const maisAntigos = candidatosRodacao
      .slice(0, Math.min(6, candidatosRodacao.length))
      .map((s) => obterNomeSigno(s))
      .join(', ');
    console.log('🔄 Rotação 12 signos — prioridade (há mais tempo sem sair): ' + maisAntigos);
  }

  // 3 ou 2 signos/dia — rotação justa pelos 12 (não repete os de hoje)
  let signosDoDia = escolherSignosParaExecucao(maxHoroscopos, signosJaGerados, ultimaPublicacao);
  signosDoDia = signosDoDia.slice(0, maxHoroscopos);

  if (signosDoDia.length === 0) {
    console.log('✅ Todos os signos de hoje já estão no Buffer — nada a gerar/publicar.');
    return;
  }

  if (process.env.TESTE_LOCAL === '1') {
    console.log('🧪 Modo teste local: 1 signo aleatório por execução');
  } else if (process.env.CI !== 'true') {
    console.log('💻 Modo local: signos pendentes do dia (já gerados: ' + (signosJaGerados.join(', ') || 'nenhum') + ')');
  }

  console.log(
    '🎲 Signos escolhidos (' +
      signosDoDia.length +
      '): ' +
      signosDoDia.map((s) => obterNomeSigno(s)).join(', '),
  );

  let erros = 0;
  let sucessos = diaAfiliados && afiliadosDiaJaGerado() ? 1 : 0;
  for (let i = 0; i < signosDoDia.length; i++) {
    try {
      await processarSigno(signosDoDia[i], data, signosJaGerados.length + i);
      sucessos++;
    } catch (erro) {
      erros++;
      console.error('\n❌ ERRO no signo ' + obterNomeSigno(signosDoDia[i]) + ':');
      console.error(erro);
    }
  }

  if (sucessos === 0) {
    throw new Error(
      diaAfiliados
        ? 'Nenhum vídeo foi gerado/publicado — afiliados e horóscopos falharam.'
        : 'Nenhum vídeo foi gerado/publicado — todos os signos falharam.',
    );
  }

  if (erros > 0) {
    console.log(
      '\n⚠️ ' +
        erros +
        ' signo(s) falharam, mas ' +
        sucessos +
        ' vídeo(s) foram publicados com sucesso. O workflow continua OK.',
    );
  }

  console.log(
    process.env.SKIP_PUBLICAR === '1'
      ? '\n🏁 Automação concluída — vídeos em output/ (sem publicar no Buffer).'
      : isLocaleUS()
        ? '\n🏁 Automação concluída — vídeos publicados em TikTok US (@sidusastro_en)'
          + (process.env.BUFFER_INSTAGRAM_US_CHANNEL_ID ? ' + Instagram US!' : '!')
        : '\n🏁 Automação concluída — vídeos publicados em Instagram + TikTok!',
  );
}

executarRoboSidusAstro().catch((erro) => {
  console.error('❌ Erro fatal na automação:', erro);
  process.exit(1);
});
