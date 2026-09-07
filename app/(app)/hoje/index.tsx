import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../hooks/useAuth';
import { useDados } from '../../../hooks/useDados';
import { useRevisoes } from '../../../hooks/useRevisoes';
import { useProgresso } from '../../../hooks/useProgresso';
import { diaSemanaDe, formatarDiaLongo, horaAtualHHmm, somarDias, hojeCivil } from '../../../lib/datas';
import { ItemAgendaLinha, type ItemAgenda } from '../../../components/grade/ItemAgendaLinha';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EstadoVazio } from '../../../components/ui/EstadoVazioErro';

// Telas 3 (Grade Semanal) + 20 (Modo Foco do Dia) — foco do dia é um estado da
// grade (ARCHITECTURE.md §2): só aparece quando dayOffset === 0.
export default function Hoje() {
  const { usuario } = useAuth();
  const { materias, blocos, rotinas, carregandoInicial } = useDados();
  const { atrasadas, proximas } = useRevisoes();
  const progresso = useProgresso(usuario?.uid ?? null);
  const [dayOffset, setDayOffset] = useState(0);

  const hoje = hojeCivil();
  const data = somarDias(hoje, dayOffset);
  const diaSemanaAlvo = diaSemanaDe(data);
  const { nomeDia, dataCurta } = formatarDiaLongo(data);
  const ehHoje = dayOffset === 0;
  const horaAtual = horaAtualHHmm();

  const materiasPorId = useMemo(() => new Map(materias.map((m) => [m.id, m])), [materias]);

  const itens: ItemAgenda[] = useMemo(() => {
    const doBlocos: ItemAgenda[] = blocos
      .filter((b) => b.diaSemana === diaSemanaAlvo)
      .map((b) => ({
        tipo: 'bloco',
        id: b.id,
        titulo: b.titulo,
        materiaId: b.materiaId,
        horaInicio: b.horaInicio,
        horaFim: b.horaFim,
        concluido: !!b.concluidoEm[data],
      }));
    const doRotinas: ItemAgenda[] = rotinas
      .filter((r) => r.ativa && r.diasSemana.includes(diaSemanaAlvo))
      .map((r) => ({
        tipo: 'rotina',
        id: r.id,
        titulo: r.titulo,
        materiaId: r.materiaId,
        horaInicio: r.horaInicio,
        horaFim: r.horaFim,
        concluido: !!r.checks[data],
      }));
    return [...doBlocos, ...doRotinas].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }, [blocos, rotinas, diaSemanaAlvo, data]);

  async function alternar(item: ItemAgenda) {
    if (!usuario) return;
    const colecao = item.tipo === 'bloco' ? 'blocos' : 'rotinas';
    const campo = item.tipo === 'bloco' ? 'concluidoEm' : 'checks';
    await updateDoc(doc(db, 'usuarios', usuario.uid, colecao, item.id), {
      [`${campo}.${data}`]: !item.concluido,
    });
  }

  const proximaRevisao = proximas[0];
  const sugestao = itens.find((i) => !i.concluido);

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-6 pt-7 pb-3">
        <Pressable
          onPress={() => setDayOffset((o) => o - 1)}
          className="w-9 h-9 rounded-full border border-border bg-surface items-center justify-center"
        >
          <Text className="text-text text-base">‹</Text>
        </Pressable>
        <View className="items-center">
          <Text className="font-display font-bold text-[19px] text-text">{nomeDia}</Text>
          <Text className="text-[13px] text-textFaint mt-0.5">{dataCurta}</Text>
        </View>
        <Pressable
          onPress={() => setDayOffset((o) => o + 1)}
          className="w-9 h-9 rounded-full border border-border bg-surface items-center justify-center"
        >
          <Text className="text-text text-base">›</Text>
        </Pressable>
      </View>

      {ehHoje && atrasadas.length > 0 && (
        <View className="mx-6 mb-1 bg-warningBg rounded-md px-3.5 py-3 flex-row items-center justify-between gap-2.5">
          <Text className="text-[13px] font-semibold text-warning flex-1">
            Você tem {atrasadas.length} revisão{atrasadas.length > 1 ? 'ões' : ''} atrasada{atrasadas.length > 1 ? 's' : ''}
          </Text>
          <Pressable onPress={() => router.push('/(app)/diario')}>
            <Text className="text-[13px] font-bold text-warning underline">Ver agora</Text>
          </Pressable>
        </View>
      )}

      <ScrollView contentContainerClassName="px-6 pt-2 pb-[100px] gap-3.5">
        {ehHoje && (
          <View className="bg-primaryFaint rounded-card p-[18px] gap-3">
            <Text className="text-xs font-bold text-primary tracking-wide">SUGESTÃO DE HOJE</Text>
            {sugestao ? (
              <>
                <Text className="font-display font-bold text-[17px] text-text">
                  {sugestao.horaInicio} — {sugestao.titulo}
                </Text>
                {proximaRevisao && (
                  <Text className="text-[13px] text-textMuted">Revisão pendente: {proximaRevisao.resumo}</Text>
                )}
                {!!progresso?.streak && (
                  <Text className="text-[13px] font-semibold text-warning">
                    Estude hoje para manter seu streak de {progresso.streak} dias.
                  </Text>
                )}
                <Pressable
                  onPress={() => alternar(sugestao)}
                  className="self-start h-[42px] px-5 rounded-md bg-primary items-center justify-center"
                >
                  <Text className="text-sm font-semibold text-white">Começar</Text>
                </Pressable>
              </>
            ) : (
              <Text className="font-display font-bold text-base text-text">
                Nenhuma pendência hoje. Bom trabalho!
              </Text>
            )}
          </View>
        )}

        {carregandoInicial ? (
          Array.from({ length: 4 }).map((_, i) => (
            <View key={i} className="flex-row items-center gap-3 bg-surface border border-border rounded-card p-3.5">
              <Skeleton style={{ width: 40, height: 40, borderRadius: 10 }} />
              <View className="flex-1 gap-2">
                <Skeleton style={{ width: '60%', height: 10 }} />
                <Skeleton style={{ width: '40%', height: 10 }} />
              </View>
            </View>
          ))
        ) : itens.length === 0 ? (
          <EstadoVazio
            mensagem="Nenhum bloco hoje. Que tal criar um?"
            labelAcao="Criar bloco"
            onAcao={() => router.push(`/(app)/hoje/bloco/novo?dia=${data}`)}
          />
        ) : (
          itens.map((item) => {
            const materia = materiasPorId.get(item.materiaId ?? '');
            const isNow =
              ehHoje && horaAtual >= item.horaInicio && horaAtual <= item.horaFim && !item.concluido;
            return (
              <ItemAgendaLinha
                key={`${item.tipo}-${item.id}`}
                item={item}
                emoji={materia?.emoji ?? '📚'}
                cor={materia?.cor ?? '#9A9A9A'}
                isNow={isNow}
                onToggle={() => alternar(item)}
                onPress={item.tipo === 'bloco' ? () => router.push(`/(app)/hoje/bloco/${item.id}`) : undefined}
              />
            );
          })
        )}
      </ScrollView>

      {/* ponytail: Pomodoro ainda não foi convertido (fica em outro handoff) — botão inerte por ora. */}
      <Pressable className="absolute right-6 bottom-[88px] w-12 h-12 rounded-full bg-surface items-center justify-center shadow-md">
        <Text className="text-lg">⏱</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push(`/(app)/hoje/bloco/novo?dia=${data}`)}
        className="absolute right-6 bottom-7 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
      >
        <Text className="text-white text-2xl leading-none">+</Text>
      </Pressable>
    </View>
  );
}
