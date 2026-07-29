import dotenv from 'dotenv';
import {
  diasRetencaoCloudinary,
  limparCloudinaryAntigos,
} from '../src/lib/storage-video';

dotenv.config();

if (!process.env.CLOUDINARY_CLOUD_NAME?.trim()) {
  console.error('CLOUDINARY_CLOUD_NAME não definido — nada a limpar.');
  process.exit(1);
}

console.log('Retenção de vídeos: ' + diasRetencaoCloudinary() + ' dias');

limparCloudinaryAntigos()
  .then((resultado) => {
    console.log('Concluído:', resultado.apagados + ' apagado(s), ~' + resultado.megabytes + ' MB');
  })
  .catch((erro: unknown) => {
    console.error(erro instanceof Error ? erro.message : erro);
    process.exit(1);
  });
