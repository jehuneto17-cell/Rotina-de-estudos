import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from './firebase';
import type { RegistroDiario, Revisao } from '../types/modelos';

/**
 * Busca registros num intervalo de datas (query pontual, não onSnapshot —
 * tela de relatório não precisa de tempo real). Filtro por `data` (string
 * 'YYYY-MM-DD') usa o índice single-field automático do Firestore, sem
 * precisar de índice composto novo.
 */
export async function buscarRegistrosPeriodo(uid: string, dataInicio: string, dataFim: string): Promise<RegistroDiario[]> {
  const ref = query(
    collection(db, 'usuarios', uid, 'registros'),
    where('data', '>=', dataInicio),
    where('data', '<=', dataFim),
    orderBy('data', 'asc')
  );
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RegistroDiario);
}

/** Mesma ideia, mas para revisões previstas no período — usado no relatório mensal. */
export async function buscarRevisoesPeriodo(uid: string, dataInicio: string, dataFim: string): Promise<Revisao[]> {
  const ref = query(
    collection(db, 'usuarios', uid, 'revisoes'),
    where('dataPrevista', '>=', dataInicio),
    where('dataPrevista', '<=', dataFim)
  );
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Revisao);
}
