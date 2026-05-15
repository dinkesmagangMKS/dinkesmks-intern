"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react"; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "../field";

interface PasswordInputProps {
  id?: string;
  label?: string;
  placeholder?: string;
  description?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PasswordInput({
  id = "input-password",
  label = "Kata Sandi",
  placeholder = "Masukkan kata sandi Anda",
  description,
  value,
  onChange,
}: PasswordInputProps) {
  // State untuk mengontrol visibilitas teks password
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Field>
      <FieldLabel htmlFor={id} className="text-xs font-semibold text-slate-700">
        {label}
      </FieldLabel>
      
      {/* Container relatif untuk memosisikan tombol mata di ujung kanan input */}
      <div className="relative mt-1">
        {/* Ikon Gembok di sisi kiri untuk estetika form yang rapi */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
          <Lock className="h-4 w-4" />
        </div>

        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="pl-9 pr-10 bg-white border-slate-200 focus-visible:ring-blue-500 shadow-sm"
        />

        {/* Tombol Toggle Eye Ikon */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute inset-y-0 right-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-600 transition-colors"
          onClick={() => setShowPassword(!showPassword)}
          title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      {description && (
        <FieldDescription className="text-xs text-slate-400 mt-1">
          {description}
        </FieldDescription>
      )}
    </Field>
  );
}