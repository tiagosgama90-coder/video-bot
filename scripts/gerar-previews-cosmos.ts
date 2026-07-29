/**
 * Previews cosmos puro — 4 variedades de geometria central.
 * Uso: npx ts-node scripts/gerar-previews-cosmos.ts
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { calcularDuracaoFrames } from '../src/lib/duracao-video';
import { NOMES_VARIANTES_GEOMETRIA, nomeGeometriaCosmica } from '../src/components/GeometriaCosmicaCentro';
import { prepararMusicaEspecial } from '../src/lib/musicas';
import { obterVolumeMusica } from '../src/lib/project-config';

const ART = '/opt/cursor/artifacts/previews-cosmos';
const VARIANTES = NOMES_VARIANTES_GEOMETRIA.length;
const SIGNOS_PREVIEW = ['carneiro', 'leao', 'escorpiao', 'peixes'] as const;

async function renderizar(variante: number, signoChave: string, seed: number): Promise<string> {
  const nome = nomeGeometriaCosmica(variante);
  const output = path.join('./output', `preview-cosmos-${nome}-${signoChave}.mp4`);
  const destino = path.join(ART, `exemplo-cosmos-${nome}-${signoChave}.mp4`);

  execSync('ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t 10 -q:a 9 ./public/narracao.mp3', {
    stdio: 'pipe',
  });
  const duracaoFrames = calcularDuracaoFrames('./public/narracao.mp3', 14);
  const musica = await prepararMusicaEspecial(`preview-cosmos-${seed}`, '2026-07-28', 'zen');

  const props = {
    signo: 'COSMOS',
    previsao: `Preview geometria ${nome} — fundo universo com estrelas e nebulosas.`,
    hookTexto: 'Universo SidusAstro',
    fechoTexto: 'sidusastro.com',
    frameInicioPrevisao: 60,
    frameInicioFecho: duracaoFrames - 90,
    fundoVideoSeed: seed,
    signoChave,
    fundoVideoGeometria: variante,
    musicaFundoArquivo: musica,
    duracaoFrames,
    siteMarca: 'sidusastro.com',
    volumeMusica: obterVolumeMusica() * 0.5,
  };

  fs.writeFileSync('./public/props-temporarias.json', JSON.stringify(props, null, 2));
  execSync(
    `npx remotion render src/index.ts HoroscopoComposition "${output}" --props="./public/props-temporarias.json"`,
    { stdio: 'inherit' },
  );
  fs.copyFileSync(output, destino);
  console.log('✅', destino);
  return destino;
}

async function executar(): Promise<void> {
  fs.mkdirSync(ART, { recursive: true });
  fs.mkdirSync('./output', { recursive: true });
  fs.mkdirSync('./public', { recursive: true });

  for (let variante = 0; variante < VARIANTES; variante++) {
    const signoChave = SIGNOS_PREVIEW[variante % SIGNOS_PREVIEW.length];
    const seed = variante * 17 + 3;
    console.log(`\n🌌 Variante ${variante} (${nomeGeometriaCosmica(variante)}) — ${signoChave}...`);
    await renderizar(variante, signoChave, seed);
  }

  if (fs.existsSync('./public/props-temporarias.json')) {
    fs.unlinkSync('./public/props-temporarias.json');
  }
  console.log('\n✅ Previews em', path.resolve(ART));
}

executar().catch((e) => {
  console.error(e);
  process.exit(1);
});
