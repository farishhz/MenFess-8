import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import fs from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get("admin_authenticated")

    if (!adminToken || adminToken.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const type = formData.get("type") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed" },
        { status: 400 }
      )
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const cwd = process.cwd()
    const uploadDir = path.join(cwd, "public", "uploads").replace(/\\/g, "/")
    
    try {
      await fs.mkdir(uploadDir, { recursive: true })
    } catch (mkdirError: any) {
      if (mkdirError.code !== "EEXIST") {
        console.error("Mkdir error:", mkdirError)
      }
    }

    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const originalExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const ext = ["jpg", "jpeg", "png", "webp", "gif"].includes(originalExt) ? originalExt : "jpg"
    const filename = `${type === "profile" ? "profile" : "post"}_${timestamp}_${randomId}.${ext}`
    const filepath = path.join(uploadDir, filename).replace(/\\/g, "/")

    await fs.writeFile(filepath, buffer)

    const url = `/uploads/${filename}`

    return NextResponse.json({
      success: true,
      url,
      filename,
    })
  } catch (error: any) {
    console.error("Upload error:", error?.message || error)
    return NextResponse.json(
      { error: `Failed to upload file: ${error?.message || "Unknown error"}` },
      { status: 500 }
    )
  }
}