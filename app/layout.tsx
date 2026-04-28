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
  title: "TKB & Danh sach hoc sinh",
  description: "Trang quan ly thoi khoa bieu va danh sach theo lop/mon.",
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
            <Link href="/" className="group flex items-center gap-3">
              <span
                className="font-display grid h-11 w-11 place-items-center rounded-2xl text-lg shadow-[0_16px_30px_var(--accent-soft)] transition duration-300 group-hover:-translate-y-0.5"
                style={{ background: "var(--accent)", color: "var(--surface)" }}
              >
                TK
              </span>
              <div className="leading-tight">
                <p className="text-lg font-semibold tracking-tight">
                  TKB on tot nghiep
                </p>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Lich hoc va danh sach theo yeu cau
                </p>
              </div>
            </Link>
            <nav className="flex items-center gap-2 text-sm font-semibold">
              <Link
                href="/"
                className="rounded-full border border-transparent px-4 py-2 transition"
                style={{ color: "var(--muted)" }}
              >
                Trang chu
              </Link>
              <Link
                href="/tkb"
                className="rounded-full border px-4 py-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_var(--shadow)]"
                style={{ borderColor: "var(--stroke)", background: "var(--surface)", color: "var(--ink)" }}
              >
                TKB
              </Link>
              <Link
                href="/ds"
                className="rounded-full border px-4 py-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_var(--shadow)]"
                style={{ borderColor: "var(--stroke)", background: "var(--surface)", color: "var(--ink)" }}
              >
                Danh sach
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-16 pt-10">
          {children}
        </main>
        <footer className="border-t" style={{ borderColor: "var(--stroke)", background: "color-mix(in srgb, var(--surface) 60%, transparent)" }}>
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-sm sm:flex-row sm:items-center sm:justify-between" style={{ color: "var(--muted)" }}>
            <span>Cap nhat 28/04/2026</span>
            <span>Trung tam dieu phoi lich hoc on thi</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
