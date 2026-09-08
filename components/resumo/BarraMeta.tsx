import { Pressable, Text, View } from 'react-native';
import { Card } from '../ui/Card';

function BarraProgresso({ label, feitos, alvo }: { label: string; feitos: number; alvo: number }) {
  const pct = alvo > 0 ? Math.min(100, Math.round((feitos / alvo) * 100)) : 0;
  const horasFeitas = (feitos / 60).toFixed(1).replace(/\.0$/, '');
  const horasAlvo = (alvo / 60).toFixed(1).replace(/\.0$/, '');
  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] text-textFaint">{label}</Text>
        <Text className="text-[11px] text-textFaint">{horasFeitas}h / {horasAlvo}h</Text>
      </View>
      <View className="w-full h-1.5 bg-rowBorder rounded-pill overflow-hidden">
        <View className="h-full bg-primary rounded-pill" style={{ width: `${pct}%` }} />
      </View>
    </View>
  );
}

/** Metas de matéria — semanal e mensal, independentes (Resumo.dc.html "Metas da semana"). */
export function BarraMeta({
  emoji,
  nome,
  minutosFeitos,
  minutosAlvo,
  minutosFeitosMes,
  minutosAlvoMensal,
  onDefinirMeta,
}: {
  emoji: string;
  nome: string;
  minutosFeitos: number;
  minutosAlvo: number | null;
  minutosFeitosMes: number;
  minutosAlvoMensal: number | null;
  onDefinirMeta: () => void;
}) {
  const temSemanal = minutosAlvo != null && minutosAlvo > 0;
  const temMensal = minutosAlvoMensal != null && minutosAlvoMensal > 0;
  const temAlgumaMeta = temSemanal || temMensal;

  return (
    <Card className="gap-2.5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-base">{emoji}</Text>
          <Text className="text-sm font-semibold text-text">{nome}</Text>
        </View>
        <Pressable onPress={onDefinirMeta}>
          <Text className="text-xs font-semibold text-primary">{temAlgumaMeta ? 'Editar' : 'Definir meta'}</Text>
        </Pressable>
      </View>
      {temSemanal && <BarraProgresso label="semana" feitos={minutosFeitos} alvo={minutosAlvo!} />}
      {temMensal && <BarraProgresso label="mês" feitos={minutosFeitosMes} alvo={minutosAlvoMensal!} />}
    </Card>
  );
}
