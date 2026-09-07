import { View, type ViewProps } from 'react-native';

/** Card branco padrão do design system — fundo/borda/radius/padding do DESIGN-SYSTEM.md §Componentes. */
export function Card({ className = '', ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={`bg-surface border border-border rounded-card p-4 ${className}`}
      {...props}
    />
  );
}
