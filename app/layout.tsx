import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Thời khóa biểu & Danh sách học sinh",
  description: "Trang quản lý thời khóa biểu và danh sách theo lớp/môn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${spaceGrotesk.variable} ${fraunces.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ color: "var(--ink)" }}>
        <header
          className="sticky top-0 z-20 border-b backdrop-blur"
          style={{
            borderColor: "var(--stroke)",
            background: "color-mix(in srgb, var(--surface) 80%, transparent)",
          }}
        >
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/tkb" className="group flex items-center gap-3">
              <span
                className="font-display grid h-11 w-11 place-items-center rounded-2xl text-lg shadow-[0_16px_30px_var(--accent-soft)] transition duration-300 group-hover:-translate-y-0.5"
                style={{ background: "var(--accent)", color: "var(--surface)" }}
              >
                TK
              </span>
              <div className="leading-tight">
                <p className="text-lg font-semibold tracking-tight">
                  TKB Ôn tốt nghiệp
                </p>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Lịch học và danh sách theo yêu cầu
                </p>
              </div>
            </Link>
            <nav className="flex items-center gap-2 text-sm font-semibold">
              <Link
                href="/tkb"
                className="rounded-full border px-4 py-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_var(--shadow)]"
                style={{ borderColor: "var(--stroke)", background: "var(--surface)", color: "var(--ink)" }}
              >
                Thời khóa biểu
              </Link>
              <Link
                href="/ds"
                className="rounded-full border px-4 py-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_var(--shadow)]"
                style={{ borderColor: "var(--stroke)", background: "var(--surface)", color: "var(--ink)" }}
              >
                Danh sách
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-16 pt-10">
          {children}
        </main>
        <footer className="border-t" style={{ borderColor: "var(--stroke)", background: "color-mix(in srgb, var(--surface) 60%, transparent)" }}>
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-sm sm:flex-row sm:items-center sm:justify-between" style={{ color: "var(--muted)" }}>
            <span>Cập nhật 28/04/2026</span>
            <span>Bản quyền thuộc về Minh Luân 12A3</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
