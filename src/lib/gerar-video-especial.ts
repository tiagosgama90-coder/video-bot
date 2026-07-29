import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { publicarEmTodosOsCanais } from './buffer';
import { horaFusoParaISO, resolverDueAtFuturo } from './buffer-agenda';
import { calcularDuracaoFrames } from './duracao-video';
import { escolherGanchoEspecialComTema } from './ganchos-especial';
import { escolherFundoVideo, escolherFundoVideoZen, type TemaFundoMistico } from './fundo-video';
import { obterImagemFundoZenAstrologia } from './imagem-fundo';
import { escolherFechoNarracao } from './legenda';
import {
  isLocaleUS,
  obterFusoPublicacao,
  subpastaVideosEspeciaisFirebase,
  sufixoIdVideoEspecial,
  urlSiteMarca,
} from './locale';
import { prepararMusicaEspecial } from './musicas';
import {
  calcularQuadrosNarracaoDiaria,
  montarTextoNarracaoDiaria,
} from './narracao-diario';
import { calcularSegmentosProgressivos } from './texto-progressivo';
import { obterVolumeMusica } from './project-config';
import { sanitizarTextoPublico } from './texto-publico';
import { gerarNarracao } from './voz';
import type { SignoZodiaco } from './signos';

interface PropsVideoEspecial {
  signo: string;
  previsao: string;
  hookTexto: string;
  fechoTexto: string;
  frameInicioPrevisao: number;
  frameInicioFecho: number;
  fundoVideoTema?: TemaFundoMistico;
  fundoVideoSeed?: number;
  imagemFundoUrl?: string;
  imagemFundoModo?: 'color' | 'mono';
  musicaFundoArquivo: string;
  duracaoFrames: number;
  siteMarca?: string;
  volumeMusica?: number;
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
  segmentosEcra?: string[];
  fundoZenAstrologia?: boolean;
  gancho?: string;
  fecho?: string;
  slotMusica?: number;
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

  const { verificarGravacaoStorage } = await import('./storage-video');
  await verificarGravacaoStorage();

  const idPublicacao = sufixoIdVideoEspecial(opcoes.id);
  const signoChave = 'caranguejo' as SignoZodiaco;

  let fundoVideoTema: TemaFundoMistico | undefined;
  let fundoVideoSeed: number | undefined;
  let imagemFundoUrl: string | undefined;
  let imagemFundoModo: 'color' | 'mono' | undefined;

  const fundo = escolherFundoVideoZen(idPublicacao, opcoes.data);
  fundoVideoSeed = fundo.seed;

  if (opcoes.fundoZenAstrologia) {
    const imagem = await obterImagemFundoZenAstrologia(idPublicacao, opcoes.data);
    imagemFundoUrl = imagem.ficheiro;
    imagemFundoModo = imagem.modo;
    console.log(
      '🎨 Fundo zen IA 9:16: ' +
        imagemFundoUrl +
        ' (' +
        imagem.modo +
        ', simétrico, seed ' +
        fundoVideoSeed +
        ')',
    );
  } else {
    console.log('🌌 Fundo cosmos animado (seed ' + fundoVideoSeed + ')');
    const fundoLegacy = escolherFundoVideo(signoChave, opcoes.data);
    fundoVideoTema = fundoLegacy.tema;
  }

  const musicaFundoArquivo = await prepararMusicaEspecial(
    idPublicacao,
    opcoes.data,
    opcoes.tipoMusica ?? 'zen',
    opcoes.slotMusica,
  );

  const gancho = opcoes.gancho
    ? { texto: opcoes.gancho, tema: escolherGanchoEspecialComTema(opcoes.id, opcoes.data).tema }
    : escolherGanchoEspecialComTema(opcoes.id, opcoes.data);
  const hookTexto = sanitizarTextoPublico(gancho.texto);
  const fechoTexto = sanitizarTextoPublico(
    opcoes.fecho ?? escolherFechoNarracao(gancho.tema, undefined, opcoes.data),
  );
  const segmentosLimpos = opcoes.segmentosEcra?.map(sanitizarTextoPublico);
  const corpoNarracao = segmentosLimpos?.length
    ? segmentosLimpos.join('. ')
    : sanitizarTextoPublico(opcoes.textoNarracao);

  const partesNarracao = {
    hook: hookTexto,
    previsao: corpoNarracao,
    fecho: fechoTexto,
  };
  const textoNarracao = montarTextoNarracaoDiaria(partesNarracao);

  console.log('🎙️ Narração especial (' + opcoes.generoVoz + ') [' + (isLocaleUS() ? 'en-US' : 'pt-BR') + ']');
  console.log('   Gancho → corpo → fecho (voz completa)');
  await gerarNarracao(textoNarracao, './public/narracao.mp3', opcoes.generoVoz);

  const maxSegundos = opcoes.segmentosEcra?.length ? 38 : 28;
  const duracaoFrames = calcularDuracaoFrames('./public/narracao.mp3', maxSegundos);
  const { frameInicioPrevisao, frameInicioFecho } = calcularQuadrosNarracaoDiaria(
    partesNarracao,
    duracaoFrames,
  );

  let segmentosProgressivos = segmentosLimpos?.length
    ? calcularSegmentosProgressivos(
        segmentosLimpos,
        Math.max(frameInicioFecho - frameInicioPrevisao, 60),
        0,
        0,
      ).map((s) => ({
        ...s,
        frameInicio: s.frameInicio + frameInicioPrevisao,
      }))
    : undefined;

  if (segmentosProgressivos) {
    console.log('📝 Texto progressivo no ecrã (' + segmentosProgressivos.length + ' segmentos):');
    segmentosProgressivos.forEach((s, i) => {
      console.log('   ' + (i + 1) + '. frame ' + s.frameInicio + ' → "' + s.texto.slice(0, 50) + '..."');
    });
  }

  const textoEcraBruto = sanitizarTextoPublico(opcoes.textoEcra);
  const textoEcra = textoEcraBruto.includes('.')
    ? textoEcraBruto.length > 280
      ? textoEcraBruto.slice(0, 277).trim() + '...'
      : textoEcraBruto
    : textoEcraBruto;

  const props: PropsVideoEspecial = {
    signo: sanitizarTextoPublico(opcoes.titulo),
    previsao: segmentosProgressivos ? '' : textoEcra,
    hookTexto,
    fechoTexto,
    frameInicioPrevisao,
    frameInicioFecho,
    fundoVideoTema,
    fundoVideoSeed,
    imagemFundoUrl,
    imagemFundoModo,
    musicaFundoArquivo,
    duracaoFrames,
    siteMarca: urlSiteMarca(),
    volumeMusica: obterVolumeMusica(),
    segmentosEcra: segmentosProgressivos,
  };

  const caminhoProps = './public/props-temporarias.json';
  fs.writeFileSync(caminhoProps, JSON.stringify(props, null, 2));

  try {
    renderizarVideoEspecial(idPublicacao);
    const caminhoOutput = path.resolve('./output/' + idPublicacao + '.mp4');

    const dueAtCustom = opcoes.slotHorario
      ? resolverDueAtFuturo(
          horaFusoParaISO(opcoes.data, opcoes.slotHorario, obterFusoPublicacao()),
        )
      : undefined;

    await publicarEmTodosOsCanais(
      idPublicacao,
      caminhoOutput,
      opcoes.data,
      (service) =>
        sanitizarTextoPublico(
          service.toLowerCase() === 'instagram' ? opcoes.legendas.instagram : opcoes.legendas.tiktok,
        ),
      {
        subpasta: subpastaVideosEspeciaisFirebase(),
        dueAtCustom,
      },
    );
  } finally {
    if (fs.existsSync(caminhoProps)) {
      fs.unlinkSync(caminhoProps);
    }
  }
}
