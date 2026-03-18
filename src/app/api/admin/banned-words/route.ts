import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { bannedWords } from "@/db/schema"
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

    const words = await db.select().from(bannedWords)

    return NextResponse.json({ words })
  } catch (error) {
    console.error("Get banned words error:", error)
    return NextResponse.json(
      { error: "Failed to fetch banned words" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { word } = await request.json()

    await db.insert(bannedWords).values({
      word: word.toLowerCase(),
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Add banned word error:", error)
    return NextResponse.json(
      { error: "Failed to add banned word" },
      { status: 500 }
    )
  }
}
