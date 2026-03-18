import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { bannedWords } from "@/db/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"

async function checkAuth() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin_authenticated")
  return isAuthenticated?.value === "true"
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params
    
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const wordId = parseInt(id)

    await db.delete(bannedWords).where(eq(bannedWords.id, wordId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete banned word error:", error)
    return NextResponse.json(
      { error: "Failed to delete banned word" },
      { status: 500 }
    )
  }
}