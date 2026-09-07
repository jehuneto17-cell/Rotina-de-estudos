import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useDados } from '../hooks/useDados';

// Guardas de rota (ARCHITECTURE.md §3):
// 1. Sem usuário autenticado -> /login
// 2. Autenticado e sem matéria cadastrada -> /onboarding
// 3. Caso contrário -> /(app)/hoje
export default function Splash() {
  const { usuario, carregando } = useAuth();
  const { materias, carregandoInicial } = useDados();

  if (carregando || (usuario && carregandoInicial)) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#D42027" />
      </View>
    );
  }

  if (!usuario) return <Redirect href="/login" />;
  if (materias.length === 0) return <Redirect href="/onboarding" />;
  return <Redirect href="/(app)/hoje" />;
}
