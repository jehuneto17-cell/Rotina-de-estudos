import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

const POMODORO_SEGUNDOS = 25 * 60;
type Fase = 'fechado' | 'rodando' | 'pausado' | 'finalizado';

function formatarTempo(seg: number) {
  const m = Math.floor(seg / 60).toString().padStart(2, '0');
  const s = (seg % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Widget flutuante — bottom sheet no mobile e na web (painel fixo fica pra quando
// o chrome web/sidebar for implementado; por ora o mesmo bottom sheet serve os dois).
export default function Pomodoro() {
  const [fase, setFase] = useState<Fase>('fechado');
  const [restante, setRestante] = useState(POMODORO_SEGUNDOS);
  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);

  // Regra não negociável (ARCHITECTURE.md §3): todo setInterval do Pomodoro
  // tem clearInterval garantido no unmount.
  useEffect(() => () => {
    if (intervalId.current) clearInterval(intervalId.current);
  }, []);

  function iniciarContagem() {
    if (intervalId.current) clearInterval(intervalId.current);
    intervalId.current = setInterval(() => {
      setRestante((atual) => {
        if (atual <= 1) {
          if (intervalId.current) clearInterval(intervalId.current);
          setFase('finalizado');
          return 0;
        }
        return atual - 1;
      });
    }, 1000);
  }

  function abrirEIniciar() {
    setRestante(POMODORO_SEGUNDOS);
    setFase('rodando');
    iniciarContagem();
  }

  function fechar() {
    if (intervalId.current) clearInterval(intervalId.current);
    setFase('fechado');
  }

  function alternarPausa() {
    setFase((f) => {
      const novaFase = f === 'rodando' ? 'pausado' : 'rodando';
      if (novaFase === 'rodando') iniciarContagem();
      else if (intervalId.current) clearInterval(intervalId.current);
      return novaFase;
    });
  }

  function encerrar() {
    if (intervalId.current) clearInterval(intervalId.current);
    setFase('finalizado');
  }

  function descartar() {
    setFase('fechado');
    setRestante(POMODORO_SEGUNDOS);
  }

  const minutosEstudados = Math.round((POMODORO_SEGUNDOS - restante) / 60);

  function registrar() {
    setFase('fechado');
    setRestante(POMODORO_SEGUNDOS);
    router.push({
      pathname: '/(app)/diario/novo',
      params: { duracaoMin: String(minutosEstudados), origem: 'pomodoro' },
    });
  }

  if (fase === 'fechado') {
    return (
      <Pressable
        onPress={abrirEIniciar}
        className="absolute bottom-7 right-6 h-12 px-4.5 rounded-pill bg-sidebar flex-row items-center gap-2.5 shadow-lg"
      >
        <Text className="text-base">⏳</Text>
        <Text className="font-display font-bold text-sm text-textOnDark">Pronto para começar</Text>
      </Pressable>
    );
  }

  return (
    <Modal transparent animationType="slide" visible onRequestClose={fechar}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-sidebar rounded-t-lg p-6 gap-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-textOnDarkMuted">Pomodoro</Text>
            <Pressable onPress={fechar} className="w-[30px] h-[30px] rounded-full bg-white/10 items-center justify-center">
              <Text className="text-white text-sm">✕</Text>
            </Pressable>
          </View>

          {(fase === 'rodando' || fase === 'pausado') && (
            <View className="items-center gap-4 py-3">
              <Text className="font-display font-bold text-[56px] text-white tracking-wide">
                {formatarTempo(restante)}
              </Text>
              <View className="flex-row gap-3">
                <Pressable onPress={alternarPausa} className="h-11 px-5.5 rounded-md bg-white items-center justify-center">
                  <Text className="text-sm font-semibold text-text">{fase === 'rodando' ? 'Pausar' : 'Retomar'}</Text>
                </Pressable>
                <Pressable onPress={encerrar} className="h-11 px-5.5 rounded-md border border-white/30 items-center justify-center">
                  <Text className="text-sm font-semibold text-white">Encerrar</Text>
                </Pressable>
              </View>
            </View>
          )}

          {fase === 'finalizado' && (
            <View className="gap-3.5">
              <Text className="text-center text-[15px] font-semibold text-white">Registrar esta sessão?</Text>
              <Text className="text-center text-[13px] text-textOnDarkMuted">{minutosEstudados}min de estudo</Text>
              <View className="flex-row gap-2.5">
                <Pressable onPress={descartar} className="flex-1 h-11.5 rounded-md border border-white/30 items-center justify-center">
                  <Text className="text-sm font-semibold text-white">Descartar</Text>
                </Pressable>
                <Pressable onPress={registrar} className="flex-1 h-11.5 rounded-md bg-primary items-center justify-center">
                  <Text className="text-sm font-semibold text-white">Registrar</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
