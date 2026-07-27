import { PALETA_SIDUS } from '../lib/paleta-visual';

/** Link do site — sempre visível, zona segura acima da barra TikTok */
export function BarraLinkSite({ siteMarca = 'sidusastro.com' }: { siteMarca?: string }): React.ReactElement {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 198,
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

/** @deprecated usar BarraLinkSite */
export function MarcaSidusAstro({ siteMarca = 'sidusastro.com' }: { siteMarca?: string }): React.ReactElement {
  return <BarraLinkSite siteMarca={siteMarca} />;
}
