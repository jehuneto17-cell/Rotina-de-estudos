import { Text, View } from 'react-native';

// Placeholder — Tela 2 do UI-SPEC.md. Guarda: sem matéria cadastrada,
// index.tsx sempre redireciona pra cá (onboarding obrigatório).
export default function Onboarding() {
  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-lg text-text">Cadastre sua primeira matéria para começar.</Text>
    </View>
  );
}
