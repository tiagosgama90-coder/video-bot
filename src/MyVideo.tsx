import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { EfeitosUniverso } from './components/EfeitosUniverso';
import { MarcaSidusAstro } from './components/OverlaysSidus';
import type { HoroscopoProps } from './types/horoscopo';

export type { HoroscopoProps } from './types/horoscopo';

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
  fechoTexto,
  imagemFundoUrl,
  musicaFundoArquivo,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const scale = 1 + (frame / fps) * 0.015;
  const inicioFecho = durationInFrames - Math.round(fps * 4.8);

  const opacidadePrevisao = interpolate(frame, [inicioFecho - 10, inicioFecho + 10], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacidadeFecho = interpolate(frame, [inicioFecho - 6, inicioFecho + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#09070f', fontFamily: 'system-ui, sans-serif' }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, opacity: 0.35 }}>
        <Img
          src={resolverSrcImagem(imagemFundoUrl)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>

      <EfeitosUniverso />

      <AbsoluteFill
        style={{
          padding: '70px 44px 160px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 1. LOGÓTIPO */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 10,
            opacity: 0.95,
          }}
        >
          <Img
            src={logoSidus}
            style={{ width: 240, height: 240, marginBottom: 16, objectFit: 'contain' }}
          />
        </div>

        {/* 2. TITULO DO SIGNO (a meio do vídeo) */}
        <div
          style={{
            color: '#f3cc63',
            fontSize: 80,
            fontWeight: 900,
            letterSpacing: 2,
            textShadow: '0 0 25px rgba(243,204,99,0.5)',
            marginBottom: 20,
          }}
        >
          {signo.toUpperCase()}
        </div>

        {/* 3. TEXTO (previsão → some → aparece fecho na mesma posição) */}
        <div style={{ width: '100%', maxWidth: 980 }}>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.07)',
              backdropFilter: 'blur(15px)',
              borderRadius: 30,
              padding: '34px 30px',
              color: '#ffffff',
              fontSize: 28,
              lineHeight: 1.45,
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              maxHeight: 520,
              overflow: 'hidden',
              opacity: opacidadePrevisao,
              transform: `translateY(${(1 - opacidadePrevisao) * 10}px)`,
            }}
          >
            &quot;{previsao}&quot;
          </div>

          <div
            style={{
              position: 'absolute',
              left: 44,
              right: 44,
              top: '50%',
              transform: `translateY(${120 - (opacidadeFecho * 16)}px)`,
              display: 'flex',
              justifyContent: 'center',
              opacity: opacidadeFecho,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(20, 12, 40, 0.88)',
                border: '2px solid rgba(243, 204, 99, 0.75)',
                borderRadius: 22,
                padding: '24px 30px',
                color: '#ffffff',
                fontSize: 34,
                fontWeight: 900,
                textAlign: 'center',
                lineHeight: 1.25,
                boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
                textShadow: '0 2px 12px rgba(0,0,0,0.65)',
                maxWidth: 980,
              }}
            >
              {fechoTexto}
            </div>
          </div>
        </div>
      </AbsoluteFill>

      <MarcaSidusAstro />

      <Audio src={staticFile('narracao.mp3')} volume={1.0} />
      <Audio src={staticFile(musicaFundoArquivo)} volume={0.12} loop />
    </AbsoluteFill>
  );
};
