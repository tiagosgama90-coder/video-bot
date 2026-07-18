import { isLocaleUS, obterFusoPublicacao, rotuloFusoPublicacao } from './locale';
import {
  SLOTS_PUBLICACAO_EST,
  SLOTS_PUBLICACAO_LISBOA,
} from './publicacao-alcance';

export { SLOTS_PUBLICACAO_EST, SLOTS_PUBLICACAO_LISBOA };

const MARGEM_FUTURO_MS = 2 * 60 * 1000;

function dueAtAindaNoFuturo(iso: string): boolean {
  return new Date(iso).getTime() > Date.now() + MARGEM_FUTURO_MS;
}

export function obterSlotsPublicacao(): readonly string[] {
  return isLocaleUS() ? SLOTS_PUBLICACAO_EST : SLOTS_PUBLICACAO_LISBOA;
}

/**
 * Converte hora num fuso para ISO UTC (dueAt Buffer).
 * data: YYYY-MM-DD, horaMin: "09:00"
 */
export function horaFusoParaISO(data: string, horaMin: string, timeZone: string): string {
  const [hora, minuto] = horaMin.split(':').map(Number);
  const ref = new Date(`${data}T12:00:00.000Z`);
  const horaLocalRef = parseInt(
    ref.toLocaleString('en-GB', {
      timeZone,
      hour: '2-digit',
      hour12: false,
    }),
    10,
  );
  const offsetHoras = horaLocalRef - 12;

  let utcH = hora - offsetHoras;
  let dia = parseInt(data.slice(8, 10), 10);
  let mes = parseInt(data.slice(5, 7), 10) - 1;
  let ano = parseInt(data.slice(0, 4), 10);

  if (utcH < 0) {
    utcH += 24;
    dia -= 1;
    if (dia < 1) {
      const d = new Date(Date.UTC(ano, mes, 0));
      dia = d.getUTCDate();
      mes -= 1;
      if (mes < 0) {
        mes = 11;
        ano -= 1;
      }
    }
  } else if (utcH >= 24) {
    utcH -= 24;
    dia += 1;
    const diasMes = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
    if (dia > diasMes) {
      dia = 1;
      mes += 1;
      if (mes > 11) {
        mes = 0;
        ano += 1;
      }
    }
  }

  return new Date(Date.UTC(ano, mes, dia, utcH, minuto, 0)).toISOString();
}

/** @deprecated usar horaFusoParaISO */
export function horaLisboaParaISO(data: string, horaMin: string): string {
  return horaFusoParaISO(data, horaMin, 'Europe/Lisbon');
}

export function obterDueAtSlot(data: string, indiceSlot: number): string | undefined {
  const slots = obterSlotsPublicacao();
  const fuso = obterFusoPublicacao();

  for (let i = indiceSlot; i < slots.length; i++) {
    const dueAt = horaFusoParaISO(data, slots[i], fuso);
    if (dueAtAindaNoFuturo(dueAt)) {
      return dueAt;
    }
  }
  return undefined;
}

export function rotuloHorarioAgenda(): string {
  return rotuloFusoPublicacao();
}

/** Devolve dueAt só se ainda estiver no futuro; senão undefined → addToQueue */
export function resolverDueAtFuturo(iso: string): string | undefined {
  return dueAtAindaNoFuturo(iso) ? iso : undefined;
}
