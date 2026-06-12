import { getSessionUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateLogbookPDF } from "@/lib/services/pdf.service"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const user = await getSessionUser()

    if (!user || user.role !== "INTERN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [intern, logbooks] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.userId },
        include: { profile: true, division: true }
      }),
      prisma.logbook.findMany({
        where: { user_id: user.userId },
        orderBy: { date: "asc" }
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
      // Jika pembacaan gambar gagal, log dikirim ke server backend agar endpoint tidak crash
      console.error("[export-logbook] Gagal memuat logo:", logoError)
    }
    // ============================================

    const pdfBytes = await generateLogbookPDF({
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
      logbooks: logbooks.map(lb => ({
        id: lb.id,
        date: lb.date.toISOString(),
        description: lb.description,
        documentation: lb.documentation
      })),
      logoBase64: logoBase64 
    })

    const safeName = intern.name.replace(/\s+/g, "-").toLowerCase()

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="logbook-${safeName}.pdf"`,
        "Content-Length": String(pdfBytes.byteLength)
      }
    })

  } catch (error) {
    console.error("[export-logbook]", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengekspor logbook." },
      { status: 500 }
    )
  }
}