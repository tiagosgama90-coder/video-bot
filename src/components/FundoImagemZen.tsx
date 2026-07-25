import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETA_SIDUS } from '../lib/paleta-visual';

function resolverSrcImagem(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return staticFile(url);
}

export interface FundoImagemZenProps {
  imagemFundoUrl: string;
}

/**
 * Reel 1080×1920 full bleed — imagem Pinterest visível, vinheta leve na zona do texto.
 */
export function FundoImagemZen({ imagemFundoUrl }: FundoImagemZenProps): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const src = resolverSrcImagem(imagemFundoUrl);

  const escala = interpolate(frame, [0, durationInFrames], [1.04, 1.12], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const deslocamentoY = interpolate(frame, [0, durationInFrames], [0, -28], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const deslocamentoX = interpolate(frame, [0, durationInFrames], [0, 12], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: PALETA_SIDUS.fundo }}>
      <Img
        src={src}
        width={width}
        height={height}
        style={{
          width,
          height,
          display: 'block',
          filter: 'brightness(0.92) saturate(1.08)',
          transform: `scale(${escala}) translate(${deslocamentoX}px, ${deslocamentoY}px)`,
          transformOrigin: 'center center',
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${PALETA_SIDUS.fundo}55 0%, transparent 28%, ${PALETA_SIDUS.fundo}44 62%, ${PALETA_SIDUS.fundo}99 100%)`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
}
