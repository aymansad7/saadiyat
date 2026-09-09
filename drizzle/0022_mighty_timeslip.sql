CREATE TABLE `aldar_project_discoveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourcePath` varchar(255) NOT NULL,
	`projectSlug` varchar(128) NOT NULL,
	`projectName` varchar(255) NOT NULL,
	`dataset` enum('saadiyat','other') NOT NULL,
	`areaKey` varchar(64) NOT NULL,
	`status` enum('discovered','incomplete','imported','error') NOT NULL DEFAULT 'discovered',
	`unitCount` int NOT NULL DEFAULT 0,
	`firstSeenAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`lastCheckedAt` timestamp,
	`importedAt` timestamp,
	`lastError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aldar_project_discoveries_id` PRIMARY KEY(`id`),
	CONSTRAINT `aldar_project_discoveries_sourcePath_unique` UNIQUE(`sourcePath`)
);
--> statement-breakpoint
CREATE INDEX `aldarProjectDiscoveries_status_idx` ON `aldar_project_discoveries` (`status`);--> statement-breakpoint
CREATE INDEX `aldarProjectDiscoveries_project_slug_idx` ON `aldar_project_discoveries` (`projectSlug`);