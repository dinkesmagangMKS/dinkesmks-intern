"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface PhotoUploadProps {
  onChange?: (file: File | null) => void;
  value?: string; // URL gambar jika sudah ada sebelumnya (misal dari database)
}

export default function PhotoUpload({ onChange, value }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      if (onChange) onChange(file);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
  });

  const removePhoto = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah memicu dropzone klik kembali
    setPreview(null);
    if (onChange) onChange(null);
  };

  return (
    <div className="w-full space-y-2">
      <label className="text-xs font-semibold text-slate-500 block">Foto Presensi / Bukti Magang</label>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[160px]
          ${isDragActive ? "border-blue-500 bg-blue-50/50" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"}
          ${preview ? "border-solid border-slate-200 bg-white" : ""}
        `}
      >
        <input { ...getInputProps() } />
        
        {preview ? (
          // Tampilan jika foto sudah diupload (Ada Preview & Tombol Hapus)
          <div className="relative w-full aspect-video max-h-[140px] rounded-lg overflow-hidden group">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={removePhoto}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          // Tampilan area dropzone kosong
          <div className="flex flex-col items-center space-y-2 text-slate-500">
            <div className="p-2.5 bg-white rounded-full shadow-sm border border-slate-100 text-slate-400">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-blue-600">Klik untuk upload</span> atau drag & drop
            </div>
            <p className="text-[10px] text-slate-400">PNG, JPG, atau WEBP (Maksimal 5MB)</p>
          </div>
        )}
      </div>
    </div>
  );
}