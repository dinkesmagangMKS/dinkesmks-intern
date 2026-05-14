import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  valueColor?: string // Untuk mewarnai angka (misal: hijau untuk Hadir, merah untuk Absen)
}

export function StatCard({ title, value, description, icon: Icon, valueColor = "text-zinc-50" }: StatCardProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-zinc-500" />}
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold tracking-tight ${valueColor}`}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-zinc-500 mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}