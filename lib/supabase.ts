import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadFile(
  file: File,
  path: string
) {
  const { data, error } = await supabase.storage
    .from("intern-files")
    .upload(path, file)

  console.log("UPLOAD DATA:", data)
  console.log("UPLOAD ERROR:", error)

  if (error) {
    throw error
  }

  const { data: publicUrl } = supabase.storage
    .from("intern-files")
    .getPublicUrl(path)

  return publicUrl.publicUrl
}

export async function deleteFile(path: string): Promise<void> {
  await supabase.storage.from("intern-files").remove([path])
}