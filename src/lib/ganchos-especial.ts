import { escolherGanchoAfiliados } from './ganchos-afiliados';
import { escolherGanchoViral } from './ganchos-virais';
import type { SignoZodiaco } from './signos';

/** Gancho de abertura para vídeos especiais (motivacional, VIP, afiliados) */
export function escolherGanchoEspecial(id: string, data: string): string {
  const chave = id.toLowerCase();
  if (chave.includes('afiliados')) {
    return escolherGanchoAfiliados(data, id);
  }
  if (chave.includes('vip')) {
    return escolherGanchoViral('leao' as SignoZodiaco, data);
  }
  if (chave.includes('motivacao')) {
    return escolherGanchoViral('caranguejo' as SignoZodiaco, data);
  }
  return escolherGanchoViral('touro' as SignoZodiaco, data);
}
