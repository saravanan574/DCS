import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Toaster } from "@/components/ui/toaster"
import { PlaceHolderImages } from '@/lib/placeholder-images'

export const metadata: Metadata = {
  title: 'Donor Connect',
  description: 'Join the Movement to Save Lives.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const feature = PlaceHolderImages.find(p => p.id === "bg")

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`font-body antialiased `}>
      <div className="relative flex min-h-screen flex-col bg-background/100 backdrop-blur-100 ">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  )
}
