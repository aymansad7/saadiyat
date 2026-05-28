CREATE TABLE `availability_listings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`community` varchar(64) NOT NULL,
	`unitKey` varchar(128) NOT NULL,
	`source` enum('nas-luxury','aldar','others','manual') NOT NULL,
	`status` enum('available','reserved','sold','off-market') NOT NULL DEFAULT 'available',
	`askingPriceAed` bigint,
	`bedrooms` int,
	`notes` text,
	`contactLabel` varchar(128),
	`addedBy` int NOT NULL,
	`addedByName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `availability_listings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `availability_listings_community_idx` ON `availability_listings` (`community`);--> statement-breakpoint
CREATE INDEX `availability_listings_unitKey_idx` ON `availability_listings` (`unitKey`);--> statement-breakpoint
CREATE INDEX `availability_listings_status_idx` ON `availability_listings` (`status`);--> statement-breakpoint
CREATE INDEX `availability_listings_source_idx` ON `availability_listings` (`source`);