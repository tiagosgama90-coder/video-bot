import dotenv from 'dotenv';
import { gerarVideoEspecial } from './src/lib/gerar-video-especial';
import { obterConteudoAfiliados, obterSlotEspecial } from './src/lib/conteudo-especial';
import { isLocaleUS, sufixoIdVideoEspecial } from './src/lib/locale';
import { obterDataPublicacao } from './src/lib/signos';
import { inicializarFirebaseSeNecessario } from './src/lib/inicializar-app';

dotenv.config();
inicializarFirebaseSeNecessario();

async function executar(): Promise<void> {
  const data = obterDataPublicacao();
  const conteudo = obterConteudoAfiliados();
  const id = sufixoIdVideoEspecial('afiliados-quarta');
  const mercado = isLocaleUS() ? 'US (@sidusastro_en)' : 'PT';

  console.log('💰 SidusAstro — Vídeo Afiliados (Quarta-feira) [' + mercado + ']');
  console.log('📅 Data: ' + data);
  console.log('🏷️ Título no ecrã: ' + conteudo.titulo);
  console.log('🖥️ Texto no ecrã:\n' + conteudo.textoEcra);
  console.log('🎙️ Narração:\n' + conteudo.textoNarracao);
  console.log('\n📋 Legenda TikTok:\n' + conteudo.legendas.tiktok);

  await gerarVideoEspecial({
    id: 'afiliados-quarta',
    titulo: conteudo.titulo,
    textoEcra: conteudo.textoEcra,
    textoNarracao: conteudo.textoNarracao,
    fundoZenAstrologia: true,
    legendas: conteudo.legendas,
    data,
    generoVoz: 'feminina',
    tipoMusica: 'zen',
    slotHorario: obterSlotEspecial(),
  });

  console.log(
    process.env.SKIP_PUBLICAR === '1'
      ? '\n🏁 Vídeo de afiliados concluído em output/' + id + '.mp4 (sem publicar no Buffer).'
      : isLocaleUS()
        ? '\n🏁 Vídeo de afiliados US concluído e enfileirado no TikTok @sidusastro_en!'
        : '\n🏁 Vídeo de afiliados concluído e enfileirado no Buffer!',
  );
}

executar().catch((erro) => {
  console.error('❌ Erro fatal:', erro);
  process.exit(1);
});
