/* eslint-disable @remotion/deterministic-randomness -- script Node apenas */
import crypto from 'crypto';

export const TEXTO_AFILIADOS_FALADO =
  'Se estás no TikTok e queres ganhar dinheiro sem precisar de investir nada, este vídeo é para ti. ' +
  'Nós lançámos o site sidusastro.com e estamos a dividir cinquenta por cento dos nossos lucros com qualquer pessoa que queira trabalhar connosco. ' +
  'O processo é muito simples. Tu fazes a tua inscrição gratuita, recebes um link exclusivo teu e divulgas onde quiseres. ' +
  'Sempre que alguém comprar através do teu link, tu ganhas metade do valor da venda de forma automática. ' +
  'Não precisas de ter milhares de seguidores, basta querer começar. ' +
  'Clica no link do nosso perfil e junta-te à equipa hoje mesmo.';

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
  'Os astros não determinam o teu destino — iluminam o caminho. Cada dia é uma nova oportunidade para alinhar intenção e acção. Confia no teu ritmo cósmico.',
  'Quando o céu parece pesado, lembra-te: até a Lua tem fases. O escuro também passa. O teu mapa astral guarda forças que ainda não descobriste.',
  'Tu és feito de poeira de estrelas. Não precisas de provar nada ao universo — só de honrar quem já és. Hoje, escolhe uma pequena coragem.',
  'A energia que procuras fora já vive dentro de ti. A astrologia é um espelho, não uma prisão. Usa-a para te conheceres melhor.',
  'Cada trânsito traz uma lição. Nem todas são fáceis, mas todas te preparam para a versão de ti que o cosmos já vê.',
  'O Sol nasce todos os dias sem pedir permissão. Tu também podes recomeçar, quantas vezes forem precisas.',
  'As estrelas sussurram o que o barulho do dia esconde: calma, presença e confiança. Respira fundo e segue.',
  'O teu signo é só o começo da história. Sol, Lua e Ascendente contam o resto — e tu escreves o final em sidusastro.com.',
];

export function escolherFraseMotivacional(data: string): string {
  let hash = 0;
  const seed = 'motiv-' + data;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return FRASES_MOTIVACIONAIS[hash % FRASES_MOTIVACIONAIS.length];
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

export function escolherTipoMusicaEspecial(): 'zen' | 'mistico' | 'viral' {
  const tipos: Array<'zen' | 'mistico' | 'viral'> = ['zen', 'mistico', 'viral'];
  return tipos[crypto.randomInt(0, tipos.length)];
}
