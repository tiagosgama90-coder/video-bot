import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export function MarcaSidusAstro(): React.ReactElement {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacidadeFinal = interpolate(frame, [durationInFrames - 150, durationInFrames - 120], [0.55, 0.95], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 36,
          right: 40,
          zIndex: 20,
          color: '#ffffff',
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: 1,
          opacity: opacidadeFinal,
          textShadow: '0 2px 12px rgba(0,0,0,0.85)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        sidusastro.com
      </div>

      <StickerCtaFinal />
    </>
  );
}

function StickerCtaFinal(): React.ReactElement {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const inicio = durationInFrames - Math.round(fps * 4.5);

  const opacidade = interpolate(frame, [inicio, inicio + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const escala = interpolate(frame, [inicio, inicio + 18], [0.88, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (frame < inicio - 1) {
    return <></>;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 480,
        left: 50,
        right: 50,
        zIndex: 25,
        opacity: opacidade,
        transform: 'scale(' + escala + ')',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(20, 12, 40, 0.88)',
          border: '2px solid rgba(243, 204, 99, 0.75)',
          borderRadius: 22,
          padding: '28px 36px',
          color: '#ffffff',
          fontSize: 34,
          fontWeight: 800,
          textAlign: 'center',
          lineHeight: 1.35,
          boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
          fontFamily: 'system-ui, sans-serif',
          width: '100%',
        }}
      >
        Descobre o teu mapa completo em sidusastro.com ✨
      </div>
    </div>
  );
}
