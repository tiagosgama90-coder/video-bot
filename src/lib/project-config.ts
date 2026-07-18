import fs from 'fs';
import path from 'path';

export type PreferenciaVoz = 'feminina' | 'masculina' | 'aleatoria';

export interface ProsodiaLocale {
  feminina: string;
  masculina: string;
  femininaRate: string;
  femininaPitch: string;
  masculinaRate: string;
  masculinaPitch: string;
  volume: string;
}

export interface EntradaMusica {
  /** Rótulo na app (ex. "Flauta zen") */
  nome: string;
  /** URL https://... ou caminho relativo (ex. config/musicas/minha.mp3) */
  fonte: string;
}

export interface ConfigProjeto {
  projeto: string;
  voz: {
    preferencia: PreferenciaVoz;
    pt: ProsodiaLocale & { femininaId: string; masculinaId: string };
    en: ProsodiaLocale & { femininaId: string; masculinaId: string };
    pausaFraseMs: number;
    pausaVirgulaMs: number;
  };
  musica: {
    /** Volume no vídeo (0–1) — diário, motivacional, afiliados, PT e EN */
    volume: number;
    /** @deprecated Mantido por compatibilidade; o pool é sempre o de entradas */
    sempreZen: boolean;
    entradas: EntradaMusica[];
  };
  imagem: {
    temas: string[];
    modificadores: string[];
    paletas: string[];
    sufixoPrompt: string;
  };
}

/** Enigma / ERA / worldbeat / zen — Jamendo (CC), gregoriano, pads etéreos, worldbeat */
export const PRESET_MUSICAS_ZEN: EntradaMusica[] = [
  { nome: 'Gregorian Chant — Matti Paalanen', fonte: 'https://prod-1.storage.jamendo.com/download/track/1209641/mp32/' },
  { nome: 'Ut queant laxis (Gregorian) — Dussum', fonte: 'https://prod-1.storage.jamendo.com/download/track/1920874/mp32/' },
  { nome: 'The Lost Chant of Gregorian Faith — Danyax', fonte: 'https://prod-1.storage.jamendo.com/download/track/479725/mp32/' },
  { nome: 'Chant a Sutra — DJ Gami.K', fonte: 'https://prod-1.storage.jamendo.com/download/track/1632054/mp32/' },
  { nome: 'Root Chakra Chant — Macroform', fonte: 'https://prod-1.storage.jamendo.com/download/track/1250839/mp32/' },
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
  { nome: 'Summer Relax Ambient — AudioInfinity', fonte: 'https://prod-1.storage.jamendo.com/download/track/1680720/mp32/' },
  { nome: 'Relaxing Ambient — MuswayStudio', fonte: 'https://prod-1.storage.jamendo.com/download/track/1641738/mp32/' },
  { nome: 'Zen — Mazelo Nostra', fonte: 'https://prod-1.storage.jamendo.com/download/track/1740769/mp32/' },
  { nome: 'To hover (meditation ambient) — Roman Batiuk', fonte: 'https://prod-1.storage.jamendo.com/download/track/1406578/mp32/' },
  { nome: 'Zen Dream Music Box — Oursvince', fonte: 'https://prod-1.storage.jamendo.com/download/track/1099221/mp32/' },
  { nome: 'Confused relaxing ambient — Ostenvegr', fonte: 'https://prod-1.storage.jamendo.com/download/track/704397/mp32/' },
  { nome: 'Relaxing Ambient Presentation — penguinmusic', fonte: 'https://prod-1.storage.jamendo.com/download/track/1969331/mp32/' },
  { nome: 'Ambient Meditation — Aliaksei Yukhnevich', fonte: 'https://prod-1.storage.jamendo.com/download/track/1890385/mp32/' },
];

/** Acústico / flauta / orquestral — alternativa menos eletrónica */
export const PRESET_MUSICAS_ACUSTICAS: EntradaMusica[] = [
  { nome: 'Relaxing acoustic', fonte: 'https://assets.mixkit.co/music/522/522.mp3' },
  { nome: 'Orchestral calm', fonte: 'https://assets.mixkit.co/music/100/100.mp3' },
  { nome: 'Acoustic guitar zen', fonte: 'https://assets.mixkit.co/music/617/617.mp3' },
  { nome: 'Flute meditation', fonte: 'https://assets.mixkit.co/music/24/24.mp3' },
  { nome: 'Peaceful flute', fonte: 'https://assets.mixkit.co/music/23/23.mp3' },
  { nome: 'Soft flute ambient', fonte: 'https://assets.mixkit.co/music/39/39.mp3' },
  { nome: 'Acoustic strings', fonte: 'https://assets.mixkit.co/music/493/493.mp3' },
  { nome: 'Native flute', fonte: 'https://assets.mixkit.co/music/15/15.mp3' },
  { nome: 'Zen flute', fonte: 'https://assets.mixkit.co/music/19/19.mp3' },
  { nome: 'Spiritual pads', fonte: 'https://assets.mixkit.co/music/525/525.mp3' },
  { nome: 'Acoustic folk calm', fonte: 'https://assets.mixkit.co/music/13/13.mp3' },
  { nome: 'Meditation harp', fonte: 'https://assets.mixkit.co/music/16/16.mp3' },
  { nome: 'Orchestral meditation', fonte: 'https://assets.mixkit.co/music/114/114.mp3' },
  { nome: 'Flute world', fonte: 'https://assets.mixkit.co/music/1106/1106.mp3' },
  { nome: 'Calm acoustic', fonte: 'https://assets.mixkit.co/music/52/52.mp3' },
];

export const CONFIG_PADRAO: ConfigProjeto = {
  projeto: 'SidusAstro',
  voz: {
    preferencia: 'aleatoria',
    pt: {
      femininaId: 'pt-PT-RaquelNeural',
      masculinaId: 'pt-PT-DuarteNeural',
      feminina: 'pt-PT-RaquelNeural',
      masculina: 'pt-PT-DuarteNeural',
      femininaRate: '-15%',
      femininaPitch: '+3%',
      masculinaRate: '-14%',
      masculinaPitch: '+1%',
      volume: 'soft',
    },
    en: {
      femininaId: 'en-US-AriaNeural',
      masculinaId: 'en-US-RogerNeural',
      feminina: 'en-US-AriaNeural',
      masculina: 'en-US-RogerNeural',
      femininaRate: '-12%',
      femininaPitch: '+2%',
      masculinaRate: '-11%',
      masculinaPitch: '0%',
      volume: 'soft',
    },
    pausaFraseMs: 550,
    pausaVirgulaMs: 250,
  },
  musica: {
    volume: 0.22,
    sempreZen: true,
    entradas: PRESET_MUSICAS_ZEN,
  },
  imagem: {
    temas: [
      'peaceful zen meditation space zodiac wheel astrology chart soft golden candlelight',
      'calm night sky zodiac constellations horoscope map stars serene atmosphere',
      'minimalist astrology horoscope chart moon phases zen garden peaceful',
      'zen japanese garden stone lantern zodiac wheel moon astrology tranquil',
      'astrology birth chart celestial map soft glow peaceful zen aesthetic',
      'mandala zodiac wheel soft bokeh stars meditation zen horoscope art',
    ],
    modificadores: [
      'soft cinematic lighting peaceful composition',
      'minimalist zen aesthetic clean calm golden hour',
      'ethereal soft glow dreamy peaceful atmosphere',
      'watercolor soft pastel calm spiritual mood',
    ],
    paletas: [
      'deep indigo and gold',
      'lavender and rose gold',
      'midnight blue and silver',
      'soft purple and celestial white',
    ],
    sufixoPrompt:
      ', astrology horoscope theme, vertical portrait 9:16, no text, no watermark, calm masterpiece',
  },
};

function caminhoConfig(): string {
  const custom = process.env.SIDUS_CONFIG?.trim();
  if (custom) {
    return path.resolve(custom);
  }
  return path.resolve('./config/sidusastro.json');
}

function fundirComPadrao(parcial: Partial<ConfigProjeto>): ConfigProjeto {
  return {
    ...CONFIG_PADRAO,
    ...parcial,
    voz: { ...CONFIG_PADRAO.voz, ...parcial.voz, pt: { ...CONFIG_PADRAO.voz.pt, ...parcial.voz?.pt }, en: { ...CONFIG_PADRAO.voz.en, ...parcial.voz?.en } },
    musica: { ...CONFIG_PADRAO.musica, ...parcial.musica },
    imagem: { ...CONFIG_PADRAO.imagem, ...parcial.imagem },
  };
}

export function obterCaminhoConfig(): string {
  return caminhoConfig();
}

export function carregarConfigProjeto(): ConfigProjeto {
  const ficheiro = caminhoConfig();
  if (!fs.existsSync(ficheiro)) {
    guardarConfigProjeto(CONFIG_PADRAO);
    return structuredClone(CONFIG_PADRAO);
  }
  try {
    const raw = JSON.parse(fs.readFileSync(ficheiro, 'utf8')) as Partial<ConfigProjeto>;
    return fundirComPadrao(raw);
  } catch {
    console.log('⚠️ Config inválida — a usar valores padrão.');
    return structuredClone(CONFIG_PADRAO);
  }
}

export function guardarConfigProjeto(config: ConfigProjeto): void {
  const ficheiro = caminhoConfig();
  const pasta = path.dirname(ficheiro);
  if (!fs.existsSync(pasta)) {
    fs.mkdirSync(pasta, { recursive: true });
  }
  fs.writeFileSync(ficheiro, JSON.stringify(config, null, 2), 'utf8');
}

export function obterFontesMusica(config?: ConfigProjeto): string[] {
  const cfg = config ?? carregarConfigProjeto();
  return cfg.musica.entradas.map((e) => e.fonte).filter(Boolean);
}

export function resolverFonteMusica(fonte: string): string {
  if (fonte.startsWith('http://') || fonte.startsWith('https://')) {
    return fonte;
  }
  return path.resolve(fonte);
}

export function obterVolumeMusica(config?: ConfigProjeto): number {
  const cfg = config ?? carregarConfigProjeto();
  return cfg.musica.volume;
}
