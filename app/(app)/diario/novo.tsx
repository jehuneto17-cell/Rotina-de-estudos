import { useEffect, useState } from 'react';
import { Check, Paperclip, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../hooks/useAuth';
import { useDados } from '../../../hooks/useDados';
import { useRegistrosDiario } from '../../../hooks/useRegistrosDiario';
import { atualizarRegistro, criarRegistro } from '../../../lib/diario';
import { enviarAnexo } from '../../../lib/anexos';
import { hojeCivil } from '../../../lib/datas';
import { MateriaIcon } from '../../../components/ui/MateriaIcon';
import { CampoAutocomplete } from '../../../components/ui/CampoAutocomplete';
import type { Anexo, RegistroDiario } from '../../../types/modelos';

// Tela 11 — modal full-screen (mobile) / drawer (web), conforme USER-FLOWS.md.
// Params opcionais: ?editar=<registroId> (edição, vindo do Diário Detalhe) ou
// ?duracaoMin=&origem=pomodoro (pré-preenchido pelo widget do Pomodoro).
export default function NovoRegistro() {
  const { usuario } = useAuth();
  const { materias } = useDados();
  const { registros } = useRegistrosDiario();
  const params = useLocalSearchParams<{ editar?: string; duracaoMin?: string; origem?: string }>();
  const editandoId = params.editar ?? null;

  const [materiaId, setMateriaId] = useState<string | null>(null);
  const [conteudo, setConteudo] = useState('');
  const [duracao, setDuracao] = useState(params.duracaoMin ?? '');
  const [notas, setNotas] = useState('');
  const [data, setData] = useState(hojeCivil());
  const [tags, setTags] = useState<string[]>([]);
  const [rascunhoTag, setRascunhoTag] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<{ materia?: boolean; conteudo?: boolean; duracao?: boolean }>({});
  const [gerarRevisoes, setGerarRevisoes] = useState(true);
  const [anexo, setAnexo] = useState<Anexo | null>(null);
  const [enviandoAnexo, setEnviandoAnexo] = useState(false);
  const [erroAnexo, setErroAnexo] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario || !editandoId) return;
    getDoc(doc(db, 'usuarios', usuario.uid, 'registros', editandoId)).then((snap) => {
      if (!snap.exists()) return;
      const r = snap.data() as RegistroDiario;
      setMateriaId(r.materiaId);
      setConteudo(r.conteudo);
      setDuracao(String(r.duracaoMin));
      setNotas(r.notas ?? '');
      setData(r.data);
      setTags(r.tags ?? []);
    });
  }, [usuario, editandoId]);

  const tagsExistentes = [...new Set(registros.flatMap((r) => r.tags))].filter((t) => !tags.includes(t));

  // Sugestões de conteúdo: prioriza os registros da mesma matéria, depois o resto.
  const conteudosAnteriores = [
    ...new Set([
      ...registros.filter((r) => r.materiaId === materiaId).map((r) => r.conteudo),
      ...registros.map((r) => r.conteudo),
    ]),
  ];

  // Só imagem por enquanto (ponytail: PDF pediria expo-document-picker, sem
  // uso relatado ainda — adicionar se surgir a necessidade).
  async function escolherAnexo() {
    setErroAnexo(null);
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (resultado.canceled) return;
    const asset = resultado.assets[0];
    setEnviandoAnexo(true);
    try {
      const blob = await (await fetch(asset.uri)).blob();
      const novoAnexo = await enviarAnexo({
        registroId: editandoId ?? 'novo',
        arquivo: blob,
        nome: asset.fileName ?? 'anexo.jpg',
        tipo: asset.mimeType ?? blob.type ?? 'image/jpeg',
      });
      setAnexo(novoAnexo);
    } catch (e) {
      setErroAnexo(e instanceof Error ? e.message : 'Falha ao enviar anexo.');
    } finally {
      setEnviandoAnexo(false);
    }
  }

  function adicionarTag(nome: string) {
    const t = nome.trim();
    if (!t || tags.includes(t)) return;
    setTags((s) => [...s, t]);
    setRascunhoTag('');
  }

  async function salvar() {
    const novosErros = {
      materia: !materiaId,
      conteudo: !conteudo.trim(),
      duracao: !duracao,
    };
    if (novosErros.materia || novosErros.conteudo || novosErros.duracao) {
      setErros(novosErros);
      return;
    }
    if (!usuario) return;

    setSalvando(true);
    try {
      if (editandoId) {
        await atualizarRegistro({
          uid: usuario.uid,
          registroId: editandoId,
          materiaId: materiaId!,
          conteudo: conteudo.trim(),
          duracaoMin: Number(duracao),
          notas,
          data,
          tags,
        });
      } else {
        await criarRegistro({
          uid: usuario.uid,
          materiaId: materiaId!,
          conteudo: conteudo.trim(),
          duracaoMin: Number(duracao),
          notas,
          data,
          tags,
          anexo,
          origem: params.origem === 'pomodoro' ? 'pomodoro' : 'manual',
          gerarRevisoes,
        });
      }
      router.back();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View className="flex-1 bg-black/45 justify-end">
      <View className="bg-surface rounded-t-lg max-h-[92%]">
        <View className="flex-row items-center justify-between px-6 pt-6 pb-2">
          <Text className="font-display font-bold text-xl text-text">{editandoId ? 'Editar registro' : 'Novo registro'}</Text>
          <Pressable onPress={() => router.back()} className="w-8 h-8 rounded-full bg-neutralBg items-center justify-center">
            <X size={16} color="#141414" />
          </Pressable>
        </View>

        <ScrollView contentContainerClassName="px-6 pb-6 gap-5">
          <View>
            <Text className="text-xs font-semibold text-textFaint mb-2">Disciplina</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
              {materias.map((m) => {
                const selecionada = materiaId === m.id;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => { setMateriaId(m.id); setErros((e) => ({ ...e, materia: false })); }}
                    className={`flex-row items-center gap-1.5 h-[38px] px-3.5 rounded-pill ${
                      selecionada ? 'border-[1.5px]' : 'border border-border bg-surface'
                    }`}
                    style={selecionada ? { borderColor: m.cor, backgroundColor: `${m.cor}18` } : undefined}
                  >
                    <Text>{m.emoji}</Text>
                    <Text className="text-sm font-semibold" style={selecionada ? { color: m.cor } : { color: '#141414' }}>
                      {m.nome}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            {erros.materia && <Text className="text-primary text-[13px] font-semibold mt-1.5">Escolha uma disciplina.</Text>}
          </View>

          <View>
            <Text className="text-xs font-semibold text-textFaint mb-2">Conteúdo estudado</Text>
            <CampoAutocomplete
              value={conteudo}
              onChangeText={(v) => { setConteudo(v); setErros((e) => ({ ...e, conteudo: false })); }}
              sugestoes={conteudosAnteriores}
              placeholder="Ex.: Lei 8.112 — Regime disciplinar"
              className={`h-[46px] rounded-sm border px-3 text-[15px] text-text ${erros.conteudo ? 'border-primary' : 'border-border'}`}
            />
            {erros.conteudo && <Text className="text-primary text-[13px] font-semibold mt-1.5">Descreva o conteúdo estudado.</Text>}
          </View>

          <View>
            <Text className="text-xs font-semibold text-textFaint mb-2">Duração (minutos)</Text>
            <TextInput
              value={duracao}
              onChangeText={(v) => { setDuracao(v.replace(/\D/g, '')); setErros((e) => ({ ...e, duracao: false })); }}
              placeholder="45"
              placeholderTextColor="#B0B0B0"
              keyboardType="number-pad"
              className={`h-11 rounded-sm border px-3 text-[15px] text-text ${erros.duracao ? 'border-primary' : 'border-border'}`}
            />
            {erros.duracao && <Text className="text-primary text-[13px] font-semibold mt-1.5">Informe a duração da sessão.</Text>}
          </View>

          <View>
            <Text className="text-xs font-semibold text-textFaint mb-2">Notas</Text>
            <TextInput
              value={notas}
              onChangeText={setNotas}
              placeholder="O que você revisou ou aprendeu de novo?"
              placeholderTextColor="#B0B0B0"
              multiline
              numberOfLines={3}
              className="rounded-sm border border-border px-3 py-2.5 text-[15px] text-text min-h-[70px]"
            />
          </View>

          <View>
            <Text className="text-xs font-semibold text-textFaint mb-2">Data</Text>
            <TextInput
              value={data}
              onChangeText={setData}
              placeholder="AAAA-MM-DD"
              className="h-[46px] rounded-sm border border-border px-3 text-[15px] text-text"
            />
          </View>

          <View>
            <Text className="text-xs font-semibold text-textFaint mb-2">Tags</Text>
            {tags.length > 0 && (
              <View className="flex-row flex-wrap gap-1.5 mb-2">
                {tags.map((t) => (
                  <View key={t} className="flex-row items-center gap-1.5 h-[30px] pl-3 pr-2.5 rounded-pill bg-text">
                    <Text className="text-white text-xs font-semibold">{t}</Text>
                    <Pressable onPress={() => setTags((s) => s.filter((x) => x !== t))}>
                      <X size={16} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
            <TextInput
              value={rascunhoTag}
              onChangeText={setRascunhoTag}
              onSubmitEditing={() => adicionarTag(rascunhoTag)}
              placeholder="Digite e pressione Enter para criar"
              placeholderTextColor="#B0B0B0"
              className="h-11 rounded-sm border border-border px-3 text-sm text-text mb-2"
            />
            {tagsExistentes.length > 0 && (
              <View className="flex-row flex-wrap gap-1.5">
                {tagsExistentes.map((t) => (
                  <Pressable key={t} onPress={() => adicionarTag(t)} className="h-7 px-2.5 rounded-pill border border-dashed border-border">
                    <Text className="text-textMuted text-xs font-semibold">+ {t}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {!editandoId && (
            <View>
              <Text className="text-xs font-semibold text-textFaint mb-2">Anexo</Text>
              {anexo ? (
                <View className="flex-row items-center gap-3">
                  <Image source={{ uri: anexo.url }} className="w-14 h-14 rounded-sm" resizeMode="cover" />
                  <Text className="text-sm text-textMuted flex-1" numberOfLines={1}>{anexo.nome}</Text>
                  <Pressable onPress={() => setAnexo(null)} className="w-8 h-8 rounded-full bg-neutralBg items-center justify-center">
                    <X size={16} color="#141414" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={escolherAnexo}
                  disabled={enviandoAnexo}
                  className="h-11 rounded-sm border border-dashed border-border flex-row items-center justify-center gap-2"
                >
                  {enviandoAnexo ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <>
                      <Paperclip size={16} color="#767676" />
                      <Text className="text-sm text-textMuted">Anexar imagem</Text>
                    </>
                  )}
                </Pressable>
              )}
              {erroAnexo && <Text className="text-primary text-[13px] font-semibold mt-1.5">{erroAnexo}</Text>}
            </View>
          )}

          {!editandoId && (
            <Pressable
              onPress={() => setGerarRevisoes((v) => !v)}
              className="flex-row items-center gap-2.5"
            >
              <View className={`w-5 h-5 rounded-[5px] items-center justify-center ${gerarRevisoes ? 'bg-primary' : 'border-[1.5px] border-border'}`}>
                {gerarRevisoes && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <Text className="text-[13px] text-textMuted flex-1">
                Agendar revisão espaçada (1, 3, 7 e 15 dias)
              </Text>
            </Pressable>
          )}
        </ScrollView>

        <View className="px-6 py-4 border-t border-rowBorder">
          <Pressable
            onPress={salvar}
            disabled={salvando}
            className={`h-[52px] rounded-md items-center justify-center flex-row gap-2.5 ${salvando ? 'bg-primary/60' : 'bg-primary'}`}
          >
            {salvando ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-base font-semibold">{editandoId ? 'Salvar alterações' : 'Registrar sessão'}</Text>}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
