import { useWindowDimensions, View } from 'react-native';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { CalendarDays, ListChecks, NotebookPen, BarChart3, Settings } from 'lucide-react-native';
import Pomodoro from '../../components/Pomodoro';
import Sidebar from '../../components/Sidebar';

// Tab bar (mobile / web estreita) OU sidebar (web larga) — mesmo arquivo,
// mesmas rotas, conforme ARCHITECTURE.md §3. As telas filhas não sabem qual está ativo.
export default function AppLayout() {
  const { width } = useWindowDimensions();
  const usaSidebar = Platform.OS === 'web' && width >= 768;

  if (usaSidebar) {
    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Sidebar />
        <View style={{ flex: 1 }}>
          <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }} />
        </View>
        <Pomodoro />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#D42027', tabBarInactiveTintColor: '#9A9A9A' }}>
        <Tabs.Screen
          name="hoje/index"
          options={{ title: 'Hoje', tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} /> }}
        />
        <Tabs.Screen
          name="rotinas/index"
          options={{ title: 'Rotinas', tabBarIcon: ({ color, size }) => <ListChecks color={color} size={size} /> }}
        />
        <Tabs.Screen
          name="diario/index"
          options={{ title: 'Diário', tabBarIcon: ({ color, size }) => <NotebookPen color={color} size={size} /> }}
        />
        <Tabs.Screen
          name="resumo/index"
          options={{ title: 'Resumo', tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} /> }}
        />
        <Tabs.Screen
          name="config/index"
          options={{ title: 'Config', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }}
        />
        {/* Subtelas navegadas via router.push, não abas — Expo Router
            registra toda rota do grupo como aba por padrão; href:null tira
            da barra sem tirar da navegação. */}
        <Tabs.Screen name="hoje/bloco/[id]" options={{ href: null }} />
        <Tabs.Screen name="hoje/bloco/novo" options={{ href: null }} />
        <Tabs.Screen name="diario/[id]" options={{ href: null }} />
        <Tabs.Screen name="diario/novo" options={{ href: null }} />
        <Tabs.Screen name="revisao/index" options={{ href: null }} />
        <Tabs.Screen name="config/materias" options={{ href: null }} />
        <Tabs.Screen name="config/compartilhar" options={{ href: null }} />
        <Tabs.Screen name="config/convite/[id]" options={{ href: null }} />
        <Tabs.Screen name="config/vinculo/[uid]" options={{ href: null }} />
      </Tabs>
      <Pomodoro />
    </View>
  );
}
