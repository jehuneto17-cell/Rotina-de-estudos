import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function criarBloco(uid: string, dados: {
  titulo: string;
  materiaId: string;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
}) {
  await addDoc(collection(db, 'usuarios', uid, 'blocos'), {
    ...dados,
    rotinaId: null,
    concluidoEm: {},
    criadoEm: serverTimestamp(),
  });
}

export async function atualizarBloco(uid: string, blocoId: string, dados: {
  titulo: string;
  materiaId: string;
  horaInicio: string;
  horaFim: string;
}) {
  await updateDoc(doc(db, 'usuarios', uid, 'blocos', blocoId), dados);
}

/**
 * "Transformar em rotina" (item 5 do MVP): cria a rotina recorrente e apaga o
 * bloco pontual original — a grade do dia passa a mostrar a rotina no lugar
 * dele (DATABASE.md §2.4: rotina não materializa blocos, é união na leitura).
 */
export async function converterBlocoEmRotina(
  uid: string,
  bloco: { titulo: string; materiaId: string | null; horaInicio: string; horaFim: string },
  blocoId: string,
  diasSemana: number[]
) {
  await setDoc(doc(collection(db, 'usuarios', uid, 'rotinas')), {
    titulo: bloco.titulo,
    materiaId: bloco.materiaId,
    diasSemana,
    horaInicio: bloco.horaInicio,
    horaFim: bloco.horaFim,
    ativa: true,
    checks: {},
    criadoEm: serverTimestamp(),
  });
  await deleteDoc(doc(db, 'usuarios', uid, 'blocos', blocoId));
}
