'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Utensils, Check, ArrowLeft, AlertCircle, Beef, Fish, Sprout } from 'lucide-react'

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
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [rsvpStatus, setRsvpStatus] = useState<string>('')
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
      // Admin or other role — redirect
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
        if (data.guest?.mealChoice?.mainCourse) {
          setSelectedMeal(data.guest.mealChoice.mainCourse)
          setSubmitted(true)
        }
      }
    } catch (err) {
      console.error('Error fetching meal choice:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedMeal) {
      setError('Bitte wähle einen Hauptgang aus.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/meal-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mainCourse: selectedMeal }),
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
            onClick={() => router.push('/dashboard')}
            className="px-8 py-3 bg-terracotta text-white rounded-2xl font-medium hover:bg-burnt-orange transition-colors"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    )
  }

  // Confirmation view
  if (submitted && selectedMeal) {
    const chosen = MEAL_OPTIONS.find(m => m.id === selectedMeal)
    return (
      <div className="min-h-screen bg-terracotta flex items-center justify-center px-6 py-12">
        <div className="bg-white rounded-3xl p-12 shadow-lg max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-sage-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-sage-green" />
          </div>
          <h1 className="font-serif text-3xl text-forest-dark mb-4">
            Danke für deine Auswahl! 🎉
          </h1>
          <p className="text-gray-600 mb-6">
            {guestName}, wir haben deine Wahl notiert:
          </p>
          <div className="bg-sand/30 rounded-2xl p-6 mb-8">
            <div className="text-4xl mb-3">{chosen?.emoji}</div>
            <p className="font-serif text-xl text-forest-dark">{chosen?.title}</p>
            <p className="text-sm text-gray-600 mt-2">{chosen?.description}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Falls du deine Auswahl noch ändern möchtest, klicke einfach auf den Button unten.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
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
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Übersicht
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
            Was möchtest du essen?
          </h1>
          <p className="text-white/70 mt-4 max-w-xl mx-auto">
            Hallo {guestName}! Bitte wähle deinen Hauptgang für unsere Hochzeit.
            Du kannst deine Auswahl später noch ändern.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-6 max-w-2xl mx-auto">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Meal Cards */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {MEAL_OPTIONS.map((option) => {
              const Icon = option.icon
              const isSelected = selectedMeal === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setSelectedMeal(option.id)
                    setError(null)
                  }}
                  className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-sage-green bg-sage-green/10 shadow-lg scale-[1.02]'
                      : 'border-white/20 bg-white/90 hover:border-white/40 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-sage-green text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{option.emoji}</span>
                        <h3 className="font-serif text-xl text-forest-dark">{option.title}</h3>
                        {isSelected && <Check className="w-5 h-5 text-sage-green ml-auto" />}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Submit */}
          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={!selectedMeal || isLoading}
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
                  <span>Auswahl bestätigen</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}