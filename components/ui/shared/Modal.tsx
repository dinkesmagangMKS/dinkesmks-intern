"use client";

import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  title: string;
  description?: string; // Opsional untuk keterangan tambahan di bawah judul
  icon?: ReactNode;     // Opsional jika ingin memasukkan ikon di atas judul ala shadcn media style
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, description, icon, children }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* max-w-md untuk membatasi ukuran, bg adaptif untuk dark/light mode */}
      <DialogContent className="max-w-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center sm:text-left">
        
        <DialogHeader className="flex flex-col items-center sm:items-start gap-2">
          {/* Wadah Ikon/Media ala rancangan contoh desain yang Anda kirim */}
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 mx-auto sm:mx-0">
              {icon}
            </div>
          )}
          
          <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {title}
          </DialogTitle>

          {description && (
            <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Konten Utama Modal (Form, Logbook, Detail, dll) */}
        <div className="pt-2">
          {children}
        </div>
        
      </DialogContent>
    </Dialog>
  );
}