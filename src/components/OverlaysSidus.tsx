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
    </>
  );
}
