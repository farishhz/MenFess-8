"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Shield,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Filter,
  LogOut,
  Users,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Monitor,
  MapPin,
  UserX,
  UserCheck,
  Mail,
  GraduationCap,
  Loader2,
  Search,
  Smartphone,
  Tablet,
  Laptop,
  PenSquare,
} from "lucide-react"
import { motion } from "framer-motion"
import { parseUserAgent, formatDeviceInfo } from "@/lib/device-parser"

interface Menfess {
  id: number
  nickname: string
  target: string | null
  message: string
  category: string
  mood: string
  anonymousBadge: string
  status: string
  likesCount: number
  commentsCount: number
  ipAddress: string
  deviceInfo: string
  createdAt: string
  isNightConfess: boolean
  kelas: string | null
  userEmail: string | null
  userName: string | null
}

interface BannedWord {
  id: number
  word: string
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
  createdAt: string
  isBanned: boolean
  banReason: string | null
}

interface Stats {
  totalPosts: number
  pendingPosts: number
  approvedPosts: number
  rejectedPosts: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [allMenfess, setAllMenfess] = useState<Menfess[]>([])
  const [bannedWords, setBannedWords] = useState<BannedWord[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [newWord, setNewWord] = useState("")
  const [banReason, setBanReason] = useState<Record<string, string>>({})
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    pendingPosts: 0,
    approvedPosts: 0,
    rejectedPosts: 0,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch("/api/admin/check")
      if (response.ok) {
        setIsAuthenticated(true)
        loadData()
      } else {
        router.push("/admin/login")
      }
    } catch (error) {
      router.push("/admin/login")
    } finally {
      setLoading(false)
    }
  }

  async function loadData() {
    try {
      const [allRes, wordsRes, statsRes, usersRes] = await Promise.all([
        fetch("/api/admin/menfess"),
        fetch("/api/admin/banned-words"),
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
      ])

      const all = await allRes.json()
      const words = await wordsRes.json()
      const statsData = await statsRes.json()
      const usersData = await usersRes.json()

      setAllMenfess(all.menfess || [])
      setBannedWords(words.words || [])
      setStats(statsData)
      setUsers(usersData.users || [])
    } catch (error) {
      toast.error("Gagal memuat data")
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus menfess ini?")) return

    setDeletingId(id)

    try {
      const response = await fetch(`/api/admin/menfess/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Menfess berhasil dihapus")
        
        // Immediately update UI - remove from state
        setAllMenfess(prev => prev.filter(m => m.id !== id))
        
        // Reload data to sync with backend
        setTimeout(() => {
          loadData()
        }, 500)
      } else {
        console.error('Delete failed:', data)
        toast.error(data.error || "Gagal menghapus menfess")
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error("Gagal menghapus menfess")
    } finally {
      setDeletingId(null)
    }
  }

  async function handleBanUser(userId: string) {
    const reason = banReason[userId]?.trim()
    if (!reason) {
      toast.error("Alasan ban harus diisi")
      return
    }

    try {
      const response = await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, reason }),
      })

      if (response.ok) {
        toast.success("User berhasil di-ban")
        setBanReason(prev => ({ ...prev, [userId]: "" }))
        loadData()
      } else {
        const data = await response.json()
        toast.error(data.error || "Gagal ban user")
      }
    } catch (error) {
      toast.error("Gagal ban user")
    }
  }

  async function handleUnbanUser(userId: string) {
    try {
      const response = await fetch("/api/admin/users/unban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        toast.success("User berhasil di-unban")
        loadData()
      } else {
        const data = await response.json()
        toast.error(data.error || "Gagal unban user")
      }
    } catch (error) {
      toast.error("Gagal unban user")
    }
  }

  async function handleAddBannedWord() {
    if (!newWord.trim()) return

    try {
      const response = await fetch("/api/admin/banned-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: newWord.toLowerCase() }),
      })

      if (response.ok) {
        toast.success("Kata dilarang ditambahkan")
        setNewWord("")
        loadData()
      }
    } catch (error) {
      toast.error("Gagal menambahkan kata")
    }
  }

  async function handleRemoveBannedWord(id: number) {
    try {
      const response = await fetch(`/api/admin/banned-words/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Kata dilarang dihapus")
        loadData()
      }
    } catch (error) {
      toast.error("Gagal menghapus kata")
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      router.push("/admin/login")
    } catch (error) {
      toast.error("Gagal logout")
    }
  }

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase()
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">MenFess 8</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/post">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  <PenSquare className="mr-2 h-4 w-4" />
                  Admin Post
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={<MessageSquare className="h-5 w-5" />}
            title="Total Posts"
            value={stats.totalPosts}
            color="blue"
          />
          <StatsCard
            icon={<Users className="h-5 w-5" />}
            title="Total Users"
            value={users.length}
            color="purple"
          />
          <StatsCard
            icon={<CheckCircle className="h-5 w-5" />}
            title="Active Users"
            value={users.filter(u => !u.isBanned).length}
            color="green"
          />
          <StatsCard
            icon={<UserX className="h-5 w-5" />}
            title="Banned Users"
            value={users.filter(u => u.isBanned).length}
            color="red"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-gray-800/80">
            <TabsTrigger value="all">
              Semua Menfess ({allMenfess.length})
            </TabsTrigger>
            <TabsTrigger value="users">
              User Management ({users.length})
            </TabsTrigger>
            <TabsTrigger value="words">Banned Words</TabsTrigger>
          </TabsList>

          {/* All Posts Tab */}
          <TabsContent value="all" className="space-y-4">
            {allMenfess.length === 0 ? (
              <Card className="p-12 text-center backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
                <p className="text-muted-foreground">Belum ada menfess</p>
              </Card>
            ) : (
              allMenfess.map((menfess) => (
                <MenfessCard
                  key={menfess.id}
                  menfess={menfess}
                  onDelete={handleDelete}
                  isDeleting={deletingId === menfess.id}
                />
              ))
            )}
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-4">
            {/* Search Bar */}
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-purple-200/50 dark:border-purple-500/20">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari user berdasarkan nama atau email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {filteredUsers.length === 0 ? (
              <Card className="p-12 text-center backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
                <p className="text-muted-foreground">
                  {searchQuery ? "Tidak ada user yang cocok dengan pencarian" : "Belum ada user terdaftar"}
                </p>
              </Card>
            ) : (
              filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-purple-200/50 dark:border-purple-500/20"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold">{user.name}</h3>
                          {user.isBanned ? (
                            <Badge variant="destructive" className="gap-1">
                              <UserX className="h-3 w-3" />
                              Banned
                            </Badge>
                          ) : (
                            <Badge variant="default" className="gap-1 bg-green-500">
                              <UserCheck className="h-3 w-3" />
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Terdaftar: {new Date(user.createdAt).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {user.isBanned ? (
                      <>
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30">
                          <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                            Alasan Ban:
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            {user.banReason}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleUnbanUser(user.id)}
                          variant="default"
                          className="w-full bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Unban User
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Alasan Ban:</label>
                          <Textarea
                            placeholder="Masukkan alasan ban (contoh: Spam, konten tidak pantas, dll)"
                            value={banReason[user.id] || ""}
                            onChange={(e) =>
                              setBanReason(prev => ({ ...prev, [user.id]: e.target.value }))
                            }
                            className="min-h-[60px]"
                          />
                        </div>
                        <Button
                          onClick={() => handleBanUser(user.id)}
                          variant="destructive"
                          className="w-full"
                          size="sm"
                          disabled={!banReason[user.id]?.trim()}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Ban User
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Banned Words Tab */}
          <TabsContent value="words">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle>Kelola Kata Terlarang</CardTitle>
                <CardDescription>
                  Tambah atau hapus kata-kata yang tidak diperbolehkan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Tambah kata terlarang..."
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddBannedWord()
                      }
                    }}
                  />
                  <Button onClick={handleAddBannedWord}>Tambah</Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {bannedWords.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada kata terlarang</p>
                  ) : (
                    bannedWords.map((word) => (
                      <Badge
                        key={word.id}
                        variant="destructive"
                        className="text-sm py-2 px-3 cursor-pointer hover:bg-destructive/80"
                        onClick={() => handleRemoveBannedWord(word.id)}
                      >
                        {word.word} ✕
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function StatsCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode
  title: string
  value: number
  color: string
}) {
  const colors: Record<string, string> = {
    blue: "from-blue-500 to-cyan-500",
    yellow: "from-yellow-500 to-orange-500",
    green: "from-green-500 to-emerald-500",
    red: "from-red-500 to-pink-500",
    purple: "from-purple-500 to-pink-500",
  }

  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div
            className={`p-3 rounded-lg bg-gradient-to-br ${colors[color]} text-white`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MenfessCard({
  menfess,
  onDelete,
  isDeleting,
}: {
  menfess: Menfess
  onDelete: (id: number) => void
  isDeleting?: boolean
}) {
  const deviceInfo = parseUserAgent(menfess.deviceInfo)
  const formattedDevice = formatDeviceInfo(deviceInfo)
  
  // Device icon based on type
  const DeviceIcon = deviceInfo.deviceType === "Mobile" 
    ? Smartphone 
    : deviceInfo.deviceType === "Tablet" 
    ? Tablet 
    : Laptop

  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-purple-200/50 dark:border-purple-500/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="font-mono">
                {menfess.anonymousBadge}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {menfess.nickname}
              </span>
              <Badge
                variant={
                  menfess.status === "approved"
                    ? "default"
                    : menfess.status === "pending"
                    ? "secondary"
                    : "destructive"
                }
              >
                {menfess.status}
              </Badge>
            </div>
            {menfess.target && (
              <p className="text-sm text-muted-foreground">
                To: <span className="font-medium">{menfess.target}</span>
              </p>
            )}
            <div className="flex gap-2 flex-wrap">
              <Badge>{menfess.category}</Badge>
              <Badge variant="outline">{menfess.mood}</Badge>
              {menfess.isNightConfess && (
                <Badge variant="outline" className="border-purple-400">🌙 Night Confess</Badge>
              )}
              {menfess.kelas && (
                <Badge variant="outline" className="border-green-400 gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {menfess.kelas}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
          {menfess.message}
        </p>

        <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
          <span>❤️ {menfess.likesCount} likes</span>
          <span>💬 {menfess.commentsCount} comments</span>
          <span>📅 {new Date(menfess.createdAt).toLocaleString("id-ID")}</span>
        </div>

        {/* User Info - Email & Name */}
        {(menfess.userEmail || menfess.userName) && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-900 dark:text-green-100">Pengirim</span>
            </div>
            <div className="space-y-1">
              {menfess.userName && (
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {menfess.userName}
                </p>
              )}
              {menfess.userEmail && (
                <p className="text-sm text-green-700 dark:text-green-300 break-all">
                  {menfess.userEmail}
                </p>
              )}
            </div>
          </div>
        )}

        {/* IP & Device Info - Enhanced */}
        <div className="grid grid-cols-1 gap-3">
          {/* IP Address */}
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">IP Address</span>
            </div>
            <p className="text-sm font-mono text-blue-700 dark:text-blue-300">
              {menfess.ipAddress}
            </p>
          </div>
          
          {/* Device Info - Parsed */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-500/30">
            <div className="flex items-center gap-2 mb-3">
              <DeviceIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-semibold text-purple-900 dark:text-purple-100">Device Information</span>
            </div>
            
            <div className="space-y-2">
              {/* Device Type & Name */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-700 dark:text-purple-300">Device:</span>
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  {deviceInfo.device}
                </span>
              </div>
              
              {/* Browser */}
              {deviceInfo.browser !== "Unknown" && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-700 dark:text-purple-300">Browser:</span>
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    {deviceInfo.browser} {deviceInfo.browserVersion && `v${deviceInfo.browserVersion.split('.')[0]}`}
                  </span>
                </div>
              )}
              
              {/* Operating System */}
              {deviceInfo.os !== "Unknown" && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-700 dark:text-purple-300">OS:</span>
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    {deviceInfo.os} {deviceInfo.osVersion}
                  </span>
                </div>
              )}
              
              {/* Device Type Badge */}
              <div className="pt-2 border-t border-purple-200 dark:border-purple-500/30">
                <Badge 
                  variant="outline" 
                  className="w-full justify-center bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-500/50"
                >
                  {deviceInfo.deviceType}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <Button
          onClick={() => onDelete(menfess.id)}
          variant="destructive"
          className="w-full"
          size="sm"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menghapus...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus Menfess
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}