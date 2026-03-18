import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { menfessPosts, likes, bannedUsers } from "@/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

async function getCurrentUser(request: NextRequest) {
  const headersList = await headers()
  const authHeader = headersList.get("authorization")
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  
  try {
    const session = await auth.api.getSession({ headers: headersList })
    return session?.user || null
  } catch (error) {
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params
    
    // Get current user from bearer token
    const user = await getCurrentUser(request)
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      )
    }

    // Check if user is banned
    const bannedUser = await db
      .select()
      .from(bannedUsers)
      .where(eq(bannedUsers.userId, user.id))
      .limit(1)

    if (bannedUser.length > 0) {
      return NextResponse.json(
        { error: "You are banned from performing this action.", reason: bannedUser[0].reason },
        { status: 403 }
      )
    }

    const menfessId = parseInt(id)
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown"

    // Check if already liked
    const existingLike = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.menfessId, menfessId),
          eq(likes.userId, user.id)
        )
      )
      .limit(1)

    if (existingLike.length > 0) {
      // Unlike
      await db
        .delete(likes)
        .where(eq(likes.id, existingLike[0].id))

      // Update count
      await db
        .update(menfessPosts)
        .set({
          likesCount: sql`${menfessPosts.likesCount} - 1`,
        })
        .where(eq(menfessPosts.id, menfessId))

      const updated = await db
        .select()
        .from(menfessPosts)
        .where(eq(menfessPosts.id, menfessId))
        .limit(1)

      return NextResponse.json({
        liked: false,
        likesCount: updated[0].likesCount,
      })
    } else {
      // Like
      await db.insert(likes).values({
        menfessId,
        userId: user.id,
        ipAddress,
        createdAt: new Date().toISOString(),
      })

      // Update count
      await db
        .update(menfessPosts)
        .set({
          likesCount: sql`${menfessPosts.likesCount} + 1`,
        })
        .where(eq(menfessPosts.id, menfessId))

      const updated = await db
        .select()
        .from(menfessPosts)
        .where(eq(menfessPosts.id, menfessId))
        .limit(1)

      return NextResponse.json({
        liked: true,
        likesCount: updated[0].likesCount,
      })
    }
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json(
      { error: "Failed to like menfess: " + error },
      { status: 500 }
    )
  }
}