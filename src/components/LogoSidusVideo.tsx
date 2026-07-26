import React from 'react';
import { Img, staticFile } from 'remotion';

const logoVertical = staticFile('logo-sidus-vertical.png');

export interface LogoSidusVideoProps {
  /** Largura em px — altura proporcional (logo vertical) */
  larguraPx?: number;
  opacidade?: number;
}

/**
 * Logo Sidus PNG transparente — halo escuro atrás preserva brilho da estrela.
 */
export function LogoSidusVideo({
  larguraPx = 480,
  opacidade = 1,
}: LogoSidusVideoProps): React.ReactElement {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: opacidade,
        zIndex: 12,
      }}
    >
      {/* halo escuro — impede que estrelas/fundo "comam" o logo */}
      <div
        style={{
          position: 'absolute',
          width: larguraPx * 1.15,
          height: larguraPx * 1.15,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 45%, transparent 72%)',
          filter: 'blur(8px)',
        }}
      />
      <Img
        src={logoVertical}
        style={{
          position: 'relative',
          width: larguraPx,
          height: 'auto',
          maxWidth: '94%',
          objectFit: 'contain',
          display: 'block',
          filter:
            'drop-shadow(0 8px 32px rgba(0,0,0,0.85)) drop-shadow(0 0 28px rgba(243,204,99,0.55))',
        }}
      />
    </div>
  );
}
