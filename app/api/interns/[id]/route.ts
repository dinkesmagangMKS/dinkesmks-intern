import { getSessionUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getInternStatus } from "@/utils/intern"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params

  try {
    const user = await getSessionUser()
    
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const intern = await prisma.user.findUnique({
      where: { id, role: "INTERN" },
      include: { profile: true, division: true }
    })

    if (!intern) {
      return NextResponse.json(
        { error: "Intern tidak ditemukan." },
        { status: 404 }
      )
    }
    
    // Hitung status
    const internWithStatus = {
      ...intern,
      status: getInternStatus(intern.profile)
    }

    // Query sesi dan attendance
    const sessions = await prisma.attendanceSession.findMany({
      where: {
        date: {
          gte: intern.profile?.start_date ?? undefined,
          lte: intern.profile?.finished_early_at ?? intern.profile?.end_date ?? undefined
        }
      }
    })

    const attendances = await prisma.attendance.findMany({
      where: { user_id: id }
    })

    const totalSesi = sessions.length
    const totalHadir = attendances.filter(a => a.status === "HADIR").length
    const totalIzin = attendances.filter(a => a.status === "IZIN").length
    const totalAbsen = totalSesi - totalHadir - totalIzin

    const hadirDenganDurasi = attendances.filter(
      a => a.status === "HADIR" && a.work_duration_minutes !== null
    )
    const avgDurasi = hadirDenganDurasi.length > 0
      ? Math.round(
          hadirDenganDurasi.reduce((sum, a) => sum + (a.work_duration_minutes ?? 0), 0)
          / hadirDenganDurasi.length
        )
      : null

    const hadirDenganClockIn = attendances.filter(a => a.status === "HADIR")
    const avgClockIn = hadirDenganClockIn.length > 0
      ? Math.round(
          hadirDenganClockIn.reduce((sum, a) => {
            const jam = new Date(a.clock_in_at).getHours() * 60
              + new Date(a.clock_in_at).getMinutes()
            return sum + jam
          }, 0) / hadirDenganClockIn.length
        )
      : null

    // Return semua data
    return NextResponse.json({
      ...internWithStatus,
      stats: {
        totalSesi,
        totalHadir,
        totalIzin,
        totalAbsen,
        avgDurasi,
        avgClockIn
      }
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const user = await getSessionUser()

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const intern = await prisma.user.findUnique({
      where: { id, role: "INTERN" },
      include: { profile: true, division: true }
    })

    if (!intern) {
      return NextResponse.json(
        { error: "Intern tidak ditemukan." },
        { status: 404 }
      )
    }

    if (user.role === "ADMIN" && intern.division_id !== user.divisionId) {
      return NextResponse.json(
        { error: "Kamu hanya bisa menghapus intern untuk divisimu sendiri." },
        { status: 403 }
      )
    }

    const isPending = !intern.profile || !intern.profile.start_date

    if (!isPending) {
      return NextResponse.json(
        { error: "Hanya intern dengan status PENDING yang bisa dihapus." },
        { status: 400 }
      )
    }

    // Hapus profile
    if (intern.profile) {
      await prisma.internProfile.delete({
        where: { user_id: id }
      })
    }

    // hapus user
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}