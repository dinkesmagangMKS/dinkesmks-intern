import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateLogbookInput } from "@/types";
import { getInternStatus } from "@/utils/intern";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser()

    if (!user || user.role !== "INTERN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)

    const cursor = searchParams.get("cursor")
    const limit = 10

    const logbooks = await prisma.logbook.findMany({
      where: {
        user_id: user.userId,
      },
      orderBy: {
        date: "desc",
      },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    })

    const hasMore = logbooks.length > limit

    const data = hasMore
      ? logbooks.slice(0, limit)
      : logbooks

    return NextResponse.json({
      data,
      nextCursor: hasMore
        ? data[data.length - 1].id
        : null,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}

export async function POST(request:Request) {
  try {
    const user = await getSessionUser()
    
    if (!user || (user.role !== "INTERN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { date, description, documentation }: CreateLogbookInput = await request.json()

    if (!description || !date || !documentation) {
      return NextResponse.json(
        { error: "Semua field wajib diisi." },
        { status: 400 }
      )
    }

    const profile = await prisma.internProfile.findUnique({
      where: { user_id: user.userId }
    })

    const status = getInternStatus(profile)
    if (status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Status magangmu tidak aktif." },
        { status: 400 }
      )
    }

    const logbookDate = new Date(date)

    if (profile?.start_date && logbookDate < profile.start_date) {
      return NextResponse.json(
        { error: "Tanggal di luar periode magang." },
        { status: 400 }
      )
    }

    if (profile?.end_date && logbookDate > profile.end_date) {
      return NextResponse.json(
        { error: "Tanggal di luar periode magang." },
        { status: 400 }
      )
    }

    const existing = await prisma.logbook.findUnique({
      where: {
        user_id_date: {
          user_id: user.userId,
          date: new Date(date)
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: "Logbook untuk tanggal ini sudah ada." },
        { status: 400 }
      )
    }

    const logbook = await prisma.logbook.create({
      data: {
        user_id: user.userId,
        date: new Date(date),
        description,
        documentation: documentation ?? null
      }
    })

    return NextResponse.json(logbook)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}