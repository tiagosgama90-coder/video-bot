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
const SIMBOLOS_TAROT = ['☽', '☉', '✦', '⚹', '♇', '☿', '♃', '♄', '♅', '♆', '✧', '☘'];

const PALETAS: Record<TemaFundoMistico, [string, string, string]> = {
  velas: ['#0a0608', '#1a0f14', '#e8a84a'],
  mesa_tarot: ['#08060a', '#1c1218', '#c9a86c'],
  mapa_astral: ['#060810', '#141828', '#d4af6a'],
  horoscopo: ['#0a0812', '#2a1840', '#f3cc63'],
  gotico: ['#050408', '#120c18', '#8b6fa8'],
  celta: ['#060a08', '#0f1a12', '#7cb87c'],
  zen_escuro: ['#080a0a', '#141a18', '#a8b8a0'],
  oraculo: ['#0a0810', '#1a1030', '#b088e8'],
  nebula: ['#0a0614', '#2a1045', '#9b59b6'],
  lua: ['#080610', '#181428', '#d4c4a8'],
  reiki_energia: ['#08060e', '#2a1848', '#f3cc63'],
  mandala_sagrada: ['#0a0812', '#241840', '#e8c878'],
  energia_cosmica: ['#060810', '#1a2848', '#c9a0ff'],
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function FundoEscuro({ cor }: { cor: string }): React.ReactElement {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 30%, ${cor}22 0%, #030206 55%, #000000 100%)`,
      }}
    />
  );
}

function ParticulasFlutuantes({
  seed,
  quantidade,
  cor,
}: {
  seed: number;
  quantidade: number;
  cor: string;
}): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const particulas = Array.from({ length: quantidade }, (_, i) => {
    const x0 = random(`pf-x-${seed}-${i}`) * width;
    const y0 = random(`pf-y-${seed}-${i}`) * height;
    const size = 1.5 + random(`pf-s-${seed}-${i}`) * 4;
    const velY = 0.2 + random(`pf-v-${seed}-${i}`) * 0.8;
    const velX = (random(`pf-vx-${seed}-${i}`) - 0.5) * 0.4;
    const y = (y0 - frame * velY) % (height + 30);
    const x = x0 + Math.sin(frame * 0.03 + i) * 12 + frame * velX;
    const opacidade = 0.15 + random(`pf-o-${seed}-${i}`) * 0.45;

    return { x: ((x % width) + width) % width, y, size, opacidade };
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {particulas.map((p, i) => (
        <div
          key={`p-${i}`}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: cor,
            opacity: p.opacidade,
            boxShadow: `0 0 ${p.size * 4}px ${cor}88`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
}

function Vela({
  x,
  y,
  altura,
  seed,
  corChama,
}: {
  x: number;
  y: number;
  altura: number;
  seed: number;
  corChama: string;
}): React.ReactElement {
  const frame = useCurrentFrame();
  const flicker = 0.85 + 0.15 * Math.sin(frame * 0.45 + seed);
  const sway = Math.sin(frame * 0.08 + seed * 2) * 3;
  const chamaAltura = altura * 0.35 * flicker;
  const brilho = 0.4 + 0.3 * flicker;

  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translateX(${sway}px)` }}>
      {/* brilho ambiente */}
      <div
        style={{
          position: 'absolute',
          left: -altura * 0.6,
          top: -altura * 0.8,
          width: altura * 2.2,
          height: altura * 2.5,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${corChama}${Math.round(brilho * 60).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
      />
      {/* cera */}
      <div
        style={{
          width: altura * 0.18,
          height: altura,
          background: 'linear-gradient(180deg, #f0e6d0 0%, #c9b896 40%, #8a7a60 100%)',
          borderRadius: '4px 4px 8px 8px',
          boxShadow: 'inset -2px 0 6px rgba(0,0,0,0.3)',
        }}
      />
      {/* chama */}
      <div
        style={{
          position: 'absolute',
          left: altura * 0.18 / 2 - chamaAltura * 0.22,
          top: -chamaAltura * 0.85,
          width: chamaAltura * 0.44,
          height: chamaAltura,
          background: `radial-gradient(ellipse at 50% 80%, #fff8e0 0%, ${corChama} 35%, #c44a10 70%, transparent 100%)`,
          borderRadius: '50% 50% 20% 20%',
          filter: 'blur(1px)',
          opacity: flicker,
        }}
      />
    </div>
  );
}

function TemaVelas({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const { width, height } = useVideoConfig();
  const velas = Array.from({ length: 5 }, (_, i) => ({
    x: width * (0.12 + random(`vl-x-${seed}-${i}`) * 0.76),
    y: height * (0.45 + random(`vl-y-${seed}-${i}`) * 0.35),
    altura: 120 + random(`vl-h-${seed}-${i}`) * 100,
    seed: seed + i * 7,
  }));

  return (
    <AbsoluteFill style={{ background: cores[0] }}>
      <FundoEscuro cor={cores[1]} />
      {velas.map((v, i) => (
        <Vela key={`vela-${i}`} x={v.x} y={v.y} altura={v.altura} seed={v.seed} corChama={cores[2]} />
      ))}
      <ParticulasFlutuantes seed={seed} quantidade={40} cor={cores[2]} />
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 30%, rgba(0,0,0,0.7) 100%)',
        }}
      />
    </AbsoluteFill>
  );
}

function CartaTarot({
  x,
  y,
  rotacao,
  simbolo,
  revelada,
  seed,
}: {
  x: number;
  y: number;
  rotacao: number;
  simbolo: string;
  revelada: boolean;
  seed: number;
}): React.ReactElement {
  const frame = useCurrentFrame();
  const float = Math.sin(frame * 0.04 + seed) * 4;
  const brilho = 0.5 + 0.2 * Math.sin(frame * 0.07 + seed);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + float,
        width: 90,
        height: 140,
        transform: `rotate(${rotacao}deg)`,
        transformOrigin: 'center center',
        borderRadius: 8,
        background: revelada
          ? 'linear-gradient(145deg, #1a1020 0%, #2a1830 50%, #1a1020 100%)'
          : 'linear-gradient(145deg, #0e0814 0%, #1a0e24 50%, #0e0814 100%)',
        border: `2px solid ${revelada ? '#c9a86c' : '#3a2848'}`,
        boxShadow: `0 8px 24px rgba(0,0,0,0.6), 0 0 ${20 * brilho}px rgba(201,168,108,${0.15 * brilho})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {revelada ? (
        <span style={{ fontSize: 42, color: '#c9a86c', textShadow: '0 0 12px rgba(201,168,108,0.5)' }}>
          {simbolo}
        </span>
      ) : (
        <div
          style={{
            width: 60,
            height: 90,
            border: '1px solid #4a3060',
            borderRadius: 4,
            background:
              'repeating-linear-gradient(45deg, #1a0e24 0px, #1a0e24 4px, #221430 4px, #221430 8px)',
          }}
        />
      )}
    </div>
  );
}

function TemaMesaTarot({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drift = Math.sin(frame * 0.015) * 8;

  const cartas = Array.from({ length: 7 }, (_, i) => ({
    x: width * 0.08 + i * (width * 0.12),
    y: height * 0.52 + Math.sin(i * 1.2) * 20,
    rotacao: -18 + i * 6 + Math.sin(frame * 0.02 + i) * 2,
    simbolo: SIMBOLOS_TAROT[i % SIMBOLOS_TAROT.length],
    revelada: i % 3 !== 1,
    seed: seed + i,
  }));

  return (
    <AbsoluteFill style={{ background: cores[0] }}>
      {/* mesa de madeira escura */}
      <div
        style={{
          position: 'absolute',
          left: -40,
          top: height * 0.38,
          width: width + 80,
          height: height * 0.65,
          background: `linear-gradient(180deg, ${cores[1]} 0%, #0a0608 100%)`,
          transform: `perspective(800px) rotateX(12deg) translateY(${drift}px)`,
          transformOrigin: 'center top',
          borderTop: '2px solid #2a1a20',
        }}
      />
      {/* textura madeira */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: height * 0.42,
          width,
          height: height * 0.58,
          opacity: 0.15,
          background:
            'repeating-linear-gradient(90deg, transparent 0px, transparent 40px, rgba(201,168,108,0.08) 40px, rgba(201,168,108,0.08) 42px)',
          transform: `translateY(${drift}px)`,
        }}
      />
      {cartas.map((c, i) => (
        <CartaTarot key={`carta-${i}`} {...c} />
      ))}
      <Vela x={width * 0.08} y={height * 0.32} altura={80} seed={seed} corChama={cores[2]} />
      <Vela x={width * 0.82} y={height * 0.35} altura={70} seed={seed + 3} corChama={cores[2]} />
      <ParticulasFlutuantes seed={seed + 10} quantidade={25} cor={cores[2]} />
      <AbsoluteFill
        style={{ background: 'radial-gradient(ellipse at 50% 60%, transparent 20%, rgba(0,0,0,0.65) 100%)' }}
      />
    </AbsoluteFill>
  );
}

function TemaMapaAstral({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height * 0.42;
  const raio = Math.min(width, height) * 0.36;
  const rotacao = frame * 0.06;

  const planetas = Array.from({ length: 8 }, (_, i) => {
    const angulo = (i / 8) * Math.PI * 2 + frame * 0.02 * (1 + (i % 3) * 0.3);
    const r = raio * (0.35 + random(`pl-r-${seed}-${i}`) * 0.55);
    return {
      x: cx + Math.cos(angulo) * r,
      y: cy + Math.sin(angulo) * r,
      size: 6 + random(`pl-s-${seed}-${i}`) * 8,
    };
  });

  return (
    <AbsoluteFill style={{ background: cores[0] }}>
      <FundoEscuro cor={cores[1]} />
      <AbsoluteFill style={{ transform: `rotate(${rotacao}deg)`, transformOrigin: 'center center' }}>
        {/* círculos do mapa */}
        {[1, 0.75, 0.5, 0.25].map((fator, i) => (
          <div
            key={`circ-${i}`}
            style={{
              position: 'absolute',
              left: cx - raio * fator,
              top: cy - raio * fator,
              width: raio * fator * 2,
              height: raio * fator * 2,
              borderRadius: '50%',
              border: `1px solid ${cores[2]}${i === 0 ? '88' : '44'}`,
            }}
          />
        ))}
        {/* casas (12 divisões) */}
        <svg
          width={width}
          height={height}
          style={{ position: 'absolute', inset: 0 }}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const ang = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const x2 = cx + Math.cos(ang) * raio;
            const y2 = cy + Math.sin(ang) * raio;
            return (
              <line
                key={`casa-${i}`}
                x1={cx}
                y1={cy}
                x2={x2}
                y2={y2}
                stroke={cores[2]}
                strokeWidth={1}
                opacity={0.35}
              />
            );
          })}
        </svg>
        {planetas.map((p, i) => (
          <div
            key={`planeta-${i}`}
            style={{
              position: 'absolute',
              left: p.x - p.size / 2,
              top: p.y - p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${cores[2]} 0%, ${cores[1]} 100%)`,
              boxShadow: `0 0 ${p.size * 2}px ${cores[2]}66`,
            }}
          />
        ))}
      </AbsoluteFill>
      <ParticulasFlutuantes seed={seed} quantidade={50} cor={cores[2]} />
    </AbsoluteFill>
  );
}

function TemaHoroscopo({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const rotacao = frame * 0.1;
  const cx = width / 2;
  const cy = height * 0.4;
  const raio = Math.min(width, height) * 0.32;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 35%, ${cores[1]} 0%, ${cores[0]} 70%)` }}>
      <AbsoluteFill style={{ transform: `rotate(${rotacao}deg)`, transformOrigin: 'center center' }}>
        {SIMBOLOS_ZODIACO.map((simbolo, i) => {
          const angulo = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angulo) * raio;
          const y = cy + Math.sin(angulo) * raio;
          const pulso = 0.88 + 0.12 * Math.sin(frame * 0.1 + i);

          return (
            <div
              key={`zod-${i}`}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: `translate(-50%, -50%) scale(${pulso})`,
                fontSize: 52,
                color: cores[2],
                textShadow: `0 0 20px ${cores[2]}aa`,
                opacity: 0.9,
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
          boxShadow: `inset 0 0 80px ${cores[1]}aa, 0 0 40px ${cores[2]}22`,
        }}
      />
      <ParticulasFlutuantes seed={seed} quantidade={60} cor={cores[2]} />
    </AbsoluteFill>
  );
}

function TemaGotico({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const sweep = (frame * 0.3) % 360;

  const arcos = Array.from({ length: 3 }, (_, i) => ({
    left: width * (0.1 + i * 0.32),
    width: width * 0.28,
    altura: height * (0.55 + i * 0.05),
  }));

  return (
    <AbsoluteFill style={{ background: cores[0] }}>
      <FundoEscuro cor={cores[1]} />
      {arcos.map((a, i) => (
        <div
          key={`arco-${i}`}
          style={{
            position: 'absolute',
            left: a.left,
            bottom: 0,
            width: a.width,
            height: a.altura,
            borderRadius: `${a.width / 2}px ${a.width / 2}px 0 0`,
            border: `3px solid ${cores[2]}44`,
            borderBottom: 'none',
            background: `linear-gradient(180deg, ${cores[2]}11 0%, transparent 60%)`,
            boxShadow: `inset 0 0 60px ${cores[2]}22`,
          }}
        />
      ))}
      {/* raios de luz vitral */}
      <div
        style={{
          position: 'absolute',
          left: width * 0.35,
          top: -height * 0.1,
          width: width * 0.3,
          height: height * 0.9,
          background: `conic-gradient(from ${sweep}deg at 50% 0%, transparent 0deg, ${cores[2]}33 20deg, transparent 40deg, ${cores[2]}22 60deg, transparent 80deg)`,
          filter: 'blur(30px)',
          opacity: 0.6,
        }}
      />
      <ParticulasFlutuantes seed={seed} quantidade={35} cor={cores[2]} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)' }} />
    </AbsoluteFill>
  );
}

function NoCelta({ cx, cy, tamanho, rotacao, cor }: {
  cx: number; cy: number; tamanho: number; rotacao: number; cor: string;
}): React.ReactElement {
  const r = tamanho / 2;
  const path = `
    M ${cx} ${cy - r}
    C ${cx + r * 0.6} ${cy - r * 0.3}, ${cx + r * 0.6} ${cy + r * 0.3}, ${cx} ${cy + r * 0.5}
    C ${cx - r * 0.6} ${cy + r * 0.3}, ${cx - r * 0.6} ${cy - r * 0.3}, ${cx} ${cy - r}
    M ${cx - r * 0.3} ${cy - r * 0.15}
    C ${cx - r * 0.1} ${cy + r * 0.2}, ${cx + r * 0.1} ${cy + r * 0.2}, ${cx + r * 0.3} ${cy - r * 0.15}
  `;

  return (
    <svg
      width={tamanho * 2}
      height={tamanho * 2}
      style={{
        position: 'absolute',
        left: cx - tamanho,
        top: cy - tamanho,
        transform: `rotate(${rotacao}deg)`,
        opacity: 0.5,
      }}
    >
      <path d={path} fill="none" stroke={cor} strokeWidth={2.5} />
    </svg>
  );
}

function TemaCelta({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const rotacao = frame * 0.04;

  const nos = Array.from({ length: 4 }, (_, i) => ({
    cx: width * (0.25 + (i % 2) * 0.5),
    cy: height * (0.3 + Math.floor(i / 2) * 0.35),
    tamanho: 80 + random(`cn-t-${seed}-${i}`) * 40,
    rotacao: rotacao * (i % 2 === 0 ? 1 : -1) + i * 45,
  }));

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${cores[0]} 0%, ${cores[1]} 100%)` }}>
      <FundoEscuro cor={cores[2]} />
      {nos.map((n, i) => (
        <NoCelta key={`no-${i}`} {...n} cor={cores[2]} />
      ))}
      {/* runas flutuantes */}
      {['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ'].map((runa, i) => {
        const x = width * (0.15 + random(`rn-x-${seed}-${i}`) * 0.7);
        const y = (height * random(`rn-y-${seed}-${i}`) + frame * 0.3) % height;
        const opacidade = 0.2 + 0.15 * Math.sin(frame * 0.05 + i);
        return (
          <div
            key={`runa-${i}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              fontSize: 36,
              color: cores[2],
              opacity: opacidade,
              textShadow: `0 0 10px ${cores[2]}66`,
            }}
          >
            {runa}
          </div>
        );
      })}
      <ParticulasFlutuantes seed={seed} quantidade={45} cor={cores[2]} />
    </AbsoluteFill>
  );
}

function TemaZenEscuro({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const pedras = Array.from({ length: 5 }, (_, i) => ({
    x: width * (0.2 + random(`zd-x-${seed}-${i}`) * 0.6),
    y: height * (0.55 + random(`zd-y-${seed}-${i}`) * 0.25),
    w: 60 + random(`zd-w-${seed}-${i}`) * 80,
    h: 30 + random(`zd-h-${seed}-${i}`) * 40,
  }));

  const ondas = Array.from({ length: 8 }, (_, i) => {
    const y = height * 0.7 + i * 18;
    const offset = Math.sin(frame * 0.03 + i * 0.8) * 30;
    return { y, offset };
  });

  return (
    <AbsoluteFill style={{ background: cores[0] }}>
      <FundoEscuro cor={cores[1]} />
      {/* ondas de areia zen */}
      {ondas.map((o, i) => (
        <div
          key={`onda-${i}`}
          style={{
            position: 'absolute',
            left: -50 + o.offset,
            top: o.y,
            width: width + 100,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${cores[2]}44, transparent)`,
            borderRadius: 2,
          }}
        />
      ))}
      {pedras.map((p, i) => (
        <div
          key={`pedra-${i}`}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.w,
            height: p.h,
            borderRadius: `${p.w * 0.4}px ${p.w * 0.4}px ${p.w * 0.2}px ${p.w * 0.2}px`,
            background: `linear-gradient(145deg, #2a3028 0%, #1a1e1a 50%, #0e100e 100%)`,
            boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
          }}
        />
      ))}
      {/* fumo de incenso */}
      {Array.from({ length: 3 }, (_, i) => {
        const baseX = width * (0.35 + i * 0.15);
        const fumoY = height * 0.35 - (frame * (0.8 + i * 0.2)) % (height * 0.5);
        const sway = Math.sin(frame * 0.04 + i * 2) * 25;
        return (
          <div
            key={`fumo-${i}`}
            style={{
              position: 'absolute',
              left: baseX + sway,
              top: fumoY,
              width: 40 + i * 10,
              height: 80,
              borderRadius: '50%',
              background: `radial-gradient(ellipse, ${cores[2]}33 0%, transparent 70%)`,
              filter: 'blur(12px)',
              opacity: 0.4,
            }}
          />
        );
      })}
      <ParticulasFlutuantes seed={seed} quantidade={20} cor={cores[2]} />
    </AbsoluteFill>
  );
}

function TemaOraculo({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height * 0.4;
  const raio = Math.min(width, height) * 0.2;
  const pulso = 0.9 + 0.1 * Math.sin(frame * 0.08);
  const brilho = 0.5 + 0.3 * Math.sin(frame * 0.05);

  return (
    <AbsoluteFill style={{ background: cores[0] }}>
      <FundoEscuro cor={cores[1]} />
      {/* bola de cristal */}
      <div
        style={{
          position: 'absolute',
          left: cx - raio,
          top: cy - raio,
          width: raio * 2,
          height: raio * 2,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25) 0%, ${cores[2]}55 30%, ${cores[1]} 70%, #0a0610 100%)`,
          transform: `scale(${pulso})`,
          boxShadow: `0 0 ${60 * brilho}px ${cores[2]}88, inset 0 -20px 40px rgba(0,0,0,0.4)`,
        }}
      />
      {/* névoa dentro da bola */}
      <div
        style={{
          position: 'absolute',
          left: cx - raio * 0.6,
          top: cy - raio * 0.4 + Math.sin(frame * 0.06) * 10,
          width: raio * 1.2,
          height: raio * 0.8,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${cores[2]}66 0%, transparent 70%)`,
          filter: 'blur(15px)',
          opacity: 0.7,
        }}
      />
      <Vela x={width * 0.15} y={height * 0.6} altura={90} seed={seed} corChama={cores[2]} />
      <Vela x={width * 0.78} y={height * 0.62} altura={85} seed={seed + 5} corChama={cores[2]} />
      <ParticulasFlutuantes seed={seed} quantidade={55} cor={cores[2]} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 25%, rgba(0,0,0,0.6) 100%)' }} />
    </AbsoluteFill>
  );
}

function TemaNebula({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const blobs = Array.from({ length: 5 }, (_, i) => {
    const angulo = t * (0.1 + i * 0.03) + random(`nb-a-${seed}-${i}`) * Math.PI * 2;
    const raio = 15 + random(`nb-r-${seed}-${i}`) * 25;
    return {
      x: 50 + Math.cos(angulo) * raio,
      y: 50 + Math.sin(angulo) * raio,
      escala: 0.85 + 0.15 * Math.sin(t * 0.3 + i),
      opacidade: 0.3 + random(`nb-o-${seed}-${i}`) * 0.2,
      cor: i % 2 === 0 ? cores[1] : cores[2],
    };
  });

  return (
    <AbsoluteFill style={{ background: cores[0] }}>
      {blobs.map((b, i) => (
        <div
          key={`blob-${i}`}
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: 500,
            height: 500,
            transform: `translate(-50%, -50%) scale(${b.escala})`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.cor}77 0%, transparent 68%)`,
            opacity: b.opacidade,
            filter: 'blur(45px)',
          }}
        />
      ))}
      <ParticulasFlutuantes seed={seed} quantidade={80} cor={cores[2]} />
    </AbsoluteFill>
  );
}

function TemaReikiEnergia({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height * 0.38;
  const pulso = 0.85 + 0.15 * Math.sin(frame * 0.06);

  const raios = Array.from({ length: 12 }, (_, i) => {
    const angulo = (i / 12) * Math.PI * 2 + frame * 0.015;
    const comprimento = height * 0.35 * (0.7 + 0.3 * Math.sin(frame * 0.04 + i));
    return { angulo, comprimento };
  });

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 38%, ${cores[1]} 0%, ${cores[0]} 72%)` }}>
      {raios.map((r, i) => (
        <div
          key={`raio-${i}`}
          style={{
            position: 'absolute',
            left: cx,
            top: cy,
            width: 3,
            height: r.comprimento,
            transformOrigin: 'top center',
            transform: `rotate(${r.angulo}rad) translateY(-${r.comprimento * 0.5}px)`,
            background: `linear-gradient(180deg, transparent, ${cores[2]}88, transparent)`,
            opacity: 0.25 + 0.15 * Math.sin(frame * 0.05 + i),
            filter: 'blur(2px)',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: cx - 120 * pulso,
          top: cy - 120 * pulso,
          width: 240 * pulso,
          height: 240 * pulso,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${cores[2]}66 0%, ${cores[1]}33 45%, transparent 70%)`,
          boxShadow: `0 0 80px ${cores[2]}55`,
        }}
      />
      <ParticulasFlutuantes seed={seed} quantidade={70} cor={cores[2]} />
    </AbsoluteFill>
  );
}

function TemaMandalaSagrada({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const rotacao = frame * 0.12;
  const cx = width / 2;
  const cy = height * 0.4;
  const tamanho = Math.min(width, height) * 0.55;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 35%, ${cores[1]} 0%, ${cores[0]} 75%)` }}>
      <AbsoluteFill style={{ transform: `rotate(${rotacao}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={`petala-${i}`}
            style={{
              position: 'absolute',
              left: cx - tamanho * 0.08,
              top: cy - tamanho * 0.5,
              width: tamanho * 0.16,
              height: tamanho,
              transformOrigin: 'center bottom',
              transform: `rotate(${(i / 8) * 360}deg)`,
              borderRadius: '50% 50% 20% 20%',
              border: `2px solid ${cores[2]}44`,
              background: `linear-gradient(180deg, ${cores[2]}22 0%, transparent 80%)`,
            }}
          />
        ))}
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={`circ-${i}`}
            style={{
              position: 'absolute',
              left: cx - (tamanho * 0.35 - i * 40),
              top: cy - (tamanho * 0.35 - i * 40),
              width: (tamanho * 0.7 - i * 80),
              height: (tamanho * 0.7 - i * 80),
              borderRadius: '50%',
              border: `1px solid ${cores[2]}${Math.round(30 + i * 15).toString(16).padStart(2, '0')}`,
              boxShadow: `inset 0 0 30px ${cores[1]}44`,
            }}
          />
        ))}
      </AbsoluteFill>
      <ParticulasFlutuantes seed={seed} quantidade={50} cor={cores[2]} />
    </AbsoluteFill>
  );
}

function TemaEnergiaCosmica({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;
  const ondas = Array.from({ length: 6 }, (_, i) => ({
    y: height * (0.25 + i * 0.1),
    offset: Math.sin(t * 0.4 + i) * 40,
    opacidade: 0.15 + 0.1 * Math.sin(t * 0.3 + i * 0.5),
  }));

  return (
    <AbsoluteFill style={{ background: cores[0] }}>
      <FundoEscuro cor={cores[1]} />
      {ondas.map((o, i) => (
        <div
          key={`onda-${i}`}
          style={{
            position: 'absolute',
            left: -60 + o.offset,
            top: o.y,
            width: width + 120,
            height: 3,
            borderRadius: 4,
            background: `linear-gradient(90deg, transparent, ${cores[2]}aa, ${cores[1]}88, transparent)`,
            opacity: o.opacidade,
            filter: 'blur(3px)',
          }}
        />
      ))}
      {Array.from({ length: 5 }, (_, i) => {
        const angulo = t * (0.15 + i * 0.04) + random(`ec-a-${seed}-${i}`) * Math.PI;
        const x = width * (0.5 + Math.cos(angulo) * 0.3);
        const y = height * (0.4 + Math.sin(angulo) * 0.25);
        const escala = 0.8 + 0.2 * Math.sin(t + i);
        return (
          <div
            key={`orb-${i}`}
            style={{
              position: 'absolute',
              left: x - 60,
              top: y - 60,
              width: 120,
              height: 120,
              transform: `scale(${escala})`,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${cores[2]}77 0%, transparent 70%)`,
              filter: 'blur(20px)',
            }}
          />
        );
      })}
      <ParticulasFlutuantes seed={seed} quantidade={65} cor={cores[2]} />
    </AbsoluteFill>
  );
}

function TemaLua({ seed, cores }: { seed: number; cores: [string, string, string] }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fase = (Math.sin(frame * 0.02) + 1) / 2;
  const brilho = 0.5 + 0.25 * Math.sin(frame * 0.05);
  const cx = width * 0.5;
  const cy = height * 0.35;
  const raio = Math.min(width, height) * 0.2;
  const sombraX = interpolate(fase, [0, 1], [raio * 0.85, -raio * 0.25]);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 15%, ${cores[1]} 0%, ${cores[0]} 75%)` }}>
      <ParticulasFlutuantes seed={seed} quantidade={90} cor="#ffffff" />
      <div
        style={{
          position: 'absolute',
          left: cx - raio,
          top: cy - raio,
          width: raio * 2,
          height: raio * 2,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #f5f0e6 0%, #c9b896 55%, #6a5a48 100%)',
          boxShadow: `0 0 ${70 * brilho}px rgba(245,240,230,${0.3 * brilho})`,
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
          opacity: clamp(0.3 + fase * 0.5, 0, 0.8),
          filter: 'blur(2px)',
        }}
      />
      {/* fases da lua decorativas */}
      {['☽', '☾'].map((simbolo, i) => (
        <div
          key={`fase-${i}`}
          style={{
            position: 'absolute',
            left: width * (0.15 + i * 0.7),
            top: height * 0.7,
            fontSize: 40,
            color: cores[2],
            opacity: 0.35 + 0.15 * Math.sin(frame * 0.04 + i),
          }}
        >
          {simbolo}
        </div>
      ))}
    </AbsoluteFill>
  );
}

export interface FundoVideoMisticoProps {
  tema: TemaFundoMistico;
  seed: number;
}

/** Fundo animado dark — velas, tarot, astrologia, celta, gótico, zen, oráculo */
export function FundoVideoMistico({ tema, seed }: FundoVideoMisticoProps): React.ReactElement {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cores = PALETAS[tema];
  const kenBurns = 1 + (frame / durationInFrames) * 0.04;
  const fadeIn = clamp(frame / 20, 0, 1);
  const fadeOut = clamp((durationInFrames - frame) / 25, 0, 1);

  let conteudo: React.ReactElement;
  switch (tema) {
    case 'velas':
      conteudo = <TemaVelas seed={seed} cores={cores} />;
      break;
    case 'mesa_tarot':
      conteudo = <TemaMesaTarot seed={seed} cores={cores} />;
      break;
    case 'mapa_astral':
      conteudo = <TemaMapaAstral seed={seed} cores={cores} />;
      break;
    case 'horoscopo':
      conteudo = <TemaHoroscopo seed={seed} cores={cores} />;
      break;
    case 'gotico':
      conteudo = <TemaGotico seed={seed} cores={cores} />;
      break;
    case 'celta':
      conteudo = <TemaCelta seed={seed} cores={cores} />;
      break;
    case 'zen_escuro':
      conteudo = <TemaZenEscuro seed={seed} cores={cores} />;
      break;
    case 'oraculo':
      conteudo = <TemaOraculo seed={seed} cores={cores} />;
      break;
    case 'reiki_energia':
      conteudo = <TemaReikiEnergia seed={seed} cores={cores} />;
      break;
    case 'mandala_sagrada':
      conteudo = <TemaMandalaSagrada seed={seed} cores={cores} />;
      break;
    case 'energia_cosmica':
      conteudo = <TemaEnergiaCosmica seed={seed} cores={cores} />;
      break;
    case 'nebula':
      conteudo = <TemaNebula seed={seed} cores={cores} />;
      break;
    case 'lua':
      conteudo = <TemaLua seed={seed} cores={cores} />;
      break;
    default:
      conteudo = <TemaNebula seed={seed} cores={cores} />;
  }

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${kenBurns})`,
        transformOrigin: 'center center',
        opacity: 0.62 * fadeIn * fadeOut,
      }}
    >
      {conteudo}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
}
