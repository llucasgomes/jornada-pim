
/**
 * Converte minutos em string legível
 * Ex: 80 → "1h 20min" | 45 → "45min" | 0 → "0min"
 */
export function minutosParaHora(minutos: number): string {
  if (!minutos || minutos <= 0) return "0min";
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

/**
 * Converte horas decimais em string legível
 * Ex: 8.5 → "8h 30min" | 0.78 → "0h 47min" | 1.0 → "1h"
 */
export function horasDecimalParaString(horas: number): string {
  if (!horas || horas <= 0) return "0min";
  const totalMin = Math.round(horas * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

/**
 * Converte horas decimais em formato HH:MM
 * Ex: 8.5 → "08:30" | 1.25 → "01:15"
 */
export function horasDecimalParaHHMM(horas: number): string {
  if (!horas || horas <= 0) return "00:00";
  const totalMin = Math.round(horas * 60);
  const h = Math.floor(totalMin / 60)
    .toString()
    .padStart(2, "0");
  const m = (totalMin % 60).toString().padStart(2, "0");
  return `${h}:${m}:00`;
}

/**
 * Converte minutos em formato HH:MM
 * Ex: 80 → "01:20" | 45 → "00:45"
 */
export function minutosParaHHMM(minutos: number): string {
  if (!minutos || minutos <= 0) return "00:00";
  const h = Math.floor(minutos / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutos % 60).toString().padStart(2, "0");
  return `${h}:${m}:00`;
}
