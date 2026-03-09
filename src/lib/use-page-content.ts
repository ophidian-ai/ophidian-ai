"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

// Module-level cache: persists across navigations, cleared on save
const cache = new Map<string, Record<string, string>>()

export function invalidateContentCache(page?: string) {
  if (page) {
    cache.delete(page)
  } else {
    cache.clear()
  }
}

export function usePageContent(page: string) {
  const [content, setContent] = useState<Record<string, string>>(
    () => cache.get(page) ?? {}
  )

  useEffect(() => {
    // If cached, use it immediately (already set via initializer)
    if (cache.has(page)) return

    let supabase: ReturnType<typeof createClient>
    try {
      supabase = createClient()
    } catch {
      return
    }

    supabase
      .from("site_content")
      .select("key, value")
      .eq("page", page)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {}
          for (const row of data) map[row.key] = row.value
          cache.set(page, map)
          setContent(map)
        }
      })
  }, [page])

  return content
}
