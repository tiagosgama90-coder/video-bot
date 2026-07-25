import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { EfeitosUniverso } from './components/EfeitosUniverso';
import { FundoImagemZen } from './components/FundoImagemZen';
import { FundoVideoMistico } from './components/FundoVideoMistico';
import { OverlayLegibilidadeTexto } from './components/OverlayLegibilidadeTexto';
import { ehGanchoViralLongo } from './lib/ganchos-virais';
import { MarcaSidusAstro } from './components/OverlaysSidus';
import { PALETA_SIDUS } from './lib/paleta-visual';
import type { HoroscopoProps } from './types/horoscopo';

export type { HoroscopoProps } from './types/horoscopo';

function tamanhoFonteGancho(texto: string): number {
  if (texto.length > 200) {
    return 22;
  }
  if (texto.length > 140) {
    return 24;
  }
  if (texto.length > 95) {
    return 26;
  }
  return 30;
}

function tamanhoFonteCaixa(texto: string, base: number, ecraLink = false): number {
  if (ecraLink) {
    return 48;
  }
  if (texto.length > 130) {
    return base - 6;
  }
  if (texto.length > 90) {
    return base - 3;
  }
  return base;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports -- asset estático em public/
const logoSidus = require('../public/logo-sidus.png') as string;

export const HoroscopoVideo: React.FC<HoroscopoProps> = ({
  signo,
  previsao,
  hookTexto,
  fechoTexto,
  frameInicioPrevisao,
  frameInicioFecho,
  fundoVideoTema,
  fundoVideoSeed,
  imagemFundoUrl,
  musicaFundoArquivo,
  segmentosEcra,
  siteMarca,
  volumeMusica = 0.22,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const inicioCorpo = frameInicioPrevisao ?? Math.round(fps * 3);
  const inicioFecho = frameInicioFecho
    ?? (fechoTexto ? durationInFrames - Math.round(fps * 4.8) : durationInFrames + 1);

  const modoProgressivo = segmentosEcra && segmentosEcra.length > 0;
  const segmentosVisiveis = modoProgressivo
    ? segmentosEcra.filter((s) => frame >= s.frameInicio)
    : [];
  const segmentoActivo =
    segmentosVisiveis.length > 0 ? segmentosVisiveis[segmentosVisiveis.length - 1] : null;

  const emFaseHook = Boolean(hookTexto && frame < inicioCorpo);

  const ecraLink =
    !modoProgressivo && !emFaseHook && /^[a-z0-9][-a-z0-9.]*\.[a-z]{2,}$/i.test(previsao.trim());

  const opacidadeHookCaixa = hookTexto
    ? interpolate(frame, [0, 8, inicioCorpo - 8, inicioCorpo], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const opacidadePrevisao = interpolate(
    frame,
    [inicioCorpo - 6, inicioCorpo + 12, inicioFecho - 14, inicioFecho + 6],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );
  const opacidadeFecho = interpolate(frame, [inicioFecho - 6, inicioFecho + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const usaImagemZen = Boolean(imagemFundoUrl);

  const estiloCaixaBase = {
    backgroundColor: PALETA_SIDUS.marca,
    backdropFilter: 'blur(15px)',
    borderRadius: 24,
    padding: modoProgressivo ? '18px 22px' : '28px 26px',
    border: `1px solid ${PALETA_SIDUS.marcaBorda}`,
    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
    width: '100%',
  };

  const textoHook = hookTexto ?? '';
  const ganchoViral = emFaseHook && ehGanchoViralLongo(textoHook);
  const textoPrincipal = emFaseHook ? textoHook : previsao;
  const opacidadeCaixaPrincipal = emFaseHook ? opacidadeHookCaixa : opacidadePrevisao;
  const fontePrincipal = emFaseHook
    ? tamanhoFonteGancho(textoHook)
    : tamanhoFonteCaixa(textoPrincipal, modoProgressivo ? 24 : 28, ecraLink);

  return (
    <AbsoluteFill style={{ backgroundColor: PALETA_SIDUS.fundo, fontFamily: 'system-ui, sans-serif' }}>
      {usaImagemZen ? (
        <FundoImagemZen imagemFundoUrl={imagemFundoUrl!} />
      ) : (
        <FundoVideoMistico tema={fundoVideoTema ?? 'zen_escuro'} seed={fundoVideoSeed ?? 0} />
      )}

      <OverlayLegibilidadeTexto />

      <EfeitosUniverso />

      <AbsoluteFill
        style={{
          padding: '70px 44px 160px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: emFaseHook ? 4 : 10,
            opacity: emFaseHook ? 0.75 : 0.95,
            transform: emFaseHook ? 'scale(0.72)' : 'none',
            transformOrigin: 'top center',
          }}
        >
          <Img
            src={logoSidus}
            style={{
              width: emFaseHook ? 160 : 240,
              height: emFaseHook ? 160 : 240,
              marginBottom: emFaseHook ? 8 : 16,
              objectFit: 'contain',
            }}
          />
        </div>

        <div
          style={{
            color: PALETA_SIDUS.destaque,
            fontSize: emFaseHook ? 56 : 80,
            fontWeight: 900,
            letterSpacing: 2,
            textShadow: `0 0 25px ${PALETA_SIDUS.destaqueSombra}`,
            marginBottom: emFaseHook ? 12 : 20,
          }}
        >
          {signo.toUpperCase()}
        </div>

        <div style={{ width: '100%', maxWidth: 980, position: 'relative' }}>
          {modoProgressivo ? (
            emFaseHook ? (
              <div
                style={{
                  ...estiloCaixaBase,
                  color: PALETA_SIDUS.textoCorpo,
                  fontSize: tamanhoFonteCaixa(textoHook, 26),
                  fontWeight: 700,
                  lineHeight: 1.4,
                  textAlign: 'center',
                  opacity: opacidadeHookCaixa,
                  transform: `translateY(${(1 - opacidadeHookCaixa) * 8}px)`,
                }}
              >
                {textoHook}
              </div>
            ) : segmentoActivo ? (
              <div
                style={{
                  ...estiloCaixaBase,
                  color: PALETA_SIDUS.textoCorpo,
                  fontSize: tamanhoFonteCaixa(segmentoActivo.texto, 24),
                  fontWeight: 600,
                  lineHeight: 1.4,
                  textAlign: 'center',
                  opacity: interpolate(
                    frame,
                    [segmentoActivo.frameInicio, segmentoActivo.frameInicio + 10],
                    [0, 1],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
                  ),
                }}
              >
                {segmentoActivo.texto.includes('sidusastro.com') ? (
                  <>
                    {segmentoActivo.texto.split('sidusastro.com')[0]}
                    <span style={{ color: PALETA_SIDUS.destaque, fontWeight: 800 }}>sidusastro.com</span>
                    {segmentoActivo.texto.split('sidusastro.com')[1] ?? ''}
                  </>
                ) : (
                  segmentoActivo.texto
                )}
              </div>
            ) : null
          ) : (
            <div
              style={{
                ...estiloCaixaBase,
                backgroundColor: ganchoViral ? PALETA_SIDUS.marcaMedia : PALETA_SIDUS.marca,
                color: ecraLink ? PALETA_SIDUS.destaque : PALETA_SIDUS.textoCorpo,
                fontSize: fontePrincipal,
                fontWeight: emFaseHook ? 800 : ecraLink ? 800 : 400,
                lineHeight: emFaseHook ? 1.38 : 1.45,
                textAlign: 'center',
                border: ganchoViral
                  ? `2px solid ${PALETA_SIDUS.destaqueForte}`
                  : ecraLink
                    ? `2px solid ${PALETA_SIDUS.destaqueBorda}`
                    : `1px solid ${PALETA_SIDUS.marcaBorda}`,
                maxHeight: emFaseHook ? 560 : 420,
                overflow: 'hidden',
                opacity: opacidadeCaixaPrincipal,
                transform: `translateY(${(1 - opacidadeCaixaPrincipal) * 10}px)`,
                letterSpacing: ecraLink ? 1.5 : 0,
                boxShadow: ganchoViral
                  ? `0 14px 44px rgba(0,0,0,0.55), 0 0 28px ${PALETA_SIDUS.destaqueSombra}`
                  : '0 10px 30px rgba(0,0,0,0.35)',
              }}
            >
              {emFaseHook ? (
                textoHook
              ) : ecraLink ? (
                previsao
              ) : (
                <>&quot;{previsao}&quot;</>
              )}
            </div>
          )}

          {!modoProgressivo && fechoTexto ? (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                transform: `translateY(${120 - opacidadeFecho * 16}px)`,
                display: 'flex',
                justifyContent: 'center',
                opacity: opacidadeFecho,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  backgroundColor: PALETA_SIDUS.marcaMedia,
                  border: `3px solid ${PALETA_SIDUS.destaqueForte}`,
                  borderRadius: 22,
                  padding: '20px 26px',
                  color: PALETA_SIDUS.destaqueForte,
                  fontSize: fechoTexto.length > 70 ? 26 : 30,
                  fontWeight: 900,
                  textAlign: 'center',
                  lineHeight: 1.25,
                  boxShadow: `0 12px 40px rgba(0,0,0,0.55), 0 0 32px ${PALETA_SIDUS.destaqueSombra}`,
                  textShadow: '0 2px 12px rgba(0,0,0,0.65)',
                  maxWidth: 980,
                }}
              >
                {fechoTexto}
              </div>
            </div>
          ) : null}
        </div>
      </AbsoluteFill>

      <MarcaSidusAstro siteMarca={siteMarca} />

      <Audio src={staticFile('narracao.mp3')} volume={1.0} />
      <Audio src={staticFile(musicaFundoArquivo)} volume={volumeMusica} loop />
    </AbsoluteFill>
  );
};
