import { Text, View } from 'react-native';

const TONS = {
  sucesso: { bg: 'bg-successBg', fg: 'text-success' },
  pendente: { bg: 'bg-warningBg', fg: 'text-warning' },
  erro: { bg: 'bg-primaryFaint', fg: 'text-primary' },
  neutro: { bg: 'bg-neutralBg', fg: 'text-textMuted' },
} as const;

/** Badge semântico (DESIGN-SYSTEM.md §1: fundo suave + texto forte, nunca cor isolada). */
export function StatusBadge({ label, tom }: { label: string; tom: keyof typeof TONS }) {
  const { bg, fg } = TONS[tom];
  return (
    <View className={`px-2.5 py-1 rounded-pill ${bg}`}>
      <Text className={`text-[11px] font-bold ${fg}`}>{label}</Text>
    </View>
  );
}
