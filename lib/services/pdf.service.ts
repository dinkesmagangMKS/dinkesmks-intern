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

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingHorizontal: 45,
    paddingBottom: 50,
    fontFamily: "Helvetica", // Menggunakan basis font Arial/Helvetica bawaan PDF
    fontSize: 9.5,
    color: "#222222"
  },
  
  // === STYLING KOP SURAT  ===
  kop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#111111",
    marginBottom: 22,
    marginTop: -10,
  },
  logoWrapper: { 
    width: 52, 
    height: 52, 
    marginRight: 16, 
    flexShrink: 0 
  },
  logoPlaceholder: {
    width: 52,
    height: 52,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    marginRight: 16,
    flexShrink: 0,
  },
  kopText: { 
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center"
  },
  kopJudul: { 
    fontFamily: "Helvetica", 
    fontSize: 10.5,
    textAlign: "center",
    letterSpacing: 0.6,
    lineHeight: 1.2,
    color: "#111111"
  },
  kopSubjudul: { 
    fontFamily: "Helvetica-Bold", 
    fontSize: 14,
    textAlign: "center",
    letterSpacing: 0.6,
    lineHeight: 1.2,
    marginTop: 2,
    color: "#000000"
  },
  kopAlamat: {
    fontFamily: "Helvetica",
    fontSize: 8.5,
    textAlign: "center",
    marginTop: 4,
    color: "#4b5563"
  },
  kopTelp: { 
    fontFamily: "Helvetica", 
    fontSize: 8.5, 
    textAlign: "center",
    color: "#4b5563",
    marginTop: 1
  },

  // === BIODATA  ===
  biodataSection: {
    marginBottom: 25,
    flexDirection: "column",
  },
  biodataRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  biodataLabel: {
    width: 95, // Jarak dikunci agar titik dua sejajar lurus vertikal
    fontSize: 9.5,
    color: "#111111",
    fontFamily: "Helvetica-Bold"
  },
  biodataColon: {
    width: 12,
    fontSize: 9.5,
    color: "#111111"
  },
  biodataValue: {
    flex: 1,
    fontSize: 9.5,
    color: "#222222"
  },

  // === JUDUL ===
  titleLaporan: {
    fontSize: 11.5,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 3,
    letterSpacing: 0.6,
    color: "#000000"
  },
  datePrinted: {
    fontSize: 8,
    color: "#52525b",
    textAlign: "center",
    marginBottom: 18
  },

  // === TABEL KEGIATAN  ===
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e4e4e7"
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f4f4f5", // Latar belakang header abu lembut bersih
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center"
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "flex-start"
  },
  
  // Pembagian ukuran lebar kolom tabel
  tableColHeaderNo: { width: "5%", fontFamily: "Helvetica-Bold", fontSize: 9 },
  tableColHeaderDate: { width: "18%", fontFamily: "Helvetica-Bold", fontSize: 9, paddingLeft: 4 },
  tableColHeaderDesc: { width: "55%", fontFamily: "Helvetica-Bold", fontSize: 9, paddingLeft: 4 },
  tableColHeaderDoc: { width: "22%", fontFamily: "Helvetica-Bold", fontSize: 9, textAlign: "center" },
  
  tableColNo: { width: "5%", fontSize: 9, color: "#4b5563" },
  tableColDate: { width: "18%", fontSize: 9, color: "#222222", paddingLeft: 4, fontFamily: "Helvetica-Bold" },
  tableColDesc: { width: "55%", fontSize: 9, lineHeight: 1.4, color: "#222222", paddingLeft: 4 },
  tableColDoc: { width: "22%", alignItems: "center", justifyContent: "center" },

  docImage: {
    width: 75,
    height: 50,
    objectFit: "cover",
    borderRadius: 3
  },
  noDocText: {
    fontSize: 8,
    color: "#a1a1aa",
    fontStyle: "italic"
  },

  // === FOOTER DOKUMEN ===
  footer: {
    position: "absolute",
    bottom: 25,
    left: 45,
    right: 45,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f4f4f5"
  },
  footerText: {
    fontSize: 8,
    color: "#a1a1aa"
  }
})

export type LogbookPDFProps = {
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
  logbooks: {
    id: string
    date: string
    description: string
    documentation?: string | null
  }[]
  logoBase64?: string | null
}

function formatTanggal(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  })
}

function formatDate(date: string | null): string {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })
}

function LogbookDocument({ intern, logbooks, logoBase64 }: LogbookPDFProps) {
  return createElement(
    Document,
    null,
    createElement(
      Page,
      { size: "A4", style: styles.page, wrap: true },

      // 1. KOP SURAT INSTANSI
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
          createElement(Text, { style: styles.kopAlamat }, "Jl. Teduh Bersinar No.1 Makassar"),
          createElement(Text, { style: styles.kopTelp }, "Telp. (0411) 881649 Fax. (0411) 887710")
        )
      ),

      // 2. BIODATA MAHASISWA RATA KIRI (BORDERLESS)
      createElement(
        View,
        { style: styles.biodataSection },
        createElement(
          View,
          { style: styles.biodataRow },
          createElement(Text, { style: styles.biodataLabel }, "Nama"),
          createElement(Text, { style: styles.biodataColon }, ":"),
          createElement(Text, { style: styles.biodataValue }, intern.name)
        ),
        createElement(
          View,
          { style: styles.biodataRow },
          createElement(Text, { style: styles.biodataLabel }, "Universitas"),
          createElement(Text, { style: styles.biodataColon }, ":"),
          createElement(Text, { style: styles.biodataValue }, intern.profile?.university ?? "-")
        ),
        createElement(
          View,
          { style: styles.biodataRow },
          createElement(Text, { style: styles.biodataLabel }, "Jurusan"),
          createElement(Text, { style: styles.biodataColon }, ":"),
          createElement(Text, { style: styles.biodataValue }, intern.profile?.major ?? "-")
        ),
        createElement(
          View,
          { style: styles.biodataRow },
          createElement(Text, { style: styles.biodataLabel }, "Periode Magang"),
          createElement(Text, { style: styles.biodataColon }, ":"),
          createElement(
            Text,
            { style: styles.biodataValue },
            intern.profile?.start_date && intern.profile?.end_date
              ? `${formatDate(intern.profile.start_date)} — ${formatDate(intern.profile.end_date)}`
              : "-"
          )
        )
      ),

      // 3. JUDUL LAPORAN LOGBOOK
      createElement(Text, { style: styles.titleLaporan }, "LOGBOOK KEGIATAN MAGANG"),
      createElement(
        Text,
        { style: styles.datePrinted },
        `Total Kegiatan: ${logbooks.length} Entri  |  Dicetak pada ${formatDate(new Date().toISOString())}`
      ),

      // 4. TABEL DATA LOGBOOK
      createElement(
        View,
        { style: styles.table },
        createElement(
          View,
          { style: styles.tableHeader },
          createElement(Text, { style: styles.tableColHeaderNo }, "No"),
          createElement(Text, { style: styles.tableColHeaderDate }, "Tanggal"),
          createElement(Text, { style: styles.tableColHeaderDesc }, "Deskripsi Kegiatan"),
          createElement(Text, { style: styles.tableColHeaderDoc }, "Dokumentasi")
        ),
        ...logbooks.map((lb, idx) =>
          createElement(
            View,
            { style: styles.tableRow, key: lb.id, wrap: false },
            createElement(Text, { style: styles.tableColNo }, `${idx + 1}`),
            createElement(Text, { style: styles.tableColDate }, formatTanggal(lb.date)),
            createElement(Text, { style: styles.tableColDesc }, lb.description),
            createElement(
              View,
              { style: styles.tableColDoc },
              lb.documentation
                ? createElement(Image, { src: lb.documentation, style: styles.docImage })
                : createElement(Text, { style: styles.noDocText }, "-")
            )
          )
        )
      ),

      // 5. FOOTER HALAMAN (FIXED DI TIAP LAPORAN)
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