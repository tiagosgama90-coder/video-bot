import dotenv from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { uploadVideoPublico, publicarVideoNoCanal, resolverCanaisPublicacao } from './src/lib/buffer';
import path from 'path';
import fs from 'fs';

dotenv.config();

if (getApps().length === 0) {
  initializeApp({
    credential: cert(require('./firebase-admin.json')),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

async function main(): Promise<void> {
  const videos = fs.readdirSync('./output').filter((f) => f.endsWith('.mp4'));
  if (videos.length === 0) {
    throw new Error('Nenhum video em output/ — corre npm run gerar primeiro');
  }

  const ficheiro = videos[0];
  const signo = ficheiro.replace('-diario.mp4', '');
  const data = new Date().toISOString().slice(0, 10);

  console.log('Teste upload + Buffer com:', ficheiro);

  const canais = await resolverCanaisPublicacao();
  console.log('Canais:', canais.map((c) => c.service + '=' + c.name).join(', '));

  const url = await uploadVideoPublico(path.resolve('./output/' + ficheiro), signo, data);
  console.log('URL:', url);

  const legendaTeste = 'Teste SidusAstro bot — ignorar se receberes isto.';

  for (const canal of canais) {
    console.log('A publicar teste em', canal.service, '...');
    const postId = await publicarVideoNoCanal(canal, legendaTeste, url);
    console.log('✅ Buffer OK [' + canal.service + '] — Post ID:', postId);
  }
}

main().catch((e) => {
  console.error('❌ FALHOU:', e);
  process.exit(1);
});
