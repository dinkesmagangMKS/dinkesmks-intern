function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Environment variable "${name}" tidak ditemukan. ` +
      `Pastikan sudah diset di .env.local (development) atau Vercel dashboard (production).`
    )
  }
  return value
}

export function getEnv() {
  return {
    DATABASE_URL:                  requireEnv("DATABASE_URL"),
    JWT_SECRET:                    requireEnv("JWT_SECRET"),
    NEXT_PUBLIC_SUPABASE_URL:      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  }
}