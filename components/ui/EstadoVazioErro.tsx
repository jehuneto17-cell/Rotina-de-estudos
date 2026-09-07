import { Pressable, Text, View } from 'react-native';

/** Estados vazio/erro compartilhados (USER-FLOWS.md §4 — mesmo padrão em toda lista). */
export function EstadoErro({ mensagem, onTentarDeNovo }: { mensagem: string; onTentarDeNovo?: () => void }) {
  return (
    <View className="items-center py-12 px-3 gap-3.5">
      <Text className="text-sm font-semibold text-primary text-center">{mensagem}</Text>
      {onTentarDeNovo && (
        <Pressable
          className="h-[42px] px-5 rounded-md border border-border bg-surface items-center justify-center"
          onPress={onTentarDeNovo}
        >
          <Text className="text-sm font-semibold text-text">Tentar de novo</Text>
        </Pressable>
      )}
    </View>
  );
}

export function EstadoVazio({
  mensagem,
  labelAcao,
  onAcao,
}: {
  mensagem: string;
  labelAcao?: string;
  onAcao?: () => void;
}) {
  return (
    <View className="items-center py-12 px-3 gap-3.5">
      <Text className="text-sm text-textFaint text-center">{mensagem}</Text>
      {labelAcao && onAcao && (
        <Pressable className="h-[42px] px-5 rounded-md bg-text items-center justify-center" onPress={onAcao}>
          <Text className="text-sm font-semibold text-white">{labelAcao}</Text>
        </Pressable>
      )}
    </View>
  );
}
