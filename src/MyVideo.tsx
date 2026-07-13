import {
  AbsoluteFill,
  Audio,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { MarcaSidusAstro } from './components/OverlaysSidus';
import type { HoroscopoProps, TipoMusica } from './types/horoscopo';

export type { HoroscopoProps, TipoMusica } from './types/horoscopo';

const MUSICAS_FUNDO: Record<TipoMusica, string> = {
  zen: staticFile('musica-zen.mp3'),
  celta: staticFile('musica-celta.mp3'),
  meditacao: staticFile('musica-meditacao.mp3'),
};

function resolverSrcImagem(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return staticFile(url);
}

// eslint-disable-next-line @typescript-eslint/no-require-imports -- asset estático em public/
const logoSidus = require('../public/logo-sidus.png') as string;

export const HoroscopoVideo: React.FC<HoroscopoProps> = ({
  signo,
  previsao,
  imagemFundoUrl,
  tipoMusica,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = 1 + (frame / fps) * 0.015;

  return (
    <AbsoluteFill style={{ backgroundColor: '#09070f', fontFamily: 'system-ui, sans-serif' }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, opacity: 0.35 }}>
        <Img
          src={resolverSrcImagem(imagemFundoUrl)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          padding: '90px 44px 200px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Img
            src={logoSidus}
            style={{ width: 160, height: 160, marginBottom: 20, objectFit: 'contain' }}
          />
        </div>

        <div
          style={{
            color: '#f3cc63',
            fontSize: 80,
            fontWeight: 900,
            letterSpacing: 2,
            textShadow: '0 0 25px rgba(243,204,99,0.5)',
          }}
        >
          {signo.toUpperCase()}
        </div>

        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(15px)',
            borderRadius: 30,
            padding: '38px 30px',
            color: '#ffffff',
            fontSize: 28,
            lineHeight: 1.45,
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            maxHeight: 520,
            overflow: 'hidden',
          }}
        >
          &quot;{previsao}&quot;
        </div>
      </AbsoluteFill>

      <MarcaSidusAstro />

      <Audio src={staticFile('narracao.mp3')} volume={1.0} />
      <Audio src={MUSICAS_FUNDO[tipoMusica]} volume={0.12} loop />
    </AbsoluteFill>
  );
};
