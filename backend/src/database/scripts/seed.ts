import { faker } from '@faker-js/faker/locale/pt_BR'
import bcrypt from 'bcryptjs'
import { db } from '@/config/database'
import { registro_ponto, resumo_diario, usuario } from '@/database/schemas'

faker.seed(42)

const SETORES = ['Produção', 'Montagem', 'Logística', 'Qualidade', 'Manutenção']

const CARGOS = [
  'Operador de produção',
  'Auxiliar de montagem',
  'Técnico de manutenção',
  'Analista de qualidade',
  'Auxiliar de logística',
  'Supervisor de linha',
  'Inspetor de qualidade',
]

const TURNOS = [
  { turno: 'manha', entrada: '07:00', saida: '16:00', carga: 480 },
  { turno: 'tarde', entrada: '15:00', saida: '23:00', carga: 480 },
  { turno: 'noite', entrada: '23:00', saida: '07:00', carga: 480 },
  { turno: 'administrativo', entrada: '08:00', saida: '17:00', carga: 480 },
] as const

function matricula(index: number) {
  return `PIM-${String(index).padStart(4, '0')}`
}

function addMinutes(base: Date, minutes: number) {
  return new Date(base.getTime() + minutes * 60 * 1000)
}

function setTime(base: Date, timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date(base)
  d.setHours(h, m, 0, 0)
  return d
}

function diasUteisDoMes(ano: number, mes: number): Date[] {
  const dias: Date[] = []
  const total = new Date(ano, mes, 0).getDate()
  for (let d = 1; d <= total; d++) {
    const dia = new Date(ano, mes - 1, d)
    if (dia.getDay() !== 0 && dia.getDay() !== 6) dias.push(dia)
  }
  return dias
}

function calcularResumo(
  batidas: { tipo: string; timestamp: Date }[],
  cargaMinutos: number,
  entradaEsperada: string,
  data: Date
) {
  const get = (tipo: string) => batidas.find(b => b.tipo === tipo)?.timestamp

  const entrada = get('entrada')
  const saida_almoco = get('saida_almoco')
  const retorno_almoco = get('retorno_almoco')
  const saida = get('saida')

  if (!entrada) {
    return {
      horas_trabalhadas: '0',
      horas_esperadas: (cargaMinutos / 60).toFixed(2),
      horas_extras: '0',
      atraso_minutos: 0,
      status: 'falta' as const,
    }
  }

  let trabalhadoMs = 0
  if (saida) {
    trabalhadoMs = saida.getTime() - entrada.getTime()
    if (saida_almoco && retorno_almoco) {
      trabalhadoMs -= retorno_almoco.getTime() - saida_almoco.getTime()
    }
  }

  const trabalhadoHoras = trabalhadoMs / (1000 * 60 * 60)
  const cargaHoras = cargaMinutos / 60
  const completo = !!(entrada && saida_almoco && retorno_almoco && saida)
  const extras = completo ? Math.max(0, trabalhadoHoras - cargaHoras) : 0
  const esperado = setTime(data, entradaEsperada)
  const atraso = Math.max(
    0,
    Math.floor((entrada.getTime() - esperado.getTime()) / 60000)
  )

  return {
    horas_trabalhadas: trabalhadoHoras.toFixed(2),
    horas_esperadas: cargaHoras.toFixed(2),
    horas_extras: extras.toFixed(2),
    atraso_minutos: atraso,
    status: (completo ? 'completo' : 'incompleto') as any,
  }
}

async function seed() {
  const SENHA_HASH = await bcrypt.hash('123456789', 10)

  console.log('Limpando tabelas...')
  await db.delete(resumo_diario)
  await db.delete(registro_ponto)
  await db.delete(usuario)

  // ── 1. Gestores e RH ──────────────────────────────────────────────────────
  console.log('Criando gestores e RH...')

  await db.insert(usuario).values([
    {
      nome: 'Juliana Rocha Tavares',
      matricula: matricula(901),
      senha: SENHA_HASH,
      perfil: 'gestor',
    },
    {
      nome: 'Marcelo Andrade Pinto',
      matricula: matricula(902),
      senha: SENHA_HASH,
      perfil: 'gestor',
    },
    {
      nome: 'Ana Paula Meireles',
      matricula: matricula(903),
      senha: SENHA_HASH,
      perfil: 'rh',
    },
  ])

  // ── 2. Colaboradores ──────────────────────────────────────────────────────
  console.log('Criando 20 colaboradores...')

  const colaboradoresCriados: Array<{
    usuario_id: string
    turnoConfig: (typeof TURNOS)[number]
  }> = []

  for (let i = 0; i < 20; i++) {
    const turnoConfig = faker.helpers.arrayElement(TURNOS)

    const [novoUsuario] = await db
      .insert(usuario)
      .values({
        nome: faker.person.fullName(),
        matricula: matricula(i + 1),
        senha: SENHA_HASH,
        perfil: 'colaborador',
        cargo: faker.helpers.arrayElement(CARGOS),
        setor: faker.helpers.arrayElement(SETORES),
        turno: turnoConfig.turno,
        carga_horaria_dia: turnoConfig.carga,
        horario_entrada: turnoConfig.entrada,
        horario_saida: turnoConfig.saida,
      })
      .returning({ id: usuario.id })

    colaboradoresCriados.push({ usuario_id: novoUsuario.id, turnoConfig })
  }

  // ── 3. Histórico — últimos 2 meses ────────────────────────────────────────
  console.log('Gerando histórico de ponto...')

  const hoje = new Date()
  const meses = [
    { ano: hoje.getFullYear(), mes: hoje.getMonth() },
    { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 },
  ]

  for (const { usuario_id, turnoConfig } of colaboradoresCriados) {
    for (const { ano, mes } of meses) {
      const dias = diasUteisDoMes(ano, mes)

      for (const dia of dias) {
        if (dia > hoje) continue

        if (faker.datatype.boolean({ probability: 0.1 })) {
          await db.insert(resumo_diario).values({
            usuario_id,
            data: dia.toISOString().split('T')[0],
            horas_trabalhadas: '0',
            horas_esperadas: (turnoConfig.carga / 60).toFixed(2),
            horas_extras: '0',
            atraso_minutos: 0,
            status: 'falta',
          })
          continue
        }

        const atrasoMin = faker.datatype.boolean({ probability: 0.3 })
          ? faker.number.int({ min: 5, max: 20 })
          : 0

        const entrada = addMinutes(setTime(dia, turnoConfig.entrada), atrasoMin)
        const inicioAlmoco = addMinutes(
          entrada,
          faker.number.int({ min: 230, max: 250 })
        )
        const fimAlmoco = addMinutes(
          inicioAlmoco,
          faker.number.int({ min: 55, max: 65 })
        )

        const extraMin = faker.datatype.boolean({ probability: 0.2 })
          ? faker.number.int({ min: 30, max: 90 })
          : 0

        const saida = addMinutes(fimAlmoco, turnoConfig.carga - 240 + extraMin)
        const incompleto = faker.datatype.boolean({ probability: 0.05 })

        const batidas = [
          { tipo: 'entrada', timestamp: entrada },
          { tipo: 'saida_almoco', timestamp: inicioAlmoco },
          { tipo: 'retorno_almoco', timestamp: fimAlmoco },
          ...(!incompleto ? [{ tipo: 'saida', timestamp: saida }] : []),
        ]

        await db.insert(registro_ponto).values(
          batidas.map(b => ({
            usuario_id,
            tipo: b.tipo as any,
            timestamp: b.timestamp,
            origem: 'sistema' as const,
          }))
        )

        const resumo = calcularResumo(
          batidas,
          turnoConfig.carga,
          turnoConfig.entrada,
          dia
        )

        await db.insert(resumo_diario).values({
          usuario_id,
          data: dia.toISOString().split('T')[0],
          ...resumo,
        })
      }
    }
  }

  console.log('Seed concluído.')
  process.exit(0)
}

seed().catch(err => {
  console.error('Erro no seed:', err)
  process.exit(1)
})
