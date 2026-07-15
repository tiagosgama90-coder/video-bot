import { obterFusoPublicacao } from './locale';

const NOMES_DIA: Record<number, string> = {
  0: 'domingo',
  1: 'segunda-feira',
  2: 'terça-feira',
  3: 'quarta-feira',
  4: 'quinta-feira',
  5: 'sexta-feira',
  6: 'sábado',
};

/** Dia da semana (0=dom … 6=sáb) no fuso de publicação (Lisboa ou New York). */
export function obterDiaSemanaPublicacao(data: Date = new Date()): number {
  const fuso = obterFusoPublicacao();
  const nomeDia = data.toLocaleDateString('en-US', { timeZone: fuso, weekday: 'long' });
  const mapa: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  return mapa[nomeDia] ?? data.getDay();
}

/**
 * Em CI, só corre no dia certo (cron). Local / IGNORAR_DIA_SEMANA=1 ignora.
 */
export function exigirDiaSemana(diaEsperado: number, nomeDia: string): void {
  if (process.env.IGNORAR_DIA_SEMANA === '1' || process.env.CI !== 'true') {
    return;
  }

  const hoje = obterDiaSemanaPublicacao();
  if (hoje !== diaEsperado) {
    const nomeHoje = NOMES_DIA[hoje] ?? String(hoje);
    console.log(
      '⏭️ Hoje é ' + nomeHoje + ' — este workflow só corre às ' + nomeDia + '. Nada a fazer.',
    );
    process.exit(0);
  }
}
