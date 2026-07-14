import dotenv from 'dotenv';
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { carregarServiceAccount } from './firebase-local';

dotenv.config();

export function inicializarFirebase(): App {
  const existente = getApps()[0];
  if (existente) {
    return existente;
  }

  const serviceAccount = carregarServiceAccount();
  return initializeApp({
    credential: cert(serviceAccount as Parameters<typeof cert>[0]),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

/** Só inicializa Firebase se for publicar ou precisar do Firestore */
export function inicializarFirebaseSeNecessario(opcoes?: { obrigatorio?: boolean }): void {
  if (process.env.SKIP_PUBLICAR === '1' && !opcoes?.obrigatorio) {
    console.log('⏭️ SKIP_PUBLICAR=1 — Firebase não necessário para este teste.');
    return;
  }
  inicializarFirebase();
}
