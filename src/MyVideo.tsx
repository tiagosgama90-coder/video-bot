import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { EfeitosUniverso } from './components/EfeitosUniverso';
import { FundoImagemZen } from './components/FundoImagemZen';
import { FundoVideoMistico } from './components/FundoVideoMistico';
import { OverlayLegibilidadeTexto } from './components/OverlayLegibilidadeTexto';
import { ZenOverlayAnimado } from './components/ZenOverlayAnimado';
import { LogoSidusVideo } from './components/LogoSidusVideo';
import { RodapeComercialSidus } from './components/OverlaysSidus';
import { PALETA_SIDUS } from './lib/paleta-visual';
import type { HoroscopoProps } from './types/horoscopo';

export type { HoroscopoProps } from './types/horoscopo';

const LOGO_SIDUS_LARGURA_PX = 420;

function tamanhoFonteSigno(texto: string): number {
  if (texto.length > 28) {
    return 48;
  }
  if (texto.length > 22) {
    return 56;
  }
  if (texto.length > 16) {
    return 64;
  }
  return 80;
}

function tamanhoFonteCaixa(texto: string, base: number, ecraLink = false): number {
  if (ecraLink) {
    return 48;
  }
  if (texto.length > 200) {
    return base - 10;
  }
  if (texto.length > 160) {
    return base - 8;
  }
  if (texto.length > 130) {
    return base - 6;
  }
  if (texto.length > 90) {
    return base - 3;
  }
  return base;
}

// Logo em public/logo-sidus-vertical.png (componente LogoSidusVideo)

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
  imagemFundoModo,
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
  const emFaseFecho = Boolean(fechoTexto && frame >= inicioFecho);

  const ecraLink =
    !modoProgressivo &&
    !emFaseHook &&
    !emFaseFecho &&
    /^[a-z0-9][-a-z0-9.]*\.[a-z]{2,}$/i.test(previsao.trim());

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
    minHeight: 120,
  };

  const textoHook = hookTexto ?? '';
  const textoFecho = fechoTexto ?? '';

  let textoCaixa = previsao;
  let opacidadeCaixa = opacidadePrevisao;
  let pesoCaixa = 400;
  let corCaixa: string = PALETA_SIDUS.textoCorpo;
  let bordaCaixa = `1px solid ${PALETA_SIDUS.marcaBorda}`;
  let fundoCaixa: string = PALETA_SIDUS.marca;

  if (emFaseHook) {
    textoCaixa = textoHook;
    opacidadeCaixa = opacidadeHookCaixa;
    pesoCaixa = 700;
  } else if (emFaseFecho) {
    textoCaixa = textoFecho;
    opacidadeCaixa = opacidadeFecho;
    pesoCaixa = 900;
    corCaixa = PALETA_SIDUS.destaqueForte;
    bordaCaixa = `3px solid ${PALETA_SIDUS.destaqueForte}`;
    fundoCaixa = PALETA_SIDUS.marcaMedia;
  } else if (modoProgressivo && segmentoActivo) {
    textoCaixa = segmentoActivo.texto;
    opacidadeCaixa = interpolate(
      frame,
      [segmentoActivo.frameInicio, segmentoActivo.frameInicio + 10],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );
    pesoCaixa = 600;
  } else if (modoProgressivo) {
    textoCaixa = '';
    opacidadeCaixa = 0;
  } else if (ecraLink) {
    pesoCaixa = 800;
    corCaixa = PALETA_SIDUS.destaque;
    fundoCaixa = PALETA_SIDUS.marcaMedia;
    bordaCaixa = `2px solid ${PALETA_SIDUS.destaqueBorda}`;
  } else if (!modoProgressivo && previsao) {
    textoCaixa = previsao;
  }

  const fonteCaixa = tamanhoFonteCaixa(
    textoCaixa,
    modoProgressivo ? 24 : 28,
    ecraLink && !emFaseHook && !emFaseFecho,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: PALETA_SIDUS.fundo, fontFamily: 'system-ui, sans-serif' }}>
      {usaImagemZen ? (
        <FundoImagemZen imagemFundoUrl={imagemFundoUrl!} modoPaleta={imagemFundoModo} />
      ) : (
        <FundoVideoMistico tema={fundoVideoTema ?? 'zen_escuro'} seed={fundoVideoSeed ?? 0} />
      )}

      {usaImagemZen ? (
        <ZenOverlayAnimado seed={fundoVideoSeed ?? 0} />
      ) : (
        <EfeitosUniverso />
      )}

      <OverlayLegibilidadeTexto modoImagemZen={usaImagemZen} />

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
            marginBottom: 6,
          }}
        >
          <LogoSidusVideo larguraPx={LOGO_SIDUS_LARGURA_PX} opacidade={0.98} />
        </div>

        <div
          style={{
            color: PALETA_SIDUS.destaque,
            fontSize: tamanhoFonteSigno(signo),
            fontWeight: 900,
            letterSpacing: 2,
            textShadow: `0 0 25px ${PALETA_SIDUS.destaqueSombra}`,
            marginBottom: 20,
            textAlign: 'center',
            maxWidth: 980,
            lineHeight: 1.1,
          }}
        >
          {signo.toUpperCase()}
        </div>

        <div style={{ width: '100%', maxWidth: 980, position: 'relative' }}>
          <div
            style={{
              ...estiloCaixaBase,
              backgroundColor: fundoCaixa,
              color: corCaixa,
              fontSize: fonteCaixa,
              fontWeight: pesoCaixa,
              lineHeight: 1.45,
              textAlign: 'center',
              border: bordaCaixa,
              maxHeight: 420,
              overflow: 'hidden',
              opacity: opacidadeCaixa,
              transform: `translateY(${(1 - opacidadeCaixa) * 10}px)`,
              letterSpacing: ecraLink && !emFaseHook && !emFaseFecho ? 1.5 : 0,
              boxShadow: emFaseFecho
                ? `0 12px 40px rgba(0,0,0,0.55), 0 0 32px ${PALETA_SIDUS.destaqueSombra}`
                : '0 10px 30px rgba(0,0,0,0.35)',
            }}
          >
            {modoProgressivo && segmentoActivo?.texto.includes('sidusastro.com') ? (
              <>
                {segmentoActivo.texto.split('sidusastro.com')[0]}
                <span style={{ color: PALETA_SIDUS.destaque, fontWeight: 800 }}>sidusastro.com</span>
                {segmentoActivo.texto.split('sidusastro.com')[1] ?? ''}
              </>
            ) : (
              textoCaixa
            )}
          </div>
        </div>
      </AbsoluteFill>

      <RodapeComercialSidus
        siteMarca={siteMarca}
        activo={emFaseFecho}
        frameInicio={inicioFecho}
      />

      <Audio src={staticFile('narracao.mp3')} volume={1.0} />
      <Audio src={staticFile(musicaFundoArquivo)} volume={volumeMusica} loop />
    </AbsoluteFill>
  );
};
