import { useLocalSearchParams } from 'expo-router';
import { FormBloco } from '../../../../components/grade/FormBloco';
import { diaSemanaDe, hojeCivil } from '../../../../lib/datas';

// Tela 4 (modo novo) — dia vem da grade que abriu este modal (?dia=YYYY-MM-DD);
// sem parâmetro, assume hoje.
export default function NovoBloco() {
  const { dia } = useLocalSearchParams<{ dia?: string }>();
  const diaSemanaPadrao = diaSemanaDe(dia || hojeCivil());

  return <FormBloco modo="novo" diaSemanaPadrao={diaSemanaPadrao} />;
}
