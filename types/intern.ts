import type { User, InternProfile, Division } from "@prisma/client"

export type OnboardingInput = {
  university: string,
  major: string,
  jobdesk:string,
  phone?: string,
  start_date: string,
  end_date: string,
  password: string,
  photo_url?: string,
}

export type InternStatus = "ACTIVE" | "PENDING" | "FINISHED"

export type InternWithProfile = User & {
  profile: InternProfile | null,
  division: Division | null
}

export type InternWithStatus = InternWithProfile & {
  status: InternStatus
}

export type CreateInternInput = {
  name: string,
  email: string,
  password: string,
  divisionId: string
}