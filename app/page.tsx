'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import Story from './components/Story'
import Location from './components/Location'
import Gallery from './components/Gallery'
import Gifts from './components/Gifts'
import RSVP from './components/RSVP'
import Footer from './components/Footer'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Wird geladen...</p>
      </div>
    )
  }

  // Redirect in progress
  if (!isAuthenticated) {
    return null
  }

  return (
    <main>
      <Navigation />
      <Hero />
      <Story />
      <Location />
      <Gallery />
      <Gifts />
      <RSVP />
      <Footer />
    </main>
  )
}
