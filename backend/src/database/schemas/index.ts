import {
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const perfilEnum = pgEnum('perfil', ['colaborador', 'gestor', 'rh'])
export const turnoEnum = pgEnum('turno', [
  'manha',
  'tarde',
  'noite',
  'administrativo',
])
export const tipoEnum = pgEnum('tipo_batida', [
  'entrada',
  'saida_almoco',
  'retorno_almoco',
  'saida',
])
export const origemEnum = pgEnum('origem_batida', ['sistema', 'ajuste'])
export const statusEnum = pgEnum('status_dia', [
  'completo',
  'incompleto',
  'falta',
  'afastamento',
])

export const usuario = pgTable('usuario', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  matricula: text('matricula').notNull().unique(),
  senha: text('senha').notNull(),
  perfil: perfilEnum('perfil').notNull().default('colaborador'),
  cargo: text('cargo'),
  setor: text('setor'),
  turno: turnoEnum('turno'),
  carga_horaria_dia: integer('carga_horaria_dia'),
  horario_entrada: time('horario_entrada'),
  horario_saida: time('horario_saida'),
  ativo: boolean('ativo').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const registro_ponto = pgTable('registro_ponto', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuario_id: uuid('usuario_id')
    .notNull()
    .references(() => usuario.id),
  tipo: tipoEnum('tipo').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true })
    .notNull()
    .defaultNow(),
  origem: origemEnum('origem').notNull().default('sistema'),
  justificativa: text('justificativa'),
  registrado_por: uuid('registrado_por').references(() => usuario.id),
})

export const resumo_diario = pgTable('resumo_diario', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuario_id: uuid('usuario_id')
    .notNull()
    .references(() => usuario.id),
  data: date('data').notNull(),
  horas_trabalhadas: numeric('horas_trabalhadas').notNull().default('0'),
  horas_esperadas: numeric('horas_esperadas').notNull(),
  horas_extras: numeric('horas_extras').notNull().default('0'),
  atraso_minutos: integer('atraso_minutos').notNull().default(0),
  status: statusEnum('status').notNull().default('incompleto'),
})
