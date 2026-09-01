CREATE TABLE `property_owner_units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`villaKey` varchar(128) NOT NULL,
	`community` varchar(128) NOT NULL,
	`relationship` enum('owner','co_owner','representative') NOT NULL DEFAULT 'owner',
	`sourceLabel` varchar(255),
	`linkedBy` varchar(320) NOT NULL,
	`linkedByName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `property_owner_units_id` PRIMARY KEY(`id`),
	CONSTRAINT `propertyOwnerUnits_owner_unit_unique` UNIQUE(`ownerId`,`villaKey`)
);
--> statement-breakpoint
CREATE TABLE `property_owners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`phone` varchar(64),
	`email` varchar(320),
	`internalNotes` text,
	`sourceLabel` varchar(255),
	`createdBy` varchar(320) NOT NULL,
	`createdByName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `property_owners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `property_access_grants` ADD `buildingKey` varchar(128);--> statement-breakpoint
ALTER TABLE `property_access_grants` ADD `unitTypeKey` varchar(128);--> statement-breakpoint
ALTER TABLE `property_access_grants` ADD `bedrooms` int;--> statement-breakpoint
ALTER TABLE `property_access_grants` ADD `canViewOwnerDocuments` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `unit_documents` ADD `ownerId` int;--> statement-breakpoint
ALTER TABLE `villa_listings` ADD `buildingKey` varchar(128);--> statement-breakpoint
ALTER TABLE `villa_listings` ADD `unitTypeKey` varchar(128);--> statement-breakpoint
ALTER TABLE `villa_listings` ADD `bedrooms` int;--> statement-breakpoint
ALTER TABLE `villa_listings` ADD `publishedAt` timestamp;--> statement-breakpoint
ALTER TABLE `villa_listings` ADD `publishedBy` varchar(320);--> statement-breakpoint
ALTER TABLE `villa_listings` ADD `publishedByName` varchar(255);--> statement-breakpoint
CREATE INDEX `propertyOwnerUnits_villa_idx` ON `property_owner_units` (`villaKey`,`community`);--> statement-breakpoint
CREATE INDEX `propertyOwnerUnits_owner_idx` ON `property_owner_units` (`ownerId`);--> statement-breakpoint
CREATE INDEX `propertyOwners_name_idx` ON `property_owners` (`displayName`);--> statement-breakpoint
CREATE INDEX `property_access_grants_building_idx` ON `property_access_grants` (`projectKey`,`buildingKey`);--> statement-breakpoint
CREATE INDEX `property_access_grants_type_idx` ON `property_access_grants` (`projectKey`,`unitTypeKey`);--> statement-breakpoint
CREATE INDEX `villa_listings_building_idx` ON `villa_listings` (`community`,`buildingKey`);--> statement-breakpoint
CREATE INDEX `villa_listings_type_idx` ON `villa_listings` (`community`,`unitTypeKey`);