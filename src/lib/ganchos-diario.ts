/* eslint-disable @remotion/deterministic-randomness -- script Node apenas */
import crypto from 'crypto';
import { isLocaleUS } from './locale';
import { obterNomeSigno, type SignoZodiaco } from './signos';
import { sanitizarTextoPublico } from './texto-publico';

type GanchoFn = (n: string) => string;

/** Peso dos ganchos de amor/relacionamento (alto engagement em redes) */
const PESO_GANCHO_RELACIONAMENTO = 72;

/**
 * Ganchos amor, relacionamento, traição, distância emocional.
 * Sugestivos (astros/intuição) — sem acusar ninguém directamente.
 */
const GANCHOS_RELACIONAMENTO_PT: GanchoFn[] = [
  (n) => n + ', algo no teu relacionamento não cheira bem e tu já sentes',
  (n) => 'Se és ' + n + ', o silêncio do parceiro hoje não é coincidência',
  (n) => n + ': a traição nem sempre é física - às vezes é emocional',
  (n) => 'A tua intuição sobre o amor está certa, ' + n + ' - não ignores',
  (n) => n + ', ele ou ela esconde mais do que o telemóvel de cabeça para baixo',
  (n) => 'Quem é ' + n + ' e sentiu um arrepio no peito por causa do parceiro, lê isto',
  (n) => n + ': distância, frieza ou traição? Os astros apontam para uma resposta',
  (n) => 'Não confrontes ainda, ' + n + ' - primeiro percebe o que os astros dizem',
  (n) => n + ', alguém que amas pode estar a mentir sem dizer uma palavra',
  (n) => 'Se és ' + n + ' e o parceiro mudou de repente, isto explica',
  (n) => n + ': o coração já sabia antes de tu teres coragem de admitir',
  (n) => 'Traição, ex a voltar ou amor verdadeiro? ' + n + ', o teu mapa responde',
  (n) => n + ', desconfia quando o carinho vem com culpa misturada',
  (n) => 'Para ' + n + ': o que evitas perguntar ao parceiro está nos astros',
  (n) => n + ', há segredos no teu relacionamento que a Lua revela hoje',
  (n) => 'Se és ' + n + ', não leves isto para a cama sem perceber o amor primeiro',
  (n) => n + ': ciúmes, distância ou traição emocional - qual é o teu caso',
  (n) => 'O parceiro afastou-se, ' + n + '? Isto não é só mau humor',
  (n) => n + ', alguém perto de ti joga com os teus sentimentos',
  (n) => 'Mensagens apagadas, histórias que não batem certo - ' + n + ', lê até ao fim',
  (n) => n + ': o universo avisa quando o amor está em perigo',
  (n) => 'Se és ' + n + ' e sentes que estás a perder o parceiro, respira e lê',
  (n) => n + ', a energia dele ou dela mudou - e não é o horóscopo genérico que explica',
  (n) => 'Amor ou ilusão, ' + n + '? Hoje os astros obrigam-te a ver a verdade',
  (n) => n + ': traição, reconciliação ou fim? O teu signo tem a chave',
  (n) => 'Quem ama de verdade não te deixa nesta dúvida, ' + n,
  (n) => n + ', o que o parceiro não diz pesa mais do que o que diz',
  (n) => 'Se és ' + n + ' e andas a analisar cada gesto dele, isto é para ti',
  (n) => n + ': cuidado com quem te faz sentir louco por desconfiar',
  (n) => 'O teu relacionamento pode mudar hoje, ' + n + ' - para bem ou para mal',
];

const GANCHOS_RELACIONAMENTO_EN: GanchoFn[] = [
  (n) => n + ', something in your relationship feels off and you already know it',
  (n) => "If you're a " + n + ", your partner's silence today is not random",
  (n) => n + ': betrayal is not always physical - sometimes it is emotional',
  (n) => 'Your intuition about love is right, ' + n + ' - do not ignore it',
  (n) => n + ', they are hiding more than just their phone screen',
  (n) => "If you're " + n + ' and felt a gut punch about your partner, read this',
  (n) => n + ': distance, coldness or betrayal? The stars point to an answer',
  (n) => 'Do not confront yet, ' + n + ' - first understand what the stars say',
  (n) => n + ', someone you love may be lying without saying a word',
  (n) => "If you're " + n + ' and your partner changed overnight, this explains it',
  (n) => n + ': your heart knew before you had the courage to admit it',
  (n) => 'Betrayal, ex coming back or true love? ' + n + ', your chart answers',
  (n) => n + ', watch when affection comes mixed with guilt',
  (n) => 'For ' + n + ': what you avoid asking your partner is in the stars',
  (n) => n + ', there are secrets in your relationship the Moon reveals today',
  (n) => "If you're " + n + ', do not go to bed without understanding love first',
  (n) => n + ': jealousy, distance or emotional cheating - which is your case',
  (n) => 'Your partner pulled away, ' + n + '? This is not just a bad mood',
  (n) => n + ', someone close is playing with your feelings',
  (n) => 'Deleted texts, stories that do not add up - ' + n + ', read until the end',
  (n) => n + ': the universe warns when love is in danger',
  (n) => "If you're " + n + ' and feel you are losing your partner, breathe and read',
  (n) => n + ", their energy shifted - and a generic horoscope won't explain it",
  (n) => 'Love or illusion, ' + n + '? Today the stars force you to see truth',
  (n) => n + ': betrayal, reconciliation or ending? Your sign holds the key',
  (n) => 'Who truly loves you does not leave you in this doubt, ' + n,
  (n) => n + ', what your partner does not say weighs more than what they say',
  (n) => "If you're " + n + ' and overthink every move they make, this is for you',
  (n) => n + ': beware of whoever makes you feel crazy for trusting your gut',
  (n) => 'Your relationship may shift today, ' + n + ' - for better or worse',
];

/** Ganchos emocionais/psicológicos gerais — complementam os de relacionamento */
const GANCHOS_EMOCIONAIS_PT: GanchoFn[] = [
  (n) => n + ', o teu coração já sabia disto antes do horóscopo',
  (n) => 'Se és ' + n + ', não ignores o que sentes hoje por dentro',
  (n) => n + ': há algo que precisas de ouvir antes de adormecer',
  (n) => 'Não é coincidência teres este vídeo no feed, ' + n,
  (n) => n + ', a tensão que sentes hoje tem explicação nos astros',
  (n) => 'Para quem é ' + n + ': respira, isto é para ti',
  (n) => n + ', alguém precisava de te dizer isto hoje',
  (n) => 'Se és ' + n + ' e andas confuso, lê até ao fim',
  (n) => n + ': o teu dia pode mudar depois disto',
  (n) => 'Guarda isto, ' + n + ' - vais precisar mais tarde',
  (n) => 'Isto não é horóscopo genérico, ' + n + ' - é o teu dia',
  (n) => n + ': o que evitas sentir hoje está nos astros',
  (n) => 'A tua intuição estava certa, ' + n,
  (n) => n + ', és mais sensível hoje do que pensas',
  (n) => 'Mensagem directa para ' + n + ' - não para os outros signos',
];

const GANCHOS_EMOCIONAIS_EN: GanchoFn[] = [
  (n) => n + ', your heart already knew this before the horoscope',
  (n) => "If you're a " + n + ", don't ignore what you feel inside today",
  (n) => n + ': you need to hear this before tonight',
  (n) => "It's not random that this showed up on your feed, " + n,
  (n) => n + ', the tension you feel today has a reason in the stars',
  (n) => 'For ' + n + ' only: breathe, this is for you',
  (n) => n + ', someone needed to tell you this today',
  (n) => "If you're " + n + ' and feeling lost, stay until the end',
  (n) => n + ': your day might shift after this',
  (n) => 'Save this, ' + n + ' - you will need it later',
  (n) => "This isn't a generic horoscope, " + n + ' - it is your day',
  (n) => n + ': what you avoid feeling today is in the stars',
  (n) => 'Your intuition was right, ' + n,
  (n) => n + ", you're more sensitive today than you think",
  (n) => 'Direct message for ' + n + ' - not the other signs',
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

function escolherPoolGancho(
  signo: SignoZodiaco,
  data: string,
): { ganchos: GanchoFn[]; sufixoSeed: string } {
  const rel = isLocaleUS() ? GANCHOS_RELACIONAMENTO_EN : GANCHOS_RELACIONAMENTO_PT;
  const emo = isLocaleUS() ? GANCHOS_EMOCIONAIS_EN : GANCHOS_EMOCIONAIS_PT;
  const usarRelacionamento =
    escolherIndiceGancho(signo, data + '-pool', 100) < PESO_GANCHO_RELACIONAMENTO;

  return usarRelacionamento
    ? { ganchos: rel, sufixoSeed: 'rel' }
    : { ganchos: emo, sufixoSeed: 'emo' };
}

/**
 * Gancho narrado + overlay — prioridade amor/relacionamento/traição (72%).
 * Emocional, psicológico, appeal to emotion.
 */
export function escolherGanchoDiario(
  signo: SignoZodiaco,
  previsao: string,
  data?: string,
): string {
  void previsao;
  const nomeSigno = obterNomeSigno(signo);
  const dataRef = data ?? new Date().toISOString().slice(0, 10);
  const { ganchos, sufixoSeed } = escolherPoolGancho(signo, dataRef);
  const indice = escolherIndiceGancho(signo, dataRef + '-' + sufixoSeed, ganchos.length);
  return sanitizarTextoPublico(ganchos[indice](nomeSigno));
}
