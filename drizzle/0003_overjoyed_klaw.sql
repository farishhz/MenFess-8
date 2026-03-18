DROP INDEX `reactions_menfess_id_user_id_reaction_type_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `reactions_menfess_id_user_id_unique` ON `reactions` (`menfess_id`,`user_id`);