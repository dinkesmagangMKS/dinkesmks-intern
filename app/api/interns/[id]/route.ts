import { getSessionUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getInternStatus } from "@/utils/intern"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    const user = await getSessionUser()
    
    if (!user || user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const intern = await prisma.user.findUnique({
      where: { 
        id,
        role: "INTERN"
      },
      include: {
        profile: true,
        division: true
      }
    })

    if (!intern) {
      return NextResponse.json(
        { error: "Intern tidak ditemukan." },
        { status: 404 }
      )
    }
    
    const internWithStatus = {
    ...intern,
    status: getInternStatus(intern.profile)
  }

  return NextResponse.json(internWithStatus)

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}