"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageSquare, Send, Sparkles, TrendingUp, Shuffle, Moon, Heart, Smile, ThumbsUp, Music2 } from "lucide-react"
import { motion } from "framer-motion"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/30 dark:bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-700" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container relative mx-auto px-4">
            <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
              {mounted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-3 sm:space-y-4"
                >
                  <div className="inline-flex items-center space-x-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg border border-purple-200 dark:border-purple-500/30">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">Anonymous Confession Platform</span>
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight px-4">
                    <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
                      MenFess 8
                    </span>
                  </h1>
                  
                  <p className="max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground px-4">
                    Tempat aman untuk berbagi perasaan, cerita, dan pikiran secara anonim. 
                    Ekspresikan dirimu tanpa takut dihakimi! 💜
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="inline-flex items-center space-x-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg border border-purple-200 dark:border-purple-500/30">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">Anonymous Confession Platform</span>
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight px-4">
                    <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
                      MenFess 8
                    </span>
                  </h1>
                  
                  <p className="max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground px-4">
                    Tempat aman untuk berbagi perasaan, cerita, dan pikiran secara anonim. 
                    Ekspresikan dirimu tanpa takut dihakimi! 💜
                  </p>
                </div>
              )}

              {mounted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md sm:max-w-none px-4"
                >
                  <Link href="/submit" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/50 dark:shadow-purple-500/30">
                      <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                      Kirim Menfess
                    </Button>
                  </Link>
                  <Link href="/songfess" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto group relative overflow-hidden bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white shadow-lg shadow-pink-500/50 dark:shadow-pink-500/30">
                      <Music2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
                      Kirim SongFess 🎧
                    </Button>
                  </Link>
                  <Link href="/timeline" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-500/30 hover:bg-white dark:hover:bg-gray-800">
                      <MessageSquare className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Lihat Timeline
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md sm:max-w-none px-4">
                  <Link href="/submit" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/50 dark:shadow-purple-500/30">
                      <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                      Kirim Menfess
                    </Button>
                  </Link>
                  <Link href="/songfess" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto group relative overflow-hidden bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white shadow-lg shadow-pink-500/50 dark:shadow-pink-500/30">
                      <Music2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
                      Kirim SongFess 🎧
                    </Button>
                  </Link>
                  <Link href="/timeline" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-500/30 hover:bg-white dark:hover:bg-gray-800">
                      <MessageSquare className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Lihat Timeline
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4">
            {mounted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8 sm:mb-12"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Fitur Menarik</h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
                  Berbagai fitur keren yang membuat pengalaman menfess kamu lebih seru!
                </p>
              </motion.div>
            ) : (
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Fitur Menarik</h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
                  Berbagai fitur keren yang membuat pengalaman menfess kamu lebih seru!
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <FeatureCard
                icon={<Music2 className="h-5 w-5 sm:h-6 sm:w-6" />}
                title="SongFess8 🎧"
                description="Kirim menfess dengan lagu! Tambahkan link YouTube/Spotify untuk ekspresikan perasaan lewat musik"
                gradient="from-purple-500 to-pink-500"
                delay={0}
                mounted={mounted}
              />
              <FeatureCard
                icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />}
                title="Top Fess of The Day"
                description="Lihat menfess terpopuler hari ini berdasarkan likes dan interaksi"
                gradient="from-purple-500 to-pink-500"
                delay={0.1}
                mounted={mounted}
              />
              <FeatureCard
                icon={<Shuffle className="h-5 w-5 sm:h-6 sm:w-6" />}
                title="Random Fess"
                description="Jelajahi menfess secara acak dan temukan cerita menarik"
                gradient="from-pink-500 to-orange-500"
                delay={0.2}
                mounted={mounted}
              />
              <FeatureCard
                icon={<Moon className="h-5 w-5 sm:h-6 sm:w-6" />}
                title="Night Confess Mode"
                description="Mode spesial dengan animasi bintang untuk menfess malam hari (7PM-12AM)"
                gradient="from-blue-500 to-purple-500"
                delay={0.3}
                mounted={mounted}
              />
              <FeatureCard
                icon={<Smile className="h-5 w-5 sm:h-6 sm:w-6" />}
                title="Mood Meter"
                description="Filter menfess berdasarkan mood: Happy, Sad, Nervous, Excited, Angry"
                gradient="from-green-500 to-teal-500"
                delay={0.4}
                mounted={mounted}
              />
              <FeatureCard
                icon={<Heart className="h-5 w-5 sm:h-6 sm:w-6" />}
                title="Reaction Emojis"
                description="Berikan reaksi: 👍 😂 ❤️ 😢 🤣 pada setiap menfess"
                gradient="from-red-500 to-pink-500"
                delay={0.5}
                mounted={mounted}
              />
              <FeatureCard
                icon={<ThumbsUp className="h-5 w-5 sm:h-6 sm:w-6" />}
                title="Like & Comment"
                description="Berikan dukungan dengan like dan komentar anonim bersarang"
                gradient="from-indigo-500 to-blue-500"
                delay={0.6}
                mounted={mounted}
              />
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4">
            {mounted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8 sm:mb-12"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Kategori Menfess</h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
                  Pilih kategori yang sesuai dengan perasaanmu
                </p>
              </motion.div>
            ) : (
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Kategori Menfess</h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
                  Pilih kategori yang sesuai dengan perasaanmu
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <CategoryCard emoji="💕" title="Crush" color="pink" />
              <CategoryCard emoji="😔" title="Curhat" color="blue" />
              <CategoryCard emoji="😂" title="Humor" color="yellow" />
              <CategoryCard emoji="🎲" title="Random" color="purple" />
              <CategoryCard emoji="💪" title="Motivasi" color="green" />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4">
            {mounted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 border-0 text-white p-8 sm:p-10 md:p-12">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-purple-900/20 opacity-50" />
                  <div className="relative z-10 text-center space-y-4 sm:space-y-6">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Siap Berbagi Ceritamu?</h2>
                    <p className="text-sm sm:text-base md:text-lg text-purple-100 max-w-2xl mx-auto px-4">
                      Bergabunglah dengan ribuan siswa lainnya yang telah berbagi cerita mereka secara anonim
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                      <Link href="/submit">
                        <Button size="lg" variant="secondary" className="shadow-lg w-full sm:w-auto">
                          <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                          Mulai Menfess Sekarang
                        </Button>
                      </Link>
                      <Link href="/songfess">
                        <Button size="lg" variant="secondary" className="shadow-lg w-full sm:w-auto bg-white/90 hover:bg-white">
                          <Music2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                          Kirim SongFess 🎧
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 border-0 text-white p-8 sm:p-10 md:p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-purple-900/20 opacity-50" />
                <div className="relative z-10 text-center space-y-4 sm:space-y-6">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Siap Berbagi Ceritamu?</h2>
                  <p className="text-sm sm:text-base md:text-lg text-purple-100 max-w-2xl mx-auto px-4">
                    Bergabunglah dengan ribuan siswa lainnya yang telah berbagi cerita mereka secara anonim
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Link href="/submit">
                      <Button size="lg" variant="secondary" className="shadow-lg w-full sm:w-auto">
                        <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Mulai Menfess Sekarang
                      </Button>
                    </Link>
                    <Link href="/songfess">
                      <Button size="lg" variant="secondary" className="shadow-lg w-full sm:w-auto bg-white/90 hover:bg-white">
                        <Music2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Kirim SongFess 🎧
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 sm:py-8 border-t border-border/40 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 text-center text-sm sm:text-base text-muted-foreground">
            <p>© 2024 MenFess 8. Made with 💜 by students, for students.</p>
          </div>
        </footer>
      </main>
    </>
  )
}

function FeatureCard({ icon, title, description, gradient, delay, mounted }: { 
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
  delay: number
  mounted: boolean
}) {
  if (!mounted) {
    return (
      <Card className="group h-full p-4 sm:p-6 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-purple-200/50 dark:border-purple-500/20 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
        <div className={`inline-flex p-2.5 sm:p-3 rounded-lg bg-gradient-to-br ${gradient} text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <h3 className="font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="group h-full p-4 sm:p-6 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-purple-200/50 dark:border-purple-500/20 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
        <div className={`inline-flex p-2.5 sm:p-3 rounded-lg bg-gradient-to-br ${gradient} text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <h3 className="font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
      </Card>
    </motion.div>
  )
}

function CategoryCard({ emoji, title, color }: { emoji: string; title: string; color: string }) {
  const colorClasses: Record<string, string> = {
    pink: "from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600",
    blue: "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
    yellow: "from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600",
    purple: "from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600",
    green: "from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
  }

  return (
    <Link href={`/timeline?category=${title.toLowerCase()}`}>
      <Card className={`group p-4 sm:p-6 text-center cursor-pointer bg-gradient-to-br ${colorClasses[color]} border-0 text-white hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl`}>
        <div className="text-3xl sm:text-4xl mb-1.5 sm:mb-2">{emoji}</div>
        <div className="font-semibold text-sm sm:text-base">{title}</div>
      </Card>
    </Link>
  )
}