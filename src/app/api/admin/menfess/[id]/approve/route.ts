import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { menfessPosts } from "@/db/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"

async function checkAuth() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin_authenticated")
  return isAuthenticated?.value === "true"
}

export async function POST(
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

    const menfessId = parseInt(id)

    await db
      .update(menfessPosts)
      .set({ status: "approved" })
      .where(eq(menfessPosts.id, menfessId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Approve error:", error)
    return NextResponse.json(
      { error: "Failed to approve menfess" },
      { status: 500 }
    )
  }
}