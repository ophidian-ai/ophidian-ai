"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { GlowCard } from "@/components/ui/spotlight-card"
import { GlassButton } from "@/components/ui/glass-button"
import {
  User,
  Lock,
  Mail,
  Check,
  AlertCircle,
  Camera,
  Phone,
  Globe,
  Building2,
  Bell,
  Shield,
  Trash2,
} from "lucide-react"
import { motion } from "motion/react"

type NotificationPref = {
  project_updates: boolean
  billing_alerts: boolean
  marketing_emails: boolean
}

export default function AccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // Profile fields
  const [avatarUrl, setAvatarUrl] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")

  // Password
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Notifications
  const [notifs, setNotifs] = useState<NotificationPref>({
    project_updates: true,
    billing_alerts: true,
    marketing_emails: false,
  })

  // UI state
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/sign-in"); return }

      setUserId(user.id)
      setEmail(user.email ?? "")

      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, phone, company, website_url")
        .eq("id", user.id)
        .single()

      if (data) {
        setFullName(data.full_name ?? "")
        setAvatarUrl(data.avatar_url ?? "")
        setPhone(data.phone ?? "")
        setCompany(data.company ?? "")
        setWebsiteUrl(data.website_url ?? "")
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setProfileMsg(null)
    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, company, website_url: websiteUrl })
      .eq("id", userId)
    setSavingProfile(false)
    setProfileMsg(error
      ? { type: "error", text: error.message }
      : { type: "success", text: "Profile saved." }
    )
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploadingAvatar(true)
    setProfileMsg(null)
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const filePath = `${userId}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true })
    if (uploadError) { setProfileMsg({ type: "error", text: uploadError.message }); setUploadingAvatar(false); return }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath)
    const newUrl = `${publicUrl}?t=${Date.now()}`
    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: newUrl }).eq("id", userId)
    setUploadingAvatar(false)
    if (updateError) { setProfileMsg({ type: "error", text: updateError.message }) }
    else { setAvatarUrl(newUrl); setProfileMsg({ type: "success", text: "Avatar updated." }) }
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { setPasswordMsg({ type: "error", text: "Password must be at least 6 characters." }); return }
    if (newPassword !== confirmPassword) { setPasswordMsg({ type: "error", text: "Passwords do not match." }); return }
    setSavingPassword(true)
    setPasswordMsg(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)
    if (error) { setPasswordMsg({ type: "error", text: error.message }) }
    else { setPasswordMsg({ type: "success", text: "Password updated." }); setNewPassword(""); setConfirmPassword("") }
  }

  const initials = fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
        <p className="text-foreground-muted text-sm mt-1">Manage your profile, security, and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Profile Info ── */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}>
          <GlowCard className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Profile</h2>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative group flex-shrink-0">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="Avatar" width={64} height={64} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-background text-lg font-bold">{initials}</span>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={18} className="text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} aria-label="Upload avatar" />
                </label>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{fullName || "Your Name"}</p>
                <p className="text-xs text-foreground-dim">{uploadingAvatar ? "Uploading..." : "Hover to change photo"}</p>
              </div>
            </div>

            {/* Email — read only */}
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wider">Email</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-foreground-dim cursor-not-allowed">
                <Mail size={15} className="flex-shrink-0" />
                <span className="truncate">{email}</span>
              </div>
              <p className="text-xs text-foreground-dim mt-1">Email cannot be changed here</p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wider">Phone</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-dim" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wider">Company</label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-dim" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wider">Website</label>
              <div className="relative">
                <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-dim" />
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourbusiness.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            {profileMsg && (
              <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${profileMsg.type === "success" ? "bg-accent/10 text-accent" : "bg-error/10 text-error"}`}>
                {profileMsg.type === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
                {profileMsg.text}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <GlassButton size="sm" onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save Profile"}
              </GlassButton>
            </div>
          </GlowCard>
        </motion.div>

        {/* Right column */}
        <div className="space-y-6">

          {/* ── Security ── */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
            <GlowCard className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Lock size={18} className="text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground">Security</h2>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground-muted mb-1.5 uppercase tracking-wider">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {passwordMsg && (
                <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${passwordMsg.type === "success" ? "bg-accent/10 text-accent" : "bg-error/10 text-error"}`}>
                  {passwordMsg.type === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
                  {passwordMsg.text}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <GlassButton size="sm" onClick={handleChangePassword} disabled={savingPassword}>
                  {savingPassword ? "Updating..." : "Update Password"}
                </GlassButton>
              </div>
            </GlowCard>
          </motion.div>

          {/* ── Notifications ── */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}>
            <GlowCard className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bell size={18} className="text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground">Notifications</h2>
              </div>

              {([
                { key: "project_updates", label: "Project updates", desc: "Status changes, milestones, and deliverables" },
                { key: "billing_alerts", label: "Billing alerts", desc: "Invoices, payment reminders, and receipts" },
                { key: "marketing_emails", label: "Marketing emails", desc: "Tips, news, and product announcements" },
              ] as const).map(({ key, label, desc }) => (
                <div key={key} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-foreground-dim mt-0.5">{desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))}
                    className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors cursor-pointer ${notifs[key] ? "bg-accent" : "bg-white/10"}`}
                    aria-checked={notifs[key]}
                    role="switch"
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifs[key] ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              ))}
            </GlowCard>
          </motion.div>

          {/* ── Danger Zone ── */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
            <GlowCard className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0">
                  <Shield size={18} className="text-error" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Danger Zone</h2>
                  <p className="text-xs text-foreground-dim">Irreversible actions</p>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-error/10 bg-error/[0.03]">
                <div>
                  <p className="text-sm font-medium text-foreground">Delete Account</p>
                  <p className="text-xs text-foreground-dim mt-0.5">Permanently removes your account and all data.</p>
                </div>
                {confirmDelete ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-foreground-muted hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="text-xs px-3 py-1.5 rounded-lg bg-error/20 text-error hover:bg-error/30 transition-colors cursor-pointer font-medium"
                    >
                      Confirm Delete
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-error/20 text-error hover:bg-error/10 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                )}
              </div>
            </GlowCard>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
