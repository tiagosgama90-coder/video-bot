import fs from 'fs';
import path from 'path';
import { gerarVideoEspecial } from './gerar-video-especial';
import { obterConteudoAfiliados } from './conteudo-especial';
import { ehDiaAfiliados, nomeDiasAfiliados } from './dia-semana';
import { isLocaleUS, sufixoIdVideoEspecial } from './locale';
import { SLOT_MUSICA } from './musicas';
import { videoJaPublicadoNoBuffer } from './buffer';

const ID_BASE = 'afiliados-diario';

export function idAfiliadosDia(): string {
  return sufixoIdVideoEspecial(ID_BASE);
}

export async function afiliadosDiaJaGerado(data?: string): Promise<boolean> {
  if (fs.existsSync(path.resolve('./output/' + idAfiliadosDia() + '.mp4'))) {
    return true;
  }
  if (data && process.env.BUFFER_ACCESS_TOKEN && process.env.SKIP_PUBLICAR !== '1') {
    return videoJaPublicadoNoBuffer(idAfiliadosDia(), data);
  }
  return false;
}

/** Vídeo afiliados — terças e sábados; publicação na fila Buffer (hora livre). */
export async function gerarAfiliadosDia(data: string): Promise<void> {
  if (!ehDiaAfiliados()) {
    console.log('⏭️ Hoje não é dia de afiliados (' + nomeDiasAfiliados() + ') — a saltar.');
    return;
  }

  if (await afiliadosDiaJaGerado(data)) {
    console.log('✅ Vídeo afiliados já gerado/publicado hoje — a saltar.');
    return;
  }

  const conteudo = obterConteudoAfiliados(data);
  const mercado = isLocaleUS() ? 'US (@sidusastro_en)' : 'PT';

  console.log('\n══════════════════════════════════════');
  console.log('💸 SidusAstro — Afiliados [' + mercado + ']');
  console.log('📅 Data: ' + data + ' · Publicação: fila Buffer (hora livre)');
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
    slotMusica: SLOT_MUSICA.AFILIADOS_DIA,
  });
}
