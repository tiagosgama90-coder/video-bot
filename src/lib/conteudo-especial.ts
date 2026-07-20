/* eslint-disable @remotion/deterministic-randomness -- script Node apenas */
import crypto from 'crypto';
import {
  CTA_AFILIADOS_EN,
  CTA_AFILIADOS_PT,
  CTA_MOTIVACIONAL_EN,
  CTA_MOTIVACIONAL_PT,
  CTA_VIP_EN,
  CTA_VIP_PT,
  HASHTAGS_AFILIADOS_EN_INSTAGRAM,
  HASHTAGS_AFILIADOS_EN_TIKTOK,
  HASHTAGS_AFILIADOS_PT_INSTAGRAM,
  HASHTAGS_AFILIADOS_PT_TIKTOK,
  HASHTAGS_MOTIVACIONAL_EN_INSTAGRAM,
  HASHTAGS_MOTIVACIONAL_EN_TIKTOK,
  HASHTAGS_MOTIVACIONAL_PT_INSTAGRAM,
  HASHTAGS_MOTIVACIONAL_PT_TIKTOK,
  HASHTAGS_VIP_EN_INSTAGRAM,
  HASHTAGS_VIP_EN_TIKTOK,
  HASHTAGS_VIP_PT_INSTAGRAM,
  HASHTAGS_VIP_PT_TIKTOK,
} from './legendas-marketing';
import { isLocaleUS } from './locale';
import { obterVarianteQuarta, type VarianteQuarta } from './quarta-alternada';
import { sanitizarTextoPublico } from './texto-publico';

export const TITULO_VIP_DIVULGACAO = 'O TEU VIP VITALÍCIO';
export const TITULO_VIP_DIVULGACAO_EN = 'YOUR LIFETIME VIP';

/** Texto no ecrã - curto e natural */
export const SEGMENTOS_VIP_ECRA = [
  'Queres VIP vitalício no SidusAstro? É mais simples do que pensas',
  'Mapa astral, tarot e oráculo sem limites - só por partilhares',
  'Grava, marca @sidusastro e pede em sidusastro.com/pt/divulgacao-vip',
];

export const SEGMENTOS_VIP_ECRA_EN = [
  'Want lifetime VIP on SidusAstro? It is easier than you think',
  'Birth chart, tarot and oracle unlocked - just by sharing',
  'Record, tag @sidusastro and apply at sidusastro.com/en/divulgacao-vip',
];

/** Narração TTS curta (~25-30s) */
export const TEXTO_VIP_FALADO =
  'Imagina teres o SidusAstro completo para sempre, só por partilhares o que já usas. ' +
  'Mapa astral, tarot ilimitado e oráculo sem restrições. ' +
  'Grava um vídeo curto, marca arroba sidusastro, e envia o pedido em sidusastro.com barra pt barra divulgacao-vip. ' +
  'Em até quarenta e oito horas o VIP fica na tua conta.';

export const TEXTO_VIP_FALADO_EN =
  'Imagine getting full SidusAstro access forever, just by sharing what you already use. ' +
  'Birth chart, unlimited tarot and oracle without limits. ' +
  'Record a short video, tag at sidusastro, and submit at sidusastro.com slash en slash divulgacao-vip. ' +
  'Lifetime VIP lands on your account within forty-eight hours.';

export const LEGENDA_VIP_TIKTOK =
  'Ok, isto é real: podes ter VIP vitalício no SidusAstro só por partilhares ✨\n\n' +
  'Grava um vídeo com o mapa, tarot ou oráculo, marca @sidusastro e envia o pedido.\n\n' +
  'Resposta em até 48h 👇\n\n' +
  CTA_VIP_PT + '\n\n' +
  HASHTAGS_VIP_PT_TIKTOK;

export const LEGENDA_VIP_INSTAGRAM =
  'Se já amas o SidusAstro, isto pode interessar-te ✨\n\n' +
  'Partilha um vídeo, marca @sidusastro e podes ficar com VIP vitalício - mapa astral, tarot e oráculo.\n\n' +
  'Resposta em até 48h 👇\n\n' +
  CTA_VIP_PT + '\n\n' +
  HASHTAGS_VIP_PT_INSTAGRAM;

export const LEGENDA_VIP_TIKTOK_EN =
  'Okay this is real: you can get lifetime VIP on SidusAstro just by sharing ✨\n\n' +
  'Post a short video with your chart, tarot or oracle, tag @sidusastro and submit.\n\n' +
  'Usually within 48 hours 👇\n\n' +
  CTA_VIP_EN + '\n\n' +
  HASHTAGS_VIP_EN_TIKTOK;

export const LEGENDA_VIP_INSTAGRAM_EN =
  'If you already love SidusAstro, this one is for you ✨\n\n' +
  'Share a video, tag @sidusastro and you can unlock lifetime VIP - birth chart, tarot and oracle.\n\n' +
  'Usually within 48 hours 👇\n\n' +
  CTA_VIP_EN + '\n\n' +
  HASHTAGS_VIP_EN_INSTAGRAM;

export const TITULO_AFILIADOS = 'GANHA COM O CÉU';
export const TITULO_AFILIADOS_EN = 'EARN WITH THE STARS';

export const TEXTO_AFILIADOS_ECRA =
  'SidusAstro | Portal Místico. Descobre o teu Mapa Astral ou junta-te à equipa para ganhares 50% de comissão por cada venda! Acede abaixo 👇';

export const TEXTO_AFILIADOS_ECRA_EN =
  'SidusAstro | Mystic Portal. Get your birth chart or join our team and earn 50% commission on every sale! Link below 👇';

export const TEXTO_AFILIADOS_FALADO =
  'SidusAstro, Portal Místico. Descobre o teu Mapa Astral ou junta-te à equipa para ganhares cinquenta por cento de comissão por cada venda. Acede abaixo.';

export const TEXTO_AFILIADOS_FALADO_EN =
  'SidusAstro, Mystic Portal. Get your birth chart or join our team and earn fifty percent commission on every sale. Link below.';

export const LEGENDA_AFILIADOS_TIKTOK =
  'Se gostas de astrologia e queres ganhar com isso, isto é para ti 💸\n\n' +
  'No SidusAstro podes levar 50% de comissão por cada venda. Registo grátis, link teu, partilhas onde quiseres.\n\n' +
  CTA_AFILIADOS_PT + '\n\n' +
  HASHTAGS_AFILIADOS_PT_TIKTOK;

export const LEGENDA_AFILIADOS_INSTAGRAM =
  'Gostas de falar de signos? Podes ganhar com isso ✨\n\n' +
  'Programa de afiliados SidusAstro: 50% de comissão em cada venda. Sem taxas, sem investimento, link exclusivo teu.\n\n' +
  CTA_AFILIADOS_PT + '\n\n' +
  HASHTAGS_AFILIADOS_PT_INSTAGRAM;

export const LEGENDA_AFILIADOS_TIKTOK_EN =
  'If you love astrology and want to earn from it, this is for you 💸\n\n' +
  'At SidusAstro you can get 50% commission on every sale. Free sign-up, your link, share anywhere.\n\n' +
  CTA_AFILIADOS_EN + '\n\n' +
  HASHTAGS_AFILIADOS_EN_TIKTOK;

export const LEGENDA_AFILIADOS_INSTAGRAM_EN =
  'Love talking about the zodiac? You can earn from it ✨\n\n' +
  'SidusAstro affiliate program: 50% commission on every sale. No fees, no investment, your exclusive link.\n\n' +
  CTA_AFILIADOS_EN + '\n\n' +
  HASHTAGS_AFILIADOS_EN_INSTAGRAM;

const FRASES_MOTIVACIONAIS = [
  'Hoje não precisas de ter tudo resolvido. Basta dar um passo de cada vez, com calma e com confiança no teu caminho.',
  'Às vezes o universo pede-te pausa, não pressa. Respira, observa e deixa que o dia te mostre o que realmente importa.',
  'Não és a tua última dificuldade. És também tudo o que já superaste - e isso conta mais do que pensas.',
  'A tua sensibilidade não é fraqueza. É a forma como sentes o mundo, e isso também é uma força.',
  'Se hoje estiveres mais cansado, está tudo bem. Amanhã o céu continua lá, e tu também podes recomeçar.',
  'Nem todos os dias brilham igual, e isso é normal. O teu valor não depende do teu melhor momento.',
  'Confia no teu ritmo. Há dias para avançar e dias para cuidar de ti - os dois têm o seu lugar.',
  'O que te move por dentro merece ser ouvido. Presta atenção aos teus sinais, eles guiam-te melhor do que a pressa.',
  'Tu mereces gentileza, sobretudo da parte de quem te olha no espelho todas as manhãs.',
  'Quando tudo parecer demasiado, volta ao simples: uma respiração, um gesto de carinho, um pequeno passo.',
  'Não precisas de provar nada a ninguém hoje. Basta seres honesto contigo e fazer o melhor que conseguires.',
  'Há beleza em recomeçar quantas vezes forem precisas. Cada manhã é uma nova página, não um julgamento.',
  'O teu coração sabe mais do que imaginas. Quando duvidares, escolhe o que te deixa em paz.',
  'Está tudo bem não estar bem. O importante é não ficares sozinho com isso - pede ajuda, fala, respira.',
  'Tu és mais do que um dia difícil. És história, aprendizagem, coragem silenciosa e luz que ainda cresce.',
  'Nem tudo precisa de resposta hoje. Algumas coisas só precisam de tempo, presença e um pouco de fé.',
  'Cuida de ti como cuidarias de alguém que amas. Isso também é força, não egoísmo.',
  'O mundo não precisa que sejas perfeito. Precisa que sejas verdadeiro, e isso já basta.',
  'Se hoje for um dia lento, usa-o para te ouvires. Às vezes a clareza chega quando paramos.',
  'Tu já fizeste coisas difíceis antes, mesmo quando não acreditavas. Lembra-te disso agora.',
  'A tua jornada é tua. Não precisa de parecer com a de mais ninguém para ser válida.',
  'Há esperança em cada pequeno gesto: uma mensagem, um sorriso, um passo fora da zona de conforto.',
  'Não te peças menos do que mereces. E não te cobres mais do que hoje consegues dar.',
  'O céu muda, a vida muda, e tu também podes mudar - sem deixar de seres quem és no essencial.',
  'Quando o dia pesar, lembra-te: até a noite mais longa acaba. Tu também vais encontrar luz outra vez.',
  'Ser gentil contigo hoje é um acto de coragem. Não subestimes isso.',
  'Não estás atrasado. Estás no teu tempo, e o teu tempo também tem valor.',
  'O que te inspira merece espaço. Protege o que te faz bem, mesmo que seja só um momento de silêncio.',
  'Tu não precisas de carregar tudo sozinho. Partilhar o peso também é caminhar.',
  'Hoje pode ser um bom dia para escolher o que te faz bem, mesmo que seja algo pequeno.',
  'A tua presença no mundo importa, mesmo nos dias em que te sentes pequeno.',
  'Às vezes o melhor plano é descansar, reorganizar e voltar com mais calma amanhã.',
  'Não confundas calma com desistência. Às vezes calma é exactamente o que te vai salvar.',
  'Tu és capaz de dias bonitos e de dias duros. Os dois fazem parte de quem estás a construir.',
  'Se precisares de um sinal hoje, fica com este: continua. Suavemente, mas continua.',
  'Há futuro em ti que ainda não viste. Dá tempo ao tempo sem deixar de te mover.',
  'O teu esforço silencioso também conta. Nem tudo precisa de ser visto para ser real.',
  'Escolhe hoje uma coisa que te traga paz. Só uma já pode mudar o tom do dia.',
  'Tu mereces dias mais leves. E podes começar por seres mais leve contigo.',
  'Não te compares com o highlight de ninguém. A tua vida real também merece cuidado.',
  'Quando tiveres medo, não precisas de o vencer de uma vez. Podes caminhar com ele, devagar.',
  'Há força em pedir tempo, em dizer não, em escolher o que faz sentido para ti.',
  'O universo não te pede perfeição. Pede presença, honestidade e um coração aberto.',
  'Se hoje fizer sol por dentro, aproveita. Se não fizer, cria um raio de luz pequeno.',
  'Tu és mais resiliente do que o teu medo te diz. Já o provaste antes.',
  'Deixa que hoje seja suficiente. Não precisa de ser extraordinário para ter valor.',
  'A tua história ainda está a ser escrita. Este capítulo também pode ser bonito.',
  'Confia: há dias melhores a caminho, e tu estás a aprender o que precisas para os receber.',
  'No fim, o que fica é como te trataste a ti e aos outros. Hoje, escolhe gentileza.',
  'Respira. Estás aqui. E isso, por si só, já é um começo.',
];

const FRASES_MOTIVACIONAIS_EN = [
  'You don\'t need to have everything figured out today. Just take one step at a time, with calm and trust in your path.',
  'Sometimes the universe asks for pause, not rush. Breathe, observe, and let the day show you what really matters.',
  'You are not your last hardship. You are also everything you have already overcome - and that counts more than you think.',
  'Your sensitivity is not weakness. It is how you feel the world, and that is a strength too.',
  'If you feel tired today, that is okay. Tomorrow the sky is still there, and you can start again.',
  'Not every day shines the same, and that is normal. Your worth does not depend on your best moment.',
  'Trust your rhythm. Some days are for moving forward, some for self-care - both have their place.',
  'What moves you inside deserves to be heard. Pay attention to your signs; they guide you better than hurry.',
  'You deserve kindness, especially from the person you see in the mirror every morning.',
  'When everything feels like too much, return to the simple: one breath, one kind gesture, one small step.',
  'You do not need to prove anything to anyone today. Just be honest with yourself and do your best.',
  'There is beauty in starting over as many times as you need. Each morning is a new page, not a judgment.',
  'Your heart knows more than you imagine. When you doubt, choose what brings you peace.',
  'It is okay not to be okay. What matters is not carrying it alone - ask for help, talk, breathe.',
  'You are more than one hard day. You are story, learning, quiet courage, and light still growing.',
  'Not everything needs an answer today. Some things just need time, presence, and a little faith.',
  'Take care of yourself the way you would someone you love. That is strength, not selfishness.',
  'The world does not need you to be perfect. It needs you to be real, and that is enough.',
  'If today is a slow day, use it to listen to yourself. Clarity often arrives when we stop.',
  'You have done hard things before, even when you did not believe you could. Remember that now.',
  'Your journey is yours. It does not have to look like anyone else\'s to be valid.',
  'There is hope in every small gesture: a message, a smile, one step outside your comfort zone.',
  'Do not ask less than you deserve. And do not demand more from yourself than you can give today.',
  'The sky changes, life changes, and you can change too - without losing who you are at the core.',
  'When the day feels heavy, remember: even the longest night ends. You will find light again.',
  'Being kind to yourself today is an act of courage. Do not underestimate that.',
  'You are not behind. You are on your timeline, and your timeline has value too.',
  'What inspires you deserves space. Protect what feels good, even if it is just a moment of silence.',
  'You do not need to carry everything alone. Sharing the weight is still moving forward.',
  'Today can be a good day to choose what feels right, even if it is something small.',
  'Your presence in the world matters, even on days you feel small.',
  'Sometimes the best plan is to rest, reorganize, and come back calmer tomorrow.',
  'Do not confuse calm with giving up. Sometimes calm is exactly what saves you.',
  'You are capable of beautiful days and hard days. Both shape who you are becoming.',
  'If you need a sign today, take this one: keep going. Gently, but keep going.',
  'There is future in you that you have not seen yet. Give time time without stopping your motion.',
  'Your quiet effort counts too. Not everything needs to be seen to be real.',
  'Choose one thing today that brings you peace. Just one can change the tone of the day.',
  'You deserve lighter days. And you can start by being lighter with yourself.',
  'Do not compare yourself to anyone\'s highlight reel. Your real life deserves care too.',
  'When you are afraid, you do not have to beat it all at once. You can walk with it, slowly.',
  'There is strength in asking for time, in saying no, in choosing what makes sense for you.',
  'The universe does not ask for perfection. It asks for presence, honesty, and an open heart.',
  'If the sun shines inside you today, enjoy it. If not, create one small ray of light.',
  'You are more resilient than your fear tells you. You have proved it before.',
  'Let today be enough. It does not have to be extraordinary to have value.',
  'Your story is still being written. This chapter can be beautiful too.',
  'Trust: better days are on the way, and you are learning what you need to receive them.',
  'In the end, what remains is how you treated yourself and others. Today, choose kindness.',
  'Breathe. You are here. And that, by itself, is already a beginning.',
];

function hashTexto(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Produção: uma frase por data (cada segunda/quinta é diferente). Local: aleatória a cada execução. */
export function escolherFraseMotivacional(
  data: string,
  variante: 'segunda' | 'quinta' = 'segunda',
): string {
  const frases = isLocaleUS() ? FRASES_MOTIVACIONAIS_EN : FRASES_MOTIVACIONAIS;
  if (process.env.TESTE_LOCAL === '1') {
    return sanitizarTextoPublico(frases[crypto.randomInt(0, frases.length)]);
  }
  const indice = hashTexto('motiv-' + variante + '-' + data) % frases.length;
  return sanitizarTextoPublico(frases[indice]);
}

export function obterTituloMotivacional(): string {
  return isLocaleUS() ? 'MESSAGE FROM THE COSMOS' : 'MENSAGEM DO COSMOS';
}

export function obterLegendasMotivacional(): { tiktok: string; instagram: string } {
  if (isLocaleUS()) {
    return {
      tiktok: sanitizarTextoPublico(
        'Needed this today, so maybe you do too ✨\n\n' +
          'Save it for later if it hits.\n\n' +
          CTA_MOTIVACIONAL_EN +
          '\n\n' +
          HASHTAGS_MOTIVACIONAL_EN_TIKTOK,
      ),
      instagram: sanitizarTextoPublico(
        'A little reminder for whoever needs it today ✨\n\n' +
          'Save this reel - your birth chart still has answers. 🔮\n\n' +
          CTA_MOTIVACIONAL_EN +
          '\n\n' +
          HASHTAGS_MOTIVACIONAL_EN_INSTAGRAM,
      ),
    };
  }
  return {
    tiktok: sanitizarTextoPublico(
      'Precisava disto hoje, talvez tu também ✨\n\n' +
        'Guarda para quando precisares.\n\n' +
        CTA_MOTIVACIONAL_PT +
        '\n\n' +
        HASHTAGS_MOTIVACIONAL_PT_TIKTOK,
    ),
    instagram: sanitizarTextoPublico(
      'Uma lembrança rápida para quem precisa hoje ✨\n\n' +
        'Guarda este reel - o teu mapa astral ainda tem respostas. 🔮\n\n' +
        CTA_MOTIVACIONAL_PT +
        '\n\n' +
        HASHTAGS_MOTIVACIONAL_PT_INSTAGRAM,
    ),
  };
}

export function obterConteudoAfiliados(): {
  titulo: string;
  textoEcra: string;
  textoNarracao: string;
  segmentosEcra?: string[];
  legendas: { tiktok: string; instagram: string };
} {
  if (isLocaleUS()) {
    return {
      titulo: TITULO_AFILIADOS_EN,
      textoEcra: sanitizarTextoPublico(TEXTO_AFILIADOS_ECRA_EN),
      textoNarracao: sanitizarTextoPublico(TEXTO_AFILIADOS_FALADO_EN),
      legendas: {
        tiktok: sanitizarTextoPublico(LEGENDA_AFILIADOS_TIKTOK_EN),
        instagram: sanitizarTextoPublico(LEGENDA_AFILIADOS_INSTAGRAM_EN),
      },
    };
  }
  return {
    titulo: TITULO_AFILIADOS,
    textoEcra: sanitizarTextoPublico(TEXTO_AFILIADOS_ECRA),
    textoNarracao: sanitizarTextoPublico(TEXTO_AFILIADOS_FALADO),
    legendas: {
      tiktok: sanitizarTextoPublico(LEGENDA_AFILIADOS_TIKTOK),
      instagram: sanitizarTextoPublico(LEGENDA_AFILIADOS_INSTAGRAM),
    },
  };
}

export function obterConteudoVipDivulgacao(): {
  titulo: string;
  textoEcra: string;
  textoNarracao: string;
  segmentosEcra: string[];
  legendas: { tiktok: string; instagram: string };
} {
  if (isLocaleUS()) {
    return {
      titulo: TITULO_VIP_DIVULGACAO_EN,
      textoEcra: sanitizarTextoPublico(SEGMENTOS_VIP_ECRA_EN[0]),
      textoNarracao: sanitizarTextoPublico(TEXTO_VIP_FALADO_EN),
      segmentosEcra: SEGMENTOS_VIP_ECRA_EN.map(sanitizarTextoPublico),
      legendas: {
        tiktok: sanitizarTextoPublico(LEGENDA_VIP_TIKTOK_EN),
        instagram: sanitizarTextoPublico(LEGENDA_VIP_INSTAGRAM_EN),
      },
    };
  }
  return {
    titulo: TITULO_VIP_DIVULGACAO,
    textoEcra: sanitizarTextoPublico(SEGMENTOS_VIP_ECRA[0]),
    textoNarracao: sanitizarTextoPublico(TEXTO_VIP_FALADO),
    segmentosEcra: SEGMENTOS_VIP_ECRA.map(sanitizarTextoPublico),
    legendas: {
      tiktok: sanitizarTextoPublico(LEGENDA_VIP_TIKTOK),
      instagram: sanitizarTextoPublico(LEGENDA_VIP_INSTAGRAM),
    },
  };
}

export interface ConteudoQuarta {
  titulo: string;
  textoEcra: string;
  textoNarracao: string;
  segmentosEcra?: string[];
  legendas: { tiktok: string; instagram: string };
}

export function obterConteudoQuarta(data: string): {
  variante: VarianteQuarta;
  conteudo: ConteudoQuarta;
} {
  const variante = obterVarianteQuarta(data);
  const conteudo =
    variante === 'vip' ? obterConteudoVipDivulgacao() : obterConteudoAfiliados();
  return { variante, conteudo };
}

export const LEGENDA_MOTIVACIONAL_TIKTOK =
  'Precisava disto hoje, talvez tu também ✨\n\n' +
  'Guarda para quando precisares.\n\n' +
  CTA_MOTIVACIONAL_PT + '\n\n' +
  HASHTAGS_MOTIVACIONAL_PT_TIKTOK;

export const LEGENDA_MOTIVACIONAL_TIKTOK_EN =
  'Needed this today, so maybe you do too ✨\n\n' +
  'Save it for later if it hits.\n\n' +
  CTA_MOTIVACIONAL_EN + '\n\n' +
  HASHTAGS_MOTIVACIONAL_EN_TIKTOK;

export const LEGENDA_MOTIVACIONAL_INSTAGRAM =
  'Uma lembrança rápida para quem precisa hoje ✨\n\n' +
  'Guarda este reel. O teu mapa astral tem respostas que ainda não descobriste. 🔮\n\n' +
  CTA_MOTIVACIONAL_PT + '\n\n' +
  HASHTAGS_MOTIVACIONAL_PT_INSTAGRAM;

/** Slot extra (14:00 fuso local) para vídeos especiais seg/qua — não interfere nos 3 horóscopos */
export const SLOT_ESPECIAL_LISBOA = '14:00';
export const SLOT_ESPECIAL_EST = '14:00';

export function obterSlotEspecial(): string {
  return isLocaleUS() ? SLOT_ESPECIAL_EST : SLOT_ESPECIAL_LISBOA;
}
