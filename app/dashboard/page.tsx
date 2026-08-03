'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Navigation from '@/app/components/Navigation'
import Hero from '@/app/components/Hero'
import Story from '@/app/components/Story'
import Location from '@/app/components/Location'
import Gallery from '@/app/components/Gallery'
import Gifts from '@/app/components/Gifts'
import RSVP from '@/app/components/RSVP'
import Footer from '@/app/components/Footer'
import { LogOut, Utensils } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { session, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Wird geladen...</p>
      </div>
    )
  }

  return (
    <main>
      {/* Header mit Logout */}
      <header className="fixed top-0 right-0 z-50 p-4">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      {/* Website Components */}
      <Navigation />
      <Hero />
      <Story />
      <Location />
      <Gallery />
      <Gifts />
      <RSVP />
      <Footer />

      {/* Meal Selection Link — only for guests who accepted */}
      {session.role === 'guest' && (
        <div className="fixed bottom-4 right-4 z-40">
          <a
            href="/meal"
            className="flex items-center gap-2 px-5 py-3 bg-forest-dark text-white rounded-2xl shadow-lg hover:bg-forest-light transition-colors text-sm font-medium"
          >
            <Utensils className="w-4 h-4" />
            Hauptgang wählen
          </a>
        </div>
      )}

      {/* Session Info */}
      <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-md p-4 text-sm text-gray-600">
        <p>👤 Angemeldet als: <strong>{session.name || session.email}</strong></p>
      </div>
    </main>
  )
}
