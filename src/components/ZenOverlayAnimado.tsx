import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { PALETA_SIDUS } from '../lib/paleta-visual';

/** Partículas e luz pulsante sobre imagem estática — sensação de movimento tipo Pinterest/reiki */
export function ZenOverlayAnimado({ seed = 0 }: { seed?: number }): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const respiracao = 0.5 + 0.5 * Math.sin(frame * 0.04);
  const rotacao = frame * 0.08;

  const particulas = Array.from({ length: 45 }, (_, i) => {
    const x0 = random(`zo-x-${seed}-${i}`) * width;
    const y0 = random(`zo-y-${seed}-${i}`) * height;
    const size = 2 + random(`zo-s-${seed}-${i}`) * 5;
    const velY = 0.15 + random(`zo-v-${seed}-${i}`) * 0.6;
    const y = (y0 - frame * velY) % (height + 40);
    const x = x0 + Math.sin(frame * 0.025 + i * 0.7) * 18;
    const opacidade = 0.1 + random(`zo-o-${seed}-${i}`) * 0.35;

    return { x: ((x % width) + width) % width, y, size, opacidade };
  });

  const orbes = Array.from({ length: 4 }, (_, i) => ({
    x: width * (0.2 + random(`zo-ox-${seed}-${i}`) * 0.6),
    y: height * (0.15 + random(`zo-oy-${seed}-${i}`) * 0.55),
    raio: 80 + random(`zo-or-${seed}-${i}`) * 120,
    fase: random(`zo-of-${seed}-${i}`) * Math.PI * 2,
  }));

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {orbes.map((o, i) => {
        const pulso = 0.7 + 0.3 * Math.sin(frame * 0.05 + o.fase);
        return (
          <div
            key={`orbe-${i}`}
            style={{
              position: 'absolute',
              left: o.x - o.raio,
              top: o.y - o.raio,
              width: o.raio * 2,
              height: o.raio * 2,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${PALETA_SIDUS.destaque}${Math.round(pulso * 40).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
              filter: 'blur(25px)',
              transform: `scale(${0.9 + respiracao * 0.15})`,
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          opacity: 0.12 + respiracao * 0.06,
          transform: `rotate(${rotacao}deg)`,
          transformOrigin: 'center center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '38%',
            width: Math.min(width, height) * 0.75,
            height: Math.min(width, height) * 0.75,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: `1px solid ${PALETA_SIDUS.destaque}33`,
            boxShadow: `0 0 60px ${PALETA_SIDUS.marca}44, inset 0 0 40px ${PALETA_SIDUS.destaque}11`,
          }}
        />
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={`anel-${i}`}
            style={{
              position: 'absolute',
              left: '50%',
              top: '38%',
              width: `${55 + i * 8}%`,
              height: `${55 + i * 8}%`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: `1px solid ${PALETA_SIDUS.destaque}${Math.round(8 + i * 3).toString(16).padStart(2, '0')}`,
            }}
          />
        ))}
      </AbsoluteFill>

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
            background: PALETA_SIDUS.destaque,
            opacity: p.opacidade * interpolate(respiracao, [0, 1], [0.8, 1.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            boxShadow: `0 0 ${p.size * 3}px ${PALETA_SIDUS.destaqueSombra}`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
}
