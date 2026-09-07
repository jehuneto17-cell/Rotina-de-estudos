import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { useDados } from '../../../hooks/useDados';
import { useProgresso } from '../../../hooks/useProgresso';
import { useRegistrosDiario } from '../../../hooks/useRegistrosDiario';
import { diaSemanaDe, diferencaEmDias, hojeCivil, paraDataCivil, somarDias } from '../../../lib/datas';
import { progressoDaMeta } from '../../../lib/metas';
import { buscarRegistrosPeriodo, buscarRevisoesPeriodo } from '../../../lib/relatorio';
import { exportarPdf, exportarTexto } from '../../../lib/exportarRelatorio';
import { MetricCard } from '../../../components/resumo/MetricCard';
import { BarraMeta } from '../../../components/resumo/BarraMeta';
import { GraficoEvolucao, type DiaEvolucao } from '../../../components/resumo/GraficoEvolucao';
import { GraficoMeses } from '../../../components/resumo/GraficoMeses';
import { MapaAtividade } from '../../../components/resumo/MapaAtividade';
import { Card } from '../../../components/ui/Card';
import { EstadoVazio } from '../../../components/ui/EstadoVazioErro';
import { MateriaIcon } from '../../../components/ui/MateriaIcon';
import type { RegistroDiario, Revisao } from '../../../types/modelos';

const LETRA_DIA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']; // getDay(): 0=dom
const MES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MES_NOME = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

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

  // Relatório de 4 meses + mapa de atividade: busca dedicada por período
  // (lib/relatorio.ts), não depende do limit(30) de useRegistrosDiario.
  const [registrosPeriodo, setRegistrosPeriodo] = useState<RegistroDiario[] | null>(null);
  const [revisoesPeriodo, setRevisoesPeriodo] = useState<Revisao[] | null>(null);
  const [exportando, setExportando] = useState<'texto' | 'pdf' | null>(null);
  const hojeDate = useMemo(() => new Date(), []);
  const inicioPeriodo = useMemo(
    () => paraDataCivil(new Date(hojeDate.getFullYear(), hojeDate.getMonth() - 3, 1)),
    [hojeDate]
  );

  useEffect(() => {
    if (!usuario) return;
    buscarRegistrosPeriodo(usuario.uid, inicioPeriodo, hoje).then(setRegistrosPeriodo);
    buscarRevisoesPeriodo(usuario.uid, inicioPeriodo, hoje).then(setRevisoesPeriodo);
  }, [usuario, inicioPeriodo, hoje]);

  const meses4 = useMemo(() => {
    if (!registrosPeriodo) return [];
    return Array.from({ length: 4 }, (_, i) => {
      const d = new Date(hojeDate.getFullYear(), hojeDate.getMonth() - 3 + i, 1);
      const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const doMes = registrosPeriodo.filter((r) => r.data.startsWith(chave));
      const dias = new Set(doMes.map((r) => r.data)).size;
      return { label: MES_ABREV[d.getMonth()], dias, destaque: i === 3 };
    });
  }, [registrosPeriodo, hojeDate]);

  const mapaAtividade = useMemo(() => {
    if (!registrosPeriodo) return { diasEstudados: new Set<string>(), diasComRevisao: new Set<string>() };
    const doMes = registrosPeriodo.filter((r) => r.data.startsWith(mesCorrente));
    const revisoesDoMes = (revisoesPeriodo ?? []).filter((r) => r.dataPrevista.startsWith(mesCorrente));
    return {
      diasEstudados: new Set(doMes.map((r) => r.data)),
      diasComRevisao: new Set(revisoesDoMes.map((r) => r.dataPrevista)),
    };
  }, [registrosPeriodo, revisoesPeriodo, mesCorrente]);

  const diasNoMesCorrente = new Date(hojeDate.getFullYear(), hojeDate.getMonth() + 1, 0).getDate();

  async function dadosParaExport() {
    const doMes = (registrosPeriodo ?? []).filter((r) => r.data.startsWith(mesCorrente));
    const revisoesDoMes = (revisoesPeriodo ?? []).filter((r) => r.dataPrevista.startsWith(mesCorrente));
    const porDisc = new Map<string, { sessoes: number; minutos: number }>();
    doMes.forEach((r) => {
      const materia = materias.find((m) => m.id === r.materiaId);
      const nome = materia?.nome ?? 'Sem matéria';
      const atual = porDisc.get(nome) ?? { sessoes: 0, minutos: 0 };
      porDisc.set(nome, { sessoes: atual.sessoes + 1, minutos: atual.minutos + r.duracaoMin });
    });
    return {
      mesNome: `${MES_NOME[hojeDate.getMonth()]} de ${hojeDate.getFullYear()}`,
      diasEstudados: new Set(doMes.map((r) => r.data)).size,
      minutosTotal: doMes.reduce((s, r) => s + r.duracaoMin, 0),
      revisoesFeitas: revisoesDoMes.filter((r) => r.status === 'feita').length,
      revisoesTotal: revisoesDoMes.length,
      porDisciplina: [...porDisc.entries()].map(([nome, v]) => ({ nome, ...v })),
    };
  }

  async function handleExportarTexto() {
    setExportando('texto');
    try {
      await exportarTexto(await dadosParaExport());
    } finally {
      setExportando(null);
    }
  }

  async function handleExportarPdf() {
    setExportando('pdf');
    try {
      await exportarPdf(await dadosParaExport());
    } finally {
      setExportando(null);
    }
  }

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
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-text">Relatório mensal</Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleExportarTexto}
              disabled={exportando !== null}
              className="h-8 px-3 rounded-md border border-border items-center justify-center flex-row gap-1"
            >
              {exportando === 'texto' ? <ActivityIndicator size="small" color="#141414" /> : <Text className="text-xs font-semibold text-text">⬇ Texto</Text>}
            </Pressable>
            <Pressable
              onPress={handleExportarPdf}
              disabled={exportando !== null}
              className="h-8 px-3 rounded-md border border-border items-center justify-center flex-row gap-1"
            >
              {exportando === 'pdf' ? <ActivityIndicator size="small" color="#141414" /> : <Text className="text-xs font-semibold text-text">🖨 PDF</Text>}
            </Pressable>
          </View>
        </View>

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

        {meses4.length > 0 && (
          <View className="gap-2">
            <Text className="text-xs font-semibold text-textFaint">Dias estudados — últimos 4 meses</Text>
            <GraficoMeses meses={meses4} />
          </View>
        )}

        <View className="gap-2">
          <Text className="text-xs font-semibold text-textFaint">
            Mapa de atividade — {MES_NOME[hojeDate.getMonth()]}
          </Text>
          <Card>
            <MapaAtividade
              diasNoMes={diasNoMesCorrente}
              diasEstudados={mapaAtividade.diasEstudados}
              diasComRevisao={mapaAtividade.diasComRevisao}
              hoje={hoje}
              onSelecionarDia={() => router.push('/(app)/diario')}
            />
          </Card>
        </View>
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
