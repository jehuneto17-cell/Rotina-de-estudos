import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

/** Campo de texto com sugestões de valores já digitados antes — usado no "conteúdo estudado" do diário. */
export function CampoAutocomplete({
  value,
  onChangeText,
  sugestoes,
  placeholder,
  className,
}: {
  value: string;
  onChangeText: (v: string) => void;
  sugestoes: string[];
  placeholder?: string;
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);

  const filtradas = value.trim()
    ? sugestoes.filter((s) => s.toLowerCase().includes(value.trim().toLowerCase()) && s.toLowerCase() !== value.trim().toLowerCase())
    : sugestoes;

  function escolher(s: string) {
    onChangeText(s);
    setAberto(false);
  }

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={(v) => { onChangeText(v); setAberto(true); }}
        onFocus={() => setAberto(true)}
        onBlur={() => setTimeout(() => setAberto(false), 150)}
        placeholder={placeholder}
        placeholderTextColor="#B0B0B0"
        className={className}
      />
      {aberto && filtradas.length > 0 && (
        <View className="border border-border rounded-sm bg-surface mt-1 max-h-[140px] overflow-hidden">
          {filtradas.slice(0, 6).map((s, i) => (
            <Pressable
              key={s + i}
              onPress={() => escolher(s)}
              className={`px-3 py-2.5 ${i > 0 ? 'border-t border-rowBorder' : ''}`}
            >
              <Text className="text-sm text-text" numberOfLines={1}>{s}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
