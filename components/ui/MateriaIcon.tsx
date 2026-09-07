import { Text, View } from 'react-native';

/** Círculo colorido com emoji da matéria — cor vem de materias.cor (DATABASE.md §2.2). */
export function MateriaIcon({ emoji, cor, tamanho = 38 }: { emoji: string; cor: string; tamanho?: number }) {
  return (
    <View
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: tamanho * 0.27,
        backgroundColor: `${cor}22`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: tamanho * 0.47 }}>{emoji}</Text>
    </View>
  );
}
