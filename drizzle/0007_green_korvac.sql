PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`menfess_id` integer NOT NULL,
	`parent_comment_id` integer,
	`anonymous_badge` text NOT NULL,
	`comment_text` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`menfess_id`) REFERENCES `menfess_posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_comments`("id", "menfess_id", "parent_comment_id", "anonymous_badge", "comment_text", "created_at") SELECT "id", "menfess_id", "parent_comment_id", "anonymous_badge", "comment_text", "created_at" FROM `comments`;--> statement-breakpoint
DROP TABLE `comments`;--> statement-breakpoint
ALTER TABLE `__new_comments` RENAME TO `comments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_likes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`menfess_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`ip_address` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`menfess_id`) REFERENCES `menfess_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_likes`("id", "menfess_id", "user_id", "ip_address", "created_at") SELECT "id", "menfess_id", "user_id", "ip_address", "created_at" FROM `likes`;--> statement-breakpoint
DROP TABLE `likes`;--> statement-breakpoint
ALTER TABLE `__new_likes` RENAME TO `likes`;--> statement-breakpoint
CREATE UNIQUE INDEX `likes_menfess_id_user_id_unique` ON `likes` (`menfess_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `__new_reaction_counts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`menfess_id` integer NOT NULL,
	`reaction_type` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`menfess_id`) REFERENCES `menfess_posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_reaction_counts`("id", "menfess_id", "reaction_type", "count") SELECT "id", "menfess_id", "reaction_type", "count" FROM `reaction_counts`;--> statement-breakpoint
DROP TABLE `reaction_counts`;--> statement-breakpoint
ALTER TABLE `__new_reaction_counts` RENAME TO `reaction_counts`;--> statement-breakpoint
CREATE UNIQUE INDEX `reaction_counts_menfess_id_reaction_type_unique` ON `reaction_counts` (`menfess_id`,`reaction_type`);--> statement-breakpoint
CREATE TABLE `__new_reactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`menfess_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`reaction_type` text NOT NULL,
	`ip_address` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`menfess_id`) REFERENCES `menfess_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_reactions`("id", "menfess_id", "user_id", "reaction_type", "ip_address", "created_at") SELECT "id", "menfess_id", "user_id", "reaction_type", "ip_address", "created_at" FROM `reactions`;--> statement-breakpoint
DROP TABLE `reactions`;--> statement-breakpoint
ALTER TABLE `__new_reactions` RENAME TO `reactions`;--> statement-breakpoint
CREATE UNIQUE INDEX `reactions_menfess_id_user_id_unique` ON `reactions` (`menfess_id`,`user_id`);