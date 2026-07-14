import dotenv from 'dotenv';
import { gerarVideoEspecial } from './src/lib/gerar-video-especial';
import {
  escolherFraseMotivacional,
  LEGENDA_MOTIVACIONAL_TIKTOK,
  LEGENDA_MOTIVACIONAL_INSTAGRAM,
  SLOT_ESPECIAL_LISBOA,
} from './src/lib/conteudo-especial';
import { obterDataLisboa } from './src/lib/signos';
import { inicializarFirebaseSeNecessario } from './src/lib/inicializar-app';

dotenv.config();
inicializarFirebaseSeNecessario();
async function executar(): Promise<void> {
  const data = obterDataLisboa();
  const frase = escolherFraseMotivacional(data);

  console.log('✨ SidusAstro — Vídeo Motivacional (Segunda-feira)');
  console.log('📅 Data (Lisboa): ' + data);
  console.log('💬 Frase: "' + frase + '"');

  await gerarVideoEspecial({
    id: 'motivacao-segunda',
    titulo: 'MENSAGEM DO COSMOS',
    textoEcra: frase,
    textoNarracao: frase,
    legendas: {
      tiktok: LEGENDA_MOTIVACIONAL_TIKTOK,
      instagram: LEGENDA_MOTIVACIONAL_INSTAGRAM,
    },
    data,
    generoVoz: 'aleatoria',
    tipoMusica: 'zen',
    slotHorario: SLOT_ESPECIAL_LISBOA,
  });

  console.log('\n🏁 Vídeo motivacional concluído e enfileirado no Buffer!');
}

executar().catch((erro) => {
  console.error('❌ Erro fatal:', erro);
  process.exit(1);
});
