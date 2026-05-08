import { faker } from "@faker-js/faker/locale/pt_BR";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { db } from "@/config/database";
import {
  empresa,
  registroPonto,
  resumoDiario,
  setor,
  usuario,
  usuarioEmpresa,
  type Perfil,
  type TipoBatida,
} from "@/database/schemas/sqlite";

faker.seed(42);

const SETORES_DATA = [
  {
    nome: "Produção",
    desc: "Responsável pela fabricação e transformação de matérias-primas em produtos finais.",
  },
  {
    nome: "Montagem",
    desc: "Etapa técnica dedicada à união de componentes para a finalização do produto.",
  },
  {
    nome: "Logística",
    desc: "Gestão do fluxo de materiais, armazenamento e distribuição eficiente de mercadorias.",
  },
  {
    nome: "Qualidade",
    desc: "Monitoramento e garantia de que os processos e produtos atendam aos padrões exigidos.",
  },
  {
    nome: "Manutenção",
    desc: "Preservação e reparo de máquinas, equipamentos e infraestrutura operacional.",
  },
  {
    nome: "Administração",
    desc: "Planejamento estratégico, controle financeiro e gestão organizacional da empresa.",
  },
  {
    nome: "RH",
    desc: "Gestão de pessoas, recrutamento, desenvolvimento e bem-estar dos colaboradores.",
  },
  {
    nome: "TI",
    desc: "Suporte tecnológico, gerenciamento de redes e manutenção da infraestrutura digital.",
  },
  {
    nome: "Desenvolvimento",
    desc: "Criação, inovação e aprimoramento de softwares ou soluções técnicas internas.",
  },
];

const CARGOS = [
  "Operador de produção",
  "Auxiliar de montagem",
  "Técnico de manutenção",
  "Analista de qualidade",
  "Auxiliar de logística",
  "Supervisor de linha",
];

const TURNOS = [
  { turno: "1 turno", entrada: "07:00", saida: "16:00", carga: 480 },
  { turno: "2 turno", entrada: "16:00", saida: "23:00", carga: 480 },
  { turno: "3 turno", entrada: "23:00", saida: "07:00", carga: 480 },
  { turno: "Comercial", entrada: "08:00", saida: "17:00", carga: 480 },
] as const;

type TurnoConfig = (typeof TURNOS)[number];

const addMinutes = (base: Date, minutes: number) =>
  new Date(base.getTime() + minutes * 60000);

const setTime = (base: Date, timeStr: string) => {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
};

function diasUteisDoMes(ano: number, mes: number): Date[] {
  const dias: Date[] = [];
  const ultimoDia = new Date(ano, mes, 0).getDate();
  for (let d = 1; d <= ultimoDia; d++) {
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

async function gerarHistorico(
  vinculoId: string,
  turno: TurnoConfig,
  hoje: Date,
) {
  const batidasBatch = [];
  const resumosBatch = [];

  for (let m = 2; m >= 0; m--) {
    const refDate = new Date(hoje.getFullYear(), hoje.getMonth() - m, 1);
    const dias = diasUteisDoMes(refDate.getFullYear(), refDate.getMonth() + 1);

    for (const dia of dias) {
      if (dia > hoje) break;

      const dataFormatada = dia.toISOString().split("T")[0];
      const ehFalta = Math.random() < 0.1;

      if (ehFalta) {
        resumosBatch.push({
          id: randomUUID(),
          usuarioEmpresaId: vinculoId,
          data: dataFormatada,
          horasTrabalhadas: 0,
          horasEsperadas: turno.carga / 60,
          horasExtras: 0,
          atrasoMinutos: 0,
          status: "falta" as const,
        });
        continue;
      }

      const atrasoMin = faker.number.int({ min: -5, max: 15 });
      const entrada = addMinutes(setTime(dia, turno.entrada), atrasoMin);
      const saidaAlmoco = addMinutes(entrada, 240);
      const retornoAlmoco = addMinutes(saidaAlmoco, 60);
      const extrasMin = faker.number.int({ min: 0, max: 40 });
      const saida = addMinutes(retornoAlmoco, 240 + extrasMin);

      const tipos: TipoBatida[] = [
        "entrada",
        "saida_intervalo",
        "retorno_intervalo",
        "saida",
      ];
      const tempos = [entrada, saidaAlmoco, retornoAlmoco, saida];

      for (let i = 0; i < 4; i++) {
        batidasBatch.push({
          id: randomUUID(),
          usuarioEmpresaId: vinculoId,
          tipo: tipos[i],
          timestamp: tempos[i].toISOString(),
          origem: "sistema" as const,
        });
      }

      const trabalhadoMs =
        saida.getTime() -
        retornoAlmoco.getTime() +
        (saidaAlmoco.getTime() - entrada.getTime());
      const trabalhadoHoras = trabalhadoMs / (1000 * 60 * 60);
      const cargaHoras = turno.carga / 60;
      const esperado = setTime(dia, turno.entrada);
      const atraso = Math.max(
        0,
        Math.floor((entrada.getTime() - esperado.getTime()) / 60000),
      );

      resumosBatch.push({
        id: randomUUID(),
        usuarioEmpresaId: vinculoId,
        data: dataFormatada,
        horasTrabalhadas: Number(trabalhadoHoras.toFixed(2)),
        horasEsperadas: Number(cargaHoras.toFixed(2)),
        horasExtras: Number(
          Math.max(0, trabalhadoHoras - cargaHoras).toFixed(2),
        ),
        atrasoMinutos: atraso,
        status: "completo" as const,
      });
    }
  }

  if (batidasBatch.length > 0)
    await db.insert(registroPonto).values(batidasBatch);
  if (resumosBatch.length > 0)
    await db.insert(resumoDiario).values(resumosBatch);
}

async function seed() {
  try {
    console.log("🧹 Limpando tabelas...");
    await db.delete(resumoDiario);
    await db.delete(registroPonto);
    await db.delete(usuarioEmpresa);
    await db.delete(setor);
    await db.delete(usuario);
    await db.delete(empresa);

    console.log("🏢 Criando empresa...");
    const [empresaCriada] = await db
      .insert(empresa)
      .values({
        id: randomUUID(),
        nome: "Babá Tucumã Tech",
        cnpj: "12345678000100", // ← sem pontuação (único no banco)
        ativo: true,
      })
      .returning();

    console.log("🗂️ Criando setores...");
    await db.insert(setor).values(
      SETORES_DATA.map((data) => ({
        id: randomUUID(),
        nome:data.nome,
        descricao:data.desc,
        empresaId: empresaCriada.id, // ← obrigatório no schema
      })),
    );

    const senhaPadrao = await bcrypt.hash("123456789", 10);
    const hoje = new Date();
    const agora = new Date().toISOString();

    const USUARIOS_FIXOS = [
      {
        nome: "Admin Master",
        cpf: "123.456.789-01",
        perfil: "administrador" as Perfil,
        turno: TURNOS[3],
        setor: "Desenvolvimento",
      },
      {
        nome: "Gestor Produção",
        cpf: "123.456.789-02",
        perfil: "gestor" as Perfil,
        turno: TURNOS[0],
        setor: "Produção",
      },
      {
        nome: "RH Interno",
        cpf: "123.456.789-03",
        perfil: "rh" as Perfil,
        turno: TURNOS[3],
        setor: "RH",
      },
      {
        nome: "João Colaborador",
        cpf: "123.456.789-04",
        perfil: "colaborador" as Perfil,
        turno: TURNOS[0],
        setor: "Produção",
      },
    ];

    console.log("👥 Criando usuários fixos...");
    for (const u of USUARIOS_FIXOS) {
      const userId = randomUUID();

      await db.insert(usuario).values({
        id: userId,
        nome: u.nome,
        cpf: u.cpf,
        senha: senhaPadrao,
        imageUrl: faker.image.avatar(),
        ativo: true,
        updatedAt: agora, // ← notNull() no schema
      });

      const vinculoId = randomUUID();
      await db.insert(usuarioEmpresa).values({
        id: vinculoId,
        usuarioId: userId,
        empresaId: empresaCriada.id,
        matricula: `FIX-${faker.string.numeric(4)}`,
        perfil: u.perfil,
        setor: u.setor,
        cargo: "Especialista",
        turno: u.turno.turno,
        horarioEntrada: u.turno.entrada,
        horarioSaida: u.turno.saida,
        cargaHorariaDia: u.turno.carga,
        ativo: true,
      });

      await gerarHistorico(vinculoId, u.turno, hoje);
    }

    console.log("🎲 Gerando 20 colaboradores aleatórios...");
    for (let i = 0; i < 20; i++) {
      const userId = randomUUID();
      const turnoAleatorio = faker.helpers.arrayElement(TURNOS);

      await db.insert(usuario).values({
        id: userId,
        nome: faker.person.fullName(),
        cpf: gerarCPF(),
        senha: senhaPadrao,
        imageUrl: faker.image.avatar(),
        ativo: true,
        updatedAt: agora, // ← notNull() no schema
      });

      const vinculoId = randomUUID();
      await db.insert(usuarioEmpresa).values({
        id: vinculoId,
        usuarioId: userId,
        empresaId: empresaCriada.id,
        matricula: `MAT-${faker.string.numeric(4)}`,
        perfil: "colaborador",
        setor: faker.helpers.arrayElement(SETORES_DATA).nome,
        cargo: faker.helpers.arrayElement(CARGOS),
        turno: turnoAleatorio.turno,
        horarioEntrada: turnoAleatorio.entrada,
        horarioSaida: turnoAleatorio.saida,
        cargaHorariaDia: turnoAleatorio.carga,
        ativo: true,
      });

      await gerarHistorico(vinculoId, turnoAleatorio, hoje);
    }

    console.log("\n✅ Seed concluído!");
    console.log("─────────────────────────────────────");
    console.log("Admin:        123.456.789-01 | 123456789");
    console.log("Gestor:       123.456.789-02 | 123456789");
    console.log("RH:           123.456.789-03 | 123456789");
    console.log("Colaborador:  123.456.789-04 | 123456789");
    console.log("─────────────────────────────────────");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro no seed:", error);
    process.exit(1);
  }
}

seed();
