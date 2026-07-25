/**
 * Prompts IA — fundos zen/espiritual estilo Pinterest (sacred geometry, reiki, mandala).
 * Paleta 60-30-10 alinhada com PALETA_SIDUS (fundo #08060e · marca #2a1848 · ouro #f3cc63).
 */

export const PALETAS_60_30_10 = [
  '60% deep indigo void #08060e, 30% soft violet aura #2a1848, 10% warm gold light #f3cc63 glowing accents only',
  '60% midnight purple #08060e base, 30% amethyst mist #2a1848, 10% celestial gold #f3cc63 energy highlights',
  '60% cosmic dark #08060e, 30% lavender nebula #2a1848, 10% golden sacred geometry lines #f3cc63',
  '60% indigo night #08060e, 30% mystical purple haze #2a1848, 10% amber reiki glow #f3cc63 soft rim light',
] as const;

/** Estilo Pinterest: geometria sagrada, reiki, chakra, meditação, energia cósmica suave */
export const TEMAS_IMAGEM_ZEN_ESPIRITUAL = [
  'ethereal sacred geometry flower of life mandala glowing golden purple energy soft bokeh meditation pinterest spiritual art',
  'reiki healing energy light streams flowing from cosmic mandala soft purple gold aura dreamy luminous particles',
  'chakra alignment lotus mandala rotating energy orbs soft teal violet gold spiritual healing aesthetic pinterest',
  'cosmic meditation portal soft aurora borealis sacred symbols floating golden zodiac wheel ethereal not dark',
  'glowing crystal grid metatron cube sacred geometry purple gold light rays spiritual energy field dreamy',
  'zen lotus pond at twilight reflecting mandala sky soft mist golden moonbeam reiki energy ripples',
  'floating golden energy orbs around sacred geometry mandala soft purple nebula healing light pinterest style',
  'astrology wheel made of light sacred geometry constellations soft glow purple gold cosmic meditation art',
  'third eye chakra mandala with radiant golden rays soft violet background spiritual awakening aesthetic',
  'cosmic reiki hands energy made of stardust and golden light streams mandala background soft ethereal',
  'sri yantra sacred geometry glowing lines purple indigo void golden energy pulses meditation spiritual art',
  'soft nebula with floating lotus petals golden sacred symbols healing energy waves pinterest spiritual wallpaper',
  'moon phases circle sacred geometry soft golden glow purple mist meditation altar crystals luminous',
  'kundalini energy spiral ascending through chakra colors soft gold purple cosmic spiritual pinterest aesthetic',
  'angelic light beams through sacred geometry window soft purple gold dust particles meditation sanctuary',
] as const;

/** @deprecated alias — manter para verificar-deploy e imports antigos */
export const TEMAS_IMAGEM_BRUTAL = TEMAS_IMAGEM_ZEN_ESPIRITUAL;

export const MODIFICADORES_IMAGEM_ZEN = [
  'soft ethereal spiritual healing energy aesthetic dreamy bokeh luminous glow pinterest style 8k',
  'gentle mystical meditation atmosphere soft light rays volumetric haze not harsh not gothic',
  'reiki cosmic energy flowing particles golden purple aura serene transcendent spiritual art',
  'sacred geometry intricate detail soft focus background radiant energy orbs healing vibration',
  'cosmic spirituality soft aurora nebula gentle contrast not brutal not dark epic not horror',
  'zen meditation mandala luminous gradients smooth transitions spiritual pinterest wallpaper quality',
] as const;

/** @deprecated alias */
export const MODIFICADORES_IMAGEM_BRUTAL = MODIFICADORES_IMAGEM_ZEN;

export const SUFIXO_PROMPT_IMAGEM =
  ', soft zen spiritual meditation healing energy aesthetic pinterest style, sacred geometry reiki mandala astrology, dreamy luminous glow not gothic not brutal not horror not dark cathedral, vertical portrait 9:16, color harmony 60-30-10 indigo purple gold, no text, no watermark, no people, no faces, no hands, no cars, no vehicles, no modern city, masterpiece';

export const PROMPTS_FALLBACK_ZEN = [
  'sacred geometry flower of life golden purple reiki energy soft glow meditation spiritual pinterest',
  'cosmic mandala lotus chakra healing light orbs soft violet gold ethereal spiritual art',
  'astrology wheel sacred geometry soft aurora golden symbols purple mist meditation aesthetic',
  'reiki energy streams metatron cube glowing lines soft nebula spiritual healing pinterest style',
  'zen lotus mandala moonlight golden rays soft purple cosmic meditation spiritual wallpaper',
] as const;

/** @deprecated alias */
export const PROMPTS_FALLBACK_BRUTAL = PROMPTS_FALLBACK_ZEN;
