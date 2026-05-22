import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function PATCH(request:Request) {
  try {
    const user = await getSessionUser()
    const { new_password, old_password } = await request.json()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!old_password|| !new_password) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      )
    }

    const userId = user.userId

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    const passwordMatch = await bcrypt.compare(old_password, existingUser!.password)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Password lama tidak sesuai" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      }
    })

    return NextResponse.json({ success: "sukses" })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}