"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Settings, LogOut, LayoutDashboard } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  PopoverFooter,
} from "@/components/ui/popover"
import { GlassButton } from "@/components/ui/glass-button"
import { createClient } from "@/lib/supabase/client"

interface AccountPopoverProps {
  user?: {
    name: string
    email: string
    avatarUrl?: string
    initials: string
  } | null
}

export function AccountPopover({ user }: AccountPopoverProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }
  // Not signed in -- show sign in button
  if (!user) {
    return (
      <GlassButton size="sm" href="/sign-in">
        Sign In
      </GlassButton>
    )
  }

  // Signed in -- show avatar with popover
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
          <Avatar className="h-8 w-8">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end" sideOffset={8}>
        <PopoverHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <PopoverTitle className="truncate text-sm">
                {user.name}
              </PopoverTitle>
              <PopoverDescription className="truncate text-xs">
                {user.email}
              </PopoverDescription>
            </div>
          </div>
        </PopoverHeader>
        <PopoverBody className="space-y-1 px-2 py-1">
          <Link
            href="/dashboard"
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/account"
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
            Account Settings
          </Link>
        </PopoverBody>
        <PopoverFooter>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-surface-border px-3 py-1.5 text-sm text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  )
}
