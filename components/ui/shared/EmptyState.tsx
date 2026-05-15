"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: ReactNode; // Untuk menerima ikon Lucide secara dinamis
  actionLabel?: string; // Teks tombol (opsional)
  onActionClick?: () => void; // Fungsi saat tombol diklik (opsional)
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onActionClick,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-600 dark:bg-zinc-900 dark:text-zinc-400 mb-4">
        {icon}
      </div>
      
      <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-50 tracking-tight">
        {title}
      </h3>
      
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-zinc-400">
        {description}
      </p>

      {actionLabel && onActionClick && (
        <div className="mt-6">
          <Button 
            onClick={onActionClick} 
            variant="outline" 
            size="sm"
            className="border-slate-200 shadow-sm bg-white hover:bg-slate-50 text-slate-700"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}