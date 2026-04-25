CREATE TABLE `registro_ponto` (
	`id` text PRIMARY KEY NOT NULL,
	`usuario_id` text NOT NULL,
	`tipo` text NOT NULL,
	`timestamp` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`origem` text DEFAULT 'sistema' NOT NULL,
	`justificativa` text,
	`registrado_por` text,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`registrado_por`) REFERENCES `usuario`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `resumo_diario` (
	`id` text PRIMARY KEY NOT NULL,
	`usuario_id` text NOT NULL,
	`data` text NOT NULL,
	`horas_trabalhadas` real DEFAULT 0 NOT NULL,
	`horas_esperadas` real NOT NULL,
	`horas_extras` real DEFAULT 0 NOT NULL,
	`atraso_minutos` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'incompleto' NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `usuario` (
	`id` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`matricula` text NOT NULL,
	`senha` text NOT NULL,
	`perfil` text DEFAULT 'colaborador' NOT NULL,
	`cargo` text,
	`setor` text,
	`turno` text,
	`carga_horaria_dia` integer,
	`horario_entrada` text,
	`horario_saida` text,
	`ativo` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuario_matricula_unique` ON `usuario` (`matricula`);