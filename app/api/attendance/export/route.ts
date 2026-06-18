import { getSessionUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateAttendancePDF } from "@/lib/services/pdf.service" // Kita akan buat fungsi ini di Langkah 2
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const user = await getSessionUser()

    if (!user || user.role !== "INTERN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ambil data intern dan riwayat absensi (termasuk relasi session untuk tanggalnya)
    const [intern, attendanceHistory] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.userId },
        include: { profile: true, division: true }
      }),
      prisma.attendance.findMany({
        where: { user_id: user.userId },
        include: { session: true },
        orderBy: { session: { date: "asc" } }
      })
    ])

    if (!intern) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 })
    }

    // === PROSES MEMBACA LOGO PEMKOT KE BASE64 ===
    const logoPath = path.join(process.cwd(), "public", "logo.png")
    let logoBase64: string | null = null
    
    try {
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath)
        logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`
      }
    } catch (logoError) {
      console.error("[export-attendance] Gagal memuat logo:", logoError)
    }
    // ============================================

    // Generate bytes PDF menggunakan service PDF kamu
    const pdfBytes = await generateAttendancePDF({
      intern: {
        name: intern.name,
        email: intern.email,
        profile: intern.profile ? {
          university: intern.profile.university,
          major: intern.profile.major,
          jobdesk: intern.profile.jobdesk,
          start_date: intern.profile.start_date?.toISOString() ?? null,
          end_date: intern.profile.end_date?.toISOString() ?? null
        } : null,
        division: intern.division
      },
      attendance: attendanceHistory.map(att => ({
        id: att.id,
        date: att.session.date.toISOString(),
        status: att.status,
        clock_in_at: att.clock_in_at?.toISOString() ?? null,
        clock_out_at: att.clock_out_at?.toISOString() ?? null,
        reason: att.reason
      })),
      logoBase64: logoBase64 
    })

    const safeName = intern.name.replace(/\s+/g, "-").toLowerCase()

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="absensi-${safeName}.pdf"`,
        "Content-Length": String(pdfBytes.byteLength)
      }
    })

  } catch (error) {
    console.error("[export-attendance]", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengekspor absensi." },
      { status: 500 }
    )
  }
}