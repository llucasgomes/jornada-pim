import { sql } from 'drizzle-orm'
import {
  boolean,
  date,
  integer,
  real,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

export const perfilEnum = pgEnum('perfil', [
  'colaborador',
  'gestor',
  'rh',
  'administrador',
])
export type Perfil = 'colaborador' | 'gestor' | 'rh' | 'administrador'

export const turnoEnum = pgEnum('turno', [
  'manha',
  'tarde',
  'noite',
  'administrativo',
])
export type Turno = 'manha' | 'tarde' | 'noite' | 'administrativo'

export const tipoEnum = pgEnum('tipo_batida', [
  'entrada',
  'saida_almoco',
  'retorno_almoco',
  'saida',
])
export type TipoBatida = 'entrada' | 'saida_almoco' | 'retorno_almoco' | 'saida'

export const origemEnum = pgEnum('origem_batida', ['sistema', 'ajuste'])
export type OrigemBatida = 'sistema' | 'ajuste'

export const statusEnum = pgEnum('status_dia', [
  'completo',
  'incompleto',
  'falta',
  'afastamento',
])
export type StatusDia = 'completo' | 'incompleto' | 'falta' | 'afastamento'

export const usuario = pgTable('usuario', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  cpf: text('cpf').notNull().unique(),
  senha: text('senha').notNull(),
  imageUrl: text('image'),
  ativo: boolean('ativo').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const empresa = pgTable('empresa', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  cnpj: text('cnpj').notNull().unique(),
  logo: text('logo'),
  razaoSocial: text('razao_social'),
  email: text('email'),
  telefone: text('telefone'),
  sequencialMatricula: integer('sequencial_matricula').default(0),
  ativo: boolean('ativo').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const usuarioEmpresa = pgTable(
  'usuario_empresa',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    usuarioId: uuid('usuario_id')
      .notNull()
      .references(() => usuario.id),
    empresaId: uuid('empresa_id')
      .notNull()
      .references(() => empresa.id),
    matricula: text('matricula').notNull(),
    cargo: text('cargo'),
    setor: text('setor'),
    perfil: perfilEnum('perfil').notNull().default('colaborador'),
    turno: turnoEnum('turno'),
    cargaHorariaDia: real('carga_horaria_dia').notNull(),
    horarioEntrada: time('horario_entrada').notNull(),
    horarioSaida: time('horario_saida').notNull(),
    ativo: boolean('ativo').notNull().default(true),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true }),
  },
  (table) => [
    uniqueIndex('uq_matricula_empresa').on(table.empresaId, table.matricula),
  ]
)

export const registroPonto = pgTable('registro_ponto', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioEmpresaId: uuid('usuario_empresa_id')
    .notNull()
    .references(() => usuarioEmpresa.id),
  tipo: tipoEnum('tipo').notNull(),
  timestamp: timestamp('timestamp', { mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow(),
  origem: origemEnum('origem').notNull().default('sistema'),
  justificativa: text('justificativa'),
  registradoPor: uuid('registrado_por').references(() => usuario.id),
  deletedAt: timestamp('deleted_at', { mode: 'string', withTimezone: true }),
})

export const resumoDiario = pgTable('resumo_diario', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioEmpresaId: uuid('usuario_empresa_id')
    .notNull()
    .references(() => usuarioEmpresa.id),
  data: date('data').notNull(),
  horasTrabalhadas: real('horas_trabalhadas').notNull().default(0),
  horasEsperadas: real('horas_esperadas').notNull(),
  horasExtras: real('horas_extras').notNull().default(0),
  atrasoMinutos: integer('atraso_minutos').notNull().default(0),
  status: statusEnum('status').notNull().default('incompleto'),
})

export const setor = pgTable(
  'setor',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    empresaId: uuid('empresa_id')
      .notNull()
      .references(() => empresa.id),
    nome: text('nome').notNull(),
    descricao: text('descricao'),
    ativo: boolean('ativo').notNull().default(true),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('uq_setor_nome_empresa').on(table.nome, table.empresaId),
  ]
)

export const statusAjusteEnum = pgEnum('status_ajuste', [
  'pendente',
  'aprovado',
  'rejeitado',
])

export const ajustePonto = pgTable('ajuste_ponto', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioEmpresaId: uuid('usuario_empresa_id')
    .notNull()
    .references(() => usuarioEmpresa.id),
  data: date('data').notNull(),
  motivo: text('motivo').notNull(),
  aprovadoPor: uuid('aprovado_por').references(() => usuario.id),
  status: statusAjusteEnum('status').notNull().default('pendente'),
  createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow(),
})
