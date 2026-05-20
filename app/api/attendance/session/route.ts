import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AttendanceSession } from "@prisma/client";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

function getSessionStatus(session: AttendanceSession) {
  if (session.closed_at) return "DITUTUP"
  if (new Date() > session.expires_at) return "EXPIRED"
  return "AKTIF"
}

export async function GET(request:Request) {
  try {
    const user = await getSessionUser()

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await prisma.attendanceSession.findMany({
      orderBy: { date: "desc" },
      include: {
        attendances: {
          include: { user: true }
        },
        creator: {
          select: { name: true }
        }
      }
    })

    const sessionsWithStatus = sessions.map((session) => ({
      ...session,
      status: getSessionStatus(session)
    }))

    return NextResponse.json(sessionsWithStatus)

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}

export async function POST (request:Request) {
  try {
    const { expires_at } = await request.json()
    const user = await getSessionUser()
    const code = nanoid(6).toUpperCase()
    const today = new Date()

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  
    today.setHours(0, 0, 0, 0)
  
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
  
    const existingSession = await prisma.attendanceSession.findFirst({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })
  
    if (existingSession) {
      return NextResponse.json(
        { error: "Sesi absensi untuk hari ini sudah ada." },
        { status: 400 }
      )
    }

    const session = await prisma.attendanceSession.create({
      data: {
        date: today,
        code,
        expires_at: expires_at ? new Date(expires_at) : new Date(Date.now() + 8 * 60 * 60 * 1000),
        created_by: user.userId
      }
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}