CREATE TABLE `inventory_imported_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dataset` enum('saadiyat','other') NOT NULL,
	`projectSlug` varchar(128) NOT NULL,
	`projectName` varchar(255) NOT NULL,
	`areaKey` varchar(64) NOT NULL,
	`sourceJson` longtext NOT NULL,
	`unitCount` int NOT NULL DEFAULT 0,
	`availableCount` int NOT NULL DEFAULT 0,
	`firstDetectedRunId` int,
	`lastImportedRunId` int NOT NULL,
	`importedBy` varchar(320) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_imported_projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_imported_projects_identity_unique` UNIQUE(`dataset`,`projectSlug`)
);
--> statement-breakpoint
ALTER TABLE `inventory_unit_state` DROP INDEX `inventory_unit_state_unitName_unique`;--> statement-breakpoint
ALTER TABLE `inventory_unit_state` ADD CONSTRAINT `inventory_unit_state_identity_unique` UNIQUE(`dataset`,`projectSlug`,`unitName`);--> statement-breakpoint
CREATE INDEX `inventory_imported_projects_area_idx` ON `inventory_imported_projects` (`areaKey`);--> statement-breakpoint
CREATE INDEX `inventory_imported_projects_run_idx` ON `inventory_imported_projects` (`lastImportedRunId`);