import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { comments, menfessPosts, bannedUsers } from "@/db/schema"
import { eq, isNull, sql } from "drizzle-orm"
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

function generateAnonymousBadge(): string {
  const random = Math.floor(Math.random() * 9999) + 1
  return `Anon #${String(random).padStart(4, "0")}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params
    const menfessId = parseInt(id)

    // Get all comments for this menfess
    const allComments = await db
      .select()
      .from(comments)
      .where(eq(comments.menfessId, menfessId))
      .orderBy(comments.createdAt)

    // Organize comments with replies
    const topLevelComments = allComments.filter(c => !c.parentCommentId)
    const commentMap = topLevelComments.map(comment => ({
      ...comment,
      replies: allComments.filter(c => c.parentCommentId === comment.id),
    }))

    return NextResponse.json({ comments: commentMap })
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params
    
    // Check if user is logged in and banned
    const user = await getCurrentUser(request)
    
    if (user && user.id) {
      const bannedUser = await db
        .select()
        .from(bannedUsers)
        .where(eq(bannedUsers.userId, user.id))
        .limit(1)

      if (bannedUser.length > 0) {
        return NextResponse.json(
          { error: "You are banned from commenting.", reason: bannedUser[0].reason },
          { status: 403 }
        )
      }
    }

    const menfessId = parseInt(id)
    const { commentText, parentCommentId } = await request.json()

    const anonymousBadge = generateAnonymousBadge()

    // Insert comment
    await db.insert(comments).values({
      menfessId,
      parentCommentId: parentCommentId || null,
      anonymousBadge,
      commentText,
      createdAt: new Date().toISOString(),
    })

    // Update comment count
    await db
      .update(menfessPosts)
      .set({
        commentsCount: sql`${menfessPosts.commentsCount} + 1`,
      })
      .where(eq(menfessPosts.id, menfessId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Post comment error:", error)
    return NextResponse.json(
      { error: "Failed to post comment" },
      { status: 500 }
    )
  }
}