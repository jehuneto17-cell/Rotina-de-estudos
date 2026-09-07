import { Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Card } from '../ui/Card';

export interface MesDados {
  label: string;
  dias: number;
  destaque?: boolean;
}

/** Barras de "dias estudados por mês" — últimos N meses, desenho próprio via react-native-svg. */
export function GraficoMeses({ meses }: { meses: MesDados[] }) {
  const largura = 260;
  const altura = 90;
  const max = Math.max(1, ...meses.map((m) => m.dias));
  const larguraBarra = largura / meses.length - 14;

  return (
    <Card>
      <Svg width="100%" height={altura} viewBox={`0 0 ${largura} ${altura}`}>
        {meses.map((m, i) => {
          const h = Math.max(4, (m.dias / max) * (altura - 18));
          const x = i * (largura / meses.length) + 7;
          return (
            <Rect
              key={i}
              x={x}
              y={altura - 18 - h}
              width={larguraBarra}
              height={h}
              rx={3}
              fill={m.destaque ? '#D42027' : '#E8B8BA'}
            />
          );
        })}
      </Svg>
      <View className="flex-row justify-between mt-1">
        {meses.map((m, i) => (
          <View key={i} className="items-center" style={{ width: largura / meses.length }}>
            <Text className="text-[11px] font-bold text-text">{m.dias}</Text>
            <Text className="text-[10px] text-textFaint">{m.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
