import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useDados } from '../hooks/useDados';
import { PALETA_MATERIAS } from '../constants/paletaMaterias';

const EMOJIS = ['📐', '📊', '📚', '🧪', '🔬', '🌍', '⚖️', '💻', '🎨', '🎵', '⚽', '🩺', '🧮', '📝'];

// Tela 2 — handoff Onboarding.dc.html. Guarda de rota: sem matéria, index.tsx sempre traz de volta aqui.
export default function Onboarding() {
  const { usuario } = useAuth();
  const { materias } = useDados();
  const [formAberto, setFormAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [emoji, setEmoji] = useState<string | null>(null);
  const [cor, setCor] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState(false);
  const [concluindo, setConcluindo] = useState(false);

  function abrirForm() {
    setNome('');
    setEmoji(null);
    setCor(null);
    setErroSalvar(false);
    setFormAberto(true);
  }

  async function salvarMateria() {
    if (!usuario || !nome.trim() || !emoji || !cor) return;
    setSalvando(true);
    setErroSalvar(false);
    try {
      await addDoc(collection(db, 'usuarios', usuario.uid, 'materias'), {
        nome: nome.trim(),
        emoji,
        cor,
        ordem: materias.length,
        criadoEm: serverTimestamp(),
      });
      setFormAberto(false);
    } catch {
      setErroSalvar(true);
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id: string) {
    if (!usuario) return;
    await deleteDoc(doc(db, 'usuarios', usuario.uid, 'materias', id));
  }

  async function concluir() {
    if (!usuario || materias.length === 0 || concluindo) return;
    setConcluindo(true);
    try {
      await updateDoc(doc(db, 'usuarios', usuario.uid), {
        onboardingConcluido: true,
        atualizadoEm: serverTimestamp(),
      });
      // index.tsx redireciona pra /(app)/hoje assim que materias.length > 0 — nada mais a fazer aqui.
    } finally {
      setConcluindo(false);
    }
  }

  const podeAdicionar = nome.trim() && emoji && cor;
  const podeConcluir = materias.length > 0 && !concluindo;

  return (
    <View className="flex-1 bg-bg items-center">
      <View className="w-full max-w-[420px] flex-1">
        <View className="px-6 pt-8 pb-4">
          <Text className="font-display font-bold text-2xl text-text">Cadastre suas matérias</Text>
          <Text className="mt-1.5 text-[15px] text-textMuted">
            Você pode adicionar quantas quiser e editar depois.
          </Text>
        </View>

        <ScrollView contentContainerClassName="px-6 pb-4 gap-2.5">
          {materias.length === 0 && !formAberto && (
            <View className="items-center py-8 gap-3">
              <Text className="text-3xl">📚</Text>
              <Text className="text-sm text-textFaint text-center">
                Nenhuma matéria ainda. Adicione a primeira acima.
              </Text>
            </View>
          )}

          {materias.map((m) => (
            <View
              key={m.id}
              className="flex-row items-center gap-3 bg-surface border border-border rounded-card px-3.5 py-3"
            >
              <Text className="text-[22px] w-8 h-8 text-center">{m.emoji}</Text>
              <Text className="flex-1 text-[15px] font-semibold text-text">{m.nome}</Text>
              <View className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: m.cor }} />
              <Pressable
                onPress={() => remover(m.id)}
                className="w-7 h-7 rounded-full bg-neutralBg items-center justify-center"
              >
                <Text className="text-textMuted text-sm">✕</Text>
              </Pressable>
            </View>
          ))}

          {formAberto ? (
            <View className="bg-surface border border-border rounded-card p-4 gap-3.5 mt-1">
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
                      className={`w-[13%] h-[38px] rounded-sm items-center justify-center ${
                        emoji === e ? 'border-2 border-text bg-neutralBg' : 'border border-border'
                      }`}
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
                      className="w-[17%] aspect-square rounded-full items-center justify-center"
                      style={{
                        backgroundColor: c,
                        borderWidth: cor === c ? 3 : 0,
                        borderColor: '#141414',
                      }}
                    />
                  ))}
                </View>
              </View>

              {erroSalvar && (
                <Text className="text-[13px] font-semibold text-primary">
                  Não foi possível salvar a matéria. Tente de novo.
                </Text>
              )}

              <View className="flex-row gap-2.5">
                <Pressable
                  onPress={() => setFormAberto(false)}
                  className="flex-1 h-[42px] rounded-md border border-border items-center justify-center"
                >
                  <Text className="text-sm font-semibold text-textMuted">Cancelar</Text>
                </Pressable>
                <Pressable
                  disabled={!podeAdicionar || salvando}
                  onPress={salvarMateria}
                  className={`flex-[2] h-[42px] rounded-md items-center justify-center ${
                    podeAdicionar ? 'bg-text' : 'bg-border'
                  }`}
                >
                  {salvando ? <ActivityIndicator color="#fff" size="small" /> : (
                    <Text className="text-sm font-semibold text-white">Adicionar</Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={abrirForm}
              className="h-[46px] rounded-md border border-dashed border-border items-center justify-center mt-1"
            >
              <Text className="text-[15px] font-semibold text-text">+ Adicionar matéria</Text>
            </Pressable>
          )}
        </ScrollView>

        <View className="px-6 pt-4 pb-7 border-t border-rowBorder bg-bg">
          <Pressable
            disabled={!podeConcluir}
            onPress={concluir}
            className={`h-[52px] rounded-md items-center justify-center ${podeConcluir ? 'bg-primary' : 'bg-primary opacity-40'}`}
          >
            {concluindo ? <ActivityIndicator color="#fff" /> : (
              <Text className="text-base font-semibold text-white">Concluir cadastro</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
