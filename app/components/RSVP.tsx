'use client'

import { useState, useEffect } from 'react'
import { Send, Check, Users, Utensils, MessageSquare, Bed, AlertCircle } from 'lucide-react'
import { rsvpStorage, type RSVPFormData } from '@/lib/rsvp-storage'

export default function RSVP() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    guests: '1',
    accommodation: 'needed',
    dietary: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [attending, setAttending] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load existing response if available
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const email = urlParams.get('email') || localStorage.getItem('last_rsvp_email')
    
    if (email) {
      const existing = rsvpStorage.getByEmail(email)
      if (existing) {
        setFormData({
          name: existing.name,
          email: existing.email,
          guests: existing.guests || '1',
          accommodation: existing.accommodation || 'needed',
          dietary: existing.dietary || '',
          message: existing.message || '',
        })
        setAttending(existing.attending)
      }
    }
  }, [])

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Bitte gib deinen Namen ein')
      return false
    }
    if (!formData.email.includes('@')) {
      setError('Bitte gib eine gültige E-Mail Adresse ein')
      return false
    }
    if (attending === null) {
      setError('Bitte wähle, ob du kommst oder nicht')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    setIsLoading(true)
    try {
      // Save to localStorage
      const dataToSave: RSVPFormData = {
        name: formData.name,
        email: formData.email,
        attending: attending!,
        guests: attending ? formData.guests : undefined,
        accommodation: attending ? formData.accommodation : undefined,
        dietary: attending ? formData.dietary : undefined,
        message: formData.message || undefined,
      }

      rsvpStorage.save(dataToSave)
      localStorage.setItem('last_rsvp_email', formData.email)

      setSubmitted(true)
    } catch (err) {
      setError('Fehler beim Speichern. Bitte versuche es später erneut.')
      console.error('RSVP Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError(null)
  }

  if (submitted) {
    return (
      <section id="rsvp" className="py-24 px-6 bg-terracotta">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-3xl p-12 shadow-lg">
            <div className="w-20 h-20 bg-sage-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-sage-green" />
            </div>
            <h2 className="font-serif text-3xl text-forest-dark mb-4">
              {attending ? 'Wir freuen uns auf dich! 🎉' : 'Schade, dass du nicht kommen kannst'}
            </h2>
            <p className="text-gray-600 mb-6">
              {attending ? 'Danke für deine Zusage! Wir speichern deine Daten und melden uns bei Bedarf bei dir.' : 'Danke für die Rückmeldung. Vielleicht beim nächsten Mal!'}
            </p>
            <button
              onClick={() => {
                setSubmitted(false)
                setAttending(null)
                setFormData({ name: '', email: '', guests: '1', accommodation: 'needed', dietary: '', message: '' })
              }}
              className="px-6 py-2 text-sm bg-terracotta text-white rounded-full hover:bg-burnt-orange transition-colors"
            >
              Antwort ändern
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="rsvp" className="py-24 px-6 bg-terracotta">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-white/80 text-sm uppercase tracking-[0.2em] mb-4">
            Bitte bis 15. Juli 2026
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-white"> Zusage </h2>
          <div className="w-20 h-1 bg-white/30 mx-auto mt-6 rounded-full" />
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
          {/* Attendance Toggle */}
          <div className="flex gap-4 mb-8">
            <button
              type="button"
              onClick={() => setAttending(true)}
              className={`flex-1 py-4 px-6 rounded-2xl font-medium transition-all duration-300 ${
                attending === true ? 'bg-sage-green text-white' : 'bg-sand/30 text-gray-600 hover:bg-sand/50'
              }`}
            >
              Ich komme
            </button>
            <button
              type="button"
              onClick={() => setAttending(false)}
              className={`flex-1 py-4 px-6 rounded-2xl font-medium transition-all duration-300 ${
                attending === false ? 'bg-terracotta text-white' : 'bg-sand/30 text-gray-600 hover:bg-sand/50'
              }`}
            >
              Ich kann leider nicht
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {attending !== null && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 outline-none transition-all"
                  placeholder="Dein Name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-Mail *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 outline-none transition-all"
                  placeholder="deine@email.de"
                />
              </div>

              {attending === true && (
                <>
                  {/* Number of guests */}
                  <div>
                    <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      Anzahl Personen
                    </label>
                    <select
                      id="guests"
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 outline-none transition-all"
                    >
                      <option value="1">1 Person</option>
                      <option value="2">2 Personen</option>
                      <option value="3">3 Personen</option>
                      <option value="4">4 Personen</option>
                    </select>
                  </div>

                  {/* Accommodation */}
                  <div>
                    <label htmlFor="accommodation" className="block text-sm font-medium text-gray-700 mb-2">
                      <Bed className="w-4 h-4 inline mr-2" />
                      Unterkunft benötigt?
                    </label>
                    <select
                      id="accommodation"
                      name="accommodation"
                      value={formData.accommodation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 outline-none transition-all"
                    >
                      <option value="needed">Ja, ich benötige einen Schlafplatz</option>
                      <option value="not-needed">Nein, ich benötige keinen Schlafplatz</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      Wir haben Zimmer in der Location oder 15-20 Min Fußweg entfernt reserviert.
                    </p>
                  </div>

                  {/* Dietary requirements */}
                  <div>
                    <label htmlFor="dietary" className="block text-sm font-medium text-gray-700 mb-2">
                      <Utensils className="w-4 h-4 inline mr-2" />
                      Essenswünsche / Allergien
                    </label>
                    <textarea
                      id="dietary"
                      name="dietary"
                      rows={3}
                      value={formData.dietary}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 outline-none transition-all resize-none"
                      placeholder="Vegetarisch, Vegan, Allergien, etc."
                    />
                  </div>
                </>
              )}

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Nachricht (optional)
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 outline-none transition-all resize-none"
                placeholder="Eine Nachricht für uns..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-terracotta text-white rounded-2xl font-medium text-lg hover:bg-burnt-orange disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Wird gespeichert...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Absenden</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  </section>
)
}