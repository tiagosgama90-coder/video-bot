import React from 'react';
import { Img, staticFile } from 'remotion';

const logoVertical = staticFile('logo-sidus-vertical.png');

export interface LogoSidusVideoProps {
  /** Largura em px — altura proporcional (logo quadrado, símbolo + SIDUS intactos) */
  larguraPx?: number;
  opacidade?: number;
}

/**
 * Logo Sidus oficial — PNG transparente, unidade completa sem alterar posições internas.
 */
export function LogoSidusVideo({
  larguraPx = 260,
  opacidade = 1,
}: LogoSidusVideoProps): React.ReactElement {
  return (
    <Img
      src={logoVertical}
      style={{
        width: larguraPx,
        height: 'auto',
        maxWidth: '94%',
        objectFit: 'contain',
        display: 'block',
        opacity: opacidade,
        filter:
          'drop-shadow(0 6px 24px rgba(0,0,0,0.75)) drop-shadow(0 0 20px rgba(243,204,99,0.45))',
      }}
    />
  );
}
