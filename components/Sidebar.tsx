import { CalendarDays, ListChecks, NotebookPen, BarChart3, Settings } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

const ITENS = [
  { rota: '/hoje', label: 'Hoje', Icon: CalendarDays },
  { rota: '/rotinas', label: 'Rotinas', Icon: ListChecks },
  { rota: '/diario', label: 'Diário', Icon: NotebookPen },
  { rota: '/resumo', label: 'Resumo', Icon: BarChart3 },
] as const;

// Sidebar fixa da web (>=768px), conforme UI-SPEC.md: 5 destinos, item de
// Configurações isolado no rodapé. Mesmo tom escuro (#141414) do painel do
// Pomodoro — única superfície dark do design system.
export default function Sidebar() {
  const pathname = usePathname();
  const { usuario } = useAuth();

  return (
    <View className="w-60 bg-sidebar justify-between py-6">
      <View>
        <Text className="font-display font-bold text-lg text-white px-6 mb-8">Rotina de Estudos</Text>
        <View className="gap-1 px-3">
          {ITENS.map(({ rota, label, Icon }) => {
            const ativo = pathname.startsWith(rota);
            return (
              <Pressable
                key={rota}
                onPress={() => router.push(rota)}
                className={`flex-row items-center gap-3 h-11 px-3 rounded-sm ${ativo ? 'bg-primary/20' : ''}`}
              >
                <Icon size={18} color={ativo ? '#D42027' : '#8A8A8A'} />
                <Text className={`text-sm font-semibold ${ativo ? 'text-primary' : 'text-[#B8B8B8]'}`}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="px-3 gap-1">
        <Pressable
          onPress={() => router.push('/config')}
          className={`flex-row items-center gap-3 h-11 px-3 rounded-sm ${pathname.startsWith('/config') ? 'bg-primary/20' : ''}`}
        >
          <Settings size={18} color={pathname.startsWith('/config') ? '#D42027' : '#8A8A8A'} />
          <Text className={`text-sm font-semibold ${pathname.startsWith('/config') ? 'text-primary' : 'text-[#B8B8B8]'}`}>
            Config
          </Text>
        </Pressable>
        {usuario && (
          <View className="flex-row items-center gap-2.5 px-3 pt-3 mt-2 border-t border-[#2A2A2A]">
            {usuario.photoURL && (
              <Image source={{ uri: usuario.photoURL }} className="w-7 h-7 rounded-full" />
            )}
            <Text className="text-xs text-[#8A8A8A] flex-1" numberOfLines={1}>
              {usuario.displayName ?? usuario.email}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
