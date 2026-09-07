import { Text, View, Pressable } from 'react-native';

// Placeholder — a UI real desta tela vem do prompt "Tela 1" em UI-SPEC.md,
// colado no Claude Designer. Aqui só o suficiente para o guard de rota funcionar.
export default function Login() {
  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-2xl font-bold text-text mb-6">Rotina de Estudos</Text>
      <Pressable className="bg-primary rounded-md px-5 py-3">
        <Text className="text-white font-semibold">Continuar com Google</Text>
      </Pressable>
    </View>
  );
}
