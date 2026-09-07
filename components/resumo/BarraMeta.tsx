import { Pressable, Text, View } from 'react-native';
import { Card } from '../ui/Card';

/** Linha de progresso de meta semanal por matéria — Resumo.dc.html "Metas da semana". */
export function BarraMeta({
  emoji,
  nome,
  minutosFeitos,
  minutosAlvo,
  onDefinirMeta,
}: {
  emoji: string;
  nome: string;
  minutosFeitos: number;
  minutosAlvo: number | null;
  onDefinirMeta: () => void;
}) {
  const temMeta = minutosAlvo != null && minutosAlvo > 0;
  const pct = temMeta ? Math.min(100, Math.round((minutosFeitos / minutosAlvo) * 100)) : 0;
  const horasFeitas = (minutosFeitos / 60).toFixed(1).replace(/\.0$/, '');
  const horasAlvo = temMeta ? (minutosAlvo / 60).toFixed(1).replace(/\.0$/, '') : null;

  return (
    <Card className="gap-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-base">{emoji}</Text>
          <Text className="text-sm font-semibold text-text">{nome}</Text>
        </View>
        {temMeta ? (
          <Text className="text-xs text-textFaint">{horasFeitas}h / {horasAlvo}h</Text>
        ) : (
          <Pressable onPress={onDefinirMeta}>
            <Text className="text-xs font-semibold text-primary">Definir meta</Text>
          </Pressable>
        )}
      </View>
      {temMeta && (
        <View className="w-full h-1.5 bg-rowBorder rounded-pill overflow-hidden">
          <View className="h-full bg-primary rounded-pill" style={{ width: `${pct}%` }} />
        </View>
      )}
    </Card>
  );
}
