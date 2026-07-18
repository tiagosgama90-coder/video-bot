import dotenv from 'dotenv';
import { gerarVideoEspecial } from './src/lib/gerar-video-especial';
import { obterConteudoVipDivulgacao, obterSlotEspecial } from './src/lib/conteudo-especial';
import { isLocaleUS, sufixoIdVideoEspecial } from './src/lib/locale';
import { SLOT_MUSICA } from './src/lib/musicas';
import { obterDataPublicacao } from './src/lib/signos';
import { inicializarFirebaseSeNecessario } from './src/lib/inicializar-app';
import { exigirDiaSemana } from './src/lib/dia-semana';

dotenv.config();
inicializarFirebaseSeNecessario();

async function executar(): Promise<void> {
  exigirDiaSemana(3, 'quartas-feiras');

  const data = obterDataPublicacao();
  const conteudo = obterConteudoVipDivulgacao();
  const id = sufixoIdVideoEspecial('vip-divulgacao-quarta');
  const mercado = isLocaleUS() ? 'US (@sidusastro_en)' : 'PT';

  console.log('✨ SidusAstro — Vídeo VIP por Divulgação (Quarta-feira) [' + mercado + ']');
  console.log('📅 Data: ' + data);
  console.log('🏷️ Título no ecrã: ' + conteudo.titulo);
  console.log('🖥️ Segmentos no ecrã: ' + conteudo.segmentosEcra.length);
  console.log('🎙️ Narração:\n' + conteudo.textoNarracao);
  console.log('\n📋 Legenda TikTok:\n' + conteudo.legendas.tiktok);

  await gerarVideoEspecial({
    id: 'vip-divulgacao-quarta',
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

  console.log(
    process.env.SKIP_PUBLICAR === '1'
      ? '\n🏁 Vídeo VIP concluído em output/' + id + '.mp4 (sem publicar no Buffer).'
      : isLocaleUS()
        ? '\n🏁 Vídeo VIP US concluído e enfileirado no TikTok @sidusastro_en!'
        : '\n🏁 Vídeo VIP concluído e enfileirado no Buffer!',
  );
}

executar().catch((erro) => {
  console.error('❌ Erro fatal:', erro);
  process.exit(1);
});
