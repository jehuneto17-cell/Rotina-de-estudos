import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { X } from 'lucide-react-native';

/** Modal de meta semanal + mensal (em horas) de uma matéria — ambas opcionais e independentes. */
export function ModalDefinirMeta({
  visivel,
  nomeMateria,
  horasSemanaAtual,
  horasMesAtual,
  onFechar,
  onSalvar,
}: {
  visivel: boolean;
  nomeMateria: string;
  horasSemanaAtual: number;
  horasMesAtual: number;
  onFechar: () => void;
  onSalvar: (horasSemana: number, horasMes: number) => Promise<void>;
}) {
  const [horasSemana, setHorasSemana] = useState(String(horasSemanaAtual || ''));
  const [horasMes, setHorasMes] = useState(String(horasMesAtual || ''));
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (visivel) {
      setHorasSemana(horasSemanaAtual ? String(horasSemanaAtual) : '');
      setHorasMes(horasMesAtual ? String(horasMesAtual) : '');
    }
  }, [visivel, horasSemanaAtual, horasMesAtual]);

  async function salvar() {
    setSalvando(true);
    try {
      await onSalvar(Number(horasSemana.replace(',', '.')) || 0, Number(horasMes.replace(',', '.')) || 0);
      onFechar();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={onFechar}>
      <View className="flex-1 bg-black/45 justify-end">
        <View className="bg-surface rounded-t-lg p-6 gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-display font-bold text-lg text-text">Meta de {nomeMateria}</Text>
            <Pressable onPress={onFechar} className="w-8 h-8 rounded-full bg-neutralBg items-center justify-center">
              <X size={16} color="#141414" />
            </Pressable>
          </View>

          <View>
            <Text className="text-xs font-semibold text-textFaint mb-2">Meta semanal (horas)</Text>
            <TextInput
              value={horasSemana}
              onChangeText={setHorasSemana}
              placeholder="Ex.: 5"
              placeholderTextColor="#B0B0B0"
              keyboardType="decimal-pad"
              className="h-[46px] rounded-sm border border-border px-3 text-[15px] text-text"
            />
          </View>

          <View>
            <Text className="text-xs font-semibold text-textFaint mb-2">Meta mensal (horas)</Text>
            <TextInput
              value={horasMes}
              onChangeText={setHorasMes}
              placeholder="Ex.: 20"
              placeholderTextColor="#B0B0B0"
              keyboardType="decimal-pad"
              className="h-[46px] rounded-sm border border-border px-3 text-[15px] text-text"
            />
          </View>

          <Text className="text-xs text-textFaint">Deixe em branco ou zero pra não ter meta naquele período.</Text>

          <Pressable onPress={salvar} disabled={salvando} className="h-12 rounded-md bg-primary items-center justify-center mt-1">
            {salvando ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-[15px] font-semibold">Salvar</Text>}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
