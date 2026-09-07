import { Text, View } from 'react-native';
import { PALETA_MATERIAS } from '../../constants/paletaMaterias';

// Reaproveita a paleta de matérias pro fundo do avatar (substitui o oklch()
// do handoff — RN não suporta oklch em style); cor determinística por nome.
function corPara(nome: string) {
  const codigo = nome.charCodeAt(0) || 0;
  return PALETA_MATERIAS[codigo % PALETA_MATERIAS.length];
}

export function AvatarIniciais({ nome, tamanho = 40 }: { nome: string; tamanho?: number }) {
  return (
    <View
      style={{ width: tamanho, height: tamanho, borderRadius: tamanho / 2, backgroundColor: corPara(nome) }}
      className="items-center justify-center"
    >
      <Text className="font-display font-bold text-white" style={{ fontSize: tamanho * 0.4 }}>
        {nome.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}
