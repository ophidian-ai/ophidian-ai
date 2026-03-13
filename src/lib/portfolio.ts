import { createClient } from "@/lib/supabase/client"

export interface PortfolioProject {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string | null
  hero_image: string
  hero_image_alt: string
  hero_image_pos: string
  gallery_image: string | null
  gallery_image_alt: string
  gallery_image_pos: string
  external_url: string | null
  is_visible: boolean
  sort_order: number
  metrics: { value: string; label: string }[]
  features: { icon: string; title: string; desc: string }[]
  tech_stack: { name: string; desc: string }[]
  timeline: { phase: string; duration: string; desc: string }[]
  challenge: string | null
  solution: string | null
  results: string[]
  created_at: string
  updated_at: string
}

export async function getPortfolioProjects(): Promise<PortfolioProject[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Failed to fetch portfolio projects:", error)
    return []
  }

  return data as PortfolioProject[]
}

export async function getPortfolioProject(slug: string): Promise<PortfolioProject | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("slug", slug)
    .eq("is_visible", true)
    .single()

  if (error) {
    console.error("Failed to fetch portfolio project:", error)
    return null
  }

  return data as PortfolioProject
}
