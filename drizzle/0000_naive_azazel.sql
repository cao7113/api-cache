CREATE TABLE `remote_responses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`path_key` text NOT NULL,
	`vendor` text NOT NULL,
	`path` text NOT NULL,
	`response_data` text NOT NULL,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vendor_path_pathkey_idx` ON `remote_responses` (`vendor`,`path`,`path_key`);