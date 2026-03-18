import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { bannedUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get('admin_authenticated');
    
    if (isAuthenticated?.value !== 'true') {
      return NextResponse.json(
        { 
          error: 'Unauthorized access. Admin authentication required.',
          code: 'UNAUTHORIZED' 
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { userId } = body;

    // Validate required field
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Validate userId is a string
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Valid user ID is required',
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Check if user is actually banned
    const bannedUser = await db.select()
      .from(bannedUsers)
      .where(eq(bannedUsers.userId, userId))
      .limit(1);

    if (bannedUser.length === 0) {
      return NextResponse.json(
        { 
          error: 'User is not banned',
          code: 'USER_NOT_BANNED' 
        },
        { status: 404 }
      );
    }

    // Delete the ban entry
    await db.delete(bannedUsers)
      .where(eq(bannedUsers.userId, userId));

    return NextResponse.json(
      { 
        success: true,
        message: 'User unbanned successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST /api/admin/users/unban error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}