export interface HoroscopoProps {
  signo: string;
  previsao: string;
  imagemFundoUrl: string;
  /** Nome do ficheiro em public/ — ex.: musica-peixes.mp3 */
  musicaFundoArquivo: string;
  /** Duração calculada a partir do áudio — evita cortar a narração */
  duracaoFrames: number;
}
