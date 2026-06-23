import { prisma } from "@/lib/prisma"
import { deleteFile, extractStoragePath } from "@/lib/supabase"
import { getTodayUTC } from "@/utils/date"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Verifikasi token/secret cron jika dikonfigurasi di env
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const today = getTodayUTC()
    const gracePeriodLimit = new Date(today)
    gracePeriodLimit.setDate(gracePeriodLimit.getDate() - 14)

    // Cari profil anak magang yang end_date-nya sudah melewati batas masa tenggang 14 hari
    const expiredProfiles = await prisma.internProfile.findMany({
      where: {
        end_date: {
          lte: gracePeriodLimit
        }
      },
      select: {
        user_id: true
      }
    })

    const userIds = expiredProfiles.map(p => p.user_id)

    if (userIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Tidak ada data logbook anak magang yang perlu di-reset.",
        resetCount: 0
      })
    }

    // Ambil logbook yang memiliki dokumentasi untuk user yang telah berakhir masa tenggangnya
    const logbooks = await prisma.logbook.findMany({
      where: {
        user_id: {
          in: userIds
        },
        documentation: {
          not: null
        }
      }
    })

    if (logbooks.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Masa tenggang magang habis, tetapi seluruh dokumentasi logbook sudah bersih.",
        resetCount: 0
      })
    }

    // Ekstrak path penyimpanan Supabase untuk dihapus
    const photoPaths = logbooks
      .map(lb => extractStoragePath(lb.documentation as string))
      .filter((path): path is string => path !== null)

    // Hapus semua file dokumentasi dari Supabase Storage
    await Promise.all(
      photoPaths.map(path => deleteFile(path).catch(err => {
        console.error(`Gagal menghapus file dari storage: ${path}`, err)
      }))
    )

    // Reset kolom documentation di database menjadi null
    const { count } = await prisma.logbook.updateMany({
      where: {
        id: {
          in: logbooks.map(lb => lb.id)
        }
      },
      data: {
        documentation: null
      }
    })

    return NextResponse.json({
      success: true,
      message: `Berhasil mereset dokumentasi untuk ${count} logbook dari anak magang yang masa tenggangnya habis.`,
      resetCount: count
    })
  } catch (error) {
    console.error("Error running cron cleanup:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat menjalankan pembersihan logbook." },
      { status: 500 }
    )
  }
}
