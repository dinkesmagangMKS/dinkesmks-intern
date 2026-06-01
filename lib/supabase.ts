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

// Upload file — return public URL
export async function uploadFile(file: File, path: string): Promise<string> {
  // Validasi MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP.")
  }

  // Validasi ukuran setelah kompresi
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran file terlalu besar. Maksimal 1MB.")
  }

  const { error } = await supabase.storage
    .from("intern-files")
    .upload(path, file, { upsert: true })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage
    .from("intern-files")
    .getPublicUrl(path)

  return data.publicUrl
}

// Hapus file
export async function deleteFile(path: string): Promise<void> {
  await supabase.storage.from("intern-files").remove([path])
}