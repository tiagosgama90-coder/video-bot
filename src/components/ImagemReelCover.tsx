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
 * Fundo reel 1080×1920 — ficheiro normalizado, pixels 1:1.
 * PROIBIDO esticar: dimensões fixas REEL_LARGURA×REEL_ALTURA, sem objectFit CSS.
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
      <AbsoluteFill
        style={{
          left: '50%',
          top: '50%',
          width: REEL_LARGURA,
          height: REEL_ALTURA,
          marginLeft: -REEL_LARGURA / 2,
          marginTop: -REEL_ALTURA / 2,
          transform: `scale(${escala}) translate(${deslocamentoX}px, ${deslocamentoY}px)`,
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
            maxWidth: REEL_LARGURA,
            maxHeight: REEL_ALTURA,
            ...(filtro ? { filter: filtro } : {}),
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
