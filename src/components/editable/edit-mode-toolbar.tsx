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
