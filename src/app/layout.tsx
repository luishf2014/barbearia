import type { Metadata } from "next"
import { Inter, Oswald } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/Navbar"

const inter = Inter({
  subsets: ["latin"],
})

const oswald = Oswald({
  subsets: ["latin"],
  variable: '--font-oswald',
})

export const metadata: Metadata = {
  title: "Camisa 10 Barbearia - Sistema de Agendamento",
  description: "A melhor barbearia da cidade - Agendamento online",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} ${oswald.variable} antialiased`}>
        <Navbar />
        <main className="min-h-screen bg-slate-900">
          {children}
        </main>
      </body>
    </html>
  )
}
