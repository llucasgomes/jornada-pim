import { faker } from "@faker-js/faker/locale/pt_BR";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { db } from "../../config/database";
import type {
  Perfil,
  TipoBatida,
} from "../../database/schemas/sqlite";
import {
  empresa,
  registroPonto,
  resumoDiario,
  setor,
  usuario,
  usuarioEmpresa,
} from "../../database/schemas/sqlite";

faker.seed(42);

const SETORES = [
  "Produção",
  "Montagem",
  "Logística",
  "Qualidade",
  "Manutenção",
  "Administração",
  "RH",
  "TI",
  'DESENVOLVIMENTO'
];

const CARGOS = [
  "Operador de produção",
  "Auxiliar de montagem",
  "Técnico de manutenção",
  "Analista de qualidade",
  "Auxiliar de logística",
  "Supervisor de linha",
  "Inspetor de qualidade",
];

const TURNOS = [
  { turno: "1 turno", entrada: "07:00", saida: "16:00", carga: 480 },
  { turno: "2 turno", entrada: "16:00", saida: "23:00", carga: 480 },
  { turno: "3 turno", entrada: "23:00", saida: "07:00", carga: 480 },
  { turno: "Comercial", entrada: "08:00", saida: "17:00", carga: 480 },
] as const;

// ─── Usuários fixos para login/testes ─────────────────────────────────────────

const USUARIOS_FIXOS: {
  nome: string;
  cpf: string;
  senha: string;
  perfil: Perfil;
  setor: string;
  cargo: string;
  turnoConfig: (typeof TURNOS)[number];
}[] = [
  {
    nome: faker.person.fullName(),
    cpf: "123.456.789-01",
    senha: "123456789",
    perfil: "administrador",
    setor: "Desenvolvimento",
    cargo: "Administrador do sistema",
    turnoConfig: TURNOS[3], // Comercial
  },
  {
    nome: faker.person.fullName(),
    cpf: "123.456.789-02",
    senha: "123456789",
    perfil: "gestor",
    setor: "Produção",
    cargo: "Supervisor de linha",
    turnoConfig: TURNOS[3], // Comercial
  },
  {
    nome: faker.person.fullName(),
    cpf: "123.456.789-03",
    senha: "123456789",
    perfil: "rh",
    setor: "Departamento Pessoal",
    cargo: "Analista de Departamento Pessoal",
    turnoConfig: TURNOS[3], // Comercial
  },
  {
    nome: faker.person.fullName(),
    cpf: "123.456.789-04",
    senha: "123456789",
    perfil: "colaborador",
    setor: "Produção",
    cargo: "Operador de produção",
    turnoConfig: TURNOS[0], // 1 turno
  },
  {
    nome: faker.person.fullName(),
    cpf: "123.456.789-05",
    senha: "123456789",
    perfil: "rh",
    setor: "Departamento Pessoal",
    cargo: "Analista de RH",
    turnoConfig: TURNOS[0], // 1 turno
  },
  {
    nome: faker.person.fullName(),
    cpf: "123.456.789-06",
    senha: "123456789",
    perfil: "gestor",
    setor: "Produção",
    cargo: "Supervisor de linha",
    turnoConfig: TURNOS[3], // Comercial
  },
];

let MATRICULA_SEQ = 1;

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TurnoConfig = (typeof TURNOS)[number];

type DadosVinculo = {
  nome: string;
  cpf: string;
  senha: string;
  empresaId: string;
  siglaEmpresa: string;
  cargo: string;
  setor: string;
  turnoConfig: TurnoConfig;
  perfil?: Perfil;
};

type Batida = { tipo: TipoBatida; timestamp: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gerarSiglaEmpresa(nome: string) {
  return nome
    .split(" ")
    .filter((p) => p.length > 2)
    .map((p) => p[0].toUpperCase())
    .join("")
    .slice(0, 4);
}

function gerarMatricula(sigla: string) {
  return `${sigla}-${String(MATRICULA_SEQ++).padStart(4, "0")}`;
}

function addMinutes(base: Date, minutes: number) {
  return new Date(base.getTime() + minutes * 60000);
}

function setTime(base: Date, timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

function diasUteisDoMes(ano: number, mes: number): Date[] {
  const dias: Date[] = [];
  const total = new Date(ano, mes, 0).getDate();
  for (let d = 1; d <= total; d++) {
    const dia = new Date(ano, mes - 1, d);
    if (dia.getDay() !== 0 && dia.getDay() !== 6) dias.push(dia);
  }
  return dias;
}

function gerarCPF(): string {
  const numeros = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 9),
  );

  const calcularDigito = (base: number[]) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += base[i] * (base.length + 1 - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const digito1 = calcularDigito(numeros);
  const digito2 = calcularDigito([...numeros, digito1]);

  return [...numeros, digito1, digito2].join("");
}


// ─── Criação de usuário + vínculo ─────────────────────────────────────────────

// Recebe a senha em texto puro e faz o hash internamente
async function criarUsuarioComVinculo(data: DadosVinculo): Promise<string> {
  const userId = randomUUID();
  const vinculoId = randomUUID();

  const senhaHash = await bcrypt.hash(data.senha, 10);

  await db.insert(usuario).values({
    id: userId,
    nome: data.nome,
    cpf: data.cpf,
    senha: senhaHash,
    imageUrl: faker.image.avatar(),
  });

  await db.insert(usuarioEmpresa).values({
    id: vinculoId,
    usuarioId: userId,
    empresaId: data.empresaId,
    matricula: gerarMatricula(data.siglaEmpresa),
    perfil: data.perfil ?? "colaborador",
    cargo: data.cargo,
    setor: data.setor,
    turno: data.turnoConfig.turno,
    cargaHorariaDia: data.turnoConfig.carga,
    horarioEntrada: data.turnoConfig.entrada,
    horarioSaida: data.turnoConfig.saida,
  });

  return vinculoId;
}

// ─── Geração de histórico de ponto ────────────────────────────────────────────

async function gerarHistorico(
  usuarioEmpresaId: string,
  turnoConfig: TurnoConfig,
  hoje: Date,
  mesesAtras: number = 3, // ← gera os últimos 3 meses + mês atual
) {
  const todasBatidas: (typeof registroPonto.$inferInsert)[] = [];
  const todosResumos: (typeof resumoDiario.$inferInsert)[] = [];

  for (let m = mesesAtras; m >= 0; m--) {
    const refDate = new Date(hoje.getFullYear(), hoje.getMonth() - m, 1);
    const ano = refDate.getFullYear();
    const mes = refDate.getMonth() + 1;
    const dias = diasUteisDoMes(ano, mes);

    for (const dia of dias) {
      if (m === 0 && dia > hoje) continue; // mês atual: só até hoje

      const falta = Math.random() < 0.15;
      if (falta) {
        todosResumos.push({
          usuarioEmpresaId,
          data: dia.toISOString().split("T")[0],
          horasTrabalhadas: 0,
          horasEsperadas: turnoConfig.carga / 60,
          horasExtras: 0,
          atrasoMinutos: 0,
          status: "falta",
        });
        continue;
      }

      const atrasoMin = faker.number.int({ min: -5, max: 30 });
      const entrada = addMinutes(setTime(dia, turnoConfig.entrada), atrasoMin);
      const saidaAlmoco = addMinutes(entrada, 240);
      const retornoAlmoco = addMinutes(saidaAlmoco, 60);
      const extrasMin = faker.number.int({ min: 0, max: 60 });
      const saida = addMinutes(
        retornoAlmoco,
        turnoConfig.carga - 240 + extrasMin,
      );

      const batidas: Batida[] = [
        { tipo: "entrada", timestamp: entrada.toISOString() },
        { tipo: "saida_intervalo", timestamp: saidaAlmoco.toISOString() },
        { tipo: "retorno_intervalo", timestamp: retornoAlmoco.toISOString() },
        { tipo: "saida", timestamp: saida.toISOString() },
      ];

      for (const b of batidas) {
        todasBatidas.push({
          id: randomUUID(),
          usuarioEmpresaId,
          tipo: b.tipo,
          timestamp: b.timestamp,
          origem: "sistema",
        });
      }

      const trabalhadoMs =
        saida.getTime() -
        retornoAlmoco.getTime() +
        (saidaAlmoco.getTime() - entrada.getTime());
      const trabalhadoHoras = trabalhadoMs / (1000 * 60 * 60);
      const cargaHoras = turnoConfig.carga / 60;
      const esperado = setTime(dia, turnoConfig.entrada);
      const atraso = Math.max(
        0,
        Math.floor((entrada.getTime() - esperado.getTime()) / 60000),
      );

      todosResumos.push({
        usuarioEmpresaId,
        data: dia.toISOString().split("T")[0],
        horasTrabalhadas: Number(trabalhadoHoras.toFixed(2)),
        horasEsperadas: Number(cargaHoras.toFixed(2)),
        horasExtras: Number(
          Math.max(0, trabalhadoHoras - cargaHoras).toFixed(2),
        ),
        atrasoMinutos: atraso,
        status: "completo",
      });
    }
  }

  if (todasBatidas.length > 0)
    await db.insert(registroPonto).values(todasBatidas);
  if (todosResumos.length > 0)
    await db.insert(resumoDiario).values(todosResumos);
}

// ─── Seed principal ───────────────────────────────────────────────────────────

async function seed() {
  console.log("Limpando tabelas...");
  await db.delete(resumoDiario);
  await db.delete(registroPonto);
  await db.delete(usuarioEmpresa);
  await db.delete(setor);
  await db.delete(usuario);
  await db.delete(empresa);

  console.log("Criando empresa...");
  const [empresaCriada] = await db
    .insert(empresa)
    .values({
      nome: "Indústria Exemplo LTDA",
      cnpj: faker.string.numeric(14),
    })
    .returning();

  const siglaEmpresa = gerarSiglaEmpresa(empresaCriada.nome);

  await db.insert(setor).values(SETORES.map((nome) => ({ nome })));

  const hoje = new Date();

  // ─── Usuários fixos ───────────────────────────────────────────────────────────

  console.log("Criando usuários fixos...");

  for (const u of USUARIOS_FIXOS) {
    const vinculoId = await criarUsuarioComVinculo({
      ...u,
      empresaId: empresaCriada.id,
      siglaEmpresa,
    });

    await gerarHistorico(vinculoId, u.turnoConfig, hoje);
  }

  // ─── Usuários aleatórios ──────────────────────────────────────────────────────

  console.log("Criando usuários aleatórios...");

  const colaboradores: {
    usuarioEmpresaId: string;
    turnoConfig: TurnoConfig;
  }[] = [];

  for (let i = 0; i < 20; i++) {
    const turnoConfig = faker.helpers.arrayElement(TURNOS);

    const usuarioEmpresaId = await criarUsuarioComVinculo({
      nome: faker.person.fullName(),
      cpf: gerarCPF(),
      senha: "123456789",
      empresaId: empresaCriada.id,
      siglaEmpresa,
      cargo: faker.helpers.arrayElement(CARGOS),
      setor: faker.helpers.arrayElement(SETORES),
      turnoConfig,
    });

    colaboradores.push({ usuarioEmpresaId, turnoConfig });
  }

  console.log("Gerando histórico dos usuários aleatórios...");

  for (const { usuarioEmpresaId, turnoConfig } of colaboradores) {
    await gerarHistorico(usuarioEmpresaId, turnoConfig, hoje);
  }

  // ─── Resumo final ─────────────────────────────────────────────────────────────

  console.log("\nSeed concluído 🚀");
  console.log("─────────────────────────────────────────────────────");
  console.log("Usuários fixos:");
  for (const u of USUARIOS_FIXOS) {
    const cpfFormatado = u.cpf.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4",
    );
    console.log(`  ${cpfFormatado}  |  ${u.perfil.padEnd(12)}  |  ${u.setor}`);
  }
  console.log("  Senha de todos: 123456789");
  console.log("─────────────────────────────────────────────────────\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
