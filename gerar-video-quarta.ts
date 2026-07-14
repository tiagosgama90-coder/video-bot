import dotenv from 'dotenv';
import { gerarVideoEspecial } from './src/lib/gerar-video-especial';
import {
  TEXTO_AFILIADOS_FALADO,
  TEXTO_AFILIADOS_ECRA,
  TITULO_AFILIADOS,
  LEGENDA_AFILIADOS_TIKTOK,
  LEGENDA_AFILIADOS_INSTAGRAM,
  SLOT_ESPECIAL_LISBOA,
} from './src/lib/conteudo-especial';
import { obterDataLisboa } from './src/lib/signos';
import { inicializarFirebaseSeNecessario } from './src/lib/inicializar-app';

dotenv.config();
inicializarFirebaseSeNecessario();
async function executar(): Promise<void> {
  const data = obterDataLisboa();
  console.log('💰 SidusAstro — Vídeo Afiliados (Quarta-feira)');
  console.log('📅 Data (Lisboa): ' + data);
  console.log('🏷️ Título no ecrã: ' + TITULO_AFILIADOS);
  console.log('🖥️ Texto no ecrã:\n' + TEXTO_AFILIADOS_ECRA);
  console.log('🎙️ Narração:\n' + TEXTO_AFILIADOS_FALADO);
  console.log('\n📋 Legenda TikTok:\n' + LEGENDA_AFILIADOS_TIKTOK);
  console.log('\n📋 Legenda Instagram:\n' + LEGENDA_AFILIADOS_INSTAGRAM);

  await gerarVideoEspecial({
    id: 'afiliados-quarta',
    titulo: TITULO_AFILIADOS,
    textoEcra: TEXTO_AFILIADOS_ECRA,
    textoNarracao: TEXTO_AFILIADOS_FALADO,
    fundoZenAstrologia: true,
    legendas: {
      tiktok: LEGENDA_AFILIADOS_TIKTOK,
      instagram: LEGENDA_AFILIADOS_INSTAGRAM,
    },
    data,
    generoVoz: 'feminina',
    tipoMusica: 'zen',
    slotHorario: SLOT_ESPECIAL_LISBOA,
  });

  console.log(
    process.env.SKIP_PUBLICAR === '1'
      ? '\n🏁 Vídeo de afiliados concluído em output/afiliados-quarta.mp4 (sem publicar no Buffer).'
      : '\n🏁 Vídeo de afiliados concluído e enfileirado no Buffer!',
  );
}

executar().catch((erro) => {
  console.error('❌ Erro fatal:', erro);
  process.exit(1);
});
