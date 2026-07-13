import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { publicarEmTodosOsCanais } from './src/lib/buffer';
import { obterTextoHoroscopo } from './src/lib/horoscopo';
import { escolherFechoNarracao, gerarLegenda } from './src/lib/legenda';
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
dotenv.config();

const serviceAccount = require('./firebase-admin.json');

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

interface PropsVideo {
  signo: string;
  previsao: string;
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

async function processarSigno(signo: SignoZodiaco, data: string): Promise<void> {
  console.log('\n══════════════════════════════════════');
  console.log('🔮 A processar signo: ' + NOMES_SIGNOS[signo]);
  console.log('══════════════════════════════════════\n');

  const previsao = await obterTextoHoroscopo(signo, data);
  console.log('📝 Previsão: "' + previsao.slice(0, 120) + '..."');

  const imagemFundoUrl = await obterImagemFundo(signo, data);
  const musicaFundoArquivo = await prepararMusicaParaVideo(signo, data);

  const fechoNarracao = escolherFechoNarracao();
  const textoNarracao = previsao + fechoNarracao;
  console.log('🎙️ Fecho narração:' + fechoNarracao);
  await gerarNarracaoPtPt(textoNarracao, './public/narracao.mp3');

  const duracaoFrames = calcularDuracaoFrames('./public/narracao.mp3');

  const legenda = gerarLegenda(signo, previsao);
  console.log('📋 Legenda:\n' + legenda);

  const props: PropsVideo = {
    signo: NOMES_SIGNOS[signo],
    previsao,
    imagemFundoUrl,
    musicaFundoArquivo,
    duracaoFrames,
  };

  const caminhoProps = './public/props-temporarias.json';
  fs.writeFileSync(caminhoProps, JSON.stringify(props, null, 2));

  try {
    renderizarVideo(signo);
    const caminhoOutput = path.resolve('./output/' + signo + '-diario.mp4');
    await publicarEmTodosOsCanais(signo, caminhoOutput, data, () => legenda);
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
  const signosDoDia = escolherSignosParaExecucao(data, signosJaGerados);

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

  for (const signo of signosDoDia) {
    try {
      await processarSigno(signo, data);
    } catch (erro) {
      console.error('\n❌ ERRO no signo ' + NOMES_SIGNOS[signo] + ':');
      console.error(erro);
      throw erro;
    }
  }

  console.log('\n🏁 Automação concluída — vídeos publicados em Instagram + TikTok!');
}

executarRoboSidusAstro().catch((erro) => {
  console.error('❌ Erro fatal na automação:', erro);
  process.exit(1);
});
