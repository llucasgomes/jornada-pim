CREATE TYPE "public"."origem_batida" AS ENUM('sistema', 'ajuste');--> statement-breakpoint
CREATE TYPE "public"."perfil" AS ENUM('colaborador', 'gestor', 'rh');--> statement-breakpoint
CREATE TYPE "public"."status_dia" AS ENUM('completo', 'incompleto', 'falta', 'afastamento');--> statement-breakpoint
CREATE TYPE "public"."tipo_batida" AS ENUM('entrada', 'saida_almoco', 'retorno_almoco', 'saida');--> statement-breakpoint
CREATE TYPE "public"."turno" AS ENUM('manha', 'tarde', 'noite', 'administrativo');--> statement-breakpoint
CREATE TABLE "colaborador" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"matricula" text NOT NULL,
	"cargo" text NOT NULL,
	"setor" text NOT NULL,
	"turno" "turno" NOT NULL,
	"carga_horaria_dia" numeric NOT NULL,
	"horario_entrada" time NOT NULL,
	"horario_saida" time NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "colaborador_matricula_unique" UNIQUE("matricula")
);
--> statement-breakpoint
CREATE TABLE "registro_ponto" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"colaborador_id" uuid NOT NULL,
	"tipo" "tipo_batida" NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"origem" "origem_batida" DEFAULT 'sistema' NOT NULL,
	"justificativa" text,
	"registrado_por" uuid
);
--> statement-breakpoint
CREATE TABLE "resumo_diario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"colaborador_id" uuid NOT NULL,
	"data" date NOT NULL,
	"horas_trabalhadas" numeric DEFAULT '0' NOT NULL,
	"horas_esperadas" numeric NOT NULL,
	"horas_extras" numeric DEFAULT '0' NOT NULL,
	"atraso_minutos" integer DEFAULT 0 NOT NULL,
	"status" "status_dia" DEFAULT 'incompleto' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"matricula" text NOT NULL,
	"senha" text NOT NULL,
	"perfil" "perfil" DEFAULT 'colaborador' NOT NULL,
	"setor" text NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuario_matricula_unique" UNIQUE("matricula")
);
--> statement-breakpoint
ALTER TABLE "registro_ponto" ADD CONSTRAINT "registro_ponto_colaborador_id_colaborador_id_fk" FOREIGN KEY ("colaborador_id") REFERENCES "public"."colaborador"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registro_ponto" ADD CONSTRAINT "registro_ponto_registrado_por_usuario_id_fk" FOREIGN KEY ("registrado_por") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resumo_diario" ADD CONSTRAINT "resumo_diario_colaborador_id_colaborador_id_fk" FOREIGN KEY ("colaborador_id") REFERENCES "public"."colaborador"("id") ON DELETE no action ON UPDATE no action;