import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]

const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB

// Buat helper di lib/supabase.ts
export function sanitizeFileName(originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() ?? "jpg"
  // Hanya timestamp + ekstensi — tidak ada nama file asli
  return `${Date.now()}.${ext}`
}

// Upload file — return public URL
export async function uploadFile(
  file: File,
  path: string
): Promise<string> {

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Tipe file tidak didukung.")
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran file terlalu besar.")
  }

  const { data, error } = await supabase.storage
    .from("intern-files")
    .upload(path, file, {
      upsert: true,
    })

  console.log("UPLOAD DATA:", data)
  console.log("UPLOAD ERROR:", error)

  if (error) {
    throw new Error(error.message)
  }

  const { data: publicUrlData } = supabase.storage
    .from("intern-files")
    .getPublicUrl(path)

  return publicUrlData.publicUrl
}

// Hapus file
export async function deleteFile(path: string): Promise<void> {
  await supabase.storage.from("intern-files").remove([path])
}