import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/** Estado de conectividade — usado pro banner "sem conexão" global. */
export function useConexao() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const cancelar = NetInfo.addEventListener((estado) => {
      setOnline(estado.isConnected !== false);
    });
    return cancelar;
  }, []);

  return { online };
}
