import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { useAuth } from '../../../../hooks/useAuth';
import { aceitarConvite, recusarConvite } from '../../../../lib/compartilhamento';
import { AvatarIniciais } from '../../../../components/ui/AvatarIniciais';
import type { Convite } from '../../../../types/modelos';

// Tela 22 — Compartilhar Aceitar Convite.dc.html. Rota NOVA (não existia no
// ARCHITECTURE.md original) — acessada pelo badge de convite pendente em
// Configurações. Só o convidado (dono dos dados) pode aceitar/recusar
// (firestore.rules: update do convite exige paraEmail == token.email).
export default function AceitarConvite() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario } = useAuth();
  const [convite, setConvite] = useState<Convite | null | undefined>(undefined);
  const [acao, setAcao] = useState<'aceitar' | 'recusar' | null>(null);
  const [erro, setErro] = useState(false);
  const [resultado, setResultado] = useState<'aceito' | 'recusado' | null>(null);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, 'convites', id), (snap) => {
      setConvite(snap.exists() ? ({ id: snap.id, ...snap.data() } as Convite) : null);
    });
  }, [id]);

  async function aceitar() {
    if (!convite || !usuario) return;
    setAcao('aceitar');
    setErro(false);
    try {
      await aceitarConvite(convite, usuario.uid);
      setResultado('aceito');
    } catch {
      setErro(true);
    } finally {
      setAcao(null);
    }
  }

  async function recusar() {
    if (!convite) return;
    setAcao('recusar');
    setErro(false);
    try {
      await recusarConvite(convite.id);
      setResultado('recusado');
    } catch {
      setErro(true);
    } finally {
      setAcao(null);
    }
  }

  if (convite === undefined) {
    return <View className="flex-1 bg-bg items-center justify-center"><Text className="text-textFaint">Carregando…</Text></View>;
  }
  if (convite === null || convite.status !== 'pendente') {
    return (
      <View className="flex-1 bg-bg items-center justify-center px-6">
        <Text className="text-sm font-semibold text-text text-center">Este convite não está mais disponível.</Text>
        <Pressable onPress={() => router.back()} className="mt-4 h-[42px] px-5 rounded-md border border-border items-center justify-center">
          <Text className="text-text text-sm font-semibold">Voltar</Text>
        </Pressable>
      </View>
    );
  }

  if (resultado) {
    return (
      <View className="flex-1 bg-bg items-center justify-center px-6">
        <Text className="text-[15px] font-semibold text-text text-center">
          {resultado === 'aceito'
            ? `Convite aceito. ${convite.deNome} agora acompanha seu progresso.`
            : 'Convite recusado.'}
        </Text>
      </View>
    );
  }

  const ocupado = !!acao;

  return (
    <View className="flex-1 bg-bg items-center justify-center px-6">
      <View className="w-full max-w-[372px] bg-surface border border-border rounded-card px-6 py-7 items-center gap-4">
        <AvatarIniciais nome={convite.deNome} tamanho={56} />
        <Text className="font-display font-bold text-lg text-text text-center">
          {convite.deNome} quer ver seu progresso de estudos
        </Text>
        <Text className="text-sm text-textMuted text-center leading-[22px]">
          {convite.deNome} vai poder ver seu streak, dashboard e relatório mensal. Seu diário e sua grade detalhada continuam privados.
        </Text>

        {erro && <Text className="text-[13px] font-semibold text-primary">Não foi possível processar. Tente de novo.</Text>}

        <View className="flex-row gap-2.5 w-full mt-1">
          <Pressable
            onPress={recusar}
            disabled={ocupado}
            className="flex-1 h-[46px] rounded-md border border-border bg-surface items-center justify-center"
          >
            {acao === 'recusar' ? <ActivityIndicator color="#6E6E6E" /> : <Text className="text-[14px] font-semibold text-textMuted">Recusar</Text>}
          </Pressable>
          <Pressable
            onPress={aceitar}
            disabled={ocupado}
            className="flex-1 h-[46px] rounded-md bg-primary items-center justify-center"
          >
            {acao === 'aceitar' ? <ActivityIndicator color="#fff" /> : <Text className="text-[14px] font-semibold text-white">Aceitar</Text>}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
