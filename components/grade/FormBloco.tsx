import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useDados } from '../../hooks/useDados';
import { atualizarBloco, converterBlocoEmRotina, criarBloco } from '../../lib/blocos';
import { ConverterEmRotinaModal } from './ConverterEmRotinaModal';
import type { Bloco } from '../../types/modelos';

// handoff: Novo Bloco.dc.html — mesma tela em modo 'novo' e 'editar' (bottom sheet).
export function FormBloco({
  modo,
  blocoExistente,
  diaSemanaPadrao,
}: {
  modo: 'novo' | 'editar';
  blocoExistente?: Bloco;
  diaSemanaPadrao: number;
}) {
  const { usuario } = useAuth();
  const { materias } = useDados();

  const [titulo, setTitulo] = useState(blocoExistente?.titulo ?? '');
  const [materiaId, setMateriaId] = useState<string | null>(blocoExistente?.materiaId ?? null);
  const [horaInicio, setHoraInicio] = useState(blocoExistente?.horaInicio ?? '');
  const [horaFim, setHoraFim] = useState(blocoExistente?.horaFim ?? '');
  const [salvando, setSalvando] = useState(false);
  const [erroMateria, setErroMateria] = useState(false);
  const [modalRotinaAberto, setModalRotinaAberto] = useState(false);

  async function salvar() {
    if (!materiaId) {
      setErroMateria(true);
      return;
    }
    if (!usuario) return;
    setSalvando(true);
    try {
      if (modo === 'editar' && blocoExistente) {
        await atualizarBloco(usuario.uid, blocoExistente.id, {
          titulo: titulo.trim(),
          materiaId,
          horaInicio,
          horaFim,
        });
      } else {
        await criarBloco(usuario.uid, {
          titulo: titulo.trim(),
          materiaId,
          diaSemana: diaSemanaPadrao,
          horaInicio,
          horaFim,
        });
      }
      router.back();
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarConversao(diasSemana: number[]) {
    if (!usuario || !blocoExistente) return;
    await converterBlocoEmRotina(
      usuario.uid,
      { titulo: blocoExistente.titulo, materiaId: blocoExistente.materiaId, horaInicio, horaFim },
      blocoExistente.id,
      diasSemana
    );
    setModalRotinaAberto(false);
    router.back();
  }

  return (
    <View className="flex-1 bg-black/45 justify-end">
      <View className="bg-surface rounded-t-lg max-h-[92%]">
        <View className="flex-row items-center justify-between px-6 pt-6 pb-2">
          <Text className="font-display font-bold text-xl text-text">
            {modo === 'editar' ? 'Editar bloco' : 'Novo bloco'}
          </Text>
          <Pressable onPress={() => router.back()} className="w-8 h-8 rounded-full bg-neutralBg items-center justify-center">
            <Text className="text-textMuted">✕</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerClassName="px-6 pb-6 gap-5">
          <View>
            <Text className="text-xs font-semibold text-textFaint mb-2">Nome do bloco</Text>
            <TextInput
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ex.: Revisão de Direito Administrativo"
              placeholderTextColor="#B0B0B0"
              className="h-[46px] rounded-sm border border-border px-3 text-[15px] text-text"
            />
          </View>

          <View>
            <Text className="text-xs font-semibold text-textFaint mb-2">Matéria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
              {materias.map((m) => {
                const selecionada = materiaId === m.id;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => { setMateriaId(m.id); setErroMateria(false); }}
                    className={`flex-row items-center gap-1.5 h-[38px] px-3.5 rounded-pill ${
                      selecionada ? 'border-[1.5px]' : 'border border-border bg-surface'
                    }`}
                    style={selecionada ? { borderColor: m.cor, backgroundColor: `${m.cor}18` } : undefined}
                  >
                    <Text>{m.emoji}</Text>
                    <Text
                      className="text-sm font-semibold"
                      style={selecionada ? { color: m.cor } : { color: '#141414' }}
                    >
                      {m.nome}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            {erroMateria && (
              <Text className="mt-2 text-[13px] font-semibold text-primary">
                Escolha uma matéria antes de salvar o bloco.
              </Text>
            )}
          </View>

          <View>
            <Text className="text-xs font-semibold text-textFaint mb-2">Horário</Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-[11px] text-textFaint mb-1">Início</Text>
                <TextInput
                  value={horaInicio}
                  onChangeText={setHoraInicio}
                  placeholder="19:00"
                  placeholderTextColor="#B0B0B0"
                  className="h-[46px] rounded-sm border border-border px-3 text-[15px] text-text"
                />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] text-textFaint mb-1">Fim</Text>
                <TextInput
                  value={horaFim}
                  onChangeText={setHoraFim}
                  placeholder="20:00"
                  placeholderTextColor="#B0B0B0"
                  className="h-[46px] rounded-sm border border-border px-3 text-[15px] text-text"
                />
              </View>
            </View>
          </View>

          {modo === 'editar' && (
            <Pressable onPress={() => setModalRotinaAberto(true)} className="self-start">
              <Text className="text-sm font-semibold text-primary">Transformar em rotina →</Text>
            </Pressable>
          )}
        </ScrollView>

        <View className="px-6 pt-4 pb-7 border-t border-rowBorder">
          <Pressable
            disabled={salvando || !horaInicio || !horaFim}
            onPress={salvar}
            className="h-[52px] rounded-md bg-primary items-center justify-center disabled:opacity-60"
          >
            {salvando ? <ActivityIndicator color="#fff" /> : (
              <Text className="text-white text-base font-semibold">Salvar bloco</Text>
            )}
          </Pressable>
        </View>
      </View>

      {modo === 'editar' && (
        <ConverterEmRotinaModal
          visivel={modalRotinaAberto}
          onFechar={() => setModalRotinaAberto(false)}
          onConfirmar={confirmarConversao}
        />
      )}
    </View>
  );
}
