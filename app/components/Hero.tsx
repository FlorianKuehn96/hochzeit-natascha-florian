'use client'

import { useState, useEffect } from 'react'

export default function Hero() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const weddingDate = new Date('2026-09-19T15:00:00')

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const distance = weddingDate.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/hero-new.jpg?v=2')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-forest-dark/50 via-forest-dark/30 to-forest-dark/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="text-sand text-sm md:text-base uppercase tracking-[0.3em] mb-6 animate-fade-in-up">
          Wir heiraten
        </p>
        
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Natascha
          <span className="block text-terracotta italic text-4xl md:text-6xl lg:text-7xl my-2">&</span>
          Florian
        </h1>

        <p className="text-warm-cream text-lg md:text-xl font-light mb-2 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          19. September 2026
        </p>
        <p className="text-sand/90 text-base md:text-lg mb-8 animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
          Weingut Baron Knyphausen · Eltville
        </p>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-3 md:gap-6 mt-10 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          {[
            { value: timeLeft.days, label: 'Tage' },
            { value: timeLeft.hours, label: 'Std' },
            { value: timeLeft.minutes, label: 'Min' },
            { value: timeLeft.seconds, label: 'Sek' },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 md:p-5 border border-white/20">
                <span className="block font-serif text-xl md:text-3xl lg:text-4xl text-white mb-1">
                  {String(item.value).padStart(2, '0')}
                </span>
                <span className="text-sand text-xs md:text-sm uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <a
            href="#rsvp"
            className="px-8 py-4 bg-terracotta text-white text-center rounded-full font-medium 
                       transition-all duration-300 hover:bg-burnt-orange 
                       hover:shadow-lg hover:shadow-terracotta/30"
          >
            Zusage bis 15. Juli
          </a>
          <a
            href="#geschichte"
            className="px-8 py-4 border-2 border-white/80 text-white text-center rounded-full font-medium 
                       transition-all duration-300 hover:bg-white/10"
          >
            Unsere Geschichte
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/80 rounded-full mt-2" />
        </div>
      </div>
    </section>
  )
}
