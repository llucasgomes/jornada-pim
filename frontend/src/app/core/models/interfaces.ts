export type Perfil = 'colaborador' | 'gestor' | 'rh';
export type Turno = 'manha' | 'tarde' | 'noite' | 'administrativo';
export type TipoBatida = 'entrada' | 'saida_almoco' | 'retorno_almoco' | 'saida';
export type OrigemBatida = 'sistema' | 'ajuste';
export type StatusDia = 'completo' | 'incompleto' | 'falta' | 'afastamento';

export interface LoginRequest {
  matricula: string;
  senha: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

export interface JwtPayload {
  id: string;
  perfil: string;
  nome: string;
  matricula: string;
  iat: number;
  exp: number;
}

export interface User {
  id: string;
  nome: string;
  matricula: string;
  perfil: Perfil;
  cargo?: string | null;
  setor?: string | null;
  turno?: Turno | null;
  carga_horaria_dia?: number | null;
  horario_entrada?: string | null;
  horario_saida?: string | null;
  ativo: boolean;
  imageUrl?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUser {
  nome: string;
  // matricula: string;
  senha: string;
  perfil?: Perfil;
  cargo?: string;
  setor?: string;
  turno?: Turno;
  carga_horaria_dia?: number;
  horario_entrada?: string;
  horario_saida?: string;
  ativo?: boolean;
  imageUrl?: string;
  imageFile?: File;
}

export interface RegistroPonto {
  id: string;
  usuario_id: string;
  tipo: TipoBatida;
  timestamp: string;
  origem: string;
  justificativa?: string | null;
  registrado_por?: string | null;
}

export interface ResumoDiario {
  id: string;
  usuario_id: string;
  data: string;
  horas_trabalhadas: string;
  horas_esperadas: string;
  horas_extras: string;
  atraso_minutos: number;
  status: StatusDia;
}

export interface PontoHoje {
  batidas: RegistroPonto[];
  resumo: ResumoDiario | null;
  proxima_batida: TipoBatida | null;
}

export interface DashboardStats {
  totalHorasExtras: number;
  totalAtrasos: number;
  totalFaltas: number;
  totalColaboradores: number;
  totalDiasProcessados: number;
  presencaHoje: number;
  mediaExtras: number;

  topAtrasos: {
    id: string;
    nome: string;
    total: number;
    imageUrl?: string | null;
    cargo?: string;
    setor?: string;
  }[];

  topFaltosos: {
    id: string;
    nome: string;
    total: number;
    imageUrl?: string | null;
    cargo?: string;
    setor?: string;
  }[];
  graficoExtras: {
    data: string;
    total: number;
  }[];
}
