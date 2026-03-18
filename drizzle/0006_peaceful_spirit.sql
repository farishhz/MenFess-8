ALTER TABLE `menfess_posts` ADD `kelas` text;--> statement-breakpoint
ALTER TABLE `menfess_posts` ADD `user_id` text REFERENCES user(id);