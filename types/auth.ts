export type JwtPayload = {
  userId: string
  role: "SUPER_ADMIN" | "ADMIN" | "INTERN"
  isFirstLogin: boolean
}

export type SessionUser = JwtPayload