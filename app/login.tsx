import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../hooks/useAuth';
import { useGoogleLogin } from '../hooks/useGoogleLogin';

// Tela 1 — handoff Login.dc.html.
export default function Login() {
  const { usuario } = useAuth();
  const { pronto, entrando, erro, entrarComGoogle } = useGoogleLogin();

  // signInWithRedirect volta pra esta mesma tela; sem isso o login nunca navega adiante.
  if (usuario) return <Redirect href="/" />;

  return (
    <View className="flex-1 bg-bg items-center">
      <View className="w-full max-w-[420px] flex-1 px-6">
        <View className="items-center" style={{ paddingTop: '30%' }}>
          <Text className="font-display font-bold text-[30px] text-text -tracking-[0.3px]">
            Rotina de Estudos
          </Text>
          <Text className="mt-3 text-base text-textMuted">Organize sua rotina de estudos.</Text>
        </View>

        <View className="flex-1" />

        <View className="pb-10 gap-3">
          {erro && (
            <View className="bg-primaryFaint rounded-md px-3.5 py-3">
              <Text className="text-primary text-sm font-semibold text-center">
                Não foi possível entrar. Tente novamente.
              </Text>
            </View>
          )}

          <Pressable
            disabled={!pronto}
            onPress={entrarComGoogle}
            className="h-[52px] rounded-md border border-border bg-surface items-center justify-center flex-row gap-2.5 active:bg-neutralBg disabled:opacity-60"
          >
            {entrando ? (
              <ActivityIndicator color="#141414" />
            ) : (
              <>
                <GoogleIcon />
                <Text className="text-base font-semibold text-text">Entrar com Google</Text>
              </>
            )}
          </Pressable>

          <Text className="text-center text-xs text-textFaint leading-[18px] px-2">
            Ao continuar, você concorda com o uso dos seus dados para sincronizar sua rotina.
          </Text>
        </View>
      </View>
    </View>
  );
}

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Path fill="#4285F4" d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.74 2.97-4.32 2.97-7.31z" />
      <Path fill="#34A853" d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.23-2.5c-.9.6-2.06.96-3.4.96-2.6 0-4.8-1.76-5.6-4.12H1.06v2.58A10 10 0 0 0 10 20z" />
      <Path fill="#FBBC05" d="M4.4 11.92a6 6 0 0 1 0-3.84V5.5H1.06a10 10 0 0 0 0 9l3.34-2.58z" />
      <Path fill="#EA4335" d="M10 3.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 10 0a10 10 0 0 0-8.94 5.5l3.34 2.58C5.2 5.72 7.4 3.96 10 3.96z" />
    </Svg>
  );
}
