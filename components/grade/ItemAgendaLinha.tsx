import { Pressable, Text, View } from 'react-native';
import { MateriaIcon } from '../ui/MateriaIcon';
import { CheckToggle } from '../ui/CheckToggle';
import { StatusBadge } from '../ui/StatusBadge';

export interface ItemAgenda {
  tipo: 'bloco' | 'rotina';
  id: string;
  titulo: string;
  materiaId: string | null;
  horaInicio: string;
  horaFim: string;
  concluido: boolean;
}

/** Linha de bloco/rotina na grade do dia — mesmo card em Grade Semanal e Modo Foco. */
export function ItemAgendaLinha({
  item,
  emoji,
  cor,
  isNow,
  onToggle,
  onPress,
}: {
  item: ItemAgenda;
  emoji: string;
  cor: string;
  isNow: boolean;
  onToggle: () => void;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className={`flex-row items-center gap-3 bg-surface rounded-card p-3.5 ${
        isNow ? 'border-[1.5px] border-primary' : 'border border-border'
      }`}
    >
      <View className="min-w-[52px] gap-0.5">
        <Text className="text-[13px] font-semibold text-text">{item.horaInicio}</Text>
        <Text className="text-xs text-textFaint">{item.horaFim}</Text>
      </View>

      <MateriaIcon emoji={emoji} cor={cor} tamanho={38} />

      <View className="flex-1 gap-1">
        <Text
          className={`text-sm font-semibold ${item.concluido ? 'text-textFaint line-through' : 'text-text'}`}
          numberOfLines={1}
        >
          {item.titulo}
        </Text>
        {isNow && <StatusBadge label="AGORA" tom="erro" />}
      </View>

      <CheckToggle done={item.concluido} onToggle={onToggle} />
    </Pressable>
  );
}
