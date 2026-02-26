'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface GalleryImage {
  src: string
  alt: string
  width: number
  height: number
}

const finlandImages: GalleryImage[] = [
  { src: '/images/finland/file_1---bb33ebb4-4853-4b15-8edf-853deebecbf8.jpg', alt: 'Eisbaden in Finnland', width: 800, height: 600 },
  { src: '/images/finland/file_2---83a52282-46c2-4858-bc02-4f6a1888152a.jpg', alt: 'Winter in Finnland', width: 800, height: 600 },
  { src: '/images/finland/file_3---d0c6869d-6af2-4d93-9c76-c9a5cbae418f.jpg', alt: 'Schneelandschaft', width: 800, height: 600 },
  { src: '/images/finland/file_4---be7a4a84-e089-4b4a-98ac-7013dc9f56c2.jpg', alt: 'Natur in Finnland', width: 800, height: 600 },
  { src: '/images/finland/file_5---5b0da028-691f-40a9-aba3-ffe4a023567f.jpg', alt: 'Abenteuer', width: 800, height: 600 },
  { src: '/images/finland/file_6---4619b15c-c0b2-496f-a55d-81b2f0f105e7.jpg', alt: 'Winterabenteuer', width: 800, height: 600 },
  { src: '/images/finland/file_7---a9cc166a-f607-4497-9897-94124f047e3b.jpg', alt: 'Gemeinsam unterwegs', width: 800, height: 600 },
  { src: '/images/finland/file_8---af459372-213c-4b11-8583-3d49789009e7.jpg', alt: 'Entdeckungen', width: 800, height: 600 },
  { src: '/images/finland/file_11---da27aeb2-1019-4592-b86d-9595acd58608.jpg', alt: 'Schlittenhunde', width: 800, height: 600 },
  { src: '/images/finland/file_12---7349c444-067e-4bd1-83d7-babaff624eb0.jpg', alt: 'Husky', width: 800, height: 600 },
  { src: '/images/finland/file_13---3eeb6ba8-f87c-435c-beac-2dce8473a953.jpg', alt: 'Winterwunderland', width: 800, height: 600 },
  { src: '/images/finland/file_15---64a38c60-4156-4a12-ab67-dbcefb2d6d85.jpg', alt: 'Rentier', width: 800, height: 600 },
  { src: '/images/finland/file_16---6b41d565-8a45-437a-bd4a-9da55a87402c.jpg', alt: 'Nordlichter', width: 800, height: 600 },
  { src: '/images/hero-kanada.jpg', alt: 'Der Antrag in Kanada', width: 800, height: 600 },
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
      setSelectedImage(selectedImage === 0 ? finlandImages.length - 1 : selectedImage - 1)
    }
  }

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === finlandImages.length - 1 ? 0 : selectedImage + 1)
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (selectedImage === null) return
    if (e.key === 'ArrowLeft') goToPrevious(e as any)
    if (e.key === 'ArrowRight') goToNext(e as any)
    if (e.key === 'Escape') closeLightbox()
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
            Von St. Tropez über Südostasien bis nach Neuseeland, Kanada und Finnland — 
            wir lieben es, die Welt zu entdecken.
          </p>
        </div>

        {/* Image Grid with Next Image */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {finlandImages.map((image, index) => (
            <div
              key={index}
              className={`relative aspect-square overflow-hidden rounded-2xl cursor-pointer group ${
                index === 0 || index === 5 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
              onClick={() => openLightbox(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openLightbox(index)}
              aria-label={`Öffne Galerie: ${image.alt}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                <p className="text-white text-sm p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                  {image.alt}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Video Section */}
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
            aria-label="YouTube Kanal öffnen"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>@naturnomaden auf YouTube</span>
          </a>
        </div>
      </div>

      {/* Lightbox with Keyboard Support */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="Galerie Lightbox"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Schließen"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={goToPrevious}
            className="absolute left-4 p-2 text-white/80 hover:text-white transition-colors hidden md:block"
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <Image
            src={finlandImages[selectedImage].src}
            alt={finlandImages[selectedImage].alt}
            width={1200}
            height={900}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            priority
          />

          <button
            onClick={goToNext}
            className="absolute right-4 p-2 text-white/80 hover:text-white transition-colors hidden md:block"
            aria-label="Nächstes Bild"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg">
            {selectedImage + 1} / {finlandImages.length}
          </p>
        </div>
      )}
    </section>
  )
}
