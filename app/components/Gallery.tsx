'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

const galleryImages = [
  { src: '/images/saint-tropez/saint-tropez-1.jpg', alt: 'Erster gemeinsamer Urlaub in Saint-Tropez' },
  { src: '/images/schweden/schweden-1.jpg', alt: 'Erster Camper-Urlaub in Schweden' },
  { src: '/images/berge/gipfel-1.jpg', alt: 'Nataschas erster Gipfel' },
  { src: '/images/berge/berge-3.jpg', alt: 'Donnerkogel – unser steilster Berg' },
  { src: '/images/berge/berge-4.jpg', alt: 'Endlich der eigene Camper' },
  { src: '/images/berge/berge-5.jpg', alt: 'Mit dem eigenen Camper im Süden Italiens' },
  { src: '/images/angeln/angeln-2.jpg', alt: 'Natascha begeistert am Angeln' },
  { src: '/images/comer-see/packraft-1.jpg', alt: 'Erste Packraft-Tour am Comer See' },
  { src: '/images/norwegen/norwegen-1.jpg', alt: 'Norwegen' },
  { src: '/images/norwegen/norwegen-2.jpg', alt: 'An der Küste von Å – vom Winde verweht' },
    { src: '/images/norwegen/norwegen-4.jpg', alt: 'Norwegen' },
  { src: '/images/angeln/angeln-1.jpg', alt: 'Nataschas erster großer Wildfisch' },
  { src: '/images/suedostasien/suedostasien-1.jpg', alt: 'Unsere erste große Reise – Südostasien' },
  { src: '/images/thailand/thailand-2.jpg', alt: 'Kajak fahren in Thailand' },
  { src: '/images/neuseeland/neuseeland-9.jpg', alt: 'Tongariro – zweite große Reise beginnt' },
  { src: '/images/neuseeland/neuseeland-1.jpg', alt: 'Schiffswrack Rarotonga erkunden' },
  { src: '/images/neuseeland/neuseeland-2.jpg', alt: 'Cook Islands – Sonne, Strand & Meer' },
  { src: '/images/neuseeland/neuseeland-3.jpg', alt: 'Kajak auf dem Meer in Neuseeland' },
  { src: '/images/neuseeland/neuseeland-4.jpg', alt: 'Hobbiton' },
  { src: '/images/neuseeland/neuseeland-5.jpg', alt: 'Hobbiton' },
  { src: '/images/neuseeland/neuseeland-6.jpg', alt: 'Südspitze Neuseelands – so weit weg wie noch nie' },
  { src: '/images/neuseeland/neuseeland-7.jpg', alt: 'Rotorua – die Kraft der Erde spüren' },
  { src: '/images/costa-rica/costa-rica-1.jpg', alt: 'Baden im Dschungel Costa Ricas' },
  { src: '/images/rom/rom-1.jpg', alt: 'Kulturausflug ins Colosseum' },
  { src: '/images/finland/snowmobile-1.jpg', alt: 'Schneemobil-Tour durch die Wildnis Finnisch-Lapplands' },
  { src: '/images/finland/husky-tour.jpg', alt: 'Mit den Huskys über Nacht in die Wildnis Finnlands' },
  { src: '/images/finland/nordlichter.jpg', alt: 'Nordlichter in Finnland' },
  { src: '/images/finland/finland-abschied.jpg', alt: 'Abschied von Finnisch-Lappland' },
  { src: '/images/kanada/kanada-1.jpg', alt: 'Auf Grizzlytour in Kanada' },
  { src: '/images/kanada/kanada-2.jpg', alt: 'In der Wildnis Kanadas' },
  { src: '/images/hero-kanada.jpg?v=3', alt: 'Der Antrag in Kanada' },
]

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const openLightbox = (index: number) => {
    setSelectedImage(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? galleryImages.length - 1 : selectedImage - 1)
    }
  }

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === galleryImages.length - 1 ? 0 : selectedImage + 1)
    }
  }

  return (
    <section id="galerie" className="py-24 px-6 bg-sand/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-terracotta text-sm uppercase tracking-[0.2em] mb-4">
            Erinnerungen
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-forest-dark">
            Unsere Abenteuer
          </h2>
          <div className="w-20 h-1 bg-terracotta mx-auto mt-6 rounded-full" />
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
            Von St. Tropez über Schweden und Norwegen bis nach Südostasien, Neuseeland und Kanada — 
            wir lieben es, die Welt zu entdecken.
          </p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className={`relative aspect-square overflow-hidden rounded-2xl cursor-pointer group ${
                index === 0 || index === 15 || index === 27 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                <p className="text-white text-sm p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                  {image.alt}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Video Section Placeholder */}
        <div className="mt-16 text-center">
          <h3 className="font-serif text-2xl text-forest-dark mb-4">Unsere Videos</h3>
          <p className="text-gray-600 mb-6">
            Mehr von unseren Reisen findet ihr auf unserem YouTube-Kanal
          </p>
          <a
            href="https://youtube.com/@naturnomaden"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full 
                       hover:bg-red-700 transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>@naturnomaden auf YouTube</span>
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={goToPrevious}
            className="absolute left-4 p-2 text-white/80 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <img
            src={galleryImages[selectedImage].src}
            alt={galleryImages[selectedImage].alt}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={goToNext}
            className="absolute right-4 p-2 text-white/80 hover:text-white transition-colors"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg">
            {galleryImages[selectedImage].alt}
          </p>
        </div>
      )}
    </section>
  )
}