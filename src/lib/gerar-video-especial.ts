import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { publicarEmTodosOsCanais } from './buffer';
import { horaLisboaParaISO, resolverDueAtFuturo } from './buffer-agenda';
import { calcularDuracaoFrames } from './duracao-video';
import { obterImagemFundo, obterImagemFundoZenAstrologia } from './imagem-fundo';
import { prepararMusicaEspecial } from './musicas';
import { calcularSegmentosProgressivos } from './texto-progressivo';
import { gerarNarracaoPtPt } from './voz';
import type { SignoZodiaco } from './signos';

interface PropsVideoEspecial {
  signo: string;
  previsao: string;
  fechoTexto: string;
  imagemFundoUrl: string;
  musicaFundoArquivo: string;
  duracaoFrames: number;
  segmentosEcra?: Array<{ texto: string; frameInicio: number }>;
}

export interface OpcoesVideoEspecial {
  id: string;
  titulo: string;
  textoEcra: string;
  textoNarracao: string;
  legendas: { tiktok: string; instagram: string };
  data: string;
  generoVoz: 'feminina' | 'masculina' | 'aleatoria';
  tipoMusica?: 'zen' | 'mistico' | 'viral';
  slotHorario?: string;
  /** Segmentos de texto no ecrã — sincronizados com a narração */
  segmentosEcra?: string[];
  /** Fundo zen/astrologia/horóscopo (vídeos especiais) */
  fundoZenAstrologia?: boolean;
}

function garantirPasta(pasta: string): void {
  if (!fs.existsSync(pasta)) {
    fs.mkdirSync(pasta, { recursive: true });
  }
}

function renderizarVideoEspecial(id: string): void {
  const outputPath = './output/' + id + '.mp4';
  const comando =
    'npx remotion render src/index.ts HoroscopoComposition "' +
    outputPath +
    '" --props="./public/props-temporarias.json"';

  console.log('🚀 A renderizar: ' + outputPath);
  execSync(comando, { stdio: 'inherit', cwd: process.cwd() });
}

export async function gerarVideoEspecial(opcoes: OpcoesVideoEspecial): Promise<void> {
  garantirPasta('./public');
  garantirPasta('./output');

  const signoChave = 'caranguejo' as SignoZodiaco;

  const imagemFundoUrl = opcoes.fundoZenAstrologia
    ? await obterImagemFundoZenAstrologia(opcoes.id, opcoes.data)
    : await obterImagemFundo(signoChave, opcoes.data);
  const musicaFundoArquivo = await prepararMusicaEspecial(
    opcoes.id,
    opcoes.data,
    opcoes.tipoMusica ?? 'zen',
  );

  console.log('🎙️ Narração especial (' + opcoes.generoVoz + ')');
  await gerarNarracaoPtPt(opcoes.textoNarracao, './public/narracao.mp3', opcoes.generoVoz);

  const duracaoFrames = calcularDuracaoFrames('./public/narracao.mp3', 90);

  const segmentosProgressivos = opcoes.segmentosEcra?.length
    ? calcularSegmentosProgressivos(opcoes.segmentosEcra, duracaoFrames)
    : undefined;

  if (segmentosProgressivos) {
    console.log('📝 Texto progressivo no ecrã (' + segmentosProgressivos.length + ' segmentos):');
    segmentosProgressivos.forEach((s, i) => {
      console.log('   ' + (i + 1) + '. frame ' + s.frameInicio + ' → "' + s.texto.slice(0, 50) + '..."');
    });
  }

  const textoEcra = opcoes.textoEcra.includes('.')
    ? opcoes.textoEcra.length > 280
      ? opcoes.textoEcra.slice(0, 277).trim() + '...'
      : opcoes.textoEcra
    : opcoes.textoEcra;

  const props: PropsVideoEspecial = {
    signo: opcoes.titulo,
    previsao: segmentosProgressivos ? '' : textoEcra,
    fechoTexto: '',
    imagemFundoUrl,
    musicaFundoArquivo,
    duracaoFrames,
    segmentosEcra: segmentosProgressivos,
  };

  const caminhoProps = './public/props-temporarias.json';
  fs.writeFileSync(caminhoProps, JSON.stringify(props, null, 2));

  try {
    renderizarVideoEspecial(opcoes.id);
    const caminhoOutput = path.resolve('./output/' + opcoes.id + '.mp4');

    const dueAtCustom = opcoes.slotHorario
      ? resolverDueAtFuturo(horaLisboaParaISO(opcoes.data, opcoes.slotHorario))
      : undefined;

    await publicarEmTodosOsCanais(
      opcoes.id,
      caminhoOutput,
      opcoes.data,
      (service) =>
        service.toLowerCase() === 'instagram' ? opcoes.legendas.instagram : opcoes.legendas.tiktok,
      {
        subpasta: 'videos-especiais',
        dueAtCustom,
      },
    );
  } finally {
    if (fs.existsSync(caminhoProps)) {
      fs.unlinkSync(caminhoProps);
    }
  }
}
