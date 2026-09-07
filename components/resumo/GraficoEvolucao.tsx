import { Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Card } from '../ui/Card';

export interface DiaEvolucao {
  label: string;
  minutos: number;
}

/** Gráfico de barras dos últimos 7 dias de uma matéria — desenho próprio via react-native-svg (ARCHITECTURE.md §1). */
export function GraficoEvolucao({
  materias,
  materiaSelecionadaId,
  onSelecionar,
  dias,
}: {
  materias: Array<{ id: string; nome: string; emoji: string }>;
  materiaSelecionadaId: string | null;
  onSelecionar: (id: string) => void;
  dias: DiaEvolucao[];
}) {
  const largura = 300;
  const altura = 100;
  const max = Math.max(1, ...dias.map((d) => d.minutos));
  const larguraBarra = largura / dias.length - 8;

  return (
    <View className="gap-3.5">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pb-1">
        {materias.map((m) => {
          const selecionada = m.id === materiaSelecionadaId;
          return (
            <Pressable
              key={m.id}
              onPress={() => onSelecionar(m.id)}
              className={`h-[34px] px-3.5 rounded-pill justify-center border ${
                selecionada ? 'bg-primaryFaint border-primary' : 'bg-surface border-border'
              }`}
            >
              <Text className={`text-sm font-semibold ${selecionada ? 'text-primary' : 'text-text'}`}>
                {m.emoji} {m.nome}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Card>
        <Svg width="100%" height={altura} viewBox={`0 0 ${largura} ${altura}`}>
          {dias.map((d, i) => {
            const h = Math.max(4, (d.minutos / max) * altura);
            const x = i * (largura / dias.length) + 4;
            return (
              <Rect key={i} x={x} y={altura - h} width={larguraBarra} height={h} rx={3} fill="#D42027" />
            );
          })}
        </Svg>
        <View className="flex-row justify-between mt-1.5">
          {dias.map((d, i) => (
            <Text key={i} className="text-[10px] text-textFaint">{d.label}</Text>
          ))}
        </View>
      </Card>
    </View>
  );
}
