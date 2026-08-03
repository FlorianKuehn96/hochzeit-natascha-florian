'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Users, BarChart3, Settings, LogOut, CheckCircle, X, Clock, Download, ArrowLeft } from 'lucide-react'
import { Guest } from '@/lib/auth-types'

export default function AdminDashboard() {
  const router = useRouter()
  const { session, isAdmin, isLoading, logout } = useAuth()
  const [guests, setGuests] = useState<Guest[]>([])
  const [loadingGuests, setLoadingGuests] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/login')
    }
    if (isAdmin) {
      fetchGuests()
    }
  }, [isAdmin, isLoading, router])

  const fetchGuests = async () => {
    try {
      const res = await fetch('/api/admin/guests', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setGuests(data.guests || [])
      }
    } catch (e) {
      console.error('Error fetching guests:', e)
    } finally {
      setLoadingGuests(false)
    }
  }

  const attending = guests.filter(g => g.rsvp?.status === 'attending')
  const declined = guests.filter(g => g.rsvp?.status === 'declined')
  const pending = guests.filter(g => g.rsvp?.status === 'pending' || !g.rsvp?.status)
  const totalPersons = attending.reduce((sum, g) => sum + (g.rsvp?.guests || 1), 0)

  const exportCSV = () => {
    const headers = ['Name', 'E-Mail', 'Code', 'Status', 'Personen', 'Unterkunft', 'Ernährung', 'Nachricht', 'Eingereicht am']
    const rows = guests.map(g => [
      g.name,
      g.email,
      g.code,
      g.rsvp?.status || 'pending',
      g.rsvp?.guests || 1,
      g.rsvp?.accommodation === 'needed' ? 'Ja' : g.rsvp?.accommodation === 'not-needed' ? 'Nein' : '',
      g.rsvp?.dietary || '',
      (g.rsvp?.message || '').replace(/"/g, '""'),
      g.rsvp?.submittedAt ? new Date(g.rsvp.submittedAt).toLocaleDateString('de-DE') : '',
    ])
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gaeste-export.csv'
    a.click()
    URL.revokeObjectURL(url)
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Zurück zur Seite
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
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Zusagen</p>
                <p className="text-3xl font-bold text-forest-dark mt-2">{attending.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-sage-green opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Absagen</p>
                <p className="text-3xl font-bold text-forest-dark mt-2">{declined.length}</p>
              </div>
              <X className="w-10 h-10 text-terracotta opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ausstehend</p>
                <p className="text-3xl font-bold text-forest-dark mt-2">{pending.length}</p>
              </div>
              <Clock className="w-10 h-10 text-gray-400 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Gesamt (Personen)</p>
                <p className="text-3xl font-bold text-forest-dark mt-2">{totalPersons}</p>
              </div>
              <Users className="w-10 h-10 text-deep-green opacity-50" />
            </div>
          </div>
        </div>

        {/* Guest List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 flex items-center justify-between">
            <div className="flex">
              <div className="px-6 py-4 font-medium text-forest-dark bg-gray-50 border-b-2 border-terracotta">
                <Users className="w-4 h-4 inline mr-2" />
                Gästeliste
              </div>
            </div>
            <div className="px-6">
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-sage-green text-white rounded-lg hover:bg-sage-green/90 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                CSV-Export
              </button>
            </div>
          </div>

          {/* Guest Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">E-Mail</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Personen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Unterkunft</th>
                </tr>
              </thead>
              <tbody>
                {loadingGuests ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Lädt...</td>
                  </tr>
                ) : guests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Keine Gäste vorhanden</td>
                  </tr>
                ) : (
                  guests.map((guest) => (
                    <tr key={guest.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{guest.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{guest.email}</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{guest.code}</td>
                      <td className="px-6 py-4 text-sm">
                        {guest.rsvp?.status === 'attending' && (
                          <span className="px-3 py-1 bg-sage-green/20 text-sage-green rounded-full text-xs">Zusage</span>
                        )}
                        {guest.rsvp?.status === 'declined' && (
                          <span className="px-3 py-1 bg-terracotta/20 text-terracotta rounded-full text-xs">Absage</span>
                        )}
                        {(!guest.rsvp?.status || guest.rsvp?.status === 'pending') && (
                          <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">Ausstehend</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">{guest.rsvp?.guests || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        {guest.rsvp?.accommodation === 'needed' ? 'Ja' : guest.rsvp?.accommodation === 'not-needed' ? 'Nein' : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}