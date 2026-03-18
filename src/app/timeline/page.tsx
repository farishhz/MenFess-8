"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share2, TrendingUp, Shuffle, Moon as MoonIcon, ThumbsUp, Laugh, Frown, Zap, Loader2, Sun, Cloud, Sunset, GraduationCap, MoreVertical, Bookmark, Send, Flame, Music2, CheckCircle, Crown, Pin, Megaphone, Image as ImageIcon } from "lucide-react"
import { useEffect, useState, Suspense, useMemo, useCallback } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { toast } from "sonner"
import { useSearchParams, useRouter } from "next/navigation"
import { authClient, useSession } from "@/lib/auth-client"
import Link from "next/link"
import { parseSongUrl } from "@/lib/song-parser"

interface Menfess {
  id: number
  nickname: string
  target: string | null
  message: string
  category: string
  mood: string
  anonymousBadge: string
  likesCount: number
  commentsCount: number
  createdAt: string
  isNightConfess: boolean
  kelas: string | null
  userLiked?: boolean
  userReaction?: string | null
  userBookmarked?: boolean
  reactionCounts?: {
    thumbs: number
    laugh: number
    heart: number
    sad: number
    rofl: number
  }
  songUrl?: string | null
  songType?: string | null
  songMood?: string | null
  isAdminPost?: boolean
  adminName?: string | null
  adminPhoto?: string | null
  adminBadge?: string | null
  postType?: string | null
  isPinned?: boolean
  isHighlighted?: boolean
  highlightColor?: string | null
  imageUrl?: string | null
}

interface Comment {
  id: number
  anonymousBadge: string
  commentText: string
  createdAt: string
  parentCommentId: number | null
  replies?: Comment[]
}

const categoryEmojis: Record<string, string> = {
  crush: "💕",
  curhat: "😔",
  humor: "😂",
  random: "🎲",
  motivasi: "💪",
}

const moodEmojis: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  nervous: "😰",
  excited: "🤩",
  angry: "😠",
  galau: "😔",
  baper: "💔",
}

type TimeOfDay = "morning" | "afternoon" | "evening" | "night"

interface TimeTheme {
  name: string
  icon: React.ReactNode
  bgGradient: string
  cardBg: string
  accentColor: string
  description: string
}

const timeThemes: Record<TimeOfDay, TimeTheme> = {
  morning: {
    name: "Pagi",
    icon: <Sun className="h-4 w-4 sm:h-5 sm:w-5" />,
    bgGradient: "from-orange-100 via-yellow-50 to-amber-100 dark:from-orange-950 dark:via-yellow-950/20 dark:to-amber-950",
    cardBg: "bg-white/90 dark:bg-gray-800/90 border-orange-200/60 dark:border-orange-500/30",
    accentColor: "text-orange-600 dark:text-orange-400",
    description: "Selamat pagi! Semangat memulai hari ☀️"
  },
  afternoon: {
    name: "Siang",
    icon: <Cloud className="h-4 w-4 sm:h-5 sm:w-5" />,
    bgGradient: "from-sky-100 via-blue-50 to-cyan-100 dark:from-sky-950 dark:via-blue-950/20 dark:to-cyan-950",
    cardBg: "bg-white/90 dark:bg-gray-800/90 border-sky-200/60 dark:border-sky-500/30",
    accentColor: "text-sky-600 dark:text-sky-400",
    description: "Selamat siang! Tetap semangat 🌤️"
  },
  evening: {
    name: "Sore",
    icon: <Sunset className="h-4 w-4 sm:h-5 sm:w-5" />,
    bgGradient: "from-rose-100 via-pink-100 to-purple-100 dark:from-rose-950 dark:via-pink-950/20 dark:to-purple-950",
    cardBg: "bg-white/90 dark:bg-gray-800/90 border-rose-200/60 dark:border-rose-500/30",
    accentColor: "text-rose-600 dark:text-rose-400",
    description: "Selamat sore! Nikmati sunset 🌅"
  },
  night: {
    name: "Malam",
    icon: <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5" />,
    bgGradient: "from-purple-100 via-indigo-100 to-blue-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20",
    cardBg: "bg-white/90 dark:bg-gray-800/90 border-purple-200/60 dark:border-purple-500/30",
    accentColor: "text-purple-600 dark:text-purple-400",
    description: "Selamat malam! Waktu yang tepat untuk menfess 🌙"
  }
}

// SongFess gradient themes
const songMoodGradients: Record<string, string> = {
  crush: "from-pink-100 via-rose-100 to-red-100 dark:from-pink-950/40 dark:via-rose-950/40 dark:to-red-950/40",
  galau: "from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40",
  semangat: "from-orange-100 via-amber-100 to-yellow-100 dark:from-orange-950/40 dark:via-amber-950/40 dark:to-yellow-950/40",
  meme: "from-green-100 via-teal-100 to-cyan-100 dark:from-green-950/40 dark:via-teal-950/40 dark:to-cyan-950/40",
}

const songMoodBadges: Record<string, { label: string; emoji: string }> = {
  crush: { label: "SongFess Crush", emoji: "💙" },
  galau: { label: "SongFess Galau", emoji: "💔" },
  semangat: { label: "SongFess Semangat", emoji: "🔥" },
  meme: { label: "SongFess Meme", emoji: "😂" },
}

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) return "morning"
  if (hour >= 11 && hour < 16) return "afternoon"
  if (hour >= 16 && hour < 19) return "evening"
  return "night"
}

function TimelineContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, isPending } = useSession()

  const prefersReducedMotion = useReducedMotion()
  const [menfessList, setMenfessList] = useState<Menfess[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("all")
  const [moodFilter, setMoodFilter] = useState<string | null>(null)
  const [showTopFess, setShowTopFess] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set())
  const [comments, setComments] = useState<Record<number, Comment[]>>({})
  const [newComment, setNewComment] = useState<Record<number, string>>({})
  const [submittingComment, setSubmittingComment] = useState<number | null>(null)
  const [replyTo, setReplyTo] = useState<Record<number, number | null>>({})
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay())
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number } | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const currentTheme = useMemo(() => timeThemes[timeOfDay], [timeOfDay])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/timeline")
    }
  }, [session, isPending, router])

  useEffect(() => {
    const category = searchParams.get("category")
    if (category) {
      setActiveFilter(category)
    }
  }, [searchParams])

  // Update time of day every minute
  useEffect(() => {
    const checkTime = () => {
      setTimeOfDay(getTimeOfDay())
    }
    checkTime()
    const interval = setInterval(checkTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // Check for mobile viewport
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)")
    const handle = () => setIsMobile(mq.matches)
    handle()
    mq.addEventListener("change", handle)
    return () => mq.removeEventListener("change", handle)
  }, [])

  useEffect(() => {
    if (session?.user) {
      fetchMenfess()
    }
  }, [activeFilter, moodFilter, showTopFess, session])

  async function fetchMenfess() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeFilter !== "all") params.append("category", activeFilter)
      if (moodFilter) params.append("mood", moodFilter)
      if (showTopFess) params.append("topFess", "true")

      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/menfess/list?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setMenfessList(data.menfess || [])
    } catch (error) {
      toast.error("Gagal memuat menfess")
    } finally {
      setLoading(false)
    }
  }

  const handleLike = useCallback(async (menfessId: number) => {
    if (!session?.user) {
      toast.error("Silakan login terlebih dahulu")
      return
    }

    // Optimistic update
    setMenfessList(prev =>
      prev.map(m => {
        if (m.id === menfessId) {
          const newLiked = !m.userLiked
          return {
            ...m,
            userLiked: newLiked,
            likesCount: newLiked ? m.likesCount + 1 : m.likesCount - 1,
          }
        }
        return m
      })
    )

    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/menfess/${menfessId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to like")
      }

      const data = await response.json()
      
      // Update with server response
      setMenfessList(prev =>
        prev.map(m =>
          m.id === menfessId
            ? { ...m, likesCount: data.likesCount, userLiked: data.liked }
            : m
        )
      )
    } catch (error) {
      // Revert on error
      setMenfessList(prev =>
        prev.map(m => {
          if (m.id === menfessId) {
            const revertLiked = !m.userLiked
            return {
              ...m,
              userLiked: revertLiked,
              likesCount: revertLiked ? m.likesCount + 1 : m.likesCount - 1,
            }
          }
          return m
        })
      )
      toast.error("Gagal memberikan like")
    }
  }, [session])

  const handleBookmark = useCallback(async (menfessId: number) => {
    if (!session?.user) {
      toast.error("Silakan login terlebih dahulu")
      return
    }

    // Optimistic update
    setMenfessList(prev =>
      prev.map(m =>
        m.id === menfessId
          ? { ...m, userBookmarked: !m.userBookmarked }
          : m
      )
    )

    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/menfess/${menfessId}/bookmark`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to bookmark")
      }

      const data = await response.json()
      
      // Update with server response
      setMenfessList(prev =>
        prev.map(m =>
          m.id === menfessId
            ? { ...m, userBookmarked: data.bookmarked }
            : m
        )
      )
      
      toast.success(data.bookmarked ? "Disimpan!" : "Bookmark dihapus")
    } catch (error) {
      // Revert on error
      setMenfessList(prev =>
        prev.map(m =>
          m.id === menfessId
            ? { ...m, userBookmarked: !m.userBookmarked }
            : m
        )
      )
      toast.error("Gagal menyimpan")
    }
  }, [session])

  const handleShare = useCallback(async (menfess: Menfess) => {
    const shareUrl = `${window.location.origin}/timeline?menfess=${menfess.id}`
    const shareText = `${menfess.message.substring(0, 100)}${menfess.message.length > 100 ? "..." : ""}`
    
    // Try Web Share API first (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `MenFess 8 - ${menfess.nickname}`,
          text: shareText,
          url: shareUrl
        })
        toast.success("Berhasil dibagikan! 🎉")
        return
      } catch (error: any) {
        // User cancelled - don't show error
        if (error.name === 'AbortError') {
          return
        }
        // Fall through to clipboard method
      }
    }
    
    // Fallback: Copy to clipboard
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl)
        toast.success("Link berhasil disalin! 📋")
      } else {
        // Fallback for older browsers or non-secure context
        const textArea = document.createElement("textarea")
        textArea.value = shareUrl
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const successful = document.execCommand('copy')
        textArea.remove()
        
        if (successful) {
          toast.success("Link berhasil disalin! 📋")
        } else {
          throw new Error('Copy failed')
        }
      }
    } catch (err) {
      // Last resort: show the URL in a prompt
      toast.info("Salin link ini:", {
        description: shareUrl,
        duration: 8000,
      })
    }
  }, [])

  // Show confetti animation on milestone reactions
  const handleReaction = useCallback(async (menfessId: number, reactionType: string) => {
    if (!session?.user) {
      toast.error("Silakan login terlebih dahulu")
      return
    }

    const menfess = menfessList.find(m => m.id === menfessId)
    const totalReactions = menfess ? Object.values(menfess.reactionCounts || {}).reduce((a, b) => a + b, 0) : 0

    // Optimistic update
    setMenfessList(prev =>
      prev.map(m => {
        if (m.id === menfessId) {
          const oldReaction = m.userReaction
          const newReaction = oldReaction === reactionType ? null : reactionType
          
          const newReactionCounts = { ...m.reactionCounts }
          
          if (oldReaction && oldReaction in newReactionCounts) {
            newReactionCounts[oldReaction as keyof typeof newReactionCounts] = 
              Math.max(0, newReactionCounts[oldReaction as keyof typeof newReactionCounts] - 1)
          }
          
          if (newReaction && newReaction in newReactionCounts) {
            newReactionCounts[newReaction as keyof typeof newReactionCounts] += 1
          }
          
          return {
            ...m,
            userReaction: newReaction,
            reactionCounts: newReactionCounts,
          }
        }
        return m
      })
    )

    // Show confetti on milestone (10, 25, 50, 100)
    if (!prefersReducedMotion && !isMobile && (totalReactions === 9 || totalReactions === 24 || totalReactions === 49 || totalReactions === 99)) {
      setConfetti({ id: menfessId, x: window.innerWidth / 2, y: window.innerHeight / 2 })
      setTimeout(() => setConfetti(null), 2400)
    }

    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/menfess/${menfessId}/reaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reactionType }),
      })

      if (!response.ok) {
        throw new Error("Failed to react")
      }

      const data = await response.json()
      
      setMenfessList(prev =>
        prev.map(m =>
          m.id === menfessId
            ? { 
                ...m, 
                userReaction: data.reactionType,
                reactionCounts: data.reactionCounts,
              }
            : m
        )
      )
    } catch (error) {
      fetchMenfess()
      toast.error("Gagal memberikan reaksi")
    }
  }, [session, menfessList])

  async function loadComments(menfessId: number) {
    try {
      const response = await fetch(`/api/menfess/${menfessId}/comments`)
      const data = await response.json()
      setComments(prev => ({ ...prev, [menfessId]: data.comments || [] }))
    } catch (error) {
      toast.error("Gagal memuat komentar")
    }
  }

  const handleCommentSubmit = useCallback(async (menfessId: number) => {
    if (!newComment[menfessId]?.trim()) return

    if (!session?.user) {
      toast.error("Silakan login terlebih dahulu")
      return
    }

    setSubmittingComment(menfessId)
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/menfess/${menfessId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          commentText: newComment[menfessId],
          parentCommentId: replyTo[menfessId] || null,
        }),
      })

      if (response.ok) {
        toast.success("Komentar terkirim!")
        setNewComment(prev => ({ ...prev, [menfessId]: "" }))
        setReplyTo(prev => ({ ...prev, [menfessId]: null }))
        loadComments(menfessId)
        
        setMenfessList(prev =>
          prev.map(m =>
            m.id === menfessId ? { ...m, commentsCount: m.commentsCount + 1 } : m
          )
        )
      }
    } catch (error) {
      toast.error("Gagal mengirim komentar")
    } finally {
      setSubmittingComment(null)
    }
  }, [newComment, session, replyTo])

  const toggleComments = useCallback((menfessId: number) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(menfessId)) {
      newExpanded.delete(menfessId)
    } else {
      newExpanded.add(menfessId)
      if (!comments[menfessId]) {
        loadComments(menfessId)
      }
    }
    setExpandedComments(newExpanded)
  }, [expandedComments, comments])

  async function handleRandomFess() {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch("/api/menfess/random", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.menfess) {
        setMenfessList([data.menfess])
        toast.success("Random fess dimuat! 🎲")
      }
    } catch (error) {
      toast.error("Gagal memuat random fess")
    }
  }

  if (isPending) {
    return (
      <main className={`min-h-screen bg-gradient-to-br ${currentTheme.bgGradient} pt-20 pb-12`}>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </main>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <main className={`min-h-screen bg-gradient-to-br ${currentTheme.bgGradient} pt-20 sm:pt-24 pb-20 transition-colors duration-1000`}>
      {/* Confetti Animation */}
      {!prefersReducedMotion && !isMobile && confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: confetti.x,
                top: confetti.y,
                backgroundColor: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'][i % 5],
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0.5],
                x: (Math.random() - 0.5) * 220,
                y: Math.random() * 220,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1.4,
                ease: "easeOut",
                delay: i * 0.012,
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button - Quick Post */}
      <Link href="/submit">
        <motion.button
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg hover:shadow-xl flex items-center justify-center text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Send className="h-6 w-6" />
        </motion.button>
      </Link>

      {/* Optimized decorative elements - reduce for mobile */}
      {timeOfDay === "night" && !prefersReducedMotion && !isMobile && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-60">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${(i * 17) % 100}%`,
                top: `${(i * 23) % 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2 + (i % 3),
                repeat: Infinity,
                delay: (i % 5) * 0.4,
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 max-w-4xl relative z-10">
        {/* Time Badge - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6"
        >
          <Card className={`${currentTheme.cardBg} backdrop-blur-sm sm:backdrop-blur-md shadow-lg`}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={`${currentTheme.accentColor} flex-shrink-0`}>
                    {currentTheme.icon}
                  </div>
                  <div className="min-w-0">
                    <h2 className={`text-sm sm:text-lg font-bold ${currentTheme.accentColor} truncate`}>
                      {currentTheme.name} Mode
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                      {currentTheme.description}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Header Actions - Mobile Optimized */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setShowTopFess(!showTopFess)
                setActiveFilter("all")
              }}
              size="sm"
              variant={showTopFess ? "default" : "outline"}
              className={`${showTopFess ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : ''} text-xs sm:text-sm`}
            >
              <TrendingUp className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Top Fess
            </Button>
            <Button onClick={handleRandomFess} size="sm" variant="outline" className="text-xs sm:text-sm">
              <Shuffle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Random
            </Button>
          </div>

          {/* Category Filter - Mobile Optimized */}
          <Tabs value={activeFilter} onValueChange={setActiveFilter}>
            <TabsList className={`grid w-full grid-cols-6 ${currentTheme.cardBg} backdrop-blur-md h-auto`}>
              <TabsTrigger value="all" className="text-xs sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2">Semua</TabsTrigger>
              <TabsTrigger value="crush" className="text-base sm:text-lg py-1.5 sm:py-2">💕</TabsTrigger>
              <TabsTrigger value="curhat" className="text-base sm:text-lg py-1.5 sm:py-2">😔</TabsTrigger>
              <TabsTrigger value="humor" className="text-base sm:text-lg py-1.5 sm:py-2">😂</TabsTrigger>
              <TabsTrigger value="random" className="text-base sm:text-lg py-1.5 sm:py-2">🎲</TabsTrigger>
              <TabsTrigger value="motivasi" className="text-base sm:text-lg py-1.5 sm:py-2">💪</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Mood Filter - Mobile Optimized */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground mr-1 self-center">Mood:</span>
            {Object.entries(moodEmojis).map(([mood, emoji]) => (
              <Button
                key={mood}
                size="sm"
                variant={moodFilter === mood ? "default" : "outline"}
                onClick={() => setMoodFilter(moodFilter === mood ? null : mood)}
                className="text-sm sm:text-base h-8 sm:h-9 px-2 sm:px-3"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>

        {/* Menfess List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : menfessList.length === 0 ? (
          <Card className={`p-8 sm:p-12 text-center ${currentTheme.cardBg} backdrop-blur-sm sm:backdrop-blur-md`}>
            <p className="text-sm sm:text-base text-muted-foreground">Belum ada menfess untuk filter ini 😔</p>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {menfessList.map((menfess, index) => {
              const totalReactions = Object.values(menfess.reactionCounts || {}).reduce((a, b) => a + b, 0)
              const isTrending = totalReactions >= 20 || menfess.likesCount >= 15
              const isSongFess = !!(menfess.songUrl && menfess.songType)
              const parsedSong = isSongFess ? parseSongUrl(menfess.songUrl!) : null
              const songGradient = menfess.songMood ? songMoodGradients[menfess.songMood] : ""
              const isAdmin = menfess.isAdminPost
              const highlightGradients: Record<string, string> = {
                purple: "from-purple-500/20 via-pink-500/20 to-purple-500/20 dark:from-purple-500/30 dark:via-pink-500/30 dark:to-purple-500/30",
                blue: "from-blue-500/20 via-cyan-500/20 to-blue-500/20 dark:from-blue-500/30 dark:via-cyan-500/30 dark:to-blue-500/30",
                green: "from-green-500/20 via-emerald-500/20 to-green-500/20 dark:from-green-500/30 dark:via-emerald-500/30 dark:to-green-500/30",
                orange: "from-orange-500/20 via-red-500/20 to-orange-500/20 dark:from-orange-500/30 dark:via-red-500/30 dark:to-orange-500/30",
                gold: "from-yellow-400/20 via-amber-500/20 to-yellow-400/20 dark:from-yellow-400/30 dark:via-amber-500/30 dark:to-yellow-400/30",
              }
              
              return (
                <motion.div
                  key={menfess.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.22), duration: 0.22, ease: "easeOut" }}
                  className="transform-gpu"
                >
                  {/* ADMIN POST CARD - Special Animated Design */}
                  {isAdmin ? (
                    <Card className={`relative overflow-hidden border ${menfess.isHighlighted && menfess.highlightColor ? `bg-gradient-to-br ${highlightGradients[menfess.highlightColor]}` : 'bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 dark:from-purple-950/50 dark:via-pink-950/50 dark:to-orange-950/50'} border-purple-400/50 dark:border-purple-500/50 backdrop-blur-sm sm:backdrop-blur-md transition-all duration-200`}>
                      { !isMobile && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-10 animate-pulse" />
                      )}
                      { !prefersReducedMotion && !isMobile && (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          {[...Array(8)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1.5 h-1.5 rounded-full"
                              style={{
                                left: `${(i * 17) % 100}%`,
                                top: `${(i * 23) % 100}%`,
                                backgroundColor: ['#A855F7', '#EC4899', '#F97316', '#FBBF24'][i % 4],
                              }}
                              animate={{
                                opacity: [0, 0.6, 0],
                                scale: [0, 1.05, 0],
                                y: [-8, -20, -8],
                              }}
                              transition={{
                                duration: 2.4 + (i % 2),
                                repeat: Infinity,
                                delay: (i % 4) * 0.45,
                              }}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Pinned Badge */}
                      {menfess.isPinned && (
                        <motion.div
                          className="absolute top-2 left-2 z-20"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 260, damping: 22 }}
                        >
                          <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black gap-1 shadow-lg">
                            <Pin className="h-3 w-3" />
                            Pinned
                          </Badge>
                        </motion.div>
                      )}
                      
                      {/* Post Type Badge */}
                      {menfess.postType === 'announcement' && (
                        <motion.div
                          className="absolute top-2 right-2 z-20"
                          animate={!prefersReducedMotion && !isMobile ? { scale: [1, 1.05, 1] } : undefined}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white gap-1">
                            <Megaphone className="h-3 w-3" />
                            Pengumuman
                          </Badge>
                        </motion.div>
                      )}
                      
                      {/* Cute Cat Animation */}
                      { !prefersReducedMotion && !isMobile && (
                        <motion.div
                          className="absolute bottom-3 right-3 z-20 text-3xl"
                          animate={{ y: [0, -4, 0], rotate: [0, 4, -4, 0] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        >
                          🐱
                        </motion.div>
                      )}
                      
                      {/* Sparkle effects around cat */}
                      { !prefersReducedMotion && !isMobile && (
                        <motion.div
                          className="absolute bottom-8 right-8 z-10"
                          animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.4, repeat: Infinity }}
                        >
                          <span className="text-yellow-400 text-sm">✨</span>
                        </motion.div>
                      )}
                      { !prefersReducedMotion && !isMobile && (
                        <motion.div
                          className="absolute bottom-12 right-4 z-10"
                          animate={{ scale: [1, 0.85, 1], opacity: [0.3, 0.8, 0.3] }}
                          transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
                        >
                          <span className="text-pink-400 text-xs">💖</span>
                        </motion.div>
                      )}
                      
                      {/* Card Header - Admin Style */}
                      <CardHeader className="p-3 sm:p-4 border-b border-purple-300/50 dark:border-purple-500/50 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                            {/* Admin Avatar with animated ring */}
                            <div className="relative flex-shrink-0">
                              <motion.div
                                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-[3px]"
                                animate={!prefersReducedMotion && !isMobile ? {
                                  boxShadow: [
                                    "0 0 0 0 rgba(168, 85, 247, 0.4)",
                                    "0 0 0 8px rgba(168, 85, 247, 0)",
                                  ],
                                } : undefined}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                                  {menfess.adminPhoto ? (
                                    <img src={menfess.adminPhoto} alt={menfess.adminName || "Admin"} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-xl">👑</span>
                                  )}
                                </div>
                              </motion.div>
                              {/* Verified badge */}
                              <motion.div
                                className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-lg"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                              </motion.div>
                            </div>

                            {/* Admin Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-sm sm:text-base text-foreground">
                                  {menfess.adminName || "Admin RPL"}
                                </span>
                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] sm:text-xs px-1.5 py-0 gap-0.5">
                                  <CheckCircle className="h-2.5 w-2.5" />
                                  Admin
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {menfess.postType === 'announcement' ? '📢 Pengumuman Resmi' : 
                                 menfess.postType === 'songfess' ? '🎵 SongFess Admin' : 
                                 menfess.postType === 'photo' ? '📸 Foto' :
                                 '✨ Admin Post'}
                              </p>
                            </div>
                          </div>

                          {/* Crown icon for admin */}
                          <motion.div
                            animate={!prefersReducedMotion && !isMobile ? { rotate: [0, 10, -10, 0] } : undefined}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            <Crown className="h-6 w-6 text-yellow-500" />
                          </motion.div>
                        </div>

                        {/* Tags for admin post */}
                        <div className="flex gap-1.5 sm:gap-2 flex-wrap mt-2.5 sm:mt-3">
                          <Badge className="text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                            {categoryEmojis[menfess.category] || '📢'} {menfess.category}
                          </Badge>
                          {menfess.target && (
                            <Badge variant="outline" className="text-xs border-pink-400 text-pink-600 dark:text-pink-400">
                              → {menfess.target}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      {/* Card Content */}
                      <CardContent className="p-4 sm:p-5 space-y-4 relative z-10">
                        <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                          {menfess.message}
                        </p>

                        {/* Image for photo posts */}
                        {menfess.imageUrl && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-xl overflow-hidden border-2 border-purple-300/50 shadow-lg"
                          >
                            <img src={menfess.imageUrl} alt="Admin post" className="w-full h-auto max-h-96 object-cover" />
                          </motion.div>
                        )}

                        {/* Song Player for admin songfess */}
                        {isSongFess && parsedSong?.isValid && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-xl overflow-hidden border-2 border-purple-300/50 shadow-lg"
                          >
                            {parsedSong.type === 'youtube' ? (
                              <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
                                <iframe
                                  className="absolute top-0 left-0 w-full h-full"
                                  src={parsedSong.embedUrl}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              <iframe
                                style={{ borderRadius: '12px' }}
                                src={parsedSong.embedUrl}
                                width="100%"
                                height="152"
                                frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                              />
                            )}
                          </motion.div>
                        )}

                        <p className="text-[11px] sm:text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wide font-medium">
                          {new Date(menfess.createdAt).toLocaleString("id-ID", {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </CardContent>

                      {/* Reaction Stats Bar */}
                      <div className="px-4 sm:px-5 py-2 border-t border-b border-purple-300/50 dark:border-purple-500/50 relative z-10">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5">
                            <div className="flex -space-x-1">
                              {menfess.reactionCounts && Object.entries(menfess.reactionCounts).filter(([_, count]) => count > 0).slice(0, 3).map(([type, _], i) => (
                                <div key={type} className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs">
                                  {type === 'thumbs' && '👍'}
                                  {type === 'laugh' && '😂'}
                                  {type === 'heart' && '❤️'}
                                  {type === 'sad' && '😢'}
                                  {type === 'rofl' && '🤣'}
                                </div>
                              ))}
                            </div>
                            <span className="text-purple-600 dark:text-purple-400 font-medium">
                              {menfess.likesCount > 0 && `${menfess.likesCount} suka`}
                            </span>
                          </div>
                          <span className="text-purple-600 dark:text-purple-400">
                            {menfess.commentsCount} komentar
                          </span>
                        </div>
                      </div>

                      <CardFooter className="flex flex-col gap-3 p-3 sm:p-4 pt-2 relative z-10">
                        {/* Main Action Buttons */}
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleLike(menfess.id)}
                              className="h-9 sm:h-10 px-3 hover:bg-purple-100 dark:hover:bg-purple-900/50 group"
                            >
                              <Heart className={`h-5 w-5 sm:h-6 sm:w-6 transition-all ${menfess.userLiked ? "fill-red-500 text-red-500 scale-110" : "text-purple-600 dark:text-purple-400 group-hover:scale-110"}`} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleComments(menfess.id)}
                              className="h-9 sm:h-10 px-3 hover:bg-purple-100 dark:hover:bg-purple-900/50 group"
                            >
                              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleShare(menfess)}
                              className="h-9 sm:h-10 px-3 hover:bg-purple-100 dark:hover:bg-purple-900/50 group"
                            >
                              <Share2 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                            </Button>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleBookmark(menfess.id)}
                            className="h-9 sm:h-10 px-3 hover:bg-purple-100 dark:hover:bg-purple-900/50 group"
                          >
                            <Bookmark className={`h-5 w-5 sm:h-6 sm:w-6 transition-all ${menfess.userBookmarked ? "fill-yellow-500 text-yellow-500 scale-110" : "text-purple-600 dark:text-purple-400 group-hover:scale-110"}`} />
                          </Button>
                        </div>

                        {/* Emoji Reactions */}
                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full">
                          {[{ type: "thumbs", emoji: "👍" }, { type: "laugh", emoji: "😂" }, { type: "heart", emoji: "❤️" }, { type: "sad", emoji: "😢" }, { type: "rofl", emoji: "🤣" }].map(({ type, emoji }) => {
                            const count = menfess.reactionCounts?.[type as keyof typeof menfess.reactionCounts] || 0
                            return (
                              <Button
                                key={type}
                                size="sm"
                                variant={menfess.userReaction === type ? "default" : "outline"}
                                onClick={() => handleReaction(menfess.id, type)}
                                className={`text-base sm:text-lg relative h-9 sm:h-10 px-2 transition-all hover:scale-105`}
                              >
                                {emoji}
                                {count > 0 && (
                                  <span className="ml-1 text-xs font-semibold">{count}</span>
                                )}
                              </Button>
                            )
                          })}
                        </div>

                        {/* Comments Section */}
                        <AnimatePresence>
                          {expandedComments.has(menfess.id) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="w-full space-y-3 pt-3 border-t border-border/50"
                            >
                              <div className="space-y-2">
                                {replyTo[menfess.id] && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <span>Membalas komentar...</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-auto p-0 text-xs hover:underline"
                                      onClick={() => setReplyTo(prev => ({ ...prev, [menfess.id]: null }))}
                                    >
                                      Batal
                                    </Button>
                                  </div>
                                )}
                                <div className="flex gap-2 items-start">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px] flex-shrink-0">
                                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                      <span className="text-sm">👤</span>
                                    </div>
                                  </div>
                                  <div className="flex-1 flex gap-2">
                                    <Textarea
                                      placeholder="Tulis komentar..."
                                      value={newComment[menfess.id] || ""}
                                      onChange={(e) =>
                                        setNewComment(prev => ({
                                          ...prev,
                                          [menfess.id]: e.target.value,
                                        }))
                                      }
                                      className="min-h-[50px] resize-none text-xs sm:text-sm rounded-xl"
                                    />
                                    <Button
                                      onClick={() => handleCommentSubmit(menfess.id)}
                                      disabled={submittingComment === menfess.id || !newComment[menfess.id]?.trim()}
                                      size="sm"
                                      className="text-xs sm:text-sm px-3 sm:px-4 h-[50px] rounded-xl"
                                    >
                                      {submittingComment === menfess.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        "Kirim"
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2.5">
                                {comments[menfess.id]?.map((comment) => (
                                  <div key={comment.id} className="space-y-2">
                                    <div className="flex gap-2.5 items-start">
                                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 p-[2px] flex-shrink-0">
                                        <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                          <span className="text-xs sm:text-sm">👤</span>
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-2xl px-3 py-2">
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <Badge variant="outline" className="text-[10px] sm:text-xs font-mono h-5 border-purple-300 dark:border-purple-600">
                                              {comment.anonymousBadge}
                                            </Badge>
                                          </div>
                                          <p className="text-xs sm:text-sm break-words leading-relaxed">{comment.commentText}</p>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 px-2">
                                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                                            {new Date(comment.createdAt).toLocaleString("id-ID", { 
                                              day: 'numeric',
                                              month: 'short',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-auto p-0 text-[10px] sm:text-xs font-semibold hover:underline"
                                            onClick={() =>
                                              setReplyTo(prev => ({
                                                ...prev,
                                                [menfess.id]: comment.id,
                                              }))
                                            }
                                          >
                                            Balas
                                          </Button>
                                        </div>
                                      </div>
                                    </div>

                                    {comment.replies?.map((reply) => (
                                      <div key={reply.id} className="flex gap-2.5 items-start ml-8 sm:ml-10">
                                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-green-500 to-teal-500 p-[2px] flex-shrink-0">
                                          <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                            <span className="text-xs">👤</span>
                                          </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="bg-muted/60 rounded-2xl px-3 py-2">
                                            <div className="flex items-center gap-1.5 mb-1">
                                              <Badge variant="outline" className="text-[10px] sm:text-xs font-mono h-5">
                                                {reply.anonymousBadge}
                                              </Badge>
                                            </div>
                                            <p className="text-xs sm:text-sm break-words leading-relaxed">{reply.commentText}</p>
                                          </div>
                                          <div className="px-2 mt-1">
                                            <span className="text-[10px] sm:text-xs text-muted-foreground">
                                              {new Date(reply.createdAt).toLocaleString("id-ID", {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardFooter>
                    </Card>
                  ) : (
                    /* REGULAR USER POST CARD - Original design */
                    <Card className={`${isSongFess && songGradient ? `bg-gradient-to-br ${songGradient}` : currentTheme.cardBg} backdrop-blur-sm sm:backdrop-blur-md hover:shadow-2xl transition-all duration-300 border-2 overflow-hidden ${isTrending ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}>
                      {/* Trending Badge */}
                      {isTrending && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white gap-1 animate-pulse">
                            <Flame className="h-3 w-3" />
                            Trending
                          </Badge>
                        </div>
                      )}
                      
                      {/* SongFess8 Badge */}
                      {isSongFess && menfess.songMood && (
                        <div className="absolute top-2 left-2 z-10">
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white gap-1">
                            <Music2 className="h-3 w-3" />
                            {songMoodBadges[menfess.songMood]?.emoji} {songMoodBadges[menfess.songMood]?.label || "SongFess8"}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Card Header - Instagram Style */}
                      <CardHeader className="p-3 sm:p-4 border-b border-border/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                            {/* Anonymous Avatar */}
                            <div className="relative flex-shrink-0">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-[2px]">
                                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                  <span className="text-base sm:text-lg">👤</span>
                                </div>
                              </div>
                              {menfess.isNightConfess && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-purple-600 border-2 border-background flex items-center justify-center">
                                  <MoonIcon className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-white" />
                                </div>
                              )}
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge variant="secondary" className="font-mono text-xs font-semibold">
                                  {menfess.anonymousBadge}
                                </Badge>
                                <span className="text-xs sm:text-sm font-medium truncate">
                                  {menfess.nickname}
                                </span>
                              </div>
                              {menfess.target && (
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  → <span className="font-medium text-foreground">{menfess.target}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Top Right Badges */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Category & Mood Tags */}
                        <div className="flex gap-1.5 sm:gap-2 flex-wrap mt-2.5 sm:mt-3">
                          <Badge className="text-xs font-medium">
                            {categoryEmojis[menfess.category]} {menfess.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {moodEmojis[menfess.mood]}
                          </Badge>
                          {menfess.kelas && (
                            <Badge variant="outline" className="border-green-400 text-green-600 dark:text-green-400 text-xs gap-1">
                              <GraduationCap className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              {menfess.kelas}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      {/* Card Content */}
                      <CardContent className="p-4 sm:p-5 space-y-4">
                        <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                          {menfess.message}
                        </p>

                        {/* Song Player Embed */}
                        {isSongFess && parsedSong?.isValid && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-xl overflow-hidden border-2 border-border/50 shadow-lg"
                          >
                            {parsedSong.type === 'youtube' ? (
                              <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
                                <iframe
                                  className="absolute top-0 left-0 w-full h-full"
                                  src={parsedSong.embedUrl}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  loading="lazy"
                                />
                              </div>
                            ) : parsedSong.type === 'spotify' ? (
                              <iframe
                                style={{ borderRadius: '12px' }}
                                src={parsedSong.embedUrl}
                                width="100%"
                                height="152"
                                frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                              />
                            ) : null}
                          </motion.div>
                        )}

                        <p className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wide">
                          {new Date(menfess.createdAt).toLocaleString("id-ID", {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </CardContent>

                      {/* Reaction Stats Bar */}
                      <div className="px-4 sm:px-5 py-2 border-t border-b border-border/50">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5">
                            <div className="flex -space-x-1">
                              {menfess.reactionCounts && Object.entries(menfess.reactionCounts).filter(([_, count]) => count > 0).slice(0, 3).map(([type, _], i) => (
                                <div key={type} className="w-5 h-5 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                                  {type === 'thumbs' && '👍'}
                                  {type === 'laugh' && '😂'}
                                  {type === 'heart' && '❤️'}
                                  {type === 'sad' && '😢'}
                                  {type === 'rofl' && '🤣'}
                                </div>
                              ))}
                            </div>
                            <span className="text-muted-foreground font-medium">
                              {menfess.likesCount > 0 && `${menfess.likesCount} suka`}
                            </span>
                          </div>
                          <span className="text-muted-foreground">
                            {menfess.commentsCount} komentar
                          </span>
                        </div>
                      </div>

                      <CardFooter className="flex flex-col gap-3 p-3 sm:p-4 pt-2">
                        {/* Main Action Buttons - Instagram Style */}
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleLike(menfess.id)}
                              className="h-9 sm:h-10 px-3 hover:bg-transparent group"
                            >
                              <Heart className={`h-5 w-5 sm:h-6 sm:w-6 transition-all ${menfess.userLiked ? "fill-red-500 text-red-500 scale-110" : "group-hover:scale-110"}`} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleComments(menfess.id)}
                              className="h-9 sm:h-10 px-3 hover:bg-transparent group"
                            >
                              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleShare(menfess)}
                              className="h-9 sm:h-10 px-3 hover:bg-transparent group"
                            >
                              <Share2 className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
                            </Button>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleBookmark(menfess.id)}
                            className="h-9 sm:h-10 px-3 hover:bg-transparent group"
                          >
                            <Bookmark className={`h-5 w-5 sm:h-6 sm:w-6 transition-all ${menfess.userBookmarked ? "fill-yellow-500 text-yellow-500 scale-110" : "group-hover:scale-110"}`} />
                          </Button>
                        </div>

                        {/* Emoji Reactions */}
                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full">
                          {[{ type: "thumbs", emoji: "👍" }, { type: "laugh", emoji: "😂" }, { type: "heart", emoji: "❤️" }, { type: "sad", emoji: "😢" }, { type: "rofl", emoji: "🤣" }].map(({ type, emoji }) => {
                            const count = menfess.reactionCounts?.[type as keyof typeof menfess.reactionCounts] || 0
                            return (
                              <Button
                                key={type}
                                size="sm"
                                variant={menfess.userReaction === type ? "default" : "outline"}
                                onClick={() => handleReaction(menfess.id, type)}
                                className={`text-base sm:text-lg relative h-9 sm:h-10 px-2 transition-all hover:scale-105`}
                              >
                                {emoji}
                                {count > 0 && (
                                  <span className="ml-1 text-xs font-semibold">{count}</span>
                                )}
                              </Button>
                            )
                          })}
                        </div>

                        {/* Comments Section */}
                        <AnimatePresence>
                          {expandedComments.has(menfess.id) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="w-full space-y-3 pt-3 border-t border-border/50"
                            >
                              <div className="space-y-2">
                                {replyTo[menfess.id] && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <span>Membalas komentar...</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-auto p-0 text-xs hover:underline"
                                      onClick={() => setReplyTo(prev => ({ ...prev, [menfess.id]: null }))}
                                    >
                                      Batal
                                    </Button>
                                  </div>
                                )}
                                <div className="flex gap-2 items-start">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px] flex-shrink-0">
                                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                      <span className="text-sm">👤</span>
                                    </div>
                                  </div>
                                  <div className="flex-1 flex gap-2">
                                    <Textarea
                                      placeholder="Tulis komentar..."
                                      value={newComment[menfess.id] || ""}
                                      onChange={(e) =>
                                        setNewComment(prev => ({
                                          ...prev,
                                          [menfess.id]: e.target.value,
                                        }))
                                      }
                                      className="min-h-[50px] resize-none text-xs sm:text-sm rounded-xl"
                                    />
                                    <Button
                                      onClick={() => handleCommentSubmit(menfess.id)}
                                      disabled={submittingComment === menfess.id || !newComment[menfess.id]?.trim()}
                                      size="sm"
                                      className="text-xs sm:text-sm px-3 sm:px-4 h-[50px] rounded-xl"
                                    >
                                      {submittingComment === menfess.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        "Kirim"
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2.5">
                                {comments[menfess.id]?.map((comment) => (
                                  <div key={comment.id} className="space-y-2">
                                    <div className="flex gap-2.5 items-start">
                                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 p-[2px] flex-shrink-0">
                                        <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                          <span className="text-xs sm:text-sm">👤</span>
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-2xl px-3 py-2">
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <Badge variant="outline" className="text-[10px] sm:text-xs font-mono h-5 border-purple-300 dark:border-purple-600">
                                              {comment.anonymousBadge}
                                            </Badge>
                                          </div>
                                          <p className="text-xs sm:text-sm break-words leading-relaxed">{comment.commentText}</p>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 px-2">
                                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                                            {new Date(comment.createdAt).toLocaleString("id-ID", { 
                                              day: 'numeric',
                                              month: 'short',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-auto p-0 text-[10px] sm:text-xs font-semibold hover:underline"
                                            onClick={() =>
                                              setReplyTo(prev => ({
                                                ...prev,
                                                [menfess.id]: comment.id,
                                              }))
                                            }
                                          >
                                            Balas
                                          </Button>
                                        </div>
                                      </div>
                                    </div>

                                    {comment.replies?.map((reply) => (
                                      <div key={reply.id} className="flex gap-2.5 items-start ml-8 sm:ml-10">
                                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-green-500 to-teal-500 p-[2px] flex-shrink-0">
                                          <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                            <span className="text-xs">👤</span>
                                          </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="bg-muted/60 rounded-2xl px-3 py-2">
                                            <div className="flex items-center gap-1.5 mb-1">
                                              <Badge variant="outline" className="text-[10px] sm:text-xs font-mono h-5">
                                                {reply.anonymousBadge}
                                              </Badge>
                                            </div>
                                            <p className="text-xs sm:text-sm break-words leading-relaxed">{reply.commentText}</p>
                                          </div>
                                          <div className="px-2 mt-1">
                                            <span className="text-[10px] sm:text-xs text-muted-foreground">
                                              {new Date(reply.createdAt).toLocaleString("id-ID", {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardFooter>
                    </Card>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export default function TimelinePage() {
  return (
    <>
      <Navigation />
      <Suspense fallback={
        <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 pt-24 pb-12">
          <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        </main>
      }>
        <TimelineContent />
      </Suspense>
    </>
  )
}