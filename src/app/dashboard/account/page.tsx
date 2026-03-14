"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { GlowCard } from "@/components/ui/spotlight-card"
import { GlassButton } from "@/components/ui/glass-button"
import {
  LayoutDashboard,
  Bot,
  BarChart3,
  Package,
  Settings,
  LogOut,
  User,
  Lock,
  Mail,
  Check,
  AlertCircle,
  FolderOpen,
  Camera,
} from "lucide-react"
import { motion } from "motion/react"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: false },
  { icon: Bot, label: "AI Integrations", href: "#", active: false },
  { icon: BarChart3, label: "Analytics", href: "#", active: false },
  { icon: FolderOpen, label: "Projects", href: "#", active: false },
  { icon: Package, label: "Products", href: "#", active: false },
  { icon: Settings, label: "Settings", href: "/dashboard/account", active: true },
]

export default function AccountPage() {
  const [profile, setProfile] = useState<{
    full_name: string
    email: string
    avatar_url: string
  } | null>(null)
  const [fullName, setFullName] = useState("")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/sign-in")
        return
      }

      setUserId(user.id)

      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, avatar_url")
        .eq("id", user.id)
        .single()

      if (data) {
        setProfile(data)
        setFullName(data.full_name || "")
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setProfileMessage(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id)

    setSavingProfile(false)

    if (error) {
      setProfileMessage({ type: "error", text: error.message })
    } else {
      setProfileMessage({ type: "success", text: "Profile updated." })
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    setUploadingAvatar(true)
    setProfileMessage(null)

    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const filePath = `${userId}/avatar.${ext}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setProfileMessage({ type: "error", text: uploadError.message })
      setUploadingAvatar(false)
      return
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath)

    // Update profile with avatar URL (add cache buster)
    const avatarUrl = `${publicUrl}?t=${Date.now()}`
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId)

    setUploadingAvatar(false)

    if (updateError) {
      setProfileMessage({ type: "error", text: updateError.message })
    } else {
      setProfile((prev) => prev ? { ...prev, avatar_url: avatarUrl } : prev)
      setProfileMessage({ type: "success", text: "Avatar updated." })
    }
  }

  const handleChangePassword = async () => {
    setSavingPassword(true)
    setPasswordMessage(null)

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters." })
      setSavingPassword(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." })
      setSavingPassword(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    setSavingPassword(false)

    if (error) {
      setPasswordMessage({ type: "error", text: error.message })
    } else {
      setPasswordMessage({ type: "success", text: "Password updated." })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground-muted text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 h-screen fixed left-0 top-0 bg-background/80 backdrop-blur-xl border-r border-primary/10 flex flex-col z-30">
        <div className="p-6 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo_icon.png" alt="OphidianAI" width={32} height={32} className="h-8 w-8" />
            <span className="text-lg font-semibold text-foreground tracking-tight">
              OphidianAI
            </span>
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-foreground-muted hover:text-foreground hover:bg-white/5"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-primary/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="ml-64 p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
          <p className="text-foreground-muted text-sm mt-1">
            Manage your profile and security
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="dashboard-card"
          >
            <GlowCard className="glass rounded-xl border border-primary/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Profile</h2>
              </div>

              <div className="space-y-4">
                {/* Avatar Upload */}
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt="Avatar"
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-background text-lg font-bold">
                          {fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera size={18} className="text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploadingAvatar}
                        aria-label="Upload avatar"
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm text-foreground font-medium">Profile Photo</p>
                    <p className="text-xs text-foreground-dim">
                      {uploadingAvatar ? "Uploading..." : "Hover and click to change"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-foreground-muted mb-1.5">Email</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground-dim">
                    <Mail size={16} />
                    {profile?.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-foreground-muted mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder-foreground-dim focus:outline-none focus:border-primary/40 transition-colors"
                  />
                </div>

                {profileMessage && (
                  <div
                    className={`flex items-center gap-2 text-sm p-2 rounded-lg ${
                      profileMessage.type === "success"
                        ? "bg-primary/10 text-primary"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {profileMessage.type === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
                    {profileMessage.text}
                  </div>
                )}

                <div className="flex justify-end">
                  <GlassButton
                    size="sm"
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                  >
                    {savingProfile ? "Saving..." : "Save Profile"}
                  </GlassButton>
                </div>
              </div>
            </GlowCard>
          </motion.div>

          {/* Password Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="dashboard-card"
          >
            <GlowCard className="glass rounded-xl border border-primary/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock size={20} className="text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-foreground-muted mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder-foreground-dim focus:outline-none focus:border-primary/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-foreground-muted mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder-foreground-dim focus:outline-none focus:border-primary/40 transition-colors"
                  />
                </div>

                {passwordMessage && (
                  <div
                    className={`flex items-center gap-2 text-sm p-2 rounded-lg ${
                      passwordMessage.type === "success"
                        ? "bg-primary/10 text-primary"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {passwordMessage.type === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
                    {passwordMessage.text}
                  </div>
                )}

                <div className="flex justify-end">
                  <GlassButton
                    size="sm"
                    onClick={handleChangePassword}
                    disabled={savingPassword}
                  >
                    {savingPassword ? "Updating..." : "Update Password"}
                  </GlassButton>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
