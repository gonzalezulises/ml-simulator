import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SiteHeader } from "@/components/layout/site-header"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ML Simulator — Simulador Interactivo de Machine Learning",
  description:
    "Aprende Machine Learning de forma interactiva: perceptrón, árboles de decisión, random forest, regresión logística y NLP con simulaciones en tiempo real.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <TooltipProvider>
          <SiteHeader />
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}
