import dotenv from 'dotenv';
import { executarAfiliadosQuarta } from './src/lib/executar-afiliados-quarta';
import { inicializarFirebaseSeNecessario } from './src/lib/inicializar-app';

dotenv.config();
inicializarFirebaseSeNecessario();

executarAfiliadosQuarta(true).catch((erro) => {
  console.error('❌ Erro fatal:', erro);
  process.exit(1);
});
