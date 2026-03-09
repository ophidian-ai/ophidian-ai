"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function usePageContent(page: string) {
  const [content, setContent] = useState<Record<string, string>>({})

  useEffect(() => {
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
          setContent(map)
        }
      })
  }, [page])

  return content
}
