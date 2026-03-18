"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, Send, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  nickname: z.string().min(2, "Nickname minimal 2 karakter").max(50, "Nickname maksimal 50 karakter"),
  target: z.string().max(100, "Target maksimal 100 karakter").optional(),
  message: z.string().min(10, "Pesan minimal 10 karakter").max(1000, "Pesan maksimal 1000 karakter"),
  category: z.enum(["crush", "curhat", "humor", "random", "motivasi"], {
    required_error: "Pilih kategori",
  }),
  mood: z.enum(["happy", "sad", "nervous", "excited", "angry", "galau", "baper"], {
    required_error: "Pilih mood",
  }),
  kelas: z.string().max(50, "Kelas maksimal 50 karakter").optional(),
})

export default function SubmitPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [charCount, setCharCount] = useState(0)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/submit")
    }
  }, [session, isPending, router])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      target: "",
      message: "",
      kelas: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!session?.user) {
      toast.error("Silakan login terlebih dahulu")
      return
    }

    setIsSubmitting(true)
    
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (token) headers.Authorization = `Bearer ${token}`
      const response = await fetch("/api/menfess/submit", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Rate Limit", {
            description: "Kamu sudah mengirim 3 menfess dalam 5 menit terakhir. Tunggu sebentar ya!",
          })
        } else if (response.status === 400) {
          toast.error("Konten Ditolak", {
            description: data.error || "Pesan mengandung kata-kata yang tidak pantas",
          })
        } else if (response.status === 401) {
          toast.error("Sesi berakhir", {
            description: "Silakan login ulang untuk kirim menfess",
          })
          router.push("/login?redirect=/submit")
        } else if (response.status === 403) {
          const reason = data.reason || data.error || "Akun diblokir"
          toast.error("Kamu diblokir", { description: reason })
          router.push(`/blocked?reason=${encodeURIComponent(reason)}`)
        } else {
          throw new Error(data.error)
        }
        return
      }

      toast.success("Menfess Terkirim! 🎉", {
        description: `Badge kamu: ${data.anonymousBadge}. Langsung muncul di timeline!`,
      })

      form.reset()
      setCharCount(0)
      setTimeout(() => {
        router.push("/timeline")
      }, 350)
    } catch (error) {
      toast.error("Gagal mengirim menfess", {
        description: "Terjadi kesalahan. Coba lagi nanti.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading while checking auth
  if (isPending) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 pt-24 pb-12">
          <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        </main>
      </>
    )
  }

  // Don't render if not authenticated
  if (!session?.user) {
    return null
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.16),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(79,70,229,0.12),transparent_26%),linear-gradient(135deg,#f8fbff,#fdf8ff)] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.12),transparent_26%),linear-gradient(140deg,#0b1021,#0c0f1c)] pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Card className="rounded-2xl border border-white/70 dark:border-white/10 bg-white/85 dark:bg-slate-900/85 shadow-[0_18px_60px_-28px_rgba(88,28,135,0.55)] dark:shadow-[0_18px_50px_-32px_rgba(0,0,0,0.65)] backdrop-blur-[4px]">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-200/60 dark:shadow-none">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Kirim Menfess</CardTitle>
                    <CardDescription>
                      Ekspresikan perasaanmu secara anonim 💜
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 dark:from-indigo-900/30 dark:via-blue-900/25 dark:to-purple-900/30 border border-indigo-100 dark:border-indigo-500/30">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-300 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-indigo-900 dark:text-indigo-100 mb-1">Peraturan:</p>
                      <ul className="text-indigo-700 dark:text-indigo-200 space-y-1 list-disc list-inside">
                        <li>Maksimal 3 menfess dalam 5 menit</li>
                        <li>Tidak boleh mengandung kata-kata kasar</li>
                        <li>Admin dapat menghapus postingan yang melanggar</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="nickname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Panggilan</FormLabel>
                          <FormControl>
                            <Input placeholder="Anonymous" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="target"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tujuan Mention (Opsional)</FormLabel>
                          <FormControl>
                            <Input placeholder="si rambut ikal kelas sebelah" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="kelas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kelas (Opsional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: Kelas 8A, XI IPA 2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="crush">💕 Crush</SelectItem>
                              <SelectItem value="curhat">😔 Curhat</SelectItem>
                              <SelectItem value="humor">😂 Humor</SelectItem>
                              <SelectItem value="random">🎲 Random</SelectItem>
                              <SelectItem value="motivasi">💪 Motivasi</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mood</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih mood" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="happy">😊 Happy</SelectItem>
                              <SelectItem value="sad">😢 Sad</SelectItem>
                              <SelectItem value="nervous">😰 Nervous</SelectItem>
                              <SelectItem value="excited">🤩 Excited</SelectItem>
                              <SelectItem value="angry">😠 Angry</SelectItem>
                              <SelectItem value="galau">😔 Galau</SelectItem>
                              <SelectItem value="baper">💔 Baper</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pesan Menfess</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tulis pesan menfess kamu di sini..."
                              className="min-h-[150px] resize-none"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                setCharCount(e.target.value.length)
                              }}
                            />
                          </FormControl>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <FormMessage />
                            <span>{charCount}/1000</span>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white shadow-lg shadow-purple-200/60 dark:shadow-none transition-transform duration-200 active:scale-[0.99]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Kirim Menfess
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </>
  )
}