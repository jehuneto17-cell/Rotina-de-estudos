import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';
import type { Convite } from '../types/modelos';

/** Convites que EU enviei (sou deUid) — Tela 21, lista de status. */
export function useConvitesEnviados() {
  const { usuario } = useAuth();
  const [convites, setConvites] = useState<Convite[]>([]);

  useEffect(() => {
    if (!usuario) {
      setConvites([]);
      return;
    }
    const ref = query(collection(db, 'convites'), where('deUid', '==', usuario.uid));
    const cancelar = onSnapshot(ref, (snap) => {
      setConvites(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Convite));
    });
    return cancelar;
  }, [usuario]);

  return convites;
}

/** Convites pendentes que EU recebi (paraEmail é o meu e-mail) — Tela 22. */
export function useConvitesRecebidos() {
  const { usuario } = useAuth();
  const [convites, setConvites] = useState<Convite[]>([]);

  useEffect(() => {
    if (!usuario?.email) {
      setConvites([]);
      return;
    }
    const ref = query(
      collection(db, 'convites'),
      where('paraEmail', '==', usuario.email.toLowerCase()),
      where('status', '==', 'pendente')
    );
    const cancelar = onSnapshot(ref, (snap) => {
      setConvites(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Convite));
    });
    return cancelar;
  }, [usuario]);

  return convites;
}
