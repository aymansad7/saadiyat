CREATE TABLE `activity_audit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` enum('sign_in','property_edit','access_grant_create','access_grant_update','access_grant_delete','access_role_update') NOT NULL,
	`actorEmail` varchar(320) NOT NULL,
	`actorName` varchar(255),
	`targetEmail` varchar(320),
	`entityType` varchar(64),
	`entityKey` varchar(191),
	`summary` text NOT NULL,
	`changesJson` text,
	`ip` varchar(64),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_audit_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `property_access_grants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`areaKey` varchar(96),
	`projectKey` varchar(128),
	`canViewOriginalPrice` boolean NOT NULL DEFAULT false,
	`canViewOwnerName` boolean NOT NULL DEFAULT false,
	`canViewOwnerPhone` boolean NOT NULL DEFAULT false,
	`canEditProperties` boolean NOT NULL DEFAULT false,
	`createdBy` varchar(320) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `property_access_grants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `villa_listings` ADD `landAreaSqm` double;--> statement-breakpoint
ALTER TABLE `villa_listings` ADD `builtUpAreaSqm` double;--> statement-breakpoint
ALTER TABLE `villa_listings` ADD `availableForRent` boolean;--> statement-breakpoint
ALTER TABLE `villa_listings` ADD `rentPriceAed` bigint;--> statement-breakpoint
CREATE INDEX `activity_audit_createdAt_idx` ON `activity_audit` (`createdAt`);--> statement-breakpoint
CREATE INDEX `activity_audit_actor_idx` ON `activity_audit` (`actorEmail`);--> statement-breakpoint
CREATE INDEX `activity_audit_target_idx` ON `activity_audit` (`targetEmail`);--> statement-breakpoint
CREATE INDEX `activity_audit_entity_idx` ON `activity_audit` (`entityType`,`entityKey`);--> statement-breakpoint
CREATE INDEX `property_access_grants_email_idx` ON `property_access_grants` (`email`);--> statement-breakpoint
CREATE INDEX `property_access_grants_area_idx` ON `property_access_grants` (`areaKey`);--> statement-breakpoint
CREATE INDEX `property_access_grants_project_idx` ON `property_access_grants` (`projectKey`);