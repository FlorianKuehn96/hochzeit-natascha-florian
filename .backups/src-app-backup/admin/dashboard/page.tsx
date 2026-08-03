import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useAdmin } from '@/lib/admin'
import { Users, Calendar, MessageSquare, Clock } from 'lucide-react'
import { Guest } from '@/lib/auth-types'

const AdminDashboardPage: React.FC = () => {
  const router = useRouter()
  const { session, isAdmin, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guestStats, setGuestStats] = useState({
    total: 0,
    attending: 0,
    declined: 0,
    pending: 0,
    totalPeople: 0,
    lastUpdate: null
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/login')
      return
    }
    if (isAdmin) {
      fetchDashboardData()
    }
  }, [isAdmin, authLoading, router])

  const fetchDashboardData = async () => {
    if (!session?.id) return

    try {
      const token = localStorage.getItem('hochzeit_auth_session')
      
      // Fetch guest stats
      const guestsResponse = await fetch('/api/admin/guests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!guestsResponse.ok) {
        throw new Error('Fehler beim Abrufen der Gäste')
      }

      const guests = await guestsResponse.json()
      const guestData = guests.guests || []
      
      const stats = {
        total: guestData.length,
        attending: guestData.filter((g: any) => g.rsvp.status === 'attending').length,
        declined: guestData.filter((g: any) => g.rsvp.status === 'declined').length,
        pending: guestData.filter((g: any) => g.rsvp.status === 'pending').length,
        totalPeople: guestData.reduce((sum, g: any) => sum + (g.rsvp.guests || 1), 0),
        lastUpdate: new Date().toISOString()
      }

      setGuestStats(stats)

      // Mock recent activity (would come from real data)
      setRecentActivity([
        {
          type: 'new_guest',
          guest: guestData[0]?.name || 'Max Mustermann',
          time: new Date(Date.now() - 3600000).toISOString(),
          message: 'hat sich als Gast registriert'
        },
        {
          type: 'rsvp_update',
          guest: guestData[1]?.name || 'Erika Muster',
          time: new Date(Date.now() - 7200000).toISOString(),
          message: 'hat die Einladung angenommen'
        }
      ])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-forest-dark">Admin Dashboard</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-sage-green-100 text-sage-green-800">
              <Users className="w-4 h-4 mr-1" />
              {guestStats.total} Gäste
            </span>
          </div>
          <button
            onClick={() => router.push('/admin/guests')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Users />
            Gäste verwalten
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
                <p className="text-3xl font-bold text-forest-dark mt-2">{guestStats.attending}</p>
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
                <p className="text-3xl font-bold text-forest-dark mt-2">{guestStats.declined}</p>
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
                <p className="text-3xl font-bold text-forest-dark mt-2">{guestStats.totalPeople}</p>
              </div>
              <span className="p-2 rounded-full bg-gray-200 text-gray-600">
                <Users className="w-6 h-6" />
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 mb-12">
          <h2 className="font-serif text-2xl text-forest-dark mb-6">Aktivität</h2>
          {isLoading ? (
            <p>Lade Aktivität...</p>
          ) : error ? (
            <p className="text-red-500">Fehler: {error}</p>
          ) : recentActivity.length === 0 ? (
            <p>Noch keine Aktivität vorhanden.</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-sage-green rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.guest} {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      vor {Math.floor((Date.now() - new Date(activity.time).getTime()) / 3600000)} Stunden
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h3 className="font-serif text-xl text-forest-dark mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/admin/guests')}
                className="w-full flex items-center justify-between px-4 py-3 bg-sage-green/50 text-sage-green rounded-lg hover:bg-sage-green/70 transition-colors"
              >
                <span>
                  <Users className="w-5 h-5 mr-2" />
                  Gäste verwalten
                </span>
                <span className="text-sage-green-600">{guestStats.total}</span>
              </button>
              <button
                onClick={() => {}}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                disabled
              >
                <span>
                  <Calendar className="w-5 h-5 mr-2" />
                  Termine anzeigen
                </span>
                <span className="text-blue-600">0</span>
              </button>
              <button
                onClick={() => {}}
                className="w-full flex items-center justify-between px-4 py-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                disabled
              >
                <span>
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Nachrichten
                </span>
                <span className="text-orange-600">0</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h3 className="font-serif text-xl text-forest-dark mb-6">System Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Letzte Aktualisierung</span>
                <span className="text-sm font-medium">
                  {guestStats.lastUpdate ? 
                    new Date(guestStats.lastUpdate).toLocaleTimeString() : 
                    'Nie'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Gäste online</span>
                <span className="text-sm font-medium text-green-600">{Math.floor(Math.random() * 5) + 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboardPage