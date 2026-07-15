/* eslint-disable @remotion/deterministic-randomness -- script Node apenas */
import crypto from 'crypto';
import { isLocaleUS } from './locale';

export const TITULO_AFILIADOS = 'SIDUSASTRO';
export const TITULO_AFILIADOS_EN = 'SIDUSASTRO';

export const TEXTO_AFILIADOS_ECRA =
  'SidusAstro | Portal Místico. Descobre o teu Mapa Astral ou junta-te à equipa para ganhares 50% de comissão por cada venda! Acede abaixo 👇';

export const TEXTO_AFILIADOS_ECRA_EN =
  'SidusAstro | Mystic Portal. Get your birth chart or join our team and earn 50% commission on every sale! Link below 👇';

/** Texto falado pela voz (sem emoji, TTS-friendly) */
export const TEXTO_AFILIADOS_FALADO =
  'SidusAstro, Portal Místico. Descobre o teu Mapa Astral ou junta-te à equipa para ganhares cinquenta por cento de comissão por cada venda. Acede abaixo.';

export const TEXTO_AFILIADOS_FALADO_EN =
  'SidusAstro, Mystic Portal. Get your birth chart or join our team and earn fifty percent commission on every sale. Link below.';

export const LEGENDA_AFILIADOS_TIKTOK =
  'Queres ganhar dinheiro na internet sem precisar de investir nada? 🤑💰\n\n' +
  'Lançámos o SidusAstro (sidusastro.com) e estamos a dividir 50% dos lucros com qualquer pessoa que se queira juntar à equipa!\n\n' +
  'Como funciona?\n' +
  '1️⃣ Fazes a tua inscrição gratuita no nosso perfil.\n' +
  '2️⃣ Recebes o teu link exclusivo.\n' +
  '3️⃣ Divulgas onde quiseres.\n' +
  '4️⃣ Sempre que alguém comprar pelo teu link, ganhas METADE do valor direto na tua conta!\n\n' +
  'Não precisas de ter milhares de seguidores, só precisas de querer começar. 🚀\n\n' +
  '👉 COPIA o link da nossa bio e inscreve-te hoje: linktr.ee/sidusastro\n\n' +
  '#rendaextra #afiliados #marketingdeafiliados #ganhardinheiro #trabalharonline #sidusastro #portugal #brasil #dinheiroonline #empreendedorismo';

export const LEGENDA_AFILIADOS_INSTAGRAM =
  'Tu e os teus amigos passam o dia nas redes sociais? Que tal começar a ganhar dinheiro com isso? 💸✨\n\n' +
  'O SidusAstro está oficialmente a recrutar parceiros! Estamos a dividir 50% da comissão de todas as vendas que trouxeres para o nosso site de astrologia. 🔮\n\n' +
  '🚫 Sem taxas de inscrição\n' +
  '🚫 Sem precisar de investir nada\n' +
  '🚫 Não precisas de ter milhares de seguidores\n\n' +
  'Basta fazeres o teu registo gratuito, pegar no teu link exclusivo e começar a partilhar. Tu ficas com metade do lucro de cada subscrição vendida!\n\n' +
  '🔗 Clica no link da nossa bio ou acede a linktr.ee/sidusastro para fazeres a tua inscrição gratuita agora mesmo! 🚀\n\n' +
  '#rendaextra #marketingdeafiliados #afiliados #trabalhoremoto #ganhardinheiroonline #sidusastro #portugal #brasil #parcerias #marketingdigital';

export const LEGENDA_AFILIADOS_TIKTOK_EN =
  'Want to make money online without investing anything? 🤑💰\n\n' +
  'We launched SidusAstro (sidusastro.com/en) and we split 50% of profits with anyone who joins the team!\n\n' +
  'How it works:\n' +
  '1️⃣ Free sign-up on our profile.\n' +
  '2️⃣ Get your exclusive link.\n' +
  '3️⃣ Share anywhere you want.\n' +
  '4️⃣ Every time someone buys through your link, you earn HALF — straight to your account!\n\n' +
  'You don\'t need millions of followers. You just need to start. 🚀\n\n' +
  '👉 Copy the link in our bio and sign up today: sidusastro.com/en\n\n' +
  '#sidehustle #affiliatemarketing #makemoneyonline #passiveincome #sidusastro #astrology #workfromhome #entrepreneur';

export const LEGENDA_AFILIADOS_INSTAGRAM_EN =
  'You and your friends scroll social media all day? What if you got paid for it? 💸✨\n\n' +
  'SidusAstro is officially recruiting partners! We split 50% commission on every sale you bring to our astrology site. 🔮\n\n' +
  '🚫 No sign-up fees\n' +
  '🚫 No investment needed\n' +
  '🚫 No huge following required\n\n' +
  'Free registration, your exclusive link, start sharing. You keep half of every subscription sold!\n\n' +
  '🔗 Link in bio — sidusastro.com/en 🚀\n\n' +
  '#sidehustle #affiliatemarketing #makemoneyonline #sidusastro #astrology #workfromhome #partnerships';

const FRASES_MOTIVACIONAIS = [
  'Hoje não precisas de ter tudo resolvido. Basta dar um passo de cada vez, com calma e com confiança no teu caminho.',
  'Às vezes o universo pede-te pausa, não pressa. Respira, observa e deixa que o dia te mostre o que realmente importa.',
  'Não és a tua última dificuldade. És também tudo o que já superaste — e isso conta mais do que pensas.',
  'A tua sensibilidade não é fraqueza. É a forma como sentes o mundo, e isso também é uma força.',
  'Se hoje estiveres mais cansado, está tudo bem. Amanhã o céu continua lá, e tu também podes recomeçar.',
  'Nem todos os dias brilham igual, e isso é normal. O teu valor não depende do teu melhor momento.',
  'Confia no teu ritmo. Há dias para avançar e dias para cuidar de ti — os dois têm o seu lugar.',
  'O que te move por dentro merece ser ouvido. Presta atenção aos teus sinais, eles guiam-te melhor do que a pressa.',
  'Tu mereces gentileza, sobretudo da parte de quem te olha no espelho todas as manhãs.',
  'Quando tudo parecer demasiado, volta ao simples: uma respiração, um gesto de carinho, um pequeno passo.',
  'Não precisas de provar nada a ninguém hoje. Basta seres honesto contigo e fazer o melhor que conseguires.',
  'Há beleza em recomeçar quantas vezes forem precisas. Cada manhã é uma nova página, não um julgamento.',
  'O teu coração sabe mais do que imaginas. Quando duvidares, escolhe o que te deixa em paz.',
  'Está tudo bem não estar bem. O importante é não ficares sozinho com isso — pede ajuda, fala, respira.',
  'Tu és mais do que um dia difícil. És história, aprendizagem, coragem silenciosa e luz que ainda cresce.',
  'Nem tudo precisa de resposta hoje. Algumas coisas só precisam de tempo, presença e um pouco de fé.',
  'Cuida de ti como cuidarias de alguém que amas. Isso também é força, não egoísmo.',
  'O mundo não precisa que sejas perfeito. Precisa que sejas verdadeiro, e isso já basta.',
  'Se hoje for um dia lento, usa-o para te ouvires. Às vezes a clareza chega quando paramos.',
  'Tu já fizeste coisas difíceis antes, mesmo quando não acreditavas. Lembra-te disso agora.',
  'A tua jornada é tua. Não precisa de parecer com a de mais ninguém para ser válida.',
  'Há esperança em cada pequeno gesto: uma mensagem, um sorriso, um passo fora da zona de conforto.',
  'Não te peças menos do que mereces. E não te cobres mais do que hoje consegues dar.',
  'O céu muda, a vida muda, e tu também podes mudar — sem deixar de seres quem és no essencial.',
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
  'You are not your last hardship. You are also everything you have already overcome — and that counts more than you think.',
  'Your sensitivity is not weakness. It is how you feel the world, and that is a strength too.',
  'If you feel tired today, that is okay. Tomorrow the sky is still there, and you can start again.',
  'Not every day shines the same, and that is normal. Your worth does not depend on your best moment.',
  'Trust your rhythm. Some days are for moving forward, some for self-care — both have their place.',
  'What moves you inside deserves to be heard. Pay attention to your signs; they guide you better than hurry.',
  'You deserve kindness, especially from the person you see in the mirror every morning.',
  'When everything feels like too much, return to the simple: one breath, one kind gesture, one small step.',
  'You do not need to prove anything to anyone today. Just be honest with yourself and do your best.',
  'There is beauty in starting over as many times as you need. Each morning is a new page, not a judgment.',
  'Your heart knows more than you imagine. When you doubt, choose what brings you peace.',
  'It is okay not to be okay. What matters is not carrying it alone — ask for help, talk, breathe.',
  'You are more than one hard day. You are story, learning, quiet courage, and light still growing.',
  'Not everything needs an answer today. Some things just need time, presence, and a little faith.',
  'Take care of yourself the way you would someone you love. That is strength, not selfishness.',
  'The world does not need you to be perfect. It needs you to be real, and that is enough.',
  'If today is a slow day, use it to listen to yourself. Clarity often arrives when we stop.',
  'You have done hard things before, even when you did not believe you could. Remember that now.',
  'Your journey is yours. It does not have to look like anyone else\'s to be valid.',
  'There is hope in every small gesture: a message, a smile, one step outside your comfort zone.',
  'Do not ask less than you deserve. And do not demand more from yourself than you can give today.',
  'The sky changes, life changes, and you can change too — without losing who you are at the core.',
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

/** Produção: uma frase por data (cada segunda é diferente). Local: aleatória a cada execução. */
export function escolherFraseMotivacional(data: string): string {
  const frases = isLocaleUS() ? FRASES_MOTIVACIONAIS_EN : FRASES_MOTIVACIONAIS;
  if (process.env.TESTE_LOCAL === '1') {
    return frases[crypto.randomInt(0, frases.length)];
  }
  const indice = hashTexto('motiv-' + data) % frases.length;
  return frases[indice];
}

export function obterTituloMotivacional(): string {
  return isLocaleUS() ? 'MESSAGE FROM THE COSMOS' : 'MENSAGEM DO COSMOS';
}

export function obterLegendasMotivacional(): { tiktok: string; instagram: string } {
  if (isLocaleUS()) {
    return {
      tiktok: LEGENDA_MOTIVACIONAL_TIKTOK_EN,
      instagram: LEGENDA_MOTIVACIONAL_TIKTOK_EN,
    };
  }
  return {
    tiktok: LEGENDA_MOTIVACIONAL_TIKTOK,
    instagram: LEGENDA_MOTIVACIONAL_INSTAGRAM,
  };
}

export function obterConteudoAfiliados(): {
  titulo: string;
  textoEcra: string;
  textoNarracao: string;
  legendas: { tiktok: string; instagram: string };
} {
  if (isLocaleUS()) {
    return {
      titulo: TITULO_AFILIADOS_EN,
      textoEcra: TEXTO_AFILIADOS_ECRA_EN,
      textoNarracao: TEXTO_AFILIADOS_FALADO_EN,
      legendas: {
        tiktok: LEGENDA_AFILIADOS_TIKTOK_EN,
        instagram: LEGENDA_AFILIADOS_TIKTOK_EN,
      },
    };
  }
  return {
    titulo: TITULO_AFILIADOS,
    textoEcra: TEXTO_AFILIADOS_ECRA,
    textoNarracao: TEXTO_AFILIADOS_FALADO,
    legendas: {
      tiktok: LEGENDA_AFILIADOS_TIKTOK,
      instagram: LEGENDA_AFILIADOS_INSTAGRAM,
    },
  };
}

export const LEGENDA_MOTIVACIONAL_TIKTOK =
  'Uma mensagem do cosmos para o teu dia ✨🔮\n\n' +
  'O céu fala todos os dias — às vezes só precisas de parar para ouvir. 🌙\n\n' +
  'Descobre o teu mapa astral GRÁTIS (Sol, Lua e Ascendente) em sidusastro.com 🔗\n\n' +
  '#astrologia #motivacao #horoscopo #sidusastro #mapaastral #signos #energiapositiva #portugal #brasil #autoconhecimento';

export const LEGENDA_MOTIVACIONAL_TIKTOK_EN =
  'A message from the cosmos for your day ✨🔮\n\n' +
  'The sky speaks every day — sometimes you just need to pause and listen. 🌙\n\n' +
  'Get your FREE birth chart (Sun, Moon & Rising) at sidusastro.com/en 🔗\n\n' +
  '#horoscope #motivation #astrology #sidusastro #birthchart #zodiac #spiritualtiktok #manifestation #selfgrowth';

export const LEGENDA_MOTIVACIONAL_INSTAGRAM =
  'O universo deixa mensagens em cada amanhecer ✨\n\n' +
  'Guarda esta frase. Volta a ela quando precisares de lembrar quem és. 🌟\n\n' +
  '✨ Mapa astral GRÁTIS\n' +
  '☀️ Sol · 🌙 Lua · ⬆️ Ascendente\n' +
  '👆 Link na bio — sidusastro.com\n\n' +
  '#astrologia #motivacao #horoscopo #sidusastro #mapaastral #reels #astrologiapt #autoconhecimento #frases #inspiracao';

/** Slot extra (14:00 fuso local) para vídeos especiais seg/qua — não interfere nos 3 horóscopos */
export const SLOT_ESPECIAL_LISBOA = '14:00';
export const SLOT_ESPECIAL_EST = '14:00';

export function obterSlotEspecial(): string {
  return isLocaleUS() ? SLOT_ESPECIAL_EST : SLOT_ESPECIAL_LISBOA;
}
