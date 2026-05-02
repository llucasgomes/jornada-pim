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

export interface LoginPayload {
  cpf: string;
  senha: string;
}

export interface JwtPayload {
  userId: string;
  usuarioEmpresaId: string;
  empresaId: string;
  perfil: string;
  nome: string;
  imageUrl?: string | null;
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

export interface UsuarioEmpresa {
  id: string;
  usuarioId: string;
  empresaId: string;
  matricula: string;
  cargo: string | null;
  setor: string | null;
  perfil: 'colaborador' | 'gestor' | 'rh' | 'administrador';
  turno: '1 turno' | '2 turno' | '3 turno' | 'Comercial' | 'Especial' | null;
  cargaHorariaDia: number | null;
  horarioEntrada: string | null;
  horarioSaida: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateUser {
  nome: string;
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
  totalHorasExtras: string;
  totalAtrasos: string;
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

  topExtras: {
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

  historicoMeses: {
    mes: string;
    extras: number;
    atrasos: number;
    faltas: number;
  }[];
}

