'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Plus, Trash2, Copy, CheckCircle, Clock, X } from 'lucide-react'
import { Guest } from '@/lib/auth-types'

export default function GuestManagementPage() {
  const router = useRouter()
  const { session, isAdmin, isLoading: authLoading } = useAuth()
  const [guests, setGuests] = useState<Guest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGuest, setNewGuest] = useState({ name: '', email: '', code: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/login')
      return
    }
    if (isAdmin) {
      fetchGuests()
    }
  }, [isAdmin, authLoading, router])

  const fetchGuests = async () => {
    if (!session?.id) return

    try {
      const token = localStorage.getItem('hochzeit_auth_session')
      const response = await fetch('/api/admin/guests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Gästeliste')
      }

      const data = await response.json()
      setGuests(data.guests)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('hochzeit_auth_session')
      const response = await fetch('/api/admin/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newGuest.name,
          email: newGuest.email,
          code: newGuest.code || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Gast konnte nicht erstellt werden')
      }

      const data = await response.json()
      setGuests([data.guest, ...guests])
      setNewGuest({ name: '', email: '', code: '' })
      setShowAddForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteGuest = async (code: string) => {
    if (!confirm(`Möchtest du diesen Gast wirklich löschen?`)) return

    try {
      const token = localStorage.getItem('hochzeit_auth_session')
      const response = await fetch('/api/admin/guests', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        throw new Error('Gast konnte nicht gelöscht werden')
      }

      setGuests(guests.filter((g) => g.code !== code))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const stats = {
    total: guests.length,
    attending: guests.filter((g) => g.rsvp.status === 'attending').length,
    declined: guests.filter((g) => g.rsvp.status === 'declined').length,
    pending: guests.filter((g) => g.rsvp.status === 'pending').length,
    totalPeople: guests.reduce((sum, g) => sum + (g.rsvp.guests || 1), 0),
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="font-serif text-2xl text-forest-dark">Gästeverwaltung</h1>
          <div className="flex items-center gap-3">
            <a
              href="/admin/change-password"
              className="flex items-center gap-2 px-4 py-2 text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors text-sm font-medium"
            >
              🔐 Passwort ändern
            </a>
            <button
              onClick={() => location.reload()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Aktualisieren
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Zusagen</p>
                <p className="text-3xl font-bold text-forest-dark mt-2">{stats.attending}</p>
              </div>
              <span className="p-2 rounded-full bg-sage-green/20 text-sage-green"><CheckCircle className="w-6 h-6"/></span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Absagen</p>
                <p className="text-3xl font-bold text-forest-dark mt-2">{stats.declined}</p>
              </div>
              <span className="p-2 rounded-full bg-red-100 text-red-700"><X className="w-6 h-6"/></span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Gesamtgäste</p>
                <p className="text-3xl font-bold text-forest-dark mt-2">{stats.total}</p>
              </div>
              <span className="p-2 rounded-full bg-gray-200 text-gray-600"><Users className="w-6 h-6"/></span>
            </div>
          </div>