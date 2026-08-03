'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Utensils, Check, ArrowLeft, AlertCircle, Beef, Fish, Sprout, User, Users } from 'lucide-react'

const MEAL_OPTIONS = [
  {
    id: 'beef',
    title: 'Weiderind',
    description: 'Zartes Weiderind mit saisonalem Gemüse und Kartoffelbeilage',
    icon: Beef,
    emoji: '🥩',
  },
  {
    id: 'fish',
    title: 'Saibling',
    description: 'Gebratener Saibling auf frischer Soße mit Kräutern und Reis',
    icon: Fish,
    emoji: '🐟',
  },
  {
    id: 'vegan',
    title: 'Veganes Kürbisrisotto',
    description: 'Cremiges Kürbisrisotto mit gebratenen Champignons und Trüffelöl',
    icon: Sprout,
    emoji: '🌱',
  },
] as const

export default function MealSelectionPage() {
  const router = useRouter()
  const { session, isGuest, isAuthenticated, isLoading: authLoading } = useAuth()
  const [selections, setSelections] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [rsvpStatus, setRsvpStatus] = useState<string>('')
  const [numAdults, setNumAdults] = useState(1)
  const [rsvpGuests, setRsvpGuests] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isGuest && session?.code) {
      fetchMealChoice()
    } else if (!authLoading && isAuthenticated && !isGuest) {
      router.push('/')
    }
  }, [isGuest, session?.code, authLoading, isAuthenticated, router])

  const fetchMealChoice = async () => {
    try {
      const response = await fetch('/api/meal-selection', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setGuestName(data.guest?.name || '')
        setRsvpStatus(data.guest?.rsvpStatus || 'pending')
        setNumAdults(data.guest?.numAdults || 1)
        setRsvpGuests(data.guest?.rsvpGuests || 1)
        if (data.guest?.mealChoice?.selections?.length) {
          setSelections(data.guest.mealChoice.selections)
          setSubmitted(true)
        }
      }
    } catch (err) {
      console.error('Error fetching meal choice:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const toggleSelection = (mealId: string, slotIndex: number) => {
    setError(null)
    setSelections(prev => {
      const next = [...prev]
      // If nothing selected for this slot yet, just set it
      if (slotIndex >= next.length) {
        next.push(mealId)
      } else {
        // If clicking the same meal that's already in this slot, keep it (no deselect — must choose)
        // Actually allow toggling: if same meal clicked, do nothing (must have a selection)
        next[slotIndex] = mealId
      }
      // Trim to numAdults length
      return next.slice(0, numAdults)
    })
  }

  const allSlotsFilled = selections.length === numAdults && selections.every(s => s)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (selections.length !== numAdults || selections.some(s => !s)) {
      setError(`Bitte wähle für ${numAdults === 1 ? 'jede Person' : 'beide Erwachsene'} einen Hauptgang aus.`)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/meal-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ selections }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Speichern')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern. Bitte versuche es später erneut.')
      console.error('Meal Selection Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-2 border-forest-dark border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isGuest) {
    return null
  }

  // If guest hasn't RSVP'd yet
  if (rsvpStatus !== 'attending') {
    return (
      <div className="min-h-screen bg-terracotta flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl p-12 shadow-lg max-w-lg text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="font-serif text-3xl text-forest-dark mb-4">
            Noch keine Zusage
          </h1>
          <p className="text-gray-600 mb-8">
            Du kannst erst eine Essensauswahl treffen, wenn du deine Zusage gegeben hast.
            Bitte gib zuerst deine Rückmeldung auf der Hauptseite.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-terracotta text-white rounded-2xl font-medium hover:bg-burnt-orange transition-colors"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    )
  }

  // Helper: get label for a meal id
  const getMealLabel = (id: string) => {
    const m = MEAL_OPTIONS.find(o => o.id === id)
    return m ? `${m.emoji} ${m.title}` : id
  }

  // Confirmation view
  if (submitted && selections.length > 0) {
    return (
      <div className="min-h-screen bg-terracotta flex items-center justify-center px-6 py-12">
        <div className="bg-white rounded-3xl p-12 shadow-lg max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-sage-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-sage-green" />
          </div>
          <h1 className="font-serif text-3xl text-forest-dark mb-4">
            Danke für eure Auswahl! 🎉
          </h1>
          <p className="text-gray-600 mb-6">
            {guestName}, wir haben notiert:
          </p>
          <div className="space-y-3 mb-8">
            {selections.map((sel, i) => {
              const chosen = MEAL_OPTIONS.find(m => m.id === sel)
              return (
                <div key={i} className="bg-sand/30 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-forest-dark/10 flex items-center justify-center flex-shrink-0">
                    {numAdults === 2 ? (
                      <span className="text-sm font-bold text-forest-dark">{i + 1}.</span>
                    ) : (
                      <User className="w-5 h-5 text-forest-dark" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-2xl">{chosen?.emoji}</div>
                    <p className="font-serif text-lg text-forest-dark">{chosen?.title}</p>
                    <p className="text-xs text-gray-600">{chosen?.description}</p>
                  </div>
                </div>
              )
            })}
            {rsvpGuests > 2 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800">
                <p className="flex items-center gap-2">
                  <span className="text-xl">👶</span>
                  Für {rsvpGuests - 2} {rsvpGuests - 2 === 1 ? 'Kind' : 'Kinder'} gibt es automatisch einen Kinderteller.
                </p>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Falls du deine Auswahl noch ändern möchtest, klicke einfach auf den Button unten.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-forest-dark text-white rounded-2xl font-medium hover:bg-forest-light transition-colors"
            >
              Zurück zur Übersicht
            </button>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
            >
              Auswahl ändern
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Selection form
  return (
    <div className="min-h-screen bg-terracotta py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Startseite
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <p className="text-white/80 text-sm uppercase tracking-[0.2em] mb-3">
            Hauptgang Auswahl
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-white">
            Was möchtet ihr essen?
          </h1>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/15 rounded-full">
            {numAdults === 1 ? (
              <>
                <User className="w-4 h-4 text-white" />
                <span className="text-white text-sm">1 Auswahl für dich</span>
              </>
            ) : (
              <>
                <Users className="w-4 h-4 text-white" />
                <span className="text-white text-sm">2 Auswahlen für 2 Erwachsene</span>
              </>
            )}
          </div>
          {rsvpGuests > 2 && (
            <p className="text-white/70 mt-3 text-sm">
              👶 Für {rsvpGuests - 2} {rsvpGuests - 2 === 1 ? 'Kind' : 'Kinder'} gibt es automatisch einen Kinderteller.
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-6 max-w-2xl mx-auto">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Meal selection slots */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {Array.from({ length: numAdults }).map((_, slotIndex) => (
            <div key={slotIndex}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white font-bold">{slotIndex + 1}</span>
                </div>
                <h2 className="font-serif text-2xl text-white">
                  {numAdults === 1 ? 'Dein Hauptgang' : `Hauptgang ${slotIndex + 1}`}
                </h2>
                {selections[slotIndex] && (
                  <span className="ml-auto inline-flex items-center gap-1 px-3 py-1 bg-sage-green text-white rounded-full text-sm">
                    <Check className="w-4 h-4" />
                    {getMealLabel(selections[slotIndex])}
                  </span>
                )}
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {MEAL_OPTIONS.map((option) => {
                  const Icon = option.icon
                  const isSelected = selections[slotIndex] === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleSelection(option.id, slotIndex)}
                      className={`text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
                        isSelected
                          ? 'border-sage-green bg-white shadow-lg scale-[1.02]'
                          : 'border-white/20 bg-white/90 hover:border-white/40 hover:bg-white'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                          isSelected ? 'bg-sage-green text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{option.emoji}</span>
                          <h3 className="font-serif text-lg text-forest-dark">{option.title}</h3>
                          {isSelected && <Check className="w-4 h-4 text-sage-green" />}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Submit */}
          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={!allSlotsFilled || isLoading}
              className="px-12 py-4 bg-white text-terracotta rounded-2xl font-medium text-lg hover:bg-white/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 inline-flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
                  <span>Wird gespeichert...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>{numAdults === 1 ? 'Auswahl bestätigen' : 'Auswahlen bestätigen'}</span>
                </>
              )}
            </button>
            {!allSlotsFilled && !error && (
              <p className="text-white/60 text-sm mt-3">
                {numAdults === 1
                  ? 'Bitte wähle einen Hauptgang aus.'
                  : `Bitte wähle für beide Erwachsene je einen Hauptgang aus. (${selections.filter(Boolean).length}/${numAdults})`}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}