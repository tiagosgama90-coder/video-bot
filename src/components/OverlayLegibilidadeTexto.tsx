import React from 'react';
import { AbsoluteFill } from 'remotion';
import { PALETA_SIDUS } from '../lib/paleta-visual';

export interface OverlayLegibilidadeTextoProps {
  /** Com imagem zen Pinterest: overlay mínimo para não apagar o pin */
  modoImagemZen?: boolean;
}

/** Escurece fundos animados para o texto destacar; com imagem zen mantém o pin visível */
export function OverlayLegibilidadeTexto({
  modoImagemZen = false,
}: OverlayLegibilidadeTextoProps): React.ReactElement {
  if (modoImagemZen) {
    return (
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, transparent 0%, transparent 35%, ${PALETA_SIDUS.fundo}33 55%, ${PALETA_SIDUS.fundo}77 100%)`,
          pointerEvents: 'none',
        }}
      />
    );
  }

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${PALETA_SIDUS.fundo}dd 0%, ${PALETA_SIDUS.fundo}66 38%, ${PALETA_SIDUS.fundo}88 100%)`,
        backdropFilter: 'blur(6px)',
        pointerEvents: 'none',
      }}
    />
  );
}
