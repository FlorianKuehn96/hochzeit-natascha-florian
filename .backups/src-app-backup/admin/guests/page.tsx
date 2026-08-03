'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Plus, Trash2, Copy, CheckCircle, Clock, X, Users } from 'lucide-react'
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
          <h1 className="text-2xl font-bold text-gray-900">Guest Management</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus />
            Add Guest
          </button>
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
              <span className="p-2 rounded-full bg-sage-green/20 text-sage-green">
                <CheckCircle className="w-6 h-6" />
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Absagen</p>
                <p className="text-3xl font-bold text-forest-dark mt-2">{stats.declined}</p>
              </div>
              <span className="p-2 rounded-full bg-red-100 text-red-700">
                <X className="w-6 h-6" />
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Gesamtgäste</p>
                <p className="text-3xl font-bold text-forest-dark mt-2">{stats.total}</p>
              </div>
              <span className="p-2 rounded-full bg-gray-200 text-gray-600">
                <Users className="w-6 h-6" />
              </span>
            </div>
          </div>
        </div>

        {/* Button to show add guest form */}
        <div className="text-right mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-6 py-3 bg-forest-dark text-white rounded-lg hover:bg-forest-light transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showAddForm ? 'Abbrechen' : 'Neuen Gast hinzufügen'}
          </button>
        </div>

        {/* Add Guest Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddGuest}
            className="bg-white rounded-xl p-8 border border-gray-200 mb-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="md:col-span-1">
              <label htmlFor="guest-name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="guest-name"
                value={newGuest.name}
                onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-forest-dark focus:border-forest-dark"
                placeholder="Max Mustermann"
              />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="guest-email" className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail
              </label>
              <input
                type="email"
                id="guest-email"
                value={newGuest.email}
                onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-forest-dark focus:border-forest-dark"
                placeholder="max.mustermann@example.com"
              />
            </div>
            <div className="md:col-span-1 flex items-end gap-3">
              <div className="flex-grow">
                <label htmlFor="guest-code" className="block text-sm font-medium text-gray-700 mb-1">
                  Code (optional)
                </label>
                <input
                  type="text"
                  id="guest-code"
                  value={newGuest.code}
                  onChange={(e) => setNewGuest({ ...newGuest, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-forest-dark focus:border-forest-dark"
                  placeholder="ABCDEF"
                  maxLength={6}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
                  setNewGuest({ ...newGuest, code: randomCode })
                }}
                className="px-4 py-2 bg-sage-green text-white rounded-lg hover:bg-sage-dark transition-colors"
              >
                Zufall
              </button>
            </div>

            <div className="md:col-span-3 text-right">
              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
              <button
                type="submit"
                className="px-8 py-3 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Speichern...' : 'Gast hinzufügen'}
              </button>
            </div>
          </form>
        )}

        {/* Guest List Table */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 overflow-x-auto">
          <h2 className="font-serif text-2xl text-forest-dark mb-6">Gästeliste</h2>
          {isLoading && <p>Lade Gästeliste...</p>}
          {error && <p className="text-red-500">Fehler: {error}</p>}
          {!isLoading && !error && guests.length === 0 && (
            <p>Noch keine Gäste vorhanden. Füge deine ersten Gäste hinzu!</p>
          )}
          {!isLoading && !error && guests.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RSVP Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anzahl
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {guests.map((guest) => (
                  <tr key={guest.code}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{guest.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guest.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold flex items-center gap-2">
                      {guest.code}
                      {copiedCode === guest.code ? (
                        <CheckCircle className="w-4 h-4 text-sage-green" />
                      ) : (
                        <button onClick={() => copyCode(guest.code)} className="text-gray-400 hover:text-gray-700">
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {guest.rsvp.status === 'attending' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                          {guest.rsvp.status}
                        </span>
                      )}
                      {guest.rsvp.status === 'declined' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 capitalize">
                          {guest.rsvp.status}
                        </span>
                      )}
                      {guest.rsvp.status === 'pending' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 capitalize">
                          {guest.rsvp.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guest.rsvp.guests || 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-3">
                      <button
                        onClick={() => handleDeleteGuest(guest.code)}
                        className="text-red-600 hover:text-red-900"
                        title="Gast löschen"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
