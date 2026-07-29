import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETA_SIDUS } from '../lib/paleta-visual';
import { GeometriaCosmicaCentro } from './GeometriaCosmicaCentro';

export { GeometriaCosmicaCentro as GeometriaSagradaSuave } from './GeometriaCosmicaCentro';

const PALETAS_NEBULOSA = [
  ['#1a0e3a', '#3d2068', '#5c3d8a'],
  ['#0e1a38', '#1e3a6e', '#2d5a8a'],
  ['#1a1030', '#4a1860', '#6b3088'],
  ['#081828', '#184858', '#2a6878'],
  ['#201028', '#502060', '#803888'],
] as const;

function escolherPaletaNebulosa(seed: number): readonly string[] {
  return PALETAS_NEBULOSA[Math.abs(seed) % PALETAS_NEBULOSA.length];
}

/** Nebulosas em camadas — deslocam-se lentamente atrás do centro */
function NebulosasCosmicas({ seed }: { seed: number }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const paleta = escolherPaletaNebulosa(seed);

  const camadas = [
    { escala: 1.35, velX: 8, velY: 5, blur: 70, op: 0.42, cor: paleta[0] },
    { escala: 1.1, velX: -12, velY: 7, blur: 55, op: 0.38, cor: paleta[1] },
    { escala: 0.95, velX: 15, velY: -6, blur: 45, op: 0.32, cor: paleta[2] },
    { escala: 1.2, velX: -6, velY: 10, blur: 80, op: 0.28, cor: paleta[1] },
  ];

  const driftGlobal = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 42%, #0a0818 0%, #040208 45%, #000000 100%)',
        }}
      />
      {camadas.map((cam, i) => {
        const ox = Math.sin(t * 0.08 + i * 1.7 + seed * 0.01) * cam.velX * (1 + driftGlobal * 0.3);
        const oy = Math.cos(t * 0.06 + i * 2.1 + seed * 0.013) * cam.velY * (1 + driftGlobal * 0.3);
        const lado = Math.max(width, height) * cam.escala;
        const bx = width * (0.2 + random(`nb-x-${seed}-${i}`) * 0.6) + ox;
        const by = height * (0.15 + random(`nb-y-${seed}-${i}`) * 0.55) + oy;

        return (
          <div
            key={`nebula-${i}`}
            style={{
              position: 'absolute',
              left: bx - lado / 2,
              top: by - lado / 2,
              width: lado,
              height: lado,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${cam.cor}cc 0%, ${cam.cor}44 35%, transparent 68%)`,
              opacity: cam.op,
              filter: `blur(${cam.blur}px)`,
              transform: `scale(${1 + 0.04 * Math.sin(t * 0.15 + i)})`,
            }}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: width * 0.5 - 280,
          top: height * 0.32,
          width: 560,
          height: 560,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${PALETA_SIDUS.destaque}14 0%, transparent 72%)`,
          filter: 'blur(50px)',
          opacity: 0.45 + 0.15 * Math.sin(t * 0.35),
          transform: `translate(${Math.sin(t * 0.1) * 20}px, ${Math.cos(t * 0.08) * 14}px)`,
        }}
      />
    </AbsoluteFill>
  );
}

type Estrela = {
  x: number;
  y: number;
  size: number;
  opacidade: number;
  cor: string;
  brilho: number;
  camada: number;
};

function gerarEstrelas(width: number, height: number, seed: number, quantidade: number, camada: number): Estrela[] {
  const cores = [
    '#ffffff',
    '#f0f4ff',
    '#fff8e8',
    '#e8eeff',
    '#ffe8c8',
    '#ffd6a5',
    '#c4e8ff',
    '#e8d4ff',
    '#fff0f5',
  ];
  return Array.from({ length: quantidade }, (_, i) => ({
    x: random(`st-x-${seed}-${camada}-${i}`) * width,
    y: random(`st-y-${seed}-${camada}-${i}`) * height,
    size: camada === 0
      ? 0.5 + random(`st-s-${seed}-${camada}-${i}`) * 1.4
      : camada === 2
        ? 0.35 + random(`st-s-${seed}-${camada}-${i}`) * 0.9
        : 1.1 + random(`st-s-${seed}-${camada}-${i}`) * 3.4,
    opacidade: camada === 0
      ? 0.18 + random(`st-o-${seed}-${camada}-${i}`) * 0.38
      : camada === 2
        ? 0.12 + random(`st-o-${seed}-${camada}-${i}`) * 0.28
        : 0.38 + random(`st-o-${seed}-${camada}-${i}`) * 0.58,
    cor: cores[Math.floor(random(`st-c-${seed}-${camada}-${i}`) * cores.length)],
    brilho: random(`st-b-${seed}-${camada}-${i}`),
    camada,
  }));
}

/** Estrelas realistas — camada fundo (atrás da geometria) ou frente */
export function EstrelasRealistas({
  seed,
  camada = 'todas',
}: {
  seed: number;
  camada?: 'fundo' | 'frente' | 'todas';
}): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames, fps } = useVideoConfig();
  const t = frame / fps;

  const camadaFundo = gerarEstrelas(width, height, seed, 360, 0);
  const camadaMicro = gerarEstrelas(width, height, seed + 3, 180, 2);
  const camadaFrente = gerarEstrelas(width, height, seed + 7, 140, 1);

  const listas =
    camada === 'fundo'
      ? [
          [camadaFundo, 0.55] as const,
          [camadaMicro, 0.35] as const,
        ]
      : camada === 'frente'
        ? [[camadaFrente, 1.25] as const]
        : ([
            [camadaFundo, 0.55],
            [camadaMicro, 0.35],
            [camadaFrente, 1.25],
          ] as const);

  const renderizar = (lista: Estrela[], fatorVel: number) =>
    lista.map((e, i) => {
      const cintilar = 0.72 + 0.28 * Math.sin(t * (1.8 + e.brilho * 3) + i * 0.9);
      const velY = (0.08 + e.brilho * 0.25) * fatorVel;
      const velX = (random(`st-dx-${seed}-${i}`) - 0.5) * 0.12 * fatorVel;
      const y = ((e.y - frame * velY) % (height + 40) + height + 40) % (height + 40) - 20;
      const x = ((e.x + frame * velX + Math.sin(t * 0.3 + i) * 6) % (width + 20) + width + 20) % (width + 20) - 10;
      const fadeIn = Math.min(1, frame / 18);
      const fadeOut = Math.min(1, (durationInFrames - frame) / 22);
      const op = e.opacidade * cintilar * fadeIn * fadeOut;
      const glow = e.size > 2.2 ? e.size * 5 : e.size * 2.5;

      return (
        <div
          key={`${e.camada}-${i}`}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: e.size,
            height: e.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${e.cor} 0%, transparent 70%)`,
            opacity: op,
            boxShadow: `0 0 ${glow}px ${e.cor}88`,
          }}
        />
      );
    });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {listas.flatMap(([lista, fatorVel]) => renderizar(lista, fatorVel))}
    </AbsoluteFill>
  );
}

/** @deprecated alias */
export function EstrelasAPassear(): React.ReactElement {
  return <EstrelasRealistas seed={0} />;
}

export interface FundoCosmicoSidusProps {
  seed?: number;
  signoIndice?: number;
  varianteGeometria?: number;
}

/**
 * Fundo cosmos puro — nebulosas atrás, geometria simétrica no centro (baixa opacidade), estrelas realistas.
 */
export function FundoCosmicoSidus({
  seed = 0,
  signoIndice = 0,
  varianteGeometria,
}: FundoCosmicoSidusProps): React.ReactElement {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>
      <NebulosasCosmicas seed={seed} />
      <EstrelasRealistas seed={seed} camada="fundo" />
      <GeometriaCosmicaCentro
        seed={seed}
        signoIndice={signoIndice}
        varianteIndice={varianteGeometria}
      />
      <EstrelasRealistas seed={seed} camada="frente" />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 0%, transparent 52%, rgba(0,0,0,0.18) 80%, rgba(0,0,0,0.45) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
}
