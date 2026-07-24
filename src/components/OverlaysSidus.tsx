import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETA_SIDUS } from '../lib/paleta-visual';

export function MarcaSidusAstro({ siteMarca = 'sidusastro.com' }: { siteMarca?: string }): React.ReactElement {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacidadeFinal = interpolate(frame, [durationInFrames - 150, durationInFrames - 120], [0.55, 0.95], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 36,
        right: 40,
        zIndex: 20,
        color: PALETA_SIDUS.destaque,
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: 1,
        opacity: opacidadeFinal,
        textShadow: `0 2px 12px rgba(0,0,0,0.85), 0 0 12px ${PALETA_SIDUS.destaqueSombra}`,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {siteMarca}
    </div>
  );
}
