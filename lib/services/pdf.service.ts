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
    padding: 30,
    paddingBottom: 50,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#000000"
  },
  header: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000000"
  },
  title: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    marginBottom: 2
  },
  subtitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#555555",
    marginBottom: 4
  },
  datePrinted: {
    fontSize: 7,
    color: "#555555",
    textAlign: "right",
    marginTop: -15
  },
  infoSection: {
    marginBottom: 15,
    padding: 8,
    borderWidth: 1,
    borderColor: "#000000",
    flexDirection: "row",
    flexWrap: "wrap"
  },
  infoCol: {
    width: "50%",
    marginBottom: 4,
    flexDirection: "row"
  },
  infoLabel: {
    width: 80,
    fontSize: 8,
    color: "#000000",
    fontFamily: "Helvetica-Bold"
  },
  infoValue: {
    flex: 1,
    fontSize: 8,
    color: "#000000"
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: "#000000"
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000000"
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    padding: 5,
    alignItems: "center"
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    padding: 5,
    alignItems: "flex-start"
  },
  tableColHeaderNo: {
    width: "6%",
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#000000",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    paddingRight: 4
  },
  tableColHeaderDate: {
    width: "20%",
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#000000",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    paddingLeft: 4,
    paddingRight: 4
  },
  tableColHeaderDesc: {
    width: "50%",
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#000000",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    paddingLeft: 4,
    paddingRight: 4
  },
  tableColHeaderDoc: {
    width: "24%",
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#000000",
    textAlign: "center",
    paddingLeft: 4
  },
  tableColNo: {
    width: "6%",
    fontSize: 8,
    color: "#000000",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    paddingRight: 4
  },
  tableColDate: {
    width: "20%",
    fontSize: 8,
    color: "#000000",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    paddingLeft: 4,
    paddingRight: 4
  },
  tableColDesc: {
    width: "50%",
    fontSize: 8,
    lineHeight: 1.3,
    color: "#000000",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    paddingLeft: 4,
    paddingRight: 4
  },
  tableColDoc: {
    width: "24%",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 4
  },
  docImage: {
    width: 80,
    height: 55,
    objectFit: "cover"
  },
  noDocText: {
    fontSize: 8,
    color: "#555555",
    fontStyle: "italic"
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#cccccc"
  },
  footerText: {
    fontSize: 8,
    color: "#777777"
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

function LogbookDocument({ intern, logbooks }: LogbookPDFProps) {
  return createElement(
    Document,
    null,
    createElement(
      Page,
      { size: "A4", style: styles.page, wrap: true },

      // Header
      createElement(
        View,
        { style: styles.header },
        createElement(Text, { style: styles.title }, "Laporan Logbook Magang"),
        createElement(Text, { style: styles.subtitle }, "Dinas Kesehatan Kota Makassar"),
        createElement(
          Text,
          { style: styles.datePrinted },
          `Dicetak pada ${formatDate(new Date().toISOString())}`
        )
      ),

      // Info intern (Clean monochome profile grid)
      createElement(
        View,
        { style: styles.infoSection },
        createElement(
          View,
          { style: styles.infoCol },
          createElement(Text, { style: styles.infoLabel }, "Nama"),
          createElement(Text, { style: styles.infoValue }, `: ${intern.name}`)
        ),
        createElement(
          View,
          { style: styles.infoCol },
          createElement(Text, { style: styles.infoLabel }, "Universitas"),
          createElement(Text, { style: styles.infoValue }, `: ${intern.profile?.university ?? "-"}`)
        ),
        createElement(
          View,
          { style: styles.infoCol },
          createElement(Text, { style: styles.infoLabel }, "Jurusan"),
          createElement(Text, { style: styles.infoValue }, `: ${intern.profile?.major ?? "-"}`)
        ),
        createElement(
          View,
          { style: styles.infoCol },
          createElement(Text, { style: styles.infoLabel }, "Periode Magang"),
          createElement(
            Text,
            { style: styles.infoValue },
            intern.profile?.start_date && intern.profile?.end_date
              ? `: ${formatDate(intern.profile.start_date)} — ${formatDate(intern.profile.end_date)}`
              : ": -"
          )
        )
      ),

      // Section title
      createElement(
        Text,
        { style: styles.sectionTitle },
        `Daftar Kegiatan (${logbooks.length} entri)`
      ),

      // Table of logbook entries (Word/Docs style clean monochrome grid table)
      createElement(
        View,
        { style: styles.table },
        // Table Header
        createElement(
          View,
          { style: styles.tableHeader },
          createElement(Text, { style: styles.tableColHeaderNo }, "No"),
          createElement(Text, { style: styles.tableColHeaderDate }, "Tanggal"),
          createElement(Text, { style: styles.tableColHeaderDesc }, "Deskripsi Kegiatan"),
          createElement(Text, { style: styles.tableColHeaderDoc }, "Dokumentasi")
        ),
        // Table Rows
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

      // Footer — fixed on every page
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

/**
 * Generate logbook PDF and return as ArrayBuffer.
 * ArrayBuffer is directly compatible with Web API Response (BodyInit),
 * unlike Node.js Buffer which causes TypeScript errors in strict mode.
 */
export async function generateLogbookPDF(data: LogbookPDFProps): Promise<ArrayBuffer> {
  const doc = createElement(LogbookDocument, data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(doc as any)
  // Copy into a fresh ArrayBuffer to ensure Web API compatibility.
  // This avoids SharedArrayBuffer union and guarantees BodyInit-compatible type.
  const bytes = new Uint8Array(buffer)
  return bytes.buffer as ArrayBuffer
}