import { useEffect, useState } from 'react';
import { ChevronRight, RotateCcw } from 'lucide-react-native';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { Link, router } from 'expo-router';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../../lib/firebase';
import { useAuth } from '../../../hooks/useAuth';
import { useConvitesRecebidos } from '../../../hooks/useConvites';
import { resetarTodosOsChecks } from '../../../lib/blocos';
import { AvatarIniciais } from '../../../components/ui/AvatarIniciais';
import { Card } from '../../../components/ui/Card';

// Tela 10 — Configuracoes.dc.html. Campo único "exame/banca" no handoff em vez
// dos dois campos separados do schema (exame + banca) — mantém só `exame`,
// `banca` segue null neste MVP (decisão de fidelidade ao Designer).
export default function Config() {
  const { usuario } = useAuth();
  const convitesRecebidos = useConvitesRecebidos();
  const [exame, setExame] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(false);
  const [confirmandoReset, setConfirmandoReset] = useState(false);
  const [resetando, setResetando] = useState(false);

  async function confirmarReset() {
    if (!usuario) return;
    setResetando(true);
    try {
      await resetarTodosOsChecks(usuario.uid);
    } finally {
      setResetando(false);
      setConfirmandoReset(false);
    }
  }

  useEffect(() => {
    if (!usuario) return;
    return onSnapshot(doc(db, 'usuarios', usuario.uid), (snap) => {
      setExame((snap.data()?.exame as string) ?? '');
    });
  }, [usuario]);

  async function salvarExame() {
    if (!usuario) return;
    setSalvando(true);
    setErro(false);
    try {
      await updateDoc(doc(db, 'usuarios', usuario.uid), { exame: exame.trim() || null });
    } catch {
      setErro(true);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View className="flex-1 bg-bg px-6 pt-7 gap-7">
      <Text className="font-display font-bold text-2xl text-text">Configurações</Text>

      {convitesRecebidos.length > 0 && (
        <Link href={`/(app)/config/convite/${convitesRecebidos[0].id}`} asChild>
          <Pressable className="bg-primaryFaint rounded-md px-3.5 py-3 flex-row items-center gap-2.5">
            <Text className="flex-1 text-[13px] font-semibold text-primary">
              {convitesRecebidos[0].deNome} quer ver seu progresso
            </Text>
            <View className="flex-row items-center gap-0.5"><Text className="text-primary text-xs font-bold">Ver</Text><ChevronRight size={16} color="#D42027" /></View>
          </Pressable>
        </Link>
      )}

      <Card className="flex-row items-center gap-3.5">
        <AvatarIniciais nome={usuario?.displayName ?? '?'} tamanho={48} />
        <View className="gap-0.5 flex-1 min-w-0">
          <Text className="text-[15px] font-semibold text-text">{usuario?.displayName}</Text>
          <Text className="text-[13px] text-textFaint" numberOfLines={1}>{usuario?.email}</Text>
        </View>
      </Card>

      <View>
        <Text className="text-xs font-semibold text-textFaint mb-2">Nome do exame/banca</Text>
        <TextInput
          value={exame}
          onChangeText={setExame}
          onBlur={salvarExame}
          placeholder="Ex.: OAB — 1ª Fase"
          placeholderTextColor="#B0B0B0"
          className={`h-[46px] rounded-sm border px-3 text-[15px] text-text bg-surface ${erro ? 'border-primary' : 'border-border'}`}
        />
        {erro && <Text className="text-[13px] font-semibold text-primary mt-1.5">Não foi possível salvar.</Text>}
        {salvando && <Text className="text-[13px] text-textFaint mt-1.5">Salvando…</Text>}
      </View>

      <Card className="p-0 overflow-hidden">
        <Link href="/(app)/config/materias" asChild>
          <Pressable className="flex-row items-center gap-3 px-4 py-3.5">
            <Text className="flex-1 text-[15px] font-semibold text-text">Matérias</Text>
            <ChevronRight size={16} color="#141414" />
          </Pressable>
        </Link>
        <View className="h-px bg-rowBorder mx-4" />
        <Link href="/(app)/config/compartilhar" asChild>
          <Pressable className="flex-row items-center gap-3 px-4 py-3.5">
            <Text className="flex-1 text-[15px] font-semibold text-text">Compartilhar progresso</Text>
            <ChevronRight size={16} color="#141414" />
          </Pressable>
        </Link>
      </Card>

      <Card className="p-0 overflow-hidden">
        <Pressable onPress={() => setConfirmandoReset(true)} className="flex-row items-center gap-3 px-4 py-3.5">
          <Text className="flex-1 text-[15px] font-semibold text-text">Limpar todos os checks</Text>
          <RotateCcw size={16} color="#9A9A9A" />
        </Pressable>
      </Card>

      <View className="border-t border-border pt-4">
        <Pressable onPress={() => signOut(auth).then(() => router.replace('/login'))}>
          <Text className="text-[15px] font-semibold text-primary">Sair da conta</Text>
        </Pressable>
      </View>

      <Modal visible={confirmandoReset} transparent animationType="fade" onRequestClose={() => setConfirmandoReset(false)}>
        <View className="flex-1 bg-black/45 items-center justify-center px-8">
          <View className="bg-surface rounded-lg p-5 gap-4 w-full max-w-[340px]">
            <Text className="font-display font-bold text-base text-text">Limpar todos os checks?</Text>
            <Text className="text-[13px] text-textMuted leading-5">
              Desmarca todos os blocos e rotinas concluídos. Os registros do diário e as revisões não são afetados.
            </Text>
            <View className="flex-row gap-2.5">
              <Pressable
                onPress={() => setConfirmandoReset(false)}
                className="flex-1 h-11 rounded-md border border-border items-center justify-center"
              >
                <Text className="text-text text-sm font-semibold">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={confirmarReset}
                disabled={resetando}
                className="flex-1 h-11 rounded-md bg-primary items-center justify-center"
              >
                <Text className="text-white text-sm font-semibold">{resetando ? 'Limpando…' : 'Limpar'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
