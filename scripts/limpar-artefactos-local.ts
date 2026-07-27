/**
 * Remove ficheiros temporários de previews (local + cloud agent).
 * Uso: npx ts-node scripts/limpar-artefactos-local.ts
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
const ARTEFACTOS = '/opt/cursor/artifacts';

const PADROES_PUBLIC = [
  /^cosmos-.*\.jpg$/i,
  /^cosmos-preview-.*\.jpg$/i,
  /^preview-cosmos-.*\.jpg$/i,
  /^fundo-.*\.jpg$/i,
  /^fundo-zen-.*\.jpg$/i,
  /^fundo-zen-preview-.*\.jpg$/i,
  /^musica-preview-.*\.mp3$/i,
  /^musica-preview-cosmos-.*\.mp3$/i,
  /^narracao.*\.mp3$/i,
  /^preview-voz\.mp3$/i,
  /^props-temporarias\.json$/i,
];

const PASTAS_ARTEFACTOS = [
  'previews-cosmos',
  'previews-pinterest-reel',
  'preview-cosmos',
];

function apagarFicheiro(ficheiro: string): number {
  if (!fs.existsSync(ficheiro)) {
    return 0;
  }
  const stat = fs.statSync(ficheiro);
  fs.unlinkSync(ficheiro);
  return stat.size;
}

function limparPasta(
  pasta: string,
  filtro?: (nome: string) => boolean,
  preservar?: Set<string>,
): { ficheiros: number; bytes: number } {
  if (!fs.existsSync(pasta)) {
    return { ficheiros: 0, bytes: 0 };
  }

  let ficheiros = 0;
  let bytes = 0;

  for (const entrada of fs.readdirSync(pasta)) {
    if (entrada.startsWith('.')) {
      continue;
    }
    if (preservar?.has(entrada)) {
      continue;
    }

    const caminho = path.join(pasta, entrada);
    const stat = fs.statSync(caminho);

    if (stat.isDirectory()) {
      if (filtro && !filtro(entrada)) {
        continue;
      }
      const sub = limparPasta(caminho);
      ficheiros += sub.ficheiros;
      bytes += sub.bytes;
      if (fs.readdirSync(caminho).length === 0) {
        fs.rmdirSync(caminho);
      }
      continue;
    }

    if (filtro && !filtro(entrada)) {
      continue;
    }

    bytes += apagarFicheiro(caminho);
    ficheiros += 1;
  }

  return { ficheiros, bytes };
}

function formatarMb(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1);
}

function executar(): void {
  let totalFicheiros = 0;
  let totalBytes = 0;

  const publicDir = path.join(ROOT, 'public');
  for (const entrada of fs.readdirSync(publicDir)) {
    if (!PADROES_PUBLIC.some((re) => re.test(entrada))) {
      continue;
    }
    totalBytes += apagarFicheiro(path.join(publicDir, entrada));
    totalFicheiros += 1;
  }

  const output = limparPasta(path.join(ROOT, 'output'));
  totalFicheiros += output.ficheiros;
  totalBytes += output.bytes;

  for (const pasta of PASTAS_ARTEFACTOS) {
    const sub = limparPasta(path.join(ARTEFACTOS, pasta));
    totalFicheiros += sub.ficheiros;
    totalBytes += sub.bytes;
    const dir = path.join(ARTEFACTOS, pasta);
    if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir);
    }
  }

  const artefactos = limparPasta(
    ARTEFACTOS,
    (nome) => /^preview-cosmos-/i.test(nome) || /^musica-preview-cosmos-/i.test(nome),
    new Set(['.cursor', ...PASTAS_ARTEFACTOS]),
  );
  totalFicheiros += artefactos.ficheiros;
  totalBytes += artefactos.bytes;

  console.log(
    `🧹 Limpeza concluída: ${totalFicheiros} ficheiro(s), ${formatarMb(totalBytes)} MB libertados.`,
  );
}

executar();
