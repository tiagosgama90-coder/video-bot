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
  hookTexto,
  fechoTexto,
  frameInicioPrevisao,
  frameInicioFecho,
  imagemFundoUrl,
  musicaFundoArquivo,
  segmentosEcra,
  siteMarca,
  volumeMusica = 0.22,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const scale = 1 + (frame / fps) * 0.015;

  const inicioPrevisao = frameInicioPrevisao ?? Math.round(fps * 3);
  const inicioFecho = frameInicioFecho
    ?? (fechoTexto ? durationInFrames - Math.round(fps * 4.8) : durationInFrames + 1);

  const modoProgressivo = segmentosEcra && segmentosEcra.length > 0;
  const segmentosVisiveis = modoProgressivo
    ? segmentosEcra.filter((s) => frame >= s.frameInicio)
    : [];

  const ecraLink =
    !modoProgressivo && /^[a-z0-9][-a-z0-9.]*\.[a-z]{2,}$/i.test(previsao.trim());

  const opacidadePrevisao = interpolate(
    frame,
    [inicioPrevisao - 8, inicioPrevisao + 14, inicioFecho - 14, inicioFecho + 6],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );
  const opacidadeFecho = interpolate(frame, [inicioFecho - 6, inicioFecho + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const opacidadeHook = hookTexto
    ? interpolate(frame, [0, 8, inicioPrevisao - 16, inicioPrevisao - 4], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#09070f', fontFamily: 'system-ui, sans-serif' }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, opacity: 0.35 }}>
        <Img
          src={resolverSrcImagem(imagemFundoUrl)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>

      <EfeitosUniverso />

      {hookTexto ? (
        <AbsoluteFill
          style={{
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingTop: 120,
            paddingLeft: 40,
            paddingRight: 40,
            opacity: opacidadeHook,
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(20, 12, 40, 0.88)',
              border: '2px solid rgba(243, 204, 99, 0.85)',
              borderRadius: 24,
              padding: '22px 28px',
              color: '#ffffff',
              fontSize: hookTexto.length > 45 ? 34 : 40,
              fontWeight: 900,
              textAlign: 'center',
              lineHeight: 1.2,
              boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
              textShadow: '0 2px 12px rgba(0,0,0,0.65)',
              maxWidth: 980,
            }}
          >
            {hookTexto}
          </div>
        </AbsoluteFill>
      ) : null}

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

        {/* 3. TEXTO — progressivo (afiliados) ou bloco único (horóscopo) */}
        <div style={{ width: '100%', maxWidth: 980 }}>
          {modoProgressivo ? (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.07)',
                backdropFilter: 'blur(15px)',
                borderRadius: 30,
                padding: '34px 30px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                minHeight: 280,
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}
            >
              {segmentosVisiveis.map((seg, i) => {
                const activo = i === segmentosVisiveis.length - 1;
                const temLink = seg.texto.includes('sidusastro.com');
                return (
                  <div
                    key={seg.frameInicio}
                    style={{
                      color: '#ffffff',
                      fontSize: activo ? 26 : 22,
                      fontWeight: activo ? 600 : 400,
                      lineHeight: 1.45,
                      textAlign: 'center',
                      opacity: activo ? 1 : 0.72,
                      transform: `translateY(${activo ? 0 : 2}px)`,
                    }}
                  >
                    {temLink ? (
                      <>
                        {seg.texto.split('sidusastro.com')[0]}
                        <span style={{ color: '#f3cc63', fontWeight: 800 }}>sidusastro.com</span>
                        {seg.texto.split('sidusastro.com')[1] ?? ''}
                      </>
                    ) : (
                      seg.texto
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
          <div
            style={{
              backgroundColor: ecraLink ? 'rgba(20, 12, 40, 0.75)' : 'rgba(255, 255, 255, 0.07)',
              backdropFilter: 'blur(15px)',
              borderRadius: 30,
              padding: ecraLink ? '40px 36px' : '34px 30px',
              color: ecraLink ? '#f3cc63' : '#ffffff',
              fontSize: ecraLink ? 52 : previsao.length > 120 ? 22 : 28,
              fontWeight: ecraLink ? 800 : 400,
              lineHeight: 1.45,
              textAlign: 'center',
              border: ecraLink
                ? '2px solid rgba(243, 204, 99, 0.65)'
                : '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              maxHeight: 520,
              overflow: 'hidden',
              opacity: opacidadePrevisao,
              transform: `translateY(${(1 - opacidadePrevisao) * 10}px)`,
              letterSpacing: ecraLink ? 1.5 : 0,
            }}
          >
            {ecraLink ? previsao : <>&quot;{previsao}&quot;</>}
          </div>
          )}

          {!modoProgressivo && fechoTexto ? (
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
          ) : null}
        </div>
      </AbsoluteFill>

      <MarcaSidusAstro siteMarca={siteMarca} />

      <Audio src={staticFile('narracao.mp3')} volume={1.0} />
      <Audio src={staticFile(musicaFundoArquivo)} volume={volumeMusica} loop />
    </AbsoluteFill>
  );
};
