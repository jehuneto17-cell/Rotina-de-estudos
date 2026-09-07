// Feriados nacionais fixos do Brasil (data civil, sem dependência de API externa).
// ponytail: feriados móveis (Carnaval, Sexta-Feira Santa, Corpus Christi) ficam
// de fora — exigiriam cálculo de Páscoa. Adicionar se o streak sentir falta deles.
const FERIADOS_FIXOS_MM_DD = [
  '01-01', // Confraternização Universal
  '04-21', // Tiradentes
  '05-01', // Dia do Trabalho
  '09-07', // Independência
  '10-12', // Nossa Senhora Aparecida
  '11-02', // Finados
  '11-15', // Proclamação da República
  '11-20', // Consciência Negra
  '12-25', // Natal
];

export function ehFeriado(dataCivil: string): boolean {
  const mmdd = dataCivil.slice(5); // 'YYYY-MM-DD' -> 'MM-DD'
  return FERIADOS_FIXOS_MM_DD.includes(mmdd);
}
