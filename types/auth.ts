export type JwtPayload = {
  userId: string
  role: "SUPER_ADMIN" | "ADMIN" | "INTERN"
  isFirstLogin: boolean
  divisionId: string | null
}

export type SessionUser = JwtPayload