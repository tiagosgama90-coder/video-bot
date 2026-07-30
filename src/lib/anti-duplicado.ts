import { obterFusoPublicacao } from './locale';
import { SIGNOS_ZODIACO, extrairSignoDaLegendaBuffer, type SignoZodiaco } from './signos';

/** Marcador invisível nas legendas Buffer — deteta republicações sem texto visível nas redes. */
const PREFIXO_MARCADOR = '\u2060\u200Bsidus:';
const SUFIXO_MARCADOR = '\u200B\u2060';

export function criarMarcadorVideo(identificador: string, data: string): string {
  return PREFIXO_MARCADOR + identificador + ':' + data + SUFIXO_MARCADOR;
}

export function textoContemMarcadorVideo(
  texto: string,
  identificador: string,
  data: string,
): boolean {
  return texto.includes(PREFIXO_MARCADOR + identificador + ':' + data + SUFIXO_MARCADOR);
}

export function extrairSignoDoIdentificador(identificador: string): SignoZodiaco | undefined {
  const match = identificador.match(/^(.+)-(diario|diario-us)$/);
  if (!match) {
    return undefined;
  }
  const chave = match[1];
  return SIGNOS_ZODIACO.includes(chave as SignoZodiaco) ? (chave as SignoZodiaco) : undefined;
}

export function urlContemIdentificadorVideo(
  url: string,
  identificador: string,
  data: string,
): boolean {
  const decoded = decodeURIComponent(url).toLowerCase();
  const id = identificador.toLowerCase();
  const dia = data.toLowerCase();

  if (!decoded.includes(id)) {
    return false;
  }

  const padroesData = [dia, dia.replace(/-/g, '_'), dia.replace(/-/g, '')];
  return padroesData.some(
    (p) =>
      decoded.includes('/' + p + '/') ||
      decoded.includes('%2f' + p + '%2f') ||
      decoded.includes(p + '%2f' + id) ||
      decoded.includes(p + '/' + id),
  );
}

export interface PostBufferParaDuplicado {
  text?: string;
  dueAt?: string;
  videoUrls?: string[];
}

function postDeHoje(post: PostBufferParaDuplicado, data: string, fuso: string): boolean {
  if (!post.dueAt) {
    return true;
  }
  const dia = new Date(post.dueAt).toLocaleDateString('en-CA', { timeZone: fuso });
  return dia === data;
}

function legendaPareceHoroscopoDiario(texto: string): boolean {
  const t = texto.toLowerCase();
  return (
    t.includes('#horoscope') ||
    t.includes('#horoscopo') ||
    t.includes('forecast ') ||
    t.includes('previsão') ||
    t.includes('previsao') ||
    t.includes('sidusastro')
  );
}

/** Verifica se um post Buffer corresponde ao vídeo (identificador + data). */
export function postCorrespondeAoVideo(
  post: PostBufferParaDuplicado,
  identificador: string,
  data: string,
  fuso = obterFusoPublicacao(),
): boolean {
  const texto = post.text ?? '';

  if (textoContemMarcadorVideo(texto, identificador, data)) {
    return true;
  }

  for (const url of post.videoUrls ?? []) {
    if (urlContemIdentificadorVideo(url, identificador, data)) {
      return true;
    }
  }

  const signo = extrairSignoDoIdentificador(identificador);
  if (signo && identificador.includes('-diario')) {
    if (!legendaPareceHoroscopoDiario(texto) || !postDeHoje(post, data, fuso)) {
      return false;
    }
    return extrairSignoDaLegendaBuffer(texto) === signo;
  }

  if (!postDeHoje(post, data, fuso)) {
    return false;
  }

  const t = texto.toLowerCase();

  if (identificador.startsWith('vip-divulgacao')) {
    return t.includes('divulgacao-vip') || t.includes('#premium');
  }

  if (identificador.startsWith('afiliados-diario')) {
    return (
      t.includes('#rendaextra') ||
      t.includes('#sidehustle') ||
      t.includes('afiliado') ||
      t.includes('affiliate')
    );
  }

  if (identificador.includes('motivacional') || identificador.includes('segunda')) {
    return t.includes('#motivacao') || t.includes('#motivation');
  }

  return false;
}
