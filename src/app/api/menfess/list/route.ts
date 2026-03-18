import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { menfessPosts, likes, reactions, reactionCounts, bookmarks, bannedUsers, user } from "@/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

async function getCurrentUser(request: NextRequest) {
  const headersList = await headers()
  const authHeader = headersList.get("authorization")
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  try {
    const session = await auth.api.getSession({ headers: headersList })
    return session?.user || null
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const mood = searchParams.get("mood")
    const topFess = searchParams.get("topFess")

    // Get current user (optional for list)
    const currentUser = await getCurrentUser(request)
    const userId = currentUser?.id || null

    let query = db
      .select()
      .from(menfessPosts)
      .leftJoin(user, eq(menfessPosts.userId, user.id))
      .where(eq(menfessPosts.status, "approved"))
      .$dynamic()

    // Apply filters
    if (category && category !== "all") {
      query = query.where(eq(menfessPosts.category, category))
    }

    if (mood) {
      query = query.where(eq(menfessPosts.mood, mood))
    }

    // Get menfess with user data - order by pinned first, then by date
    let results = await query
      .orderBy(desc(menfessPosts.isPinned), desc(menfessPosts.createdAt))
      .limit(50)

    // Extract menfess data
    let menfessData = results.map((r) => ({
      menfess: r.menfess_posts,
      userEmail: r.user?.email || null,
      userName: r.user?.name || null,
    }))

    // If Top Fess, sort by likes
    if (topFess === "true") {
      menfessData = menfessData
        .sort((a, b) => (b.menfess.likesCount || 0) - (a.menfess.likesCount || 0))
        .slice(0, 5)
    }

    // Get user likes, reactions, and bookmarks if logged in
    const menfessWithUserData = await Promise.all(
      menfessData.map(async (item) => {
        const m = item.menfess
        let userLiked = false
        let userReaction: string | null = null
        let userBookmarked = false

        if (userId) {
          // Check if user liked
          const userLike = await db
            .select()
            .from(likes)
            .where(
              and(
                eq(likes.menfessId, m.id),
                eq(likes.userId, userId)
              )
            )
            .limit(1)

          userLiked = userLike.length > 0

          // Check user reaction
          const userReactionData = await db
            .select()
            .from(reactions)
            .where(
              and(
                eq(reactions.menfessId, m.id),
                eq(reactions.userId, userId)
              )
            )
            .limit(1)

          userReaction = userReactionData.length > 0 ? userReactionData[0].reactionType : null

          // Check if user bookmarked
          const userBookmark = await db
            .select()
            .from(bookmarks)
            .where(
              and(
                eq(bookmarks.menfessId, m.id),
                eq(bookmarks.userId, userId)
              )
            )
            .limit(1)

          userBookmarked = userBookmark.length > 0
        }

        // Get reaction counts
        const allCounts = await db
          .select()
          .from(reactionCounts)
          .where(eq(reactionCounts.menfessId, m.id))

        const reactionCountsObj = {
          thumbs: 0,
          laugh: 0,
          heart: 0,
          sad: 0,
          rofl: 0,
        }

        allCounts.forEach((rc) => {
          if (rc.reactionType in reactionCountsObj) {
            reactionCountsObj[rc.reactionType as keyof typeof reactionCountsObj] = rc.count
          }
        })

        return {
          ...m,
          userEmail: item.userEmail,
          userName: item.userName,
          userLiked,
          userReaction,
          userBookmarked,
          reactionCounts: reactionCountsObj,
        }
      })
    )

    return NextResponse.json({ menfess: menfessWithUserData })
  } catch (error) {
    console.error("List error:", error)
    return NextResponse.json(
      { error: "Failed to fetch menfess: " + error },
      { status: 500 }
    )
  }
}