function setTime(base: Date, timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date(base)
  d.setHours(h, m, 0, 0)
  return d
}

export function calcularResumo(
  batidas: { tipo: string; timestamp: Date }[],
  cargaHoras: number, // 👈 Agora recebe as horas diretamente (ex: 8.0, 8.5)
  entradaEsperada: string,
  data: Date
) {
  const get = (tipo: string) => batidas.find(b => b.tipo === tipo)?.timestamp

  const entrada = get('entrada')
  const saidaAlmoco = get('saida_almoco')
  const retornoAlmoco = get('retorno_almoco')
  const saida = get('saida')

  if (!entrada) {
    return {
      horasTrabalhadas: 0,
      horasEsperadas: Number(cargaHoras.toFixed(2)),
      horasExtras: 0,
      atrasoMinutos: 0,
      status: 'falta' as const,
    }
  }

  let trabalhadoMs = 0
  if (saida) {
    trabalhadoMs = saida.getTime() - entrada.getTime()
    if (saidaAlmoco && retornoAlmoco) {
      trabalhadoMs -= retornoAlmoco.getTime() - saidaAlmoco.getTime()
    }
  }

  const trabalhadoHoras = trabalhadoMs / (1000 * 60 * 60)
  const completo = !!(entrada && saidaAlmoco && retornoAlmoco && saida)
  const extras = completo ? Math.max(0, trabalhadoHoras - cargaHoras) : 0
  const esperado = setTime(data, entradaEsperada)
  const atraso = Math.max(
    0,
    Math.floor((entrada.getTime() - esperado.getTime()) / 60000)
  )

  return {
    horasTrabalhadas: Number(trabalhadoHoras.toFixed(2)),
    horasEsperadas: Number(cargaHoras.toFixed(2)),
    horasExtras: Number(extras.toFixed(2)),
    atrasoMinutos: atraso,
    status: (completo ? 'completo' : 'incompleto') as 'completo' | 'incompleto',
  }
}
