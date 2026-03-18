import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const ADMIN_USERNAME = "faris10"
const ADMIN_PASSWORD = "mioakiyama10"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Set authentication cookie
      const cookieStore = await cookies()
      cookieStore.set("admin_authenticated", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    )
  }
}
