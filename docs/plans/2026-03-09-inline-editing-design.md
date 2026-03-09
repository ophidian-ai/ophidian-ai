# Admin Inline Editing + Iris Chat Restyle -- Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow admin users to edit all text and images on public pages inline, rename the chat assistant to "Iris", and apply glass morphism to the chat panel.

**Architecture:** Supabase `site_content` table stores editable content as key-value pairs per page. A React context (`EditModeProvider`) detects admin auth and manages edit mode state. Wrapper components (`EditableText`, `EditableImage`) replace raw strings/images, falling back to hardcoded defaults when no DB entry exists. A floating toolbar toggles edit mode and batches saves.

**Tech Stack:** Next.js 15 (App Router), React 19, Supabase (Auth + DB + Storage), Tailwind CSS 4, TypeScript

---

## Task 1: Create Supabase `site_content` Table + Storage Bucket

**Files:**
- None (Supabase SQL migration via MCP or dashboard)

**Step 1: Run SQL migration to create `site_content` table**

```sql
CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  key text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  UNIQUE (page, key)
);

-- Public read access
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site content"
  ON site_content FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert site content"
  ON site_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update site content"
  ON site_content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete site content"
  ON site_content FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

**Step 2: Create `site-content` storage bucket**

Via Supabase dashboard or SQL:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('site-content', 'site-content', true);

CREATE POLICY "Anyone can read site-content"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-content');

CREATE POLICY "Admins can upload to site-content"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'site-content'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update site-content"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'site-content'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete from site-content"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'site-content'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

**Step 3: Verify table and bucket exist**

Query `site_content` table and list storage buckets to confirm.

**Step 4: Commit**

```bash
git add docs/plans/
git commit -m "docs: add inline editing implementation plan"
```

---

## Task 2: Build `EditModeProvider` Context

**Files:**
- Create: `src/lib/edit-mode-context.tsx`

**Step 1: Create the context provider**

```tsx
"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

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
```

**Step 2: Verify it compiles**

Run: `cd engineering/projects/ophidian-ai && npx tsc --noEmit src/lib/edit-mode-context.tsx`
Or just confirm dev server has no errors.

**Step 3: Commit**

```bash
git add src/lib/edit-mode-context.tsx
git commit -m "feat: add EditModeProvider context for admin inline editing"
```

---

## Task 3: Build `EditableText` Component

**Files:**
- Create: `src/components/editable/editable-text.tsx`

**Step 1: Create the component**

This component wraps any text element. In normal mode, it renders the text as-is. In edit mode, it becomes contentEditable with a dashed border on hover.

```tsx
"use client"

import { useRef, useEffect, useState } from "react"
import { useEditMode } from "@/lib/edit-mode-context"

type EditableTextProps = {
  page: string
  contentKey: string
  defaultValue: string
  dbValue?: string | null
  as?: keyof HTMLElementTagNameMap
  className?: string
  children?: React.ReactNode
}

export function EditableText({
  page,
  contentKey,
  defaultValue,
  dbValue,
  as: Tag = "span",
  className = "",
  children,
}: EditableTextProps) {
  const { isEditMode, registerChange, pendingChanges } = useEditMode()
  const ref = useRef<HTMLElement>(null)
  const displayValue = dbValue ?? defaultValue

  // Track if user has edited this field in current session
  const pendingKey = `${page}:${contentKey}`
  const pendingValue = pendingChanges.get(pendingKey)?.value

  const handleBlur = () => {
    if (!ref.current) return
    const newValue = ref.current.innerText.trim()
    if (newValue !== displayValue) {
      registerChange(page, contentKey, "text", newValue)
    }
  }

  // Reset content when edit mode is toggled off (discard)
  useEffect(() => {
    if (!isEditMode && ref.current) {
      ref.current.innerText = pendingValue ?? displayValue
    }
  }, [isEditMode])

  if (!isEditMode) {
    // Render children if provided (for complex nested content), otherwise text
    if (children) return <>{children}</>
    const Component = Tag as any
    return <Component className={className}>{pendingValue ?? displayValue}</Component>
  }

  const Component = Tag as any
  return (
    <Component
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      className={`${className} outline-none ring-1 ring-dashed ring-primary/0 hover:ring-primary/40 focus:ring-primary/60 rounded px-0.5 transition-all cursor-text`}
    >
      {pendingValue ?? displayValue}
    </Component>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/editable/editable-text.tsx
git commit -m "feat: add EditableText component for inline text editing"
```

---

## Task 4: Build `EditableImage` Component

**Files:**
- Create: `src/components/editable/editable-image.tsx`

**Step 1: Create the component**

In edit mode, clicking the image opens a file picker. The file uploads to Supabase Storage `site-content` bucket and the URL is registered as a pending change.

```tsx
"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { useEditMode } from "@/lib/edit-mode-context"
import { createClient } from "@/lib/supabase/client"

type EditableImageProps = {
  page: string
  contentKey: string
  defaultSrc: string
  dbValue?: string | null
  alt: string
  width: number
  height: number
  className?: string
  fill?: boolean
}

export function EditableImage({
  page,
  contentKey,
  defaultSrc,
  dbValue,
  alt,
  width,
  height,
  className = "",
  fill,
}: EditableImageProps) {
  const { isEditMode, registerChange, pendingChanges } = useEditMode()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const pendingKey = `${page}:${contentKey}`
  const pendingValue = pendingChanges.get(pendingKey)?.value
  const src = pendingValue ?? dbValue ?? defaultSrc

  const handleClick = () => {
    if (!isEditMode) return
    fileInputRef.current?.click()
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const path = `${page}/${contentKey}-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from("site-content")
      .upload(path, file, { upsert: true })

    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from("site-content")
        .getPublicUrl(path)

      registerChange(page, contentKey, "image", publicUrl)
    }

    setUploading(false)
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const imageProps = fill
    ? { fill: true, alt, className, sizes: "(max-width: 768px) 100vw, 50vw" }
    : { width, height, alt, className }

  return (
    <div className={`relative ${isEditMode ? "cursor-pointer group" : ""}`} onClick={handleClick}>
      <Image src={src} {...imageProps} />

      {isEditMode && (
        <>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded flex items-center justify-center">
            <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? "Uploading..." : "Click to replace"}
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/editable/editable-image.tsx
git commit -m "feat: add EditableImage component with Supabase Storage upload"
```

---

## Task 5: Build `EditModeToolbar` Component

**Files:**
- Create: `src/components/editable/edit-mode-toolbar.tsx`

**Step 1: Create the floating toolbar**

Appears bottom-left for admins. Shows "Edit Page" button normally, and "Save Changes" / "Discard" buttons when in edit mode.

```tsx
"use client"

import { useEditMode } from "@/lib/edit-mode-context"
import { Pencil, Save, X } from "lucide-react"

export function EditModeToolbar() {
  const { isAdmin, isEditMode, toggleEditMode, saveChanges, discardChanges, isSaving, pendingChanges } = useEditMode()

  if (!isAdmin) return null

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2">
      {isEditMode ? (
        <>
          <button
            type="button"
            onClick={saveChanges}
            disabled={isSaving || pendingChanges.size === 0}
            className="flex items-center gap-2 rounded-full bg-primary/90 px-4 py-2.5 text-sm font-medium text-background shadow-lg hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : `Save (${pendingChanges.size})`}
          </button>
          <button
            type="button"
            onClick={discardChanges}
            className="flex items-center gap-2 rounded-full border border-surface-border bg-surface/90 backdrop-blur-xl px-4 py-2.5 text-sm font-medium text-foreground shadow-lg hover:bg-surface transition-colors"
          >
            <X className="h-4 w-4" />
            Discard
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={toggleEditMode}
          className="flex items-center gap-2 rounded-full border border-primary/20 bg-surface/90 backdrop-blur-xl px-4 py-2.5 text-sm font-medium text-foreground shadow-glow hover:border-primary/40 transition-all"
        >
          <Pencil className="h-4 w-4 text-primary" />
          Edit Page
        </button>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/editable/edit-mode-toolbar.tsx
git commit -m "feat: add EditModeToolbar floating button for admin editing"
```

---

## Task 6: Create Content Fetching Utility

**Files:**
- Create: `src/lib/site-content.ts`

**Step 1: Create server-side content fetcher**

```ts
import { createClient } from "@/lib/supabase/server"

export type SiteContent = Record<string, string>

export async function getPageContent(page: string): Promise<SiteContent> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("site_content")
    .select("key, value")
    .eq("page", page)

  const content: SiteContent = {}
  if (data) {
    for (const row of data) {
      content[row.key] = row.value
    }
  }
  return content
}
```

**Step 2: Commit**

```bash
git add src/lib/site-content.ts
git commit -m "feat: add server-side content fetcher for site_content table"
```

---

## Task 7: Wire Provider + Toolbar into Root Layout

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Add EditModeProvider and EditModeToolbar to root layout**

The root layout is a server component, so we wrap children in a client component provider. Add imports and wrap the body content:

```tsx
// Add imports:
import { EditModeProvider } from "@/lib/edit-mode-context"
import { EditModeToolbar } from "@/components/editable/edit-mode-toolbar"

// In the body, wrap children + AIChatWidget:
<EditModeProvider>
  <div className="relative z-10">
    {children}
  </div>
  <AIChatWidget />
  <EditModeToolbar />
</EditModeProvider>
```

Note: `layout.tsx` currently has `"use client"` NOT set -- it's a server component. The `EditModeProvider` is a client component, so wrapping children in it is fine (Next.js handles client/server boundary). But `layout.tsx` must NOT have metadata exports if it becomes a client component. Since we're just adding a client component as a wrapper (not making layout.tsx itself "use client"), this is fine.

**Step 2: Verify dev server shows no errors**

**Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: wire EditModeProvider and toolbar into root layout"
```

---

## Task 8: Wire Inline Editing into Home Page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Convert home page to fetch content server-side and pass to a client component**

The home page is currently `"use client"`. We need to:
1. Create a server wrapper that fetches content from `site_content`
2. Pass content as props to the existing client page component
3. Wrap text/image props with `EditableText` components

Create `src/app/home-content.tsx` as the client component (moved from page.tsx), and make `page.tsx` a server component that fetches content and passes it down.

Alternatively (simpler approach): Keep page.tsx as `"use client"` and fetch content client-side using the Supabase browser client. This avoids splitting the file.

**Recommended approach:** Keep it simple. Add a `useEffect` in the home page (or a custom hook) that fetches `site_content` for page="home" on mount. Pass those values as `dbValue` to `EditableText` wrappers. Hardcoded values serve as defaults.

Create a client-side hook:

```tsx
// src/lib/use-page-content.ts
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
```

Then in each page, use the hook and wrap editable content:

```tsx
const content = usePageContent("home")

// Example: StatsBar stat value
<EditableText
  page="home"
  contentKey="stat_1_value"
  defaultValue="10x"
  dbValue={content["stat_1_value"]}
  as="span"
/>
```

For sections that accept props (StatsBar, FeaturesGrid, ProcessSteps, CTABanner), the editable wrappers go inside those section components OR we pass pre-resolved values as props.

**The practical approach:** For the initial implementation, wrap the text content that page.tsx passes as props to section components. Each section component's props will include optional `dbValue` overrides OR we modify the section components to accept `EditableText` as children.

Since sections like `StatsBar` and `CTABanner` render props directly, the cleanest approach is to modify each section component to support editable content when in edit mode. BUT this adds coupling. Instead, we can:

1. Replace string props with already-resolved values (dbValue ?? default) for display
2. Wrap the rendered output in EditableText at the page level

**Simplest path:** For each page, build a thin wrapper component that:
- Calls `usePageContent(pageName)`
- Renders the existing page structure
- Wraps key text elements in `<EditableText>`

**Step 2: Wire up home page**

Replace hardcoded strings in `page.tsx` with EditableText wrappers for:
- Hero tagline, headline, subline, bottom text (these are word arrays -- treat each as a single editable string that gets split)
- StatsBar values and labels (8 fields: stat_1_value, stat_1_label, stat_2_value, stat_2_label, etc.)
- FeaturesGrid heading, subtitle, feature titles and descriptions (10 fields)
- ProcessSteps heading, subtitle, step titles and descriptions (10 fields)
- CTABanner headline, subtitle, CTA label (3 fields)

For the hero animated component (which takes word arrays), convert to a single string for editing and split on spaces for animation.

**Step 3: Verify the page renders correctly with no DB content (all defaults)**

**Step 4: Commit**

```bash
git add src/lib/use-page-content.ts src/app/page.tsx
git commit -m "feat: wire inline editing into home page"
```

---

## Task 9: Wire Inline Editing into Services Page

**Files:**
- Modify: `src/app/services/page.tsx`

**Step 1: Add `"use client"` directive (if not present), import usePageContent and EditableText**

**Step 2: Wrap editable content**

Editable fields:
- 3 service titles, descriptions, and 4 bullets each (3 * 6 = 18 fields)
- FeaturesGrid heading, subtitle, 4 feature titles and descriptions (10 fields)
- CTABanner headline, subtitle, CTA label (3 fields)

**Step 3: Verify page renders**

**Step 4: Commit**

```bash
git add src/app/services/page.tsx
git commit -m "feat: wire inline editing into services page"
```

---

## Task 10: Wire Inline Editing into About Page

**Files:**
- Modify: `src/app/about/page.tsx`

Editable fields:
- "Why We Exist" heading + 3 paragraphs (4 fields)
- Founder name, title (2 fields)
- "Meet the Founder" heading + 2 paragraphs (3 fields)
- "How We Work" heading + subtitle (2 fields)
- 3 values: titles + descriptions (6 fields)
- ProcessSteps heading, subtitle, 4 step titles + descriptions (10 fields)
- CTABanner headline, subtitle, CTA label (3 fields)

**Step 1: Add usePageContent + EditableText wrappers**

**Step 2: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat: wire inline editing into about page"
```

---

## Task 11: Wire Inline Editing into FAQ Page

**Files:**
- Modify: `src/app/faq/page.tsx`

Editable fields:
- FAQAccordion heading + subtitle (2 fields)
- 7 FAQ questions + answers (14 fields)
- CTABanner headline, subtitle, CTA label (3 fields)

**Step 1: Add `"use client"`, usePageContent + EditableText wrappers**

**Step 2: Commit**

```bash
git add src/app/faq/page.tsx
git commit -m "feat: wire inline editing into FAQ page"
```

---

## Task 12: Wire Inline Editing into Pricing Page

**Files:**
- Modify: `src/app/pricing/page.tsx`

Editable fields:
- 5 pricing FAQ questions + answers (10 fields)
- FAQAccordion heading + subtitle (2 fields)
- PricingSection content (pricing tiers -- may need to check what PricingSection accepts)

**Step 1: Add usePageContent + EditableText wrappers**

**Step 2: Commit**

```bash
git add src/app/pricing/page.tsx
git commit -m "feat: wire inline editing into pricing page"
```

---

## Task 13: Wire Inline Editing into Contact Page

**Files:**
- Modify: `src/app/contact/page.tsx`

Editable fields:
- Contact heading + subtitle (2 fields)
- Contact info: email, location, response time (3 fields)

**Step 1: Add usePageContent + EditableText wrappers**

**Step 2: Commit**

```bash
git add src/app/contact/page.tsx
git commit -m "feat: wire inline editing into contact page"
```

---

## Task 14: Wire Inline Editing into Portfolio Page

**Files:**
- Modify: `src/app/portfolio/page.tsx`

Editable fields:
- Featured project title, description, badge, metrics (6+ fields)
- Coming soon heading + text (2 fields)
- CTABanner (3 fields)
- Project image via EditableImage

**Step 1: Add usePageContent + EditableText + EditableImage wrappers**

**Step 2: Commit**

```bash
git add src/app/portfolio/page.tsx
git commit -m "feat: wire inline editing into portfolio page"
```

---

## Task 15: Wire Inline Editing into Projects Page

**Files:**
- Modify: `src/app/projects/page.tsx`

Editable fields:
- 6 project titles + subtitles (12 fields)
- Project images via EditableImage

**Step 1: Add usePageContent + EditableText + EditableImage wrappers**

**Step 2: Commit**

```bash
git add src/app/projects/page.tsx
git commit -m "feat: wire inline editing into projects page"
```

---

## Task 16: Rename Chat to "Iris" + Glass Morphism on Chat Panel

**Files:**
- Modify: `src/components/ui/ai-orb.tsx`

**Step 1: Rename assistant**

- Change `"OphidianAI Assistant"` to `"Iris"` in the chat header
- Change the initial message from `"Hi! I'm the OphidianAI assistant..."` to `"Hi! I'm Iris, your OphidianAI assistant. How can I help you today?"`

**Step 2: Apply glass morphism to chat panel**

Update the chat panel container classes:
- Background: `bg-surface/60` (more transparent) + `backdrop-blur-2xl`
- Border: `border-primary/15` with subtle glow
- Add box shadow: `shadow-[0_0_30px_rgba(13,177,178,0.1),0_0_60px_rgba(57,255,20,0.05)]`
- Messages area: keep current styling
- Input area border: `border-primary/10`

**Step 3: Clean up unused SiriOrb import**

Remove the `import { SiriOrb }` line since it's no longer used.

**Step 4: Verify chat widget looks glassy**

**Step 5: Commit**

```bash
git add src/components/ui/ai-orb.tsx
git commit -m "feat: rename chat to Iris and apply glass morphism"
```

---

## Task 17: End-to-End Testing

**Step 1: Sign in as admin (eric.lefler@ophidianai.com)**

**Step 2: Navigate to home page, verify "Edit Page" button appears bottom-left**

**Step 3: Click "Edit Page", verify text fields show dashed borders on hover**

**Step 4: Edit a headline, verify change shows in the input**

**Step 5: Click "Save", verify change persists (refresh page)**

**Step 6: Test image replacement on portfolio page**

**Step 7: Verify non-admin users do NOT see the Edit Page button**

**Step 8: Verify Iris chat name and glass styling**

**Step 9: Commit any fixes**

---

## Task 18: Push to Production

**Step 1: Push submodule**

```bash
cd engineering/projects/ophidian-ai
git push
```

**Step 2: Update parent repo submodule pointer**

```bash
cd ../../..
git add engineering/projects/ophidian-ai
git commit -m "Update ophidian-ai submodule: inline editing + Iris chat"
git push
```

**Step 3: Verify Vercel deployment succeeds**
