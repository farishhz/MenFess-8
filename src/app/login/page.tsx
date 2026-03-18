"use client"

import { Suspense } from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { authClient, useSession } from "@/lib/auth-client"
import { motion } from "framer-motion"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, isPending } = useSession()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const redirectUrl = searchParams.get("redirect") || "/timeline"
  const registered = searchParams.get("registered") === "true"

  // Redirect if already logged in
  useEffect(() => {
    if (!isPending && session?.user) {
      router.push(redirectUrl)
    }
  }, [session, isPending, router, redirectUrl])

  // Show registration success message
  useEffect(() => {
    if (registered) {
      toast.success("Akun berhasil dibuat! Silakan login.")
    }
  }, [registered])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error("Email dan password harus diisi")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
        callbackURL: redirectUrl,
      })

      if (error?.code) {
        // Check if user is banned
        const checkBanRes = await fetch("/api/auth/check-ban", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("bearer_token")}`
          }
        })
        
        if (checkBanRes.ok) {
          const banData = await checkBanRes.json()
          if (banData.banned) {
            // Redirect to blocked page with reason
            router.push(`/blocked?reason=${encodeURIComponent(banData.reason || "No reason provided")}`)
            return
          }
        }
        
        toast.error("Email atau password salah. Pastikan Anda sudah mendaftar dan coba lagi.")
        return
      }

      // Check if user is banned after successful login
      const token = localStorage.getItem("bearer_token")
      if (token) {
        const checkBanRes = await fetch("/api/auth/check-ban", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        
        if (checkBanRes.ok) {
          const banData = await checkBanRes.json()
          if (banData.banned) {
            // Sign out immediately
            await authClient.signOut()
            localStorage.removeItem("bearer_token")
            
            // Redirect to blocked page with reason
            router.push(`/blocked?reason=${encodeURIComponent(banData.reason || "No reason provided")}`)
            return
          }
        }
      }

      toast.success("Login berhasil!")
      router.push(redirectUrl)
    } catch (error) {
      toast.error("Terjadi kesalahan saat login")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking session
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  // Don't render if already logged in
  if (session?.user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/30 dark:bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-purple-200/50 dark:border-purple-500/20 shadow-xl">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
                <span className="text-lg font-bold text-white">MenFess 8</span>
              </div>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl">Selamat Datang Kembali</CardTitle>
              <CardDescription>Login untuk melanjutkan menfess</CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Ingat saya
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Belum punya akun?{" "}
                <Link href="/register" className="text-purple-600 hover:text-purple-700 font-medium">
                  Daftar sekarang
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}