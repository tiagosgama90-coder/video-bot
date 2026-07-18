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

/** Enigma / ERA / worldbeat / new age sensual — gregoriano, pads etéreos, percussão tribal */
export const PRESET_MUSICAS_ZEN: EntradaMusica[] = [
  { nome: 'Gregorian chant (How)', fonte: 'https://assets.mixkit.co/music/32/32.mp3' },
  { nome: 'Gregorian mystic', fonte: 'https://assets.mixkit.co/music/579/579.mp3' },
  { nome: 'Games worldbeat', fonte: 'https://assets.mixkit.co/music/466/466.mp3' },
  { nome: 'Voxscape ethereal', fonte: 'https://assets.mixkit.co/music/571/571.mp3' },
  { nome: 'Meditation sitar', fonte: 'https://assets.mixkit.co/music/344/344.mp3' },
  { nome: 'Tribal mystic 4', fonte: 'https://assets.mixkit.co/music/541/541.mp3' },
  { nome: 'Tribal peaceful 2', fonte: 'https://assets.mixkit.co/music/539/539.mp3' },
  { nome: 'Crystal chant', fonte: 'https://assets.mixkit.co/music/583/583.mp3' },
  { nome: 'Rest now zen', fonte: 'https://assets.mixkit.co/music/584/584.mp3' },
  { nome: 'Sensual arabic', fonte: 'https://assets.mixkit.co/music/701/701.mp3' },
  { nome: 'Harp relaxation', fonte: 'https://assets.mixkit.co/music/669/669.mp3' },
  { nome: 'Finding myself', fonte: 'https://assets.mixkit.co/music/993/993.mp3' },
  { nome: 'Transcending space', fonte: 'https://assets.mixkit.co/music/347/347.mp3' },
  { nome: 'Sun daughter', fonte: 'https://assets.mixkit.co/music/580/580.mp3' },
  { nome: 'Western mystery', fonte: 'https://assets.mixkit.co/music/574/574.mp3' },
  { nome: 'Opalescent pads', fonte: 'https://assets.mixkit.co/music/593/593.mp3' },
  { nome: 'Charlotte ambient', fonte: 'https://assets.mixkit.co/music/586/586.mp3' },
  { nome: 'New age love', fonte: 'https://assets.mixkit.co/music/958/958.mp3' },
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
