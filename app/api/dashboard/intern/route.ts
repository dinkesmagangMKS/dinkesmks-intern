import { getSessionUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getTodayUTC } from "@/utils/date"
import { getInternStatus } from "@/utils/intern"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getSessionUser()

    if (!user || user.role !== "INTERN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = getTodayUTC()

    // Sesi hari ini
    const todaySession = await prisma.attendanceSession.findFirst({
      where: { date: new Date(today) }
    })

    // Attendance hari ini
    const todayAttendance = todaySession
      ? await prisma.attendance.findUnique({
          where: {
            user_id_attendance_session_id: {
              user_id: user.userId,
              attendance_session_id: todaySession.id
            }
          }
        })
      : null

    // Profil intern
    const profile = await prisma.internProfile.findUnique({
      where: { user_id: user.userId }
    })

    // Statistik kehadiran
    const sessions = await prisma.attendanceSession.findMany({
      where: {
        date: {
          gte: profile?.start_date ?? undefined,
          lte: profile?.finished_early_at ?? profile?.end_date ?? undefined
        }
      }
    })

    const attendances = await prisma.attendance.findMany({
      where: { user_id: user.userId }
    })

    const totalSesi = sessions.length
    const totalHadir = attendances.filter(a => a.status === "HADIR").length
    const totalIzin = attendances.filter(a => a.status === "IZIN").length
    const totalAbsen = totalSesi - totalHadir - totalIzin

    // Logbook terakhir
    const logbookTerakhir = await prisma.logbook.findFirst({
      where: { user_id: user.userId },
      orderBy: { date: "desc" }
    })

    return NextResponse.json({
      todaySession,
      todayAttendance,
      totalHadir,
      totalIzin,
      totalAbsen,
      logbookTerakhir
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}