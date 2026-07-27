import React from 'react';
import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion';
import { REEL_ALTURA, REEL_LARGURA } from '../lib/reel-dimensoes';

function resolverSrcImagem(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return staticFile(url);
}

export interface ImagemReelCoverProps {
  src: string;
  escala?: number;
  deslocamentoX?: number;
  deslocamentoY?: number;
  filtro?: string;
}

/**
 * Fundo reel 1080×1920 — proporção fixa, simétrico, PROIBIDO esticar.
 * objectFit cover recorta em excesso mas nunca deforma (círculos ficam redondos).
 */
export function ImagemReelCover({
  src,
  escala = 1,
  deslocamentoX = 0,
  deslocamentoY = 0,
  filtro,
}: ImagemReelCoverProps): React.ReactElement {
  const { width, height } = useVideoConfig();
  const resolved = resolverSrcImagem(src);

  if (width !== REEL_LARGURA || height !== REEL_ALTURA) {
    console.warn(
      `ImagemReelCover: composição ${width}×${height} — esperado ${REEL_LARGURA}×${REEL_ALTURA}`,
    );
  }

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#000000' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: REEL_LARGURA,
          height: REEL_ALTURA,
          transform: `translate(calc(-50% + ${deslocamentoX}px), calc(-50% + ${deslocamentoY}px)) scale(${escala})`,
          transformOrigin: 'center center',
        }}
      >
        <Img
          src={resolved}
          width={REEL_LARGURA}
          height={REEL_ALTURA}
          style={{
            display: 'block',
            width: REEL_LARGURA,
            height: REEL_ALTURA,
            objectFit: 'cover',
            objectPosition: 'center center',
            ...(filtro ? { filter: filtro } : {}),
          }}
        />
      </div>
    </AbsoluteFill>
  );
}
