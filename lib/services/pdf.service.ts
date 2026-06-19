import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Image
} from "@react-pdf/renderer"
import { createElement } from "react"

// ==========================================
// 1. STYLES UTAMA (Kop Surat Menggunakan Font Times Resmi)
// ==========================================
const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingHorizontal: 45,
    paddingBottom: 50, 
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: "#111111"
  },
  kop: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 8,
    borderBottomWidth: 3, // Garis hitam tebal di bawah kop
    borderBottomColor: "#000000",
    marginBottom: 20,
    marginTop: -10,
    minHeight: 60, 
  },
  // Logo diposisikan melayang di kiri agar tidak mendorong teks utama ke kanan
  logoWrapper: { 
    position: "absolute",
    left: 0,
    top: 0,
    width: 55, 
    height: 55, 
    objectFit: "contain"
  },
  logoPlaceholder: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 55, 
    height: 55, 
    borderWidth: 1, 
    borderColor: "#d1d5db",
    backgroundColor: "#f3f4f6"
  },
  kopText: { 
    flexDirection: "column", 
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // Lebar penuh agar text-align center bekerja simetris di halaman
  },
  kopJudul: { 
    fontFamily: "Times-Bold", // Font Serif resmi kedinasan
    fontSize: 14, 
    textAlign: "center", 
    letterSpacing: 0.5,
    color: "#000000"
  },
  kopSubjudul: { 
    fontFamily: "Times-Bold", // Font Serif resmi kedinasan
    fontSize: 17, 
    textAlign: "center", 
    letterSpacing: 0.5, 
    marginTop: 1,
    color: "#000000"
  },
  kopAlamat: { 
    fontFamily: "Times-Roman", // Font Serif reguler untuk alamat
    fontSize: 9, 
    textAlign: "center", 
    marginTop: 4, 
    color: "#000000"
  },

  biodataSection: { marginBottom: 20, flexDirection: "column" },
  biodataRow: { flexDirection: "row", marginBottom: 4 },
  biodataLabel: { width: 100, fontSize: 9.5, fontFamily: "Helvetica-Bold" },
  biodataColon: { width: 12, fontSize: 9.5 },
  biodataValue: { flex: 1, fontSize: 9.5 },

  titleLaporan: { fontSize: 12, fontFamily: "Helvetica-Bold", textAlign: "center", textTransform: "uppercase", marginBottom: 3, letterSpacing: 0.5 },
  datePrinted: { fontSize: 8.5, color: "#4b5563", textAlign: "center", marginBottom: 16 },

  table: { 
    width: "100%", 
    borderStyle: "solid", 
    borderWidth: 1, 
    borderColor: "#000000" 
  },
  tableHeader: { 
    flexDirection: "row", 
    backgroundColor: "#ffffff", 
    alignItems: "stretch" 
  },
  tableRow: { 
    flexDirection: "row", 
    alignItems: "stretch", 
    backgroundColor: "#ffffff" 
  },
  
  cellNo: { width: "6%", padding: 6, borderRightWidth: 1, borderRightColor: "#000000", justifyContent: "center", alignItems: "center" },
  cellDate: { width: "19%", padding: 6, borderRightWidth: 1, borderRightColor: "#000000", justifyContent: "flex-start" },
  cellDesc: { width: "53%", padding: 6, borderRightWidth: 1, borderRightColor: "#000000", justifyContent: "flex-start" },
  cellDoc: { width: "22%", padding: 6, justifyContent: "center", alignItems: "center" },
  
  rowBorder: { 
    borderBottomWidth: 1, 
    borderBottomColor: "#000000" 
  },

  textHeader: { fontFamily: "Helvetica-Bold", fontSize: 9, color: "#000000" },
  textNo: { fontSize: 9, textAlign: "center", color: "#000000" },
  textDate: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#000000" },
  textDesc: { fontSize: 9, lineHeight: 1.4, color: "#000000" },

  docImage: { width: 80, height: 55, objectFit: "cover", borderWidth: 1, borderColor: "#000000" },
  noDocText: { fontSize: 8, color: "#4b5563", fontStyle: "italic" },

  signatureContainer: { marginTop: 25, flexDirection: "row", justifyContent: "flex-end", width: "100%" },
  signatureBox: { width: 200, flexDirection: "column" },
  signatureText: { fontSize: 9.5, lineHeight: 1.3 },
  signatureSpace: { height: 45 },

  footer: { position: "absolute", bottom: 20, left: 45, right: 45, flexDirection: "row", justifyContent: "space-between", paddingTop: 6, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  footerText: { fontSize: 8, color: "#9ca3af" }
})

// ==========================================
// 2. HELPER UTAMA 
// ==========================================
function formatTanggal(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
}

// Format tanggal penuh (misal: 17 Juni 2026)
function formatDate(date: string | null): string {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

function formatJamPDF(dateStr: string | null): string {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

// ==========================================
// 3. STYLE KOLOM KHUSUS TABEL ABSENSI
// ==========================================
const attCellNo: any = { width: "6%", padding: 6, borderRightWidth: 1, borderRightColor: "#000000", justifyContent: "center", alignItems: "center" }
const attCellDate: any = { width: "22%", padding: 6, borderRightWidth: 1, borderRightColor: "#000000", justifyContent: "flex-start" }
const attCellStatus: any = { width: "13%", padding: 6, borderRightWidth: 1, borderRightColor: "#000000", justifyContent: "center", alignItems: "center" }
const attCellIn: any = { width: "14%", padding: 6, borderRightWidth: 1, borderRightColor: "#000000", justifyContent: "center", alignItems: "center" }
const attCellOut: any = { width: "14%", padding: 6, borderRightWidth: 1, borderRightColor: "#000000", justifyContent: "center", alignItems: "center" }
const attCellReason: any = { width: "31%", padding: 6, justifyContent: "flex-start" }

// ==========================================
// 4. TYPES & LOGIC MODUL LOGBOOK (FIXED)
// ==========================================
export type LogbookPDFProps = {
  intern: {
    name: string
    email: string
    profile: { university: string | null; major: string | null; jobdesk: string | null; start_date: string | null; end_date: string | null } | null
    division: { name: string } | null
  }
  logbooks: { id: string; date: string; description: string; documentation?: string | null }[]
  logoBase64?: string | null
}

function LogbookDocument({ intern, logbooks, logoBase64 }: LogbookPDFProps) {
  return createElement(
    Document,
    null,
    createElement(
      Page,
      { size: "A4", style: styles.page, wrap: true },

      // KOP SURAT
      createElement(
        View,
        { style: styles.kop },
        logoBase64
          ? createElement(Image, { src: logoBase64, style: styles.logoWrapper })
          : createElement(View, { style: styles.logoPlaceholder }),
        createElement(
          View,
          { style: styles.kopText },
          createElement(Text, { style: styles.kopJudul }, "PEMERINTAH KOTA MAKASSAR"),
          createElement(Text, { style: styles.kopSubjudul }, "DINAS KESEHATAN"),
          createElement(Text, { style: styles.kopAlamat }, "Jl. Teduh Bersinar No. 1 Rappocini Kota Makassar 90221")
        )
      ),

      // BIODATA MAHASISWA
      createElement(
        View,
        { style: styles.biodataSection },
        createElement(View, { style: styles.biodataRow },
          createElement(Text, { style: styles.biodataLabel }, "Nama"),
          createElement(Text, { style: styles.biodataColon }, ":"),
          createElement(Text, { style: styles.biodataValue }, intern.name)
        ),
        createElement(View, { style: styles.biodataRow },
          createElement(Text, { style: styles.biodataLabel }, "Universitas"),
          createElement(Text, { style: styles.biodataColon }, ":"),
          createElement(Text, { style: styles.biodataValue }, intern.profile?.university ?? "-")
        ),
        createElement(View, { style: styles.biodataRow },
          createElement(Text, { style: styles.biodataLabel }, "Jurusan"),
          createElement(Text, { style: styles.biodataColon }, ":"),
          createElement(Text, { style: styles.biodataValue }, intern.profile?.major ?? "-")
        ),
        createElement(View, { style: styles.biodataRow },
          createElement(Text, { style: styles.biodataLabel }, "Periode Magang"),
          createElement(Text, { style: styles.biodataColon }, ":"),
          createElement(Text, { style: styles.biodataValue },
            intern.profile?.start_date && intern.profile?.end_date
              ? `${formatDate(intern.profile.start_date)} — ${formatDate(intern.profile.end_date)}`
              : "-"
          )
        )
      ),

      // JUDUL LAPORAN
      createElement(Text, { style: styles.titleLaporan }, "REKAPITULASI LOGBOOK HARIAN MAGANG"),
      createElement(
        Text,
        { style: styles.datePrinted },
        `Total Aktivitas: ${logbooks.length} | Dicetak ${formatDate(new Date().toISOString())}`
      ),

      // TABEL DATA LOGBOOK
      createElement(
        View,
        { style: styles.table },
        createElement(
          View,
          { style: [styles.tableHeader, styles.rowBorder] },
          createElement(View, { style: styles.cellNo }, createElement(Text, { style: styles.textHeader }, "No")),
          createElement(View, { style: styles.cellDate }, createElement(Text, { style: styles.textHeader }, "Tanggal")),
          createElement(View, { style: styles.cellDesc }, createElement(Text, { style: styles.textHeader }, "Deskripsi Kegiatan")),
          createElement(View, { style: styles.cellDoc }, createElement(Text, { style: styles.textHeader }, "Dokumentasi"))
        ),
        ...logbooks.map((lb, idx) => {
          const isLastRow = idx === logbooks.length - 1;
          const combinedRowStyle = isLastRow ? styles.tableRow : [styles.tableRow, styles.rowBorder];

          return createElement(
            View,
            { style: combinedRowStyle, key: lb.id, wrap: false },
            createElement(View, { style: styles.cellNo }, createElement(Text, { style: styles.textNo }, `${idx + 1}`)),
            createElement(View, { style: styles.cellDate }, createElement(Text, { style: styles.textDate }, formatTanggal(lb.date))),
            createElement(View, { style: styles.cellDesc }, createElement(Text, { style: styles.textDesc }, lb.description)),
            createElement(
              View, 
              { style: styles.cellDoc }, 
              lb.documentation 
                ? createElement(Image, { src: lb.documentation, style: styles.docImage }) 
                : createElement(Text, { style: styles.noDocText }, "Tidak ada foto")
            )
          )
        })
      ),

      // AREA TANDA TANGAN MANUAL
      createElement(
        View,
        { style: styles.signatureContainer, wrap: false },
        createElement(
          View,
          { style: styles.signatureBox },
          createElement(Text, { style: styles.signatureText }, "..............., ................................"),
          createElement(View, { style: styles.signatureSpace }),
          createElement(Text, { style: styles.signatureText }, ".................................................."),
          createElement(Text, { style: styles.signatureText }, "..................................................")
        )
      ),

      // FOOTER HALAMAN FIXED
      createElement(
        View,
        { style: styles.footer, fixed: true },
        createElement(Text, { style: styles.footerText }, "Dinas Kesehatan Kota Makassar"),
        createElement(Text, {
          style: styles.footerText,
          render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
            `Halaman ${pageNumber} dari ${totalPages}`
        })
      )
    )
  )
}

export async function generateLogbookPDF(data: LogbookPDFProps): Promise<ArrayBuffer> {
  const doc = createElement(LogbookDocument, data)
  const buffer = await renderToBuffer(doc as any)
  const bytes = new Uint8Array(buffer)
  return bytes.buffer as ArrayBuffer
}

// ==========================================
// 5. TYPES & LOGIC MODUL ABSENSI
// ==========================================
export type AttendancePDFProps = {
  intern: {
    name: string
    email: string
    profile: {
      university: string | null
      major: string | null
      jobdesk: string | null
      start_date: string | null
      end_date: string | null
    } | null
    division: { name: string } | null
  }
  attendance: {
    id: string
    date: string
    status: string
    clock_in_at: string | null
    clock_out_at: string | null
    reason: string | null
  }[]
  logoBase64?: string | null
}

function AttendanceDocument({ intern, attendance, logoBase64 }: AttendancePDFProps) {
  return createElement(
    Document,
    null,
    createElement(
      Page,
      { size: "A4", style: styles.page, wrap: true },

      createElement(
        View,
        { style: styles.kop },
        logoBase64
          ? createElement(Image, { src: logoBase64, style: styles.logoWrapper })
          : createElement(View, { style: styles.logoPlaceholder }),
        createElement(
          View,
          { style: styles.kopText },
          createElement(Text, { style: styles.kopJudul }, "PEMERINTAH KOTA MAKASSAR"),
          createElement(Text, { style: styles.kopSubjudul }, "DINAS KESEHATAN"),
          createElement(Text, { style: styles.kopAlamat }, "Jl. Teduh Bersinar No. 1 Rappocini Kota Makassar 90221")
        )
      ),

      // BIODATA MAHASISWA
      createElement(
        View,
        { style: styles.biodataSection },
        createElement(View, { style: styles.biodataRow },
          createElement(Text, { style: styles.biodataLabel }, "Nama"),
          createElement(Text, { style: styles.biodataColon }, ":"),
          createElement(Text, { style: styles.biodataValue }, intern.name)
        ),
        createElement(View, { style: styles.biodataRow },
          createElement(Text, { style: styles.biodataLabel }, "Universitas"),
          createElement(Text, { style: styles.biodataColon }, ":"),
          createElement(Text, { style: styles.biodataValue }, intern.profile?.university ?? "-")
        ),
        createElement(View, { style: styles.biodataRow },
          createElement(Text, { style: styles.biodataLabel }, "Jurusan"),
          createElement(Text, { style: styles.biodataColon }, ":"),
          createElement(Text, { style: styles.biodataValue }, intern.profile?.major ?? "-")
        ),
        createElement(View, { style: styles.biodataRow },
          createElement(Text, { style: styles.biodataLabel }, "Periode Magang"),
          createElement(Text, { style: styles.biodataColon }, ":"),
          createElement(Text, { style: styles.biodataValue },
            intern.profile?.start_date && intern.profile?.end_date
              ? `${formatDate(intern.profile.start_date)} — ${formatDate(intern.profile.end_date)}`
              : "-"
          )
        )
      ),

      // JUDUL LAPORAN
      createElement(Text, { style: styles.titleLaporan }, "REKAPITULASI ABSENSI MAGANG"),
      createElement(
        Text,
        { style: styles.datePrinted },
        `Total Kehadiran: ${attendance.length} | Dicetak ${formatDate(new Date().toISOString())}`
      ),

      // TABEL DATA ABSENSI
      createElement(
        View,
        { style: styles.table },
        createElement(
          View,
          { style: [styles.tableHeader, styles.rowBorder] },
          createElement(View, { style: attCellNo }, createElement(Text, { style: styles.textHeader }, "No")),
          createElement(View, { style: attCellDate }, createElement(Text, { style: styles.textHeader }, "Tanggal")),
          createElement(View, { style: attCellStatus }, createElement(Text, { style: styles.textHeader }, "Status")),
          createElement(View, { style: attCellIn }, createElement(Text, { style: styles.textHeader }, "Jam Masuk")),
          createElement(View, { style: attCellOut }, createElement(Text, { style: styles.textHeader }, "Jam Keluar")),
          createElement(View, { style: attCellReason }, createElement(Text, { style: styles.textHeader }, "Keterangan/Alasan"))
        ),
        ...attendance.map((att, idx) => {
          const isLastRow = idx === attendance.length - 1;
          const combinedRowStyle = isLastRow ? styles.tableRow : [styles.tableRow, styles.rowBorder];

          return createElement(
            View,
            { style: combinedRowStyle, key: att.id, wrap: false },
            createElement(View, { style: attCellNo }, createElement(Text, { style: styles.textNo }, `${idx + 1}`)),
            createElement(View, { style: attCellDate }, createElement(Text, { style: styles.textDate }, formatTanggal(att.date))),
            createElement(View, { style: attCellStatus }, createElement(Text, { style: styles.textNo }, att.status)),
            createElement(View, { style: attCellIn }, createElement(Text, { style: styles.textNo }, formatJamPDF(att.clock_in_at))),
            createElement(View, { style: attCellOut }, createElement(Text, { style: styles.textNo }, formatJamPDF(att.clock_out_at))),
            createElement(View, { style: attCellReason }, createElement(Text, { style: styles.textDesc }, att.reason ?? "-"))
          )
        })
      ),

      // AREA TANDA TANGAN MANUAL
      createElement(
        View,
        { style: styles.signatureContainer, wrap: false },
        createElement(
          View,
          { style: styles.signatureBox },
          createElement(Text, { style: styles.signatureText }, "................, ................................"),
          createElement(View, { style: styles.signatureSpace }),
          createElement(Text, { style: styles.signatureText }, ".................................................."),
          createElement(Text, { style: styles.signatureText }, "..................................................")
        )
      ),

      // FOOTER HALAMAN FIXED
      createElement(
        View,
        { style: styles.footer, fixed: true },
        createElement(Text, { style: styles.footerText }, "Dinas Kesehatan Kota Makassar"),
        createElement(Text, {
          style: styles.footerText,
          render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
            `Halaman ${pageNumber} dari ${totalPages}`
        })
      )
    )
  )
}

export async function generateAttendancePDF(data: AttendancePDFProps): Promise<ArrayBuffer> {
  const doc = createElement(AttendanceDocument, data)
  const buffer = await renderToBuffer(doc as any)
  const bytes = new Uint8Array(buffer)
  return bytes.buffer as ArrayBuffer
}