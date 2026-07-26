import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETA_SIDUS } from '../lib/paleta-visual';
import { EstrelasAPassear, GeometriaSagradaSuave } from './FundoCosmicoSidus';

function resolverSrcImagem(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return staticFile(url);
}

export interface FundoCosmicoAnimadoProps {
  imagemFundoUrl: string;
  seed?: number;
}

/**
 * Nebulosa cósmica IA em movimento (Ken Burns + cover, nunca estica)
 * + estrelas + geometria sagrada suave por cima.
 */
export function FundoCosmicoAnimado({
  imagemFundoUrl,
  seed = 0,
}: FundoCosmicoAnimadoProps): React.ReactElement {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const src = resolverSrcImagem(imagemFundoUrl);

  const escala = interpolate(frame, [0, durationInFrames], [1.06, 1.16], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const deslocamentoY = interpolate(frame, [0, durationInFrames], [0, -32], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const deslocamentoX = interpolate(frame, [0, durationInFrames], [0, 14], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#000000' }}>
      <AbsoluteFill
        style={{
          transform: `scale(${escala}) translate(${deslocamentoX}px, ${deslocamentoY}px)`,
          transformOrigin: 'center center',
        }}
      >
        <Img
          src={src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            display: 'block',
            filter: 'brightness(0.92) saturate(1.22) contrast(1.05)',
          }}
        />
      </AbsoluteFill>

      <GeometriaSagradaSuave seed={seed} />
      <EstrelasAPassear />

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 30%, transparent 0%, transparent 38%, rgba(0,0,0,0.35) 72%, rgba(0,0,0,0.75) 100%)',
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${PALETA_SIDUS.fundo}66 0%, transparent 18%, transparent 70%, ${PALETA_SIDUS.fundo}aa 100%)`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
}
