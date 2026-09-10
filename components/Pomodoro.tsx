import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react-native';
import { Modal, Platform, Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

const MIN_PADRAO = { foco: 25, pausa: 5 };
type FaseTipo = 'foco' | 'pausa';
type Fase = 'fechado' | 'rodando' | 'pausado' | 'finalizado';

function formatarTempo(seg: number) {
  const m = Math.floor(seg / 60).toString().padStart(2, '0');
  const s = (seg % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Sinal sonoro simples via Web Audio (só existe no browser — no nativo o
// aviso é tátil, ver avisar() abaixo). Sem asset de áudio no projeto, então
// nada a carregar: gera o tom na hora.
function tocarBeepWeb() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    [880, 660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.28;
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  } catch {
    // silencioso — navegador sem suporte a Web Audio
  }
}

function avisar() {
  tocarBeepWeb();
  if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

// Widget flutuante global (montado em (app)/_layout.tsx) — bottom sheet.
// Ciclos automáticos foco→pausa→foco (ARCHITECTURE.md/PRODUCT-SPEC "ciclo do
// Pomodoro"), com contador de pomodoros completos e aviso sonoro/tátil.
export default function Pomodoro() {
  // Mesmo corte de largura do (app)/_layout.tsx: abaixo de 768 no web (ou
  // sempre no nativo) a barra de abas fica visível embaixo, então o widget
  // precisa subir pra não ficar por cima dela.
  const { width } = useWindowDimensions();
  const usaTabBar = !(Platform.OS === 'web' && width >= 768);

  const [fase, setFase] = useState<Fase>('fechado');
  const [tipoFase, setTipoFase] = useState<FaseTipo>('foco');
  const [focoMin, setFocoMin] = useState(MIN_PADRAO.foco);
  const [pausaMin, setPausaMin] = useState(MIN_PADRAO.pausa);
  const [restante, setRestante] = useState(MIN_PADRAO.foco * 60);
  const [ciclos, setCiclos] = useState(0);
  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);

  // Regra não negociável (ARCHITECTURE.md §3): todo setInterval do Pomodoro
  // tem clearInterval garantido no unmount.
  useEffect(() => () => {
    if (intervalId.current) clearInterval(intervalId.current);
  }, []);

  function iniciarContagem(aoTerminar: () => void) {
    if (intervalId.current) clearInterval(intervalId.current);
    intervalId.current = setInterval(() => {
      setRestante((atual) => {
        if (atual <= 1) {
          if (intervalId.current) clearInterval(intervalId.current);
          setTimeout(aoTerminar, 0);
          return 0;
        }
        return atual - 1;
      });
    }, 1000);
  }

  function iniciarFoco() {
    setTipoFase('foco');
    setRestante(focoMin * 60);
    setFase('rodando');
    iniciarContagem(() => {
      avisar();
      setCiclos((c) => c + 1);
      setFase('finalizado'); // oferece registrar/descartar antes de ir pra pausa
    });
  }

  function iniciarPausa() {
    setTipoFase('pausa');
    setRestante(pausaMin * 60);
    setFase('rodando');
    iniciarContagem(() => {
      avisar();
      iniciarFoco(); // ciclo automático: pausa termina -> novo foco começa sozinho
    });
  }

  function fechar() {
    if (intervalId.current) clearInterval(intervalId.current);
    setFase('fechado');
  }

  function alternarPausa() {
    if (fase === 'rodando') {
      if (intervalId.current) clearInterval(intervalId.current);
      setFase('pausado');
    } else if (fase === 'pausado') {
      setFase('rodando');
      iniciarContagem(() => {
        avisar();
        if (tipoFase === 'foco') {
          setCiclos((c) => c + 1);
          setFase('finalizado');
        } else {
          iniciarFoco();
        }
      });
    }
  }

  function encerrar() {
    if (intervalId.current) clearInterval(intervalId.current);
    fechar();
  }

  const minutosEstudados = focoMin;

  function registrar() {
    fechar();
    router.push({
      pathname: '/(app)/diario/novo',
      params: { duracaoMin: String(minutosEstudados), origem: 'pomodoro' },
    });
  }

  function descartarEIrPraPausa() {
    iniciarPausa();
  }

  if (fase === 'fechado') {
    return (
      {/* bottom-40 no mobile: acima da barra de abas E do botão "+" de novo
          bloco da tela Hoje (que fica em bottom-24, ver hoje/index.tsx). */}
      <View className={`absolute right-6 items-end gap-2 ${usaTabBar ? 'bottom-40' : 'bottom-7'}`}>
        <View className="flex-row items-center gap-1.5 bg-surface border border-border rounded-pill px-2.5 h-8">
          <TextInput
            value={String(focoMin)}
            onChangeText={(v) => setFocoMin(Math.min(90, Math.max(1, Number(v.replace(/\D/g, '')) || 1)))}
            keyboardType="number-pad"
            className="w-7 text-center text-xs font-semibold text-text"
          />
          <Text className="text-[11px] text-textFaint">min foco ·</Text>
          <TextInput
            value={String(pausaMin)}
            onChangeText={(v) => setPausaMin(Math.min(30, Math.max(1, Number(v.replace(/\D/g, '')) || 1)))}
            keyboardType="number-pad"
            className="w-6 text-center text-xs font-semibold text-text"
          />
          <Text className="text-[11px] text-textFaint">min pausa</Text>
        </View>
        <Pressable
          onPress={iniciarFoco}
          className="h-12 px-4.5 rounded-pill bg-sidebar flex-row items-center gap-2.5 shadow-lg"
        >
          <Text className="text-base">⏳</Text>
          <Text className="font-display font-bold text-sm text-textOnDark">
            {ciclos > 0 ? `🍅×${ciclos} · Começar` : 'Pronto para começar'}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Modal transparent animationType="slide" visible onRequestClose={fechar}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-sidebar rounded-t-lg p-6 gap-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-textOnDarkMuted">
              Pomodoro {ciclos > 0 && `· 🍅×${ciclos}`}
            </Text>
            <Pressable onPress={fechar} className="w-[30px] h-[30px] rounded-full bg-white/10 items-center justify-center">
              <X size={16} color="#FFFFFF" />
            </Pressable>
          </View>

          {(fase === 'rodando' || fase === 'pausado') && (
            <View className="items-center gap-4 py-3">
              <Text className="text-xs font-semibold text-textOnDarkMuted uppercase tracking-wide">
                {tipoFase === 'foco' ? '🍅 Foco' : '☕ Pausa'}
              </Text>
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
                <Pressable onPress={descartarEIrPraPausa} className="flex-1 h-11.5 rounded-md border border-white/30 items-center justify-center">
                  <Text className="text-sm font-semibold text-white">Só pausa</Text>
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
