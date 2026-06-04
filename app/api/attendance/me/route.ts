import { autoClockOutIfNeeded } from "@/lib/attendance"
import { getSessionUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getTodayUTC } from "@/utils/date"
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
      where: {
        date: new Date(today)
      }
    })

    // Attendance hari ini
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

    if (todayAttendance && todaySession) {
      todayAttendance = await autoClockOutIfNeeded(todayAttendance, todaySession)
    }

    // Riwayat semua attendance
    const history = await prisma.attendance.findMany({
      where: { user_id: user.userId },
      include: { session: true },
      orderBy: { session: { date: "desc" } }
    })

    return NextResponse.json({
      todaySession,
      todayAttendance,
      history
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}

