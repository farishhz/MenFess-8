"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, CheckCircle2, XCircle, AlertTriangle, Lightbulb } from "lucide-react"
import { toast } from "sonner"
import { authClient, useSession } from "@/lib/auth-client"
import { motion } from "framer-motion"

interface EmailValidationResult {
  email: string
  isValidFormat: boolean
  isDeliverable: boolean
  isDisposable: boolean
  isRoleEmail: boolean
  isCatchAll: boolean
  mxFound: boolean
  smtpValid: boolean
  qualityScore: number
  bounceRisk: string
  suggestion: string | null
}

export default function RegisterPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isValidatingEmail, setIsValidatingEmail] = useState(false)
  const [emailValidation, setEmailValidation] = useState<EmailValidationResult | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [showSuggestion, setShowSuggestion] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/timeline")
    }
  }, [session, isPending, router])

  // Validate email on blur
  async function handleEmailBlur() {
    if (!email || !email.includes('@')) {
      setEmailValidation(null)
      setEmailError(null)
      return
    }

    setIsValidatingEmail(true)
    setEmailError(null)
    setEmailValidation(null)
    setShowSuggestion(false)

    try {
      const response = await fetch('/api/email/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setEmailError('Terlalu banyak permintaan. Tunggu sebentar.')
        } else {
          setEmailError(data.error || 'Gagal memvalidasi email')
        }
        return
      }

      setEmailValidation(data)

      // Check for typo suggestion
      if (data.suggestion && data.suggestion !== email) {
        setShowSuggestion(true)
      }

      // Auto-block disposable emails
      if (data.isDisposable) {
        setEmailError('Email disposable tidak diperbolehkan! Gunakan email asli.')
        toast.error('Email disposable tidak diperbolehkan!')
      } else if (!data.isDeliverable || !data.smtpValid) {
        setEmailError('Email tidak valid atau tidak dapat menerima pesan.')
      } else if (!data.mxFound) {
        setEmailError('Domain email tidak valid.')
      }
    } catch (error) {
      console.error('Email validation error:', error)
      setEmailError('Gagal memvalidasi email')
    } finally {
      setIsValidatingEmail(false)
    }
  }

  function applySuggestion() {
    if (emailValidation?.suggestion) {
      setEmail(emailValidation.suggestion)
      setShowSuggestion(false)
      toast.success('Email diperbaiki!')
      // Re-validate after applying suggestion
      setTimeout(() => handleEmailBlur(), 500)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Semua field harus diisi")
      return
    }

    // Block if email validation failed
    if (emailValidation && emailValidation.isDisposable) {
      toast.error("Email disposable tidak diperbolehkan!")
      return
    }

    if (emailValidation && !emailValidation.isDeliverable) {
      toast.error("Email tidak valid atau tidak dapat menerima pesan!")
      return
    }

    if (emailError) {
      toast.error("Perbaiki error email terlebih dahulu!")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Password tidak cocok")
      return
    }

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await authClient.signUp.email({
        email,
        name,
        password,
      })

      if (error?.code) {
        if (error.code === "USER_ALREADY_EXISTS") {
          toast.error("Email sudah terdaftar")
        } else {
          toast.error("Gagal membuat akun: " + error.code)
        }
        return
      }

      toast.success("Akun berhasil dibuat! Silakan login.")
      router.push("/login?registered=true")
    } catch (error) {
      toast.error("Terjadi kesalahan saat mendaftar")
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
              <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
              <CardDescription>Daftar untuk mulai menfess</CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email">Email</Label>
                  {isValidatingEmail && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Memeriksa...</span>
                    </div>
                  )}
                  {emailValidation && !isValidatingEmail && !emailError && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {emailError && !isValidatingEmail && (
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      <XCircle className="h-3 w-3 mr-1" />
                      Invalid
                    </Badge>
                  )}
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  disabled={isLoading || isValidatingEmail}
                  required
                  className={
                    emailError
                      ? "border-red-500 focus-visible:ring-red-500"
                      : emailValidation && !emailError
                      ? "border-green-500 focus-visible:ring-green-500"
                      : ""
                  }
                />
                {emailError && (
                  <Alert variant="destructive" className="py-2">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{emailError}</AlertDescription>
                  </Alert>
                )}
                {showSuggestion && emailValidation?.suggestion && (
                  <Alert className="py-2 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm flex items-center justify-between">
                      <span className="text-blue-800 dark:text-blue-200">
                        Maksud Anda <strong>{emailValidation.suggestion}</strong>?
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="link"
                        className="h-auto p-0 text-blue-600 hover:text-blue-700"
                        onClick={applySuggestion}
                      >
                        Perbaiki
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                {emailValidation && !emailError && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span>Email valid dan dapat menerima pesan</span>
                    </div>
                    {emailValidation.isDisposable && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-orange-600" />
                        <span className="text-orange-600">Email disposable terdeteksi</span>
                      </div>
                    )}
                    {!emailValidation.isDisposable && emailValidation.qualityScore >= 0.8 && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span>Kualitas email: Sangat baik</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="off"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                disabled={isLoading || isValidatingEmail || !!emailError}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Membuat akun...
                  </>
                ) : (
                  "Daftar"
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                  Login di sini
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}