import { prisma } from "@/lib/prisma"
import type { Attendance, AttendanceSession } from "@prisma/client"

type AttendanceWithSession = Attendance & { session: AttendanceSession }

// Hitung waktu clock-out otomatis + durasi kerja.
// Dipakai bersama oleh path lazy (satu attendance) dan path cron (banyak attendance).
function resolveAutoClockOut(attendance: AttendanceWithSession, now: Date) {
  const autoClockOutTime = attendance.session.closed_at
    ? new Date(attendance.session.closed_at)
    : new Date(attendance.session.expires_at)

  const clockOutTime = autoClockOutTime > now ? now : autoClockOutTime

  const clockInTime = attendance.clock_in_at ? new Date(attendance.clock_in_at) : now
  const durationMinutes = Math.floor(
    (clockOutTime.getTime() - clockInTime.getTime()) / 60000
  )

  return {
    clock_out_at: clockOutTime,
    work_duration_minutes: durationMinutes > 0 ? durationMinutes : 0
  }
}

export async function autoClockOutIfNeeded(
  attendance: Attendance,
  session: AttendanceSession
): Promise<Attendance> {
  if (attendance.status !== "HADIR" || attendance.clock_out_at !== null) {
    return attendance
  }

  const now = new Date()
  const sessionExpired =
    session.closed_at !== null || now > new Date(session.expires_at)

  if (!sessionExpired) return attendance

  const update = resolveAutoClockOut({ ...attendance, session }, now)

  return await prisma.attendance.update({
    where: { id: attendance.id },
    data: update
  })
}

// Sapu SEMUA attendance HADIR yang clock_out_at masih null dan sesinya
// sudah berakhir — termasuk backlog lama, bukan hanya "hari ini".
export async function autoClockOutStaleAttendances(userId?: string): Promise<number> {
  const now = new Date()

  const staleAttendances = await prisma.attendance.findMany({
    where: {
      ...(userId ? { user_id: userId } : {}),
      status: "HADIR",
      clock_out_at: null,
      session: {
        OR: [
          { closed_at: { not: null } },
          { expires_at: { lt: now } }
        ]
      }
    },
    include: { session: true }
  })

  for (const attendance of staleAttendances) {
    const update = resolveAutoClockOut(attendance, now)
    await prisma.attendance.update({
      where: { id: attendance.id },
      data: update
    })
  }

  return staleAttendances.length
}