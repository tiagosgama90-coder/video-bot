import React from 'react';
import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion';

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
 * Imagem a preencher o reel 1080×1920 — ecrã inteiro, proporção 9:16, sem esticar,
 * sem cortar ao centro, sem barras nem blur por cima (como pins verticais do Pinterest).
 */
export function FundoImagemZen({ imagemFundoUrl }: FundoImagemZenProps): React.ReactElement {
  const { width, height } = useVideoConfig();
  const src = resolverSrcImagem(imagemFundoUrl);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={src}
        width={width}
        height={height}
        style={{
          width,
          height,
          display: 'block',
        }}
      />
    </AbsoluteFill>
  );
}
