export type TipoMusica = 'zen' | 'celta' | 'meditacao';

export interface HoroscopoProps {
  signo: string;
  previsao: string;
  imagemFundoUrl: string;
  tipoMusica: TipoMusica;
}
