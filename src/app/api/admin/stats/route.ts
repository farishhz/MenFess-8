import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { menfessPosts } from "@/db/schema"
import { eq, count } from "drizzle-orm"
import { cookies } from "next/headers"

async function checkAuth() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin_authenticated")
  return isAuthenticated?.value === "true"
}

export async function GET(request: NextRequest) {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const [total] = await db
      .select({ count: count() })
      .from(menfessPosts)

    const [pending] = await db
      .select({ count: count() })
      .from(menfessPosts)
      .where(eq(menfessPosts.status, "pending"))

    const [approved] = await db
      .select({ count: count() })
      .from(menfessPosts)
      .where(eq(menfessPosts.status, "approved"))

    const [rejected] = await db
      .select({ count: count() })
      .from(menfessPosts)
      .where(eq(menfessPosts.status, "rejected"))

    return NextResponse.json({
      totalPosts: total.count,
      pendingPosts: pending.count,
      approvedPosts: approved.count,
      rejectedPosts: rejected.count,
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
