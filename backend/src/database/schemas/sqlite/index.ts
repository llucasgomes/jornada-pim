import { sql } from "drizzle-orm";
import { uniqueIndex } from "drizzle-orm/sqlite-core";

import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// "Enums" como tipos TS
export const perfilEnum = [
  "colaborador",
  "gestor",
  "rh",
  "administrador",
] as const;
export type Perfil = (typeof perfilEnum)[number];

export const turnoEnum = [
  "1 turno",
  "2 turno",
  "3 turno",
  "Comercial",
  "Especial",
] as const;
export type Turno = (typeof turnoEnum)[number];

export const tipoEnum = [
  "entrada",
  "saida_intervalo",
  "retorno_intervalo",
  "saida",
] as const;
export type TipoBatida = (typeof tipoEnum)[number];

export const origemEnum = ["sistema", "ajuste"] as const;
export type OrigemBatida = (typeof origemEnum)[number];

export const statusEnum = [
  "completo",
  "incompleto",
  "falta",
  "afastamento",
] as const;
export type StatusDia = (typeof statusEnum)[number];

// helper simples pra UUID (string)
const uuid = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

export const usuario = sqliteTable("usuario", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  nome: text("nome").notNull(),
  cpf: text("cpf").notNull().unique(),
  senha: text("senha").notNull(),
  imageUrl: text("image"),


  ativo: integer("ativo", { mode: "boolean" }).notNull().default(true),

  createdAt: text("created_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`), // ISO 8601 UTC

  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`), // ISO 8601 UTC
});

export const registroPonto = sqliteTable("registro_ponto", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // 🔥 CORREÇÃO PRINCIPAL
  usuarioEmpresaId: text("usuario_empresa_id")
    .notNull()
    .references(() => usuarioEmpresa.id),

  tipo: text("tipo").$type<TipoBatida>().notNull(),

  timestamp: text("timestamp")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`), // ISO 8601 UTC

  origem: text("origem").$type<OrigemBatida>().notNull().default("sistema"),

  justificativa: text("justificativa"),

  registradoPor: text("registrado_por").references(() => usuario.id),
});

export const resumoDiario = sqliteTable("resumo_diario", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  usuarioEmpresaId: text("usuario_empresa_id") // nome correto também
    .notNull()
    .references(() => usuarioEmpresa.id),

  data: text("data").notNull(),

  horasTrabalhadas: real("horas_trabalhadas").notNull().default(0),
  horasEsperadas: real("horas_esperadas").notNull(),
  horasExtras: real("horas_extras").notNull().default(0),
  atrasoMinutos: integer("atraso_minutos").notNull().default(0),

  status: text("status").$type<StatusDia>().notNull().default("incompleto"),
});

export const setor = sqliteTable(
  "setor",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    empresaId: text("empresa_id")
      .notNull()
      .references(() => empresa.id),

    nome: text("nome").notNull(),

    descricao: text("descricao"),
    ativo: integer("ativo", { mode: "boolean" }).notNull().default(true),

    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  },
  (table) => [
    // 🔥 Isso garante que a Empresa A não tenha dois setores "TI",
    // mas permite que a Empresa A e a Empresa B tenham, cada uma, um setor "TI".
    uniqueIndex("uq_setor_nome_empresa").on(table.nome, table.empresaId),
  ],
);

export const empresa = sqliteTable("empresa", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  nome: text("nome").notNull(),
  cnpj: text("cnpj").notNull().unique(),
  logo: text("logo"),
  razaoSocial: text("razao_social"),
  email: text("email"),
  telefone: text("telefone"),
  sequencialMatricula: integer("sequencial_matricula").default(0),

  ativo: integer("ativo", { mode: "boolean" }).notNull().default(true),

  createdAt: text("created_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),

  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
});

export const usuarioEmpresa = sqliteTable(
  "usuario_empresa",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    usuarioId: text("usuario_id")
      .notNull()
      .references(() => usuario.id),

    empresaId: text("empresa_id")
      .notNull()
      .references(() => empresa.id),
    matricula: text("matricula").notNull(),

    cargo: text("cargo"),
    setor: text("setor"),
    perfil: text("perfil").$type<Perfil>().notNull().default("colaborador"),
    turno: text("turno").$type<Turno>(),

    cargaHorariaDia: integer("carga_horaria_dia"),
    horarioEntrada: text("horario_entrada"),
    horarioSaida: text("horario_saida"),

    ativo: integer("ativo", { mode: "boolean" }).notNull().default(true),

    createdAt: text("created_at") // entrada
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),

    updatedAt: text("updated_at"), // saída
  },
  (table) => [
    uniqueIndex("uq_matricula_empresa").on(table.empresaId, table.matricula),
  ],
);
