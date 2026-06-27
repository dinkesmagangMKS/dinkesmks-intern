import { autoClockOutStaleAttendances } from "@/lib/attendance"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const processed = await autoClockOutStaleAttendances()

    return NextResponse.json({
      success: true,
      processed,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}