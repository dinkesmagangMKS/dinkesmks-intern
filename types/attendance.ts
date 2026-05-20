import type { Attendance, AttendanceSession, User } from "@prisma/client"

export type AttendanceWithSession = Attendance & {
  session: AttendanceSession 
} 

export type SessionWithAttendances = AttendanceSession & {
  attendances: (Attendance & { user: User })[]
}

export type AttendanceSummary = {
  hadir: number,
  izin: number,
  absen: number,
  totalSesi: number
}

export type CheckInInput = {
  code: string
}