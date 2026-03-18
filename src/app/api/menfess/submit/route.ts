import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { menfessPosts, rateLimits, bannedWords, bannedUsers } from "@/db/schema"
import { eq } from "drizzle-orm"
import { parseSongUrl } from "@/lib/song-parser"
import { auth } from "@/lib/auth"

async function getCurrentUser(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    return session?.user || null
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

// Profanity filter helper
async function containsBannedWords(text: string): Promise<boolean> {
  const words = await db.select().from(bannedWords)
  const lowerText = text.toLowerCase()
  
  return words.some(word => lowerText.includes(word.word.toLowerCase()))
}

// Rate limiting helper
async function checkRateLimit(ipAddress: string): Promise<boolean> {
  const now = new Date()
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

  const limitRecord = await db
    .select()
    .from(rateLimits)
    .where(eq(rateLimits.ipAddress, ipAddress))
    .limit(1)

  if (limitRecord.length === 0) {
    // Create new record
    await db.insert(rateLimits).values({
      ipAddress,
      submissionCount: 1,
      lastReset: now.toISOString(),
    })
    return true
  }

  const record = limitRecord[0]
  const lastReset = new Date(record.lastReset)

  // Reset if more than 5 minutes passed
  if (lastReset < fiveMinutesAgo) {
    await db
      .update(rateLimits)
      .set({
        submissionCount: 1,
        lastReset: now.toISOString(),
      })
      .where(eq(rateLimits.ipAddress, ipAddress))
    return true
  }

  // Check if under limit
  if (record.submissionCount < 3) {
    await db
      .update(rateLimits)
      .set({
        submissionCount: record.submissionCount + 1,
      })
      .where(eq(rateLimits.ipAddress, ipAddress))
    return true
  }

  return false
}

// Generate anonymous badge
function generateAnonymousBadge(): string {
  const random = Math.floor(Math.random() * 9999) + 1
  return `Anon #${String(random).padStart(4, "0")}`
}

// Check if it's night time (7PM - 12AM)
function isNightTime(): boolean {
  const hour = new Date().getHours()
  return hour >= 19 || hour < 0
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is logged in and banned
    const user = await getCurrentUser(request)
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Authentication required. Please login first." },
        { status: 401 }
      )
    }
    
    const bannedUser = await db
      .select()
      .from(bannedUsers)
      .where(eq(bannedUsers.userId, user.id))
      .limit(1)

    if (bannedUser.length > 0) {
      return NextResponse.json(
        { error: "You are banned from submitting menfess.", reason: bannedUser[0].reason },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { nickname, target, message, category, mood, kelas, songUrl, songMood } = body

    // Get IP address
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown"

    // Get device info
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Check rate limit
    const canSubmit = await checkRateLimit(ipAddress)
    if (!canSubmit) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Maximum 3 submissions per 5 minutes." },
        { status: 429 }
      )
    }

    // Check for banned words
    const hasBannedWords = await containsBannedWords(message)
    if (hasBannedWords) {
      return NextResponse.json(
        { error: "Message contains inappropriate content." },
        { status: 400 }
      )
    }

    // Validate and parse song URL if provided
    let parsedSong = null
    if (songUrl && songUrl.trim() !== "") {
      parsedSong = parseSongUrl(songUrl.trim())
      
      if (!parsedSong.isValid) {
        return NextResponse.json(
          { error: "Invalid song URL. Please use a valid YouTube or Spotify link." },
          { status: 400 }
        )
      }
    }

    // Generate anonymous badge
    const anonymousBadge = generateAnonymousBadge()
    const isNightConfess = isNightTime()

    const result = await db
      .insert(menfessPosts)
      .values({
        nickname,
        target: target || null,
        message,
        category,
        mood,
        kelas: kelas || null,
        userId: user.id,
        anonymousBadge,
        status: "approved",
        ipAddress,
        deviceInfo: userAgent,
        isNightConfess,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0,
        songUrl: parsedSong ? parsedSong.originalUrl : null,
        songType: parsedSong ? parsedSong.type : null,
        songMood: songMood || null,
      })

    const postId = result.lastInsertRowid ? Number(result.lastInsertRowid) : null

    return NextResponse.json({
      success: true,
      anonymousBadge,
      isNightConfess,
      isSongFess: !!parsedSong,
      postId,
      message: parsedSong ? "SongFess posted successfully" : "Menfess posted successfully",
    })
  } catch (error) {
    console.error("Submit error:", error)
    return NextResponse.json(
      { error: "Failed to submit menfess" },
      { status: 500 }
    )
  }
}