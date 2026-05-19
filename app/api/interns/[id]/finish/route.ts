import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const user = await getSessionUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const intern = await prisma.user.findUnique({
      where: {
        id,
        role: "INTERN",
      },
      include: {
        profile: true,
        division: true,
      },
    });

    if (!intern) {
      return NextResponse.json(
        { error: "Intern tidak ditemukan." },
        { status: 404 },
      );
    }

    if (user.role === "ADMIN" && intern.division_id !== user.divisionId) {
      return NextResponse.json(
        { error: "Kamu hanya bisa Finish intern untuk divisimu sendiri." },
        { status: 403 },
      );
    }

    const logbooks = await prisma.logbook.findMany({
      where: { user_id: id },
    });

    // Ambil semua path foto dari logbook
    const photoPaths = logbooks
      .filter((logbook) => logbook.documentation !== null)
      .map((logbook) => logbook.documentation as string);

    // Hapus semua
    await Promise.all(photoPaths.map((path) => deleteFile(path)));

    await prisma.logbook.updateMany({
      where: { user_id: id },
      data: { documentation: null },
    });

    await prisma.internProfile.upsert({
      where: { user_id: id },
      update: {
        finished_early_at: new Date()
      },
      create: {
        user_id: id,
        finished_early_at: new Date()
      }
    })

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Terjadi kesalahan." }, { status: 500 });
  }
}
