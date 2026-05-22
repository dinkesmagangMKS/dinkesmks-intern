import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInternStatus } from "@/utils/intern";
import { NextResponse } from "next/server";

export async function GET(request:Request) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.userId},
      include: {
        profile: true,
        division: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.role !== "INTERN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { university, major, jobdesk, phone, photo_url, start_date, end_date } = await request.json()

    // Cek status intern
    const profile = await prisma.internProfile.findUnique({
      where: { user_id: sessionUser.userId }
    })

    const status = getInternStatus(profile)
    const isFinished = status === "FINISHED"

    const updated = await prisma.internProfile.update({
      where: { user_id: sessionUser.userId },
      data: {
        university,
        major,
        jobdesk,
        phone,
        photo_url,
        // Hanya update periode kalau belum finished
        ...(!isFinished && {
          start_date: start_date ? new Date(start_date) : undefined,
          end_date: end_date ? new Date(end_date) : undefined,
        })
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