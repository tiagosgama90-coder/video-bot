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
exigirFicheiro('./src/lib/texto-publico.ts');
exigirTexto('./src/lib/texto-publico.ts', 'sanitizarTextoPublico', 'Texto público: banir traço tipográfico');
exigirTexto('./src/lib/conteudo-especial.ts', 'Ok, isto é real', 'VIP: legendas humanizadas PT');
exigirTexto('./src/lib/conteudo-especial.ts', 'Okay this is real', 'VIP: legendas humanizadas EN');
exigirFicheiro('./src/lib/ganchos-diario.ts');
exigirTexto('./src/lib/ganchos-diario.ts', 'escolherGanchoDiario', 'Diário: ganchos emocionais');
exigirTexto('./src/lib/ganchos-diario.ts', 'GANCHOS_PSICOLOGIA_PT', 'Diário: ganchos psicológicos PT');
exigirTexto('./src/lib/ganchos-diario.ts', 'Ninguém te diz isto', 'Diário: gancho psicológico PT');
exigirTexto('./src/lib/ganchos-diario.ts', 'Nobody tells you this', 'Diário: gancho psicológico EN');
exigirTexto('./src/lib/legenda.ts', 'Ninguém te mostra isto nas apps grátis', 'Diário: fecho curiosidade site');
exigirTexto('./src/lib/paleta-visual.ts', 'PALETA_SIDUS', 'Visual: regra 60-30-10');
exigirTexto('./config/sidusastro.json', 'estiloAzureMasculina', 'Voz: estilo masculino místico');
exigirTexto('./config/sidusastro.json', 'estiloAzureFeminina', 'Voz: estilo feminino zen');
exigirTexto('./config/sidusastro.json', 'en-US-DavisNeural', 'Voz EN: Davis sombria');
exigirTexto('./src/lib/legenda.ts', 'escolherGanchoDiario', 'Diário: legendas com gancho emocional');
exigirFicheiro('./src/lib/afiliados-dia.ts');
exigirTexto('./src/lib/afiliados-dia.ts', 'fila Buffer (hora livre)', 'Afiliados: sem horário fixo');
exigirTexto('./src/lib/dia-semana.ts', 'DIAS_AFILIADOS', 'Afiliados: terças e sábados');
exigirTexto('./gerar-e-publicar.ts', 'extrairAteSegundoPontoFinal', 'Horóscopo: 2 frases IA');
exigirTexto('./gerar-e-publicar.ts', 'gerarAfiliadosDia', 'Diário: afiliados ter/sáb');
exigirTexto('./gerar-e-publicar.ts', 'HOROSCOPOS_EM_DIA_AFILIADOS', 'Diário: 2 horóscopos em dia afiliados');
exigirTexto('./gerar-e-publicar.ts', 'escolherFechoNarracao', 'Horóscopo: frase final');
exigirTexto('./gerar-e-publicar.ts', 'montarTextoNarracaoDiaria', 'Diário: narração gancho + previsão + fecho');
exigirTexto('./gerar-e-publicar.ts', 'frameInicioPrevisao', 'Diário: ecrã sincronizado com voz');
exigirTexto('./gerar-e-publicar.ts', 'fechoEcra', 'Horóscopo: fecho no ecrã');

exigirFicheiro('./src/lib/horoscopoSite.ts');
exigirTexto('./src/lib/horoscopoSite.ts', 'apiTextoValidoParaHoroscopo', 'Pack IA Firestore');
exigirTexto('./src/lib/horoscopoSite.ts', 'pequenos passos', 'Filtro texto placeholder IA');

exigirFicheiro('./gerar-video-vip-divulgacao.ts');
exigirTexto('./gerar-video-vip-divulgacao.ts', 'executarAfiliadosQuarta', 'VIP: quartas redireccionam para afiliados');
exigirTexto('./gerar-video-vip-divulgacao.ts', 'obterConteudoVipDivulgacao', 'VIP: conteúdo divulgação');

exigirFicheiro('./.github/workflows/vip-divulgacao.yml');
exigirTexto('./.github/workflows/vip-divulgacao.yml', 'gerar-video-vip-divulgacao.ts', 'Workflow VIP PT');
exigirFicheiro('./.github/workflows/vip-divulgacao-us.yml');
exigirTexto('./.github/workflows/vip-divulgacao-us.yml', 'gerar-video-vip-divulgacao.ts', 'Workflow VIP US');

exigirFicheiro('./gerar-video-segunda.ts');
exigirTexto('./gerar-video-segunda.ts', 'escolherFraseMotivacional', 'Segunda: frase motivacional');
exigirTexto('./gerar-video-segunda.ts', 'SLOT_MUSICA.MOTIVACIONAL_SEGUNDA', 'Segunda: slot música');
exigirTexto('./src/lib/conteudo-especial.ts', 'SLOT_ESPECIAL_LISBOA', 'Slot especial Lisboa');

exigirFicheiro('./src/lib/ganchos-afiliados.ts');
exigirTexto('./src/lib/ganchos-afiliados.ts', 'escolherGanchoAfiliados', 'Afiliados: ganchos psicológicos');
exigirTexto('./src/lib/afiliados-dia.ts', 'hookTexto', 'Afiliados ter/sáb: gancho inteligente');

exigirFicheiro('./gerar-video-quarta.ts');
exigirTexto('./gerar-video-quarta.ts', 'executarAfiliadosQuarta', 'Quarta: afiliados');
exigirFicheiro('./src/lib/executar-afiliados-quarta.ts');
exigirTexto('./src/lib/executar-afiliados-quarta.ts', 'hookTexto', 'Quarta: gancho inteligente');
exigirTexto('./src/lib/executar-afiliados-quarta.ts', 'afiliados-quarta', 'Quarta: id afiliados');
exigirTexto('./gerar-video-quarta.ts', 'executarAfiliadosQuarta', 'Quarta: entrypoint');
exigirTexto('./src/lib/dia-semana.ts', 'DIA_AFILIADOS_QUARTA', 'Quarta: dia afiliados');
exigirTexto('./src/lib/dia-semana.ts', 'domingos, segundas e sextas', 'VIP: sem quartas');
exigirTexto('./src/lib/conteudo-especial.ts', "export const TITULO_VIP_DIVULGACAO = 'O TEU VIP VITALÍCIO'", 'VIP: título marketing');
exigirTexto('./src/lib/conteudo-especial.ts', 'obterConteudoAfiliados', 'Afiliados: conteúdo com gancho');
exigirTexto('./src/lib/legenda.ts', 'legendas-marketing', 'Diário: hashtags marketing');
exigirTexto('./src/lib/conteudo-especial.ts', 'HASHTAGS_VIP_PT_TIKTOK', 'VIP: hashtags PT');

exigirFicheiro('./gerar-video-quinta.ts');
exigirTexto('./gerar-video-quinta.ts', 'fundoZenAstrologia: true', 'Quinta motivacional: imagem zen');
exigirTexto('./gerar-video-segunda.ts', 'fundoZenAstrologia: true', 'Segunda motivacional: imagem zen');
exigirTexto('./src/lib/gerar-video-especial.ts', 'obterImagemFundoZenAstrologia', 'Especiais: imagem zen quando fundoZenAstrologia');
exigirTexto('./gerar-video-quinta.ts', 'SLOT_MUSICA.MOTIVACIONAL_QUINTA', 'Quinta: slot música');
exigirTexto('./gerar-video-quinta.ts', "escolherFraseMotivacional(data, 'quinta')", 'Quinta: variante frase');

exigirTexto('./config/sidusastro.json', '"femininaRate": "+4%"', 'Voz: prosódia feminina zen');
exigirTexto('./src/lib/voz.ts', 'mstts:express-as', 'Voz: estilo Azure expressivo');
exigirFicheiro('./src/lib/fundo-video.ts');
exigirTexto('./src/lib/fundo-video.ts', 'mesa_tarot', 'Vídeo: tema mesa tarot');
exigirTexto('./src/components/FundoVideoMistico.tsx', 'TemaVelas', 'Vídeo: velas animadas');
exigirTexto('./gerar-e-publicar.ts', 'escolherFundoVideo', 'Diário: fundo vídeo animado');

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
exigirTexto('./src/lib/pool-musicas-zen.ts', 'classificarEstiloMusica', 'Música: estilos zen/worldbeat/enigma');
exigirTexto('./src/lib/musicas.ts', 'estiloMusicaDoDia', 'Música: rotação por dia da semana');
exigirTexto('./src/lib/pool-musicas-zen.ts', 'Deep Reiki Energy', 'Música: faixas reiki profundas');
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
