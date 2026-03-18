CREATE TABLE `banned_words` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`word` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `banned_words_word_unique` ON `banned_words` (`word`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`menfess_id` integer NOT NULL,
	`parent_comment_id` integer,
	`anonymous_badge` text NOT NULL,
	`comment_text` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`menfess_id`) REFERENCES `menfess_posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`menfess_id` integer NOT NULL,
	`ip_address` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`menfess_id`) REFERENCES `menfess_posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `menfess_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nickname` text NOT NULL,
	`target` text,
	`message` text NOT NULL,
	`category` text NOT NULL,
	`mood` text,
	`anonymous_badge` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`likes_count` integer DEFAULT 0,
	`comments_count` integer DEFAULT 0,
	`ip_address` text,
	`device_info` text,
	`created_at` text NOT NULL,
	`is_night_confess` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ip_address` text NOT NULL,
	`submission_count` integer DEFAULT 0,
	`last_reset` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rate_limits_ip_address_unique` ON `rate_limits` (`ip_address`);--> statement-breakpoint
CREATE TABLE `reactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`menfess_id` integer NOT NULL,
	`reaction_type` text NOT NULL,
	`ip_address` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`menfess_id`) REFERENCES `menfess_posts`(`id`) ON UPDATE no action ON DELETE no action
);
