/* eslint-disable @remotion/deterministic-randomness -- script Node apenas */
import crypto from 'crypto';

export const TITULO_AFILIADOS = 'SIDUSASTRO';

export const TEXTO_AFILIADOS_ECRA =
  'SidusAstro | Portal Místico. Descobre o teu Mapa Astral ou junta-te à equipa para ganhares 50% de comissão por cada venda! Acede abaixo 👇';

/** Texto falado pela voz (sem emoji, TTS-friendly) */
export const TEXTO_AFILIADOS_FALADO =
  'SidusAstro, Portal Místico. Descobre o teu Mapa Astral ou junta-te à equipa para ganhares cinquenta por cento de comissão por cada venda. Acede abaixo.';

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

function hashTexto(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Produção: uma frase por data (cada segunda é diferente). Local: aleatória a cada execução. */
export function escolherFraseMotivacional(data: string): string {
  if (process.env.TESTE_LOCAL === '1') {
    return FRASES_MOTIVACIONAIS[crypto.randomInt(0, FRASES_MOTIVACIONAIS.length)];
  }
  const indice = hashTexto('motiv-' + data) % FRASES_MOTIVACIONAIS.length;
  return FRASES_MOTIVACIONAIS[indice];
}

export const LEGENDA_MOTIVACIONAL_TIKTOK =
  'Uma mensagem do cosmos para o teu dia ✨🔮\n\n' +
  'O céu fala todos os dias — às vezes só precisas de parar para ouvir. 🌙\n\n' +
  'Descobre o teu mapa astral GRÁTIS (Sol, Lua e Ascendente) em sidusastro.com 🔗\n\n' +
  '#astrologia #motivacao #horoscopo #sidusastro #mapaastral #signos #energiapositiva #portugal #brasil #autoconhecimento';

export const LEGENDA_MOTIVACIONAL_INSTAGRAM =
  'O universo deixa mensagens em cada amanhecer ✨\n\n' +
  'Guarda esta frase. Volta a ela quando precisares de lembrar quem és. 🌟\n\n' +
  '✨ Mapa astral GRÁTIS\n' +
  '☀️ Sol · 🌙 Lua · ⬆️ Ascendente\n' +
  '👆 Link na bio — sidusastro.com\n\n' +
  '#astrologia #motivacao #horoscopo #sidusastro #mapaastral #reels #astrologiapt #autoconhecimento #frases #inspiracao';

/** Slot extra (14:00 Lisboa) para vídeos especiais seg/qua — não interfere nos 3 horóscopos */
export const SLOT_ESPECIAL_LISBOA = '14:00';
