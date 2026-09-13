CREATE TABLE `external_developer_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectSlug` varchar(128) NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`developerName` varchar(255) NOT NULL,
	`locationLabel` varchar(255) NOT NULL,
	`sourceProjectName` varchar(255) NOT NULL,
	`sourceWorkbook` varchar(255) NOT NULL,
	`sourceSheet` varchar(255) NOT NULL,
	`sourceRowCount` int NOT NULL DEFAULT 0,
	`sourceAvailableCount` int NOT NULL DEFAULT 0,
	`importedBy` varchar(320) NOT NULL,
	`importedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `external_developer_projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `external_developer_projects_slug_unique` UNIQUE(`projectSlug`)
);
--> statement-breakpoint
CREATE TABLE `external_developer_units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectSlug` varchar(128) NOT NULL,
	`sourceId` int NOT NULL,
	`sourceRow` int NOT NULL,
	`unitNumber` varchar(128) NOT NULL,
	`sourceTitle` varchar(255),
	`sourceStatus` varchar(64),
	`propertyType` varchar(255),
	`internalAreaSqft` double,
	`externalAreaSqft` double,
	`totalAreaSqft` double,
	`floorLabel` varchar(64),
	`viewLabel` varchar(255),
	`sourceExplorerUrl` varchar(1024),
	`sourceRating` varchar(64),
	`sourceDescription` text,
	`sourceWorkbook` varchar(255) NOT NULL,
	`sourceSheet` varchar(255) NOT NULL,
	`importedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `external_developer_units_id` PRIMARY KEY(`id`),
	CONSTRAINT `external_developer_units_source_unique` UNIQUE(`projectSlug`,`sourceId`)
);
--> statement-breakpoint
CREATE INDEX `external_developer_projects_developer_idx` ON `external_developer_projects` (`developerName`);--> statement-breakpoint
CREATE INDEX `external_developer_units_project_idx` ON `external_developer_units` (`projectSlug`);--> statement-breakpoint
CREATE INDEX `external_developer_units_status_idx` ON `external_developer_units` (`projectSlug`,`sourceStatus`);--> statement-breakpoint
CREATE INDEX `external_developer_units_number_idx` ON `external_developer_units` (`unitNumber`);