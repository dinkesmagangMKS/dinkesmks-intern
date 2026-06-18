export function getTodayWITAString(): string {
  // Gunakan Asia/Makassar (WITA) agar tidak terpengaruh timezone server (UTC pada Vercel)
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Makassar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  return formatter.format(new Date())
}

export function getTodayUTC(): Date {
  const todayStr = getTodayWITAString()
  return new Date(todayStr + "T00:00:00.000Z")
}

export function getTodayString(): string {
  return getTodayWITAString()
}

export function toUTCDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00.000Z")
}