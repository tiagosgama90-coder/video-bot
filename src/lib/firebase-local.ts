import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const CAMINHO_PADRAO = path.resolve('./firebase-admin.json');

/**
 * Garante que firebase-admin.json existe.
 * Ordem: ficheiro local → FIREBASE_ADMIN_JSON no .env → FIREBASE_ADMIN_JSON_PATH
 */
export function garantirFirebaseAdminJson(): string {
  if (fs.existsSync(CAMINHO_PADRAO)) {
    return CAMINHO_PADRAO;
  }

  const jsonInline = process.env.FIREBASE_ADMIN_JSON?.trim();
  if (jsonInline) {
    JSON.parse(jsonInline);
    fs.writeFileSync(CAMINHO_PADRAO, jsonInline, 'utf8');
    console.log('✅ firebase-admin.json criado a partir de FIREBASE_ADMIN_JSON no .env');
    return CAMINHO_PADRAO;
  }

  const jsonPath = process.env.FIREBASE_ADMIN_JSON_PATH?.trim();
  if (jsonPath && fs.existsSync(jsonPath)) {
    fs.copyFileSync(jsonPath, CAMINHO_PADRAO);
    console.log('✅ firebase-admin.json copiado de FIREBASE_ADMIN_JSON_PATH');
    return CAMINHO_PADRAO;
  }

  throw new Error(
    'firebase-admin.json em falta.\n' +
      '   Opção 1: Cola o JSON do GitHub Secret FIREBASE_ADMIN_JSON no .env:\n' +
      '             FIREBASE_ADMIN_JSON={"type":"service_account",...}\n' +
      '   Opção 2: Guarda o ficheiro como firebase-admin.json na raiz do projeto.\n' +
      '   Opção 3: FIREBASE_ADMIN_JSON_PATH=C:\\caminho\\para\\ficheiro.json no .env',
  );
}

export function carregarServiceAccount(): Record<string, unknown> {
  const caminho = garantirFirebaseAdminJson();
  return JSON.parse(fs.readFileSync(caminho, 'utf8')) as Record<string, unknown>;
}
