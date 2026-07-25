/**
 * Prompts IA — Pinterest espiritual: mistura ~50% colorido + ~50% monocromático.
 */

export type ModoPaletaImagem = 'color' | 'mono';

export const PALETAS_COLOR = [
  '60% midnight navy #08060e, 30% rich amethyst violet #6b3fa0, 10% luminous gold #f3cc63 and soft rose pink #e8a0bf accents',
  '60% deep indigo void #08060e, 30% cosmic purple nebula #4a2d7a, 10% teal cyan healing light #5ec8c8 and golden glow #f3cc63',
  '60% dark cosmic blue #08060e, 30% emerald spiritual green #2d6b5a, 10% warm amber gold #d4af37 and coral rose aura #e07a8a',
  '60% midnight purple base #08060e, 30% lavender mist #7b5ea7, 10% aurora magenta teal and gold multicolor spiritual highlights',
] as const;

export const PALETAS_MONOCROMATICAS = [
  '60% charcoal black #08060e, 30% deep graphite grey #1a1a24, 10% antique silver white #d8d8e8 and aged gold #c9a227 accents only',
  '60% midnight black #08060e, 30% cool grey mist #2a2a38, 10% moonlight silver #e8e8f0 fine line art no color',
  '60% deep void black #08060e, 30% sepia shadow #1c1814, 10% tarnished gold engraving #b8963e monochrome spiritual',
  '60% cosmic black #08060e, 30% slate grey nebula #252530, 10% white silver stardust highlights no chroma',
] as const;

/** @deprecated alias */
export const PALETAS_60_30_10 = PALETAS_COLOR;

export const TEMAS_COLOR = [
  'vertical tarot card ornate golden frame, mystical hands holding colorful sun moon stars, alchemy symbols rich violet teal rose gold, pinterest spiritual art',
  'moon phases vertical column fine gold geometric lines, constellation teal violet stars, lunar cycle rich indigo purple gold pinterest',
  'antique astrolabe engraving brass gold emerald ruby jewel accents, zodiac ring colorful vintage mysticism vertical pinterest',
  'deep cosmic nebula galaxy swirl rich colors violet teal magenta gold stardust, colorful spiritual deep space vertical pinterest',
  'colorful aurora spiritual sky green magenta violet gold light rays, stardust dreamy pinterest wallpaper vertical',
  'sacred geometry flower of life metatron cube glowing gold violet teal lines, reiki energy orbs colorful spiritual healing pinterest',
  'sri yantra mandala radiant golden purple rose energy, soft colorful aurora portal meditation spiritual pinterest',
  'reiki healing light streams chakra colors violet emerald rose gold, mandala lotus aura ethereal spiritual pinterest art',
  'chakra alignment lotus mandala colorful energy orbs teal violet gold rose, spiritual healing luminous pinterest vertical',
  'zen lotus pond twilight colorful mandala sky violet gold teal mist, reiki ripples spiritual pinterest',
] as const;

export const TEMAS_MONOCROMATICOS = [
  'vertical tarot card ornate frame monochrome silver gold line art on black charcoal, mystical hands holding moon sun symbols greyscale engraving, alchemy icons white gold only no color pinterest spiritual',
  'moon phases vertical column fine white silver geometric lines on deep black, lunar cycle charcoal engraving antique manuscript look pinterest spiritual',
  'antique astrolabe engraving monochrome brass gold on black white, zodiac ring vintage scientific mysticism greyscale vertical pinterest',
  'ancient celestial mechanics map planetary orbits heliocentric diagram sepia black white woodcut engraving aged gold lines only pinterest',
  'vintage zodiac wheel chart antique engraving black white silver gold linework, astrolabe overlay greyscale manuscript pinterest astrology vertical',
  'deep cosmic nebula charcoal greyscale silver white stardust on black void, monochrome spiritual deep space texture vertical pinterest',
  'sacred geometry flower of life metatron cube white gold thin lines on black, reiki energy monochrome spiritual engraving pinterest',
  'sri yantra mandala silver gold linework on charcoal black, soft moonlight glow greyscale meditation spiritual pinterest',
  'reiki healing light streams monochrome silver beams on dark void, mandala lotus greyscale aura spiritual pinterest art',
  'angelic light beams through sacred geometry window monochrome white gold dust on black, healing sanctuary greyscale pinterest spiritual',
] as const;

export const TEMAS_IMAGEM_ZEN_ESPIRITUAL = [...TEMAS_COLOR, ...TEMAS_MONOCROMATICOS] as const;

/** @deprecated alias */
export const TEMAS_IMAGEM_BRUTAL = TEMAS_IMAGEM_ZEN_ESPIRITUAL;

export const MODIFICADORES_COLOR = [
  'pinterest spiritual wallpaper rich vibrant saturated colors jewel tones vertical 9:16 highly detailed 8k',
  'colorful mystical illustration luminous teal violet rose emerald gold soft ethereal glow',
  'spiritual healing energy reiki mandala chakra aurora dreamy bokeh colorful pinterest',
  'deep cosmic nebula multicolor stardust spiritual meditative luminous',
] as const;

export const MODIFICADORES_MONO = [
  'pinterest spiritual wallpaper monochrome greyscale sepia charcoal silver gold line art vertical 9:16 highly detailed 8k',
  'black and white antique engraving mystical illustration silver white gold accents only no color',
  'monochrome spiritual healing aesthetic reiki mandala sacred geometry charcoal moonlight glow pinterest',
  'fine geometric linework star patterns celestial vintage manuscript greyscale silver on black',
] as const;

/** @deprecated alias */
export const MODIFICADORES_IMAGEM_ZEN = [...MODIFICADORES_COLOR, ...MODIFICADORES_MONO] as const;
export const MODIFICADORES_IMAGEM_BRUTAL = MODIFICADORES_IMAGEM_ZEN;

export const SUFIXO_PROMPT_COLOR =
  ', pinterest spiritual mystical illustration colorful vibrant saturated jewel tones, alchemy tarot moon phases astrolabe reiki mandala chakra, native instagram reel wallpaper 1080x1920 full bleed vertical 9:16, rich colors violet teal emerald rose gold aurora on deep cosmic base, dreamy luminous spiritual glow, ornate frame when tarot theme, illustrated mystical hands allowed, decorative ornamental band abstract glyphs only no readable words, no watermark, no photorealistic faces, masterpiece';

export const SUFIXO_PROMPT_MONO =
  ', pinterest spiritual mystical illustration monochrome greyscale sepia charcoal aesthetic, alchemy tarot moon phases astrolabe reiki mandala sacred geometry, native instagram reel wallpaper 1080x1920 full bleed vertical 9:16, black charcoal deep void with silver white and aged gold line art only no color no chroma, antique engraving woodcut moody spiritual glow, ornate frame when tarot theme, illustrated mystical hands allowed greyscale, decorative ornamental band abstract glyphs only no readable words, no watermark, no photorealistic faces, masterpiece';

/** @deprecated alias — cor por omissão em imports antigos */
export const SUFIXO_PROMPT_IMAGEM = SUFIXO_PROMPT_COLOR;

export const PROMPTS_FALLBACK_COLOR = [
  'colorful vertical tarot card ornate frame mystical hands sun moon alchemy violet teal rose gold pinterest spiritual',
  'vertical moon phases column colorful geometric lines constellation gold purple teal pinterest spiritual',
  'rich colorful cosmic nebula galaxy violet teal magenta gold stardust spiritual vertical pinterest',
  'reiki mandala sacred geometry chakra colors violet emerald rose gold healing spiritual pinterest vertical',
] as const;

export const PROMPTS_FALLBACK_MONO = [
  'monochrome vertical tarot card ornate frame silver gold line art on black charcoal pinterest spiritual',
  'vertical moon phases column white silver geometric lines on deep black greyscale pinterest spiritual',
  'antique astrolabe engraving zodiac monochrome sepia gold lines on black pinterest',
  'reiki mandala sacred geometry white gold lines charcoal black greyscale spiritual pinterest vertical',
] as const;

export const PROMPTS_FALLBACK_ZEN = [...PROMPTS_FALLBACK_COLOR, ...PROMPTS_FALLBACK_MONO] as const;
export const PROMPTS_FALLBACK_BRUTAL = PROMPTS_FALLBACK_ZEN;

export function escolherModoPaletaImagem(chave: string, data: string): ModoPaletaImagem {
  let hash = 0;
  const seed = data + '|' + chave + '|modo-cor-mono-v1';
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % 2 === 0 ? 'color' : 'mono';
}
