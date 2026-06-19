import type { User, Logbook } from "@prisma/client"

export type LogbookWithUser = Logbook & {
  user: User
}

export type CreateLogbookInput = {
  date: string,
  description: string,
  documentation?: string
}

export type UpdateLogbookInput = {
  description?: string,
  documentation?: string
}