import dotenv from 'dotenv';
import { gerarVideoEspecial } from './src/lib/gerar-video-especial';
import { obterConteudoQuarta, obterSlotEspecial } from './src/lib/conteudo-especial';
import { isLocaleUS, sufixoIdVideoEspecial } from './src/lib/locale';
import {
  obterIdBaseQuarta,
  obterVarianteQuarta,
  rotuloVarianteQuarta,
} from './src/lib/quarta-alternada';
import { SLOT_MUSICA } from './src/lib/musicas';
import { obterDataPublicacao } from './src/lib/signos';
import { inicializarFirebaseSeNecessario } from './src/lib/inicializar-app';
import { exigirDiaSemana } from './src/lib/dia-semana';

dotenv.config();
inicializarFirebaseSeNecessario();

async function executar(): Promise<void> {
  exigirDiaSemana(3, 'quartas-feiras');

  const data = obterDataPublicacao();
  const variante = obterVarianteQuarta(data);
  const { conteudo } = obterConteudoQuarta(data);
  const idBase = obterIdBaseQuarta(variante);
  const id = sufixoIdVideoEspecial(idBase);
  const mercado = isLocaleUS() ? 'US (@sidusastro_en)' : 'PT';

  console.log(
    '✨ SidusAstro — Vídeo Quarta-feira [' +
      rotuloVarianteQuarta(variante) +
      '] [' +
      mercado +
      ']',
  );
  console.log('📅 Data: ' + data + ' · Variante: ' + variante);
  console.log('🏷️ Título no ecrã: ' + conteudo.titulo);
  if (conteudo.segmentosEcra?.length) {
    console.log('🖥️ Segmentos no ecrã: ' + conteudo.segmentosEcra.length);
    conteudo.segmentosEcra.forEach((s, i) => console.log('   ' + (i + 1) + '. ' + s));
  } else {
    console.log('🖥️ Texto no ecrã:\n' + conteudo.textoEcra);
  }
  console.log('🎙️ Narração:\n' + conteudo.textoNarracao);
  console.log('\n📋 Legenda TikTok:\n' + conteudo.legendas.tiktok);

  await gerarVideoEspecial({
    id: idBase,
    titulo: conteudo.titulo,
    textoEcra: conteudo.textoEcra,
    textoNarracao: conteudo.textoNarracao,
    segmentosEcra: conteudo.segmentosEcra,
    fundoZenAstrologia: true,
    legendas: conteudo.legendas,
    data,
    generoVoz: 'feminina',
    tipoMusica: 'zen',
    slotHorario: obterSlotEspecial(),
    slotMusica: SLOT_MUSICA.VIP_DIVULGACAO_QUARTA,
  });

  const tipo =
    variante === 'vip' ? 'VIP por Divulgação' : 'Afiliados';
  console.log(
    process.env.SKIP_PUBLICAR === '1'
      ? '\n🏁 Vídeo ' + tipo + ' concluído em output/' + id + '.mp4 (sem publicar no Buffer).'
      : isLocaleUS()
        ? '\n🏁 Vídeo ' + tipo + ' US concluído e enfileirado no TikTok @sidusastro_en!'
        : '\n🏁 Vídeo ' + tipo + ' concluído e enfileirado no Buffer!',
  );
}

executar().catch((erro) => {
  console.error('❌ Erro fatal:', erro);
  process.exit(1);
});
