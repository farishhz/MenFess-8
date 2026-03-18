import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { user, bannedUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get("admin_authenticated");
    
    if (isAuthenticated?.value !== "true") {
      return NextResponse.json({ 
        error: 'Unauthorized. Admin authentication required.',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { userId, reason } = body;

    // Validate required fields
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json({ 
        error: 'User ID is required and must be a valid string',
        code: 'MISSING_USER_ID' 
      }, { status: 400 });
    }

    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      return NextResponse.json({ 
        error: 'Ban reason is required and must be a valid string',
        code: 'MISSING_REASON' 
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 404 });
    }

    // Check if user is already banned
    const alreadyBanned = await db.select()
      .from(bannedUsers)
      .where(eq(bannedUsers.userId, userId))
      .limit(1);

    if (alreadyBanned.length > 0) {
      return NextResponse.json({ 
        error: 'User is already banned',
        code: 'USER_ALREADY_BANNED' 
      }, { status: 400 });
    }

    // Insert ban record
    const bannedUser = await db.insert(bannedUsers)
      .values({
        userId: userId.trim(),
        bannedBy: 'admin',
        reason: reason.trim(),
        bannedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      message: 'User banned successfully',
      data: bannedUser[0]
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/admin/users/ban error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}