'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Users, BarChart3, Settings, LogOut } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const { session, isAdmin, isLoading, logout } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/login')
    }
  }, [isAdmin, isLoading, router])

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
          <h1 className="font-serif text-2xl text-forest-dark">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
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
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Zusagen</p>
                <p className="text-3xl font-bold text-forest-dark mt-2">0</p>
              </div>
              <BarChart3 className="w-10 h-10 text-sage-green opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Absagen</p>
                <p className="text-3xl font-bold text-forest-dark mt-2">0</p>
              </div>
              <BarChart3 className="w-10 h-10 text-terracotta opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Gesamtgäste</p>
                <p className="text-3xl font-bold text-forest-dark mt-2">0</p>
              </div>
              <Users className="w-10 h-10 text-deep-green opacity-50" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 flex">
            <button className="flex-1 px-6 py-4 text-left font-medium text-forest-dark bg-gray-50 border-b-2 border-terracotta">
              <Users className="w-4 h-4 inline mr-2" />
              Gästeliste
            </button>
            <button className="flex-1 px-6 py-4 text-left font-medium text-gray-600 hover:bg-gray-50">
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Statistiken
            </button>
            <button className="flex-1 px-6 py-4 text-left font-medium text-gray-600 hover:bg-gray-50">
              <Settings className="w-4 h-4 inline mr-2" />
              Einstellungen
            </button>
          </div>

          {/* Guest List Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">E-Mail</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Personen</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">Max Mustermann</td>
                  <td className="px-6 py-4 text-sm">max@example.de</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">NAT0001</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 bg-sage-green/20 text-sage-green rounded-full text-xs">Zusage</span>
                  </td>
                  <td className="px-6 py-4 text-sm">2</td>
                </tr>
              </tbody>
            </table>
            {/* Empty State */}
            <div className="text-center py-12 text-gray-500">
              <p>Keine Gäste vorhanden</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
