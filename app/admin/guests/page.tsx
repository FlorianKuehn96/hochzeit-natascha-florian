'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Plus, Trash2, Copy, CheckCircle, Clock, X, Download, Users } from 'lucide-react'
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

  const handleExportCSV = () => {
    const headers = [
      'Name',
      'E-Mail',
      'Code',
      'Status',
      'Personen',
      'Unterkunft',
      'Ernährung',
      'Nachricht',
      'Eingereicht am',
    ]

    const escapeCSV = (value: string | number | undefined | null) => {
      if (value === undefined || value === null) return ''
      const str = String(value)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const statusLabel = (status: string) => {
      switch (status) {
        case 'attending': return 'Zusage'
        case 'declined': return 'Absage'
        default: return 'Ausstehend'
      }
    }

    const accomLabel = (acc?: string) => {
      switch (acc) {
        case 'needed': return 'Benötigt'
        case 'not-needed': return 'Nicht benötigt'
        default: return '-'
      }
    }

    const rows = guests.map((g) => [
      escapeCSV(g.name),
      escapeCSV(g.email),
      escapeCSV(g.code),
      escapeCSV(statusLabel(g.rsvp.status)),
      escapeCSV(g.rsvp.guests),
      escapeCSV(accomLabel(g.rsvp.accommodation)),
      escapeCSV(g.rsvp.dietary),
      escapeCSV(g.rsvp.message),
      escapeCSV(g.rsvp.submittedAt ? new Date(g.rsvp.submittedAt).toLocaleString('de-DE') : '-'),
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `gaesteliste-hochzeit-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const stats = {
    total: guests.length,
    attending: guests.filter((g) => g.rsvp.status === 'attending').length,
    declined: guests.filter((g) => g.rsvp.status === 'declined').length,
    pending: guests.filter((g) => g.rsvp.status === 'pending').length,
    totalPeople: guests.reduce((sum, g) => sum + (g.rsvp.guests || 1), 0),
    attendingPeople: guests
      .filter((g) => g.rsvp.status === 'attending')
      .reduce((sum, g) => sum + (g.rsvp.guests || 1), 0),
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
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-gray-600 text-sm">Gesamtgäste</p>
            <p className="text-3xl font-bold text-forest-dark mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-gray-600 text-sm">Zusagen</p>
            <p className="text-3xl font-bold text-sage-green mt-2">{stats.attending}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-gray-600 text-sm">Absagen</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.declined}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-gray-600 text-sm">Ausstehend</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-gray-600 text-sm">Personen (zugesagt)</p>
            <p className="text-3xl font-bold text-deep-green mt-2">{stats.attendingPeople}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8 flex gap-3 flex-wrap">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-6 py-3 bg-terracotta text-white rounded-xl hover:bg-burnt-orange transition-colors"
          >
            <Plus className="w-5 h-5" />
            Neuer Gast
          </button>
          <button
            onClick={handleExportCSV}
            disabled={guests.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-forest-dark text-white rounded-xl hover:bg-forest-green disabled:bg-gray-400 transition-colors"
          >
            <Download className="w-5 h-5" />
            CSV-Export
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
            <p className="text-gray-500">Keine Gäste vorhanden. Füge deinen ersten Gast hinzu!</p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Unterkunft</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ernährung</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nachricht</th>
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
                      {guest.rsvp.accommodation === 'needed' && (
                        <span className="text-blue-600">✓ Benötigt</span>
                      )}
                      {guest.rsvp.accommodation === 'not-needed' && (
                        <span className="text-gray-500">Nicht benötigt</span>
                      )}
                      {!guest.rsvp.accommodation && <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {guest.rsvp.dietary || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      {guest.rsvp.message ? (
                        <span className="italic" title={guest.rsvp.message}>
                          {guest.rsvp.message.length > 50
                            ? `${guest.rsvp.message.slice(0, 50)}...`
                            : guest.rsvp.message}
                        </span>
                      ) : '-'}
                    </td>
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