/**
 * Prompts IA — Pinterest espiritual colorido (alquimia, tarot, lua, astrolábio, reiki, mandala).
 * Paleta 60-30-10 + acentos de cor viva (violeta, teal, rosa, esmeralda, ouro, aurora).
 */

export const PALETAS_60_30_10 = [
  '60% midnight navy #08060e, 30% rich amethyst violet #6b3fa0, 10% luminous gold #f3cc63 and soft rose pink #e8a0bf accents',
  '60% deep indigo void #08060e, 30% cosmic purple nebula #4a2d7a, 10% teal cyan healing light #5ec8c8 and golden glow #f3cc63',
  '60% dark cosmic blue #08060e, 30% emerald spiritual green #2d6b5a, 10% warm amber gold #d4af37 and coral rose aura #e07a8a',
  '60% midnight purple base #08060e, 30% lavender mist #7b5ea7, 10% aurora magenta teal and gold multicolor spiritual highlights',
  '60% deep space indigo #08060e, 30% sapphire blue violet haze #3d2b7a, 10% aged gold #c9a227 with ruby red and jade green jewel accents',
  '60% cosmic dark #08060e, 30% soft violet aura #2a1848, 10% radiant chakra rainbow hints gold violet emerald rose subtle not neon',
] as const;

/**
 * Pinterest colorido + espiritual — alquimia/tarot, fases lua, cosmologia antiga, nebulosas,
 * reiki, mandala, chakra, lotus, geometria sagrada, aurora curativa.
 */
export const TEMAS_IMAGEM_ZEN_ESPIRITUAL = [
  'vertical tarot card illustration ornate golden frame, mystical hands holding colorful sun moon stars, alchemy symbols rich violet teal rose gold colors, decorative ornamental band pinterest spiritual art',
  'alchemy tarot card poster vertical ornate border, cosmic hands cupping glowing multicolor sphere emerald violet gold, inspirational mystical illustration vibrant pinterest',
  'colorful tarot major arcana vertical card design, moon sun alchemical icons in jewel tones amethyst coral teal gold, decorative scrollwork base pinterest',
  'vertical moon phases column waxing waning full sequence, fine gold geometric lines, constellation stars in soft teal and violet, lunar cycle rich indigo purple gold pinterest',
  'moon phases vertical alignment colorful spiritual aesthetic, sacred geometry grid rose gold linework, stardust magenta and cyan particles midnight blue pinterest',
  'lunar cycle vertical poster moon phases stacked, aurora borealis green magenta hints behind moons, celestial gold geometry dreamy pinterest',
  'antique astrolabe engraving brass gold with emerald and ruby jewel accents, zodiac ring colorful vintage mysticism vertical pinterest',
  'ancient celestial mechanics map planetary orbits, heliocentric diagram gold copper teal engraving on deep blue, zodiac symbols colorful pinterest',
  'vintage zodiac wheel chart antique look with rich purple emerald rose gold tones, astrolabe overlay luminous pinterest astrology art vertical',
  'deep cosmic nebula galaxy swirl rich colors violet teal magenta gold stardust, colorful spiritual deep space vertical wallpaper pinterest',
  'cosmic nebula vertical composition jewel tone clouds emerald rose sapphire gold, ethereal luminous spiritual meditation pinterest',
  'colorful aurora spiritual sky over cosmic texture, green magenta violet gold light rays, stardust dreamy pinterest wallpaper vertical',
  'sacred geometry flower of life metatron cube glowing gold violet teal lines, reiki energy orbs colorful, spiritual healing pinterest',
  'sri yantra mandala radiant golden purple rose energy, soft colorful aurora portal, meditation spiritual aesthetic vertical pinterest',
  'reiki healing light streams rainbow subtle chakra colors violet emerald rose gold, mandala lotus aura ethereal spiritual pinterest art',
  'chakra alignment lotus mandala rotating colorful energy orbs teal violet gold rose, spiritual healing luminous pinterest vertical',
  'third eye chakra mandala radiant gold violet emerald rays, cosmic spiritual awakening colorful soft glow pinterest',
  'kundalini energy spiral ascending chakra colors gold violet teal rose, cosmic spiritual pinterest aesthetic vertical',
  'zen lotus pond twilight reflecting colorful mandala sky violet gold teal mist, reiki ripples spiritual pinterest',
  'angelic light beams through sacred geometry window, purple gold rose teal dust particles healing sanctuary pinterest spiritual',
] as const;

/** @deprecated alias — manter para verificar-deploy e imports antigos */
export const TEMAS_IMAGEM_BRUTAL = TEMAS_IMAGEM_ZEN_ESPIRITUAL;

export const MODIFICADORES_IMAGEM_ZEN = [
  'pinterest spiritual wallpaper rich vibrant saturated colors jewel tones vertical 9:16 highly detailed 8k',
  'colorful mystical illustration luminous teal violet rose emerald gold soft ethereal glow not dull not monochrome',
  'spiritual healing energy aesthetic reiki mandala chakra aurora dreamy bokeh colorful pinterest',
  'tarot alchemy moon astrolabe ornate frame decorative border antique gold with vivid color accents',
  'fine geometric linework star patterns celestial vintage manuscript rich purple indigo gold colors',
  'deep cosmic nebula texture multicolor stardust spiritual meditative luminous not horror not brutal',
] as const;

/** @deprecated alias */
export const MODIFICADORES_IMAGEM_BRUTAL = MODIFICADORES_IMAGEM_ZEN;

export const SUFIXO_PROMPT_IMAGEM =
  ', pinterest spiritual mystical illustration aesthetic colorful vibrant saturated jewel tones, alchemy tarot moon phases astrolabe reiki mandala chakra healing energy, native instagram reel wallpaper 1080x1920 pixels full bleed edge to edge vertical 9:16, perfect circles not oval not stretched, entire composition fits reel frame, rich colors violet teal emerald rose gold amber aurora accents on deep cosmic base, dreamy luminous spiritual glow not monochrome not grey not desaturated, ornate frame when tarot theme, illustrated mystical hands allowed, decorative ornamental band abstract glyphs only no readable words, no watermark, no photorealistic faces, no modern city, masterpiece';

export const PROMPTS_FALLBACK_ZEN = [
  'colorful vertical tarot card ornate frame mystical hands sun moon alchemy violet teal rose gold pinterest spiritual',
  'vertical moon phases column colorful geometric lines constellation gold purple teal pinterest spiritual',
  'antique astrolabe engraving zodiac colorful jewel tones emerald rose gold dark blue pinterest',
  'rich colorful cosmic nebula galaxy violet teal magenta gold stardust spiritual vertical pinterest wallpaper',
  'reiki mandala sacred geometry chakra colors violet emerald rose gold healing spiritual pinterest vertical',
] as const;

/** @deprecated alias */
export const PROMPTS_FALLBACK_BRUTAL = PROMPTS_FALLBACK_ZEN;
