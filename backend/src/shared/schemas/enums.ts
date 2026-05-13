import { z } from 'zod/v4'

export const perfilEnumSchema = z.enum(['colaborador', 'gestor', 'rh'])

export const turnoEnumSchema = z.enum([
  "manha",
  "tarde",
  "noite",
  "administrativo",
]);

export const tipoBatidaEnumSchema = z.enum([
  "entrada",
  "saida_intervalo",
  "retorno_intervalo",
  "saida",
]);

export const origemBatidaEnumSchema = z.enum(['sistema', 'ajuste'])

export const statusDiaEnumSchema = z.enum([
  'completo',
  'incompleto',
  'falta',
  'afastamento',
])
