import { useEffect, useState } from 'react';
import { collectionGroup, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

/** De quem EU (visualizador) posso ver o progresso — Tela 24, via collectionGroup. */
export function useVinculos() {
  const { usuario } = useAuth();
  const [donoUids, setDonoUids] = useState<string[]>([]);

  useEffect(() => {
    if (!usuario) {
      setDonoUids([]);
      return;
    }
    // Sem where(): a rule (`ehDono(donoUid) || ehDono(visualizadorUid)`) depende só
    // do path do documento, então o Firestore filtra por doc — só voltam os meus.
    const ref = collectionGroup(db, 'visualizadores');
    const cancelar = onSnapshot(ref, (snap) => {
      setDonoUids(snap.docs.map((d) => d.ref.parent.parent!.id));
    });
    return cancelar;
  }, [usuario]);

  return { donoUids };
}
