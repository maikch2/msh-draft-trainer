CREATE TABLE `practice_events` (
	`seq` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`event_id` text NOT NULL,
	`set_code` text NOT NULL,
	`kind` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `practice_event_once` ON `practice_events` (`user_id`,`event_id`);--> statement-breakpoint
CREATE INDEX `practice_history_lookup` ON `practice_events` (`user_id`,`set_code`,`seq`);--> statement-breakpoint
CREATE TABLE `voice_starts` (
	`user_id` text NOT NULL,
	`hour` integer NOT NULL,
	`count` integer NOT NULL,
	PRIMARY KEY(`user_id`, `hour`)
);
