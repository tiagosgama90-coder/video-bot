export interface HoroscopoProps {
  signo: string;
  previsao: string;
  /** Frase final (texto) — aparece no fim no lugar da previsão */
  fechoTexto: string;
  imagemFundoUrl: string;
  /** Nome do ficheiro em public/ — ex.: musica-peixes.mp3 */
  musicaFundoArquivo: string;
  /** Duração calculada a partir do áudio — evita cortar a narração */
  duracaoFrames: number;
}
