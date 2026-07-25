import React from 'react';
import { AbsoluteFill } from 'remotion';
import { PALETA_SIDUS } from '../lib/paleta-visual';

/** Escurece fundos para o texto ganhar prioridade - imagem Pinterest não compete com letras */
export function OverlayLegibilidadeTexto(): React.ReactElement {
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
