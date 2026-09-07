import { chaveSemanaISO } from './datas';
import type { Meta, RegistroDiario } from '../types/modelos';

/**
 * Progresso de uma meta semanal não é campo gravado (DATABASE.md §2.8) —
 * é soma dos registros da semana corrente, calculada aqui.
 */
export function progressoDaMeta(meta: Meta, registros: RegistroDiario[], hoje: string): {
  minutosFeitos: number;
  minutosAlvo: number;
  percentual: number;
} {
  const semanaAtual = chaveSemanaISO(hoje);
  const minutosFeitos = registros
    .filter((r) => r.materiaId === meta.materiaId && chaveSemanaISO(r.data) === semanaAtual)
    .reduce((soma, r) => soma + r.duracaoMin, 0);

  return {
    minutosFeitos,
    minutosAlvo: meta.minutosAlvo,
    percentual: meta.minutosAlvo > 0 ? Math.min(1, minutosFeitos / meta.minutosAlvo) : 0,
  };
}
