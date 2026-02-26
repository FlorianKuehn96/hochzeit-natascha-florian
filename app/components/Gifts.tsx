'use client'

import { Gift, Wallet, Heart } from 'lucide-react'

export default function Gifts() {
  return (
    <section id="geschenke" className="py-24 px-6 bg-warm-cream">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-terracotta text-sm uppercase tracking-[0.2em] mb-4">
            Geschenke
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-forest-dark">
            Euer Besuch ist das schönste Geschenk
          </h2>
          <div className="w-20 h-1 bg-terracotta mx-auto mt-6 rounded-full" />
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
            Wir freuen uns darauf, diesen besonderen Tag mit euch zu feiern. 
            Falls ihr dennoch etwas beitragen möchtet, haben wir zwei Wünsche:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-sand hover:shadow-lg transition-shadow duration-300">
            <div className="w-16 h-16 bg-sage-green/20 rounded-2xl flex items-center justify-center mb-6">
              <Gift className="w-8 h-8 text-sage-green" />
            </div>
            <h3 className="font-serif text-2xl text-forest-dark mb-4">Flitterwochen</h3>
            <p className="text-gray-600">
              Wir träumen von neuen Abenteuern! Ein Beitrag zu unseren Flitterwochen 
              wäre ein wunderbares Geschenk für gemeinsame Erinnerungen.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-sand hover:shadow-lg transition-shadow duration-300">
            <div className="w-16 h-16 bg-terracotta/20 rounded-2xl flex items-center justify-center mb-6">
              <Wallet className="w-8 h-8 text-terracotta" />
            </div>
            <h3 className="font-serif text-2xl text-forest-dark mb-4">Camperkasse</h3>
            <p className="text-gray-600">
              Auch ein Beitrag für unseren nächsten Roadtrip mit dem Camper würde 
              uns riesig freuen und neue Abenteuer ermöglichen!
            </p>
          </div>
        </div>

        <div className="mt-12 text-center bg-gradient-to-br from-deep-green to-forest-dark rounded-3xl p-8 text-white">
          <Heart className="w-8 h-8 text-terracotta mx-auto mb-4" />
          <h3 className="font-serif text-xl mb-4">Danke für eure Liebe & Unterstützung</h3>
          <p className="text-sand/80 max-w-lg mx-auto">
            Egal, wofür ihr euch entscheidet – am wichtigsten ist, dass wir diesen Tag gemeinsam mit euch feiern dürfen!
          </p>
        </div>
      </div>
    </section>
  )
}
