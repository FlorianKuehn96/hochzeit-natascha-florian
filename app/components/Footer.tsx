'use client'

import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="py-12 px-6 bg-forest-dark text-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="font-serif text-2xl">Natascha</span>
          <span className="text-terracotta">&</span>
          <span className="font-serif text-2xl">Florian</span>
        </div>
        
        <p className="text-sand/60 mb-2">19. September 2026</p>
        <p className="text-sand/40 text-sm mb-8">Weingut Baron Knyphausen · Eltville</p>

        <div className="flex items-center justify-center gap-2 text-sand/40 text-sm">
          <span>Made with</span>
          <Heart className="w-4 h-4 text-terracotta" fill="currentColor" />
          <span>for our wedding</span>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <p className="text-sand/30 text-xs">
            Fragen? info@natascha-florian-hochzeit.de
          </p>
        </div>
      </div>
    </footer>
  )
}
