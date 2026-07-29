import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  brilhoSignoZodiaco,
  corComAlpha,
  corSignoZodiaco,
  normalizarIndiceSigno,
  paletaVarianteGeometria,
  SIMBOLOS_ZODIACO_UNICODE,
} from '../lib/geometria-zodiaco';
import { PALETA_SIDUS } from '../lib/paleta-visual';

/** Opacidade subtil — cores vivas por baixo para não dominar o vídeo */
export const OPACIDADE_GEOMETRIA_CENTRO = 0.38;

export interface GeometriaCosmicaCentroProps {
  seed: number;
  /** 0–11 — signo do vídeo (símbolo central destacado) */
  signoIndice?: number;
  /** Variante visual — se omitido, usa seed % variantes */
  varianteIndice?: number;
}

interface VarianteCtx {
  cx: number;
  cy: number;
  tamanho: number;
  signoIndice: number;
  frame: number;
  paleta: readonly [string, string, string];
}

function Anel({
  cx,
  cy,
  diametro,
  grossura = 1.5,
  cor,
}: {
  cx: number;
  cy: number;
  diametro: number;
  grossura?: number;
  cor: string;
}): React.ReactElement {
  const r = diametro / 2;
  const brilho = corComAlpha(cor, 0.55);
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - r,
        top: cy - r,
        width: diametro,
        height: diametro,
        borderRadius: '50%',
        border: `${grossura}px solid ${cor}`,
        boxShadow: `0 0 20px ${brilho}, 0 0 6px ${corComAlpha(cor, 0.35)}`,
      }}
    />
  );
}

function SimboloZodiaco({
  x,
  y,
  indice,
  tamanho,
  destaque = false,
}: {
  x: number;
  y: number;
  indice: number;
  tamanho: number;
  destaque?: boolean;
}): React.ReactElement {
  const simbolo = SIMBOLOS_ZODIACO_UNICODE[normalizarIndiceSigno(indice)];
  const cor = corSignoZodiaco(indice);
  const brilho = brilhoSignoZodiaco(indice);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        fontSize: tamanho,
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontWeight: destaque ? 700 : 400,
        color: cor,
        textShadow: destaque
          ? `0 0 28px ${brilho}, 0 0 12px ${cor}, 0 0 4px ${PALETA_SIDUS.destaqueForte}`
          : `0 0 16px ${brilho}, 0 0 6px ${corComAlpha(cor, 0.7)}`,
        WebkitTextStroke: destaque ? `0.6px ${corComAlpha(cor, 0.9)}` : undefined,
        opacity: destaque ? 1 : 0.92,
      }}
    >
      {simbolo}
    </div>
  );
}

function posicoesZodiaco(cx: number, cy: number, raio: number): Array<{ x: number; y: number }> {
  return Array.from({ length: 12 }, (_, i) => {
    const ang = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(ang) * raio, y: cy + Math.sin(ang) * raio };
  });
}

/** Roda zodiacal — 12 signos em órbita, rotação lenta */
function VarianteRodaZodiaco({ cx, cy, tamanho, signoIndice, frame, paleta }: VarianteCtx): React.ReactElement {
  const raio = tamanho * 0.36;
  const posicoes = posicoesZodiaco(cx, cy, raio);
  const pulso = 1 + 0.06 * Math.sin(frame * 0.08);
  const corSigno = corSignoZodiaco(signoIndice);

  return (
    <>
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.78} grossura={1.5} cor={paleta[0]} />
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.52} grossura={1} cor={paleta[1]} />
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.26} grossura={1.5} cor={corSigno} />
      {posicoes.map((p, i) => (
        <SimboloZodiaco
          key={`zod-roda-${i}`}
          x={p.x}
          y={p.y}
          indice={i}
          tamanho={i === signoIndice ? tamanho * 0.11 * pulso : tamanho * 0.075}
          destaque={i === signoIndice}
        />
      ))}
      <SimboloZodiaco
        x={cx}
        y={cy}
        indice={signoIndice}
        tamanho={tamanho * 0.2 * pulso}
        destaque
      />
    </>
  );
}

/** Mandala 12 pétalas com signos — simétrica */
function VarianteMandalaZodiacal({ cx, cy, tamanho, signoIndice, paleta }: VarianteCtx): React.ReactElement {
  const raioExt = tamanho * 0.38;
  const raioInt = tamanho * 0.22;

  return (
    <>
      {Array.from({ length: 12 }, (_, i) => {
        const ang = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + Math.cos(ang) * raioInt;
        const y1 = cy + Math.sin(ang) * raioInt;
        const x2 = cx + Math.cos(ang) * raioExt;
        const y2 = cy + Math.sin(ang) * raioExt;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const rot = (Math.atan2(dy, dx) * 180) / Math.PI;
        const corPetala = i % 3 === 0 ? paleta[0] : i % 3 === 1 ? paleta[1] : paleta[2];
        return (
          <div
            key={`petala-${i}`}
            style={{
              position: 'absolute',
              left: x1,
              top: y1,
              width: len,
              height: 2,
              background: `linear-gradient(90deg, ${corComAlpha(corPetala, 0.75)}, ${corComAlpha(corPetala, 0.25)}, transparent)`,
              transformOrigin: 'left center',
              transform: `rotate(${rot}deg)`,
            }}
          />
        );
      })}
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.72} grossura={1} cor={paleta[0]} />
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.44} grossura={1.5} cor={paleta[2]} />
      {posicoesZodiaco(cx, cy, raioExt).map((p, i) => (
        <SimboloZodiaco
          key={`zod-mand-${i}`}
          x={p.x}
          y={p.y}
          indice={i}
          tamanho={tamanho * 0.07}
          destaque={i === signoIndice}
        />
      ))}
      <SimboloZodiaco x={cx} y={cy} indice={signoIndice} tamanho={tamanho * 0.16} destaque />
    </>
  );
}

/** Signo do dia em destaque — esboço central + anéis */
function VarianteSignoCentral({ cx, cy, tamanho, signoIndice, paleta }: VarianteCtx): React.ReactElement {
  const corSigno = corSignoZodiaco(signoIndice);
  const coresAneis = [corSigno, paleta[0], paleta[1], paleta[2]];
  return (
    <>
      {[0.32, 0.48, 0.64, 0.8].map((f, i) => (
        <Anel key={`sc-${i}`} cx={cx} cy={cy} diametro={tamanho * f} grossura={i === 0 ? 1.5 : 1} cor={coresAneis[i]} />
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const ang = (i / 12) * Math.PI * 2;
        const r = tamanho * 0.4;
        const px = cx + Math.cos(ang) * r;
        const py = cy + Math.sin(ang) * r;
        return (
          <Anel
            key={`tick-${i}`}
            cx={px}
            cy={py}
            diametro={tamanho * 0.025}
            grossura={1}
            cor={corSignoZodiaco(i)}
          />
        );
      })}
      <SimboloZodiaco x={cx} y={cy} indice={signoIndice} tamanho={tamanho * 0.28} destaque />
    </>
  );
}

/** Órbitas com os 12 glifos (em vez de pontos) */
function VarianteOrbitasSignos({ cx, cy, tamanho, signoIndice, paleta }: VarianteCtx): React.ReactElement {
  const raio = tamanho * 0.34;
  const coresOrbita = [paleta[0], paleta[1], paleta[2], corSignoZodiaco(signoIndice)];
  return (
    <>
      {[0.28, 0.42, 0.56, 0.7].map((f, i) => (
        <Anel key={`orb-${i}`} cx={cx} cy={cy} diametro={tamanho * f} grossura={1} cor={coresOrbita[i]} />
      ))}
      {posicoesZodiaco(cx, cy, raio).map((p, i) => (
        <SimboloZodiaco
          key={`zod-orb-${i}`}
          x={p.x}
          y={p.y}
          indice={i}
          tamanho={tamanho * 0.065}
          destaque={i === signoIndice}
        />
      ))}
    </>
  );
}

/** Anéis concêntricos + roda exterior de signos */
function VarianteAneisZodiacais({ cx, cy, tamanho, signoIndice, paleta }: VarianteCtx): React.ReactElement {
  const coresAneis = [paleta[0], paleta[1], paleta[2], corSignoZodiaco(signoIndice)];
  return (
    <>
      {Array.from({ length: 4 }, (_, i) => (
        <Anel key={`anel-${i}`} cx={cx} cy={cy} diametro={tamanho * 0.88 - i * 72} grossura={1.5} cor={coresAneis[i]} />
      ))}
      {posicoesZodiaco(cx, cy, tamanho * 0.4).map((p, i) => (
        <SimboloZodiaco
          key={`zod-anel-${i}`}
          x={p.x}
          y={p.y}
          indice={i}
          tamanho={tamanho * 0.068}
          destaque={i === signoIndice}
        />
      ))}
      {Array.from({ length: 8 }, (_, i) => {
        const ang = (i / 8) * Math.PI * 2;
        const r = tamanho * 0.38;
        const corRaio = i % 2 === 0 ? paleta[0] : paleta[1];
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
              background: `linear-gradient(180deg, ${corComAlpha(corRaio, 0.85)}, transparent)`,
            }}
          />
        );
      })}
    </>
  );
}

function VarianteMetatron({ cx, cy, tamanho, paleta }: VarianteCtx): React.ReactElement {
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
        const cor = i % 3 === 0 ? paleta[0] : i % 3 === 1 ? paleta[1] : paleta[2];
        return (
          <div
            key={`hex-${i}`}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: len,
              height: 1.5,
              background: `linear-gradient(90deg, ${corComAlpha(cor, 0.9)}, ${corComAlpha(cor, 0.45)})`,
              transformOrigin: 'left center',
              transform: `rotate(${ang}deg)`,
            }}
          />
        );
      })}
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.18} grossura={1.5} cor={paleta[2]} />
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.64} grossura={1} cor={paleta[0]} />
    </>
  );
}

function VarianteEstrelaOctogonal({ cx, cy, tamanho, paleta }: VarianteCtx): React.ReactElement {
  const r = tamanho * 0.38;
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => {
        const ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const cor = i % 2 === 0 ? paleta[0] : paleta[1];
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
              background: `linear-gradient(180deg, ${corComAlpha(cor, 0.95)}, transparent)`,
            }}
          />
        );
      })}
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.22} grossura={1.5} cor={paleta[2]} />
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.5} grossura={1} cor={paleta[0]} />
    </>
  );
}

function VarianteGradeCosmica({ cx, cy, tamanho, paleta }: VarianteCtx): React.ReactElement {
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
        const cor = i % 3 === 0 ? paleta[0] : i % 3 === 1 ? paleta[1] : paleta[2];
        return (
          <div
            key={`grid-${i}`}
            style={{
              position: 'absolute',
              left: l.x1,
              top: l.y1,
              width: len,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${corComAlpha(cor, 0.7)}, transparent)`,
              transformOrigin: 'left center',
              transform: `rotate(${ang}deg)`,
            }}
          />
        );
      })}
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.12} grossura={1.5} cor={paleta[2]} />
    </>
  );
}

function VarianteCruzCosmica({ cx, cy, tamanho, paleta }: VarianteCtx): React.ReactElement {
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
          background: `linear-gradient(90deg, transparent, ${corComAlpha(paleta[0], 0.9)}, ${corComAlpha(paleta[1], 0.9)}, transparent)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: cx - 1,
          top: cy - r,
          width: 2,
          height: r * 2,
          background: `linear-gradient(180deg, transparent, ${corComAlpha(paleta[2], 0.9)}, ${corComAlpha(paleta[0], 0.9)}, transparent)`,
        }}
      />
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.2} grossura={1.5} cor={paleta[1]} />
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.55} grossura={1} cor={paleta[2]} />
    </>
  );
}

/** Flor de vida simplificada — 6 círculos + signo central */
function VarianteFlorCosmica({ cx, cy, tamanho, signoIndice, paleta }: VarianteCtx): React.ReactElement {
  const r = tamanho * 0.14;
  const centros = [{ x: cx, y: cy }];
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    centros.push({ x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r });
  }
  const coresFlor = [corSignoZodiaco(signoIndice), paleta[0], paleta[1], paleta[2]];
  return (
    <>
      {centros.map((c, i) => (
        <Anel key={`flor-${i}`} cx={c.x} cy={c.y} diametro={r * 2} grossura={1} cor={coresFlor[i % coresFlor.length]} />
      ))}
      <Anel cx={cx} cy={cy} diametro={tamanho * 0.68} grossura={1} cor={paleta[0]} />
      <SimboloZodiaco x={cx} y={cy} indice={signoIndice} tamanho={tamanho * 0.12} destaque />
    </>
  );
}

const VARIANTES: Array<(ctx: VarianteCtx) => React.ReactElement> = [
  VarianteRodaZodiaco,
  VarianteMandalaZodiacal,
  VarianteSignoCentral,
  VarianteOrbitasSignos,
  VarianteAneisZodiacais,
  VarianteMetatron,
  VarianteEstrelaOctogonal,
  VarianteFlorCosmica,
  VarianteGradeCosmica,
  VarianteCruzCosmica,
];

const NOMES_VARIANTES = [
  'roda-zodiaco',
  'mandala-zodiacal',
  'signo-central',
  'orbitas-signos',
  'aneis-zodiacais',
  'metatron',
  'estrela-8',
  'flor-cosmica',
  'grade',
  'cruz',
] as const;

export const NOMES_VARIANTES_GEOMETRIA = NOMES_VARIANTES;

export function indiceGeometriaCosmica(seed: number): number {
  return Math.abs(Math.floor(seed)) % VARIANTES.length;
}

export function nomeGeometriaCosmica(seed: number): string {
  return NOMES_VARIANTES[indiceGeometriaCosmica(seed)];
}

/** Geometria simétrica no centro — zodíaco, mandalas, rotação lenta */
export function GeometriaCosmicaCentro({
  seed,
  signoIndice = 0,
  varianteIndice,
}: GeometriaCosmicaCentroProps): React.ReactElement {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const quadrado = Math.min(width, height);
  const cx = quadrado / 2;
  const cy = quadrado / 2;
  const signo = normalizarIndiceSigno(signoIndice);
  const indice =
    varianteIndice !== undefined
      ? normalizarIndiceSigno(varianteIndice) % VARIANTES.length
      : indiceGeometriaCosmica(seed);
  const rotacao = frame * 0.022 + seed * 0.11;
  const rotacaoContraria = -frame * 0.014 + seed * 0.07;
  const Variante = VARIANTES[indice];
  const paleta = paletaVarianteGeometria(indice);
  const ctx: VarianteCtx = { cx, cy, tamanho: quadrado * 0.92, signoIndice: signo, frame, paleta };

  const usaContrarrotacao = indice <= 4;

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
        {usaContrarrotacao ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: `rotate(${rotacaoContraria - rotacao}deg)`,
              transformOrigin: 'center center',
            }}
          >
            <Variante {...ctx} />
          </div>
        ) : (
          <Variante {...ctx} />
        )}
      </div>
    </AbsoluteFill>
  );
}
