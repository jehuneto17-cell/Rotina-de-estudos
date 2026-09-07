import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../hooks/useAuth';
import { useDados } from '../../../hooks/useDados';
import { excluirRegistro, marcarRevisao } from '../../../lib/diario';
import { hojeCivil } from '../../../lib/datas';
import { revisaoEstaAtrasada } from '../../../lib/revisoes';
import { MateriaIcon } from '../../../components/ui/MateriaIcon';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import type { RegistroDiario, Revisao } from '../../../types/modelos';

// Tela 14 — detalhe do registro + revisões vinculadas (USER-FLOWS.md).
export default function DetalheRegistro() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario } = useAuth();
  const { materias } = useDados();
  const [registro, setRegistro] = useState<RegistroDiario | null | undefined>(undefined);
  const [revisoes, setRevisoes] = useState<Revisao[]>([]);
  const [menuAberto, setMenuAberto] = useState(false);
  const hoje = hojeCivil();

  useEffect(() => {
    if (!usuario || !id) return;
    const cancelarRegistro = onSnapshot(doc(db, 'usuarios', usuario.uid, 'registros', id), (snap) => {
      setRegistro(snap.exists() ? ({ id: snap.id, ...snap.data() } as RegistroDiario) : null);
    });
    const cancelarRevisoes = onSnapshot(
      query(collection(db, 'usuarios', usuario.uid, 'revisoes'), where('registroId', '==', id), orderBy('intervalo', 'asc')),
      (snap) => setRevisoes(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Revisao))
    );
    return () => { cancelarRegistro(); cancelarRevisoes(); };
  }, [usuario, id]);

  async function excluir() {
    if (!usuario || !id) return;
    await excluirRegistro(usuario.uid, id);
    router.back();
  }

  if (registro === undefined) {
    return <View className="flex-1 bg-bg items-center justify-center"><Text className="text-textFaint">Carregando…</Text></View>;
  }
  if (registro === null) {
    return (
      <View className="flex-1 bg-bg items-center justify-center gap-3.5 px-6">
        <Text className="text-primary text-sm font-semibold">Não foi possível carregar este registro.</Text>
        <Pressable onPress={() => router.back()} className="h-[42px] px-5 rounded-md border border-border items-center justify-center">
          <Text className="text-text text-sm font-semibold">Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const materia = materias.find((m) => m.id === registro.materiaId);

  return (
    <View className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="px-6 pt-6 pb-10 gap-5">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="w-8 h-8 rounded-full border border-rowBorder items-center justify-center">
            <Text className="text-text">‹</Text>
          </Pressable>
          <Text className="text-sm font-semibold text-textMuted">{registro.data}</Text>
          <View>
            <Pressable onPress={() => setMenuAberto((v) => !v)} className="w-8 h-8 rounded-full border border-rowBorder items-center justify-center">
              <Text className="text-text">⋮</Text>
            </Pressable>
            {menuAberto && (
              <View className="absolute right-0 top-[38px] bg-surface border border-border rounded-md shadow-lg min-w-[130px] z-10">
                <Pressable onPress={() => router.push(`/(app)/diario/novo?editar=${id}`)} className="px-3.5 py-2.5">
                  <Text className="text-sm text-text">Editar</Text>
                </Pressable>
                <Pressable onPress={excluir} className="px-3.5 py-2.5">
                  <Text className="text-sm text-primary">Excluir</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        <View className="bg-surface border border-border rounded-card p-4 gap-3">
          <View className="flex-row items-center gap-2.5">
            <MateriaIcon emoji={materia?.emoji ?? '📚'} cor={materia?.cor ?? '#9A9A9A'} />
            <Text className="flex-1 text-xs font-semibold text-textFaint">{materia?.nome ?? 'Sem matéria'}</Text>
            <Text className="text-[13px] text-textFaint">{registro.duracaoMin} min</Text>
          </View>
          <Text className="font-display font-bold text-lg text-text">{registro.conteudo}</Text>
        </View>

        {!!registro.notas && (
          <View>
            <Text className="text-xs font-semibold text-textFaint mb-2">Notas</Text>
            <Text className="text-sm text-text leading-[22px]">{registro.notas}</Text>
          </View>
        )}

        {registro.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5">
            {registro.tags.map((t) => (
              <View key={t} className="bg-neutralBg rounded-pill px-2.5 py-1">
                <Text className="text-xs font-semibold text-textMuted">#{t}</Text>
              </View>
            ))}
          </View>
        )}

        {registro.anexo && (
          <View>
            <Text className="text-xs font-semibold text-textFaint mb-2">Anexo</Text>
            {registro.anexo.tipo.startsWith('image/') ? (
              <Image source={{ uri: registro.anexo.url }} className="w-full h-[180px] rounded-md" resizeMode="cover" />
            ) : (
              <Pressable className="h-[60px] rounded-md border border-border items-center justify-center">
                <Text className="text-textFaint text-sm">📎 {registro.anexo.nome}</Text>
              </Pressable>
            )}
          </View>
        )}

        <View>
          <Text className="text-base font-bold text-text mb-3">Revisões</Text>
          <View className="gap-2">
            {revisoes.map((r) => {
              const atrasada = revisaoEstaAtrasada(r, hoje);
              const tom = r.status === 'feita' ? 'sucesso' : atrasada ? 'erro' : 'neutro';
              const label = r.status === 'feita' ? 'Feita' : atrasada ? 'Atrasada' : 'Pendente';
              return (
                <Pressable
                  key={r.id}
                  onPress={() => marcarRevisao(usuario!.uid, r.id, r.status !== 'feita', hoje)}
                  className="flex-row items-center gap-3 bg-surface border border-border rounded-card px-3.5 py-3"
                >
                  <Text className="flex-1 text-sm font-semibold text-text">Revisão de {r.intervalo} dia{r.intervalo > 1 ? 's' : ''}</Text>
                  <Text className="text-xs text-textFaint">{r.dataPrevista}</Text>
                  <StatusBadge label={label} tom={tom} />
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
