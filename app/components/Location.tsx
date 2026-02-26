'use client'

import { MapPin, Clock, Car, Train, Heart, Sparkles, Users, Bed } from 'lucide-react'

export default function Location() {
  return (
    <section id="location" className="py-24 px-6 bg-deep-green text-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sand text-sm uppercase tracking-[0.2em] mb-4">
            Der Ort
          </p>
          <h2 className="font-serif text-4xl md:text-5xl">
            Weingut Baron Knyphausen
          </h2>
          <div className="w-20 h-1 bg-terracotta mx-auto mt-6 rounded-full" />
          <p className="text-sand/80 mt-6 text-lg">
            Eltville am Rhein
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Info Card */}
          <div className="bg-forest-dark/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <h3 className="font-serif text-2xl mb-6">Ablauf des Tages</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-terracotta/20 rounded-xl">
                  <Clock className="w-5 h-5 text-terracotta" />
                </div>
                <div>
                  <p className="font-medium text-lg">14:00 Uhr</p>
                  <p className="text-sand/70">Begrüßung & Ankunft</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-terracotta/20 rounded-xl">
                  <Heart className="w-5 h-5 text-terracotta" />
                </div>
                <div>
                  <p className="font-medium text-lg">15:00 Uhr</p>
                  <p className="text-sand/70">Trauung</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-terracotta/20 rounded-xl">
                  <Sparkles className="w-5 h-5 text-terracotta" />
                </div>
                <div>
                  <p className="font-medium text-lg">Anschließend</p>
                  <p className="text-sand/70">Sektempfang, Dinner & Party</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <h4 className="font-medium mb-4">Dresscode</h4>
              <p className="text-sand/70">Schick - wir freuen uns auf eure schönsten Outfits!</p>
            </div>
          </div>

          {/* Map & Directions + Accommodation */}
          <div className="space-y-6">
            <div className="bg-forest-dark/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <h3 className="font-serif text-2xl mb-6">Anfahrt</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Car className="w-5 h-5 text-sand mt-1" />
                  <p className="text-sand/80 text-sm">
                    Mit dem Auto: A66 Ausfahrt Eltville, dann ca. 10 Minuten zum Weingut. Parkplätze sind vorhanden.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Train className="w-5 h-5 text-sand mt-1" />
                  <p className="text-sand/80 text-sm">
                    Mit der Bahn: Bahnhof Eltville, dann Taxi oder 20 Minuten Fußweg.
                  </p>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=Weingut+Baron+Knyphausen+Eltville"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-terracotta rounded-full 
                           hover:bg-burnt-orange transition-colors duration-300"
              >
                <MapPin className="w-4 h-4" />
                <span>Google Maps öffnen</span>
              </a>
            </div>

            {/* Updated Accommodation Info */}
            <div className="bg-terracotta/20 backdrop-blur-sm rounded-3xl p-8 border border-terracotta/30">
              <div className="flex items-center gap-3 mb-4">
                <Bed className="w-6 h-6 text-sand" />
                <h4 className="font-serif text-xl">Übernachtung</h4>
              </div>
              <p className="text-sand/80 text-sm mb-4">
                Für alle Gäste haben wir Zimmer reserviert – direkt in der Location oder 15-20 Minuten Fußweg entfernt.
              </p>
              <p className="text-sand text-sm">
                Bitte gebt uns Bescheid, falls ihr <strong>keinen</strong> Schlafplatz benötigt.
              </p>
            </div>
          </div>
        </div>

        {/* Best Man / Maid of Honor Section */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <h3 className="font-serif text-3xl mb-2">Trauzeugen</h3>
            <p className="text-sand/70">Bei Fragen stehen euch unsere Trauzeugen gerne zur Verfügung</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
              <div className="w-16 h-16 bg-terracotta/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-serif text-2xl mb-1">Frederike</h4>
              <p className="text-sand/70 text-sm mb-3">Trauzeugin von Natascha</p>
              <a 
                href="mailto:frederike@natascha-florian-hochzeit.de" 
                className="text-terracotta hover:text-burnt-orange transition-colors text-sm"
              >
                frederike@natascha-florian-hochzeit.de
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
              <div className="w-16 h-16 bg-terracotta/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-serif text-2xl mb-1">Robert</h4>
              <p className="text-sand/70 text-sm mb-3">Trauzeuge von Florian</p>
              <a 
                href="mailto:robert@natascha-florian-hochzeit.de" 
                className="text-terracotta hover:text-burnt-orange transition-colors text-sm"
              >
                robert@natascha-florian-hochzeit.de
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
