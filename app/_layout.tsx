import '../global.css';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import { DadosProvider } from '../contexts/DadosContext';
import { TemaProvider } from '../contexts/TemaContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TemaProvider>
        <AuthProvider>
          <DadosProvider>
            <Stack screenOptions={{ headerShown: false }} />
            <StatusBar style="dark" />
          </DadosProvider>
        </AuthProvider>
      </TemaProvider>
    </GestureHandlerRootView>
  );
}
