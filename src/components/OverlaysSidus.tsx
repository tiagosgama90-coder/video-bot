import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETA_SIDUS } from '../lib/paleta-visual';

const logoHorizontal = staticFile('logo-sidus-horizontal.png');

export interface RodapeComercialSidusProps {
  siteMarca?: string;
  /** Fase comercial (fecho) — mostra CTA no rodapé seguro */
  activo: boolean;
  frameInicio: number;
}

/**
 * CTA comercial no rodapé — acima da barra TikTok/Instagram (~210px do fundo).
 */
export function RodapeComercialSidus({
  siteMarca = 'sidusastro.com',
  activo,
  frameInicio,
}: RodapeComercialSidusProps): React.ReactElement | null {
  const frame = useCurrentFrame();

  if (!activo) {
    return null;
  }

  const opacidade = interpolate(frame, [frameInicio, frameInicio + 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const textoVisite = siteMarca.includes('.com/en')
    ? 'Visit SidusAstro'
    : 'Visite o SidusAstro';

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 210,
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '0 48px',
        opacity: opacidade,
        transform: `translateY(${(1 - opacidade) * 16}px)`,
        pointerEvents: 'none',
      }}
    >
      <Img
        src={logoHorizontal}
        style={{
          width: 340,
          maxWidth: '88%',
          height: 'auto',
          objectFit: 'contain',
          display: 'block',
          filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.7)) drop-shadow(0 0 14px rgba(243,204,99,0.3))',
        }}
      />
      <div
        style={{
          color: PALETA_SIDUS.destaqueForte,
          fontSize: 34,
          fontWeight: 900,
          letterSpacing: 1.2,
          textAlign: 'center',
          textShadow: '0 3px 16px rgba(0,0,0,0.9), 0 0 20px rgba(243,204,99,0.45)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {textoVisite}
      </div>
      <div
        style={{
          color: PALETA_SIDUS.destaque,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: 0.8,
          textAlign: 'center',
          textShadow: '0 2px 12px rgba(0,0,0,0.85)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {siteMarca}
      </div>
    </div>
  );
}

/** @deprecated usar RodapeComercialSidus — mantido para imports antigos */
export function MarcaSidusAstro({ siteMarca = 'sidusastro.com' }: { siteMarca?: string }): null {
  void siteMarca;
  return null;
}
