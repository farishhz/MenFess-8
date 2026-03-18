import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { menfessPosts, user } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let query = db
      .select()
      .from(menfessPosts)
      .leftJoin(user, eq(menfessPosts.userId, user.id))
      .$dynamic()

    if (status) {
      query = query.where(eq(menfessPosts.status, status))
    }

    const results = await query.orderBy(desc(menfessPosts.createdAt))

    // Transform results to include user info
    const menfess = results.map((result) => {
      const post = result.menfess_posts
      const userData = result.user
      
      return {
        ...post,
        userEmail: userData?.email || null,
        userName: userData?.name || null,
      }
    })

    return NextResponse.json({ menfess })
  } catch (error) {
    console.error("Admin menfess list error:", error)
    return NextResponse.json(
      { error: "Failed to fetch menfess: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}