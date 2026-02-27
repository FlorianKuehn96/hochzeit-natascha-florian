'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, Heart, Shield, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const navItems = [
  { name: 'Unsere Geschichte', href: '#geschichte' },
  { name: 'Location', href: '#location' },
  { name: 'Galerie', href: '#galerie' },
  { name: 'Geschenke', href: '#geschenke' },
  { name: 'Zusage', href: '#rsvp' },
]

export default function Navigation() {
  const router = useRouter()
  const { logout, isAdmin, isAuthenticated, session } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-warm-cream/95 backdrop-blur-md shadow-md py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <Heart 
              className={`w-6 h-6 transition-colors duration-300 ${
                isScrolled ? 'text-terracotta' : 'text-white'
              } group-hover:scale-110`} 
              fill="currentColor"
            />
            <span 
              className={`font-serif text-lg font-medium transition-colors duration-300 ${
                isScrolled ? 'text-forest-dark' : 'text-white'
              }`}
            >
              N & F
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-all duration-300 hover:opacity-70 ${
                  isScrolled ? 'text-forest-dark' : 'text-white'
                }`}
              >
                {item.name}
              </a>
            ))}

            {/* Admin Buttons */}
            {isAdmin && (
              <>
                <button
                  onClick={() => router.push('/admin')}
                  className="flex items-center gap-2 px-4 py-2 bg-sage-green/20 text-white text-sm font-medium rounded-full hover:bg-sage-green/30 transition-all duration-300"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
                <button
                  onClick={() => router.push('/admin/change-password')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 text-sm font-medium rounded-full hover:bg-blue-200 transition-all duration-300"
                >
                  <Settings className="w-4 h-4" />
                  Passwort
                </button>
              </>
            )}

            {/* Logout (für eingeloggte User) / RSVP (für Gäste) */}
            {session ? (
              isAdmin ? (
                // Admin: Prominenter Logout mit Icon
                <button
                  onClick={() => {
                    logout()
                    router.push('/login')
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-full hover:bg-red-200 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              ) : (
                // Gast: Dezenter Logout als Text-Link
                <button
                  onClick={() => {
                    logout()
                    router.push('/login')
                  }}
                  className={`text-sm font-medium transition-all duration-300 hover:opacity-70 underline-offset-4 hover:underline ${
                    isScrolled ? 'text-forest-dark/70 hover:text-forest-dark' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Ausloggen
                </button>
              )
            ) : (
              <a
                href="#rsvp"
                className="px-6 py-2 bg-terracotta text-white text-sm font-medium rounded-full hover:bg-burnt-orange transition-all duration-300 hover:shadow-lg"
              >
                Zusagen
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 transition-colors duration-300 ${
              isScrolled ? 'text-forest-dark' : 'text-white'
            }`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-forest-dark/95 backdrop-blur-lg md:hidden transition-all duration-500 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8 pt-20">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-warm-cream text-2xl font-serif hover:text-terracotta transition-colors duration-300"
            >
              {item.name}
            </a>
          ))}
          {/* Admin Buttons Mobile */}
          {isAdmin && (
            <>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  router.push('/admin')
                }}
                className="flex items-center gap-2 px-6 py-3 bg-sage-green/20 text-white rounded-full hover:bg-sage-green/30 transition-all"
              >
                <Shield className="w-5 h-5" />
                Admin
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  router.push('/admin/change-password')
                }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-all"
              >
                <Settings className="w-5 h-5" />
                Passwort
              </button>
            </>
          )}

          {/* Logout / RSVP Mobile */}
          {session ? (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                logout()
                router.push('/login')
              }}
              className="flex items-center gap-2 px-8 py-3 bg-red-100 text-red-600 font-medium rounded-full hover:bg-red-200 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          ) : (
            <a
              href="#rsvp"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-4 px-8 py-3 bg-terracotta text-white font-medium rounded-full hover:bg-burnt-orange transition-all duration-300"
            >
              Zusagen
            </a>
          )}
        </div>
      </div>
    </>
  )
}
