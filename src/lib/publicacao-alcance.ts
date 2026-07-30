/**
 * Estratégia de publicação alinhada com o algoritmo TikTok (2026).
 *
 * Como funciona o alcance:
 * - Cada vídeo entra num "test pool" de ~200–500 viewers (não é cap diário da conta).
 * - O TikTok mede completion rate, saves e shares nos primeiros 30–90 min.
 * - Se falhar, o vídeo pára nos ~200–300 views — não há segunda tentativa.
 *
 * Porque NÃO publicar 5+/dia:
 * - Cada vídeo é avaliado em separado, mas seguidores que te vêem 5×/dia
 *   desenvolvem scroll-paste (sinal negativo).
 * - Engagement dilui-se entre posts — nenhum passa bem o test pool.
 * - Dados Buffer (11M posts): melhor eficiência em 2–5 posts/semana; 1–3/dia
 *   com qualidade supera volume alto.
 *
 * Meta ~1000 views/dia (PT ou US):
 * - 3 vídeos fortes × ~333 views cada (cada um a passar fase 2 do algoritmo).
 * - Intervalo mínimo 3–4h entre posts para o test pool avaliar antes do seguinte.
 */

/** Horóscopos diários por execução — PT e US */
export const VIDEOS_HOROSCOPO_POR_DIA = 3;

/** Terças e sábados: 1 afiliado (fila Buffer, hora livre) + 2 horóscopos agendados */
export const HOROSCOPOS_EM_DIA_AFILIADOS = 2;

/** Horas mínimas recomendadas entre publicações no mesmo canal */
export const INTERVALO_MINIMO_HORAS_ENTRE_POSTS = 3;

/** Histórico Buffer consultado para rotação justa dos 12 signos (dias). */
export const DIAS_HISTORICO_RODACAO_SIGNOS = 30;

/**
 * Slots locais (Lisboa / New York) — 3 posts espaçados para o algoritmo.
 * 09:00 → test pool de manhã | 13:30 → tarde | 19:00 → pico nocturno
 */
export const SLOTS_PUBLICACAO_LISBOA = ['09:00', '13:30', '19:00'] as const;

export const SLOTS_PUBLICACAO_EST = ['09:00', '13:30', '19:00'] as const;
