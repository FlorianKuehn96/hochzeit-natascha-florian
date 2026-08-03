"use client"

import { useState } from "react"

export function useToast() {
  const [toasts, setToasts] = useState<any[]>([])

  const toast = ({ title, description, variant }: { title?: string; description?: string; variant?: string }) => {
    setToasts((prev) => [...prev, { title, description, variant, id: Date.now() }])
    setTimeout(() => {
      setToasts((prev) => prev.slice(1))
    }, 3000)
  }

  return { toast, toasts }
}
