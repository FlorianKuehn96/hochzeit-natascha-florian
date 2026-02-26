// RSVP data persistence layer
export interface RSVPFormData {
  name: string
  email: string
  attending: boolean
  guests?: string
  accommodation?: string
  dietary?: string
  message?: string
  submittedAt?: string
}

const STORAGE_KEY = 'hochzeit_rsvp_responses'

export const rsvpStorage = {
  // Save a single RSVP response
  save: (data: RSVPFormData): void => {
    if (typeof window === 'undefined') return

    const allResponses = rsvpStorage.getAll()
    const existingIndex = allResponses.findIndex((r) => r.email === data.email)

    const newData = {
      ...data,
      submittedAt: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      allResponses[existingIndex] = newData
    } else {
      allResponses.push(newData)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allResponses))
  },

  // Get all RSVP responses
  getAll: (): RSVPFormData[] => {
    if (typeof window === 'undefined') return []

    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  },

  // Get by email
  getByEmail: (email: string): RSVPFormData | null => {
    const all = rsvpStorage.getAll()
    return all.find((r) => r.email === email) || null
  },

  // Delete a response
  delete: (email: string): void => {
    if (typeof window === 'undefined') return

    const allResponses = rsvpStorage.getAll()
    const filtered = allResponses.filter((r) => r.email !== email)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  },

  // Clear all (use with caution!)
  clear: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  },

  // Get stats
  getStats: () => {
    const all = rsvpStorage.getAll()
    return {
      total: all.length,
      attending: all.filter((r) => r.attending).length,
      notAttending: all.filter((r) => !r.attending).length,
      totalGuests: all.reduce((sum, r) => sum + (r.guests ? parseInt(r.guests) : 1), 0),
    }
  },
}
