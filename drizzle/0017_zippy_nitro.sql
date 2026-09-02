CREATE TABLE `property_owner_import_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceFile` varchar(255) NOT NULL,
	`sourceSheet` varchar(128) NOT NULL,
	`sourceRow` int NOT NULL,
	`sourceUnit` varchar(128),
	`sourceProject` varchar(128),
	`ownerId` int,
	`villaKey` varchar(128),
	`community` varchar(64),
	`matchStatus` enum('linked','unlinked','conflict') NOT NULL,
	`matchReason` varchar(512),
	`rawOwnerName` varchar(255) NOT NULL,
	`rawOwnerPhone` varchar(64),
	`sourceItemId` varchar(255),
	`importedBy` varchar(320) NOT NULL,
	`importedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `property_owner_import_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `ownerImport_source_row_unique` UNIQUE(`sourceFile`,`sourceSheet`,`sourceRow`)
);
--> statement-breakpoint
CREATE INDEX `ownerImport_owner_idx` ON `property_owner_import_records` (`ownerId`);--> statement-breakpoint
CREATE INDEX `ownerImport_villa_idx` ON `property_owner_import_records` (`villaKey`,`community`);--> statement-breakpoint
CREATE INDEX `ownerImport_status_idx` ON `property_owner_import_records` (`matchStatus`);