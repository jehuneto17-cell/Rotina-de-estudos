import { useMemo, useState } from 'react';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { useDados } from '../../../hooks/useDados';
import { useRevisoes } from '../../../hooks/useRevisoes';
import { marcarRevisao } from '../../../lib/diario';
import { hojeCivil } from '../../../lib/datas';
import { MateriaIcon } from '../../../components/ui/MateriaIcon';

// Revisão guiada: mostra uma revisão pendente por vez ("Depois" pula pra
// próxima, "Revisei" marca feita), em vez de uma lista pra clicar item a
// item — recupera o modo de revisão do app antigo (DRevisaoView).
export default function RevisaoGuiada() {
  const { usuario } = useAuth();
  const { materias } = useDados();
  const { atrasadas, proximas } = useRevisoes();
  const [puladas, setPuladas] = useState<Set<string>>(new Set());
  const [marcando, setMarcando] = useState(false);

  // Atrasadas primeiro — é o que mais importa revisar agora.
  const fila = useMemo(() => [...atrasadas, ...proximas], [atrasadas, proximas]);
  const restante = fila.filter((r) => !puladas.has(r.id));
  const atual = restante[0];

  async function marcarComoFeita() {
    if (!usuario || !atual) return;
    setMarcando(true);
    try {
      await marcarRevisao(usuario.uid, atual.id, true, hojeCivil());
    } finally {
      setMarcando(false);
    }
  }

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center gap-3 px-6 pt-7 pb-4">
        <Pressable onPress={() => router.back()} className="w-8 h-8 rounded-full border border-border bg-surface items-center justify-center">
          <ChevronLeft size={18} color="#141414" />
        </Pressable>
        <Text className="font-display font-bold text-xl text-text flex-1">Revisão guiada</Text>
      </View>

      {!atual ? (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text-4xl">🎉</Text>
          <Text className="text-textMuted text-[15px] font-medium">Nenhuma revisão pendente por aqui.</Text>
        </View>
      ) : (
        <View className="flex-1 px-6 pt-4">
          <Text className="text-center text-xs text-textFaint font-semibold mb-4">
            {restante.length} revisão{restante.length > 1 ? 'ões' : ''} na fila
          </Text>

          <View className="bg-surface border-[1.5px] border-border rounded-lg px-6 py-8 items-center gap-1 shadow-md">
            <MateriaIconDaRevisao materiaId={atual.materiaId} materias={materias} />
            <Text className="font-display font-bold text-lg text-text text-center mt-3.5">{atual.resumo}</Text>
            <Text className="text-xs text-textFaint mt-1.5">
              previsto para {atual.dataPrevista} · revisão de {atual.intervalo} dia{atual.intervalo > 1 ? 's' : ''}
            </Text>

            <View className="flex-row gap-2.5 mt-6 w-full">
              <Pressable
                onPress={() => setPuladas((s) => new Set([...s, atual.id]))}
                className="flex-1 h-11 rounded-md border-[1.5px] border-border items-center justify-center"
              >
                <Text className="text-textMuted text-[13px] font-bold">⏭ Depois</Text>
              </Pressable>
              <Pressable
                onPress={marcarComoFeita}
                disabled={marcando}
                className="flex-1 h-11 rounded-md bg-primary items-center justify-center"
              >
                <Text className="text-white text-[13px] font-bold">✅ Revisei</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function MateriaIconDaRevisao({
  materiaId,
  materias,
}: {
  materiaId: string | null;
  materias: { id: string; emoji: string; cor: string; nome: string }[];
}) {
  const materia = materias.find((m) => m.id === materiaId);
  return (
    <>
      <MateriaIcon emoji={materia?.emoji ?? '📚'} cor={materia?.cor ?? '#9A9A9A'} tamanho={36} />
      <Text className="text-xs font-semibold text-textFaint mt-1.5">{materia?.nome ?? 'Sem matéria'}</Text>
    </>
  );
}
