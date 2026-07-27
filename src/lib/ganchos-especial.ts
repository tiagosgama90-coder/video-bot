import { escolherGanchoAfiliadosComTema } from './ganchos-afiliados';
import { escolherGanchoViralComTema } from './ganchos-virais';
import type { GanchoComTema } from './fechos-narracao';
import type { SignoZodiaco } from './signos';

/** Gancho de abertura para vídeos especiais (motivacional, VIP, afiliados) */
export function escolherGanchoEspecial(id: string, data: string): string {
  return escolherGanchoEspecialComTema(id, data).texto;
}

export function escolherGanchoEspecialComTema(id: string, data: string): GanchoComTema {
  const chave = id.toLowerCase();
  if (chave.includes('afiliados')) {
    return escolherGanchoAfiliadosComTema(data, id);
  }
  if (chave.includes('vip')) {
    return escolherGanchoViralComTema('leao' as SignoZodiaco, data);
  }
  if (chave.includes('motivacao')) {
    return escolherGanchoViralComTema('caranguejo' as SignoZodiaco, data);
  }
  return escolherGanchoViralComTema('touro' as SignoZodiaco, data);
}
