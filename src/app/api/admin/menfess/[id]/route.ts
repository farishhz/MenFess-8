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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params
    
    // Auth check
    const isAuth = await checkAuth()
    if (!isAuth) {
      console.error('DELETE menfess - Unauthorized access attempt')
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const menfessId = parseInt(id)
    
    if (isNaN(menfessId)) {
      console.error('DELETE menfess - Invalid ID:', id)
      return NextResponse.json(
        { error: "Invalid menfess ID" },
        { status: 400 }
      )
    }

    console.log('DELETE menfess - Starting deletion for ID:', menfessId)

    // Check if menfess exists
    const existingMenfess = await db.query.menfessPosts.findFirst({
      where: eq(menfessPosts.id, menfessId)
    })

    if (!existingMenfess) {
      console.error('DELETE menfess - Menfess not found:', menfessId)
      return NextResponse.json(
        { error: "Menfess not found" },
        { status: 404 }
      )
    }

    // Delete the menfess post - CASCADE will automatically delete all related records
    // (comments, likes, reactions, reactionCounts)
    await db.delete(menfessPosts).where(eq(menfessPosts.id, menfessId))
    console.log('DELETE menfess - Successfully deleted menfess and all related records:', menfessId)

    return NextResponse.json({ 
      success: true,
      message: 'Menfess and all related data deleted successfully',
      deletedId: menfessId
    })
  } catch (error) {
    console.error("DELETE menfess - Unexpected error:", error)
    return NextResponse.json(
      { error: "Failed to delete menfess" },
      { status: 500 }
    )
  }
}