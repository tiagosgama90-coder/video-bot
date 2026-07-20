import fs from 'fs';
import path from 'path';
import { gerarVideoEspecial } from './gerar-video-especial';
import { obterConteudoAfiliados } from './conteudo-especial';
import { ehDiaAfiliados, nomeDiasAfiliados } from './dia-semana';
import { isLocaleUS, sufixoIdVideoEspecial } from './locale';
import { SLOT_MUSICA } from './musicas';
import { SLOT_AFILIADOS_MANHA } from './publicacao-alcance';

const ID_BASE = 'afiliados-manha';

export function idAfiliadosManha(): string {
  return sufixoIdVideoEspecial(ID_BASE);
}

export function afiliadosManhaJaGerado(): boolean {
  return fs.existsSync(path.resolve('./output/' + idAfiliadosManha() + '.mp4'));
}

/** Vídeo afiliados no slot 09:00 — terças e sábados (PT e US). */
export async function gerarAfiliadosManha(data: string): Promise<void> {
  if (!ehDiaAfiliados()) {
    console.log('⏭️ Hoje não é dia de afiliados (' + nomeDiasAfiliados() + ') — a saltar.');
    return;
  }

  if (afiliadosManhaJaGerado()) {
    console.log('✅ Vídeo afiliados de manhã já gerado hoje — a saltar.');
    return;
  }

  const conteudo = obterConteudoAfiliados();
  const mercado = isLocaleUS() ? 'US (@sidusastro_en)' : 'PT';

  console.log('\n══════════════════════════════════════');
  console.log('💸 SidusAstro — Afiliados de manhã [' + mercado + ']');
  console.log('📅 Data: ' + data + ' · Slot: ' + SLOT_AFILIADOS_MANHA);
  console.log('🏷️ Título: ' + conteudo.titulo);
  console.log('🎙️ Narração:\n' + conteudo.textoNarracao);
  console.log('══════════════════════════════════════\n');

  await gerarVideoEspecial({
    id: ID_BASE,
    titulo: conteudo.titulo,
    textoEcra: conteudo.textoEcra,
    textoNarracao: conteudo.textoNarracao,
    fundoZenAstrologia: true,
    legendas: conteudo.legendas,
    data,
    generoVoz: 'feminina',
    tipoMusica: 'zen',
    slotHorario: SLOT_AFILIADOS_MANHA,
    slotMusica: SLOT_MUSICA.AFILIADOS_MANHA,
  });
}
