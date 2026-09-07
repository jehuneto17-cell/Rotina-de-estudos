import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { gerarRevisoes } from './revisoes';
import type { Anexo } from '../types/modelos';

/** Registra a sessão + gera as 4 revisões (1/3/7/15) num writeBatch — atômico (DATABASE.md §4). */
export async function criarRegistro(params: {
  uid: string;
  materiaId: string;
  conteudo: string;
  duracaoMin: number;
  notas: string;
  data: string;
  tags: string[];
  anexo: Anexo | null;
  origem: 'manual' | 'pomodoro';
}) {
  const batch = writeBatch(db);
  const registroRef = doc(collection(db, 'usuarios', params.uid, 'registros'));

  batch.set(registroRef, {
    materiaId: params.materiaId,
    conteudo: params.conteudo,
    duracaoMin: params.duracaoMin,
    notas: params.notas || null,
    data: params.data,
    tags: params.tags,
    anexo: params.anexo,
    origem: params.origem,
    criadoEm: serverTimestamp(),
  });

  const revisoes = gerarRevisoes({
    registroId: registroRef.id,
    materiaId: params.materiaId,
    resumo: params.conteudo,
    dataRegistro: params.data,
  });
  for (const revisao of revisoes) {
    const revisaoRef = doc(collection(db, 'usuarios', params.uid, 'revisoes'));
    batch.set(revisaoRef, { ...revisao, criadoEm: serverTimestamp() });
  }

  await batch.commit();
  return registroRef.id;
}

/** Edita um registro existente — nunca regenera as 4 revisões já criadas na origem. */
export async function atualizarRegistro(params: {
  uid: string;
  registroId: string;
  materiaId: string;
  conteudo: string;
  duracaoMin: number;
  notas: string;
  data: string;
  tags: string[];
}) {
  await updateDoc(doc(db, 'usuarios', params.uid, 'registros', params.registroId), {
    materiaId: params.materiaId,
    conteudo: params.conteudo,
    duracaoMin: params.duracaoMin,
    notas: params.notas || null,
    data: params.data,
    tags: params.tags,
  });
}

/** Exclui o registro e todas as revisões vinculadas — nunca revisão órfã (DATABASE.md §4). */
export async function excluirRegistro(uid: string, registroId: string) {
  const revisoesSnap = await getDocs(
    query(collection(db, 'usuarios', uid, 'revisoes'), where('registroId', '==', registroId))
  );
  const batch = writeBatch(db);
  batch.delete(doc(db, 'usuarios', uid, 'registros', registroId));
  revisoesSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

/** Marcar/desmarcar revisão — idempotente, sem contador (DATABASE.md §4). */
export async function marcarRevisao(uid: string, revisaoId: string, feita: boolean, hoje: string) {
  await updateDoc(doc(db, 'usuarios', uid, 'revisoes', revisaoId), {
    status: feita ? 'feita' : 'pendente',
    feitaEm: feita ? hoje : null,
  });
}
