import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WPI',
  description: 'Pay with web 3 wallet',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-background text-color3 flex h-screen w-screen flex-col items-center overflow-x-hidden overflow-y-scroll`}
      >
        {children}
      </body>
    </html>
  )
}
