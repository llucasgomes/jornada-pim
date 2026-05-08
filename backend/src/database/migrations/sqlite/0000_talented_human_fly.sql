CREATE TABLE `empresa` (
	`id` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`cnpj` text NOT NULL,
	`logo` text,
	`razao_social` text,
	`email` text,
	`telefone` text,
	`sequencial_matricula` integer DEFAULT 0,
	`ativo` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `empresa_cnpj_unique` ON `empresa` (`cnpj`);--> statement-breakpoint
CREATE TABLE `registro_ponto` (
	`id` text PRIMARY KEY NOT NULL,
	`usuario_empresa_id` text NOT NULL,
	`tipo` text NOT NULL,
	`timestamp` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`origem` text DEFAULT 'sistema' NOT NULL,
	`justificativa` text,
	`registrado_por` text,
	FOREIGN KEY (`usuario_empresa_id`) REFERENCES `usuario_empresa`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`registrado_por`) REFERENCES `usuario`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `resumo_diario` (
	`id` text PRIMARY KEY NOT NULL,
	`usuario_empresa_id` text NOT NULL,
	`data` text NOT NULL,
	`horas_trabalhadas` real DEFAULT 0 NOT NULL,
	`horas_esperadas` real NOT NULL,
	`horas_extras` real DEFAULT 0 NOT NULL,
	`atraso_minutos` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'incompleto' NOT NULL,
	FOREIGN KEY (`usuario_empresa_id`) REFERENCES `usuario_empresa`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `setor` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`nome` text NOT NULL,
	`descricao` text,
	`ativo` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresa`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_setor_nome_empresa` ON `setor` (`nome`,`empresa_id`);--> statement-breakpoint
CREATE TABLE `usuario` (
	`id` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`cpf` text NOT NULL,
	`senha` text NOT NULL,
	`image` text,
	`ativo` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuario_cpf_unique` ON `usuario` (`cpf`);--> statement-breakpoint
CREATE TABLE `usuario_empresa` (
	`id` text PRIMARY KEY NOT NULL,
	`usuario_id` text NOT NULL,
	`empresa_id` text NOT NULL,
	`matricula` text NOT NULL,
	`cargo` text,
	`setor` text,
	`perfil` text DEFAULT 'colaborador' NOT NULL,
	`turno` text,
	`carga_horaria_dia` integer,
	`horario_entrada` text,
	`horario_saida` text,
	`ativo` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresa`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_matricula_empresa` ON `usuario_empresa` (`empresa_id`,`matricula`);