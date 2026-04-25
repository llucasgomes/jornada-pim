import {
    sqliteTable,
    text,
    integer,
    real,
} from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// "Enums" como tipos TS
export const perfilEnum = ['colaborador', 'gestor', 'rh'] as const
export type Perfil = (typeof perfilEnum)[number]

export const turnoEnum = [
    'manha',
    'tarde',
    'noite',
    'administrativo',
] as const
export type Turno = (typeof turnoEnum)[number]

export const tipoEnum = [
    'entrada',
    'saida_almoco',
    'retorno_almoco',
    'saida',
] as const
export type TipoBatida = (typeof tipoEnum)[number]

export const origemEnum = ['sistema', 'ajuste'] as const
export type OrigemBatida = (typeof origemEnum)[number]

export const statusEnum = [
    'completo',
    'incompleto',
    'falta',
    'afastamento',
] as const
export type StatusDia = (typeof statusEnum)[number]

// helper simples pra UUID (string)
const uuid = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID())

export const usuario = sqliteTable('usuario', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),

    nome: text('nome').notNull(),
    matricula: text('matricula').notNull().unique(),
    senha: text('senha').notNull(),

    perfil: text('perfil')
        .$type<Perfil>()
        .notNull()
        .default('colaborador'),

    cargo: text('cargo'),
    setor: text('setor'),

    turno: text('turno').$type<Turno>(),

    cargaHorariaDia: integer('carga_horaria_dia'),

    horarioEntrada: text('horario_entrada'),
    horarioSaida: text('horario_saida'),

    ativo: integer('ativo', { mode: 'boolean' })
        .notNull()
        .default(true),

    createdAt: text('created_at')
        .notNull()
        .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`), // ISO 8601 UTC

    updatedAt: text('updated_at')
        .notNull()
        .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`), // ISO 8601 UTC
})

export const registroPonto = sqliteTable('registro_ponto', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),

    usuarioId: text('usuario_id')
        .notNull()
        .references(() => usuario.id),

    tipo: text('tipo')
        .$type<TipoBatida>()
        .notNull(),

    timestamp: text('timestamp')
        .notNull()
        .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`), // ISO 8601 UTC

    origem: text('origem')
        .$type<OrigemBatida>()
        .notNull()
        .default('sistema'),

    justificativa: text('justificativa'),

    registradoPor: text('registrado_por')
        .references(() => usuario.id),
})

export const resumoDiario = sqliteTable('resumo_diario', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),

    usuarioId: text('usuario_id')
        .notNull()
        .references(() => usuario.id),

    data: text('data').notNull(), // YYYY-MM-DD

    horasTrabalhadas: real('horas_trabalhadas')
        .notNull()
        .default(0),

    horasEsperadas: real('horas_esperadas')
        .notNull(),

    horasExtras: real('horas_extras')
        .notNull()
        .default(0),

    atrasoMinutos: integer('atraso_minutos')
        .notNull()
        .default(0),

    status: text('status')
        .$type<StatusDia>()
        .notNull()
        .default('incompleto'),
})