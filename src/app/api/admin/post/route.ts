import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/db"
import { menfessPosts } from "@/db/schema"
import { parseSongUrl } from "@/lib/song-parser"

const safeJson = (data: unknown) =>
  JSON.parse(
    JSON.stringify(data, (_, value) => (typeof value === "bigint" ? Number(value) : value))
  )

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get("admin_authenticated")

    if (!adminToken || adminToken.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      postType,
      adminName,
      adminPhoto,
      message,
      target,
      nickname,
      category,
      mood,
      songUrl,
      songMood,
      imageUrl,
      isPinned,
      isHighlighted,
      highlightColor,
    } = body

    if (!message && !songUrl && !imageUrl) {
      return NextResponse.json(
        { error: "Konten post tidak boleh kosong" },
        { status: 400 }
      )
    }

    let parsedSong = null
    if (songUrl) {
      parsedSong = parseSongUrl(songUrl)
      if (!parsedSong.isValid) {
        return NextResponse.json(
          { error: "Link lagu tidak valid" },
          { status: 400 }
        )
      }
    }

    const adminBadge = "✓ Admin"
    const timestamp = new Date().toISOString()
    const finalNickname = nickname || adminName || "Admin RPL"
    const finalCategory = category || "announcement"
    const finalMood = mood || "happy"

    const insertData = {
      nickname: finalNickname,
      target: target || null,
      message: message || "",
      category: finalCategory,
      mood: finalMood,
      anonymousBadge: `ADMIN-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "approved",
      createdAt: timestamp,
      isNightConfess: false,
      songUrl: songUrl || null,
      songType: parsedSong?.type || null,
      songMood: songMood || null,
      isAdminPost: true,
      adminName: adminName || "Admin RPL",
      adminPhoto: adminPhoto || null,
      adminBadge: adminBadge,
      postType: postType || "menfess",
      isPinned: isPinned || false,
      isHighlighted: isHighlighted || false,
      highlightColor: highlightColor || null,
      imageUrl: imageUrl || null,
    }

    const result = await db.insert(menfessPosts).values(insertData)

    const rawPostId = result.lastInsertRowid ?? null
    const postId = rawPostId !== null ? Number(rawPostId) : null

    return NextResponse.json(
      safeJson({
        success: true,
        message: "Post admin berhasil dibuat!",
        postId,
      })
    )
  } catch (error: any) {
    console.error("Admin post error:", error)
    return NextResponse.json(
      { error: `Gagal membuat post admin: ${error?.message || "Unknown error"}` },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get("admin_authenticated")

    if (!adminToken || adminToken.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { postId, isPinned, isHighlighted, highlightColor } = body

    if (!postId) {
      return NextResponse.json({ error: "Post ID required" }, { status: 400 })
    }

    const { eq } = await import("drizzle-orm")
    
    await db
      .update(menfessPosts)
      .set({
        isPinned: isPinned ?? undefined,
        isHighlighted: isHighlighted ?? undefined,
        highlightColor: highlightColor ?? undefined,
      })
      .where(eq(menfessPosts.id, postId))

    return NextResponse.json({
      success: true,
      message: "Post berhasil diupdate",
    })
  } catch (error) {
    console.error("Admin update error:", error)
    return NextResponse.json(
      { error: "Gagal update post" },
      { status: 500 }
    )
  }
}