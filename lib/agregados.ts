import { calcularStreak } from './streak';
import { contarAtrasadas } from './revisoes';
import { chaveSemanaISO, hojeCivil } from './datas';
import type { Materia, ProgressoPublico, RegistroDiario, Revisao } from '../types/modelos';

const SEMANAS_MANTIDAS = 26; // DATABASE.md §2.9 — poda o resto, mantém o doc bem abaixo de 1 MiB

/**
 * Recalcula o documento inteiro de progressoPublico/{uid} a partir dos dados
 * privados do próprio usuário. Nunca incremental (ARCHITECTURE.md §10) —
 * duas escritas concorrentes de dispositivos diferentes convergem no mesmo valor.
 *
 * Importante: só inclui os campos da allowlist do firestore.rules
 * (agregadoValido). Adicionar campo aqui sem adicionar na rule faz a escrita falhar.
 */
export function montarProgressoPublico(params: {
  nome: string;
  fotoUrl: string | null;
  registros: RegistroDiario[];
  revisoes: Revisao[];
  materias: Materia[];
  hoje?: string;
}): Omit<ProgressoPublico, 'atualizadoEm'> {
  const hoje = params.hoje ?? hojeCivil();
  const mesCorrente = hoje.slice(0, 7); // 'YYYY-MM'

  const diasEstudados = new Set(params.registros.map((r) => r.data));
  const ultimoDiaEstudado = params.registros.length
    ? [...diasEstudados].sort().at(-1)!
    : null;

  const registrosDoMes = params.registros.filter((r) => r.data.startsWith(mesCorrente));
  const diasEstudadosMes = new Set(registrosDoMes.map((r) => r.data)).size;
  const minutosMes = registrosDoMes.reduce((soma, r) => soma + r.duracaoMin, 0);

  const minutosPorMateriaMes: Record<string, number> = {};
  for (const r of registrosDoMes) {
    if (!r.materiaId) continue;
    minutosPorMateriaMes[r.materiaId] = (minutosPorMateriaMes[r.materiaId] ?? 0) + r.duracaoMin;
  }

  const evolucaoSemanal: Record<string, Record<string, number>> = {};
  for (const r of params.registros) {
    if (!r.materiaId) continue;
    const semana = chaveSemanaISO(r.data);
    evolucaoSemanal[semana] ??= {};
    evolucaoSemanal[semana][r.materiaId] = (evolucaoSemanal[semana][r.materiaId] ?? 0) + r.duracaoMin;
  }
  const semanasPodadas = Object.fromEntries(
    Object.entries(evolucaoSemanal)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .slice(0, SEMANAS_MANTIDAS)
  );

  const materiasMap = Object.fromEntries(
    params.materias.map((m) => [m.id, { nome: m.nome, emoji: m.emoji, cor: m.cor }])
  );

  return {
    nome: params.nome,
    fotoUrl: params.fotoUrl,
    streak: calcularStreak(diasEstudados, hoje),
    ultimoDiaEstudado,
    diasEstudadosMes,
    minutosMes,
    revisoesAtrasadas: contarAtrasadas(params.revisoes, hoje),
    materias: materiasMap,
    minutosPorMateriaMes,
    evolucaoSemanal: semanasPodadas,
  };
}
