import type { InternStatus } from "@/types";
import type { InternProfile } from "@prisma/client";

export function getInternStatus(profile: InternProfile | null): InternStatus {
  if (!profile) return "PENDING"

  const today = new Date()

  if (profile.finished_early_at) return "FINISHED"
  if (!profile.start_date) return "PENDING"
  if (today < profile.start_date) return "PENDING"
  if (profile.end_date && today > profile.end_date) return "FINISHED"

  return "ACTIVE"
}