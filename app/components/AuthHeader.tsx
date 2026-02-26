'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { LogOut, Shield, Settings } from 'lucide-react'

export default function AuthHeader() {
  const router = useRouter()
  const { logout, isAdmin, isAuthenticated, session } = useAuth()

  if (!isAuthenticated || !session) {
    return null
  }

  return (
    <div className="fixed top-0 right-0 z-40 p-4">
      <div className="flex items-center gap-3 bg-white rounded-lg shadow-md p-3">
        {/* User Info */}
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-forest-dark">{session.name || session.email}</p>
          <p className="text-xs text-gray-500">{isAdmin ? 'Admin' : 'Gast'}</p>
        </div>

        {/* Admin Button */}
        {isAdmin && (
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 px-3 py-2 bg-sage-green/20 text-sage-green rounded-lg hover:bg-sage-green/30 transition-colors text-sm font-medium"
            title="Admin Dashboard"
          >
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}

        {/* Change Password */}
        {isAdmin && (
          <button
            onClick={() => router.push('/admin/change-password')}
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            title="Passwort ändern"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Passwort</span>
          </button>
        )}

        {/* Logout */}
        <button
          onClick={() => {
            logout()
            router.push('/login')
          }}
          className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  )
}
