import React from 'react';
import { Img, staticFile } from 'remotion';

const logoVertical = staticFile('logo-sidus-vertical.png');

export interface LogoSidusVideoProps {
  /** Largura em px — altura proporcional (logo vertical) */
  larguraPx?: number;
}

/** Logo Sidus — PNG do utilizador (logo-sidus-fonte1.png), sem filtros nem alterações. */
export function LogoSidusVideo({ larguraPx = 340 }: LogoSidusVideoProps): React.ReactElement {
  return (
    <Img
      src={logoVertical}
      style={{
        width: larguraPx,
        height: 'auto',
        maxWidth: '94%',
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );
}
