"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Shield,
  Send,
  Music2,
  Image,
  Megaphone,
  MessageSquare,
  FileText,
  Pin,
  Sparkles,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Crown,
  Link as LinkIcon,
  ImageIcon,
} from "lucide-react"
import { parseSongUrl } from "@/lib/song-parser"

const postTypes = [
  { id: "menfess", label: "Menfess Biasa", icon: MessageSquare, desc: "Post menfess anonim standar" },
  { id: "songfess", label: "SongFess", icon: Music2, desc: "Post dengan embed lagu" },
  { id: "announcement", label: "Pengumuman", icon: Megaphone, desc: "Pengumuman khusus admin" },
  { id: "text", label: "Hanya Tulisan", icon: FileText, desc: "Post teks tanpa form penerima" },
  { id: "photo", label: "Foto + Caption", icon: Image, desc: "Post gambar dengan caption" },
]

const highlightColors = [
  { id: "purple", label: "Purple", class: "from-purple-500 to-pink-500" },
  { id: "blue", label: "Blue", class: "from-blue-500 to-cyan-500" },
  { id: "green", label: "Green", class: "from-green-500 to-emerald-500" },
  { id: "orange", label: "Orange", class: "from-orange-500 to-red-500" },
  { id: "gold", label: "Gold", class: "from-yellow-400 to-amber-500" },
]

function URLImageInput({ 
  value, 
  onChange, 
  label,
  description,
  placeholder,
  previewSize = "normal"
}: { 
  value: string
  onChange: (url: string) => void
  label: string
  description: string
  placeholder?: string
  previewSize?: "small" | "normal"
}) {
  const [error, setError] = useState(false)

  const handleImageError = () => {
    setError(true)
  }

  const handleImageLoad = () => {
    setError(false)
  }

  return (
    <div className="space-y-2">
      <Label className="text-purple-200">{label}</Label>
      <p className="text-xs text-purple-400 mb-2">{description}</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
          <Input
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              setError(false)
            }}
            placeholder={placeholder || "https://example.com/image.jpg"}
            className="pl-10 bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400"
          />
        </div>
      </div>
      {value && (
        <div className={`relative rounded-xl overflow-hidden border-2 ${error ? 'border-red-500/50' : 'border-purple-500/30'} mt-2`}>
          {error ? (
            <div className={`flex flex-col items-center justify-center bg-red-500/10 ${previewSize === "small" ? "h-24" : "h-40"}`}>
              <ImageIcon className="h-8 w-8 text-red-400 mb-2" />
              <p className="text-red-400 text-sm">Gambar tidak dapat dimuat</p>
              <p className="text-red-300 text-xs">Pastikan URL valid dan dapat diakses</p>
            </div>
          ) : (
            <img 
              src={value} 
              alt="Preview" 
              className={`w-full object-cover ${previewSize === "small" ? "h-24" : "h-40"}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminPostPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [postType, setPostType] = useState("menfess")
  const [adminName, setAdminName] = useState("Admin")
  const [adminPhoto, setAdminPhoto] = useState("")
  const [message, setMessage] = useState("")
  const [target, setTarget] = useState("")
  const [nickname, setNickname] = useState("")
  const [category, setCategory] = useState("random")
  const [mood, setMood] = useState("happy")
  const [songUrl, setSongUrl] = useState("")
  const [songMood, setSongMood] = useState("crush")
  const [imageUrl, setImageUrl] = useState("")
  const [isPinned, setIsPinned] = useState(false)
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [highlightColor, setHighlightColor] = useState("purple")

  const parsedSong = songUrl ? parseSongUrl(songUrl) : null

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch("/api/admin/check", {
        credentials: 'include'
      })
      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        router.push("/admin/login")
      }
    } catch (error) {
      router.push("/admin/login")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/admin/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          postType,
          adminName,
          adminPhoto: adminPhoto || null,
          message,
          target: postType === "menfess" ? target : null,
          nickname: postType === "menfess" ? nickname : adminName,
          category,
          mood,
          songUrl: postType === "songfess" ? songUrl : null,
          songMood: postType === "songfess" ? songMood : null,
          imageUrl: postType === "photo" ? imageUrl : null,
          isPinned,
          isHighlighted,
          highlightColor: isHighlighted ? highlightColor : null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Post admin berhasil dibuat! 🎉")
        setMessage("")
        setTarget("")
        setSongUrl("")
        setImageUrl("")
        setIsPinned(false)
        setIsHighlighted(false)
      } else {
        toast.error(data.error || "Gagal membuat post")
      }
    } catch (error) {
      toast.error("Gagal membuat post")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-black to-pink-950">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-500/30 rounded-full"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: (i % 5) * 0.4,
            }}
          />
        ))}
      </div>

      <header className="border-b border-purple-500/30 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/admin/dashboard")}
                className="text-purple-300 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 shadow-lg shadow-purple-500/50"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Crown className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Admin Post
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </h1>
                <p className="text-sm text-purple-300">Buat post dengan kekuatan admin</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/5 backdrop-blur-md border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  Identitas Admin
                </CardTitle>
                <CardDescription className="text-purple-300">
                  Kustomisasi identitas admin untuk post ini
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-purple-200">Nama Admin</Label>
                  <Input
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Admin, Bot, Kak Moderator..."
                    className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400"
                  />
                </div>
                <URLImageInput
                  value={adminPhoto}
                  onChange={setAdminPhoto}
                  label="Foto Profil Admin (Opsional)"
                  description="Masukkan URL gambar untuk foto profil admin"
                  placeholder="https://example.com/avatar.jpg"
                  previewSize="small"
                />
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Tipe Post</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {postTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <motion.button
                        key={type.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPostType(type.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          postType === type.id
                            ? "border-purple-500 bg-purple-500/20"
                            : "border-purple-500/30 bg-white/5 hover:border-purple-500/50"
                        }`}
                      >
                        <Icon className={`h-6 w-6 mb-2 ${postType === type.id ? "text-purple-400" : "text-purple-500"}`} />
                        <p className="font-semibold text-white text-sm">{type.label}</p>
                        <p className="text-xs text-purple-300 mt-1">{type.desc}</p>
                      </motion.button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit}>
              <Card className="bg-white/5 backdrop-blur-md border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Konten Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {postType === "menfess" && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-purple-200">Nickname (Opsional)</Label>
                        <Input
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          placeholder="Nickname pengirim..."
                          className="bg-white/10 border-purple-500/30 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-purple-200">Target (Opsional)</Label>
                        <Input
                          value={target}
                          onChange={(e) => setTarget(e.target.value)}
                          placeholder="Untuk siapa..."
                          className="bg-white/10 border-purple-500/30 text-white"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-purple-200">Pesan / Caption</Label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tulis pesan di sini..."
                      className="min-h-[120px] bg-white/10 border-purple-500/30 text-white"
                    />
                  </div>

                  {postType === "songfess" && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-purple-200">Link Lagu (YouTube/Spotify)</Label>
                        <Input
                          value={songUrl}
                          onChange={(e) => setSongUrl(e.target.value)}
                          placeholder="https://youtube.com/watch?v=... atau https://open.spotify.com/track/..."
                          className="bg-white/10 border-purple-500/30 text-white"
                        />
                        {parsedSong?.isValid && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="rounded-xl overflow-hidden border border-purple-500/30 mt-2"
                          >
                            {parsedSong.type === "youtube" ? (
                              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                                <iframe
                                  className="absolute inset-0 w-full h-full"
                                  src={parsedSong.embedUrl}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            ) : (
                              <iframe
                                src={parsedSong.embedUrl}
                                width="100%"
                                height="152"
                                frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              />
                            )}
                          </motion.div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-purple-200">Mood Lagu</Label>
                        <Select value={songMood} onValueChange={setSongMood}>
                          <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="crush">💙 Crush</SelectItem>
                            <SelectItem value="galau">💔 Galau</SelectItem>
                            <SelectItem value="semangat">🔥 Semangat</SelectItem>
                            <SelectItem value="meme">😂 Meme</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {postType === "photo" && (
                    <URLImageInput
                      value={imageUrl}
                      onChange={setImageUrl}
                      label="URL Foto Post"
                      description="Masukkan URL gambar untuk post (pastikan URL dapat diakses publik)"
                      placeholder="https://example.com/photo.jpg"
                      previewSize="normal"
                    />
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-purple-200">Kategori</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="crush">💕 Crush</SelectItem>
                          <SelectItem value="curhat">😔 Curhat</SelectItem>
                          <SelectItem value="humor">😂 Humor</SelectItem>
                          <SelectItem value="random">🎲 Random</SelectItem>
                          <SelectItem value="motivasi">💪 Motivasi</SelectItem>
                          <SelectItem value="announcement">📢 Pengumuman</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Mood</Label>
                      <Select value={mood} onValueChange={setMood}>
                        <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="happy">😊 Happy</SelectItem>
                          <SelectItem value="sad">😢 Sad</SelectItem>
                          <SelectItem value="nervous">😰 Nervous</SelectItem>
                          <SelectItem value="excited">🤩 Excited</SelectItem>
                          <SelectItem value="angry">😠 Angry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-md border-purple-500/30 mt-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                    Fitur Spesial Admin
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Pin className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="font-medium text-white">Pin Post</p>
                        <p className="text-xs text-purple-300">Post akan tampil di atas</p>
                      </div>
                    </div>
                    <Switch checked={isPinned} onCheckedChange={setIsPinned} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-yellow-400" />
                      <div>
                        <p className="font-medium text-white">Highlight Post</p>
                        <p className="text-xs text-purple-300">Beri warna khusus pada post</p>
                      </div>
                    </div>
                    <Switch checked={isHighlighted} onCheckedChange={setIsHighlighted} />
                  </div>

                  {isHighlighted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex gap-2 flex-wrap"
                    >
                      {highlightColors.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => setHighlightColor(color.id)}
                          className={`px-4 py-2 rounded-lg bg-gradient-to-r ${color.class} text-white text-sm font-medium transition-all ${
                            highlightColor === color.id ? "ring-2 ring-white ring-offset-2 ring-offset-purple-950" : "opacity-60 hover:opacity-100"
                          }`}
                        >
                          {color.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-bold text-lg shadow-lg shadow-purple-500/30"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Kirim Post Admin
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 backdrop-blur-md border-purple-500/30 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Preview Post</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminPostPreview
                  adminName={adminName}
                  adminPhoto={adminPhoto}
                  message={message}
                  postType={postType}
                  isPinned={isPinned}
                  isHighlighted={isHighlighted}
                  highlightColor={highlightColor}
                  imageUrl={imageUrl}
                />
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-purple-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10" />
              <CardContent className="pt-6 relative">
                <motion.div
                  className="flex justify-center"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="text-6xl">🐱</div>
                </motion.div>
                <p className="text-center text-purple-300 mt-4 text-sm">
                  Kucing admin siap membantu!
                </p>
                <motion.div
                  className="flex justify-center gap-1 mt-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {[...Array(3)].map((_, i) => (
                    <span key={i} className="text-pink-400 text-lg">♥</span>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function AdminPostPreview({
  adminName,
  adminPhoto,
  message,
  postType,
  isPinned,
  isHighlighted,
  highlightColor,
  imageUrl,
}: {
  adminName: string
  adminPhoto: string
  message: string
  postType: string
  isPinned: boolean
  isHighlighted: boolean
  highlightColor: string
  imageUrl?: string
}) {
  const highlightGradients: Record<string, string> = {
    purple: "from-purple-500/30 via-pink-500/30 to-purple-500/30",
    blue: "from-blue-500/30 via-cyan-500/30 to-blue-500/30",
    green: "from-green-500/30 via-emerald-500/30 to-green-500/30",
    orange: "from-orange-500/30 via-red-500/30 to-orange-500/30",
    gold: "from-yellow-400/30 via-amber-500/30 to-yellow-400/30",
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-xl p-4 border-2 border-purple-500/50 relative overflow-hidden ${
        isHighlighted ? `bg-gradient-to-br ${highlightGradients[highlightColor]}` : "bg-black/30"
      }`}
    >
      {isPinned && (
        <motion.div
          initial={{ x: -50 }}
          animate={{ x: 0 }}
          className="absolute top-2 left-2"
        >
          <Badge className="bg-yellow-500 text-black text-xs gap-1">
            <Pin className="h-3 w-3" />
            Pinned
          </Badge>
        </motion.div>
      )}

      <div className="flex items-start gap-3 mt-6">
        <motion.div
          className="relative flex-shrink-0"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(168, 85, 247, 0.4)",
              "0 0 0 8px rgba(168, 85, 247, 0)",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-0.5">
            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
              {adminPhoto ? (
                <img src={adminPhoto} alt={adminName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg">👑</span>
              )}
            </div>
          </div>
          <motion.div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <CheckCircle className="h-3 w-3 text-white" />
          </motion.div>
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-sm">{adminName || "Admin"}</span>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-1.5 py-0">
              ✓ Admin
            </Badge>
          </div>
          <p className="text-purple-300 text-xs mt-0.5">
            {postType === "announcement" ? "📢 Pengumuman" : postType === "songfess" ? "🎵 SongFess" : postType === "photo" ? "📷 Foto" : "Menfess"}
          </p>
        </div>
      </div>

      <p className="text-white text-sm mt-3 whitespace-pre-wrap">
        {message || "Tulis pesan untuk melihat preview..."}
      </p>

      {postType === "photo" && imageUrl && (
        <div className="mt-3 rounded-lg overflow-hidden">
          <img src={imageUrl} alt="Post" className="w-full h-auto max-h-40 object-cover" />
        </div>
      )}

      <motion.div
        className="absolute bottom-2 right-2"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-2xl">🐱</span>
      </motion.div>
    </motion.div>
  )
}