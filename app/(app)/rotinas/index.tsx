import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { hojeCivil } from '../../../lib/datas';
import { useAuth } from '../../../hooks/useAuth';
import { useDados } from '../../../hooks/useDados';
import { MateriaIcon } from '../../../components/ui/MateriaIcon';
import { CheckToggle } from '../../../components/ui/CheckToggle';
import { EstadoVazio } from '../../../components/ui/EstadoVazioErro';
import type { Rotina } from '../../../types/modelos';

const LETRA_DIA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']; // getDay(): 0=dom

// Telas 6 (rotinas) + 7 (tarefas avulsas) — duas abas na mesma tela (ARCHITECTURE.md §2).
export default function Rotinas() {
  const [aba, setAba] = useState<'rotinas' | 'tarefas'>('rotinas');

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center gap-2.5 px-6 pt-7 pb-2">
        <Text className="font-display font-bold text-2xl text-text flex-1">
          {aba === 'rotinas' ? 'Rotinas' : 'Tarefas avulsas'}
        </Text>
        <View className="flex-row bg-neutralBg rounded-pill p-[3px]">
          <Pressable
            onPress={() => setAba('rotinas')}
            className={`h-[30px] px-3.5 rounded-pill justify-center ${aba === 'rotinas' ? 'bg-text' : ''}`}
          >
            <Text className={`text-[13px] font-semibold ${aba === 'rotinas' ? 'text-white' : 'text-textMuted'}`}>
              Rotinas
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setAba('tarefas')}
            className={`h-[30px] px-3.5 rounded-pill justify-center ${aba === 'tarefas' ? 'bg-text' : ''}`}
          >
            <Text className={`text-[13px] font-semibold ${aba === 'tarefas' ? 'text-white' : 'text-textMuted'}`}>
              Tarefas
            </Text>
          </Pressable>
        </View>
      </View>

      {aba === 'rotinas' ? <ListaRotinas /> : <ListaTarefas />}
    </View>
  );
}

function ListaRotinas() {
  const { usuario } = useAuth();
  const { rotinas, materias, carregandoInicial } = useDados();
  const hoje = hojeCivil();
  const hojeDiaSemana = new Date(`${hoje}T12:00:00`).getDay();

  const ativas = rotinas.filter((r) => r.ativa);
  const pendentesHoje = ativas.filter((r) => r.diasSemana.includes(hojeDiaSemana) && !r.checks[hoje]).length;

  async function alternar(rotina: Rotina) {
    if (!usuario) return;
    await updateDoc(doc(db, 'usuarios', usuario.uid, 'rotinas', rotina.id), {
      [`checks.${hoje}`]: !rotina.checks[hoje],
    });
  }

  if (carregandoInicial) {
    return <View className="flex-1 items-center justify-center"><Text className="text-textFaint">Carregando…</Text></View>;
  }

  if (ativas.length === 0) {
    return <EstadoVazio mensagem="Nenhuma rotina ainda. Converta um bloco em rotina na Grade." />;
  }

  return (
    <ScrollView contentContainerClassName="px-6 pt-2 pb-6 gap-2.5">
      {pendentesHoje > 0 && (
        <View className="self-start bg-warningBg rounded-pill px-2.5 py-1 mb-1">
          <Text className="text-xs font-bold text-warning">
            {pendentesHoje} pendente{pendentesHoje === 1 ? '' : 's'} hoje
          </Text>
        </View>
      )}
      {ativas.map((r) => {
        const materia = materias.find((m) => m.id === r.materiaId);
        const feita = !!r.checks[hoje];
        return (
          <View key={r.id} className="flex-row items-center gap-3 bg-surface border border-border rounded-card p-3.5">
            <MateriaIcon emoji={materia?.emoji ?? '📚'} cor={materia?.cor ?? '#9A9A9A'} tamanho={38} />
            <View className="flex-1 gap-1.5">
              <Text className={`text-sm font-semibold ${feita ? 'text-textFaint line-through' : 'text-text'}`}>
                {r.titulo}
              </Text>
              <View className="flex-row gap-1">
                {LETRA_DIA.map((label, idx) => {
                  const ativo = r.diasSemana.includes(idx);
                  const ehHoje = idx === hojeDiaSemana;
                  return (
                    <View
                      key={idx}
                      className={`w-[18px] h-[18px] rounded-full items-center justify-center ${ativo ? 'bg-text' : 'bg-neutralBg'} ${ehHoje ? 'border border-primary' : ''}`}
                    >
                      <Text className={`text-[9px] font-bold ${ativo ? 'text-white' : 'text-textFaint'}`}>{label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
            <CheckToggle done={feita} onToggle={() => alternar(r)} />
          </View>
        );
      })}
    </ScrollView>
  );
}

function ListaTarefas() {
  const { usuario } = useAuth();
  const { tarefas, carregandoInicial } = useDados();
  const [rascunho, setRascunho] = useState('');

  async function adicionar() {
    const titulo = rascunho.trim();
    if (!titulo || !usuario) return;
    await addDoc(collection(db, 'usuarios', usuario.uid, 'tarefas'), {
      titulo,
      materiaId: null,
      concluida: false,
      criadoEm: serverTimestamp(),
    });
    setRascunho('');
  }

  async function alternar(id: string, concluida: boolean) {
    if (!usuario) return;
    await updateDoc(doc(db, 'usuarios', usuario.uid, 'tarefas', id), { concluida: !concluida });
  }

  async function remover(id: string) {
    if (!usuario) return;
    await deleteDoc(doc(db, 'usuarios', usuario.uid, 'tarefas', id));
  }

  return (
    <View className="flex-1">
      {carregandoInicial ? (
        <View className="flex-1 items-center justify-center"><Text className="text-textFaint">Carregando…</Text></View>
      ) : tarefas.length === 0 ? (
        <EstadoVazio mensagem="Nenhuma tarefa pendente." />
      ) : (
        <ScrollView contentContainerClassName="px-6 pt-2 pb-4 gap-2">
          {tarefas.map((t) => (
            <View key={t.id} className="flex-row items-center gap-3 bg-surface border border-border rounded-card px-3.5 py-3">
              <CheckToggle done={t.concluida} onToggle={() => alternar(t.id, t.concluida)} tamanho={24} />
              <Text className={`flex-1 text-[15px] ${t.concluida ? 'text-textFaint line-through' : 'text-text'}`}>
                {t.titulo}
              </Text>
              <Pressable onPress={() => remover(t.id)} className="w-7 h-7 items-center justify-center">
                <Text className="text-textFaint text-sm">✕</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      <View className="flex-row gap-2.5 px-6 py-3.5 border-t border-rowBorder">
        <TextInput
          value={rascunho}
          onChangeText={setRascunho}
          onSubmitEditing={adicionar}
          placeholder="Nova tarefa"
          placeholderTextColor="#B0B0B0"
          className="flex-1 h-[46px] rounded-sm border border-border px-3 text-[15px] text-text bg-surface"
        />
        <Pressable onPress={adicionar} className="h-[46px] px-4.5 rounded-md bg-text items-center justify-center">
          <Text className="text-sm font-semibold text-white">Adicionar</Text>
        </Pressable>
      </View>
    </View>
  );
}
