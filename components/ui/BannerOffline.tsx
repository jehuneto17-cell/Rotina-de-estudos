import { Text, View } from 'react-native';
import { useConexao } from '../../hooks/useConexao';

/**
 * Aviso de "sem conexão" — o Firestore já enfileira escritas offline e
 * sincroniza sozinho ao reconectar (persistência padrão do SDK), então
 * este banner é só um aviso visual, não controla nenhum comportamento.
 * ponytail: um indicador granular de "sincronizando/sincronizado/erro"
 * (como o app antigo tinha) foi deixado de fora — com onSnapshot em tudo
 * e fila automática do SDK, esse status extra seria cosmético; o banner
 * já cobre o momento que realmente importa (você está sem internet).
 */
export function BannerOffline() {
  const { online } = useConexao();
  if (online) return null;

  return (
    <View className="bg-warning py-1.5 items-center">
      <Text className="text-white text-xs font-bold">📵 Sem conexão — alterações serão sincronizadas ao reconectar</Text>
    </View>
  );
}
