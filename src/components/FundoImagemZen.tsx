import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETA_SIDUS } from '../lib/paleta-visual';

const REEL_LARGURA = 1080;
const REEL_ALTURA = 1920;

function resolverSrcImagem(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return staticFile(url);
}

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
 * Reel 1080×1920 — cover simétrico (nunca estica), Ken Burns suave no centro.
 */
export function FundoImagemZen({ imagemFundoUrl, modoPaleta }: FundoImagemZenProps): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const src = resolverSrcImagem(imagemFundoUrl);

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

  const coverScale = Math.max(width / REEL_LARGURA, height / REEL_ALTURA) * escala;
  const imgW = REEL_LARGURA * coverScale;
  const imgH = REEL_ALTURA * coverScale;

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: PALETA_SIDUS.fundo }}>
      <Img
        src={src}
        width={imgW}
        height={imgH}
        objectFit="cover"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: imgW,
          height: imgH,
          marginLeft: -imgW / 2 + deslocamentoX,
          marginTop: -imgH / 2 + deslocamentoY,
          display: 'block',
          filter: filtroImagem(modoPaleta),
        }}
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
