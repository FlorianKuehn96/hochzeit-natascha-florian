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
    description: 'Bei einem Abend voller Musik und Lachen begegneten sich Natascha und Florian zum ersten Mal. Es funkte sofort, auch wenn Natascha kurz über den Altersunterschied von vier Jahren geschockt war. Wer hätte gedacht, dass genau dieser Moment der Anfang von etwas ganz Besonderem sein würde?',
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
    description: 'Ihr erster gemeinsamer Urlaub führte Natascha und Florian an die Côte d\'Azur zusammen mit Nataschas Eltern. Schon nach den ersten Tagen wussten sie, dass sie gemeinsam jede Menge Abenteuer erleben würden und dass diese Reise nur der Anfang war.',
    icon: <Plane className="w-6 h-6" />,
  },
  {
    date: 'September 2018',
    title: 'Ein Zuhause für zwei',
    description: 'Im September zog Florian zu Natascha. Plötzlich gab es zwei Zahnbürsten, einen geteilten Kühlschrank und eine Menge neue Geschichten. So begann ihr gemeinsames Leben mit allen Höhen und Tiefen, die dazugehören.',
    icon: <Home className="w-6 h-6" />,
  },
  {
    date: 'Januar 2019',
    title: 'Drei Monate Südostasien',
    description: 'Viele bezweifelten dieses Unterfangen. Natascha war es gewohnt, im Luxus zu verreisen, aber nun stand ein Backpacking-Trip durch Südostasien bevor. Doch was folgte, übertraf alle Erwartungen.',
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
    description: 'Als die Welt stillstand, fanden sie sich neu. Ihr erstes Camping-Abenteuer führte sie mit dem Wohnmobil durch Schweden, ein Jahr später ging es mit dem Campervan durch Norwegen. Am Lagerfeuer unter Sternenhimmel, beim Angeln und Wandern wuchs ihre Liebe Tag für Tag.',
    icon: <Tent className="w-6 h-6" />,
    highlight: true,
  },
  {
    date: 'August 2022',
    title: 'Der erste eigene Camper',
    description: 'Es wurde Zeit für den ersten eigenen Camper, einen umgebauten alten Ford Transit. Natascha kämpft ab und zu mit dem Rost, doch die vielen Stunden Arbeit und Liebe, die in ihn gesteckt wurden, machen jede Reise besonders. Das liebevoll „Töffi-Töffi" getaufte Gefährt bringt die beiden auf luxuriöse Campingplätze von der Zugspitze bis nach Sylt, aber auch auf abenteuerliche Roadtrips durch Italien und die Dolomiten.',
    icon: <Tent className="w-6 h-6" />,
  },
  {
    date: '2024',
    title: 'Neuseeland & die Cook-Inseln',
    description: 'Zweieinhalb Monate lang erkundeten sie Neuseeland mit dem Camper, dann folgten zwei Wochen auf den Cook-Inseln. So weit weg von Zuhause waren sie noch nie. Zwischen gemütlichen Camper-Abenden inmitten der Natur, Wanderungen durch endlose Landschaften und entspannten Tagen an weißen Stränden wuchs ihre Sehnsucht nach noch mehr gemeinsamen Abenteuern.',
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
    date: 'Februar 2026',
    title: '30. Geburtstag im eisigen Norden',
    description: 'Florians 30. Geburtstag führte die beiden nach Finnisch-Lappland. Bei klirrender Kälte erkundeten sie die Winterlandschaft auf Schneemobilen, trafen auf neugierige Rentiere und wechselten zwischen heißer Sauna und eiskaltem Eisbaden. Zwei Tage lang zogen sie auf Huskyschlitten durch verschneite Wälder, und als Höhepunkt flammten die Nordlichter über dem Nachthimmel auf.',
    icon: <Plane className="w-6 h-6" />,
    highlight: true,
  },
  {
    date: '19. September 2026',
    title: 'Ein neues Kapitel beginnt',
    description: 'Nach acht Jahren voller Abenteuer und unvergesslichen Momenten werden Natascha und Florian den nächsten großen Schritt wagen.',
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
