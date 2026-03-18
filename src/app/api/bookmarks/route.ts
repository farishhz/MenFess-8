import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookmarks, menfessPosts, user, likes, reactions, reactionCounts } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const currentUserId = session.user.id;

    // Fetch all bookmarks for current user with menfess details and user info
    const userBookmarks = await db
      .select({
        bookmarkId: bookmarks.id,
        bookmarkedAt: bookmarks.createdAt,
        menfessId: bookmarks.menfessId,
        menfess: menfessPosts,
        author: user,
      })
      .from(bookmarks)
      .leftJoin(menfessPosts, eq(bookmarks.menfessId, menfessPosts.id))
      .leftJoin(user, eq(menfessPosts.userId, user.id))
      .where(eq(bookmarks.userId, currentUserId))
      .orderBy(desc(bookmarks.createdAt));

    // Filter out bookmarks where menfess has been deleted
    const validBookmarks = userBookmarks.filter(bookmark => bookmark.menfess !== null);

    // Enrich each bookmark with user interaction data
    const enrichedBookmarks = await Promise.all(
      validBookmarks.map(async (bookmark) => {
        const menfessId = bookmark.menfess!.id;

        // Check if user liked this menfess
        const userLikeResult = await db
          .select()
          .from(likes)
          .where(and(eq(likes.menfessId, menfessId), eq(likes.userId, currentUserId)))
          .limit(1);
        const userLiked = userLikeResult.length > 0;

        // Get user's reaction on this menfess
        const userReactionResult = await db
          .select()
          .from(reactions)
          .where(and(eq(reactions.menfessId, menfessId), eq(reactions.userId, currentUserId)))
          .limit(1);
        const userReaction = userReactionResult.length > 0 ? userReactionResult[0].reactionType : null;

        // Get reaction counts for this menfess
        const reactionCountsResult = await db
          .select()
          .from(reactionCounts)
          .where(eq(reactionCounts.menfessId, menfessId));

        // Initialize reaction counts object
        const reactionCountsObj: { thumbs: number; laugh: number; heart: number; sad: number; rofl: number } = {
          thumbs: 0,
          laugh: 0,
          heart: 0,
          sad: 0,
          rofl: 0,
        };

        // Populate reaction counts
        reactionCountsResult.forEach((rc) => {
          const reactionType = rc.reactionType as keyof typeof reactionCountsObj;
          if (reactionType in reactionCountsObj) {
            reactionCountsObj[reactionType] = rc.count ?? 0;
          }
        });

        return {
          bookmarkId: bookmark.bookmarkId,
          bookmarkedAt: bookmark.bookmarkedAt,
          menfess: {
            id: bookmark.menfess!.id,
            nickname: bookmark.menfess!.nickname,
            target: bookmark.menfess!.target,
            message: bookmark.menfess!.message,
            category: bookmark.menfess!.category,
            mood: bookmark.menfess!.mood,
            anonymousBadge: bookmark.menfess!.anonymousBadge,
            status: bookmark.menfess!.status,
            likesCount: bookmark.menfess!.likesCount,
            commentsCount: bookmark.menfess!.commentsCount,
            createdAt: bookmark.menfess!.createdAt,
            isNightConfess: bookmark.menfess!.isNightConfess,
            kelas: bookmark.menfess!.kelas,
            userEmail: bookmark.author?.email ?? null,
            userName: bookmark.author?.name ?? null,
            userLiked,
            userReaction,
            reactionCounts: reactionCountsObj,
          },
        };
      })
    );

    return NextResponse.json({ bookmarks: enrichedBookmarks }, { status: 200 });
  } catch (error) {
    console.error('GET bookmarks error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}