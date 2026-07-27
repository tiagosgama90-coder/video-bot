import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETA_SIDUS } from '../lib/paleta-visual';

const COR = PALETA_SIDUS.destaque;
const BRILHO = PALETA_SIDUS.destaqueSombra;

/** Opacidade baixa — geometria subtil no centro, não mandala dominante */
export const OPACIDADE_GEOMETRIA_CENTRO = 0.3;

function Anel({
  cx,
  cy,
  diametro,
  grossura = 1.5,
}: {
  cx: number;
  cy: number;
  diametro: number;
  grossura?: number;
}): React.ReactElement {
  const r = diametro / 2;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - r,
        top: cy - r,
        width: diametro,
        height: diametro,
        borderRadius: '50%',
        border: `${grossura}px solid ${COR}`,
        boxShadow: `0 0 20px ${BRILHO}`,
      }}
    />
  );
}

function VarianteAnéis({ cx, cy, tamanho }: { cx: number; cy: number; tamanho: number }): React.ReactElement {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <Anel key={`anel-${i}`} cx={cx} cy={cy} diametro={tamanho * 0.88 - i * 68} grossura={1.5} />
      ))}
      {Array.from({ length: 8 }, (_, i) => {
        const ang = (i / 8) * Math.PI * 2;
        const r = tamanho * 0.4;
        return (
          <div
            key={`raio-${i}`}
            style={{
              position: 'absolute',
              left: cx,
              top: cy,
              width: 2,
              height: r,
              transformOrigin: 'top center',
              transform: `rotate(${(ang * 180) / Math.PI}deg)`,
              background: `linear-gradient(180deg, ${COR}99, transparent)`,
            }}
          />
        );
      })}
    </>
  );
}

function VarianteMetatron({ cx, cy, tamanho }: { cx: number; cy: number; tamanho: number }): React.ReactElement {
  const r = tamanho * 0.32;
  const pontos = Array.from({ length: 6 }, (_, i) => {
    const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r };
  });
  return (
    <>
      {pontos.map((p, i) => {
        const prox = pontos[(i + 1) % 6];
        const dx = prox.x - p.x;
        const dy = prox.y - p.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <div
            key={`hex-${i}`}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: len,
              height: 1.5,
              background: `linear-gradient(90deg, ${COR}88, ${COR}44)`,
              transformOrigin: 'left center',
              transform: `rotate(${ang}deg)`,
            }}
          />
        );
      })}
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.18} grossura={1.5} />
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.64} grossura={1} />
    </>
  );
}

function VarianteEstrelaOctogonal({ cx, cy, tamanho }: { cx: number; cy: number; tamanho: number }): React.ReactElement {
  const r = tamanho * 0.38;
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => {
        const ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
        return (
          <div
            key={`eixo-${i}`}
            style={{
              position: 'absolute',
              left: cx,
              top: cy,
              width: 2,
              height: r,
              transformOrigin: 'top center',
              transform: `rotate(${(ang * 180) / Math.PI}deg)`,
              background: `linear-gradient(180deg, ${COR}aa, transparent)`,
            }}
          />
        );
      })}
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.22} grossura={1.5} />
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.5} grossura={1} />
    </>
  );
}

function VarianteGradeCosmica({ cx, cy, tamanho }: { cx: number; cy: number; tamanho: number }): React.ReactElement {
  const metade = tamanho * 0.36;
  const passo = tamanho * 0.18;
  const linhas: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  for (let i = -2; i <= 2; i++) {
    linhas.push({ x1: cx - metade, y1: cy + i * passo, x2: cx + metade, y2: cy + i * passo });
    linhas.push({ x1: cx + i * passo, y1: cy - metade, x2: cx + i * passo, y2: cy + metade });
  }
  return (
    <>
      {linhas.map((l, i) => {
        const dx = l.x2 - l.x1;
        const dy = l.y2 - l.y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <div
            key={`grid-${i}`}
            style={{
              position: 'absolute',
              left: l.x1,
              top: l.y1,
              width: len,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${COR}55, transparent)`,
              transformOrigin: 'left center',
              transform: `rotate(${ang}deg)`,
            }}
          />
        );
      })}
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.12} grossura={1.5} />
    </>
  );
}

function VarianteOrbitas({ cx, cy, tamanho }: { cx: number; cy: number; tamanho: number }): React.ReactElement {
  return (
    <>
      {[0.28, 0.42, 0.56, 0.7].map((f, i) => (
        <Anel key={`orb-${i}`} cx={cx} cy={cy} diametro={tamanho * f} grossura={1} />
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const ang = (i / 12) * Math.PI * 2;
        const r = tamanho * 0.35;
        const px = cx + Math.cos(ang) * r;
        const py = cy + Math.sin(ang) * r;
        return <Anel key={`pt-${i}`} cx={px} cy={py} diametro={tamanho * 0.04} grossura={1} />;
      })}
    </>
  );
}

function VarianteCruzCosmica({ cx, cy, tamanho }: { cx: number; cy: number; tamanho: number }): React.ReactElement {
  const r = tamanho * 0.4;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: cx - r,
          top: cy - 1,
          width: r * 2,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${COR}88, transparent)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: cx - 1,
          top: cy - r,
          width: 2,
          height: r * 2,
          background: `linear-gradient(180deg, transparent, ${COR}88, transparent)`,
        }}
      />
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.2} grossura={1.5} />
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.55} grossura={1} />
    </>
  );
}

const VARIANTES = [
  VarianteAnéis,
  VarianteMetatron,
  VarianteEstrelaOctogonal,
  VarianteGradeCosmica,
  VarianteOrbitas,
  VarianteCruzCosmica,
] as const;

const NOMES_VARIANTES = [
  'aneis',
  'metatron',
  'estrela-8',
  'grade',
  'orbitas',
  'cruz',
] as const;

export function indiceGeometriaCosmica(seed: number): number {
  return Math.abs(Math.floor(seed)) % VARIANTES.length;
}

export function nomeGeometriaCosmica(seed: number): string {
  return NOMES_VARIANTES[indiceGeometriaCosmica(seed)];
}

/** Geometria simétrica no centro — viewport quadrado, rotação lenta, sem mandalas */
export function GeometriaCosmicaCentro({ seed }: { seed: number }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const quadrado = Math.min(width, height);
  const cx = quadrado / 2;
  const cy = quadrado / 2;
  const rotacao = frame * 0.022 + seed * 0.11;
  const Variante = VARIANTES[indiceGeometriaCosmica(seed)];

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: quadrado,
          height: quadrado,
          marginLeft: -quadrado / 2,
          marginTop: -quadrado / 2,
          opacity: OPACIDADE_GEOMETRIA_CENTRO,
          transform: `rotate(${rotacao}deg)`,
          transformOrigin: 'center center',
        }}
      >
        <Variante cx={cx} cy={cy} tamanho={quadrado * 0.92} />
      </div>
    </AbsoluteFill>
  );
}
