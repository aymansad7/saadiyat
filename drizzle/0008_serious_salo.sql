CREATE TABLE `inventory_sync_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trigger` enum('scheduled','manual','seed') NOT NULL,
	`status` enum('running','success','error') NOT NULL DEFAULT 'running',
	`triggeredBy` varchar(320),
	`unitsScanned` int NOT NULL DEFAULT 0,
	`newUnits` int NOT NULL DEFAULT 0,
	`soldUnits` int NOT NULL DEFAULT 0,
	`statusChanges` int NOT NULL DEFAULT 0,
	`priceChanges` int NOT NULL DEFAULT 0,
	`removedUnits` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`summaryJson` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`finishedAt` timestamp,
	CONSTRAINT `inventory_sync_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_unit_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unitName` varchar(191) NOT NULL,
	`dataset` enum('saadiyat','other') NOT NULL,
	`projectSlug` varchar(128) NOT NULL,
	`projectName` varchar(255),
	`eventType` enum('first_seen','status_change','price_change','removed','reappeared') NOT NULL,
	`fromStatus` varchar(64),
	`toStatus` varchar(64),
	`fromPriceAed` bigint,
	`toPriceAed` bigint,
	`runId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_unit_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_unit_state` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unitName` varchar(191) NOT NULL,
	`dataset` enum('saadiyat','other') NOT NULL,
	`projectSlug` varchar(128) NOT NULL,
	`projectName` varchar(255),
	`buildingSlug` varchar(128),
	`buildingName` varchar(255),
	`aldarLink` text,
	`status` varchar(64),
	`priceAed` bigint,
	`bedrooms` varchar(32),
	`unitType` varchar(64),
	`isPresent` boolean NOT NULL DEFAULT true,
	`firstSeenRunId` int,
	`firstSeenAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenRunId` int,
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_unit_state_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_unit_state_unitName_unique` UNIQUE(`unitName`)
);
--> statement-breakpoint
CREATE INDEX `inventory_sync_runs_status_idx` ON `inventory_sync_runs` (`status`);--> statement-breakpoint
CREATE INDEX `inventory_sync_runs_startedAt_idx` ON `inventory_sync_runs` (`startedAt`);--> statement-breakpoint
CREATE INDEX `inventory_unit_events_unit_idx` ON `inventory_unit_events` (`unitName`);--> statement-breakpoint
CREATE INDEX `inventory_unit_events_project_idx` ON `inventory_unit_events` (`projectSlug`);--> statement-breakpoint
CREATE INDEX `inventory_unit_events_type_idx` ON `inventory_unit_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `inventory_unit_events_run_idx` ON `inventory_unit_events` (`runId`);--> statement-breakpoint
CREATE INDEX `inventory_unit_events_createdAt_idx` ON `inventory_unit_events` (`createdAt`);--> statement-breakpoint
CREATE INDEX `inventory_unit_state_dataset_idx` ON `inventory_unit_state` (`dataset`);--> statement-breakpoint
CREATE INDEX `inventory_unit_state_project_idx` ON `inventory_unit_state` (`projectSlug`);--> statement-breakpoint
CREATE INDEX `inventory_unit_state_status_idx` ON `inventory_unit_state` (`status`);