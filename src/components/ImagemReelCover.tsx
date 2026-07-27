import React from 'react';
import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion';
import { REEL_ALTURA, REEL_LARGURA } from '../lib/imagem-fundo';

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
 * Fundo reel 1080×1920 — imagem normalizada 1:1, Ken Burns só com scale uniforme.
 * Nunca usa objectFit CSS (evita esticar planetas/círculos no Remotion).
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
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          transform: `scale(${escala}) translate(${deslocamentoX}px, ${deslocamentoY}px)`,
          transformOrigin: 'center center',
        }}
      >
        <Img
          src={resolved}
          width={width}
          height={height}
          style={{
            display: 'block',
            ...(filtro ? { filter: filtro } : {}),
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
