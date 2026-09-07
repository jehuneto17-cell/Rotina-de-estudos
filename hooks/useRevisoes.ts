import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';
import { hojeCivil } from '../lib/datas';
import { revisaoEstaAtrasada } from '../lib/revisoes';
import type { Revisao } from '../types/modelos';

export function useRevisoes() {
  const { usuario } = useAuth();
  const [revisoes, setRevisoes] = useState<Revisao[]>([]);

  useEffect(() => {
    if (!usuario) {
      setRevisoes([]);
      return;
    }
    const ref = query(
      collection(db, 'usuarios', usuario.uid, 'revisoes'),
      where('status', '==', 'pendente'),
      orderBy('dataPrevista', 'asc')
    );
    const cancelar = onSnapshot(ref, (snap) => {
      setRevisoes(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Revisao));
    });
    return cancelar;
  }, [usuario]);

  const hoje = hojeCivil();
  const atrasadas = revisoes.filter((r) => revisaoEstaAtrasada(r, hoje));
  const proximas = revisoes.filter((r) => !revisaoEstaAtrasada(r, hoje));

  return { revisoes, atrasadas, proximas };
}
