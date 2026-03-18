import { sqliteTable, integer, text, unique } from 'drizzle-orm/sqlite-core';

// Menfess posts table
export const menfessPosts = sqliteTable('menfess_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nickname: text('nickname').notNull(),
  target: text('target'),
  message: text('message').notNull(),
  category: text('category').notNull(),
  mood: text('mood'),
  anonymousBadge: text('anonymous_badge').notNull(),
  status: text('status').notNull().default('pending'),
  likesCount: integer('likes_count').default(0),
  commentsCount: integer('comments_count').default(0),
  ipAddress: text('ip_address'),
  deviceInfo: text('device_info'),
  createdAt: text('created_at').notNull(),
  isNightConfess: integer('is_night_confess', { mode: 'boolean' }).default(false),
  kelas: text('kelas'),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  songUrl: text('song_url'),
  songType: text('song_type'),
  songMood: text('song_mood'),
  isAdminPost: integer('is_admin_post', { mode: 'boolean' }).default(false),
  adminName: text('admin_name'),
  adminPhoto: text('admin_photo'),
  adminBadge: text('admin_badge'),
  postType: text('post_type').default('menfess'),
  isPinned: integer('is_pinned', { mode: 'boolean' }).default(false),
  isHighlighted: integer('is_highlighted', { mode: 'boolean' }).default(false),
  highlightColor: text('highlight_color'),
  imageUrl: text('image_url'),
});

// Admin stories table
export const adminStories = sqliteTable('admin_stories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  adminName: text('admin_name').notNull(),
  adminPhoto: text('admin_photo'),
  content: text('content'),
  imageUrl: text('image_url'),
  videoUrl: text('video_url'),
  createdAt: text('created_at').notNull(),
  expiresAt: text('expires_at').notNull(),
  viewsCount: integer('views_count').default(0),
});

// Admin broadcasts table
export const adminBroadcasts = sqliteTable('admin_broadcasts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  adminName: text('admin_name').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  createdAt: text('created_at').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
});

// Comments table
export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  menfessId: integer('menfess_id').references(() => menfessPosts.id, { onDelete: 'cascade' }).notNull(),
  parentCommentId: integer('parent_comment_id'),
  anonymousBadge: text('anonymous_badge').notNull(),
  commentText: text('comment_text').notNull(),
  createdAt: text('created_at').notNull(),
});

// Likes table - updated with userId
export const likes = sqliteTable('likes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  menfessId: integer('menfess_id').references(() => menfessPosts.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  ipAddress: text('ip_address').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  uniqueUserLike: unique().on(table.menfessId, table.userId),
}));

// Reactions table - with unique constraint on menfess+user
export const reactions = sqliteTable('reactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  menfessId: integer('menfess_id').references(() => menfessPosts.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  reactionType: text('reaction_type').notNull(),
  ipAddress: text('ip_address').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  uniqueUserReaction: unique().on(table.menfessId, table.userId),
}));

// Rate limits table
export const rateLimits = sqliteTable('rate_limits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ipAddress: text('ip_address').notNull().unique(),
  submissionCount: integer('submission_count').default(0),
  lastReset: text('last_reset').notNull(),
});

// Banned words table
export const bannedWords = sqliteTable('banned_words', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  word: text('word').notNull().unique(),
  createdAt: text('created_at').notNull(),
});

// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// New bannedUsers table
export const bannedUsers = sqliteTable('banned_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => user.id).notNull().unique(),
  bannedBy: text('banned_by').notNull(),
  reason: text('reason').notNull(),
  bannedAt: text('banned_at').notNull(),
});

// New reactionCounts table
export const reactionCounts = sqliteTable('reaction_counts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  menfessId: integer('menfess_id').references(() => menfessPosts.id, { onDelete: 'cascade' }).notNull(),
  reactionType: text('reaction_type').notNull(),
  count: integer('count').default(0).notNull(),
}, (table) => ({
  uniqueMenfessReaction: unique().on(table.menfessId, table.reactionType),
}));

// Add bookmarks table
export const bookmarks = sqliteTable('bookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  menfessId: integer('menfess_id').references(() => menfessPosts.id, { onDelete: 'cascade' }).notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  uniqueUserBookmark: unique().on(table.userId, table.menfessId),
}));