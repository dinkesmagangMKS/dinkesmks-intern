import { prisma } from "@/lib/prisma"
import type { Attendance, AttendanceSession } from "@prisma/client"

export async function autoClockOutIfNeeded(
  attendance: Attendance,
  session: AttendanceSession
): Promise<Attendance> {
  // Hanya proses HADIR yang belum clock out
  if (attendance.status !== "HADIR" || attendance.clock_out_at !== null) {
    return attendance
  }

  const now = new Date()
  const sessionExpired =
    session.closed_at !== null || now > new Date(session.expires_at)

  if (!sessionExpired) return attendance

  // Waktu clock-out otomatis
  const autoClockOutTime = session.closed_at
    ? new Date(session.closed_at)
    : new Date(session.expires_at)

  const clockOutTime = autoClockOutTime > now ? now : autoClockOutTime

  const clockInTime = attendance.clock_in_at ? new Date(attendance.clock_in_at) : now
  const durationMinutes = Math.floor(
    (clockOutTime.getTime() - clockInTime.getTime()) / 60000
  )

  return await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      clock_out_at: clockOutTime,
      work_duration_minutes: durationMinutes > 0 ? durationMinutes : 0
    }
  })
}