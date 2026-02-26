'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Plus, Trash2, Copy, CheckCircle, Clock, X } from 'lucide-react'
import { Guest } from '@/lib/auth-types'

export default function GuestManagementPage() {
  const router = useRouter()
  const { session, isAdmin } = useAuth()
  const [guests, setGuests] = useState<Guest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGuest, setNewGuest] = useState({ name: '', email: '', code: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      router.push('/login')
      return
    }
    fetchGuests()
  }, [isAdmin, router])

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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="font-serif text-2xl text-forest-dark">Gästeverwaltung</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-gray-600 text-sm">Gesamtgäste</p>
            <p className="text-3xl font-bold text-forest-dark mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-gray-600 text-sm">Zusagen</p>
            <p className="text-3xl font-bold text-sage-green mt-2">{stats.attending}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-gray-600 text-sm">Ausstehend</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-gray-600 text-sm">Personen gesamt</p>
            <p className="text-3xl font-bold text-deep-green mt-2">{stats.totalPeople}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Add Guest Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-6 py-3 bg-terracotta text-white rounded-xl hover:bg-burnt-orange transition-colors"
          >
            <Plus className="w-5 h-5" />
            Neuer Gast
          </button>
        </div>

        {/* Add Guest Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
            <h2 className="font-serif text-xl text-forest-dark mb-6">Neuen Gast hinzufügen</h2>
            <form onSubmit={handleAddGuest} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newGuest.name}
                    onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                    placeholder="Max Mustermann"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    value={newGuest.email}
                    onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                    placeholder="max@example.de"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code (optional)
                  </label>
                  <input
                    type="text"
                    value={newGuest.code}
                    onChange={(e) => setNewGuest({ ...newGuest, code: e.target.value })}
                    placeholder="Auto-generiert"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-terracotta text-white rounded-lg hover:bg-burnt-orange disabled:bg-gray-400 transition-colors"
                >
                  {isSubmitting ? 'Wird gespeichert...' : 'Speichern'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Guest List Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Wird geladen...</p>
          </div>
        ) : guests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
            <p className="text-gray-500">Keine Gäste vorhanden. Füge deine erste Gast hinzu!</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">E-Mail</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Personen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <tr key={guest.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{guest.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{guest.email}</td>
                    <td className="px-6 py-4 text-sm font-mono">
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded">{guest.code}</code>
                        <button
                          onClick={() => copyCode(guest.code)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Kopieren"
                        >
                          {copiedCode === guest.code ? (
                            <CheckCircle className="w-4 h-4 text-sage-green" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {guest.rsvp.status === 'attending' && (
                        <span className="px-3 py-1 bg-sage-green/20 text-sage-green rounded-full text-xs flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" /> Zusage
                        </span>
                      )}
                      {guest.rsvp.status === 'declined' && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1 w-fit">
                          <X className="w-3 h-3" /> Absage
                        </span>
                      )}
                      {guest.rsvp.status === 'pending' && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" /> Ausstehend
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">{guest.rsvp.guests || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDeleteGuest(guest.code)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
