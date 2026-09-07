import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { useDados } from '../../../hooks/useDados';
import { useProgresso } from '../../../hooks/useProgresso';
import { useRegistrosDiario } from '../../../hooks/useRegistrosDiario';
import { diaSemanaDe, diferencaEmDias, hojeCivil, somarDias } from '../../../lib/datas';
import { progressoDaMeta } from '../../../lib/metas';
import { MetricCard } from '../../../components/resumo/MetricCard';
import { BarraMeta } from '../../../components/resumo/BarraMeta';
import { GraficoEvolucao, type DiaEvolucao } from '../../../components/resumo/GraficoEvolucao';
import { Card } from '../../../components/ui/Card';
import { EstadoVazio } from '../../../components/ui/EstadoVazioErro';
import { MateriaIcon } from '../../../components/ui/MateriaIcon';

const LETRA_DIA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']; // getDay(): 0=dom

function formatarHoras(min: number) {
  return `${Math.round(min / 60)}h`;
}

// Telas 9 (resumo) + 15 (dashboard) + 18 (metas) + 17 (evolução) + 16 (relatório) —
// todas seções de um scroll só, conforme USER-FLOWS.md e handoff Resumo.dc.html.
export default function Resumo() {
  const { usuario } = useAuth();
  const { materias, metas, carregandoInicial } = useDados();
  const progresso = useProgresso(usuario?.uid ?? null);
  const { registros } = useRegistrosDiario();
  const hoje = hojeCivil();

  const [materiaEvolucaoId, setMateriaEvolucaoId] = useState<string | null>(null);
  const materiaAtiva = materiaEvolucaoId ?? materias[0]?.id ?? null;

  const diasEvolucao: DiaEvolucao[] = useMemo(() => {
    if (!materiaAtiva) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const data = somarDias(hoje, i - 6);
      const letra = LETRA_DIA[diaSemanaDe(data)];
      const minutos = registros
        .filter((r) => r.materiaId === materiaAtiva && r.data === data)
        .reduce((soma, r) => soma + r.duracaoMin, 0);
      return { label: letra, minutos };
    });
  }, [registros, materiaAtiva, hoje]);

  const mesCorrente = hoje.slice(0, 7);
  const relatorioMensal = useMemo(
    () =>
      materias.map((m) => ({
        ...m,
        minutos: progresso?.minutosPorMateriaMes[m.id] ?? 0,
        // ponytail: sessões contadas só nos últimos 30 registros (useRegistrosDiario);
        // se o mês tiver mais que isso, sub-conta — trocar por query com filtro de mês se incomodar.
        sessoes: registros.filter((r) => r.materiaId === m.id && r.data.startsWith(mesCorrente)).length,
      })),
    [materias, progresso, registros, mesCorrente]
  );

  const diasSemEstudar = progresso?.ultimoDiaEstudado ? diferencaEmDias(progresso.ultimoDiaEstudado, hoje) : null;
  const avisoInatividade =
    diasSemEstudar === null
      ? 'Você ainda não registrou nenhum estudo.'
      : diasSemEstudar === 0
        ? null
        : diasSemEstudar === 1
          ? 'Você não estuda desde ontem.'
          : `Você ficou ${diasSemEstudar} dias sem estudar!`;

  const sessoesRecentes = registros.slice(0, 5); // já vem ordenado por data desc (useRegistrosDiario)

  if (carregandoInicial) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <Text className="text-textFaint">Carregando…</Text>
      </View>
    );
  }

  if (materias.length === 0) {
    return (
      <View className="flex-1 bg-bg justify-center">
        <EstadoVazio mensagem="Registre sua primeira sessão no Diário para ver estatísticas aqui." />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerClassName="px-6 pt-7 pb-8 gap-7">
      <Text className="font-display font-bold text-2xl text-text">Resumo</Text>

      {avisoInatividade && (progresso?.streak ?? 0) === 0 && (
        <View className="bg-warningBg border border-warning/30 rounded-card px-4 py-3.5 flex-row items-center justify-between gap-3 flex-wrap">
          <View className="flex-1 min-w-[160px]">
            <Text className="text-[13px] font-bold text-warning">⚠️ {avisoInatividade}</Text>
            <Text className="text-xs text-textMuted mt-0.5">Que tal 30 minutos agora?</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(app)/diario/novo')}
            className="h-9 px-4 rounded-md bg-primary items-center justify-center"
          >
            <Text className="text-white text-[13px] font-semibold">Estudar agora</Text>
          </Pressable>
        </View>
      )}

      <View className="flex-row flex-wrap gap-2.5">
        <MetricCard label="Sequência de dias" value={String(progresso?.streak ?? 0)} color="text-primary" />
        <MetricCard label="Dias estudados no mês" value={String(progresso?.diasEstudadosMes ?? 0)} />
        <MetricCard label="Tempo total (mês)" value={formatarHoras(progresso?.minutosMes ?? 0)} />
        <MetricCard
          label="Revisões atrasadas"
          value={String(progresso?.revisoesAtrasadas ?? 0)}
          color="text-warning"
          onPress={() => router.push('/(app)/revisao')}
        />
      </View>

      <View className="gap-3">
        <Text className="text-base font-bold text-text">Metas da semana</Text>
        {materias.map((m) => {
          const meta = metas.find((mt) => mt.materiaId === m.id);
          const prog = meta ? progressoDaMeta(meta, registros, hoje) : null;
          return (
            <BarraMeta
              key={m.id}
              emoji={m.emoji}
              nome={m.nome}
              minutosFeitos={prog?.minutosFeitos ?? 0}
              minutosAlvo={meta?.minutosAlvo ?? null}
              onDefinirMeta={() => {}}
            />
          );
        })}
      </View>

      <View className="gap-3">
        <Text className="text-base font-bold text-text">Evolução</Text>
        <GraficoEvolucao
          materias={materias}
          materiaSelecionadaId={materiaAtiva}
          onSelecionar={setMateriaEvolucaoId}
          dias={diasEvolucao}
        />
      </View>

      <View className="gap-3">
        <Text className="text-base font-bold text-text">Relatório mensal</Text>
        <Card className="p-0 overflow-hidden">
          {relatorioMensal.map((r, i) => (
            <View
              key={r.id}
              className={`flex-row items-center gap-2.5 px-3.5 py-3 ${i > 0 ? 'border-t border-rowBorder' : ''}`}
            >
              <Text className="text-base">{r.emoji}</Text>
              <Text className="flex-1 text-sm font-semibold text-text">{r.nome}</Text>
              <Text className="text-[13px] text-textMuted">{formatarHoras(r.minutos)}</Text>
              <Text className="text-[13px] text-textFaint">{r.sessoes} sessões</Text>
            </View>
          ))}
        </Card>
      </View>

      {sessoesRecentes.length > 0 && (
        <View className="gap-3">
          <Text className="text-base font-bold text-text">Sessões recentes</Text>
          <Card className="p-0 overflow-hidden">
            {sessoesRecentes.map((r, i) => {
              const materia = materias.find((m) => m.id === r.materiaId);
              return (
                <Pressable
                  key={r.id}
                  onPress={() => router.push(`/(app)/diario/${r.id}`)}
                  className={`flex-row items-center gap-3 px-3.5 py-3 ${i > 0 ? 'border-t border-rowBorder' : ''}`}
                >
                  <MateriaIcon emoji={materia?.emoji ?? '📚'} cor={materia?.cor ?? '#9A9A9A'} />
                  <View className="flex-1 min-w-0">
                    <Text className="text-sm font-semibold text-text" numberOfLines={1}>{r.conteudo}</Text>
                    <Text className="text-xs text-textFaint" numberOfLines={1}>{materia?.nome ?? 'Sem matéria'} · {r.data}</Text>
                  </View>
                  <Text className="text-[13px] text-textMuted">{r.duracaoMin}min</Text>
                </Pressable>
              );
            })}
          </Card>
        </View>
      )}
    </ScrollView>
  );
}
