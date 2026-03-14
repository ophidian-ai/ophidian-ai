"use client"

import { useRef, useEffect } from "react"
import { useEditMode } from "@/lib/edit-mode-context"

type EditableTextProps = {
  page: string
  contentKey: string
  defaultValue: string
  dbValue?: string | null
  as?: keyof HTMLElementTagNameMap
  className?: string
}

export function EditableText({
  page,
  contentKey,
  defaultValue,
  dbValue,
  as: Tag = "span",
  className = "",
}: EditableTextProps) {
  const { isEditMode, registerChange, pendingChanges } = useEditMode()
  const ref = useRef<HTMLElement>(null)

  const pendingKey = `${page}:${contentKey}`
  const pendingValue = pendingChanges.get(pendingKey)?.value
  const displayValue = pendingValue ?? dbValue ?? defaultValue

  const handleBlur = () => {
    if (!ref.current) return
    const newValue = ref.current.innerText.trim()
    if (newValue !== (dbValue ?? defaultValue)) {
      registerChange(page, contentKey, "text", newValue)
    }
  }

  useEffect(() => {
    if (!isEditMode && ref.current) {
      ref.current.innerText = displayValue
    }
  }, [isEditMode, displayValue])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = Tag as any

  if (!isEditMode) {
    return <Component className={className}>{displayValue}</Component>
  }

  return (
    <Component
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      className={`${className} outline-none ring-1 ring-dashed ring-primary/0 hover:ring-primary/40 focus:ring-primary/60 rounded px-0.5 transition-all cursor-text`}
    >
      {displayValue}
    </Component>
  )
}
