import { Pressable, Text, View } from 'react-native';

/** Heatmap simples de "estudou nesse dia" para o mês corrente — grade clicável. */
export function MapaAtividade({
  diasNoMes,
  diasEstudados,
  diasComRevisao,
  hoje,
  onSelecionarDia,
}: {
  diasNoMes: number;
  diasEstudados: Set<string>; // 'YYYY-MM-DD'
  diasComRevisao: Set<string>;
  hoje: string;
  onSelecionarDia: (dataCivil: string) => void;
}) {
  const prefixo = hoje.slice(0, 8); // 'YYYY-MM-'
  return (
    <View className="flex-row flex-wrap gap-1.5">
      {Array.from({ length: diasNoMes }, (_, i) => {
        const dia = i + 1;
        const dataCivil = `${prefixo}${String(dia).padStart(2, '0')}`;
        const estudou = diasEstudados.has(dataCivil);
        const temRevisao = diasComRevisao.has(dataCivil);
        const ehHoje = dataCivil === hoje;
        return (
          <Pressable
            key={dia}
            onPress={() => onSelecionarDia(dataCivil)}
            className={`w-7 h-7 rounded-[6px] items-center justify-center ${
              estudou ? 'bg-success' : temRevisao ? 'bg-warningBg' : 'bg-neutralBg'
            } ${ehHoje ? 'border-[1.5px] border-primary' : ''}`}
          >
            <Text className={`text-[10px] font-bold ${estudou ? 'text-white' : 'text-textMuted'}`}>{dia}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
