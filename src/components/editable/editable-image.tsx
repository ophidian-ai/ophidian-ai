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
  width?: number
  height?: number
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
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const imageProps = fill
    ? { fill: true as const, alt, className, sizes: "(max-width: 768px) 100vw, 50vw" }
    : { width: width ?? 400, height: height ?? 300, alt, className }

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
