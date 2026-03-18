import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { menfessPosts } from "@/db/schema"
import { eq, sql } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    // Get a random approved menfess
    const allMenfess = await db
      .select()
      .from(menfessPosts)
      .where(eq(menfessPosts.status, "approved"))

    if (allMenfess.length === 0) {
      return NextResponse.json(
        { error: "No menfess available" },
        { status: 404 }
      )
    }

    const randomIndex = Math.floor(Math.random() * allMenfess.length)
    const randomMenfess = allMenfess[randomIndex]

    return NextResponse.json({ menfess: randomMenfess })
  } catch (error) {
    console.error("Random menfess error:", error)
    return NextResponse.json(
      { error: "Failed to fetch random menfess" },
      { status: 500 }
    )
  }
}
