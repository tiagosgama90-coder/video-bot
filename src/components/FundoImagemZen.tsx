import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETA_SIDUS } from '../lib/paleta-visual';
import { ImagemReelCover } from './ImagemReelCover';

export interface FundoImagemZenProps {
  imagemFundoUrl: string;
  modoPaleta?: 'color' | 'mono';
}

function filtroImagem(modoPaleta?: 'color' | 'mono'): string {
  if (modoPaleta === 'mono') {
    return 'brightness(0.9) saturate(0.18) grayscale(0.82) contrast(1.1)';
  }
  return 'brightness(0.94) saturate(1.28) contrast(1.04)';
}

/**
 * Reel 1080×1920 — imagem normalizada, Ken Burns suave no centro (sem esticar).
 */
export function FundoImagemZen({ imagemFundoUrl, modoPaleta }: FundoImagemZenProps): React.ReactElement {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const escala = interpolate(frame, [0, durationInFrames], [1.02, 1.08], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const deslocamentoY = interpolate(frame, [0, durationInFrames], [0, -20], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const deslocamentoX = interpolate(frame, [0, durationInFrames], [0, 8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: PALETA_SIDUS.fundo }}>
      <ImagemReelCover
        src={imagemFundoUrl}
        escala={escala}
        deslocamentoX={deslocamentoX}
        deslocamentoY={deslocamentoY}
        filtro={filtroImagem(modoPaleta)}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${PALETA_SIDUS.fundo}44 0%, transparent 22%, transparent 58%, ${PALETA_SIDUS.fundo}88 100%)`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
}
