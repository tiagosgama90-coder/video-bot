import fs from 'fs';

function exigirFicheiro(ficheiro: string): void {
  if (!fs.existsSync(ficheiro)) {
    throw new Error(`Ficheiro em falta: ${ficheiro}`);
  }
}

function exigirTexto(ficheiro: string, trecho: string, etiqueta: string): void {
  const texto = fs.readFileSync(ficheiro, 'utf8');
  if (!texto.includes(trecho)) {
    throw new Error(`${etiqueta}: "${trecho}" não encontrado em ${ficheiro}`);
  }
}

console.log('🔍 A verificar scripts para produção...');
if (process.env.GITHUB_SHA) {
  console.log('📌 Commit:', process.env.GITHUB_SHA.slice(0, 7));
}

exigirFicheiro('./gerar-e-publicar.ts');
exigirTexto('./gerar-e-publicar.ts', 'extrairAteSegundoPontoFinal', 'Horóscopo: 2 frases IA');
exigirTexto('./gerar-e-publicar.ts', 'escolherFechoNarracao', 'Horóscopo: frase final');
exigirTexto('./gerar-e-publicar.ts', 'fechoEcra', 'Horóscopo: fecho no ecrã');

exigirFicheiro('./src/lib/horoscopoSite.ts');
exigirTexto('./src/lib/horoscopoSite.ts', 'apiTextoValidoParaHoroscopo', 'Pack IA Firestore');
const horoscopoSite = fs.readFileSync('./src/lib/horoscopoSite.ts', 'utf8');
if (horoscopoSite.includes('sua|você|voce|seu|sua')) {
  throw new Error('Filtro PT-BR ainda rejeita pack IA do site');
}

exigirFicheiro('./gerar-video-segunda.ts');
exigirTexto('./gerar-video-segunda.ts', 'escolherFraseMotivacional', 'Segunda: frase motivacional');
exigirTexto('./gerar-video-segunda.ts', 'SLOT_ESPECIAL_LISBOA', 'Segunda: slot 14:00');

exigirFicheiro('./gerar-video-quarta.ts');
exigirTexto('./gerar-video-quarta.ts', 'TITULO_AFILIADOS', 'Quarta: título afiliados');
exigirTexto('./gerar-video-quarta.ts', 'fundoZenAstrologia: true', 'Quarta: fundo zen');
exigirTexto('./src/lib/conteudo-especial.ts', "export const TITULO_AFILIADOS = 'SIDUSASTRO'", 'Afiliados: SIDUSASTRO');

exigirFicheiro('./.github/workflows/diario.yml');
exigirTexto('./.github/workflows/diario.yml', 'workflow_dispatch', 'Diário: disparo externo');
const diarioWorkflow = fs.readFileSync('./.github/workflows/diario.yml', 'utf8');
if (/^\s*schedule:\s*$/m.test(diarioWorkflow) || diarioWorkflow.includes("cron: '")) {
  throw new Error('diario.yml: remover cron GitHub — usar cron-job.org (scripts/configurar-cron-externo.sh)');
}
exigirFicheiro('./.github/workflows/segunda.yml');
exigirFicheiro('./.github/workflows/quarta.yml');

console.log('✅ Todos os scripts e workflows estão actualizados para produção.');
