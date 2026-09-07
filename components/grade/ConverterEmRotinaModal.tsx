import { useState } from 'react';
import { X } from 'lucide-react-native';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

const DIAS = [
  { chave: 0, rotulo: 'D', util: false },
  { chave: 1, rotulo: 'S', util: true },
  { chave: 2, rotulo: 'T', util: true },
  { chave: 3, rotulo: 'Q', util: true },
  { chave: 4, rotulo: 'Q', util: true },
  { chave: 5, rotulo: 'S', util: true },
  { chave: 6, rotulo: 'S', util: false },
];

// handoff: Converter em Rotina.dc.html — modal chamado a partir do bloco (edit).
export function ConverterEmRotinaModal({
  visivel,
  onFechar,
  onConfirmar,
}: {
  visivel: boolean;
  onFechar: () => void;
  onConfirmar: (diasSemana: number[]) => Promise<void>;
}) {
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [confirmando, setConfirmando] = useState(false);
  const [erroDia, setErroDia] = useState(false);

  function alternar(dia: number) {
    setErroDia(false);
    setSelecionados((s) => {
      const novo = new Set(s);
      novo.has(dia) ? novo.delete(dia) : novo.add(dia);
      return novo;
    });
  }

  async function confirmar() {
    if (selecionados.size === 0) {
      setErroDia(true);
      return;
    }
    setConfirmando(true);
    try {
      await onConfirmar([...selecionados].sort());
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={onFechar}>
      <View className="flex-1 bg-black/55 justify-end">
        <View className="bg-surface rounded-t-lg pb-8">
          <View className="flex-row items-center justify-between px-6 pt-6 pb-1">
            <Text className="font-display font-bold text-xl text-text">Transformar em rotina</Text>
            <Pressable onPress={onFechar} className="w-8 h-8 rounded-full bg-neutralBg items-center justify-center">
              <X size={16} color="#141414" />
            </Pressable>
          </View>

          <View className="flex-row gap-2.5 px-6 pt-4 pb-2">
            <Pressable
              onPress={() => { setSelecionados(new Set(DIAS.map((d) => d.chave))); setErroDia(false); }}
              className="flex-1 h-[42px] rounded-md border border-border items-center justify-center"
            >
              <Text className="text-sm font-semibold text-text">Todos os dias</Text>
            </Pressable>
            <Pressable
              onPress={() => { setSelecionados(new Set(DIAS.filter((d) => d.util).map((d) => d.chave))); setErroDia(false); }}
              className="flex-1 h-[42px] rounded-md border border-border items-center justify-center"
            >
              <Text className="text-sm font-semibold text-text">Dias úteis</Text>
            </Pressable>
          </View>

          <View className="flex-row justify-between px-6 pt-3 pb-1 gap-1.5">
            {DIAS.map((d) => {
              const ativo = selecionados.has(d.chave);
              return (
                <Pressable
                  key={d.chave}
                  onPress={() => alternar(d.chave)}
                  className={`w-10 h-10 rounded-pill items-center justify-center ${
                    ativo ? 'bg-primary' : 'border border-border bg-surface'
                  }`}
                >
                  <Text className={`text-sm font-semibold ${ativo ? 'text-white' : 'text-text'}`}>{d.rotulo}</Text>
                </Pressable>
              );
            })}
          </View>

          <View className="px-6 pt-5 gap-2.5">
            {erroDia && (
              <Text className="text-[13px] font-semibold text-primary text-center">Selecione ao menos um dia.</Text>
            )}
            <Pressable
              disabled={confirmando}
              onPress={confirmar}
              className="h-[52px] rounded-md bg-primary items-center justify-center"
            >
              {confirmando ? <ActivityIndicator color="#fff" /> : (
                <Text className="text-white text-base font-semibold">Confirmar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
