import dotenv from 'dotenv';
import { gerarNarracao } from '../src/lib/voz';

dotenv.config();

const textoPt =
  'Lua Crescente: a Lua pede calma e serenidade. Os astros guiam o teu caminho hoje no SidusAstro.';
const textoEn =
  'The Crescent Moon asks for calm and serenity. The stars guide your path today at SidusAstro.';

const texto = process.env.LOCALE === 'en-US' ? textoEn : textoPt;

gerarNarracao(texto, './public/preview-voz.mp3')
  .then(() => {
    console.log('✅ Preview gravado em public/preview-voz.mp3');
  })
  .catch((erro) => {
    console.error('❌ Erro:', erro);
    process.exit(1);
  });
