import { Text } from 'react-native';
import { Card } from '../ui/Card';

export function MetricCard({ label, value, color = 'text-text' }: { label: string; value: string; color?: string }) {
  return (
    <Card className="flex-1 min-w-[45%] p-3.5">
      <Text className={`font-display font-bold text-[26px] ${color}`}>{value}</Text>
      <Text className="text-textMuted text-xs mt-1">{label}</Text>
    </Card>
  );
}
