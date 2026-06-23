import { getSessionUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deleteFile, extractStoragePath } from "@/lib/supabase"
import type { UpdateLogbookInput } from "@/types"
import { isLogbookLocked } from "@/utils/intern"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { description, documentation }: UpdateLogbookInput = await request.json()
    const user = await getSessionUser()

    if (!user || user.role !== "INTERN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.internProfile.findUnique({
      where: { user_id: user.userId }
    })

    const locked = isLogbookLocked(profile)
    if (locked) {
      return NextResponse.json(
        { error: "Masa tenggang magang Anda telah berakhir lebih dari 14 hari. Logbook Anda terkunci." },
        { status: 400 }
      )
    }

    const logbook = await prisma.logbook.findUnique({
      where: { id }
    })

    if (!logbook) {
      return NextResponse.json(
        { error: "Logbook tidak ditemukan." },
        { status: 404 }
      )
    }

    if (logbook.user_id !== user.userId) {
      return NextResponse.json(
        { error: "Kamu tidak bisa edit logbook orang lain." },
        { status: 403 }
      )
    }

    // Kalau ada foto baru DAN foto lama berbeda — hapus foto lama
    if (documentation && logbook.documentation && logbook.documentation !== documentation) {
      const oldPath = extractStoragePath(logbook.documentation)
      if (oldPath) {
        await deleteFile(oldPath).catch(() => { })
      }
    }

    const updated = await prisma.logbook.update({
      where: { id },
      data: {
        description: description ?? logbook.description,
        documentation: documentation ?? logbook.documentation
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getSessionUser()

    if (!user || (user.role !== "INTERN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.internProfile.findUnique({
      where: { user_id: user.userId }
    })

    const locked = isLogbookLocked(profile)
    if (locked) {
      return NextResponse.json(
        { error: "Masa tenggang magang Anda telah berakhir lebih dari 14 hari. Logbook Anda terkunci." },
        { status: 400 }
      )
    }

    const logbook = await prisma.logbook.findUnique({
      where: { id }
    })

    if (!logbook) {
      return NextResponse.json(
        { error: "Logbook tidak ditemukan." },
        { status: 404 }
      )
    }

    if (logbook.user_id !== user.userId) {
      return NextResponse.json(
        { error: "Kamu tidak bisa hapus logbook orang lain." },
        { status: 403 }
      )
    }

    if (logbook.documentation) {
      const oldPath = extractStoragePath(logbook.documentation)
      if (oldPath) {
        await deleteFile(oldPath).catch(() => { })
      }
    }

    await prisma.logbook.delete({
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