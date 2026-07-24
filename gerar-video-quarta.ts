import dotenv from 'dotenv';
import { gerarVideoEspecial } from './src/lib/gerar-video-especial';
import { obterConteudoQuarta, obterSlotEspecial } from './src/lib/conteudo-especial';
import { exigirDiaSemana } from './src/lib/dia-semana';
import { isLocaleUS, sufixoIdVideoEspecial } from './src/lib/locale';
import { SLOT_MUSICA } from './src/lib/musicas';
import { obterDataPublicacao } from './src/lib/signos';
import { inicializarFirebaseSeNecessario } from './src/lib/inicializar-app';

dotenv.config();
inicializarFirebaseSeNecessario();

const ID_BASE = 'afiliados-quarta';

async function executar(): Promise<void> {
  exigirDiaSemana(3, 'quartas-feiras');

  const data = obterDataPublicacao();
  const { conteudo } = obterConteudoQuarta(data);
  const id = sufixoIdVideoEspecial(ID_BASE);
  const mercado = isLocaleUS() ? 'US (@sidusastro_en)' : 'PT';

  console.log('✨ SidusAstro — Afiliados (Quarta-feira) [' + mercado + ']');
  console.log('📅 Data: ' + data);
  console.log('🏷️ Título no ecrã: ' + conteudo.titulo);
  console.log('🪝 Gancho: "' + conteudo.hookTexto + '"');
  conteudo.segmentosEcra.forEach((s, i) => console.log('   ' + (i + 1) + '. ' + s));
  console.log('🎙️ Narração:\n' + conteudo.textoNarracao);
  console.log('\n📋 Legenda TikTok:\n' + conteudo.legendas.tiktok);

  await gerarVideoEspecial({
    id: ID_BASE,
    titulo: conteudo.titulo,
    textoEcra: conteudo.textoEcra,
    textoNarracao: conteudo.textoNarracao,
    hookTexto: conteudo.hookTexto,
    segmentosEcra: conteudo.segmentosEcra,
    fundoZenAstrologia: true,
    legendas: conteudo.legendas,
    data,
    generoVoz: 'feminina',
    tipoMusica: 'zen',
    slotHorario: obterSlotEspecial(),
    slotMusica: SLOT_MUSICA.AFILIADOS_QUARTA,
  });

  console.log(
    process.env.SKIP_PUBLICAR === '1'
      ? '\n🏁 Vídeo afiliados concluído em output/' + id + '.mp4 (sem publicar no Buffer).'
      : isLocaleUS()
        ? '\n🏁 Vídeo afiliados US concluído e enfileirado no TikTok @sidusastro_en!'
        : '\n🏁 Vídeo afiliados concluído e enfileirado no Buffer!',
  );
}

executar().catch((erro) => {
  console.error('❌ Erro fatal:', erro);
  process.exit(1);
});
