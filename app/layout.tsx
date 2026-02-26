import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from '@/lib/auth-context'
import AuthHeader from './components/AuthHeader'

export const metadata: Metadata = {
  title: 'Natascha & Florian | 19. September 2026',
  description: 'Wir heiraten! Alle Informationen zu unserer Hochzeit am Weingut Baron Knyphausen in Eltville.',
  keywords: ['Hochzeit', 'Natascha', 'Florian', 'Eltville', 'Baron Knyphausen', '19. September 2026'],
  openGraph: {
    title: 'Natascha & Florian | 19. September 2026',
    description: 'Wir heiraten! Save the Date - 19. September 2026',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <AuthHeader />
          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
