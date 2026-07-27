import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETA_SIDUS } from '../lib/paleta-visual';

const COR = PALETA_SIDUS.destaque;
const BRILHO = PALETA_SIDUS.destaqueSombra;

function Anel({
  cx,
  cy,
  diametro,
  grossura = 2,
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
        boxShadow: `0 0 28px ${BRILHO}`,
      }}
    />
  );
}

function VarianteAnéis({ cx, cy, tamanho }: { cx: number; cy: number; tamanho: number }): React.ReactElement {
  return (
    <>
      {Array.from({ length: 4 }, (_, i) => (
        <Anel key={`anel-${i}`} cx={cx} cy={cy} diametro={tamanho * 0.84 - i * 72} grossura={2} />
      ))}
      {Array.from({ length: 6 }, (_, i) => {
        const ang = (i / 6) * Math.PI * 2;
        const r = tamanho * 0.38;
        return (
          <div
            key={`linha-${i}`}
            style={{
              position: 'absolute',
              left: cx,
              top: cy,
              width: 3,
              height: r,
              transformOrigin: 'top center',
              transform: `rotate(${(ang * 180) / Math.PI}deg)`,
              background: `linear-gradient(180deg, ${COR}cc, transparent)`,
            }}
          />
        );
      })}
    </>
  );
}

function VarianteFlorDaVida({ cx, cy, tamanho }: { cx: number; cy: number; tamanho: number }): React.ReactElement {
  const raio = tamanho * 0.11;
  const dist = raio * 1.05;
  const centros = [{ x: 0, y: 0 }];
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    centros.push({ x: Math.cos(ang) * dist, y: Math.sin(ang) * dist });
  }
  return (
    <>
      {centros.map((c, i) => (
        <Anel key={`flor-${i}`} cx={cx + c.x} cy={cy + c.y} diametro={raio * 2} grossura={1.5} />
      ))}
    </>
  );
}

function VarianteFasesLua({ cx, cy, tamanho }: { cx: number; cy: number; tamanho: number }): React.ReactElement {
  const r = tamanho * 0.055;
  const inicio = cx - tamanho * 0.28;
  const passo = tamanho * 0.14;
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <Anel key={`lua-${i}`} cx={inicio + i * passo} cy={cy} diametro={r * 2} grossura={2} />
      ))}
      <div
        style={{
          position: 'absolute',
          left: cx - tamanho * 0.32,
          top: cy + r + 10,
          width: tamanho * 0.64,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${COR}88, transparent)`,
        }}
      />
    </>
  );
}

function VarianteLotus({ cx, cy, tamanho }: { cx: number; cy: number; tamanho: number }): React.ReactElement {
  const petalaH = tamanho * 0.22;
  const petalaW = tamanho * 0.07;
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={`petala-${i}`}
          style={{
            position: 'absolute',
            left: cx - petalaW / 2,
            top: cy - petalaH,
            width: petalaW,
            height: petalaH,
            borderRadius: '50% 50% 20% 20%',
            border: `1.5px solid ${COR}aa`,
            background: `linear-gradient(180deg, ${COR}22, transparent)`,
            transformOrigin: 'center bottom',
            transform: `rotate(${(i / 8) * 360}deg)`,
          }}
        />
      ))}
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.12} grossura={2} />
    </>
  );
}

function VarianteYantra({ cx, cy, tamanho }: { cx: number; cy: number; tamanho: number }): React.ReactElement {
  const r = tamanho * 0.34;
  const tri = (rotacao: number) => (
    <div
      style={{
        position: 'absolute',
        left: cx,
        top: cy - r,
        width: 0,
        height: 0,
        borderLeft: `${r * 0.58}px solid transparent`,
        borderRight: `${r * 0.58}px solid transparent`,
        borderBottom: `${r}px solid ${COR}55`,
        transformOrigin: 'center bottom',
        transform: `rotate(${rotacao}deg) translateX(-50%)`,
        marginLeft: -r * 0.58,
      }}
    />
  );
  return (
    <>
      {tri(0)}
      {tri(180)}
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.2} grossura={1.5} />
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.55} grossura={1.5} />
    </>
  );
}

function VarianteMetatron({ cx, cy, tamanho }: { cx: number; cy: number; tamanho: number }): React.ReactElement {
  const r = tamanho * 0.3;
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
              height: 2,
              background: `linear-gradient(90deg, ${COR}aa, ${COR}66)`,
              transformOrigin: 'left center',
              transform: `rotate(${ang}deg)`,
            }}
          />
        );
      })}
      {pontos.map((p, i) => (
        <Anel key={`vert-${i}`} cx={p.x} cy={p.y} diametro={tamanho * 0.05} grossura={1} />
      ))}
    </>
  );
}

const VARIANTES = [
  VarianteAnéis,
  VarianteFlorDaVida,
  VarianteFasesLua,
  VarianteLotus,
  VarianteYantra,
  VarianteMetatron,
] as const;

const NOMES_VARIANTES = [
  'anel',
  'flor-da-vida',
  'fases-lua',
  'lotus',
  'yantra',
  'metatron',
] as const;

export function indiceGeometriaPinterest(seed: number): number {
  return Math.abs(Math.floor(seed)) % VARIANTES.length;
}

export function nomeGeometriaPinterest(seed: number): string {
  return NOMES_VARIANTES[indiceGeometriaPinterest(seed)];
}

/** Geometria sagrada Pinterest — viewport quadrado centrado, simétrico, sem deformar. */
export function GeometriaSagradaSuave({ seed }: { seed: number }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const quadrado = Math.min(width, height);
  const cx = quadrado / 2;
  const cy = quadrado / 2;
  const rotacao = frame * 0.028 + seed * 0.17;
  const Variante = VARIANTES[indiceGeometriaPinterest(seed)];

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
          opacity: 0.58,
          transform: `rotate(${rotacao}deg)`,
          transformOrigin: 'center center',
        }}
      >
        <Variante cx={cx} cy={cy} tamanho={quadrado * 0.95} />
      </div>
    </AbsoluteFill>
  );
}
