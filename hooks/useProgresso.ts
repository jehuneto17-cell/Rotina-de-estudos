import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { ProgressoPublico } from '../types/modelos';

/** Lê progressoPublico/{uid} — do próprio usuário ou de um vínculo (Tela 23). */
export function useProgresso(uid: string | null) {
  const [progresso, setProgresso] = useState<ProgressoPublico | null>(null);

  useEffect(() => {
    if (!uid) {
      setProgresso(null);
      return;
    }
    const cancelar = onSnapshot(doc(db, 'progressoPublico', uid), (snap) => {
      setProgresso(snap.exists() ? (snap.data() as ProgressoPublico) : null);
    });
    return cancelar;
  }, [uid]);

  return progresso;
}
