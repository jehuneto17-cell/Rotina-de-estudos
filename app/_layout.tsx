import '../global.css';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useFonts, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { View } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import { DadosProvider } from '../contexts/DadosContext';
import { TemaProvider } from '../contexts/TemaContext';
import { BannerOffline } from '../components/ui/BannerOffline';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  // Sem tela de loading elaborada: MVP pessoal, download é rápido e cacheado.
  if (!fontsLoaded) return <View className="flex-1 bg-bg" />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TemaProvider>
        <AuthProvider>
          <DadosProvider>
            <BannerOffline />
            <Stack screenOptions={{ headerShown: false }} />
            <StatusBar style="dark" />
          </DadosProvider>
        </AuthProvider>
      </TemaProvider>
    </GestureHandlerRootView>
  );
}
