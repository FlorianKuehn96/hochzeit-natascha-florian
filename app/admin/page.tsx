'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Users, CircleCheckBig, X, Clock, LogOut, Bed, Utensils, MessageSquare, ArrowLeft } from 'lucide-react'

interface Guest {
  code: string
  name: string
  email: string
  rsvp: {
    status: 'attending' | 'declined' | 'pending'
    guests: number
    accommodation: 'needed' | 'not_needed'
    dietary?: string
    message?: string
    submittedAt?: string
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const { session, isAdmin, isLoading, logout } = useAuth()
  const [guests, setGuests] = useState<Guest[]>([])
  const [isLoadingGuests, setIsLoadingGuests] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/login')
    }
  }, [isAdmin, isLoading, router])

  useEffect(() => {
    if (isAdmin) {
      fetchGuests()
    }
  }, [isAdmin])

  const fetchGuests = async () => {
    try {
      setIsLoadingGuests(true)
      const response = await fetch('/api/admin/guests', {
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Gästeliste')
      }
      const data = await response.json()
      setGuests(data.guests || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
    } finally {
      setIsLoadingGuests(false)
    }
  }

  const stats = {
    total: guests.length,
    attending: guests.filter(g => g.rsvp.status === 'attending').length,
    declined: guests.filter(g => g.rsvp.status === 'declined').length,
    pending: guests.filter(g => g.rsvp.status === 'pending').length,
    totalPeople: guests.filter(g => g.rsvp.status === 'attending').reduce((sum, g) => sum + (g.rsvp.guests || 1), 0),
    needAccommodation: guests.filter(g => g.rsvp.status === 'attending' && g.rsvp.accommodation === 'needed').length,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'attending':
        return <CircleCheckBig className="w-4 h-4 text-green-600" />
      case 'declined':
        return <X className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'attending':
        return { text: 'Zusage', class: 'bg-green-100 text-green-800' }
      case 'declined':
        return { text: 'Absage', class: 'bg-red-100 text-red-800' }
      default:
        return { text: 'Ausstehend', class: 'bg-yellow-100 text-yellow-800' }
    }
  }

  // NEU: Logik für Übernachtung-Anzeige
  const getAccommodationDisplay = (guest: Guest) => {
    // Nur bei Zusage ein Haken
    if (guest.rsvp.status === 'attending') {
      return guest.rsvp.accommodation === 'needed' 
        ? <span className="text-blue-600">✓</span>
        : <span className="text-gray-300">-</span>
    }
    // Bei Absage ein X, bei Ausstehend ein -
    return guest.rsvp.status === 'declined' 
      ? <span className="text-gray-400">✕</span>
      : <span className="text-gray-400">-</span>
  }

  if (!session || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Laden...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 text-forest-dark hover:bg-forest-dark/10 rounded-lg transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zur Website
            </button>
            <h1 className="font-serif text-2xl text-forest-dark">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/guests"
              className="flex items-center gap-2 px-4 py-2 text-forest-dark hover:bg-forest-dark/10 rounded-lg transition-colors text-sm font-medium"
            >
              <Users className="w-4 h-4" />
              Gäste verwalten
            </a>
            <a
              href="/admin/change-password"
              className="flex items-center gap-2 px-4 py-2 text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors text-sm font-medium"
            >
              🔐 Passwort ändern
            </a>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-5 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Zusagen</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.attending}</p>
              </div>
              <CircleCheckBig className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Absagen</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.declined}</p>
              </div>
              <X className="w-10 h-10 text-red-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ausstehend</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Gesamtgäste</p>
                <p className="text-3xl font-bold text-forest-dark mt-2">{stats.totalPeople}</p>
              </div>
              <Users className="w-10 h-10 text-deep-green opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Übernachtung</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.needAccommodation}</p>
              </div>
              <Bed className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Guest List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="font-serif text-xl text-forest-dark flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gästeliste
            </h2>
            <a href="/admin/guests" className="text-sm text-forest-dark hover:text-terracotta transition-colors">
              Alle verwalten →
            </a>
          </div>

          <div className="overflow-x-auto">
            {isLoadingGuests ? (
              <div className="text-center py-12 text-gray-500">
                <p>Lade Gästeliste...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <p>Fehler: {error}</p>
              </div>
            ) : guests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Keine Gäste vorhanden</p>
                <a href="/admin/guests" className="mt-4 inline-block text-forest-dark hover:text-terracotta">
                  Gäste hinzufügen →
                </a>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Personen</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      <Bed className="w-4 h-4 inline" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {guests.map((guest) => {
                    const statusBadge = getStatusBadge(guest.rsvp.status)
                    return (
                      <tr key={guest.code} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {guest.name}
                          <div className="text-xs text-gray-500">{guest.email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{guest.code}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
                            {getStatusIcon(guest.rsvp.status)}
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{guest.rsvp.guests || 1}</td>
                        {/* GEÄNDERT: Neue Logik für Übernachtung */}
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {getAccommodationDisplay(guest)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => setSelectedGuest(guest)}
                            className="text-forest-dark hover:text-terracotta transition-colors"
                          >
                            Anzeigen →
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Guest Detail Modal */}
        {selectedGuest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-serif text-xl text-forest-dark">Gastdetails</h3>
                <button
                  onClick={() => setSelectedGuest(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Name</label>
                  <p className="text-gray-900 font-medium">{selectedGuest.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">E-Mail</label>
                  <p className="text-gray-900">{selectedGuest.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Code</label>
                  <p className="text-gray-900 font-mono">{selectedGuest.code}</p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                    <p className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      selectedGuest.rsvp.status === 'attending' ? 'bg-green-100 text-green-800' :
                      selectedGuest.rsvp.status === 'declined' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getStatusIcon(selectedGuest.rsvp.status)}
                      {selectedGuest.rsvp.status === 'attending' ? 'Zusage' :
                       selectedGuest.rsvp.status === 'declined' ? 'Absage' : 'Ausstehend'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Personen</label>
                    <p className="text-gray-900">{selectedGuest.rsvp.guests || 1}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                    <Bed className="w-3 h-3" /> Unterkunft
                  </label>
                  <p className="text-gray-900">
                    {selectedGuest.rsvp.accommodation === 'needed' ? 'Benötigt' : 'Nicht benötigt'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                    <Utensils className="w-3 h-3" /> Essenswünsche / Allergien
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 min-h-[60px]">
                    {selectedGuest.rsvp.dietary || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Nachricht
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 min-h-[60px]">
                    {selectedGuest.rsvp.message || '-'}
                  </p>
                </div>
                {selectedGuest.rsvp.submittedAt && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Zusage am</label>
                    <p className="text-gray-600 text-sm">
                      {new Date(selectedGuest.rsvp.submittedAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setSelectedGuest(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
