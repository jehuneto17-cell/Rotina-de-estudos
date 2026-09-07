import { useEffect, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query, type QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';
import type { RegistroDiario } from '../types/modelos';

const PAGINA = 30; // ARCHITECTURE.md/DATABASE.md — coleção sem teto, sempre com limit + cursor

export function useRegistrosDiario() {
  const { usuario } = useAuth();
  const [registros, setRegistros] = useState<RegistroDiario[]>([]);
  const [ultimoDoc, setUltimoDoc] = useState<QueryDocumentSnapshot | null>(null);

  useEffect(() => {
    if (!usuario) {
      setRegistros([]);
      return;
    }
    const ref = query(
      collection(db, 'usuarios', usuario.uid, 'registros'),
      orderBy('data', 'desc'),
      limit(PAGINA)
    );
    const cancelar = onSnapshot(ref, (snap) => {
      setRegistros(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RegistroDiario));
      setUltimoDoc(snap.docs.at(-1) ?? null);
    });
    return cancelar;
  }, [usuario]);

  return { registros, ultimoDoc, temMaisPaginas: registros.length === PAGINA };
}
