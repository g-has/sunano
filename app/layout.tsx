import type { Metadata } from "next"
import { Manrope, Space_Grotesk } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"

import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "Sunano Tierlist",
  description: "Tier list de perifericos com filtros intuitivos",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
