import { getSessionUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getInternStatus } from "@/utils/intern"
import { prisma } from "@/lib/prisma";

export async function POST(request:Request) {
  try {
    const user = await getSessionUser()
    const { reason } = await request.json()

    if (!user || user.role !== "INTERN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!reason) {
      return NextResponse.json(
        { error: "Alasan izin wajib diisi." },
        { status: 400 }
      )
    }

    const internProfile = await prisma.internProfile.findUnique({
      where: { user_id: user.userId }
    })

    const status = getInternStatus(internProfile)
    if (status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Status magangmu tidak aktif." },
        { status: 400 }
      )
    }

    const now = new Date()
    const todayStr = now.toLocaleDateString("en-CA")

    const session = await prisma.attendanceSession.findFirst({
      where: {
        date: new Date(todayStr + "T00:00:00.000Z")
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: "Tidak ada sesi absensi hari ini." },
        { status: 400 }
      )
    }

    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        user_id_attendance_session_id: {
          user_id: user.userId,
          attendance_session_id: session.id
        }
      }
    })

    if (existingAttendance) {
      return NextResponse.json(
        { error: "Kamu sudah tercatat absensi hari ini." },
        { status: 400 }
      )
    }

    if (session.closed_at) {
      return NextResponse.json(
        { error: "Sesi telah berakhir"},
        { status: 400 }
      )
    }

    if (new Date() > session.expires_at) {
      return NextResponse.json(
        { error: "Sesi absensi sudah expired." },
        { status: 400 }
      )
    }

    const attendance = await prisma.attendance.create({
      data: {
        user_id: user.userId,
        attendance_session_id: session.id,
        status: "IZIN",
        reason,
        clock_in_at: new Date()
      }
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}