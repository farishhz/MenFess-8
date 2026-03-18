import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { user, bannedUsers } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('admin_authenticated');
  return isAuthenticated?.value === 'true';
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get all users
    const allUsers = await db
      .select()
      .from(user)
      .orderBy(desc(user.createdAt));

    // Get all banned users
    const bannedUsersData = await db
      .select()
      .from(bannedUsers);

    // Create a map for quick lookup
    const bannedMap = new Map(
      bannedUsersData.map((bu) => [bu.userId, bu])
    );

    // Transform the results to include isBanned boolean
    const users = allUsers.map((u) => {
      const banInfo = bannedMap.get(u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: new Date(u.createdAt).toISOString(),
        isBanned: banInfo !== undefined,
        banReason: banInfo?.reason || null,
      };
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}