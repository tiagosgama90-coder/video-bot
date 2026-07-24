import fs from 'fs';
import path from 'path';
import { gerarVideoEspecial } from './gerar-video-especial';
import { obterConteudoAfiliados } from './conteudo-especial';
import { ehDiaAfiliados, nomeDiasAfiliados } from './dia-semana';
import { isLocaleUS, sufixoIdVideoEspecial } from './locale';
import { SLOT_MUSICA } from './musicas';

const ID_BASE = 'afiliados-diario';

export function idAfiliadosDia(): string {
  return sufixoIdVideoEspecial(ID_BASE);
}

export function afiliadosDiaJaGerado(): boolean {
  return fs.existsSync(path.resolve('./output/' + idAfiliadosDia() + '.mp4'));
}

/** Vídeo afiliados — terças e sábados; publicação na fila Buffer (hora livre). */
export async function gerarAfiliadosDia(data: string): Promise<void> {
  if (!ehDiaAfiliados()) {
    console.log('⏭️ Hoje não é dia de afiliados (' + nomeDiasAfiliados() + ') — a saltar.');
    return;
  }

  if (afiliadosDiaJaGerado()) {
    console.log('✅ Vídeo afiliados já gerado hoje — a saltar.');
    return;
  }

  const conteudo = obterConteudoAfiliados(data, 'ter-sab');
  const mercado = isLocaleUS() ? 'US (@sidusastro_en)' : 'PT';

  console.log('\n══════════════════════════════════════');
  console.log('💸 SidusAstro — Afiliados [' + mercado + ']');
  console.log('📅 Data: ' + data + ' · Publicação: fila Buffer (hora livre)');
  console.log('🏷️ Título: ' + conteudo.titulo);
  console.log('🪝 Gancho: "' + conteudo.hookTexto + '"');
  console.log('🎙️ Narração:\n' + conteudo.textoNarracao);
  console.log('══════════════════════════════════════\n');

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
    slotMusica: SLOT_MUSICA.AFILIADOS_DIA,
  });
}
