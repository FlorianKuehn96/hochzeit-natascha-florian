'use client'

import { useEffect, useRef, useState } from 'react'
import { Heart, Plane, Tent, Sparkles, Music, Home, Mountain, Camera, MapPin } from 'lucide-react'

interface StoryEvent {
  date: string
  title: string
  description: string
  icon: React.ReactNode
  highlight?: boolean
}

const storyEvents: StoryEvent[] = [
  {
    date: 'Mai 2018',
    title: 'Das Colos, Aschaffenburg',
    description: 'Es begann in einem Moment purer Lebensfreude. Natascha und Florian lernten sich beim Feiern auf der „Big Easy" kennen. Zuerst war Natascha geschockt – vier Jahre Altersunterschied? Aber als sie Florians WhatsApp-Profilbild sah, wollte sie ihm erst einmal die Hölle heiß machen. Ein unwiderstehlicher Funke war entfacht.',
    icon: <Music className="w-6 h-6" />,
  },
  {
    date: '20. Mai 2018',
    title: 'Der Beginn',
    description: 'Zwei Herzen fanden zueinander. An diesem Tag begann eine gemeinsame Reise, die alles verändern sollte.',
    icon: <Heart className="w-6 h-6" />,
  },
  {
    date: 'August 2018',
    title: 'St. Tropez',
    description: 'Ihr erster gemeinsamer Urlaub führte sie an die Côte d\'Azur – begleitet von Nataschas Eltern. Ein erster Vorgeschmack auf das Abenteuer, das ihr gemeinsames Leben werden würde.',
    icon: <Plane className="w-6 h-6" />,
  },
  {
    date: 'September 2018',
    title: 'Ein Zuhause für zwei',
    description: 'Im September zog Florian zu Natascha. Ein neuer Lebensabschnitt begann – mit allen Höhen und Tiefen, die eine gemeinsame Zukunft mit sich bringt.',
    icon: <Home className="w-6 h-6" />,
  },
  {
    date: 'Januar 2019',
    title: 'Drei Monate Südostasien',
    description: 'Viele bezweifelten dieses Unterfangen. Natascha war es gewöhnt, im Luxus zu verreisen – nun stand ein Backpacking-Trip durch Südostasien bevor. Doch was folgte, übertraf alle Erwartungen.',
    icon: <MapPin className="w-6 h-6" />,
    highlight: true,
  },
  {
    date: '2019',
    title: 'Neuanfang in Frankfurt',
    description: 'Zurück in Deutschland zogen Natascha und Florian nach Frankfurt. Sie begann bei Jaguar Land Rover, er sein Studium. Eine neue Ära begann.',
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    date: 'Die Corona-Zeit',
    title: 'Die Entdeckung des Campings',
    description: 'Als die Welt stillstand, fanden sie sich neu. Norwegen und Österreich wurden ihre Zufluchtsorte – beim Angeln und Wandern verliebten sie sich tiefer ineinander.',
    icon: <Tent className="w-6 h-6" />,
    highlight: true,
  },
  {
    date: '2024',
    title: 'Neuseeland',
    description: 'Drei Monate lang tourten sie mit ihrem Camper durch Neuseeland. Ein Abenteuer, das ihre Sehnsucht nach mehr weckte.',
    icon: <Mountain className="w-6 h-6" />,
    highlight: true,
  },
  {
    date: '6. September 2025',
    title: 'Mount Robson, Kanada',
    description: 'Am 6. September 2025, am Mount Robson in Kanada, umgeben von türkisfarbenen Gletscherseen, fragte Florian Natascha die entscheidende Frage. Sie sagte Ja.',
    icon: <Camera className="w-6 h-6" />,
    highlight: true,
  },
  {
    date: '19. September 2026',
    title: 'Ein neues Kapitel beginnt',
    description: 'Nach acht Jahren voller Abenteuer werden Natascha und Florian auf dem Weingut Baron Knyphausen den nächsten großen Schritt wagen.',
    icon: <Heart className="w-6 h-6" />,
    highlight: true,
  },
]

export default function Story() {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute('data-index'))
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, index]))
          }
        })
      },
      { threshold: 0.15, rootMargin: '-50px' }
    )

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section id="geschichte" className="py-24 px-6 bg-warm-cream">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-terracotta text-sm uppercase tracking-[0.2em] mb-4">
            Unsere Reise
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-forest-dark">
            Von Aschaffenburg in die Welt
          </h2>
          <div className="w-20 h-1 bg-terracotta mx-auto mt-6 rounded-full" />
        </div>

        <div className="relative">
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-sage-green/30 md:-translate-x-1/2" />

          <div className="space-y-12">
            {storyEvents.map((event, index) => {
              const isLeft = index % 2 === 0
              const isVisible = visibleItems.has(index)

              return (
                <div
                  key={index}
                  data-index={index}
                  ref={(el) => { itemRefs.current[index] = el }}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  <div
                    className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10 flex items-center justify-center w-16 h-16 rounded-full shadow-lg ${
                      event.highlight ? 'bg-terracotta text-white' : 'bg-white text-deep-green'
                    }`}
                  >
                    {event.icon}
                  </div>

                  <div
                    className={`pl-24 md:pl-0 md:w-[45%] ${
                      isLeft ? 'md:pr-12 md:text-right md:ml-auto md:mr-[55%]' : 'md:pl-12 md:ml-[55%]'
                    }`}
                  >
                    <div className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 ${
                      event.highlight ? 'border-l-4 border-terracotta' : ''
                    }`}>
                      <p className="text-terracotta text-sm font-medium mb-2">{event.date}</p>
                      <h3 className="font-serif text-xl text-forest-dark mb-3">{event.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-20 text-center">
          <div className="inline-block bg-gradient-to-r from-terracotta/10 to-sage-green/10 rounded-2xl p-8">
            <p className="font-serif text-2xl text-forest-dark italic mb-4">
              "Das Leben ist entweder ein gewagtes Abenteuer oder nichts."
            </p>
            <p className="text-terracotta font-medium">— Helen Keller</p>
          </div>
        </div>
      </div>
    </section>
  )
}
