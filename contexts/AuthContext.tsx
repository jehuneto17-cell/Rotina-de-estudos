import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthState {
  usuario: User | null;
  carregando: boolean;
}

const AuthContext = createContext<AuthState>({ usuario: null, carregando: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Listener reiniciado no login e destruído no logout (ARCHITECTURE.md §3) —
    // essencial em multiusuário: senão o próximo login herda dado do anterior.
    const cancelar = onAuthStateChanged(auth, (u) => {
      setUsuario(u);
      setCarregando(false);
    });
    return cancelar;
  }, []);

  return <AuthContext.Provider value={{ usuario, carregando }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
