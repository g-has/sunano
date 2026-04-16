import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TopBar } from "@/components/layout/TopBar"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "Sunano | Tierlist de Perifericos",
  description: "A tierlist definitiva de perifericos gamers. Compare mouses, teclados, headsets e mais com filtros avancados e reviews detalhadas.",
  keywords: ["tierlist", "perifericos", "mouse", "teclado", "headset", "gaming", "review"],
}

export const viewport: Viewport = {
  themeColor: "#0a0d14",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <TopBar />
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </body>
    </html>
  )
}
