import type { TemaFundoMistico } from '../lib/fundo-video';

export interface HoroscopoProps {
  signo: string;
  previsao: string;
  /** Gancho narrado + overlay — alinhado com a legenda */
  hookTexto?: string;
  /** Frase final (texto) — aparece no fim no lugar da previsão */
  fechoTexto: string;
  /** Frame em que a previsão aparece (sincronizado com a narração) */
  frameInicioPrevisao?: number;
  /** Frame em que o fecho aparece (sincronizado com a narração) */
  frameInicioFecho?: number;
  /** Tema do fundo animado (velas, tarot, zodíaco, etc.) */
  fundoVideoTema?: TemaFundoMistico;
  /** Seed determinístico — varia partículas e cores dentro do tema */
  fundoVideoSeed?: number;
  /** Imagem zen IA em public/ — motivacional e especiais (em vez de vídeo animado) */
  imagemFundoUrl?: string;
  /** Nome do ficheiro em public/ — ex.: musica-peixes.mp3 */
  musicaFundoArquivo: string;
  /** Duração calculada a partir do áudio — evita cortar a narração */
  duracaoFrames: number;
  /** URL curta no canto do vídeo — ex. sidusastro.com/en */
  siteMarca?: string;
  /** Volume da música de fundo (0–1) — vem de config/sidusastro.json */
  volumeMusica?: number;
  /** Texto que vai aparecendo em sincronia com a voz (vídeo afiliados) */
  segmentosEcra?: Array<{ texto: string; frameInicio: number }>;
}
