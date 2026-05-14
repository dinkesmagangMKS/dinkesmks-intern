import { Badge } from "@/components/ui/badge"

// Mendefinisikan tipe status sesuai dokumen Phase 9 & mockup figma Anda
type StatusType = 'ACTIVE' | 'PENDING' | 'FINISHED' | 'HADIR' | 'IZIN' | 'ABSEN' | 'BELUM';

interface StatusBadgeProps {
  status: StatusType
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Mapping class Tailwind berdasarkan status menggunakan style referensi Anda
  const colorMap: Record<StatusType, string> = {
    ACTIVE: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 border-green-200 dark:border-green-900/50",
    HADIR: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 border-green-200 dark:border-green-900/50",
    PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    IZIN: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
    FINISHED: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
    ABSEN: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-900/50",
    BELUM: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-900/50",
  }

  // Mengubah format text agar rapi (cth: FINISHED -> Finished, kecuali yang pendek/singkat)
  const formatText = (text: string) => {
    if (text === "HR" || text === "IT") return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  return (
    <Badge 
      variant="outline" 
      className={`${colorMap[status]} font-medium transition-colors`}
    >
      {formatText(status)}
    </Badge>
  )
}