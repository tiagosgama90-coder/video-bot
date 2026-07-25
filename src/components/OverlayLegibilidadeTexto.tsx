import React from 'react';
import { AbsoluteFill } from 'remotion';
import { PALETA_SIDUS } from '../lib/paleta-visual';

/** Escurece/desfoca fundos animados para o texto ganhar prioridade visual */
export function OverlayLegibilidadeTexto(): React.ReactElement {
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${PALETA_SIDUS.fundo}cc 0%, ${PALETA_SIDUS.fundo}44 40%, ${PALETA_SIDUS.fundo}77 100%)`,
        backdropFilter: 'blur(4px)',
        pointerEvents: 'none',
      }}
    />
  );
}
