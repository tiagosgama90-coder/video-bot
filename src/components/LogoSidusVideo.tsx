import React from 'react';
import { Img, staticFile } from 'remotion';

const logoVertical = staticFile('logo-sidus-vertical.png');

export interface LogoSidusVideoProps {
  larguraPx?: number;
}

/** Logo Sidus — ficheiro PNG do utilizador, sem filtros nem alterações. */
export function LogoSidusVideo({ larguraPx = 260 }: LogoSidusVideoProps): React.ReactElement {
  return (
    <Img
      src={logoVertical}
      style={{
        width: larguraPx,
        height: 'auto',
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );
}
