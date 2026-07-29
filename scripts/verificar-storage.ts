import dotenv from 'dotenv';
import { inicializarFirebaseSeNecessario } from '../src/lib/inicializar-app';
import { verificarGravacaoStorage } from '../src/lib/storage-video';

dotenv.config();
inicializarFirebaseSeNecessario();

verificarGravacaoStorage()
  .then((provedor: string) => {
    console.log('✅ Storage pronto (' + provedor + ') — pode renderizar vídeos.\n');
  })
  .catch((erro: unknown) => {
    console.error(erro instanceof Error ? erro.message : erro);
    process.exit(1);
  });
