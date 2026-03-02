import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { OrientationGuard } from "@/components/orientation-guard"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: 'WojakCoin Wallet',
  description: 'A secure, self-custodial WojakCoin (WJK) wallet with transaction management, UTXO control, and Electrs API integration.',
}

export const viewport: Viewport = {
  themeColor: '#0f1318',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} data-form-type="other">
      <body className="font-sans antialiased">
        <OrientationGuard />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
