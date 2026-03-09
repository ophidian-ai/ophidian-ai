"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { invalidateContentCache } from "@/lib/use-page-content"

type PendingChange = {
  page: string
  key: string
  type: "text" | "image"
  value: string
}

type EditModeContextType = {
  isAdmin: boolean
  isEditMode: boolean
  toggleEditMode: () => void
  pendingChanges: Map<string, PendingChange>
  registerChange: (page: string, key: string, type: "text" | "image", value: string) => void
  saveChanges: () => Promise<void>
  discardChanges: () => void
  isSaving: boolean
}

const EditModeContext = createContext<EditModeContextType>({
  isAdmin: false,
  isEditMode: false,
  toggleEditMode: () => {},
  pendingChanges: new Map(),
  registerChange: () => {},
  saveChanges: async () => {},
  discardChanges: () => {},
  isSaving: false,
})

export function useEditMode() {
  return useContext(EditModeContext)
}

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map())
  const [isSaving, setIsSaving] = useState(false)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>
    try {
      supabase = createClient()
      supabaseRef.current = supabase
    } catch {
      return
    }

    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsAdmin(false); return }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      setIsAdmin(profile?.role === "admin")
    }

    checkAdmin()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin()
    })

    return () => subscription.unsubscribe()
  }, [])

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev)
    if (isEditMode) {
      setPendingChanges(new Map())
    }
  }, [isEditMode])

  const registerChange = useCallback((page: string, key: string, type: "text" | "image", value: string) => {
    setPendingChanges(prev => {
      const next = new Map(prev)
      next.set(`${page}:${key}`, { page, key, type, value })
      return next
    })
  }, [])

  const saveChanges = useCallback(async () => {
    if (!supabaseRef.current || pendingChanges.size === 0) return
    setIsSaving(true)

    const supabase = supabaseRef.current
    const { data: { user } } = await supabase.auth.getUser()

    const upserts = Array.from(pendingChanges.values()).map(change => ({
      page: change.page,
      key: change.key,
      type: change.type,
      value: change.value,
      updated_at: new Date().toISOString(),
      updated_by: user?.id,
    }))

    await supabase
      .from("site_content")
      .upsert(upserts, { onConflict: "page,key" })

    // Invalidate cached content for all affected pages so next render fetches fresh data
    const affectedPages = new Set(upserts.map(u => u.page))
    for (const p of affectedPages) invalidateContentCache(p)

    setPendingChanges(new Map())
    setIsEditMode(false)
    setIsSaving(false)
  }, [pendingChanges])

  const discardChanges = useCallback(() => {
    setPendingChanges(new Map())
    setIsEditMode(false)
  }, [])

  return (
    <EditModeContext.Provider value={{
      isAdmin, isEditMode, toggleEditMode,
      pendingChanges, registerChange,
      saveChanges, discardChanges, isSaving,
    }}>
      {children}
    </EditModeContext.Provider>
  )
}
