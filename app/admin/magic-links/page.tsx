'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ArrowLeft, Copy, Check, Link as LinkIcon, Mail, Search } from 'lucide-react'

interface MagicLink {
  code: string
  name: string
  email: string
  rsvpStatus: string
  guests: number
  magicLink: string
}

export default function MagicLinksPage() {
  const router = useRouter()
  const { isAdmin, isAuthenticated, isLoading: authLoading } = useAuth()
  const [links, setLinks] = useState<MagicLink[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
    if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/')
    }
  }, [authLoading, isAuthenticated, isAdmin, router])

  useEffect(() => {
    if (isAdmin) fetchLinks()
  }, [isAdmin])

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/admin/magic-links', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setLinks(data.links)
      }
    } catch (err) {
      console.error('Error fetching magic links:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyLink = async (link: string, code: string) => {
    try {
      await navigator.clipboard.writeText(link)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const filtered = links.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  )

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-forest-dark border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2 text-gray-600 hover:text-forest-dark mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Admin
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-forest-dark mb-2 flex items-center gap-3">
            <LinkIcon className="w-7 h-7" />
            Magic Links
          </h1>
          <p className="text-gray-600">
            Persönliche Links für alle Gäste. Jeder Link loggt den Gast automatisch ein und leitet auf die Startseite.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Suche nach Name, E-Mail oder Code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-forest-dark focus:outline-none"
          />
        </div>

        {/* Links list */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filtered.map(guest => (
              <div key={guest.code} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                {/* Status badge */}
                <div className="flex-shrink-0">
                  {guest.rsvpStatus === 'attending' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Zugesagt
                    </span>
                  ) : guest.rsvpStatus === 'declined' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      Abgesagt
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      Ausstehend
                    </span>
                  )}
                </div>

                {/* Guest info */}
                <div className="flex-grow min-w-0">
                  <p className="font-medium text-gray-900 truncate">{guest.name}</p>
                  <p className="text-sm text-gray-500 truncate">{guest.email || 'Keine E-Mail'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Code: {guest.code} · {guest.guests} {guest.guests === 1 ? 'Person' : 'Personen'}
                  </p>
                </div>

                {/* Magic link + copy */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <code className="hidden sm:block text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg max-w-[280px] truncate">
                    {guest.magicLink}
                  </code>
                  <button
                    onClick={() => copyLink(guest.magicLink, guest.code)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      copiedCode === guest.code
                        ? 'bg-green-100 text-green-700'
                        : 'bg-forest-dark text-white hover:bg-forest-light'
                    }`}
                  >
                    {copiedCode === guest.code ? (
                      <>
                        <Check className="w-4 h-4" />
                        Kopiert!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Kopieren
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Keine Gäste gefunden.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-sm text-gray-500 flex items-center justify-between">
          <span>{filtered.length} von {links.length} Gästen</span>
          <span className="flex items-center gap-1">
            <Mail className="w-4 h-4" />
            Links können per E-Mail verschickt werden
          </span>
        </div>
      </div>
    </div>
  )
}