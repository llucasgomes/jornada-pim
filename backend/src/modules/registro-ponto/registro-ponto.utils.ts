function setTime(base: Date, timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date(base)
  d.setHours(h, m, 0, 0)
  return d
}

export function calcularResumo(
  batidas: { tipo: string; timestamp: Date }[],
  cargaMinutos: number,
  entradaEsperada: string,
  data: Date,
) {
  const get = (tipo: string) => batidas.find(b => b.tipo === tipo)?.timestamp

  const entrada        = get('entrada')
  const saida_almoco   = get('saida_almoco')
  const retorno_almoco = get('retorno_almoco')
  const saida          = get('saida')

  if (!entrada) {
    return {
      horas_trabalhadas: '0',
      horas_esperadas:   (cargaMinutos / 60).toFixed(2),
      horas_extras:      '0',
      atraso_minutos:    0,
      status:            'falta' as const,
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
  const cargaHoras      = cargaMinutos / 60
  const completo        = !!(entrada && saida_almoco && retorno_almoco && saida)
  const extras          = completo ? Math.max(0, trabalhadoHoras - cargaHoras) : 0
  const esperado        = setTime(data, entradaEsperada)
  const atraso          = Math.max(0, Math.floor((entrada.getTime() - esperado.getTime()) / 60000))

  return {
    horas_trabalhadas: trabalhadoHoras.toFixed(2),
    horas_esperadas:   cargaHoras.toFixed(2),
    horas_extras:      extras.toFixed(2),
    atraso_minutos:    atraso,
    status:            (completo ? 'completo' : 'incompleto') as any,
  }
}