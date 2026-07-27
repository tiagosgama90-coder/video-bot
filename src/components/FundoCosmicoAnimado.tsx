import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETA_SIDUS } from '../lib/paleta-visual';
import { EstrelasAPassear, GeometriaSagradaSuave } from './FundoCosmicoSidus';
import { ImagemReelCover } from './ImagemReelCover';

export interface FundoCosmicoAnimadoProps {
  imagemFundoUrl: string;
  seed?: number;
}

/**
 * Nebulosa cósmica IA em movimento (Ken Burns + reel 1080×1920, nunca estica)
 * + estrelas + geometria sagrada suave por cima.
 */
export function FundoCosmicoAnimado({
  imagemFundoUrl,
  seed = 0,
}: FundoCosmicoAnimadoProps): React.ReactElement {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const escala = interpolate(frame, [0, durationInFrames], [1.04, 1.1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const deslocamentoY = interpolate(frame, [0, durationInFrames], [0, -24], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const deslocamentoX = interpolate(frame, [0, durationInFrames], [0, 10], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#000000' }}>
      <ImagemReelCover
        src={imagemFundoUrl}
        escala={escala}
        deslocamentoX={deslocamentoX}
        deslocamentoY={deslocamentoY}
        filtro="brightness(0.92) saturate(1.22) contrast(1.05)"
      />

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 50%, transparent 0%, transparent 45%, rgba(0,0,0,0.22) 72%, rgba(0,0,0,0.55) 100%)',
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${PALETA_SIDUS.fundo}44 0%, transparent 18%, transparent 70%, ${PALETA_SIDUS.fundo}77 100%)`,
          pointerEvents: 'none',
        }}
      />

      <GeometriaSagradaSuave seed={seed} />
      <EstrelasAPassear />
    </AbsoluteFill>
  );
}
