import { faker } from '@faker-js/faker/locale/pt_BR'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { db } from '../../config/database'
import type { StatusDia, TipoBatida } from '../../database/schemas/sqlite'
import { registroPonto, resumoDiario, usuario } from '../../database/schemas/sqlite'

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

let MATRICULA_SEQ = 1

function gerarMatricula() {
    return `PIM-${String(MATRICULA_SEQ++).padStart(4, '0')}`
}

function addMinutes(base: Date, minutes: number) {
    return new Date(base.getTime() + minutes * 60000)
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

type Batida = { tipo: TipoBatida; timestamp: string }

function calcularResumo(
    batidas: Batida[],
    cargaMinutos: number,
    entradaEsperada: string,
    data: Date
): {
    horasTrabalhadas: number
    horasEsperadas: number
    horasExtras: number
    atrasoMinutos: number
    status: StatusDia
} {
    const get = (tipo: TipoBatida) => batidas.find(b => b.tipo === tipo)?.timestamp

    const entradaStr = get('entrada')
    const saidaAlmocoStr = get('saida_almoco')
    const retornoAlmocoStr = get('retorno_almoco')
    const saidaStr = get('saida')

    if (!entradaStr) {
        return {
            horasTrabalhadas: 0,
            horasEsperadas: cargaMinutos / 60,
            horasExtras: 0,
            atrasoMinutos: 0,
            status: 'falta',
        }
    }

    const entrada = new Date(entradaStr)
    const saidaAlmoco = saidaAlmocoStr ? new Date(saidaAlmocoStr) : null
    const retornoAlmoco = retornoAlmocoStr ? new Date(retornoAlmocoStr) : null
    const saida = saidaStr ? new Date(saidaStr) : null

    let trabalhadoMs = 0
    if (saida) {
        trabalhadoMs = saida.getTime() - entrada.getTime()
        if (saidaAlmoco && retornoAlmoco) {
            trabalhadoMs -= retornoAlmoco.getTime() - saidaAlmoco.getTime()
        }
    }

    const trabalhadoHoras = trabalhadoMs / 3600000
    const cargaHoras = cargaMinutos / 60
    const completo = !!(entradaStr && saidaAlmocoStr && retornoAlmocoStr && saidaStr)
    const extras = completo ? Math.max(0, trabalhadoHoras - cargaHoras) : 0

    const esperado = setTime(data, entradaEsperada)
    const atraso = Math.max(0, Math.floor((entrada.getTime() - esperado.getTime()) / 60000))

    return {
        horasTrabalhadas: Number(trabalhadoHoras.toFixed(2)),
        horasEsperadas: Number(cargaHoras.toFixed(2)),
        horasExtras: Number(extras.toFixed(2)),
        atrasoMinutos: atraso,
        status: completo ? 'completo' : 'incompleto',
    }
}

async function seed() {
    const SENHA_HASH = await bcrypt.hash('123456789', 10)

    console.log('Limpando tabelas...')
    await db.delete(resumoDiario)
    await db.delete(registroPonto)
    await db.delete(usuario)

    console.log('Criando gestores e RH...')

    await db.insert(usuario).values([
        {
            id: randomUUID(),
            nome: 'Juliana Rocha Tavares',
            matricula: gerarMatricula(),
            senha: SENHA_HASH,
            perfil: 'gestor' as const,
        },
        {
            id: randomUUID(),
            nome: 'Marcelo Andrade Pinto',
            matricula: gerarMatricula(),
            senha: SENHA_HASH,
            perfil: 'gestor' as const,
        },
        {
            id: randomUUID(),
            nome: 'Ana Paula Meireles',
            matricula: gerarMatricula(),
            senha: SENHA_HASH,
            perfil: 'rh' as const,
        },
    ])

    console.log('Criando colaboradores...')

    const colaboradoresCriados: {
        usuarioId: string
        turnoConfig: (typeof TURNOS)[number]
    }[] = []

    for (let i = 0; i < 20; i++) {
        const id = randomUUID()
        const turnoConfig = faker.helpers.arrayElement(TURNOS)

        await db.insert(usuario).values({
            id,
            nome: faker.person.fullName(),
            matricula: gerarMatricula(),
            senha: SENHA_HASH,
            perfil: 'colaborador' as const,
            cargo: faker.helpers.arrayElement(CARGOS),
            setor: faker.helpers.arrayElement(SETORES),
            turno: turnoConfig.turno,
            cargaHorariaDia: turnoConfig.carga,
            horarioEntrada: turnoConfig.entrada,
            horarioSaida: turnoConfig.saida,
        })

        colaboradoresCriados.push({ usuarioId: id, turnoConfig })
    }

    console.log('Gerando histórico...')

    const hoje = new Date()

    const meses = [
        { ano: hoje.getFullYear(), mes: hoje.getMonth() },
        { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 },
    ]

    for (const { usuarioId, turnoConfig } of colaboradoresCriados) {
        for (const { ano, mes } of meses) {
            const dias = diasUteisDoMes(ano, mes)

            for (const dia of dias) {
                if (dia > hoje) continue

                const isFalta = faker.datatype.boolean({ probability: 0.1 })
                if (isFalta) {
                    await db.insert(resumoDiario).values({
                        usuarioId,
                        data: dia.toISOString().split('T')[0],
                        horasTrabalhadas: 0,
                        horasEsperadas: turnoConfig.carga / 60,
                        horasExtras: 0,
                        atrasoMinutos: 0,
                        status: 'falta' as const,
                    })
                    continue
                }

                const isCompleto = faker.datatype.boolean({ probability: 0.8 })
                const atrasoMin = faker.number.int({ min: -10, max: 30 })
                const entrada = addMinutes(setTime(dia, turnoConfig.entrada), atrasoMin)

                const batidas: Batida[] = [
                    { tipo: 'entrada', timestamp: entrada.toISOString() },
                ]

                if (isCompleto) {
                    let saidaAlmoco: Date
                    let retornoAlmoco: Date
                    let saida: Date

                    if (turnoConfig.turno === 'manha') {
                        saidaAlmoco = setTime(dia, '11:30')
                        retornoAlmoco = setTime(dia, '12:30')
                        saida = setTime(dia, '16:00')
                    } else if (turnoConfig.turno === 'tarde') {
                        saidaAlmoco = setTime(dia, '19:00')
                        retornoAlmoco = setTime(dia, '19:30')
                        saida = setTime(dia, '23:00')
                    } else if (turnoConfig.turno === 'noite') {
                        saidaAlmoco = addMinutes(setTime(dia, '03:00'), 1440)
                        retornoAlmoco = addMinutes(setTime(dia, '03:30'), 1440)
                        saida = addMinutes(setTime(dia, '07:00'), 1440)
                    } else {
                        saidaAlmoco = setTime(dia, '12:00')
                        retornoAlmoco = setTime(dia, '13:00')
                        saida = setTime(dia, '17:00')
                    }

                    saidaAlmoco = addMinutes(saidaAlmoco, faker.number.int({ min: -15, max: 15 }))
                    retornoAlmoco = addMinutes(retornoAlmoco, faker.number.int({ min: -15, max: 15 }))
                    saida = addMinutes(saida, faker.number.int({ min: -15, max: 15 }))

                    batidas.push(
                        { tipo: 'saida_almoco', timestamp: saidaAlmoco.toISOString() },
                        { tipo: 'retorno_almoco', timestamp: retornoAlmoco.toISOString() },
                        { tipo: 'saida', timestamp: saida.toISOString() }
                    )
                } else {
                    let saida = addMinutes(entrada, turnoConfig.carga)
                    saida = addMinutes(saida, faker.number.int({ min: -60, max: 60 }))
                    batidas.push({ tipo: 'saida', timestamp: saida.toISOString() })
                }

                await db.insert(registroPonto).values(
                    batidas.map(b => ({
                        id: randomUUID(),
                        usuarioId,
                        tipo: b.tipo,
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

                await db.insert(resumoDiario).values({
                    usuarioId,
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
    console.error(err)
    process.exit(1)
})