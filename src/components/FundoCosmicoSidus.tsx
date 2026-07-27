import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETA_SIDUS } from '../lib/paleta-visual';

export function EstrelasAPassear(): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const estrelas = Array.from({ length: 120 }, (_, i) => {
    const x0 = random(`cs-x-${i}`) * width;
    const y0 = random(`cs-y-${i}`) * height;
    const size = 1.2 + random(`cs-s-${i}`) * 3.5;
    const velY = 0.12 + random(`cs-vy-${i}`) * 0.55;
    const velX = (random(`cs-vx-${i}`) - 0.5) * 0.35;
    const y = (y0 - frame * velY) % (height + 50);
    const x = x0 + Math.sin(frame * 0.022 + i * 0.6) * 14 + frame * velX;
    const opacidade = 0.2 + random(`cs-o-${i}`) * 0.55;
    const fadeIn = Math.min(1, frame / 20);
    const fadeOut = Math.min(1, (durationInFrames - frame) / 25);

    return {
      x: ((x % width) + width) % width,
      y: ((y % height) + height) % height,
      size,
      opacidade: opacidade * fadeIn * fadeOut,
    };
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {estrelas.map((e, i) => (
        <div
          key={`estrela-${i}`}
          style={{
            position: 'absolute',
            left: e.x,
            top: e.y,
            width: e.size,
            height: e.size,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)',
            opacity: e.opacidade,
            boxShadow: `0 0 ${e.size * 4}px rgba(243,204,99,0.35)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
}

/** Opacidade do desenho de geometria sagrada (visível mas não tapa o logo) */
export const OPACIDADE_GEOMETRIA_SAGRADA = 0.52;

export function GeometriaSagradaSuave({ seed }: { seed: number }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height * 0.36;
  const rotacao = frame * 0.035;
  const tamanho = Math.min(width, height) * 0.95;

  return (
    <AbsoluteFill
      style={{
        opacity: OPACIDADE_GEOMETRIA_SAGRADA,
        transform: `rotate(${rotacao}deg)`,
        transformOrigin: `${cx}px ${cy}px`,
        pointerEvents: 'none',
      }}
    >
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={`anel-${i}`}
          style={{
            position: 'absolute',
            left: cx - (tamanho * 0.42 - i * 36),
            top: cy - (tamanho * 0.42 - i * 36),
            width: (tamanho * 0.84 - i * 72),
            height: (tamanho * 0.84 - i * 72),
            borderRadius: '50%',
            border: `1.5px solid ${PALETA_SIDUS.destaque}`,
            boxShadow: `0 0 32px ${PALETA_SIDUS.destaqueSombra}`,
          }}
        />
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
              width: 2,
              height: r,
              transformOrigin: 'top center',
              transform: `rotate(${(ang * 180) / Math.PI}deg)`,
              background: `linear-gradient(180deg, ${PALETA_SIDUS.destaque}88, transparent)`,
            }}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: cx - tamanho * 0.12,
          top: cy - tamanho * 0.12,
          width: tamanho * 0.24,
          height: tamanho * 0.24,
          borderRadius: '50%',
          border: `1px solid ${PALETA_SIDUS.destaque}66`,
          boxShadow: `inset 0 0 30px ${PALETA_SIDUS.destaque}22`,
        }}
      />
    </AbsoluteFill>
  );
}

function NebulosaSuave({ seed }: { seed: number }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;

  const blobs = [
    { cor: '#2a1848', x: 15, y: 18, s: 1.1 },
    { cor: '#4a2d7a', x: 82, y: 22, s: 0.9 },
    { cor: '#1a2848', x: 20, y: 78, s: 1.0 },
    { cor: '#3d2060', x: 85, y: 72, s: 0.85 },
  ];

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {blobs.map((b, i) => {
        const drift = Math.sin(t * 0.25 + i + seed * 0.001) * 12;
        return (
          <div
            key={`blob-${i}`}
            style={{
              position: 'absolute',
              left: `${b.x + drift * 0.15}%`,
              top: `${b.y}%`,
              width: 420 * b.s,
              height: 420 * b.s,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${b.cor}cc 0%, transparent 68%)`,
              opacity: 0.55,
              filter: 'blur(50px)',
            }}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: width * 0.5 - 200,
          top: height * 0.28,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${PALETA_SIDUS.destaque}18 0%, transparent 70%)`,
          filter: 'blur(40px)',
          opacity: 0.5 + 0.2 * Math.sin(t * 0.4),
        }}
      />
    </AbsoluteFill>
  );
}

export interface FundoCosmicoSidusProps {
  seed?: number;
}

/**
 * Fundo preto cósmico limpo — estrelas, nebulosa suave e geometria sagrada discreta.
 * Centro livre para o logo Sidus destacar (sem imagens IA esticadas).
 */
export function FundoCosmicoSidus({ seed = 0 }: FundoCosmicoSidusProps): React.ReactElement {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <NebulosaSuave seed={seed} />
      <GeometriaSagradaSuave seed={seed} />
      <EstrelasAPassear />
      {/* vinheta nas bordas — centro escuro para o logo */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 75% 55% at 50% 32%, transparent 0%, transparent 42%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.92) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
}
