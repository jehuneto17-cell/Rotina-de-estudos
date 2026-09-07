import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useProgresso } from '../../../../hooks/useProgresso';

const METRICA_COR = { padrao: 'text-text', atencao: 'text-warning' } as const;

// Tela 23 — Progresso Vinculo.dc.html. Somente-leitura por desenho: este
// componente não expõe NENHUM handler de escrita — lê só progressoPublico/{uid}
// (item #1 do Gate 6, firestore.rules já impede qualquer outra leitura).
export default function ProgressoVinculo() {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  // ponytail: useProgresso não distingue "carregando" de "sem progressoPublico
  // ainda" — os dois caem no estado vazio abaixo. Separar exigiria expor um
  // segundo booleano no hook; adicionar se o "carregando" piscar feio na prática.
  const progresso = useProgresso(uid ?? null);
  const nome = progresso?.nome ?? 'Vínculo';

  return (
    <View className="flex-1 bg-bg px-6 pt-7 gap-4.5">
      <View className="flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} className="w-8 h-8 rounded-full border border-border bg-surface items-center justify-center">
          <Text className="text-text">‹</Text>
        </Pressable>
        <Text className="font-display font-bold text-[19px] text-text">{nome}</Text>
      </View>

      <View className="flex-row items-center gap-2 bg-neutralBg rounded-md px-3.5 py-2.5">
        <Text className="text-sm">👁</Text>
        <Text className="text-[13px] font-semibold text-textMuted">Visualizando progresso de {nome}</Text>
      </View>

      {!progresso ? (
        <View className="items-center py-12 px-3">
          <Text className="text-sm text-textFaint text-center">{nome} ainda não tem dados para mostrar.</Text>
        </View>
      ) : (
        <View className="gap-4">
          <View className="bg-surface border border-border rounded-card p-5 flex-row items-center gap-4">
            <Text className="text-[34px]">🔥</Text>
            <View>
              <Text className="font-display font-bold text-[30px] text-text">{progresso.streak} dias</Text>
              <Text className="text-[13px] text-textMuted mt-0.5">seguidos estudando</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2.5">
            <Metrica label="Dias estudados no mês" valor={String(progresso.diasEstudadosMes)} />
            <Metrica label="Tempo total (mês)" valor={`${Math.round(progresso.minutosMes / 60)}h`} />
            <Metrica label="Revisões atrasadas" valor={String(progresso.revisoesAtrasadas)} tom="atencao" />
          </View>
        </View>
      )}
    </View>
  );
}

function Metrica({ label, valor, tom = 'padrao' }: { label: string; valor: string; tom?: keyof typeof METRICA_COR }) {
  return (
    <View className="bg-surface border border-border rounded-card p-3.5 flex-1 min-w-[45%]">
      <Text className={`font-display font-bold text-2xl ${METRICA_COR[tom]}`}>{valor}</Text>
      <Text className="text-xs text-textMuted mt-1">{label}</Text>
    </View>
  );
}
