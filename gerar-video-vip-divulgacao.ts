import dotenv from 'dotenv';
import { gerarVideoEspecial } from './src/lib/gerar-video-especial';
import { obterConteudoVipDivulgacao, obterSlotEspecial } from './src/lib/conteudo-especial';
import { exigirDiasVipDivulgacao, nomeDiasVipDivulgacao, obterDiaSemanaPublicacao } from './src/lib/dia-semana';
import { isLocaleUS, sufixoIdVideoEspecial } from './src/lib/locale';
import { SLOT_MUSICA } from './src/lib/musicas';
import { obterDataPublicacao } from './src/lib/signos';
import { inicializarFirebaseSeNecessario } from './src/lib/inicializar-app';

dotenv.config();
inicializarFirebaseSeNecessario();

const ID_BASE = 'vip-divulgacao';

/** Rotação musical distinta por dia VIP (seg/qua/sex/dom). */
function obterSlotMusicaVip(data: string): number {
  const dia = obterDiaSemanaPublicacao(new Date(data + 'T12:00:00'));
  switch (dia) {
    case 1:
      return SLOT_MUSICA.MOTIVACIONAL_SEGUNDA;
    case 3:
      return SLOT_MUSICA.VIP_DIVULGACAO_QUARTA;
    case 5:
      return SLOT_MUSICA.VIP_DIVULGACAO_SEXTA;
    case 0:
      return SLOT_MUSICA.VIP_DIVULGACAO_DOMINGO;
    default:
      return SLOT_MUSICA.VIP_DIVULGACAO_QUARTA;
  }
}

async function executar(): Promise<void> {
  exigirDiasVipDivulgacao();

  const data = obterDataPublicacao();
  const conteudo = obterConteudoVipDivulgacao(data);
  const id = sufixoIdVideoEspecial(ID_BASE);
  const mercado = isLocaleUS() ? 'US (@sidusastro_en)' : 'PT';

  console.log('✨ SidusAstro — Premium por Divulgação [' + mercado + ']');
  console.log('📅 Data: ' + data + ' · Dias automáticos: ' + nomeDiasVipDivulgacao());
  console.log('🏷️ Título no ecrã: ' + conteudo.titulo);
  conteudo.segmentosEcra.forEach((s, i) => console.log('   ' + (i + 1) + '. ' + s));
  console.log('🎙️ Narração:\n' + conteudo.textoNarracao);
  console.log('\n📋 Legenda TikTok:\n' + conteudo.legendas.tiktok);

  await gerarVideoEspecial({
    id: ID_BASE,
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
    slotMusica: obterSlotMusicaVip(data),
  });

  console.log(
    process.env.SKIP_PUBLICAR === '1'
      ? '\n🏁 Vídeo Premium concluído em output/' + id + '.mp4 (sem publicar no Buffer).'
      : isLocaleUS()
        ? '\n🏁 Vídeo Premium US concluído e enfileirado no TikTok @sidusastro_en!'
        : '\n🏁 Vídeo Premium concluído e enfileirado no Buffer (Instagram + TikTok)!',
  );
}

executar().catch((erro) => {
  console.error('❌ Erro fatal:', erro);
  process.exit(1);
});
