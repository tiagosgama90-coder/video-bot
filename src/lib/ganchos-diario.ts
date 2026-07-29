/* eslint-disable @remotion/deterministic-randomness -- script Node apenas */
import crypto from 'crypto';
import { isLocaleUS } from './locale';
import { obterNomeSigno, type SignoZodiaco } from './signos';
import type { GanchoComTema, TemaNarracao } from './fechos-narracao';
import { filtrarTextoParaVideo, sanitizarTextoPublico } from './texto-publico';

type GanchoFn = (n: string) => string;

interface GanchoTemado {
  tema: TemaNarracao;
  fn: GanchoFn;
}

function gancho(tema: TemaNarracao, fn: GanchoFn): GanchoTemado {
  return { tema, fn };
}

/** 1. Curiosidade e revelação — o que está oculto no mapa */
const GANCHOS_CURIOSIDADE_BR: GanchoTemado[] = [
  gancho('geral', (n) => 'O verdadeiro motivo pelo qual você, ' + n + ', não consegue desbloquear essa fase da vida está no seu mapa'),
  gancho('geral', (n) => 'Isso aqui vai mudar a forma como você enxerga seu signo de ' + n + ' a partir de hoje'),
  gancho('geral', (n) => 'O segredo que ninguém te conta sobre o céu de ' + n + ' - e os astros confirmam agora'),
  gancho('amor', (n) => n + ', o que está escondido na sua Casa 7 explica por que o amor trava sempre no mesmo lugar'),
  gancho('financas', (n) => 'Pouca gente sabe onde olhar no mapa de ' + n + ' para destravar dinheiro - eu mostro em 20 segundos'),
  gancho('geral', (n) => 'Você parou o scroll por um motivo, ' + n + ' - o tarot do céu já revelou qual é'),
  gancho('ego', (n) => 'Tem algo no seu mapa natal, ' + n + ', que explica por que você sente que nasceu para mais'),
  gancho('geral', (n) => n + ': a sensação estranha de hoje tem nome - e não é coincidência'),
];

/** 2. Alerta e erro comum — aversão à perda */
const GANCHOS_ALERTA_BR: GanchoTemado[] = [
  gancho('financas', (n) => 'Atenção ' + n + ': se você ignora esse trânsito, está bloqueando sua área financeira'),
  gancho('amor', (n) => 'Atenção: se você repete o mesmo padrão amoroso, ' + n + ', o mapa mostra o erro grave'),
  gancho('ego', (n) => 'O erro mais grave que ' + n + ' comete é ignorar a missão que o céu aponta todo dia'),
  gancho('geral', (n) => 'Pare de adiar essa decisão agora, ' + n + ', se você quer que o dia mude de verdade'),
  gancho('amor', (n) => n + ', pare de confiar cegamente - alguém perto não está sendo honesto com você'),
  gancho('depressao', (n) => 'Atenção ' + n + ': se você se culpa por estar pesado, o mapa mostra que não é fraqueza'),
  gancho('financas', (n) => 'Pare de olhar horóscopo genérico, ' + n + ' - você está perdendo a janela financeira do dia'),
  gancho('amor', (n) => 'Se você sente traição no ar, ' + n + ', não ignore - os planetas já sinalizaram'),
];

/** 3. Atalho e solução rápida — praticidade BR */
const GANCHOS_ATALHO_BR: GanchoTemado[] = [
  gancho('geral', (n) => 'Não sabe por onde começar no autoconhecimento, ' + n + '? Então faça isso: mapa grátis em sidusastro.com'),
  gancho('amor', (n) => 'O método mais simples para ver afinidade do casal: sinastria grátis em sidusastro.com - ' + n),
  gancho('financas', (n) => 'Como destravar dinheiro olhando só o mapa natal em 2 minutos - ' + n + ', funciona'),
  gancho('geral', (n) => n + ', descubra seu ascendente e Casa da Lua sem pagar nada em sidusastro.com'),
  gancho('ego', (n) => 'O atalho que todo ' + n + ' deveria usar: mapa astral completo grátis no link da bio'),
  gancho('amor', (n) => 'Descubra já a afinidade do seu parceiro com o seu em sidusastro.com - ' + n + ', muda tudo'),
  gancho('geral', (n) => 'Tarot, oráculo e mapa astral no mesmo lugar - ' + n + ', acesse sidusastro.com agora'),
];

/** 4. Identificação pessoal e desabafo */
const GANCHOS_IDENTIFICACAO_BR: GanchoTemado[] = [
  gancho('depressao', (n) => 'Se você também acordou vazio por dentro, ' + n + ', esse vídeo é para você'),
  gancho('depressao', (n) => n + ', se a mente não desliga à noite, você não está sozinho - o céu explica'),
  gancho('geral', (n) => 'Se você sente que trabalha demais e não sai do lugar, ' + n + ', os astros falam disso hoje'),
  gancho('amor', (n) => 'Você já teve a sensação de repetir a mesma história amorosa, ' + n + '? Não é azar'),
  gancho('depressao', (n) => 'Pouca gente fala de depressão em voz alta - mas seu signo de ' + n + ' fala por você'),
  gancho('geral', (n) => n + ', se ninguém entende o que você sente hoje, eu traduzo pelo horóscopo'),
  gancho('amor', (n) => 'Se a relação consome você, ' + n + ', o céu mostra o padrão que se repete'),
  gancho('geral', (n) => 'Respira, ' + n + ' - o que vem a seguir parece escrito para o seu momento'),
];

/** 5. Provocativo — impacto imediato */
const GANCHOS_PROVOCATIVO_BR: GanchoTemado[] = [
  gancho('geral', (n) => 'Nos próximos 4 segundos eu vou mudar sua perspectiva sobre ' + n + ' e o dia de hoje'),
  gancho('geral', (n) => 'Isso que vou te falar agora vai te deixar desconfortável, ' + n + ', mas é a verdade do mapa'),
  gancho('ego', (n) => n + ', o universo cansou de te ver ignorar o que seu mapa natal grita há anos'),
  gancho('geral', (n) => 'Último aviso, ' + n + ': depois disso você não vê o dia da mesma forma'),
  gancho('amor', (n) => 'Vou alugar um triplex na sua cabeça, ' + n + ': quem te trai raramente aparece de cara'),
  gancho('geral', (n) => 'Parece que leio sua mente, ' + n + ' - mas é o tarot do céu sendo direto'),
  gancho('financas', (n) => n + ', esse trânsito raro não espera - ou você age ou o dinheiro passa'),
  gancho('geral', (n) => 'Fique mais 20 segundos, ' + n + ' - vale cada palavra do que vem agora'),
];

/** Ganchos só para narração/overlay — sem "legenda", "comenta mapa", URLs nem emojis */
const GANCHOS_NARRACAO_BR: GanchoTemado[] = [
  ...GANCHOS_CURIOSIDADE_BR,
  ...GANCHOS_ALERTA_BR,
  ...GANCHOS_IDENTIFICACAO_BR,
  ...GANCHOS_PROVOCATIVO_BR,
];

/** Remove instruções de legenda/comentário que só devem ir para o Buffer */
export function limparGanchoParaNarracao(texto: string): string {
  return filtrarTextoParaVideo(texto);
}

/** Alias histórico — pools psicológicos BR (narração + atalho para legendas) */
export const GANCHOS_PSICOLOGIA_PT = [...GANCHOS_NARRACAO_BR, ...GANCHOS_ATALHO_BR];

const GANCHOS_HOROSCOPO_BR: GanchoFn[] = [
  (n) => n + ', o horóscopo de hoje não é o que você esperava',
  (n) => 'Mensagem do dia para ' + n + ' - os astros não mentem',
  (n) => n + ': Lua e planetas alinhados - assista agora',
  (n) => 'Previsão ' + n + ' - feita para você e só para você',
  (n) => n + ', a energia de hoje explica seu humor',
];

const GANCHOS_HOROSCOPO_EN: GanchoFn[] = [
  (n) => n + ", today's horoscope is not what you expected",
  (n) => 'Daily message for ' + n + ' - the stars do not lie',
  (n) => n + ': Moon and planets aligned - read now',
  (n) => 'Forecast ' + n + ' - for you and only you',
  (n) => n + ", today's energy explains your mood",
];

const PREFIXOS_PREVISAO_BR = [
  (n: string) => 'Não sei bem como te dizer isso, ' + n + ', mas ',
  (n: string) => n + ', escuta com calma: ',
  (n: string) => 'O que os astros dizem sobre você hoje, ' + n + ': ',
  (n: string) => n + ', a verdade do dia é esta: ',
];

const PREFIXOS_PREVISAO_EN = [
  (n: string) => "I don't know how to tell you this, " + n + ', but ',
  (n: string) => n + ', listen calmly: ',
  (n: string) => 'What the stars say about you today, ' + n + ': ',
  (n: string) => n + ', the truth of the day is this: ',
];

function hashGancho(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function escolherIndiceGancho(signo: SignoZodiaco, data: string, total: number): number {
  if (process.env.TESTE_LOCAL === '1') {
    return crypto.randomInt(0, total);
  }
  return hashGancho('gancho-' + signo + '-' + data) % total;
}

function ganchoDaPrevisao(
  nomeSigno: string,
  previsao: string,
  signo: SignoZodiaco,
  data: string,
): GanchoComTema | null {
  const limpa = sanitizarTextoPublico(previsao);
  const primeira = limpa.split(/[.!?]/)[0]?.trim();
  if (!primeira || primeira.length < 12 || primeira.length > 72) {
    return null;
  }
  const prefixos = isLocaleUS() ? PREFIXOS_PREVISAO_EN : PREFIXOS_PREVISAO_BR;
  const indice = escolherIndiceGancho(signo, data + '-pref', prefixos.length);
  const frase =
    primeira.charAt(0).toLowerCase() === primeira.charAt(0)
      ? primeira
      : primeira.charAt(0).toLowerCase() + primeira.slice(1);
  return {
    texto: sanitizarTextoPublico(prefixos[indice](nomeSigno) + frase),
    tema: 'geral',
  };
}

/**
 * Gancho para narração e overlay no vídeo — inteligente, humano, sem CTAs de legenda.
 * A previsão do site não é alterada — só o gancho de abertura.
 */
export function escolherGanchoNarracao(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): GanchoComTema {
  const nomeSigno = obterNomeSigno(signo);
  const dataRef = data ?? new Date().toISOString().slice(0, 10);

  if (isLocaleUS()) {
    if (escolherIndiceGancho(signo, dataRef + '-prev', 100) < 25) {
      const daPrevisao = ganchoDaPrevisao(nomeSigno, previsao, signo, dataRef);
      if (daPrevisao) {
        return daPrevisao;
      }
    }
    const indice = escolherIndiceGancho(signo, dataRef + '-horo', GANCHOS_HOROSCOPO_EN.length);
    return { texto: sanitizarTextoPublico(GANCHOS_HOROSCOPO_EN[indice](nomeSigno)), tema: 'geral' };
  }

  if (escolherIndiceGancho(signo, dataRef + '-prev', 100) < 20) {
    const daPrevisao = ganchoDaPrevisao(nomeSigno, previsao, signo, dataRef);
    if (daPrevisao) {
      return { texto: limparGanchoParaNarracao(daPrevisao.texto), tema: daPrevisao.tema };
    }
  }

  const usarHoroscopo = escolherIndiceGancho(signo, dataRef + '-horo', 100) < 15;
  if (usarHoroscopo) {
    const indice = escolherIndiceGancho(signo, dataRef + '-horo', GANCHOS_HOROSCOPO_BR.length);
    return {
      texto: limparGanchoParaNarracao(GANCHOS_HOROSCOPO_BR[indice](nomeSigno)),
      tema: 'geral',
    };
  }

  const indice = escolherIndiceGancho(signo, dataRef + '-br', GANCHOS_NARRACAO_BR.length);
  const escolhido = GANCHOS_NARRACAO_BR[indice];
  return {
    texto: limparGanchoParaNarracao(escolhido.fn(nomeSigno)),
    tema: escolhido.tema,
  };
}

/**
 * Gancho para legendas Buffer — pode incluir viral/CTA (nunca narrado).
 * @deprecated preferir escolherGanchoNarracao para vídeo + escolherGanchoLegendaBuffer para caption
 */
export function escolherGanchoDiario(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): GanchoComTema {
  return escolherGanchoNarracao(signo, previsao, data);
}

/** Gancho extra só para texto da legenda Buffer (nunca entra no vídeo) */
export function escolherGanchoLegendaBuffer(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): GanchoComTema {
  return escolherGanchoNarracao(signo, previsao, data);
}

export function escolherTextoGanchoDiario(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): string {
  return escolherGanchoDiario(signo, previsao, data).texto;
}
