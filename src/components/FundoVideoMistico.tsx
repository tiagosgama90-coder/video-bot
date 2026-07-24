import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { TemaFundoMistico } from '../lib/fundo-video';

const SIMBOLOS_ZODIACO = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const PALETAS: Record<TemaFundoMistico, [string, string, string]> = {
  nebula: ['#1a0a2e', '#4a1a6b', '#c9a227'],
  constelacoes: ['#0b1026', '#1e3a5f', '#e8d5a3'],
  zodiaco: ['#12081f', '#3d1f5c', '#f3cc63'],
  aurora: ['#061018', '#0d3b2e', '#7bdcb5'],
  lua: ['#09070f', '#1a1530', '#d4c4a8'],
  cosmos: ['#050510', '#2a1045', '#9b59b6'],
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function CamadaEstrelas({ seed, quantidade }: { seed: number; quantidade: number }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const estrelas = Array.from({ length: quantidade }, (_, i) => {
    const x = random(`fv-x-${seed}-${i}`) * width;
    const y = random(`fv-y-${seed}-${i}`) * height;
    const size = 1 + random(`fv-s-${seed}-${i}`) * 3.5;
    const velocidade = 0.15 + random(`fv-v-${seed}-${i}`) * 0.55;
    const brilho = 0.25 + random(`fv-b-${seed}-${i}`) * 0.75;
    const twinkle = 0.55 + 0.45 * Math.sin(frame * 0.08 + random(`fv-t-${seed}-${i}`) * 12);
    const driftY = (frame * velocidade) % (height + 40);

    return { x, y: (y + driftY) % (height + 20), size, opacity: brilho * twinkle };
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {estrelas.map((e, idx) => (
        <div
          key={`estrela-${idx}`}
          style={{
            position: 'absolute',
            left: e.x,
            top: e.y,
            width: e.size,
            height: e.size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)',
            opacity: e.opacity,
            boxShadow: `0 0 ${e.size * 3}px rgba(255,255,255,0.6)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
}

function TemaNebula({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const blobs = Array.from({ length: 5 }, (_, i) => {
    const angulo = t * (0.12 + i * 0.04) + random(`nb-a-${seed}-${i}`) * Math.PI * 2;
    const raio = 18 + random(`nb-r-${seed}-${i}`) * 28;
    const x = 50 + Math.cos(angulo) * raio;
    const y = 50 + Math.sin(angulo) * raio * 1.2;
    const escala = 0.85 + 0.2 * Math.sin(t * 0.35 + i);
    const opacidade = 0.35 + random(`nb-o-${seed}-${i}`) * 0.25;

    return { x, y, escala, opacidade, cor: i % 2 === 0 ? cores[1] : cores[2] };
  });

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 120%, ${cores[0]} 0%, #020108 70%)` }}>
      {blobs.map((b, i) => (
        <div
          key={`blob-${i}`}
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: 520,
            height: 520,
            transform: `translate(-50%, -50%) scale(${b.escala})`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.cor}88 0%, transparent 68%)`,
            opacity: b.opacidade,
            filter: 'blur(42px)',
          }}
        />
      ))}
      <CamadaEstrelas seed={seed + 1} quantidade={90} />
    </AbsoluteFill>
  );
}

function TemaConstelacoes({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const rotacao = frame * 0.08;

  const pontos = Array.from({ length: 24 }, (_, i) => ({
    x: random(`ct-x-${seed}-${i}`) * width,
    y: random(`ct-y-${seed}-${i}`) * height,
    r: 2 + random(`ct-r-${seed}-${i}`) * 4,
  }));

  const cx = width / 2;
  const cy = height / 2;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${cores[0]} 0%, ${cores[1]} 100%)` }}>
      <AbsoluteFill
        style={{
          transform: `rotate(${rotacao}deg)`,
          transformOrigin: 'center center',
        }}
      >
        <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
          {pontos.map((p, i) => {
            const alvo = pontos[(i + 3) % pontos.length];
            return (
              <line
                key={`linha-${i}`}
                x1={p.x}
                y1={p.y}
                x2={alvo.x}
                y2={alvo.y}
                stroke={cores[2]}
                strokeWidth={1}
                opacity={0.18 + (i % 4) * 0.04}
              />
            );
          })}
          {pontos.map((p, i) => (
            <circle key={`ponto-${i}`} cx={p.x} cy={p.y} r={p.r} fill="#fff" opacity={0.75} />
          ))}
        </svg>
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: cx - 180,
          top: cy - 180,
          width: 360,
          height: 360,
          borderRadius: '50%',
          border: `1px solid ${cores[2]}44`,
          boxShadow: `0 0 80px ${cores[2]}33`,
          transform: `rotate(${-rotacao * 0.6}deg)`,
        }}
      />
      <CamadaEstrelas seed={seed + 2} quantidade={70} />
    </AbsoluteFill>
  );
}

function TemaZodiaco({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const rotacao = frame * 0.15;
  const cx = width / 2;
  const cy = height / 2;
  const raio = Math.min(width, height) * 0.34;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${cores[1]} 0%, ${cores[0]} 65%)` }}>
      <AbsoluteFill
        style={{
          transform: `rotate(${rotacao}deg)`,
          transformOrigin: 'center center',
        }}
      >
        {SIMBOLOS_ZODIACO.map((simbolo, i) => {
          const angulo = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angulo) * raio;
          const y = cy + Math.sin(angulo) * raio;
          const pulso = 0.9 + 0.1 * Math.sin(frame * 0.12 + i);

          return (
            <div
              key={`zod-${i}`}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: `translate(-50%, -50%) scale(${pulso})`,
                fontSize: 56,
                color: cores[2],
                textShadow: `0 0 24px ${cores[2]}aa`,
                opacity: 0.85,
              }}
            >
              {simbolo}
            </div>
          );
        })}
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: cx - raio,
          top: cy - raio,
          width: raio * 2,
          height: raio * 2,
          borderRadius: '50%',
          border: `2px solid ${cores[2]}55`,
          boxShadow: `inset 0 0 60px ${cores[1]}88`,
        }}
      />
      <CamadaEstrelas seed={seed + 3} quantidade={60} />
    </AbsoluteFill>
  );
}

function TemaAurora({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const ondas = Array.from({ length: 4 }, (_, i) => {
    const offset = Math.sin(frame * 0.04 + i * 1.4) * 80;
    const opacidade = 0.22 + random(`au-o-${seed}-${i}`) * 0.18;
    return { offset, opacidade, top: 15 + i * 18 };
  });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${cores[0]} 0%, ${cores[1]} 55%, #020508 100%)` }}>
      {ondas.map((o, i) => (
        <div
          key={`aurora-${i}`}
          style={{
            position: 'absolute',
            left: -120 + o.offset,
            top: `${o.top}%`,
            width: '140%',
            height: height * 0.22,
            background: `linear-gradient(90deg, transparent 0%, ${cores[2]}88 35%, ${cores[2]}44 65%, transparent 100%)`,
            opacity: o.opacidade,
            filter: 'blur(36px)',
            transform: `skewY(${-8 + i * 3}deg)`,
          }}
        />
      ))}
      <CamadaEstrelas seed={seed + 4} quantidade={80} />
    </AbsoluteFill>
  );
}

function TemaLua({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fase = (Math.sin(frame * 0.025) + 1) / 2;
  const brilho = 0.55 + 0.25 * Math.sin(frame * 0.06);
  const cx = width * 0.5;
  const cy = height * 0.38;
  const raio = Math.min(width, height) * 0.22;
  const sombraX = interpolate(fase, [0, 1], [raio * 0.9, -raio * 0.3]);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 20%, ${cores[1]} 0%, ${cores[0]} 80%)` }}>
      <CamadaEstrelas seed={seed + 5} quantidade={100} />
      <div
        style={{
          position: 'absolute',
          left: cx - raio,
          top: cy - raio,
          width: raio * 2,
          height: raio * 2,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, #f5f0e6 0%, ${cores[2]} 55%, #8a7f6a 100%)`,
          boxShadow: `0 0 ${80 * brilho}px rgba(245,240,230,${0.35 * brilho})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: cx - raio + sombraX,
          top: cy - raio,
          width: raio * 2,
          height: raio * 2,
          borderRadius: '50%',
          background: cores[0],
          opacity: clamp(0.35 + fase * 0.45, 0, 0.85),
          filter: 'blur(2px)',
        }}
      />
    </AbsoluteFill>
  );
}

function TemaCosmos({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const zoom = 1 + frame * 0.00035;
  const driftX = Math.sin(frame * 0.02) * 30;
  const driftY = Math.cos(frame * 0.015) * 20;

  return (
    <AbsoluteFill style={{ background: cores[0], overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          transform: `scale(${zoom}) translate(${driftX}px, ${driftY}px)`,
          transformOrigin: 'center center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '10%',
            top: '15%',
            width: width * 0.9,
            height: height * 0.7,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${cores[2]}55 0%, ${cores[1]}33 40%, transparent 70%)`,
            filter: 'blur(50px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '-5%',
            bottom: '10%',
            width: width * 0.7,
            height: height * 0.5,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${cores[1]}66 0%, transparent 65%)`,
            filter: 'blur(40px)',
          }}
        />
        <CamadaEstrelas seed={seed + 6} quantidade={120} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export interface FundoVideoMisticoProps {
  tema: TemaFundoMistico;
  seed: number;
}

/** Fundo em movimento — nebulosa, zodíaco, aurora, lua, etc. (substitui imagem estática) */
export function FundoVideoMistico({ tema, seed }: FundoVideoMisticoProps): React.ReactElement {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cores = PALETAS[tema];
  const kenBurns = 1 + (frame / durationInFrames) * 0.06;
  const fadeIn = clamp(frame / 20, 0, 1);
  const fadeOut = clamp((durationInFrames - frame) / 25, 0, 1);

  let conteudo: React.ReactElement;
  switch (tema) {
    case 'nebula':
      conteudo = <TemaNebula seed={seed} cores={cores} />;
      break;
    case 'constelacoes':
      conteudo = <TemaConstelacoes seed={seed} cores={cores} />;
      break;
    case 'zodiaco':
      conteudo = <TemaZodiaco seed={seed} cores={cores} />;
      break;
    case 'aurora':
      conteudo = <TemaAurora seed={seed} cores={cores} />;
      break;
    case 'lua':
      conteudo = <TemaLua seed={seed} cores={cores} />;
      break;
    default:
      conteudo = <TemaCosmos seed={seed} cores={cores} />;
  }

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${kenBurns})`,
        transformOrigin: 'center center',
        opacity: 0.55 * fadeIn * fadeOut,
      }}
    >
      {conteudo}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(5,5,15,0.55) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
}
