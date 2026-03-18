import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { reactions, reactionCounts, bannedUsers } from "@/db/schema"
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
    const { reactionType } = await request.json()
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown"

    // Check if user already has a reaction on this menfess
    const existingReaction = await db
      .select()
      .from(reactions)
      .where(
        and(
          eq(reactions.menfessId, menfessId),
          eq(reactions.userId, user.id)
        )
      )
      .limit(1)

    let resultReactionType: string | null = reactionType

    if (existingReaction.length > 0) {
      const oldReactionType = existingReaction[0].reactionType

      // If clicking same reaction, remove it
      if (oldReactionType === reactionType) {
        // Delete reaction
        await db
          .delete(reactions)
          .where(eq(reactions.id, existingReaction[0].id))

        // Decrease count for old reaction
        await db
          .update(reactionCounts)
          .set({
            count: sql`${reactionCounts.count} - 1`,
          })
          .where(
            and(
              eq(reactionCounts.menfessId, menfessId),
              eq(reactionCounts.reactionType, oldReactionType)
            )
          )

        resultReactionType = null
      } else {
        // Update to new reaction type
        await db
          .update(reactions)
          .set({
            reactionType,
            ipAddress,
          })
          .where(eq(reactions.id, existingReaction[0].id))

        // Decrease count for old reaction
        await db
          .update(reactionCounts)
          .set({
            count: sql`${reactionCounts.count} - 1`,
          })
          .where(
            and(
              eq(reactionCounts.menfessId, menfessId),
              eq(reactionCounts.reactionType, oldReactionType)
            )
          )

        // Increase count for new reaction (or create if not exists)
        const existingCount = await db
          .select()
          .from(reactionCounts)
          .where(
            and(
              eq(reactionCounts.menfessId, menfessId),
              eq(reactionCounts.reactionType, reactionType)
            )
          )
          .limit(1)

        if (existingCount.length > 0) {
          await db
            .update(reactionCounts)
            .set({
              count: sql`${reactionCounts.count} + 1`,
            })
            .where(eq(reactionCounts.id, existingCount[0].id))
        } else {
          await db.insert(reactionCounts).values({
            menfessId,
            reactionType,
            count: 1,
          })
        }
      }
    } else {
      // Create new reaction
      await db.insert(reactions).values({
        menfessId,
        userId: user.id,
        reactionType,
        ipAddress,
        createdAt: new Date().toISOString(),
      })

      // Increase count for new reaction (or create if not exists)
      const existingCount = await db
        .select()
        .from(reactionCounts)
        .where(
          and(
            eq(reactionCounts.menfessId, menfessId),
            eq(reactionCounts.reactionType, reactionType)
          )
        )
        .limit(1)

      if (existingCount.length > 0) {
        await db
          .update(reactionCounts)
          .set({
            count: sql`${reactionCounts.count} + 1`,
          })
          .where(eq(reactionCounts.id, existingCount[0].id))
      } else {
        await db.insert(reactionCounts).values({
          menfessId,
          reactionType,
          count: 1,
        })
      }
    }

    // Get all reaction counts
    const allCounts = await db
      .select()
      .from(reactionCounts)
      .where(eq(reactionCounts.menfessId, menfessId))

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

    return NextResponse.json({
      reactionType: resultReactionType,
      reactionCounts: reactionCountsObj,
    })
  } catch (error) {
    console.error("Reaction error:", error)
    return NextResponse.json(
      { error: "Failed to add reaction: " + error },
      { status: 500 }
    )
  }
}