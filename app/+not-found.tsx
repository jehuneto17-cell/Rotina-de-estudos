import { Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-lg text-text mb-4">Página não encontrada.</Text>
      <Link href="/" className="text-primary">Voltar ao início</Link>
    </View>
  );
}
