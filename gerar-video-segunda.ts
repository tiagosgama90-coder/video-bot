import dotenv from 'dotenv';
import { gerarVideoEspecial } from './src/lib/gerar-video-especial';
import {
  escolherFraseMotivacional,
  obterLegendasMotivacional,
  obterSlotEspecial,
  obterTituloMotivacional,
} from './src/lib/conteudo-especial';
import { isLocaleUS, sufixoIdVideoEspecial } from './src/lib/locale';
import { SLOT_MUSICA } from './src/lib/musicas';
import { obterDataPublicacao } from './src/lib/signos';
import { inicializarFirebaseSeNecessario } from './src/lib/inicializar-app';
import { exigirDiaSemana } from './src/lib/dia-semana';

dotenv.config();
inicializarFirebaseSeNecessario();

async function executar(): Promise<void> {
  exigirDiaSemana(1, 'segundas-feiras');

  const data = obterDataPublicacao();
  const frase = escolherFraseMotivacional(data, 'segunda');
  const legendas = obterLegendasMotivacional();
  const id = sufixoIdVideoEspecial('motivacao-segunda');
  const mercado = isLocaleUS() ? 'US (@sidusastro_en)' : 'PT';

  console.log('✨ SidusAstro — Vídeo Motivacional (Segunda-feira) [' + mercado + ']');
  console.log('📅 Data: ' + data);
  console.log('💬 Frase: "' + frase + '"');
  console.log('\n📋 Legenda TikTok:\n' + legendas.tiktok);

  await gerarVideoEspecial({
    id: 'motivacao-segunda',
    titulo: obterTituloMotivacional(),
    textoEcra: frase,
    textoNarracao: frase,
    legendas,
    data,
    generoVoz: 'aleatoria',
    tipoMusica: 'zen',
    slotHorario: obterSlotEspecial(),
    slotMusica: SLOT_MUSICA.MOTIVACIONAL_SEGUNDA,
    fundoZenAstrologia: true,
  });

  console.log(
    process.env.SKIP_PUBLICAR === '1'
      ? '\n🏁 Vídeo motivacional concluído em output/' + id + '.mp4 (sem publicar no Buffer).'
      : isLocaleUS()
        ? '\n🏁 Vídeo motivacional US concluído e enfileirado no TikTok @sidusastro_en!'
        : '\n🏁 Vídeo motivacional concluído e enfileirado no Buffer!',
  );
}

executar().catch((erro) => {
  console.error('❌ Erro fatal:', erro);
  process.exit(1);
});
