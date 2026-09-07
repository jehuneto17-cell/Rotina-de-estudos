import { Pressable, Text } from 'react-native';

/** Chip de filtro selecionável (disciplina, tag) — usado no Diário e em listas com filtro. */
export function Chip({
  label,
  selected,
  onPress,
  tom = 'neutro',
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** 'neutro' = preto/branco (disciplina); 'tag' = borda tracejada vermelha */
  tom?: 'neutro' | 'tag';
}) {
  if (tom === 'tag') {
    return (
      <Pressable
        onPress={onPress}
        className={`h-[26px] px-2.5 rounded-pill justify-center ${
          selected ? 'bg-primaryFaint border border-primary' : 'border border-dashed border-border'
        }`}
      >
        <Text className={`text-[11px] font-semibold ${selected ? 'text-primary' : 'text-textFaint'}`}>
          #{label}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className={`h-8 px-3.5 rounded-pill justify-center ${
        selected ? 'bg-text border border-text' : 'bg-surface border border-border'
      }`}
    >
      <Text className={`text-[13px] font-semibold ${selected ? 'text-white' : 'text-text'}`}>{label}</Text>
    </Pressable>
  );
}
