import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { addDays, differenceInCalendarDays, getISOWeek, getISOWeekYear, parseISO } from 'date-fns';
import { ehFeriado } from '../constants/feriados';

const FUSO = 'America/Sao_Paulo';

/** Data civil de hoje no fuso de São Paulo, formato 'YYYY-MM-DD'. */
export function hojeCivil(): string {
  return formatInTimeZone(new Date(), FUSO, 'yyyy-MM-dd');
}

/** Converte um Date qualquer para a chave de dia civil ('YYYY-MM-DD') no fuso SP. */
export function paraDataCivil(data: Date): string {
  return formatInTimeZone(data, FUSO, 'yyyy-MM-dd');
}

/** Soma dias a uma data civil, retornando outra data civil. */
export function somarDias(dataCivil: string, dias: number): string {
  const base = toZonedTime(`${dataCivil}T12:00:00`, FUSO); // meio-dia evita virada por DST
  return paraDataCivil(addDays(base, dias));
}

/** Diferença em dias de calendário entre duas datas civis (b - a). */
export function diferencaEmDias(a: string, b: string): number {
  return differenceInCalendarDays(parseISO(b), parseISO(a));
}

export function ehFimDeSemana(dataCivil: string): boolean {
  const diaSemana = toZonedTime(`${dataCivil}T12:00:00`, FUSO).getDay();
  return diaSemana === 0 || diaSemana === 6;
}

/** Dia "não letivo" para efeito de streak: fim de semana ou feriado nacional. */
export function ehDiaNaoLetivo(dataCivil: string): boolean {
  return ehFimDeSemana(dataCivil) || ehFeriado(dataCivil);
}

/** Chave de semana ISO ('YYYY-Www') usada em progressoPublico.evolucaoSemanal. */
export function chaveSemanaISO(dataCivil: string): string {
  const data = parseISO(dataCivil);
  const ano = getISOWeekYear(data);
  const semana = String(getISOWeek(data)).padStart(2, '0');
  return `${ano}-W${semana}`;
}
