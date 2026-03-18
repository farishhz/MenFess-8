"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, Mail } from "lucide-react"
import { motion } from "framer-motion"

function BlockedContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [reason, setReason] = useState<string>("")

  useEffect(() => {
    const reasonParam = searchParams.get("reason")
    if (reasonParam) {
      setReason(decodeURIComponent(reasonParam))
    } else {
      setReason("Tidak ada alasan yang diberikan")
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 dark:from-gray-900 dark:via-red-900/20 dark:to-orange-900/20 p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-300/30 dark:bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300/30 dark:bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg"
      >
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-red-200/50 dark:border-red-500/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-gradient-to-br from-red-500 to-orange-500 shadow-lg">
                <AlertTriangle className="h-12 w-12 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-red-600 dark:text-red-400">
                Akun Diblokir
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Akun Anda telah diblokir oleh administrator
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Reason Box */}
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500/30">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                    Alasan Pemblokiran:
                  </p>
                  <p className="text-base text-red-800 dark:text-red-200 leading-relaxed">
                    {reason}
                  </p>
                </div>
              </div>
            </div>

            {/* Information */}
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-500/30">
              <p className="text-sm text-orange-900 dark:text-orange-100 leading-relaxed">
                <strong>Informasi:</strong> Jika Anda merasa ini adalah kesalahan atau ingin mengajukan banding, silakan hubungi administrator melalui email atau kontak yang tersedia.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                size="lg"
              >
                <Home className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => window.location.href = "mailto:admin@menfess8.com?subject=Appeal Banned Account"}
              >
                <Mail className="mr-2 h-4 w-4" />
                Hubungi Administrator
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function BlockedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 dark:from-gray-900 dark:via-red-900/20 dark:to-orange-900/20">
          <div className="text-center">Loading...</div>
        </div>
      }
    >
      <BlockedContent />
    </Suspense>
  )
}
