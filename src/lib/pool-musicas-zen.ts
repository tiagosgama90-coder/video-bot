import type { EntradaMusica } from './project-config';

/** Bloqueia gregoriano, igreja, coral, etc. — mantém "Ethereal chant" Mixkit (pads ambient). */
const PADROES_BLOQUEADOS =
  /gregorian|gregoriano|\bsutra\b|chakra\s*chant|lost\s*chant|monks?|\bchoir\b|\bcoral\b|hymn|gospel|\bchurch\b|\bigreja\b|requiem|\borg[aã]o\b/i;

export function faixaZenPermitida(nome: string, fonte: string): boolean {
  return !PADROES_BLOQUEADOS.test(`${nome} ${fonte}`);
}

export function filtrarEntradasZen(entradas: EntradaMusica[]): EntradaMusica[] {
  const filtradas = entradas.filter((e) => faixaZenPermitida(e.nome, e.fonte));
  if (filtradas.length === 0) {
    throw new Error('Pool de músicas zen vazio após filtro — verifica config/sidusastro.json');
  }
  return filtradas;
}

/**
 * Pool curado: Enigma / worldbeat / zen / flauta / pads etéreos.
 * Sem gregoriano, sem canto de igreja, sem faixas aleatórias.
 */
export const POOL_MUSICAS_ZEN_ASTRO: EntradaMusica[] = [
  // —— Mixkit Enigma / worldbeat (base comprovada) ——
  { nome: 'Worldbeat tribal', fonte: 'https://assets.mixkit.co/music/21/21.mp3' },
  { nome: 'Ethnic zen', fonte: 'https://assets.mixkit.co/music/37/37.mp3' },
  { nome: 'Soft worldbeat', fonte: 'https://assets.mixkit.co/music/45/45.mp3' },
  { nome: 'Tribal ambient', fonte: 'https://assets.mixkit.co/music/178/178.mp3' },
  { nome: 'World rhythm', fonte: 'https://assets.mixkit.co/music/233/233.mp3' },
  { nome: 'Ethnic pads', fonte: 'https://assets.mixkit.co/music/1084/1084.mp3' },
  { nome: 'Mystic meditation', fonte: 'https://assets.mixkit.co/music/114/114.mp3' },
  { nome: 'Enigma atmosphere', fonte: 'https://assets.mixkit.co/music/138/138.mp3' },
  { nome: 'Spiritual mystery', fonte: 'https://assets.mixkit.co/music/139/139.mp3' },
  { nome: 'Deep zen pads', fonte: 'https://assets.mixkit.co/music/141/141.mp3' },
  { nome: 'Ethereal pads', fonte: 'https://assets.mixkit.co/music/325/325.mp3' },
  { nome: 'Mystic world', fonte: 'https://assets.mixkit.co/music/538/538.mp3' },
  { nome: 'Ambient mystery', fonte: 'https://assets.mixkit.co/music/578/578.mp3' },
  { nome: 'New age calm', fonte: 'https://assets.mixkit.co/music/324/324.mp3' },
  { nome: 'Zen ambient', fonte: 'https://assets.mixkit.co/music/441/441.mp3' },
  { nome: 'Peaceful pads', fonte: 'https://assets.mixkit.co/music/442/442.mp3' },
  // —— Mixkit flauta / acústico zen ——
  { nome: 'Flute meditation', fonte: 'https://assets.mixkit.co/music/24/24.mp3' },
  { nome: 'Peaceful flute', fonte: 'https://assets.mixkit.co/music/23/23.mp3' },
  { nome: 'Zen flute', fonte: 'https://assets.mixkit.co/music/19/19.mp3' },
  { nome: 'Soft flute ambient', fonte: 'https://assets.mixkit.co/music/39/39.mp3' },
  { nome: 'Native flute', fonte: 'https://assets.mixkit.co/music/15/15.mp3' },
  { nome: 'Spiritual pads', fonte: 'https://assets.mixkit.co/music/525/525.mp3' },
  // —— Jamendo zen / worldbeat / meditação (CC, sem gregoriano) ——
  { nome: 'Ethnic Indian Meditation — Parler', fonte: 'https://prod-1.storage.jamendo.com/download/track/1941101/mp32/' },
  { nome: 'Himalayas — Stefan Kartenberg', fonte: 'https://prod-1.storage.jamendo.com/download/track/1849314/mp32/' },
  { nome: 'Mystic Vortex — StimiBeats', fonte: 'https://prod-1.storage.jamendo.com/download/track/2043658/mp32/' },
  { nome: 'Celtic Drone Ambient — Rune X', fonte: 'https://prod-1.storage.jamendo.com/download/track/1470844/mp32/' },
  { nome: 'ZEN Trip Hop Remix — DJ Gami.K', fonte: 'https://prod-1.storage.jamendo.com/download/track/1242774/mp32/' },
  { nome: 'Baikal zen — Factory Of Echo', fonte: 'https://prod-1.storage.jamendo.com/download/track/1992751/mp32/' },
  { nome: 'StaRiverSun — KraftiM', fonte: 'https://prod-1.storage.jamendo.com/download/track/118257/mp32/' },
  { nome: 'Relaxing Ambient Meditation — Aliaksei Yukhnevich', fonte: 'https://prod-1.storage.jamendo.com/download/track/1890501/mp32/' },
  { nome: 'Zen Harmonies — Siarhei Korbut', fonte: 'https://prod-1.storage.jamendo.com/download/track/2133476/mp32/' },
  { nome: 'Zen Garden Awakening — TuneBox', fonte: 'https://prod-1.storage.jamendo.com/download/track/2255570/mp32/' },
  { nome: 'Harmonie Zen 432Hz — Kosmoze', fonte: 'https://prod-1.storage.jamendo.com/download/track/1232067/mp32/' },
  { nome: 'Mystical Light — Aufklarung', fonte: 'https://prod-1.storage.jamendo.com/download/track/1121762/mp32/' },
  { nome: 'Meditation Ambient — Osipov Vladimir', fonte: 'https://prod-1.storage.jamendo.com/download/track/1998223/mp32/' },
  { nome: 'Zen — Mazelo Nostra', fonte: 'https://prod-1.storage.jamendo.com/download/track/1740769/mp32/' },
  { nome: 'To hover meditation ambient — Roman Batiuk', fonte: 'https://prod-1.storage.jamendo.com/download/track/1406578/mp32/' },
  { nome: 'Zen Dream Music Box — Oursvince', fonte: 'https://prod-1.storage.jamendo.com/download/track/1099221/mp32/' },
  { nome: 'Ambient Meditation — Aliaksei Yukhnevich', fonte: 'https://prod-1.storage.jamendo.com/download/track/1890385/mp32/' },
  { nome: 'Summer Relax Ambient — AudioInfinity', fonte: 'https://prod-1.storage.jamendo.com/download/track/1680720/mp32/' },
];
