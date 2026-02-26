'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { LogIn, Mail, Lock, Code } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [loginType, setLoginType] = useState<'guest' | 'admin'>('guest')

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // TODO: Call /api/auth/guest endpoint
      const response = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        throw new Error('Ungültiger Code')
      }

      const data = await response.json()
      localStorage.setItem('hochzeit_auth_session', data.token)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login fehlgeschlagen')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // TODO: Call /api/auth/admin endpoint
      const response = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('E-Mail oder Passwort falsch')
      }

      const data = await response.json()
      localStorage.setItem('hochzeit_auth_session', data.token)
      router.push('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login fehlgeschlagen')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-dark to-deep-green flex items-center justify-center">
        <p className="text-white">Wird geladen...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark to-deep-green flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-terracotta/20 rounded-full flex items-center justify-center">
              <LogIn className="w-8 h-8 text-terracotta" />
            </div>
          </div>
          <h1 className="font-serif text-4xl text-white mb-2">Natascha & Florian</h1>
          <p className="text-sand/60">19. September 2026</p>
        </div>

        {/* Login Type Selector */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setLoginType('guest')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
              loginType === 'guest'
                ? 'bg-terracotta text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Gast
          </button>
          <button
            onClick={() => setLoginType('admin')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
              loginType === 'admin'
                ? 'bg-terracotta text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          {loginType === 'guest' ? (
            <form onSubmit={handleGuestLogin} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-white mb-2">
                  <Code className="w-4 h-4 inline mr-2" />
                  Gast-Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="z.B. NAT0001"
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none transition-all"
                  required
                />
                <p className="text-xs text-sand/60 mt-2">
                  Du hast deinen Code per E-Mail bekommen
                </p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-terracotta text-white rounded-xl font-medium hover:bg-burnt-orange disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isSubmitting ? 'Wird geladen...' : 'Anmelden'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  E-Mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hochzeit.de"
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Passwort
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none transition-all"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-terracotta text-white rounded-xl font-medium hover:bg-burnt-orange disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isSubmitting ? 'Wird geladen...' : 'Admin Login'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sand/40 text-xs">
            Fragen? Kontaktiere uns: info@natascha-florian-hochzeit.de
          </p>
        </div>
      </div>
    </div>
  )
}
