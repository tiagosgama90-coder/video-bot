import React from 'react';
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from 'remotion';

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function StarsFall(): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const stars = Array.from({ length: 70 }, (_, i) => {
    const x = random(`star-x-${i}`) * width;
    const y0 = (random(`star-y-${i}`) * (height + 400)) - 200;
    const size = 1 + random(`star-s-${i}`) * 3.4;
    const speed = 2.2 + random(`star-v-${i}`) * 6.5;
    const alpha = 0.25 + random(`star-a-${i}`) * 0.55;
    const twinkle = 0.5 + 0.5 * Math.sin((frame / 8) + random(`star-t-${i}`) * 20);
    const y = ((y0 + frame * speed) % (height + 500)) - 250;

    const fadeIn = clamp(frame / 25, 0, 1);
    const fadeOut = clamp((durationInFrames - frame) / 30, 0, 1);
    const opacity = alpha * twinkle * fadeIn * fadeOut;

    return { x, y, size, opacity };
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 6 }}>
      {stars.map((s, idx) => (
        <div
          key={`star-${idx}`}
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            borderRadius: 999,
            opacity: s.opacity,
            background:
              'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.0) 70%)',
            boxShadow: '0 0 10px rgba(255,255,255,0.55)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </AbsoluteFill>
  );
}

function StaticAndGlitch(): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const glitchPhase = frame % 90;
  const glitchOn = glitchPhase < 4 || (frame % 240 >= 120 && frame % 240 < 124);
  const jitterX = glitchOn ? (random(`jitterx-${Math.floor(frame / 2)}`) - 0.5) * 18 : 0;
  const jitterY = glitchOn ? (random(`jittery-${Math.floor(frame / 2)}`) - 0.5) * 10 : 0;

  const noiseOpacity = glitchOn ? 0.16 : 0.08;
  const scanlineOpacity = glitchOn ? 0.10 : 0.06;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        zIndex: 30,
        transform: `translate(${jitterX}px, ${jitterY}px)`,
      }}
    >
      {/* noise */}
      <AbsoluteFill
        style={{
          opacity: noiseOpacity,
          mixBlendMode: 'overlay',
          backgroundImage: [
            `repeating-linear-gradient(0deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)`,
            `repeating-linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 6px)`,
          ].join(','),
        }}
      />

      {/* scanlines */}
      <AbsoluteFill
        style={{
          opacity: scanlineOpacity,
          mixBlendMode: 'soft-light',
          backgroundImage:
            'repeating-linear-gradient(180deg, rgba(0,0,0,0.0) 0px, rgba(0,0,0,0.0) 2px, rgba(0,0,0,0.25) 3px)',
        }}
      />

      {/* glitch slices */}
      {glitchOn &&
        Array.from({ length: 6 }, (_, i) => {
          const top = Math.floor(random(`g-top-${frame}-${i}`) * (height - 60));
          const h = 14 + Math.floor(random(`g-h-${frame}-${i}`) * 40);
          const dx = (random(`g-dx-${frame}-${i}`) - 0.5) * 60;
          const hue = (random(`g-hue-${frame}-${i}`) - 0.5) * 24;

          return (
            <div
              key={`glitch-${frame}-${i}`}
              style={{
                position: 'absolute',
                left: 0,
                top,
                width,
                height: h,
                transform: `translateX(${dx}px)`,
                filter: `hue-rotate(${hue}deg) saturate(1.05)`,
                background: 'rgba(255,255,255,0.04)',
                mixBlendMode: 'screen',
              }}
            />
          );
        })}
    </AbsoluteFill>
  );
}

/** Estrelas a cair + glitch/static suave (estilo universo) */
export function EfeitosUniverso(): React.ReactElement {
  return (
    <>
      <StarsFall />
      <StaticAndGlitch />
    </>
  );
}

