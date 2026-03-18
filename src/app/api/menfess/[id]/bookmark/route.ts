import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookmarks, menfessPosts, bannedUsers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params
    
    // Authentication check
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if user is banned
    const bannedUser = await db
      .select()
      .from(bannedUsers)
      .where(eq(bannedUsers.userId, userId))
      .limit(1);

    if (bannedUser.length > 0) {
      return NextResponse.json(
        {
          error: 'You are banned from performing this action.',
          reason: bannedUser[0].reason
        },
        { status: 403 }
      );
    }

    // Validate menfess ID
    const menfessId = parseInt(id);
    if (isNaN(menfessId)) {
      return NextResponse.json(
        { error: 'Invalid menfess ID' },
        { status: 400 }
      );
    }

    // Check if menfess exists
    const menfess = await db
      .select()
      .from(menfessPosts)
      .where(eq(menfessPosts.id, menfessId))
      .limit(1);

    if (menfess.length === 0) {
      return NextResponse.json(
        { error: 'Menfess not found' },
        { status: 404 }
      );
    }

    // Check if bookmark already exists
    const existingBookmark = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.menfessId, menfessId)
        )
      )
      .limit(1);

    // Toggle logic
    if (existingBookmark.length > 0) {
      // Bookmark exists - remove it (unbookmark)
      await db
        .delete(bookmarks)
        .where(eq(bookmarks.id, existingBookmark[0].id));

      return NextResponse.json(
        {
          bookmarked: false,
          message: 'Bookmark removed'
        },
        { status: 200 }
      );
    } else {
      // Bookmark doesn't exist - create it
      await db.insert(bookmarks).values({
        userId,
        menfessId,
        createdAt: new Date().toISOString()
      });

      return NextResponse.json(
        {
          bookmarked: true,
          message: 'Bookmark added'
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('POST bookmark toggle error:', error);
    return NextResponse.json(
      {
        error: 'Failed to toggle bookmark: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}