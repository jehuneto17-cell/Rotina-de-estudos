import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useDados } from '../../../../hooks/useDados';
import { FormBloco } from '../../../../components/grade/FormBloco';

// Tela 4 (modo editar).
export default function EditarBloco() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { blocos } = useDados();
  const bloco = blocos.find((b) => b.id === id);

  if (!bloco) {
    return (
      <View className="flex-1 bg-black/45 justify-end">
        <View className="bg-surface rounded-t-lg p-6 items-center gap-3.5">
          <Text className="text-sm font-semibold text-primary">Bloco não encontrado.</Text>
          <Pressable onPress={() => router.back()} className="h-[42px] px-5 rounded-md border border-border items-center justify-center">
            <Text className="text-text text-sm font-semibold">Voltar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return <FormBloco modo="editar" blocoExistente={bloco} diaSemanaPadrao={bloco.diaSemana} />;
}
