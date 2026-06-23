import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile, extractStoragePath } from "@/lib/supabase";
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

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { photo_url } = body

    // Kalau ada foto baru, hapus foto lama dari storage
    if (photo_url) {
      const existingProfile = await prisma.internProfile.findUnique({
        where: { user_id: sessionUser.userId }
      })

      if (existingProfile?.photo_url && existingProfile.photo_url !== photo_url) {
        const oldPath = extractStoragePath(existingProfile.photo_url)
        if (oldPath) {
          await deleteFile(oldPath).catch(() => { })
        }
      }
    }

    // Admin hanya bisa update foto
    if (sessionUser.role === "ADMIN" || sessionUser.role === "SUPER_ADMIN") {
      const updated = await prisma.internProfile.upsert({
        where: { user_id: sessionUser.userId },
        update: { photo_url },
        create: { user_id: sessionUser.userId, photo_url }
      })
      return NextResponse.json(updated)
    }

    // Intern bisa update semua field profil
    if (sessionUser.role !== "INTERN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { university, major, jobdesk, phone, start_date, end_date } = body

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