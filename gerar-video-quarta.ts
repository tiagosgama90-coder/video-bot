import dotenv from 'dotenv';
import { gerarVideoEspecial } from './src/lib/gerar-video-especial';
import {
  TEXTO_AFILIADOS_FALADO,
  LEGENDA_AFILIADOS_TIKTOK,
  LEGENDA_AFILIADOS_INSTAGRAM,
  SLOT_ESPECIAL_LISBOA,
  escolherTipoMusicaEspecial,
} from './src/lib/conteudo-especial';
import { obterDataLisboa } from './src/lib/signos';
import { inicializarFirebaseSeNecessario } from './src/lib/inicializar-app';

dotenv.config();
inicializarFirebaseSeNecessario();
async function executar(): Promise<void> {
  const data = obterDataLisboa();
  console.log('💰 SidusAstro — Vídeo Afiliados (Quarta-feira)');
  console.log('📅 Data (Lisboa): ' + data);

  await gerarVideoEspecial({
    id: 'afiliados-quarta',
    titulo: 'GANHA COM A SIDUS',
    textoEcra: TEXTO_AFILIADOS_FALADO,
    textoNarracao: TEXTO_AFILIADOS_FALADO,
    legendas: {
      tiktok: LEGENDA_AFILIADOS_TIKTOK,
      instagram: LEGENDA_AFILIADOS_INSTAGRAM,
    },
    data,
    generoVoz: 'feminina',
    tipoMusica: escolherTipoMusicaEspecial(),
    slotHorario: SLOT_ESPECIAL_LISBOA,
  });

  console.log('\n🏁 Vídeo de afiliados concluído e enfileirado no Buffer!');
}

executar().catch((erro) => {
  console.error('❌ Erro fatal:', erro);
  process.exit(1);
});
