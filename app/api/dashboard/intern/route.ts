import { autoClockOutIfNeeded, autoClockOutStaleAttendances } from "@/lib/attendance"
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

    await autoClockOutStaleAttendances(user.userId)

    const today = getTodayUTC()

    const [todaySession, profile, logbookTerakhir] = await Promise.all([
      prisma.attendanceSession.findFirst({
        where: { date: getTodayUTC() }
      }),
      prisma.internProfile.findUnique({
        where: { user_id: user.userId }
      }),
      prisma.logbook.findFirst({
        where: { user_id: user.userId },
        orderBy: { date: "desc" }
      })
    ])

    // todayAttendance bergantung ke todaySession — tetap sequential
    let todayAttendance = todaySession
      ? await prisma.attendance.findUnique({ 
        where: {
          user_id_attendance_session_id: {
            user_id: user.userId,
            attendance_session_id: todaySession.id
          }
        }
      })
      : null

    // sessions dan attendances tidak bergantung satu sama lain — paralel
    const [sessions, attendances] = await Promise.all([
      prisma.attendanceSession.findMany({
        where: {
          date: {
            gte: profile?.start_date ?? undefined,
            lte: profile?.finished_early_at ?? profile?.end_date ?? undefined
          }
        }
      }),
      prisma.attendance.findMany({
        where: { user_id: user.userId }
      })
    ])

    if (todayAttendance && todaySession) {
      todayAttendance = await autoClockOutIfNeeded(todayAttendance, todaySession)
    }

    const totalSesi = sessions.length
    const totalHadir = attendances.filter(a => a.status === "HADIR").length
    const totalIzin = attendances.filter(a => a.status === "IZIN").length
    const totalAbsen = totalSesi - totalHadir - totalIzin

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