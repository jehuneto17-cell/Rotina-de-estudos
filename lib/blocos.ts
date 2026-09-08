import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
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

/**
 * Limpa `concluidoEm`/`checks` de todo bloco e rotina — desmarca tudo sem
 * apagar os blocos/rotinas em si. Recupera o "Limpar todos os checks" das
 * Configurações do app antigo.
 */
export async function resetarTodosOsChecks(uid: string): Promise<number> {
  const [blocosSnap, rotinasSnap] = await Promise.all([
    getDocs(collection(db, 'usuarios', uid, 'blocos')),
    getDocs(collection(db, 'usuarios', uid, 'rotinas')),
  ]);

  const batch = writeBatch(db);
  let total = 0;
  blocosSnap.docs.forEach((d) => {
    if (Object.keys(d.data().concluidoEm ?? {}).length === 0) return;
    batch.update(d.ref, { concluidoEm: {} });
    total += 1;
  });
  rotinasSnap.docs.forEach((d) => {
    if (Object.keys(d.data().checks ?? {}).length === 0) return;
    batch.update(d.ref, { checks: {} });
    total += 1;
  });

  if (total > 0) await batch.commit();
  return total;
}
