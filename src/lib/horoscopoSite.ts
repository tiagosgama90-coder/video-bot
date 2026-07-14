/**
 * Replica a lógica do sidusastro.com/home — Horóscopo Diário por trânsitos.
 * Fonte: src/lib/horoscopoDiarioTransitos.js + App.jsx (calcularPlanetasParaData)
 */
import { Body, Ecliptic, GeoVector, MakeTime } from 'astronomy-engine';
import { NOMES_SIGNOS, SIGNOS_ZODIACO, type SignoZodiaco } from './signos';

const SIGNOS_PT = SIGNOS_ZODIACO.map((s) => NOMES_SIGNOS[s]);

const REGENTE_PT = [
  'Marte', 'Vénus', 'Mercúrio', 'Lua', 'Sol', 'Mercúrio',
  'Vénus', 'Marte', 'Júpiter', 'Saturno', 'Saturno', 'Júpiter',
];

const ASPECTOS = [
  { key: 'conjuncao', angulo: 0, orbe: 8 },
  { key: 'sextil', angulo: 60, orbe: 5 },
  { key: 'quadratura', angulo: 90, orbe: 6 },
  { key: 'trino', angulo: 120, orbe: 6 },
  { key: 'oposicao', angulo: 180, orbe: 7 },
];

const ASPECTOS_MAIORES = [
  { nome: 'Conjuncao', angulo: 0 },
  { nome: 'Sextil', angulo: 60 },
  { nome: 'Quadratura', angulo: 90 },
  { nome: 'Trigono', angulo: 120 },
  { nome: 'Oposicao', angulo: 180 },
];

const ORBE_ASPECTO = 6;

const PLANETAS_AGORA = [
  { key: 'sol', nome: 'Sol', corpo: Body.Sun, simbolo: '☉' },
  { key: 'lua', nome: 'Lua', corpo: Body.Moon, simbolo: '☽' },
  { key: 'mercurio', nome: 'Mercúrio', corpo: Body.Mercury, simbolo: '☿' },
  { key: 'venus', nome: 'Vénus', corpo: Body.Venus, simbolo: '♀' },
  { key: 'marte', nome: 'Marte', corpo: Body.Mars, simbolo: '♂' },
  { key: 'jupiter', nome: 'Júpiter', corpo: Body.Jupiter, simbolo: '♃' },
  { key: 'saturno', nome: 'Saturno', corpo: Body.Saturn, simbolo: '♄' },
];

const FASES_PT = [
  { max: 22.5, nome: 'Lua Nova' },
  { max: 67.5, nome: 'Lua Crescente' },
  { max: 112.5, nome: 'Quarto Crescente' },
  { max: 157.5, nome: 'Lua Gibosa Crescente' },
  { max: 202.5, nome: 'Lua Cheia' },
  { max: 247.5, nome: 'Lua Gibosa Minguante' },
  { max: 292.5, nome: 'Quarto Minguante' },
  { max: 337.5, nome: 'Lua Minguante' },
  { max: 360, nome: 'Lua Nova' },
];

const LUA_REL: Record<string, (signo: string, fase: string) => string> = {
  conjuncao: (signo, fase) =>
    `${fase}: a Lua transita ${signo}, amplificando emoções e intuição neste signo - dia de presença interior.`,
  trino: (signo, fase) =>
    `${fase}: a Lua em trino a ${signo} facilita fluxo emocional e decisões alinhadas.`,
  quadratura: (signo, fase) =>
    `${fase}: a Lua em quadratura a ${signo} pede ajustes - evita reacções impulsivas.`,
  sextil: (signo, fase) =>
    `${fase}: a Lua em sextil a ${signo} abre oportunidades subtis de conexão e criatividade.`,
  oposicao: (signo, fase) =>
    `${fase}: a Lua oposta a ${signo} realça polaridades - equilibra necessidades pessoais e relações.`,
  neutro: (signo, fase) =>
    `${fase}: a Lua move-se pelo céu; ${signo} sente o clima lunar com moderação.`,
};

interface PlanetaCeu {
  key: string;
  nome: string;
  simbolo: string;
  longitude: number;
  signo: { nome: string; graus: string };
}

interface Aspeto {
  planetaA: string;
  planetaB: string;
  aspecto: string;
  orbe: string;
}

function position(corpo: Body, time: ReturnType<typeof MakeTime>) {
  return GeoVector(corpo, time, true);
}

function longitudeParaSigno(longitude: number) {
  const normalizada = ((longitude % 360) + 360) % 360;
  const indice = Math.floor(normalizada / 30) % 12;
  return { nome: SIGNOS_PT[indice], graus: (normalizada % 30).toFixed(1) };
}

function diferencaAngular(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function calcularFaseLua(date: Date) {
  const time = MakeTime(date);
  const sunLon = Ecliptic(position(Body.Sun, time)).elon;
  const moonLon = Ecliptic(position(Body.Moon, time)).elon;
  const angulo = ((moonLon - sunLon) % 360 + 360) % 360;
  const faseFinal = FASES_PT.find((f) => angulo < f.max) || FASES_PT[FASES_PT.length - 1];
  return { nome: faseFinal.nome };
}

function calcularPlanetasParaData(dateObj: Date): PlanetaCeu[] {
  const time = MakeTime(dateObj);
  return PLANETAS_AGORA.map((p) => {
    const ecl = Ecliptic(position(p.corpo, time));
    const signo = longitudeParaSigno(ecl.elon);
    return { ...p, longitude: ecl.elon, signo };
  });
}

function calcularAspetos(planetas: PlanetaCeu[]): Aspeto[] {
  const lista: Aspeto[] = [];
  for (let i = 0; i < planetas.length; i++) {
    for (let j = i + 1; j < planetas.length; j++) {
      const a = planetas[i];
      const b = planetas[j];
      const angle = diferencaAngular(a.longitude, b.longitude);
      const nearest = ASPECTOS_MAIORES
        .map((x) => ({ ...x, orbe: Math.abs(angle - x.angulo) }))
        .sort((x, y) => x.orbe - y.orbe)[0];
      if (nearest.orbe <= ORBE_ASPECTO) {
        lista.push({
          planetaA: `${a.nome} ${a.simbolo}`,
          planetaB: `${b.nome} ${b.simbolo}`,
          aspecto: nearest.nome,
          orbe: `${nearest.orbe.toFixed(1)}°`,
        });
      }
    }
  }
  return lista.sort((x, y) => parseFloat(x.orbe) - parseFloat(y.orbe));
}

function aspectoEntre(lon1: number, lon2: number) {
  const angle = diferencaAngular(lon1, lon2);
  let best: (typeof ASPECTOS)[0] & { orbe: number } | null = null;
  for (const asp of ASPECTOS) {
    const orbe = Math.abs(angle - asp.angulo);
    if (orbe <= asp.orbe && (!best || orbe < best.orbe)) {
      best = { ...asp, orbe };
    }
  }
  return best;
}

function relacaoSignos(idxA: number, idxB: number): string {
  const diff = ((idxB - idxA) + 12) % 12;
  if (diff === 0) return 'conjuncao';
  if (diff === 4 || diff === 8) return 'trino';
  if (diff === 3 || diff === 9) return 'quadratura';
  if (diff === 2 || diff === 10) return 'sextil';
  if (diff === 6) return 'oposicao';
  return 'neutro';
}

function formatarTextoHoroscopo(text: string): string {
  return String(text || '')
    .replace(/\s*\(orbe[^)]*\)/gi, '')
    .replace(/\s*\(orb[^)]*\)/gi, '')
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

const ASP: Record<string, string> = {
  conjuncao: 'em conjunção',
  sextil: 'em sextil',
  quadratura: 'em quadratura',
  trino: 'em trino',
  oposicao: 'em oposição',
};

function frasePlanetaNoSigno(p: PlanetaCeu, signoNome: string): string {
  return `${p.nome} a ${p.signo.graus}° em ${signoNome} activa directamente a tua energia solar - presença marcante deste planeta no teu signo.`;
}

function fraseAspectoSigno(p: PlanetaCeu, asp: { key: string }, signoNome: string): string {
  return `${p.nome} ${ASP[asp.key] || asp.key} ao grau solar de ${signoNome} - trânsito preciso que molda o ritmo do dia.`;
}

function fraseRegente(aspeto: Aspeto, regente: string, signoNome: string): string {
  const partes = `${aspeto.planetaA} ${aspeto.aspecto} ${aspeto.planetaB}`;
  return `O regente de ${signoNome} (${regente}) participa no trânsito ${partes} - atenção especial à área de vida que este signo governa.`;
}

function fraseCeuCalmo(signoNome: string): string {
  return `Céu sem aspectos exactos ao grau de ${signoNome} - dia estável para consolidar rotinas e honrar o teu ritmo natural.`;
}

function gerarHoroscopoSignoTransito({
  signoIndex,
  signoNome,
  ceuAgora,
  aspetos,
  faseLua,
  apiText,
}: {
  signoIndex: number;
  signoNome: string;
  ceuAgora: PlanetaCeu[];
  aspetos: Aspeto[];
  faseLua: { nome: string };
  apiText?: string;
}): string {
  if (!ceuAgora?.length) {
    return formatarTextoHoroscopo(apiText || '');
  }

  const partes: string[] = [];
  const fase = faseLua?.nome || 'Lua';
  const lua = ceuAgora.find((p) => p.key === 'lua');
  const luaIdx = lua ? SIGNOS_PT.indexOf(lua.signo.nome) : -1;
  const relLua = luaIdx >= 0 ? relacaoSignos(luaIdx, signoIndex) : 'neutro';
  partes.push((LUA_REL[relLua] || LUA_REL.neutro)(signoNome, fase));

  const ptSign = SIGNOS_PT[signoIndex];
  const noSigno = ceuAgora.filter((p) => p.signo.nome === ptSign && p.key !== 'lua');
  for (const p of noSigno) {
    partes.push(frasePlanetaNoSigno(p, signoNome));
  }

  const cuspLon = signoIndex * 30 + 15;
  const aspectosSigno = ceuAgora
    .map((p) => ({ p, asp: aspectoEntre(p.longitude, cuspLon) }))
    .filter(({ p, asp }) => asp && p.signo.nome !== ptSign)
    .sort((a, b) => a.asp!.orbe - b.asp!.orbe)
    .slice(0, 2);

  if (aspectosSigno.length) {
    for (const { p, asp } of aspectosSigno) {
      partes.push(fraseAspectoSigno(p, asp!, signoNome));
    }
  } else if (!noSigno.length) {
    partes.push(fraseCeuCalmo(signoNome));
  }

  const regente = REGENTE_PT[signoIndex];
  const aspReg = aspetos.find(
    (a) => a.planetaA?.includes(regente) || a.planetaB?.includes(regente),
  );
  if (aspReg) {
    partes.push(fraseRegente(aspReg, regente, signoNome));
  }

  let texto = partes.join(' ');
  // O site só prepend o pack IA se for texto PT-PT válido (não templates genéricos).
  // Ignoramos o pack IA brasileiro — o horóscopo diário real são os trânsitos.
  if (
    apiText &&
    apiText.length > 40 &&
    !apiText.includes('pequenos passos') &&
    !/\b(sua|você|voce|seu|sua)\b/i.test(apiText)
  ) {
    texto = `${apiText} ${texto}`;
  }
  return formatarTextoHoroscopo(texto);
}

/**
 * Gera o texto exacto que aparece na home do sidusastro.com para um signo.
 */
export function gerarTextoHoroscopoHome(
  signo: SignoZodiaco,
  apiText?: string,
  date: Date = new Date(),
): string {
  const signoIndex = SIGNOS_ZODIACO.indexOf(signo);
  const signoNome = NOMES_SIGNOS[signo];
  const ceuAgora = calcularPlanetasParaData(date);
  const aspetos = calcularAspetos(ceuAgora);
  const faseLua = calcularFaseLua(date);

  return gerarHoroscopoSignoTransito({
    signoIndex,
    signoNome,
    ceuAgora,
    aspetos,
    faseLua,
    apiText,
  });
}
