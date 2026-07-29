/* eslint-disable @remotion/deterministic-randomness -- script Node apenas */
import crypto from 'crypto';
import {
  CTA_COMENTARIO_INSTAGRAM_EN,
  CTA_COMENTARIO_INSTAGRAM_PT,
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

export const TITULO_VIP_DIVULGACAO = 'SEU PREMIUM VITALÍCIO';
export const TITULO_VIP_DIVULGACAO_EN = 'YOUR LIFETIME PREMIUM';

/** Texto no ecrã - curto e natural */
export const SEGMENTOS_VIP_ECRA = [
  'Premium vitalício? Mais simples do que você imagina',
  'Mapa astral + tarot + oráculo - só compartilhar',
  'Marca @sidusastro → sidusastro.com/pt/divulgacao-vip',
];

export const SEGMENTOS_VIP_ECRA_EN = [
  'Lifetime Premium? Easier than you think',
  'Birth chart + tarot + oracle - just share',
  'Tag @sidusastro → sidusastro.com/en/divulgacao-vip',
];

/** Narração TTS curta (~25-30s) */
export const TEXTO_VIP_FALADO =
  'Imagina ter o SidusAstro completo para sempre, só por compartilhar o que você já usa. ' +
  'Mapa astral, tarot ilimitado e oráculo sem restrições. ' +
  'Grave um vídeo curto, marque arroba sidusastro, e envie o pedido em sidusastro.com barra pt barra divulgacao-vip. ' +
  'Em até quarenta e oito horas o Premium fica na sua conta.';

export const TEXTO_VIP_FALADO_EN =
  'Imagine getting full SidusAstro access forever, just by sharing what you already use. ' +
  'Birth chart, unlimited tarot and oracle without limits. ' +
  'Record a short video, tag at sidusastro, and submit at sidusastro.com slash en slash divulgacao-vip. ' +
  'Lifetime Premium lands on your account within forty-eight hours.';

export const LEGENDA_VIP_TIKTOK =
  'Ok, isso é real: você pode ter Premium vitalício no SidusAstro só por compartilhar ✨\n\n' +
  'Grave um vídeo com o mapa, tarot ou oráculo, marque @sidusastro e envie o pedido.\n\n' +
  'Resposta em até 48h 👇\n\n' +
  CTA_VIP_PT + '\n\n' +
  HASHTAGS_VIP_PT_TIKTOK;

export const LEGENDA_VIP_INSTAGRAM =
  'Se você já ama o SidusAstro, isso pode interessar ✨\n\n' +
  'Compartilhe um vídeo, marque @sidusastro e você pode ficar com Premium vitalício - mapa astral, tarot e oráculo.\n\n' +
  'Resposta em até 48h 👇\n\n' +
  CTA_COMENTARIO_INSTAGRAM_PT +
  '\n\n' +
  CTA_VIP_PT +
  '\n\n' +
  HASHTAGS_VIP_PT_INSTAGRAM;

export const LEGENDA_VIP_TIKTOK_EN =
  'Okay this is real: you can get lifetime Premium on SidusAstro just by sharing ✨\n\n' +
  'Post a short video with your chart, tarot or oracle, tag @sidusastro and submit.\n\n' +
  'Usually within 48 hours 👇\n\n' +
  CTA_VIP_EN + '\n\n' +
  HASHTAGS_VIP_EN_TIKTOK;

export const LEGENDA_VIP_INSTAGRAM_EN =
  'If you already love SidusAstro, this one is for you ✨\n\n' +
  'Share a video, tag @sidusastro and you can unlock lifetime Premium - birth chart, tarot and oracle.\n\n' +
  'Usually within 48 hours 👇\n\n' +
  CTA_COMENTARIO_INSTAGRAM_EN +
  '\n\n' +
  CTA_VIP_EN +
  '\n\n' +
  HASHTAGS_VIP_EN_INSTAGRAM;

export const TITULO_AFILIADOS = 'GANHA COM O CÉU';
export const TITULO_AFILIADOS_EN = 'EARN WITH THE STARS';

export const TEXTO_AFILIADOS_ECRA =
  'SidusAstro | Portal Místico. Descubra seu Mapa Astral ou junte-se à equipe para ganhar 50% de comissão por cada venda! Acesse abaixo 👇';

export const TEXTO_AFILIADOS_ECRA_EN =
  'SidusAstro | Mystic Portal. Get your birth chart or join our team and earn 50% commission on every sale! Link below 👇';

export const TEXTO_AFILIADOS_FALADO =
  'SidusAstro, Portal Místico. Descubra seu Mapa Astral ou junte-se à equipe para ganhar cinquenta por cento de comissão por cada venda. Acesse abaixo.';

export const TEXTO_AFILIADOS_FALADO_EN =
  'SidusAstro, Mystic Portal. Get your birth chart or join our team and earn fifty percent commission on every sale. Link below.';

export const LEGENDA_AFILIADOS_TIKTOK =
  'Se você gosta de astrologia e quer ganhar com isso, isso é para você 💸\n\n' +
  'No SidusAstro você pode levar 50% de comissão por cada venda. Cadastro grátis, link seu, compartilhe onde quiser.\n\n' +
  CTA_AFILIADOS_PT + '\n\n' +
  HASHTAGS_AFILIADOS_PT_TIKTOK;

export const LEGENDA_AFILIADOS_INSTAGRAM =
  'Gosta de falar de signos? Você pode ganhar com isso ✨\n\n' +
  'Programa de afiliados SidusAstro: 50% de comissão em cada venda. Sem taxas, sem investimento, link exclusivo seu.\n\n' +
  CTA_COMENTARIO_INSTAGRAM_PT +
  '\n\n' +
  CTA_AFILIADOS_PT +
  '\n\n' +
  HASHTAGS_AFILIADOS_PT_INSTAGRAM;

export const LEGENDA_AFILIADOS_TIKTOK_EN =
  'If you love astrology and want to earn from it, this is for you 💸\n\n' +
  'At SidusAstro you can get 50% commission on every sale. Free sign-up, your link, share anywhere.\n\n' +
  CTA_AFILIADOS_EN + '\n\n' +
  HASHTAGS_AFILIADOS_EN_TIKTOK;

export const LEGENDA_AFILIADOS_INSTAGRAM_EN =
  'Love talking about the zodiac? You can earn from it ✨\n\n' +
  'SidusAstro affiliate program: 50% commission on every sale. No fees, no investment, your exclusive link.\n\n' +
  CTA_COMENTARIO_INSTAGRAM_EN +
  '\n\n' +
  CTA_AFILIADOS_EN +
  '\n\n' +
  HASHTAGS_AFILIADOS_EN_INSTAGRAM;

const FRASES_MOTIVACIONAIS = [
  'Hoje você não precisa ter tudo resolvido. Basta dar um passo de cada vez, com calma e com confiança no seu caminho.',
  'Às vezes o universo pede pausa, não pressa. Respire, observe e deixe que o dia mostre o que realmente importa.',
  'Você não é a sua última dificuldade. Você é também tudo o que já superou - e isso conta mais do que imagina.',
  'Sua sensibilidade não é fraqueza. É a forma como você sente o mundo, e isso também é uma força.',
  'Se hoje você estiver mais cansado, está tudo bem. Amanhã o céu continua lá, e você também pode recomeçar.',
  'Nem todos os dias brilham igual, e isso é normal. Seu valor não depende do seu melhor momento.',
  'Confie no seu ritmo. Há dias para avançar e dias para cuidar de você - os dois têm o seu lugar.',
  'O que te move por dentro merece ser ouvido. Preste atenção aos seus sinais, eles guiam melhor do que a pressa.',
  'Você merece gentileza, sobretudo da parte de quem te olha no espelho todas as manhãs.',
  'Quando tudo parecer demais, volte ao simples: uma respiração, um gesto de carinho, um pequeno passo.',
  'Você não precisa provar nada a ninguém hoje. Basta ser honesto consigo e fazer o melhor que conseguir.',
  'Há beleza em recomeçar quantas vezes forem precisas. Cada manhã é uma nova página, não um julgamento.',
  'Seu coração sabe mais do que imagina. Quando duvidar, escolha o que te deixa em paz.',
  'Está tudo bem não estar bem. O importante é não ficar sozinho com isso - peça ajuda, fale, respire.',
  'Você é mais do que um dia difícil. Você é história, aprendizado, coragem silenciosa e luz que ainda cresce.',
  'Nem tudo precisa de resposta hoje. Algumas coisas só precisam de tempo, presença e um pouco de fé.',
  'Cuide de você como cuidaria de alguém que ama. Isso também é força, não egoísmo.',
  'O mundo não precisa que você seja perfeito. Precisa que você seja verdadeiro, e isso já basta.',
  'Se hoje for um dia lento, use-o para se ouvir. Às vezes a clareza chega quando paramos.',
  'Você já fez coisas difíceis antes, mesmo quando não acreditava. Lembre-se disso agora.',
  'Sua jornada é sua. Não precisa parecer com a de mais ninguém para ser válida.',
  'Há esperança em cada pequeno gesto: uma mensagem, um sorriso, um passo fora da zona de conforto.',
  'Não peça menos do que merece. E não cobre de si mais do que hoje consegue dar.',
  'O céu muda, a vida muda, e você também pode mudar - sem deixar de ser quem é no essencial.',
  'Quando o dia pesar, lembre-se: até a noite mais longa acaba. Você também vai encontrar luz outra vez.',
  'Ser gentil consigo hoje é um ato de coragem. Não subestime isso.',
  'Você não está atrasado. Está no seu tempo, e seu tempo também tem valor.',
  'O que te inspira merece espaço. Proteja o que te faz bem, mesmo que seja só um momento de silêncio.',
  'Você não precisa carregar tudo sozinho. Compartilhar o peso também é caminhar.',
  'Hoje pode ser um bom dia para escolher o que te faz bem, mesmo que seja algo pequeno.',
  'Sua presença no mundo importa, mesmo nos dias em que você se sente pequeno.',
  'Às vezes o melhor plano é descansar, reorganizar e voltar com mais calma amanhã.',
  'Não confunda calma com desistência. Às vezes calma é exatamente o que vai te salvar.',
  'Você é capaz de dias bonitos e de dias duros. Os dois fazem parte de quem você está construindo.',
  'Se precisar de um sinal hoje, fique com este: continue. Suavemente, mas continue.',
  'Há futuro em você que ainda não viu. Dê tempo ao tempo sem deixar de se mover.',
  'Seu esforço silencioso também conta. Nem tudo precisa ser visto para ser real.',
  'Escolha hoje uma coisa que te traga paz. Só uma já pode mudar o tom do dia.',
  'Você merece dias mais leves. E pode começar por ser mais leve consigo.',
  'Não se compare com o highlight de ninguém. Sua vida real também merece cuidado.',
  'Quando tiver medo, não precisa vencê-lo de uma vez. Pode caminhar com ele, devagar.',
  'Há força em pedir tempo, em dizer não, em escolher o que faz sentido para você.',
  'O universo não pede perfeição. Pede presença, honestidade e um coração aberto.',
  'Se hoje fizer sol por dentro, aproveite. Se não fizer, crie um raio de luz pequeno.',
  'Você é mais resiliente do que seu medo diz. Já provou isso antes.',
  'Deixe que hoje seja suficiente. Não precisa ser extraordinário para ter valor.',
  'Sua história ainda está sendo escrita. Este capítulo também pode ser bonito.',
  'Confie: há dias melhores a caminho, e você está aprendendo o que precisa para recebê-los.',
  'No fim, o que fica é como você se tratou e tratou os outros. Hoje, escolha gentileza.',
  'Respire. Você está aqui. E isso, por si só, já é um começo.',
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

const ETIQUETAS_GANCHO_MOTIVACIONAL_PT = [
  'PARA QUEM PAROU O SCROLL',
  'ISSO É PRA VOCÊ',
  'O CÉU MANDOU ISSO',
  'NÃO É COINCIDÊNCIA',
  'RESPIRA FUNDO',
  'SALVE ESTE REEL',
  'PARA QUEM PRECISAVA',
  'O UNIVERSO FALA',
] as const;

const ETIQUETAS_GANCHO_MOTIVACIONAL_EN = [
  'FOR WHOEVER NEEDED THIS',
  'THIS IS FOR YOU',
  'THE COSMOS SENT THIS',
  'NOT A COINCIDENCE',
  'READ THIS CAREFULLY',
  'SAVE THIS REEL',
  'IF YOU NEEDED A SIGN',
  'THE UNIVERSE SPEAKS',
] as const;

/** Etiqueta curta no ecrã (substitui "MOTIVAÇÃO" / "MENSAGEM DO COSMOS") */
export function obterEtiquetaGanchoMotivacional(
  data: string,
  variante: 'segunda' | 'quinta' = 'segunda',
): string {
  const etiquetas = isLocaleUS() ? ETIQUETAS_GANCHO_MOTIVACIONAL_EN : ETIQUETAS_GANCHO_MOTIVACIONAL_PT;
  const indice = hashTexto('etiqueta-motiv-' + variante + '-' + data) % etiquetas.length;
  return etiquetas[indice];
}

/** @deprecated usar obterEtiquetaGanchoMotivacional */
export function obterTituloMotivacional(): string {
  return obterEtiquetaGanchoMotivacional('1970-01-01', 'segunda');
}

function prefixoInstagramMotivacional(): string {
  return isLocaleUS()
    ? '✨ A message for your day\n\n'
    : '✨ Uma mensagem para o seu dia\n\n';
}

export function obterLegendasMotivacional(
  gancho: string,
  frase: string,
): { tiktok: string; instagram: string } {
  const hook = sanitizarTextoPublico(gancho);
  const corpo = sanitizarTextoPublico(frase);
  const resumo = corpo.length > 95 ? corpo.slice(0, 92).trim() + '...' : corpo;

  if (isLocaleUS()) {
    return {
      tiktok: sanitizarTextoPublico(
        hook + '\n\n' + resumo + '\n\n' + CTA_MOTIVACIONAL_EN + '\n\n' + HASHTAGS_MOTIVACIONAL_EN_TIKTOK,
      ),
      instagram: sanitizarTextoPublico(
        prefixoInstagramMotivacional() +
          hook +
          '\n\n' +
          resumo +
          '\n\n' +
          CTA_COMENTARIO_INSTAGRAM_EN +
          '\n\n' +
          CTA_MOTIVACIONAL_EN +
          '\n\n' +
          HASHTAGS_MOTIVACIONAL_EN_INSTAGRAM,
      ),
    };
  }
  return {
    tiktok: sanitizarTextoPublico(
      hook + '\n\n' + resumo + '\n\n' + CTA_MOTIVACIONAL_PT + '\n\n' + HASHTAGS_MOTIVACIONAL_PT_TIKTOK,
    ),
    instagram: sanitizarTextoPublico(
      prefixoInstagramMotivacional() +
        hook +
        '\n\n' +
        resumo +
        '\n\n' +
        CTA_COMENTARIO_INSTAGRAM_PT +
        '\n\n' +
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
  'Precisava disso hoje, talvez você também ✨\n\n' +
  'Salve para quando precisar.\n\n' +
  CTA_MOTIVACIONAL_PT + '\n\n' +
  HASHTAGS_MOTIVACIONAL_PT_TIKTOK;

export const LEGENDA_MOTIVACIONAL_TIKTOK_EN =
  'Needed this today, so maybe you do too ✨\n\n' +
  'Save it for later if it hits.\n\n' +
  CTA_MOTIVACIONAL_EN + '\n\n' +
  HASHTAGS_MOTIVACIONAL_EN_TIKTOK;

export const LEGENDA_MOTIVACIONAL_INSTAGRAM =
  'Uma lembrança rápida para quem precisa hoje ✨\n\n' +
  'Salve este reel. Seu mapa astral tem respostas que você ainda não descobriu. 🔮\n\n' +
  CTA_MOTIVACIONAL_PT + '\n\n' +
  HASHTAGS_MOTIVACIONAL_PT_INSTAGRAM;

/** Slot extra (14:00 fuso local) para vídeos especiais seg/qua — não interfere nos 3 horóscopos */
export const SLOT_ESPECIAL_LISBOA = '14:00';
export const SLOT_ESPECIAL_EST = '14:00';

export function obterSlotEspecial(): string {
  return isLocaleUS() ? SLOT_ESPECIAL_EST : SLOT_ESPECIAL_LISBOA;
}
