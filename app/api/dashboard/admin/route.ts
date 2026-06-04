import { getSessionUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getTodayUTC } from "@/utils/date"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getSessionUser()

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const today = getTodayUTC()

    const [todaySession, totalInternAktif, internsHariIni, divisions] = await Promise.all([
      prisma.attendanceSession.findFirst({
        where: { date: today },
        include: { attendances: true }
      }),
      prisma.user.count({
        where: {
          role: "INTERN",
          ...(user.role === "ADMIN" && { division_id: user.divisionId }),
          profile: {
            start_date: { lte: now },
            end_date: { gte: now },
            finished_early_at: null
          }
        }
      }),
      prisma.user.findMany({
        where: {
          role: "INTERN",
          ...(user.role === "ADMIN" && { division_id: user.divisionId }),
          profile: {
            start_date: { lte: now },
            end_date: { gte: now },
            finished_early_at: null
          }
        },
        include: {
          profile: true,
          division: true,
          attendances: {
            where: { session: { date: today } }
          }
        }
      }),
      prisma.division.findMany({
        include: {
          users: {
            where: { role: "INTERN" },
            include: {
              attendances: {
                where: { session: { date: today } }
              },
              profile: true
            }
          }
        }
      })
    ])

    // Map ke format yang lebih simpel
    const listInternHariIni = internsHariIni.map(intern => ({
      id: intern.id,
      name: intern.name,
      division: intern.division?.name ?? "-",
      statusHariIni: intern.attendances[0]?.status ?? "BELUM",
      reason: intern.attendances[0]?.reason ?? null
    }))

    const allAttendancesToday = todaySession?.attendances ?? []

    const attendancesToday = user.role === "ADMIN"
      ? allAttendancesToday.filter(a => 
          internsHariIni.some(i => i.id === a.user_id)
        )
      : allAttendancesToday

    const hadirHariIni = attendancesToday.filter(a => a.status === "HADIR").length
    const izinHariIni = attendancesToday.filter(a => a.status === "IZIN").length
    const belumHadir = totalInternAktif - hadirHariIni - izinHariIni


    const rekapDivisi = divisions
      .filter(div => 
        user.role === "SUPER_ADMIN" || div.id === user.divisionId
      )
      .map(div => {
        const internAktif = div.users.filter(u => 
          u.profile?.start_date && 
          u.profile.start_date <= now &&
          u.profile?.end_date && 
          u.profile.end_date >= now &&
          !u.profile.finished_early_at
        )
        return {
          divisi: div.name,
          total: internAktif.length,
          hadir: internAktif.filter(u => 
            u.attendances.some(a => a.status === "HADIR")
          ).length
        }
      })

    return NextResponse.json({
      totalInternAktif,
      hadirHariIni,
      izinHariIni,
      belumHadir,
      todaySession,
      rekapDivisi,
      listInternHariIni,
      role: user.role,
      divisionId: user.divisionId
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}