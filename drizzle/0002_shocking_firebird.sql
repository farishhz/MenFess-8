CREATE TABLE `banned_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`banned_by` text NOT NULL,
	`reason` text NOT NULL,
	`banned_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `banned_users_user_id_unique` ON `banned_users` (`user_id`);--> statement-breakpoint
CREATE TABLE `reaction_counts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`menfess_id` integer NOT NULL,
	`reaction_type` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`menfess_id`) REFERENCES `menfess_posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reaction_counts_menfess_id_reaction_type_unique` ON `reaction_counts` (`menfess_id`,`reaction_type`);--> statement-breakpoint
ALTER TABLE `likes` ADD `user_id` text NOT NULL REFERENCES user(id);--> statement-breakpoint
CREATE UNIQUE INDEX `likes_menfess_id_user_id_unique` ON `likes` (`menfess_id`,`user_id`);--> statement-breakpoint
ALTER TABLE `reactions` ADD `user_id` text NOT NULL REFERENCES user(id);--> statement-breakpoint
CREATE UNIQUE INDEX `reactions_menfess_id_user_id_reaction_type_unique` ON `reactions` (`menfess_id`,`user_id`,`reaction_type`);