import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { chaveSemanaISO } from './datas';
import type { Meta, RegistroDiario } from '../types/modelos';

/**
 * Progresso de meta semanal E mensal — nenhum dos dois é campo gravado
 * (DATABASE.md §2.8), é soma dos registros do período calculada aqui.
 */
export function progressoDaMeta(meta: Meta, registros: RegistroDiario[], hoje: string) {
  const semanaAtual = chaveSemanaISO(hoje);
  const mesAtual = hoje.slice(0, 7);

  const doMaterial = registros.filter((r) => r.materiaId === meta.materiaId);
  const minutosFeitos = doMaterial
    .filter((r) => chaveSemanaISO(r.data) === semanaAtual)
    .reduce((soma, r) => soma + r.duracaoMin, 0);
  const minutosFeitosMes = doMaterial
    .filter((r) => r.data.startsWith(mesAtual))
    .reduce((soma, r) => soma + r.duracaoMin, 0);

  return {
    minutosFeitos,
    minutosAlvo: meta.minutosAlvo,
    percentual: meta.minutosAlvo > 0 ? Math.min(1, minutosFeitos / meta.minutosAlvo) : 0,
    minutosFeitosMes,
    minutosAlvoMensal: meta.minutosAlvoMensal,
    percentualMensal:
      meta.minutosAlvoMensal && meta.minutosAlvoMensal > 0
        ? Math.min(1, minutosFeitosMes / meta.minutosAlvoMensal)
        : 0,
  };
}

/** Cria/atualiza a meta de uma matéria — id determinístico = materiaId (DATABASE.md §2.8). */
export async function definirMeta(params: {
  uid: string;
  materiaId: string;
  minutosAlvo: number; // 0 = sem meta semanal
  minutosAlvoMensal: number; // 0 = sem meta mensal
}) {
  await setDoc(doc(db, 'usuarios', params.uid, 'metas', params.materiaId), {
    materiaId: params.materiaId,
    minutosAlvo: params.minutosAlvo || 0,
    minutosAlvoMensal: params.minutosAlvoMensal || null,
    criadoEm: serverTimestamp(),
  });
}
