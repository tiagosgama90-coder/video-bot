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
import { FundoVideoMistico } from './components/FundoVideoMistico';
import { ZenOverlayAnimado } from './components/ZenOverlayAnimado';
import { MarcaSidusAstro } from './components/OverlaysSidus';
import { PALETA_SIDUS } from './lib/paleta-visual';
import type { HoroscopoProps } from './types/horoscopo';

export type { HoroscopoProps } from './types/horoscopo';

function resolverSrcImagem(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return staticFile(url);
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

  const kenBurns = 1 + (frame / fps) * 0.012;
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
  const textoPrincipal = emFaseHook ? textoHook : previsao;
  const opacidadeCaixaPrincipal = emFaseHook ? opacidadeHookCaixa : opacidadePrevisao;
  const fontePrincipal = tamanhoFonteCaixa(textoPrincipal, modoProgressivo ? 24 : 28, ecraLink);

  return (
    <AbsoluteFill style={{ backgroundColor: PALETA_SIDUS.fundo, fontFamily: 'system-ui, sans-serif' }}>
      {usaImagemZen ? (
        <>
          <AbsoluteFill style={{ transform: `scale(${kenBurns})`, opacity: 0.62 }}>
            <Img
              src={resolverSrcImagem(imagemFundoUrl!)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </AbsoluteFill>
          {/* Grade 60-30-10 sobre a imagem IA */}
          <AbsoluteFill
            style={{
              background: `linear-gradient(180deg, ${PALETA_SIDUS.fundo} 0%, rgba(42, 24, 72, 0.38) 42%, ${PALETA_SIDUS.fundo} 100%)`,
              opacity: 0.72,
            }}
          />
          <AbsoluteFill
            style={{
              boxShadow: `inset 0 0 100px 48px ${PALETA_SIDUS.fundo}, inset 0 -120px 80px -40px rgba(243, 204, 99, 0.08)`,
              pointerEvents: 'none',
            }}
          />
          <ZenOverlayAnimado seed={fundoVideoSeed ?? 0} />
        </>
      ) : (
        <FundoVideoMistico tema={fundoVideoTema ?? 'zen_escuro'} seed={fundoVideoSeed ?? 0} />
      )}

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
            marginBottom: 10,
            opacity: 0.95,
          }}
        >
          <Img
            src={logoSidus}
            style={{ width: 240, height: 240, marginBottom: 16, objectFit: 'contain' }}
          />
        </div>

        <div
          style={{
            color: PALETA_SIDUS.destaque,
            fontSize: 80,
            fontWeight: 900,
            letterSpacing: 2,
            textShadow: `0 0 25px ${PALETA_SIDUS.destaqueSombra}`,
            marginBottom: 20,
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
                backgroundColor: ecraLink ? PALETA_SIDUS.marcaMedia : PALETA_SIDUS.marca,
                color: ecraLink ? PALETA_SIDUS.destaque : PALETA_SIDUS.textoCorpo,
                fontSize: fontePrincipal,
                fontWeight: emFaseHook ? 700 : ecraLink ? 800 : 400,
                lineHeight: 1.45,
                textAlign: 'center',
                border: ecraLink
                  ? `2px solid ${PALETA_SIDUS.destaqueBorda}`
                  : `1px solid ${PALETA_SIDUS.marcaBorda}`,
                maxHeight: 420,
                overflow: 'hidden',
                opacity: opacidadeCaixaPrincipal,
                transform: `translateY(${(1 - opacidadeCaixaPrincipal) * 10}px)`,
                letterSpacing: ecraLink ? 1.5 : 0,
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
