import { Pressable, Text } from 'react-native';
import { Card } from '../ui/Card';

export function MetricCard({
  label,
  value,
  color = 'text-text',
  onPress,
}: {
  label: string;
  value: string;
  color?: string;
  onPress?: () => void;
}) {
  const conteudo = (
    <>
      <Text className={`font-display font-bold text-[26px] ${color}`}>{value}</Text>
      <Text className="text-textMuted text-xs mt-1">{label}</Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="flex-1 min-w-[45%]">
        <Card className="p-3.5">{conteudo}</Card>
      </Pressable>
    );
  }

  return <Card className="flex-1 min-w-[45%] p-3.5">{conteudo}</Card>;
}
