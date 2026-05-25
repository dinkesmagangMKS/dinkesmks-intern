export function getTodayUTC(): Date {
  const todayStr = new Date().toLocaleDateString("en-CA")
  return new Date(todayStr + "T00:00:00.000Z")
}

export function getTodayString(): string {
  return new Date().toLocaleDateString("en-CA")
}

export function toUTCDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00.000Z")
}