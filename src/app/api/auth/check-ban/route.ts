import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bannedUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ banned: false });
    }

    // Check if user is banned
    const banned = await db.select()
      .from(bannedUsers)
      .where(eq(bannedUsers.userId, userId))
      .limit(1);

    if (banned.length > 0) {
      return NextResponse.json({ 
        banned: true,
        reason: banned[0].reason,
        bannedAt: banned[0].bannedAt
      });
    }

    return NextResponse.json({ banned: false });
  } catch (error) {
    console.error('Check ban error:', error);
    return NextResponse.json({ banned: false });
  }
}
