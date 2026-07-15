export type AppLocale = 'pt-PT' | 'en-US';

export function obterLocale(): AppLocale {
  const raw = (process.env.LOCALE ?? process.env.SIDUS_LOCALE ?? 'pt-PT').trim();
  if (raw === 'en-US' || raw === 'en' || raw.toLowerCase() === 'en-us') {
    return 'en-US';
  }
  return 'pt-PT';
}

export function isLocaleUS(): boolean {
  return obterLocale() === 'en-US';
}

export function chaveHoroscopoFirestore(): 'pt' | 'en' {
  return isLocaleUS() ? 'en' : 'pt';
}

export function obterFusoPublicacao(): string {
  return isLocaleUS() ? 'America/New_York' : 'Europe/Lisbon';
}

export function rotuloFusoPublicacao(): string {
  return isLocaleUS() ? 'EST' : 'Lisboa';
}

export function sufixoVideoDiario(): string {
  return isLocaleUS() ? '-diario-us.mp4' : '-diario.mp4';
}

export function subpastaVideosFirebase(): string {
  return isLocaleUS() ? 'videos-us' : 'videos';
}

export function urlSiteMarca(): string {
  return isLocaleUS() ? 'sidusastro.com/en' : 'sidusastro.com';
}
