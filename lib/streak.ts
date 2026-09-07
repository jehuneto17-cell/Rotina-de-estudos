import { ehDiaNaoLetivo, somarDias } from './datas';

/**
 * Streak de dias estudados (PRODUCT-SPEC): sábado, domingo e feriado nacional
 * NÃO quebram o streak automaticamente — só quebra um dia útil sem registro.
 * Se houver registro num dia não letivo, ele conta normalmente.
 *
 * @param diasEstudados Set de datas civis ('YYYY-MM-DD') com pelo menos 1 registro no diário.
 * @param hoje Data civil de hoje.
 */
export function calcularStreak(diasEstudados: Set<string>, hoje: string): number {
  let streak = 0;
  let cursor = hoje;
  let ehPrimeiroDia = true;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (diasEstudados.has(cursor)) {
      streak += 1;
      cursor = somarDias(cursor, -1);
      ehPrimeiroDia = false;
      continue;
    }

    if (ehDiaNaoLetivo(cursor)) {
      cursor = somarDias(cursor, -1);
      ehPrimeiroDia = false;
      continue;
    }

    // Hoje ainda não tem registro, mas o dia não acabou — não quebra ainda.
    if (ehPrimeiroDia) {
      cursor = somarDias(cursor, -1);
      ehPrimeiroDia = false;
      continue;
    }

    break;
  }

  return streak;
}
