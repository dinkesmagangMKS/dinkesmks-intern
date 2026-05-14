import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadFile(file: File, path: string): Promise<string> {
  const { error } = await supabase.storage.from("intern-files").upload(path, file)
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from("intern-files").getPublicUrl(path)
  return data.publicUrl
}

export async function deleteFile(path: string): Promise<void> {
  await supabase.storage.from("intern-files").remove([path])
}