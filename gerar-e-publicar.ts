import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { publicarEmTodosOsCanais } from './src/lib/buffer';
import { obterTextoHoroscopo, extrairAteSegundoPontoFinal } from './src/lib/horoscopo';
import { escolherFechoNarracao, gerarLegendas } from './src/lib/legenda';
import { obterImagemFundo } from './src/lib/imagem-fundo';
import { calcularDuracaoFrames } from './src/lib/duracao-video';
import { prepararMusicaParaVideo } from './src/lib/musicas';
import {
  escolherSignosParaExecucao,
  NOMES_SIGNOS,
  obterDataLisboa,
  SIGNOS_ZODIACO,
  type SignoZodiaco,
} from './src/lib/signos';
import { gerarNarracaoPtPt } from './src/lib/voz';
import { inicializarFirebaseSeNecessario } from './src/lib/inicializar-app';
dotenv.config();

inicializarFirebaseSeNecessario({ obrigatorio: process.env.SKIP_PUBLICAR !== '1' });

interface PropsVideo {
  signo: string;
  previsao: string;
  fechoTexto: string;
  imagemFundoUrl: string;
  musicaFundoArquivo: string;
  duracaoFrames: number;
}

function garantirPasta(pasta: string): void {
  if (!fs.existsSync(pasta)) {
    fs.mkdirSync(pasta, { recursive: true });
  }
}

function renderizarVideo(signo: string): void {
  const outputPath = './output/' + signo + '-diario.mp4';
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

  const gerados: SignoZodiaco[] = [];
  for (const ficheiro of fs.readdirSync('./output')) {
    if (!ficheiro.endsWith('-diario.mp4')) {
      continue;
    }
    const chave = ficheiro.replace('-diario.mp4', '') as SignoZodiaco;
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
  console.log('🔮 A processar signo: ' + NOMES_SIGNOS[signo]);
  console.log('══════════════════════════════════════\n');

  const previsao = await obterTextoHoroscopo(signo, data);
  const previsaoVideo = extrairAteSegundoPontoFinal(previsao);
  console.log('📝 Texto completo: "' + previsao.slice(0, 150) + '..."');
  console.log('✂️ Vídeo (1.ª + 2.ª frase por ponto final): "' + previsaoVideo + '"');

  const imagemFundoUrl = await obterImagemFundo(signo, data);
  const musicaFundoArquivo = await prepararMusicaParaVideo(signo, data);

  const fechoNarracao = escolherFechoNarracao();
  const fechoEcra = fechoNarracao.replace(/^\.\s+/, '');
  const textoNarracao = previsaoVideo + fechoNarracao;
  console.log('🎙️ Narração: "' + previsaoVideo + '"' + fechoNarracao);
  await gerarNarracaoPtPt(textoNarracao, './public/narracao.mp3', 'aleatoria');

  const duracaoFrames = calcularDuracaoFrames('./public/narracao.mp3');

  const legendas = gerarLegendas(signo, previsaoVideo);
  console.log('📋 Legenda TikTok:\n' + legendas.tiktok);
  console.log('📋 Legenda Instagram:\n' + legendas.instagram);

  const props: PropsVideo = {
    signo: NOMES_SIGNOS[signo],
    previsao: previsaoVideo,
    fechoTexto: fechoEcra,
    imagemFundoUrl,
    musicaFundoArquivo,
    duracaoFrames,
  };

  const caminhoProps = './public/props-temporarias.json';
  fs.writeFileSync(caminhoProps, JSON.stringify(props, null, 2));

  try {
    renderizarVideo(signo);
    const caminhoOutput = path.resolve('./output/' + signo + '-diario.mp4');
    await publicarEmTodosOsCanais(signo + '-diario', caminhoOutput, data, (service) =>
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
  const data = obterDataLisboa();
  console.log('🌌 SidusAstro Video Bot — automação diária iniciada');
  console.log('📅 Data (Lisboa): ' + data);

  garantirPasta('./public');
  garantirPasta('./output');

  const signosJaGerados = obterSignosJaGerados();
  
  // Obtém os signos calculados para o dia e força o limite máximo de 3 signos por execução
  let signosDoDia = escolherSignosParaExecucao(data, signosJaGerados);
  signosDoDia = signosDoDia.slice(0, 3); // 👈 ADICIONADO: Garante estritamente o limite de 3 vídeos

  if (process.env.TESTE_LOCAL === '1') {
    console.log('🧪 Modo teste local: 1 signo aleatório por execução');
  } else if (process.env.CI !== 'true') {
    console.log('💻 Modo local: signos pendentes do dia (já gerados: ' + (signosJaGerados.join(', ') || 'nenhum') + ')');
  }

  console.log(
    '🎲 Signos do dia (' +
      signosDoDia.length +
      '): ' +
      signosDoDia.map((s) => NOMES_SIGNOS[s]).join(', '),
  );

  let erros = 0;
  for (let i = 0; i < signosDoDia.length; i++) {
    try {
      await processarSigno(signosDoDia[i], data, i);
    } catch (erro) {
      erros++;
      console.error('\n❌ ERRO no signo ' + NOMES_SIGNOS[signosDoDia[i]] + ':');
      console.error(erro);
    }
  }

  if (erros > 0) {
    throw new Error(erros + ' signo(s) falharam na geração/publicação.');
  }

  console.log(
    process.env.SKIP_PUBLICAR === '1'
      ? '\n🏁 Automação concluída — vídeos em output/ (sem publicar no Buffer).'
      : '\n🏁 Automação concluída — vídeos publicados em Instagram + TikTok!',
  );
}

executarRoboSidusAstro().catch((erro) => {
  console.error('❌ Erro fatal na automação:', erro);
  process.exit(1);
});
