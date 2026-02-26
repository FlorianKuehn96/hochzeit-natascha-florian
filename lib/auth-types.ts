// Auth Types & Interfaces

export type UserRole = 'admin' | 'guest'

export interface Guest {
  id: string
  name: string
  email: string
  code: string
  rsvp: {
    status: 'pending' | 'attending' | 'declined'
    guests?: number
    accommodation?: 'needed' | 'not-needed'
    dietary?: string
    message?: string
    submittedAt?: string | null
  }
  createdAt: string
}

export interface Admin {
  email: string
  password: string // bcrypt hash
  createdAt: string
}

export interface AuthSession {
  id: string
  role: UserRole
  email: string
  name?: string
  code?: string // for guests
  expiresAt: number
}

export interface LoginRequest {
  email?: string
  password?: string
  code?: string
}

export interface GuestListItem {
  id: string
  name: string
  email: string
  code: string
  rsvpStatus: 'pending' | 'attending' | 'declined'
  totalGuests: number
  accommodation: 'needed' | 'not-needed'
  dietary: string
  submittedAt: string | null
}
