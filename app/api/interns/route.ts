import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInternStatus } from "@/utils/intern";
import { NextResponse } from "next/server";
import type { CreateInternInput } from "@/types";
import bcrypt from "bcryptjs";

export async function POST(request:Request) {
  try {
    const user = await getSessionUser()
    const { name, email, password, divisionId }: CreateInternInput = await request.json()

    if (!user || user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!name || !email || !password || !divisionId) {
      return NextResponse.json(
        { error: "Semua field wajib diisi." },
        { status: 400 }
      )
    }

    // Hanya ADMIN yang dibatasi — SUPER_ADMIN bebas pilih divisi manapun
    if (user.role === "ADMIN" && divisionId !== user.divisionId) {
      return NextResponse.json(
        { error: "Kamu hanya bisa menambah intern untuk divisimu sendiri." },
        { status: 403 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newIntern = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "INTERN",
        division_id: divisionId
      }
    })

    return NextResponse.json(newIntern, { status: 201 })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}
  

export async function GET(request:Request) {
  try {
    const user = await getSessionUser()
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const divisi = searchParams.get("divisi")
    
    const whereClause = {
      role: "INTERN" as const,
      ...(user.role === "ADMIN" 
        ? { division_id: user.divisionId }
        : divisi && divisi !== "semua"
          ? { division_id: divisi } 
          : {}
      )
    }
    
    const interns = await prisma.user.findMany({
      where: whereClause,
      include: {
        profile: true,
        division: true
      }
    })

    const internWithStatus = interns.map((intern) => ({
      ...intern,
      status: getInternStatus(intern.profile)
    }))

    return NextResponse.json(internWithStatus)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}