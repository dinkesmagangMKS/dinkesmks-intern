import { getSessionUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(request:Request) {
  try {
    const user = await getSessionUser()
    
    if (!user || user.role !== "INTERN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const attendance = await prisma.attendance.findFirst({
      where: {
        user_id: user.userId,
        session: {
          date: { gte: today, lt: tomorrow }
        }
      }
    })

    if (!attendance) {
      return NextResponse.json(
        { error: "Kamu belum tercatat hadir hari ini." },
        { status: 400 }
      )
    }

    if (attendance.clock_out_at) {
      return NextResponse.json(
        { error: "Sudah absen hari ini." },
        { status: 400 }
      )
    }

    const clockOut = new Date()
    const durationMinutes = Math.floor(
      (clockOut.getTime() - attendance.clock_in_at.getTime()) / 60000
    )

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clock_out_at: clockOut,
        work_duration_minutes: durationMinutes
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}