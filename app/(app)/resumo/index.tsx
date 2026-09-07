import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../../../hooks/useAuth';
import { useDados } from '../../../hooks/useDados';
import { useProgresso } from '../../../hooks/useProgresso';
import { useRegistrosDiario } from '../../../hooks/useRegistrosDiario';
import { diaSemanaDe, hojeCivil, somarDias } from '../../../lib/datas';
import { progressoDaMeta } from '../../../lib/metas';
import { MetricCard } from '../../../components/resumo/MetricCard';
import { BarraMeta } from '../../../components/resumo/BarraMeta';
import { GraficoEvolucao, type DiaEvolucao } from '../../../components/resumo/GraficoEvolucao';
import { Card } from '../../../components/ui/Card';
import { EstadoVazio } from '../../../components/ui/EstadoVazioErro';

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

      <View className="flex-row flex-wrap gap-2.5">
        <MetricCard label="Sequência de dias" value={String(progresso?.streak ?? 0)} color="text-primary" />
        <MetricCard label="Dias estudados no mês" value={String(progresso?.diasEstudadosMes ?? 0)} />
        <MetricCard label="Tempo total (mês)" value={formatarHoras(progresso?.minutosMes ?? 0)} />
        <MetricCard label="Revisões atrasadas" value={String(progresso?.revisoesAtrasadas ?? 0)} color="text-warning" />
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
    </ScrollView>
  );
}
