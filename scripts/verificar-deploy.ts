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
exigirTexto('./src/lib/horoscopoSite.ts', 'pequenos passos', 'Filtro texto placeholder IA');

exigirFicheiro('./gerar-video-segunda.ts');
exigirTexto('./gerar-video-segunda.ts', 'escolherFraseMotivacional', 'Segunda: frase motivacional');
exigirTexto('./gerar-video-segunda.ts', 'SLOT_MUSICA.MOTIVACIONAL_SEGUNDA', 'Segunda: slot música');
exigirTexto('./src/lib/conteudo-especial.ts', 'SLOT_ESPECIAL_LISBOA', 'Slot especial Lisboa');

exigirFicheiro('./gerar-video-quarta.ts');
exigirTexto('./gerar-video-quarta.ts', 'obterConteudoVipDivulgacao', 'Quarta: conteúdo VIP divulgação');
exigirTexto('./gerar-video-quarta.ts', 'fundoZenAstrologia: true', 'Quarta: fundo zen');
exigirTexto('./gerar-video-quarta.ts', 'SLOT_MUSICA.VIP_DIVULGACAO_QUARTA', 'Quarta: slot música');
exigirTexto('./src/lib/conteudo-especial.ts', "export const TITULO_VIP_DIVULGACAO = 'VIP POR DIVULGAÇÃO'", 'VIP: título');

exigirFicheiro('./gerar-video-quinta.ts');
exigirTexto('./gerar-video-quinta.ts', 'escolherFraseMotivacional', 'Quinta: frase motivacional');
exigirTexto('./gerar-video-quinta.ts', 'SLOT_MUSICA.MOTIVACIONAL_QUINTA', 'Quinta: slot música');
exigirTexto('./gerar-video-quinta.ts', "escolherFraseMotivacional(data, 'quinta')", 'Quinta: variante frase');

exigirFicheiro('./.github/workflows/diario.yml');
exigirTexto('./.github/workflows/diario.yml', 'workflow_dispatch', 'Diário: disparo externo');
const diarioWorkflow = fs.readFileSync('./.github/workflows/diario.yml', 'utf8');
if (/^\s*schedule:\s*$/m.test(diarioWorkflow) || diarioWorkflow.includes("cron: '")) {
  throw new Error('diario.yml: remover cron GitHub — usar cron-job.org (scripts/configurar-cron-externo.sh)');
}
exigirFicheiro('./.github/workflows/segunda.yml');
exigirTexto('./.github/workflows/segunda.yml', 'workflow_dispatch', 'Segunda: disparo externo');
const segundaWorkflow = fs.readFileSync('./.github/workflows/segunda.yml', 'utf8');
if (/^\s*schedule:\s*$/m.test(segundaWorkflow) || segundaWorkflow.includes("cron: '")) {
  throw new Error('segunda.yml: remover cron GitHub — usar cron-job.org');
}

exigirFicheiro('./.github/workflows/quarta.yml');
exigirTexto('./.github/workflows/quarta.yml', 'workflow_dispatch', 'Quarta: disparo externo');
const quartaWorkflow = fs.readFileSync('./.github/workflows/quarta.yml', 'utf8');
if (/^\s*schedule:\s*$/m.test(quartaWorkflow) || quartaWorkflow.includes("cron: '")) {
  throw new Error('quarta.yml: remover cron GitHub — usar cron-job.org');
}

exigirFicheiro('./.github/workflows/quinta.yml');
exigirTexto('./.github/workflows/quinta.yml', 'workflow_dispatch', 'Quinta: disparo externo');
const quintaWorkflow = fs.readFileSync('./.github/workflows/quinta.yml', 'utf8');
if (/^\s*schedule:\s*$/m.test(quintaWorkflow) || quintaWorkflow.includes("cron: '")) {
  throw new Error('quinta.yml: remover cron GitHub — usar cron-job.org');
}

exigirFicheiro('./.github/workflows/quinta-us.yml');
exigirTexto('./.github/workflows/quinta-us.yml', 'workflow_dispatch', 'Quinta US: disparo externo');

console.log('✅ Todos os scripts e workflows estão actualizados para produção.');
