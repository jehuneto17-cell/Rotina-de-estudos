import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { useConvitesEnviados } from '../../../hooks/useConvites';
import { useVinculos } from '../../../hooks/useVinculos';
import { useProgresso } from '../../../hooks/useProgresso';
import { enviarConvite, removerVinculo } from '../../../lib/compartilhamento';
import { AvatarIniciais } from '../../../components/ui/AvatarIniciais';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { EstadoVazio } from '../../../components/ui/EstadoVazioErro';
import type { Convite } from '../../../types/modelos';

// Telas 21 (Compartilhar Convidar.dc.html) + 24 (Gerenciar Vinculos.dc.html) — abas.
//
// DECISÃO DE FIDELIDADE: o texto do modal de convite no handoff diz "Vai poder
// ver SEU streak..." como se o CONVIDADO passasse a ver os dados de quem convida.
// Isso contradiz a mecânica real (firestore.rules + USER-FLOWS §3.8 passo 5):
// quem CRIA o convite (deUid) é quem GANHA acesso de visualização depois que o
// convidado aceita — "aceitar um convite dá AO CONVIDANTE permissão de ver o
// ACEITANTE". A tela "Aceitar Convite" do próprio handoff confirma essa direção
// ("Fulano quer ver SEU progresso"). Corrigi o texto do modal aqui para bater
// com a mecânica real, sem inventar comportamento novo.
export default function Compartilhar() {
  const [aba, setAba] = useState<'convidar' | 'gerenciar'>('convidar');

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center gap-3 px-6 pt-7 pb-4">
        <Pressable onPress={() => router.back()} className="w-8 h-8 rounded-full border border-border bg-surface items-center justify-center">
          <Text className="text-text">‹</Text>
        </Pressable>
        <Text className="font-display font-bold text-xl text-text flex-1">Compartilhar progresso</Text>
      </View>

      <View className="flex-row px-6 pb-4 gap-2">
        <AbaBotao label="Convidar" ativo={aba === 'convidar'} onPress={() => setAba('convidar')} />
        <AbaBotao label="Gerenciar vínculos" ativo={aba === 'gerenciar'} onPress={() => setAba('gerenciar')} />
      </View>

      {aba === 'convidar' ? <AbaConvidar /> : <AbaGerenciar />}
    </View>
  );
}

function AbaBotao({ label, ativo, onPress }: { label: string; ativo: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className={`h-[34px] px-3.5 rounded-pill items-center justify-center ${ativo ? 'bg-text' : 'bg-neutralBg'}`}>
      <Text className={`text-[13px] font-semibold ${ativo ? 'text-white' : 'text-textMuted'}`}>{label}</Text>
    </Pressable>
  );
}

function AbaConvidar() {
  const { usuario } = useAuth();
  const convites = useConvitesEnviados();
  const [modalAberto, setModalAberto] = useState(false);
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(false);

  const visiveis = convites.filter((c) => c.status !== 'recusado');

  async function enviar() {
    if (!usuario || !email.trim()) return;
    setEnviando(true);
    setErro(false);
    try {
      await enviarConvite({ deUid: usuario.uid, deNome: usuario.displayName ?? 'Alguém', paraEmail: email });
      setModalAberto(false);
      setEmail('');
    } catch {
      setErro(true);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View className="flex-1">
      {visiveis.length === 0 ? (
        <EstadoVazio
          mensagem="Você ainda não compartilha seu progresso com ninguém."
          labelAcao="Convidar alguém"
          onAcao={() => setModalAberto(true)}
        />
      ) : (
        <ScrollView contentContainerClassName="px-6 pb-24 gap-2.5">
          {visiveis.map((c) => (
            <View key={c.id} className="flex-row items-center gap-3 bg-surface border border-border rounded-card px-3.5 py-3">
              <AvatarIniciais nome={c.paraEmail} />
              <View className="flex-1 min-w-0">
                <Text className="text-sm font-semibold text-text" numberOfLines={1}>{c.paraEmail}</Text>
              </View>
              <StatusBadge label={c.status === 'aceito' ? 'Ativo' : 'Pendente'} tom={c.status === 'aceito' ? 'sucesso' : 'pendente'} />
            </View>
          ))}
        </ScrollView>
      )}

      {visiveis.length > 0 && (
        <View className="absolute left-6 right-6 bottom-7">
          <Pressable onPress={() => setModalAberto(true)} className="h-[52px] rounded-md bg-primary items-center justify-center">
            <Text className="text-white text-base font-semibold">Convidar alguém</Text>
          </Pressable>
        </View>
      )}

      <Modal visible={modalAberto} transparent animationType="slide" onRequestClose={() => setModalAberto(false)}>
        <View className="flex-1 bg-black/45 justify-end">
          <View className="bg-surface rounded-t-lg p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-display font-bold text-lg text-text">Convidar alguém</Text>
              <Pressable onPress={() => setModalAberto(false)} className="w-8 h-8 rounded-full bg-neutralBg items-center justify-center">
                <Text className="text-textMuted">✕</Text>
              </Pressable>
            </View>

            <Text className="text-xs font-semibold text-textFaint mb-2">E-mail da conta Google</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="nome@gmail.com"
              placeholderTextColor="#B0B0B0"
              autoCapitalize="none"
              keyboardType="email-address"
              className="h-[46px] rounded-sm border border-border px-3 text-[15px] text-text mb-2.5"
            />
            <Text className="text-[13px] text-textMuted mb-4">
              Você vai poder ver o streak, dashboard e relatório mensal dela assim que ela aceitar.
            </Text>

            {erro && (
              <Text className="text-[13px] font-semibold text-primary mb-3">
                Não foi possível enviar o convite. Verifique o e-mail e tente de novo.
              </Text>
            )}

            <Pressable
              onPress={enviar}
              disabled={enviando || !email.trim()}
              className="h-12 rounded-md bg-primary items-center justify-center"
            >
              {enviando ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-[15px] font-semibold">Enviar convite</Text>}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function AbaGerenciar() {
  const { usuario } = useAuth();
  const { donoUids } = useVinculos();
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [erro, setErro] = useState(false);

  async function remover(donoUid: string) {
    if (!usuario) return;
    try {
      await removerVinculo(donoUid, usuario.uid);
      setConfirmando(null);
    } catch {
      setErro(true);
      setTimeout(() => setErro(false), 2500);
    }
  }

  if (donoUids.length === 0) {
    return <EstadoVazio mensagem="Nenhum vínculo ativo ainda." />;
  }

  return (
    <ScrollView contentContainerClassName="px-6 pb-6 gap-2.5">
      {erro && (
        <View className="bg-primaryFaint rounded-md px-3.5 py-2.5 mb-1">
          <Text className="text-primary text-[13px] font-semibold text-center">Não foi possível remover o vínculo.</Text>
        </View>
      )}
      {donoUids.map((uid) => (
        <LinhaVinculo key={uid} donoUid={uid} onRemover={() => setConfirmando(uid)} />
      ))}

      {confirmando && (
        <Modal transparent animationType="fade" onRequestClose={() => setConfirmando(null)}>
          <View className="flex-1 bg-black/45 items-center justify-center px-6">
            <View className="w-full max-w-[340px] bg-surface rounded-card p-5.5 gap-4">
              <Text className="text-[15px] font-bold text-text">Remover este vínculo?</Text>
              <Text className="text-[13px] text-textMuted leading-[19px]">Você deixa de ver o progresso dela.</Text>
              <View className="flex-row gap-2.5">
                <Pressable onPress={() => setConfirmando(null)} className="flex-1 h-[42px] rounded-md border border-border items-center justify-center">
                  <Text className="text-[14px] font-semibold text-textMuted">Cancelar</Text>
                </Pressable>
                <Pressable onPress={() => remover(confirmando)} className="flex-1 h-[42px] rounded-md bg-primary items-center justify-center">
                  <Text className="text-[14px] font-semibold text-white">Remover</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

function LinhaVinculo({ donoUid, onRemover }: { donoUid: string; onRemover: () => void }) {
  const progresso = useProgresso(donoUid);
  const nome = progresso?.nome ?? 'Carregando…';

  return (
    <View className="flex-row items-center gap-3 bg-surface border border-border rounded-card px-3.5 py-3">
      <Link href={`/(app)/config/vinculo/${donoUid}`} asChild>
        <Pressable className="flex-1 flex-row items-center gap-3">
          <AvatarIniciais nome={nome} />
          <Text className="text-sm font-semibold text-text">{nome}</Text>
        </Pressable>
      </Link>
      <Pressable onPress={onRemover} className="h-8 px-3 rounded-pill border border-border items-center justify-center">
        <Text className="text-primary text-xs font-semibold">Remover</Text>
      </Pressable>
    </View>
  );
}
