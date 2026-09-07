import { Pressable, Text } from 'react-native';

/** Círculo de check/desmarcar — usado em Rotinas, Tarefas avulsas e Grade. */
export function CheckToggle({ done, onToggle, tamanho = 26 }: { done: boolean; onToggle: () => void; tamanho?: number }) {
  return (
    <Pressable
      onPress={onToggle}
      style={{ width: tamanho, height: tamanho, borderRadius: tamanho / 2 }}
      className={`items-center justify-center ${done ? 'bg-success' : 'bg-surface border-[1.5px] border-border'}`}
    >
      {done && <Text className="text-white text-xs">✓</Text>}
    </Pressable>
  );
}
