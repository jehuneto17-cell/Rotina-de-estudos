import { diferencaEmDias, somarDias } from './datas';
import type { IntervaloRevisao, Revisao } from '../types/modelos';

const INTERVALOS: IntervaloRevisao[] = [1, 3, 7, 15];

/** Gera as 4 revisões futuras de um registro, prontas para o writeBatch. */
export function gerarRevisoes(params: {
  registroId: string;
  materiaId: string | null;
  resumo: string;
  dataRegistro: string; // data civil do registro
}): Array<Omit<Revisao, 'id' | 'criadoEm'>> {
  return INTERVALOS.map((intervalo) => ({
    registroId: params.registroId,
    materiaId: params.materiaId,
    resumo: params.resumo,
    intervalo,
    dataPrevista: somarDias(params.dataRegistro, intervalo),
    status: 'pendente' as const,
    feitaEm: null,
  }));
}

/**
 * "Atrasada" nunca é gravada — é derivada, com 1 dia de tolerância
 * (PRODUCT-SPEC): só vence à meia-noite do dia SEGUINTE à data prevista.
 */
export function revisaoEstaAtrasada(revisao: Pick<Revisao, 'status' | 'dataPrevista'>, hoje: string): boolean {
  if (revisao.status !== 'pendente') return false;
  return diferencaEmDias(revisao.dataPrevista, hoje) > 1;
}

export function contarAtrasadas(revisoes: Array<Pick<Revisao, 'status' | 'dataPrevista'>>, hoje: string): number {
  return revisoes.filter((r) => revisaoEstaAtrasada(r, hoje)).length;
}
