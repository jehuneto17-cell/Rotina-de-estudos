import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { useDados } from '../../../hooks/useDados';
import { useRegistrosDiario } from '../../../hooks/useRegistrosDiario';
import { Chip } from '../../../components/ui/Chip';
import { MateriaIcon } from '../../../components/ui/MateriaIcon';
import { EstadoVazio } from '../../../components/ui/EstadoVazioErro';
import type { RegistroDiario } from '../../../types/modelos';

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

// Telas 12 (lista) + 13 (calendário) — toggle na mesma tela (USER-FLOWS.md).
export default function Diario() {
  const [modo, setModo] = useState<'lista' | 'calendario'>('lista');
  const { materias } = useDados();
  const { registros } = useRegistrosDiario();

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-6 pt-7 pb-4">
        <Text className="font-display font-bold text-2xl text-text">Diário</Text>
        <View className="flex-row bg-neutralBg rounded-pill p-[3px]">
          <Pressable
            onPress={() => setModo('lista')}
            className={`h-[30px] px-3.5 rounded-pill justify-center ${modo === 'lista' ? 'bg-text' : ''}`}
          >
            <Text className={`text-[13px] font-semibold ${modo === 'lista' ? 'text-white' : 'text-textMuted'}`}>Lista</Text>
          </Pressable>
          <Pressable
            onPress={() => setModo('calendario')}
            className={`h-[30px] px-3.5 rounded-pill justify-center ${modo === 'calendario' ? 'bg-text' : ''}`}
          >
            <Text className={`text-[13px] font-semibold ${modo === 'calendario' ? 'text-white' : 'text-textMuted'}`}>
              Calendário
            </Text>
          </Pressable>
        </View>
      </View>

      {modo === 'lista' ? (
        <ListaDiario registros={registros} materias={materias} />
      ) : (
        <CalendarioDiario registros={registros} materias={materias} />
      )}
    </View>
  );
}

function ListaDiario({ registros, materias }: { registros: RegistroDiario[]; materias: ReturnType<typeof useDados>['materias'] }) {
  const [busca, setBusca] = useState('');
  const [materiaId, setMateriaId] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);

  const tagsDisponiveis = useMemo(
    () => [...new Set(registros.flatMap((r) => r.tags))],
    [registros]
  );

  const filtrados = registros.filter(
    (r) =>
      (!materiaId || r.materiaId === materiaId) &&
      (!tag || r.tags.includes(tag)) &&
      (!busca.trim() || r.conteudo.toLowerCase().includes(busca.trim().toLowerCase()))
  );

  if (registros.length === 0) {
    return (
      <EstadoVazio
        mensagem="Seu diário está vazio. Registre sua primeira sessão de estudo."
        labelAcao="Registrar sessão"
        onAcao={() => {}}
      />
    );
  }

  return (
    <ScrollView contentContainerClassName="px-6 pb-6 gap-3">
      <TextInput
        value={busca}
        onChangeText={setBusca}
        placeholder="Buscar por conteúdo"
        placeholderTextColor="#B0B0B0"
        className="h-11 rounded-sm border border-border bg-surface px-3 text-sm text-text"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
        <Chip label="Todas" selected={materiaId === null} onPress={() => setMateriaId(null)} />
        {materias.map((m) => (
          <Chip
            key={m.id}
            label={`${m.emoji} ${m.nome}`}
            selected={materiaId === m.id}
            onPress={() => setMateriaId(m.id === materiaId ? null : m.id)}
          />
        ))}
      </ScrollView>

      {tagsDisponiveis.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 -mt-1">
          {tagsDisponiveis.map((t) => (
            <Chip key={t} label={t} tom="tag" selected={tag === t} onPress={() => setTag(t === tag ? null : t)} />
          ))}
        </ScrollView>
      )}

      <View className="gap-2.5">
        {filtrados.map((r) => {
          const materia = materias.find((m) => m.id === r.materiaId);
          return (
            <Link key={r.id} href={`/(app)/diario/${r.id}`} asChild>
              <Pressable className="bg-surface border border-border rounded-card p-3.5 gap-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs text-textFaint font-semibold">{r.data}</Text>
                  <View className="w-[3px] h-[3px] rounded-full bg-border" />
                  <Text className="text-xs text-textFaint">{r.duracaoMin} min</Text>
                </View>
                <View className="flex-row items-center gap-2.5">
                  <MateriaIcon emoji={materia?.emoji ?? '📚'} cor={materia?.cor ?? '#9A9A9A'} tamanho={32} />
                  <Text className="flex-1 text-sm font-semibold text-text" numberOfLines={1}>
                    {r.conteudo}
                  </Text>
                  {r.anexo && <Text className="text-sm">📎</Text>}
                </View>
                {r.tags.length > 0 && (
                  <View className="flex-row flex-wrap gap-1.5">
                    {r.tags.map((t) => (
                      <View key={t} className="bg-neutralBg rounded-pill px-2 py-0.5">
                        <Text className="text-[11px] font-semibold text-textMuted">#{t}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Pressable>
            </Link>
          );
        })}
      </View>
    </ScrollView>
  );
}

function CalendarioDiario({ registros, materias }: { registros: RegistroDiario[]; materias: ReturnType<typeof useDados>['materias'] }) {
  const [offsetMes, setOffsetMes] = useState(0);
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [materiaId, setMateriaId] = useState<string | null>(null);

  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth() + offsetMes);
  const ano = base.getFullYear();
  const mes = base.getMonth();
  const rotuloMes = base.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  const registrosFiltrados = materiaId ? registros.filter((r) => r.materiaId === materiaId) : registros;
  const porDia = new Map<string, RegistroDiario[]>();
  for (const r of registrosFiltrados) {
    const arr = porDia.get(r.data) ?? [];
    arr.push(r);
    porDia.set(r.data, arr);
  }

  const celulas: (number | null)[] = [
    ...Array(primeiroDiaSemana).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];

  const hoje = new Date();
  const chaveDia = (dia: number) => `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  const entradasDoDia = diaSelecionado ? porDia.get(diaSelecionado) ?? [] : [];

  return (
    <ScrollView contentContainerClassName="px-6 pb-6 gap-4">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
        <Chip label="Todas" selected={materiaId === null} onPress={() => setMateriaId(null)} />
        {materias.map((m) => (
          <Chip
            key={m.id}
            label={`${m.emoji} ${m.nome}`}
            selected={materiaId === m.id}
            onPress={() => setMateriaId(m.id === materiaId ? null : m.id)}
          />
        ))}
      </ScrollView>

      <View className="bg-surface border border-border rounded-card p-4 gap-3.5">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => { setOffsetMes((v) => v - 1); setDiaSelecionado(null); }} className="w-[30px] h-[30px] rounded-full border border-rowBorder items-center justify-center">
            <ChevronLeft size={18} color="#141414" />
          </Pressable>
          <Text className="text-[15px] font-bold text-text capitalize">{rotuloMes}</Text>
          <Pressable onPress={() => { setOffsetMes((v) => v + 1); setDiaSelecionado(null); }} className="w-[30px] h-[30px] rounded-full border border-rowBorder items-center justify-center">
            <ChevronRight size={16} color="#141414" />
          </Pressable>
        </View>

        <View className="flex-row">
          {DIAS_SEMANA.map((d, i) => (
            <Text key={i} className="flex-1 text-center text-[11px] font-semibold text-textFaint">{d}</Text>
          ))}
        </View>

        <View className="flex-row flex-wrap">
          {celulas.map((dia, idx) => {
            if (!dia) return <View key={idx} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
            const chave = chaveDia(dia);
            const entradas = porDia.get(chave) ?? [];
            const ehHoje = hoje.getFullYear() === ano && hoje.getMonth() === mes && hoje.getDate() === dia;
            const selecionado = diaSelecionado === chave;
            return (
              <Pressable
                key={idx}
                onPress={() => entradas.length > 0 && setDiaSelecionado(selecionado ? null : chave)}
                style={{ width: `${100 / 7}%`, aspectRatio: 1 }}
                className={`items-center justify-center gap-1 rounded-sm ${selecionado ? 'bg-neutralBg' : ''}`}
              >
                <Text className={`text-[13px] ${ehHoje ? 'text-primary font-bold' : 'text-text'}`}>{dia}</Text>
                <View className="flex-row gap-0.5 h-[5px]">
                  {entradas.slice(0, 3).map((e, i) => {
                    const materia = materias.find((m) => m.id === e.materiaId);
                    return (
                      <View
                        key={i}
                        style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: materia?.cor ?? '#9A9A9A' }}
                      />
                    );
                  })}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {entradasDoDia.length > 0 && (
        <View className="gap-2">
          <Text className="text-[13px] font-bold text-textFaint">{diaSelecionado}</Text>
          {entradasDoDia.map((e) => {
            const materia = materias.find((m) => m.id === e.materiaId);
            return (
              <Link key={e.id} href={`/(app)/diario/${e.id}`} asChild>
                <Pressable className="flex-row items-center gap-3 bg-surface border border-border rounded-card px-3.5 py-3">
                  <MateriaIcon emoji={materia?.emoji ?? '📚'} cor={materia?.cor ?? '#9A9A9A'} tamanho={34} />
                  <Text className="flex-1 text-sm font-semibold text-text">{materia?.nome ?? e.conteudo}</Text>
                  <Text className="text-[13px] text-textFaint">{e.duracaoMin} min</Text>
                </Pressable>
              </Link>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
