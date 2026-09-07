// Paleta fixa pra matérias (Onboarding, chips de bloco, badges). Hex — React
// Native não suporta oklch()/hsl() de forma confiável em toda superfície de
// estilo, hex é o único formato garantido em todo lugar (inclusive com sufixo
// alpha de 2 dígitos pra fundo "faint": `${cor}1A`).
export const PALETA_MATERIAS = [
  '#D42027', // vermelho (mesmo tom do primary)
  '#D9622B', // laranja
  '#C79A1E', // âmbar
  '#8A9A2E', // oliva
  '#4C9A4C', // verde
  '#2E9A7A', // verde-azulado
  '#2E9AA0', // teal
  '#2E7FA0', // azul-claro
  '#3D5FBF', // azul
  '#5A4CBF', // índigo
  '#7A4CBF', // violeta
  '#A34CBF', // roxo
  '#BF4C8F', // magenta
  '#BF4C5A', // rosa
  '#6B6B6B', // neutro
] as const;
