import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/navigation/navbar";
import { MobileNav } from "@/components/navigation/mobile-nav";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#FAF8F5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Our Little Moments 🤍 | Jurnal Kenangan Bersama",
  description: "Ruang kecil pribadi untuk setiap momen yang tak ingin kita lupakan. Cerita kecil, petualangan sederhana, dan kenangan indah bersama.",
  keywords: ["digital diary", "jurnal kenangan", "our little moments", "album foto digital", "catatan berdua"],
  openGraph: {
    title: "Our Little Moments 🤍",
    description: "A little space for the moments we never want to forget.",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630 }],
    locale: "id_ID",
    type: "website",
  },
};

import { PageTransition } from "@/components/ui/page-transition";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${playfair.variable} ${dmSans.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-[#302B29] selection:bg-[#CFA6A3]/30 selection:text-[#302B29]">
        <ThemeProvider>
          <AuthProvider>
            <AuthGuard>
              <ToastProvider>
                <Suspense fallback={null}>
                  <Navbar />
                </Suspense>
                <main className="flex-1 pb-28 lg:pb-8 flex flex-col">
                  <Suspense fallback={<div className="p-8 text-center text-xs text-[#8D817B]">Memuat...</div>}>
                    <PageTransition>{children}</PageTransition>
                  </Suspense>
                </main>
                <Suspense fallback={null}>
                  <MobileNav />
                </Suspense>
              </ToastProvider>
            </AuthGuard>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


