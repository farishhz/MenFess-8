"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Music2, TrendingUp, Play, Heart, Flame, Crown, Loader2 } from "lucide-react"
import { useEffect, useState, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { parseSongUrl } from "@/lib/song-parser"

interface SongFess {
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
  songUrl: string
  songType: string
  songMood: string
  sendCount?: number
}

const songMoodGradients: Record<string, string> = {
  crush: "from-pink-500 via-rose-500 to-red-500",
  galau: "from-blue-500 via-indigo-500 to-purple-500",
  semangat: "from-orange-500 via-amber-500 to-yellow-500",
  meme: "from-green-500 via-teal-500 to-cyan-500",
}

const songMoodBadges: Record<string, { label: string; emoji: string }> = {
  crush: { label: "Crush", emoji: "💙" },
  galau: { label: "Galau", emoji: "💔" },
  semangat: { label: "Semangat", emoji: "🔥" },
  meme: { label: "Meme", emoji: "😂" },
}

function PlaylistContent() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [topSongFess, setTopSongFess] = useState<SongFess[]>([])
  const [recentSongFess, setRecentSongFess] = useState<SongFess[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("top")
  const [playingSong, setPlayingSong] = useState<number | null>(null)

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/playlist")
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session?.user) {
      fetchSongFess()
    }
  }, [session])

  async function fetchSongFess() {
    setLoading(true)
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch("/api/menfess/list?songfess=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      const songfessList = (data.menfess || []).filter(
        (m: SongFess) => m.songUrl && m.songType
      )

      const sorted = [...songfessList].sort(
        (a, b) => b.likesCount - a.likesCount
      )
      setTopSongFess(sorted.slice(0, 10))
      setRecentSongFess(
        [...songfessList].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      )
    } catch (error) {
      toast.error("Gagal memuat SongFess")
    } finally {
      setLoading(false)
    }
  }

  if (isPending) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 pt-20 pb-12">
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </main>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 pt-20 pb-12 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: (i % 5) * 0.4,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                <Music2 className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-black text-white">
                Playlist <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">8</span>
              </h1>
              <p className="text-purple-300 text-sm">Top SongFess Minggu Ini</p>
            </div>
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30"
          >
            <Flame className="h-4 w-4 animate-pulse" />
            {topSongFess.length} SongFess Trending
          </motion.div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-md">
            <TabsTrigger value="top" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <TrendingUp className="mr-2 h-4 w-4" />
              Top Chart
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Music2 className="mr-2 h-4 w-4" />
              Terbaru
            </TabsTrigger>
          </TabsList>

          <TabsContent value="top" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : topSongFess.length === 0 ? (
              <Card className="p-12 text-center bg-white/5 backdrop-blur-md border-purple-500/30">
                <p className="text-purple-300">Belum ada SongFess minggu ini 😔</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {topSongFess.map((song, index) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    rank={index + 1}
                    isPlaying={playingSong === song.id}
                    onPlay={() => setPlayingSong(playingSong === song.id ? null : song.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : recentSongFess.length === 0 ? (
              <Card className="p-12 text-center bg-white/5 backdrop-blur-md border-purple-500/30">
                <p className="text-purple-300">Belum ada SongFess 😔</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {recentSongFess.map((song, index) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    isPlaying={playingSong === song.id}
                    onPlay={() => setPlayingSong(playingSong === song.id ? null : song.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

function SongCard({
  song,
  rank,
  isPlaying,
  onPlay,
}: {
  song: SongFess
  rank?: number
  isPlaying: boolean
  onPlay: () => void
}) {
  const parsedSong = parseSongUrl(song.songUrl)
  const gradient = song.songMood ? songMoodGradients[song.songMood] : "from-purple-500 to-pink-500"
  const moodBadge = song.songMood ? songMoodBadges[song.songMood] : null

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`bg-white/5 backdrop-blur-md border-purple-500/30 overflow-hidden hover:border-purple-400/50 transition-all ${rank === 1 ? 'ring-2 ring-yellow-500/50' : ''}`}>
        <CardContent className="p-0">
          <div className="flex items-stretch">
            {rank && (
              <div className={`w-16 flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${gradient}`}>
                {rank === 1 ? (
                  <Crown className="h-8 w-8 text-yellow-300" />
                ) : rank === 2 ? (
                  <span className="text-3xl font-black text-white/90">2</span>
                ) : rank === 3 ? (
                  <span className="text-3xl font-black text-white/80">3</span>
                ) : (
                  <span className="text-2xl font-bold text-white/70">{rank}</span>
                )}
              </div>
            )}
            
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {song.anonymousBadge}
                    </Badge>
                    {moodBadge && (
                      <Badge className={`bg-gradient-to-r ${gradient} text-white text-xs`}>
                        {moodBadge.emoji} {moodBadge.label}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-purple-300 border-purple-500/50 text-xs">
                      {song.songType === 'youtube' ? '🎬 YouTube' : '🎵 Spotify'}
                    </Badge>
                  </div>
                  
                  <p className="text-white text-sm mb-2 line-clamp-2">
                    {song.message}
                  </p>
                  
                  {song.target && (
                    <p className="text-purple-300 text-xs mb-2">
                      → untuk <span className="text-pink-400 font-medium">{song.target}</span>
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-purple-400">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-red-400" />
                      {song.likesCount}
                    </span>
                    <span>
                      {new Date(song.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
                
                <Button
                  onClick={onPlay}
                  size="sm"
                  className={`flex-shrink-0 rounded-full w-12 h-12 ${isPlaying ? 'bg-pink-500 hover:bg-pink-600' : 'bg-purple-500 hover:bg-purple-600'}`}
                >
                  <Play className={`h-5 w-5 ${isPlaying ? 'text-white' : 'text-white'}`} />
                </Button>
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            {isPlaying && parsedSong?.isValid && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-purple-500/30"
              >
                {parsedSong.type === 'youtube' ? (
                  <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={parsedSong.embedUrl}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <iframe
                    style={{ borderRadius: '0' }}
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
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function PlaylistPage() {
  return (
    <>
      <Navigation />
      <Suspense
        fallback={
          <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 pt-20 pb-12">
            <div className="flex justify-center items-center h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          </main>
        }
      >
        <PlaylistContent />
      </Suspense>
    </>
  )
}