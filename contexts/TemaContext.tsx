import { createContext, useContext, type ReactNode } from 'react';

// MVP: tema claro fixo (DESIGN-SYSTEM.md não define modo escuro).
// ponytail: se um modo escuro entrar em v2, troca aqui por estado + AsyncStorage.
const TemaContext = createContext<'claro'>('claro');

export function TemaProvider({ children }: { children: ReactNode }) {
  return <TemaContext.Provider value="claro">{children}</TemaContext.Provider>;
}

export function useTema() {
  return useContext(TemaContext);
}
