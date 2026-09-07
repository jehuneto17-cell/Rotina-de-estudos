import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../hooks/useAuth';
import { useDados } from '../../../hooks/useDados';
import { MateriaIcon } from '../../../components/ui/MateriaIcon';
import { PALETA_MATERIAS } from '../../../constants/paletaMaterias';
import type { Materia } from '../../../types/modelos';

const EMOJIS = ['📐', '📊', '📚', '🧪', '🔬', '🌍', '⚖️', '💻', '🎨', '🎵', '⚽', '🩺', '🧮', '📝'];

// Tela 8 — Materias.dc.html. CRUD real via Firestore.
export default function Materias() {
  const { usuario } = useAuth();
  const { materias, carregandoInicial } = useDados();
  const [formAberto, setFormAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [emoji, setEmoji] = useState<string | null>(null);
  const [cor, setCor] = useState<string | null>(null);
  const [erroExcluir, setErroExcluir] = useState(false);

  function abrirNova() {
    setFormAberto(true);
    setEditandoId(null);
    setNome('');
    setEmoji(null);
    setCor(null);
  }

  function abrirEdicao(m: Materia) {
    setFormAberto(true);
    setEditandoId(m.id);
    setNome(m.nome);
    setEmoji(m.emoji);
    setCor(m.cor);
  }

  async function salvar() {
    if (!usuario || !nome.trim() || !emoji || !cor) return;
    if (editandoId) {
      await updateDoc(doc(db, 'usuarios', usuario.uid, 'materias', editandoId), {
        nome: nome.trim(),
        emoji,
        cor,
      });
    } else {
      await addDoc(collection(db, 'usuarios', usuario.uid, 'materias'), {
        nome: nome.trim(),
        emoji,
        cor,
        ordem: materias.length,
        criadoEm: serverTimestamp(),
      });
    }
    setFormAberto(false);
  }

  async function excluir(id: string) {
    if (!usuario) return;
    try {
      await deleteDoc(doc(db, 'usuarios', usuario.uid, 'materias', id));
    } catch {
      setErroExcluir(true);
      setTimeout(() => setErroExcluir(false), 2500);
    }
  }

  const podeSalvar = !!(nome.trim() && emoji && cor);

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-6 pt-7 pb-4">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} className="w-8 h-8 rounded-full border border-border bg-surface items-center justify-center">
            <Text className="text-text">‹</Text>
          </Pressable>
          <Text className="font-display font-bold text-[22px] text-text">Matérias</Text>
        </View>
        <Pressable onPress={abrirNova} className="h-[34px] px-3.5 rounded-pill bg-text items-center justify-center">
          <Text className="text-white text-[13px] font-semibold">+ Adicionar</Text>
        </Pressable>
      </View>

      {erroExcluir && (
        <View className="mx-6 mb-2 bg-primaryFaint rounded-md px-3.5 py-2.5">
          <Text className="text-primary text-[13px] font-semibold text-center">Não foi possível excluir. Tente de novo.</Text>
        </View>
      )}

      <ScrollView contentContainerClassName="px-6 pb-6 gap-2.5">
        {carregandoInicial ? (
          <Text className="text-textFaint text-center py-8">Carregando…</Text>
        ) : (
          materias.map((m) => (
            <View key={m.id} className="flex-row items-center gap-3 bg-surface border border-border rounded-card px-3.5 py-3">
              <MateriaIcon emoji={m.emoji} cor={m.cor} tamanho={32} />
              <Text className="flex-1 text-[15px] font-semibold text-text">{m.nome}</Text>
              <View className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: m.cor }} />
              <Pressable onPress={() => abrirEdicao(m)} className="w-[30px] h-[30px] rounded-full bg-neutralBg items-center justify-center">
                <Text className="text-textMuted text-xs">✎</Text>
              </Pressable>
              <Pressable onPress={() => excluir(m.id)} className="w-[30px] h-[30px] rounded-full bg-neutralBg items-center justify-center">
                <Text className="text-primary text-xs">🗑</Text>
              </Pressable>
            </View>
          ))
        )}

        {formAberto && (
          <View className="bg-surface border border-border rounded-card p-4 gap-3.5 mt-1">
            <Text className="text-sm font-bold text-text">{editandoId ? 'Editar matéria' : 'Nova matéria'}</Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Nome da matéria"
              placeholderTextColor="#B0B0B0"
              className="h-11 rounded-sm border border-border px-3 text-[15px] text-text"
            />

            <View>
              <Text className="text-xs font-semibold text-textFaint mb-2">Emoji</Text>
              <View className="flex-row flex-wrap gap-1.5">
                {EMOJIS.map((e) => (
                  <Pressable
                    key={e}
                    onPress={() => setEmoji(e)}
                    className={`w-[38px] h-[38px] rounded-sm items-center justify-center ${emoji === e ? 'border-2 border-text bg-neutralBg' : 'border border-border bg-surface'}`}
                  >
                    <Text className="text-lg">{e}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-xs font-semibold text-textFaint mb-2">Cor</Text>
              <View className="flex-row flex-wrap gap-2.5">
                {PALETA_MATERIAS.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setCor(c)}
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: c, borderWidth: cor === c ? 3 : 0, borderColor: '#141414' }}
                  />
                ))}
              </View>
            </View>

            <View className="flex-row gap-2.5">
              <Pressable onPress={() => setFormAberto(false)} className="flex-1 h-[42px] rounded-md border border-border bg-surface items-center justify-center">
                <Text className="text-[14px] font-semibold text-textMuted">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={salvar}
                disabled={!podeSalvar}
                className={`flex-[2] h-[42px] rounded-md items-center justify-center ${podeSalvar ? 'bg-text' : 'bg-border'}`}
              >
                <Text className="text-[14px] font-semibold text-white">Salvar</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
