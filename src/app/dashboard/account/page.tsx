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
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/sign-in")
        return
      }

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
  }, [router, supabase])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setProfileMessage(null)

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
    await supabase.auth.signOut()
    router.push("/sign-in")
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
