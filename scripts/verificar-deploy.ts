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
exigirFicheiro('./src/lib/afiliados-dia.ts');
exigirTexto('./src/lib/afiliados-dia.ts', 'SLOT_AFILIADOS_MANHA', 'Afiliados: slot manhã 09:00');
exigirTexto('./src/lib/dia-semana.ts', 'DIAS_AFILIADOS', 'Afiliados: terças e sábados');
exigirTexto('./gerar-e-publicar.ts', 'extrairAteSegundoPontoFinal', 'Horóscopo: 2 frases IA');
exigirTexto('./gerar-e-publicar.ts', 'gerarAfiliadosManha', 'Diário: afiliados ter/sáb @09:00');
exigirTexto('./gerar-e-publicar.ts', 'HOROSCOPOS_EM_DIA_AFILIADOS', 'Diário: 2 horóscopos em dia afiliados');
exigirTexto('./gerar-e-publicar.ts', 'escolherFechoNarracao', 'Horóscopo: frase final');
exigirTexto('./gerar-e-publicar.ts', 'fechoEcra', 'Horóscopo: fecho no ecrã');

exigirFicheiro('./src/lib/horoscopoSite.ts');
exigirTexto('./src/lib/horoscopoSite.ts', 'apiTextoValidoParaHoroscopo', 'Pack IA Firestore');
exigirTexto('./src/lib/horoscopoSite.ts', 'pequenos passos', 'Filtro texto placeholder IA');

exigirFicheiro('./gerar-video-vip-divulgacao.ts');
exigirTexto('./gerar-video-vip-divulgacao.ts', 'exigirDiasVipDivulgacao', 'VIP: dias seg/qua/sex/dom');
exigirTexto('./gerar-video-vip-divulgacao.ts', 'obterConteudoVipDivulgacao', 'VIP: conteúdo divulgação');

exigirFicheiro('./.github/workflows/vip-divulgacao.yml');
exigirTexto('./.github/workflows/vip-divulgacao.yml', 'gerar-video-vip-divulgacao.ts', 'Workflow VIP PT');
exigirFicheiro('./.github/workflows/vip-divulgacao-us.yml');
exigirTexto('./.github/workflows/vip-divulgacao-us.yml', 'gerar-video-vip-divulgacao.ts', 'Workflow VIP US');

exigirFicheiro('./gerar-video-segunda.ts');
exigirTexto('./gerar-video-segunda.ts', 'escolherFraseMotivacional', 'Segunda: frase motivacional');
exigirTexto('./gerar-video-segunda.ts', 'SLOT_MUSICA.MOTIVACIONAL_SEGUNDA', 'Segunda: slot música');
exigirTexto('./src/lib/conteudo-especial.ts', 'SLOT_ESPECIAL_LISBOA', 'Slot especial Lisboa');

exigirFicheiro('./gerar-video-quarta.ts');
exigirTexto('./gerar-video-quarta.ts', 'obterConteudoQuarta', 'Quarta: alternância afiliados/VIP');
exigirTexto('./gerar-video-quarta.ts', 'obterVarianteQuarta', 'Quarta: variante por semana');
exigirTexto('./gerar-video-quarta.ts', 'fundoZenAstrologia: true', 'Quarta: fundo zen');
exigirTexto('./gerar-video-quarta.ts', 'SLOT_MUSICA.VIP_DIVULGACAO_QUARTA', 'Quarta: slot música');
exigirTexto('./src/lib/conteudo-especial.ts', "export const TITULO_VIP_DIVULGACAO = 'O TEU VIP VITALÍCIO'", 'VIP: título marketing');
exigirTexto('./src/lib/conteudo-especial.ts', 'obterConteudoAfiliados', 'Quarta: conteúdo afiliados');
exigirFicheiro('./src/lib/legendas-marketing.ts');
exigirTexto('./src/lib/legenda.ts', 'legendas-marketing', 'Diário: hashtags marketing');
exigirTexto('./src/lib/conteudo-especial.ts', 'HASHTAGS_VIP_PT_TIKTOK', 'VIP: hashtags PT');

exigirFicheiro('./gerar-video-quinta.ts');
exigirTexto('./gerar-video-quinta.ts', 'escolherFraseMotivacional', 'Quinta: frase motivacional');
exigirTexto('./gerar-video-quinta.ts', 'SLOT_MUSICA.MOTIVACIONAL_QUINTA', 'Quinta: slot música');
exigirTexto('./gerar-video-quinta.ts', "escolherFraseMotivacional(data, 'quinta')", 'Quinta: variante frase');

exigirFicheiro('./src/lib/imagem-fundo.ts');
exigirTexto('./src/lib/imagem-fundo.ts', 'PROMPTS_FALLBACK_ASTROLOGIA', 'Imagem: fallback só astrologia (sem picsum)');

exigirFicheiro('./.github/workflows/diario.yml');
exigirTexto('./.github/workflows/diario.yml', 'workflow_dispatch', 'Diário: disparo externo');
exigirTexto('./.github/workflows/diario.yml', 'evitar-duplicado-schedule', 'Diário PT: backup schedule com anti-duplicado');
exigirTexto('./.github/workflows/diario.yml', "cron: '15 6 * * *'", 'Diário PT: cron backup verão Lisboa');

exigirFicheiro('./.github/workflows/diario-us.yml');
exigirTexto('./.github/workflows/diario-us.yml', 'workflow_dispatch', 'Diário US: disparo externo');
exigirTexto('./.github/workflows/diario-us.yml', 'evitar-duplicado-schedule', 'Diário US: backup schedule com anti-duplicado');

exigirFicheiro('./.github/workflows/monitor-crons.yml');
exigirTexto('./.github/workflows/monitor-crons.yml', 'verificar-pt', 'Monitor: recuperação PT');
exigirTexto('./.github/workflows/monitor-crons.yml', 'verificar-us', 'Monitor: recuperação US');

exigirFicheiro('./src/lib/pool-musicas-zen.ts');
exigirTexto('./src/lib/pool-musicas-zen.ts', 'filtrarEntradasZen', 'Música: filtro anti-gregoriano');
exigirTexto('./src/lib/pool-musicas-zen.ts', 'POOL_MUSICAS_ZEN_ASTRO', 'Música: pool zen/Enigma curado');
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
