CREATE TYPE "public"."origem_batida" AS ENUM('sistema', 'ajuste');--> statement-breakpoint
CREATE TYPE "public"."perfil" AS ENUM('colaborador', 'gestor', 'rh', 'administrador');--> statement-breakpoint
CREATE TYPE "public"."status_ajuste" AS ENUM('pendente', 'aprovado', 'rejeitado');--> statement-breakpoint
CREATE TYPE "public"."status_dia" AS ENUM('completo', 'incompleto', 'falta', 'afastamento');--> statement-breakpoint
CREATE TYPE "public"."tipo_batida" AS ENUM('entrada', 'saida_almoco', 'retorno_almoco', 'saida');--> statement-breakpoint
CREATE TYPE "public"."turno" AS ENUM('manha', 'tarde', 'noite', 'administrativo');--> statement-breakpoint
CREATE TABLE "ajuste_ponto" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_empresa_id" uuid NOT NULL,
	"data" date NOT NULL,
	"motivo" text NOT NULL,
	"aprovado_por" uuid,
	"status" "status_ajuste" DEFAULT 'pendente' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "empresa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"cnpj" text NOT NULL,
	"logo" text,
	"razao_social" text,
	"email" text,
	"telefone" text,
	"sequencial_matricula" integer DEFAULT 0,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "empresa_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
CREATE TABLE "registro_ponto" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_empresa_id" uuid NOT NULL,
	"tipo" "tipo_batida" NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"origem" "origem_batida" DEFAULT 'sistema' NOT NULL,
	"justificativa" text,
	"registrado_por" uuid,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "resumo_diario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_empresa_id" uuid NOT NULL,
	"data" date NOT NULL,
	"horas_trabalhadas" real DEFAULT 0 NOT NULL,
	"horas_esperadas" real NOT NULL,
	"horas_extras" real DEFAULT 0 NOT NULL,
	"atraso_minutos" integer DEFAULT 0 NOT NULL,
	"status" "status_dia" DEFAULT 'incompleto' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "setor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"cpf" text NOT NULL,
	"senha" text NOT NULL,
	"image" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuario_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "usuario_empresa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"empresa_id" uuid NOT NULL,
	"matricula" text NOT NULL,
	"cargo" text,
	"setor" text,
	"perfil" "perfil" DEFAULT 'colaborador' NOT NULL,
	"turno" "turno",
	"carga_horaria_dia" real NOT NULL,
	"horario_entrada" time NOT NULL,
	"horario_saida" time NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "ajuste_ponto" ADD CONSTRAINT "ajuste_ponto_usuario_empresa_id_usuario_empresa_id_fk" FOREIGN KEY ("usuario_empresa_id") REFERENCES "public"."usuario_empresa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajuste_ponto" ADD CONSTRAINT "ajuste_ponto_aprovado_por_usuario_id_fk" FOREIGN KEY ("aprovado_por") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registro_ponto" ADD CONSTRAINT "registro_ponto_usuario_empresa_id_usuario_empresa_id_fk" FOREIGN KEY ("usuario_empresa_id") REFERENCES "public"."usuario_empresa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registro_ponto" ADD CONSTRAINT "registro_ponto_registrado_por_usuario_id_fk" FOREIGN KEY ("registrado_por") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resumo_diario" ADD CONSTRAINT "resumo_diario_usuario_empresa_id_usuario_empresa_id_fk" FOREIGN KEY ("usuario_empresa_id") REFERENCES "public"."usuario_empresa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setor" ADD CONSTRAINT "setor_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuario_empresa" ADD CONSTRAINT "usuario_empresa_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuario_empresa" ADD CONSTRAINT "usuario_empresa_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_setor_nome_empresa" ON "setor" USING btree ("nome","empresa_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_matricula_empresa" ON "usuario_empresa" USING btree ("empresa_id","matricula");