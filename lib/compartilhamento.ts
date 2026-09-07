import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Convite } from '../types/modelos';

/**
 * Envia um convite: EU (deUid) quero poder ver o progresso de `paraEmail`.
 * Regra do Firestore: só quem cria pode ser o próprio deUid, e paraEmail não
 * pode ser o próprio e-mail (USER-FLOWS §3.8 passo 2, firestore.rules).
 */
export async function enviarConvite(params: { deUid: string; deNome: string; paraEmail: string }) {
  await addDoc(collection(db, 'convites'), {
    deUid: params.deUid,
    deNome: params.deNome,
    paraEmail: params.paraEmail.trim().toLowerCase(),
    status: 'pendente',
    criadoEm: serverTimestamp(),
  });
}

/**
 * Aceita um convite recebido: EU (dono do dado, paraEmail) autorizo `convite.deUid`
 * a ver meu progresso. writeBatch: status do convite + criação do vínculo, atômico
 * (USER-FLOWS §3.8 passo 4; firestore.rules — só o convidado muda o status).
 */
export async function aceitarConvite(convite: Convite, meuUid: string) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'convites', convite.id), { status: 'aceito' });
  batch.set(doc(db, 'vinculos', meuUid, 'visualizadores', convite.deUid), {
    nomeVisualizador: convite.deNome,
    criadoEm: serverTimestamp(),
  });
  await batch.commit();
}

export async function recusarConvite(conviteId: string) {
  await updateDoc(doc(db, 'convites', conviteId), { status: 'recusado' });
}

/**
 * Revoga um vínculo — funciona tanto pro dono removendo um observador quanto
 * pro observador saindo por conta própria (firestore.rules permite os dois).
 */
export async function removerVinculo(donoUid: string, visualizadorUid: string) {
  await deleteDoc(doc(db, 'vinculos', donoUid, 'visualizadores', visualizadorUid));
}
