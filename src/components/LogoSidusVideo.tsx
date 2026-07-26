import React from 'react';
import { Img, staticFile } from 'remotion';

const logoVertical = staticFile('logo-sidus-vertical.png');

export interface LogoSidusVideoProps {
  /** Largura em px — altura proporcional (logo vertical) */
  larguraPx?: number;
  opacidade?: number;
}

/**
 * Logo Sidus PNG transparente — sem filtros para preservar o brilho da estrela.
 */
export function LogoSidusVideo({
  larguraPx = 420,
  opacidade = 1,
}: LogoSidusVideoProps): React.ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: opacidade,
        filter: 'drop-shadow(0 6px 28px rgba(0,0,0,0.65)) drop-shadow(0 0 18px rgba(243,204,99,0.35))',
      }}
    >
      <Img
        src={logoVertical}
        style={{
          width: larguraPx,
          height: 'auto',
          maxWidth: '92%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );
}
