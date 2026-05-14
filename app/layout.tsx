import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; // Pastikan import ini ada

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intern Management System",
  description: "Sistem Manajemen Magang Dinas Kesehatan Kota Makassar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white">
        {/* Konten aplikasi utama */}
        {children}

        {/* Komponen Toaster agar notifikasi bisa muncul di mana saja */}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}