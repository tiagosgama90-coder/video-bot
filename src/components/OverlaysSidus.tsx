import { interpolate, useCurrentFrame } from 'remotion';
import { PALETA_SIDUS } from '../lib/paleta-visual';

/** Zona segura: acima das legendas TikTok/Instagram (UI ~250–400px do fundo) */
const BARRA_LINK_BOTTOM_PX = 480;
const RODAPE_CTA_BOTTOM_PX = 560;

/** Link do site — sempre visível, acima das legendas das redes */
export function BarraLinkSite({ siteMarca = 'sidusastro.com' }: { siteMarca?: string }): React.ReactElement {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: BARRA_LINK_BOTTOM_PX,
        zIndex: 28,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          color: PALETA_SIDUS.destaque,
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: 1.4,
          padding: '10px 28px',
          borderRadius: 999,
          background: 'rgba(0,0,0,0.55)',
          border: `1px solid ${PALETA_SIDUS.destaqueBorda}`,
          textShadow: `0 2px 14px rgba(0,0,0,0.9), 0 0 16px ${PALETA_SIDUS.destaqueSombra}`,
          fontFamily: 'system-ui, sans-serif',
          backdropFilter: 'blur(8px)',
        }}
      >
        {siteMarca}
      </div>
    </div>
  );
}

export interface RodapeComercialSidusProps {
  siteMarca?: string;
  activo: boolean;
  frameInicio: number;
}

/** CTA comercial reforçado na fase final */
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
        bottom: RODAPE_CTA_BOTTOM_PX,
        zIndex: 32,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '0 40px',
        opacity: opacidade,
        transform: `translateY(${(1 - opacidade) * 14}px)`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          color: PALETA_SIDUS.destaqueForte,
          fontSize: 32,
          fontWeight: 900,
          letterSpacing: 1,
          textAlign: 'center',
          textShadow: '0 3px 18px rgba(0,0,0,0.95), 0 0 22px rgba(243,204,99,0.5)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {textoVisite}
      </div>
    </div>
  );
}

/** @deprecated usar BarraLinkSite */
export function MarcaSidusAstro({ siteMarca = 'sidusastro.com' }: { siteMarca?: string }): React.ReactElement {
  return <BarraLinkSite siteMarca={siteMarca} />;
}
