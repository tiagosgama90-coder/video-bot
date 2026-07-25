import React from 'react';
import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion';
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
 * Reel 1080×1920 full bleed + desfoque suave para o texto destacar (sem barras).
 */
export function FundoImagemZen({ imagemFundoUrl }: FundoImagemZenProps): React.ReactElement {
  const { width, height } = useVideoConfig();
  const src = resolverSrcImagem(imagemFundoUrl);

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
          filter: 'blur(11px) brightness(0.48) saturate(0.92)',
          transform: 'scale(1.04)',
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${PALETA_SIDUS.fundo}bb 0%, ${PALETA_SIDUS.fundo}55 35%, ${PALETA_SIDUS.fundo}66 100%)`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
}
