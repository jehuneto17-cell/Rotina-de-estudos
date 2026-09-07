import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import type { Bloco, Materia, Meta, Rotina, Tarefa } from '../types/modelos';

interface DadosState {
  materias: Materia[];
  blocos: Bloco[];
  rotinas: Rotina[];
  tarefas: Tarefa[];
  metas: Meta[];
  carregandoInicial: boolean;
  offline: boolean;
}

const vazio: DadosState = {
  materias: [],
  blocos: [],
  rotinas: [],
  tarefas: [],
  metas: [],
  carregandoInicial: true,
  offline: false,
};

const DadosContext = createContext<DadosState>(vazio);

const CHAVE_CACHE = 'cache_dados_v1';

function useColecao<T extends { id: string }>(uid: string | null, nome: string) {
  const [itens, setItens] = useState<T[]>([]);

  useEffect(() => {
    if (!uid) {
      setItens([]);
      return;
    }
    const ref = query(collection(db, 'usuarios', uid, nome));
    // Cleanup sempre retornado (ARCHITECTURE.md §3) — evita listener herdado entre usuários.
    const cancelar = onSnapshot(ref, (snap) => {
      setItens(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T));
    });
    return cancelar;
  }, [uid, nome]);

  return itens;
}

export function DadosProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const uid = usuario?.uid ?? null;

  const materias = useColecao<Materia>(uid, 'materias');
  const blocos = useColecao<Bloco>(uid, 'blocos');
  const rotinas = useColecao<Rotina>(uid, 'rotinas');
  const tarefas = useColecao<Tarefa>(uid, 'tarefas');
  const metas = useColecao<Meta>(uid, 'metas');

  // Hidrata do cache antes do 1º snapshot (estado "offline — última grade salva").
  useEffect(() => {
    if (!uid) return;
    AsyncStorage.setItem(
      CHAVE_CACHE,
      JSON.stringify({ materias, blocos, rotinas, tarefas, metas })
    ).catch(() => {});
  }, [uid, materias, blocos, rotinas, tarefas, metas]);

  const carregandoInicial = !!uid && materias.length === 0 && blocos.length === 0;

  return (
    <DadosContext.Provider
      value={{ materias, blocos, rotinas, tarefas, metas, carregandoInicial, offline: false }}
    >
      {children}
    </DadosContext.Provider>
  );
}

export function useDados() {
  return useContext(DadosContext);
}
