import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { PALETA_SIDUS } from '../lib/paleta-visual';
import { ZenOverlayAnimado } from './ZenOverlayAnimado';

function resolverSrcImagem(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return staticFile(url);
}

export interface FundoImagemZenProps {
  imagemFundoUrl: string;
  seed?: number;
  /** Zoom suave Ken Burns — só na imagem principal, sem esticar */
  kenBurns?: number;
}

/**
 * Imagem zen Pinterest — proporção original (contain), sem esticar.
 * Fundo desfocado preenche as barras laterais/superior como stories profissionais.
 */
export function FundoImagemZen({
  imagemFundoUrl,
  seed = 0,
  kenBurns = 1,
}: FundoImagemZenProps): React.ReactElement {
  const src = resolverSrcImagem(imagemFundoUrl);

  return (
    <>
      {/* Preenchimento ambiente — blur, não é a imagem principal */}
      <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: PALETA_SIDUS.fundo }}>
        <Img
          src={src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            filter: 'blur(32px) brightness(0.38) saturate(1.15)',
            transform: 'scale(1.2)',
          }}
        />
      </AbsoluteFill>

      {/* Imagem principal — tamanho original, centrada, SEM esticar */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Img
          src={src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center center',
            transform: `scale(${kenBurns})`,
            transformOrigin: 'center center',
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${PALETA_SIDUS.fundo}cc 0%, transparent 18%, transparent 72%, ${PALETA_SIDUS.fundo}dd 100%)`,
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          boxShadow: `inset 0 0 80px 32px ${PALETA_SIDUS.fundo}88`,
          pointerEvents: 'none',
        }}
      />
      <ZenOverlayAnimado seed={seed} />
    </>
  );
}
