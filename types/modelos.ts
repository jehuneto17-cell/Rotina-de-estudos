// Tipos espelhando DATABASE.md — nenhum campo aqui é especulativo,
// cada um está citado em uma coleção do documento.

export type DataCivil = string; // 'YYYY-MM-DD', fuso America/Sao_Paulo

export interface Usuario {
  nome: string;
  email: string;
  fotoUrl: string | null;
  exame: string | null;
  banca: string | null;
  onboardingConcluido: boolean;
  criadoEm: number;
  atualizadoEm: number;
}

export interface Materia {
  id: string;
  nome: string;
  emoji: string;
  cor: string;
  ordem: number;
  criadoEm: number;
}

export interface Bloco {
  id: string;
  titulo: string;
  materiaId: string | null;
  diaSemana: number; // 0=dom ... 6=sáb
  horaInicio: string; // 'HH:mm'
  horaFim: string;
  rotinaId: string | null;
  concluidoEm: Record<DataCivil, boolean>;
  criadoEm: number;
}

export interface Rotina {
  id: string;
  titulo: string;
  materiaId: string | null;
  diasSemana: number[];
  horaInicio: string;
  horaFim: string;
  ativa: boolean;
  checks: Record<DataCivil, boolean>;
  criadoEm: number;
}

export interface Tarefa {
  id: string;
  titulo: string;
  materiaId: string | null;
  concluida: boolean;
  criadoEm: number;
}

export interface Anexo {
  path: string;
  tipo: string;
  tamanhoBytes: number;
  nome: string;
}

export interface RegistroDiario {
  id: string;
  materiaId: string | null;
  conteudo: string;
  duracaoMin: number;
  notas?: string;
  data: DataCivil;
  tags: string[];
  anexo: Anexo | null;
  origem: 'manual' | 'pomodoro';
  criadoEm: number;
}

export type IntervaloRevisao = 1 | 3 | 7 | 15;
export type StatusRevisao = 'pendente' | 'feita';

export interface Revisao {
  id: string;
  registroId: string;
  materiaId: string | null;
  resumo: string;
  intervalo: IntervaloRevisao;
  dataPrevista: DataCivil;
  status: StatusRevisao;
  feitaEm: DataCivil | null;
  criadoEm: number;
}

export interface Meta {
  id: string; // = materiaId
  materiaId: string;
  minutosAlvo: number;
  criadoEm: number;
}

export interface ProgressoPublico {
  nome: string;
  fotoUrl: string | null;
  streak: number;
  ultimoDiaEstudado: DataCivil | null;
  diasEstudadosMes: number;
  minutosMes: number;
  revisoesAtrasadas: number;
  materias: Record<string, { nome: string; emoji: string; cor: string }>;
  minutosPorMateriaMes: Record<string, number>;
  evolucaoSemanal: Record<string, Record<string, number>>; // 'YYYY-Www' -> materiaId -> minutos
  atualizadoEm: number;
}

export interface Vinculo {
  nomeVisualizador: string;
  criadoEm: number;
}

export type StatusConvite = 'pendente' | 'aceito' | 'recusado';

export interface Convite {
  id: string;
  deUid: string;
  deNome: string;
  paraEmail: string;
  status: StatusConvite;
  criadoEm: number;
}
