/**
 * Prompts IA — estilo Pinterest espiritual/místico (alquimia, tarot, fases da lua, astrolábio).
 * Paleta 60-30-10 alinhada com PALETA_SIDUS (fundo #08060e · marca #2a1848 · ouro #f3cc63).
 */

export const PALETAS_60_30_10 = [
  '60% midnight navy blue #08060e, 30% deep cosmic indigo #1a1530, 10% aged antique gold #c9a227 tarnished metallic accents',
  '60% deep indigo void #08060e, 30% soft violet aura #2a1848, 10% warm gold light #f3cc63 glowing accents only',
  '60% midnight purple #08060e base, 30% amethyst nebula mist #2a1848, 10% celestial aged gold #d4af37 highlights',
  '60% cosmic dark blue-black #08060e, 30% stardust indigo haze #2a1848, 10% golden engraved line art #f3cc63',
] as const;

/**
 * Estilo Pinterest — 4 famílias visuais:
 * alquimia/tarot em moldura, fases da lua verticais, cosmologia antiga, texturas cósmicas profundas.
 */
export const TEMAS_IMAGEM_ZEN_ESPIRITUAL = [
  'vertical tarot card illustration ornate golden frame border, mystical hands holding sun and moon cosmic orbs, alchemy symbols, decorative ornamental band at base abstract glyphs not readable text, pinterest spiritual art',
  'alchemy tarot card poster vertical format structured frame, hands emerging from darkness holding stars and planets, antique gold line art on midnight blue, inspirational mystical illustration pinterest',
  'tarot major arcana style vertical card design ornate border, cosmic hands cupping glowing sphere, moon sun alchemical icons, decorative scrollwork base ornamental lettering style abstract only pinterest',
  'vertical moon phases column waxing waning full crescent sequence, fine geometric lines star chart patterns, lunar cycle diagram gold linework on deep indigo, pinterest moon aesthetic wallpaper',
  'moon phases vertical alignment eight lunar stages, delicate sacred geometry grid, constellation dots connecting lines, soft gold glow midnight blue background pinterest spiritual',
  'lunar cycle vertical poster all moon phases stacked, celestial coordinate lines thin gold geometry, stardust particles, dreamy meditative pinterest moon art',
  'antique astrolabe engraving illustration brass celestial mechanism, zodiac ring engraved, vintage scientific mysticism vertical composition aged gold on dark blue pinterest',
  'ancient celestial mechanics map planetary orbits concentric circles, heliocentric diagram antique engraving style, zodiac symbols orbit paths woodcut etching midnight gold pinterest',
  'vintage zodiac wheel chart antique engraving look, astrolabe overlay planetary spheres, old manuscript celestial map vertical 9:16 ornate border pinterest astrology art',
  'deep cosmic texture vertical wallpaper nebula galaxy swirl, stardust clouds midnight navy blue and aged gold particles, deep space pinterest spiritual background luminous',
  'cosmic nebula deep space vertical composition dark blue-black void, golden stardust veins galaxy dust, ethereal luminous depth aged gold accents pinterest meditation art',
  'deep space nebula and star field texture vertical, indigo purple cosmic fog aged gold glitter dust, ancient universe atmosphere soft glow pinterest wallpaper',
  'sacred geometry flower of life metatron cube soft gold lines on midnight blue, reiki energy orbs, dreamy luminous not harsh pinterest spiritual',
  'sri yantra mandala glowing golden purple energy, soft aurora cosmic portal, meditation aesthetic vertical pinterest wallpaper',
  'reiki healing light streams mandala lotus chakra soft violet gold aura, ethereal spiritual pinterest art vertical',
] as const;

/** @deprecated alias — manter para verificar-deploy e imports antigos */
export const TEMAS_IMAGEM_BRUTAL = TEMAS_IMAGEM_ZEN_ESPIRITUAL;

export const MODIFICADORES_IMAGEM_ZEN = [
  'pinterest spiritual wallpaper aesthetic vertical 9:16 ornate illustration highly detailed 8k',
  'antique engraving line art style aged gold on midnight blue cosmic mystical atmosphere',
  'tarot card illustration structured frame decorative border dreamy luminous soft contrast',
  'fine geometric linework star patterns celestial vintage manuscript look not photorealistic',
  'deep cosmic nebula texture stardust aged gold particles soft ethereal glow meditative',
  'mystical alchemy illustration hands and cosmic symbols artistic not horror not brutal',
] as const;

/** @deprecated alias */
export const MODIFICADORES_IMAGEM_BRUTAL = MODIFICADORES_IMAGEM_ZEN;

export const SUFIXO_PROMPT_IMAGEM =
  ', pinterest spiritual mystical illustration aesthetic, alchemy tarot moon phases astrolabe cosmic texture, native instagram reel wallpaper 1080x1920 pixels full bleed edge to edge vertical 9:16, perfect circles not oval not stretched, entire composition fits reel frame, midnight navy blue and aged antique gold palette, dreamy luminous engraved line art style, ornate frame or border when tarot card theme, illustrated mystical hands allowed if alchemy tarot theme, decorative ornamental band allowed abstract glyphs only no readable words, no watermark, no photorealistic faces, no modern city, no cars, masterpiece';

export const PROMPTS_FALLBACK_ZEN = [
  'vertical tarot card ornate frame mystical hands sun moon alchemy symbols midnight blue aged gold pinterest',
  'vertical moon phases column fine geometric lines constellation gold on deep indigo pinterest spiritual',
  'antique astrolabe engraving zodiac ring planetary orbits vintage celestial map aged gold dark blue pinterest',
  'deep cosmic nebula galaxy stardust midnight navy and aged gold vertical wallpaper pinterest spiritual',
  'sacred geometry mandala soft golden purple glow reiki energy dreamy pinterest meditation art vertical',
] as const;

/** @deprecated alias */
export const PROMPTS_FALLBACK_BRUTAL = PROMPTS_FALLBACK_ZEN;
