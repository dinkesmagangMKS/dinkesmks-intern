import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request:Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const user = await getSessionUser()

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await prisma.attendanceSession.findUnique({
      where: { id }
    })

    if (!session) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan." },
        { status: 404 }
      )
    }

    if (session.closed_at) {
      return NextResponse.json(
        { error: "Sesi sudah ditutup." },
        { status: 400 }
      )
    }

    const updatedSession = await prisma.attendanceSession.update({
      where: { id },
      data: { closed_at: new Date() }
    })

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request:Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const user = await getSessionUser()

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await prisma.attendanceSession.findUnique({
      where: { id }
    })

    if (!session) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan." },
        { status: 404 }
      )
    }

    await prisma.$transaction([
      prisma.attendance.deleteMany({
        where: { attendance_session_id: id }
      }),
      prisma.attendanceSession.delete({
        where: { id }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}