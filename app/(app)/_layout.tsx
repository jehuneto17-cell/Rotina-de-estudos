import { useWindowDimensions, View } from 'react-native';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { CalendarDays, ListChecks, NotebookPen, BarChart3, Settings } from 'lucide-react-native';
import Pomodoro from '../../components/Pomodoro';

// Tab bar (mobile / web estreita) OU sidebar (web larga) — mesmo arquivo,
// mesmas rotas, conforme ARCHITECTURE.md §3. As telas filhas não sabem qual está ativo.
export default function AppLayout() {
  const { width } = useWindowDimensions();
  const usaSidebar = Platform.OS === 'web' && width >= 768;

  if (usaSidebar) {
    // Placeholder de sidebar — o desenho real vem do UI-SPEC.md (chrome web).
    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View className="w-60 bg-sidebar" />
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
      </Tabs>
      <Pomodoro />
    </View>
  );
}
