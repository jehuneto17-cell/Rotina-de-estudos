import { useWindowDimensions, View } from 'react-native';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';

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
      </View>
    );
  }

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#D42027' }}>
      <Tabs.Screen name="hoje/index" options={{ title: 'Hoje' }} />
      <Tabs.Screen name="rotinas/index" options={{ title: 'Rotinas' }} />
      <Tabs.Screen name="diario/index" options={{ title: 'Diário' }} />
      <Tabs.Screen name="resumo/index" options={{ title: 'Resumo' }} />
      <Tabs.Screen name="config/index" options={{ title: 'Config' }} />
    </Tabs>
  );
}
