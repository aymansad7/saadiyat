CREATE TABLE `villa_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scope` enum('villa','global') NOT NULL,
	`villaKey` varchar(128),
	`category` varchar(64),
	`filename` varchar(255) NOT NULL,
	`mimeType` varchar(128) NOT NULL,
	`sizeBytes` bigint NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`description` text,
	`uploadedBy` int NOT NULL,
	`uploaderName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `villa_files_id` PRIMARY KEY(`id`),
	CONSTRAINT `villa_files_storageKey_unique` UNIQUE(`storageKey`)
);
--> statement-breakpoint
CREATE INDEX `villaFiles_villaKey_idx` ON `villa_files` (`villaKey`);--> statement-breakpoint
CREATE INDEX `villaFiles_scope_idx` ON `villa_files` (`scope`);