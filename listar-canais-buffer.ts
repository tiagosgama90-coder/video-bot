import dotenv from 'dotenv';
import { imprimirCanaisBuffer } from './src/lib/buffer';

dotenv.config();

imprimirCanaisBuffer().catch((erro) => {
  console.error('Erro ao listar canais Buffer:', erro);
  process.exit(1);
});
