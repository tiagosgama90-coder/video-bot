/** Horários Buffer configurados em Lisboa (sidusastro TikTok/Instagram) */
export const SLOTS_PUBLICACAO_LISBOA = ['09:00', '10:30', '12:00'] as const;

/**
 * Converte hora em Lisboa para ISO UTC (dueAt Buffer).
 * data: YYYY-MM-DD, horaMin: "09:00"
 */
export function horaLisboaParaISO(data: string, horaMin: string): string {
  const [hora, minuto] = horaMin.split(':').map(Number);
  const ref = new Date(`${data}T12:00:00.000Z`);
  const horaLisboaRef = parseInt(
    ref.toLocaleString('en-GB', {
      timeZone: 'Europe/Lisbon',
      hour: '2-digit',
      hour12: false,
    }),
    10,
  );
  const offsetHoras = horaLisboaRef - 12;

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

export function obterDueAtSlot(data: string, indiceSlot: number): string {
  const slot = SLOTS_PUBLICACAO_LISBOA[indiceSlot] ?? SLOTS_PUBLICACAO_LISBOA[0];
  return horaLisboaParaISO(data, slot);
}
