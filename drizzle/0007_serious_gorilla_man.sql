CREATE TABLE `villa_listing_audit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`villaKey` varchar(128) NOT NULL,
	`actorEmail` varchar(320) NOT NULL,
	`actorName` varchar(255),
	`summary` text NOT NULL,
	`changesJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `villa_listing_audit_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `villa_listings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`villaKey` varchar(128) NOT NULL,
	`community` varchar(64) NOT NULL,
	`askingPriceAed` bigint,
	`status` enum('draft','available','warm','reserved','sold','off-market') NOT NULL DEFAULT 'draft',
	`listingPartners` text,
	`publicNotes` text,
	`ownerName` varchar(255),
	`ownerPhone` varchar(64),
	`ownerEmail` varchar(320),
	`internalNotes` text,
	`updatedBy` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `villa_listings_id` PRIMARY KEY(`id`),
	CONSTRAINT `villa_listings_villaKey_unique` UNIQUE(`villaKey`)
);
--> statement-breakpoint
CREATE INDEX `villa_listing_audit_villaKey_idx` ON `villa_listing_audit` (`villaKey`);--> statement-breakpoint
CREATE INDEX `villa_listing_audit_actor_idx` ON `villa_listing_audit` (`actorEmail`);--> statement-breakpoint
CREATE INDEX `villa_listings_community_idx` ON `villa_listings` (`community`);--> statement-breakpoint
CREATE INDEX `villa_listings_status_idx` ON `villa_listings` (`status`);