CREATE TABLE `onedrive_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionKey` varchar(64) NOT NULL,
	`provider` enum('onedrive_business') NOT NULL DEFAULT 'onedrive_business',
	`status` enum('pending','authorized','active','error') NOT NULL DEFAULT 'pending',
	`ownerUpn` varchar(320) NOT NULL,
	`tenantId` varchar(64),
	`clientId` varchar(64),
	`driveId` varchar(255),
	`rootItemId` varchar(512),
	`rootPath` varchar(512) NOT NULL,
	`unitRegisterItemId` varchar(512),
	`lastWorkbookExportAt` timestamp,
	`lastError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onedrive_connections_id` PRIMARY KEY(`id`),
	CONSTRAINT `onedrive_connections_connectionKey_unique` UNIQUE(`connectionKey`)
);
--> statement-breakpoint
CREATE TABLE `onedrive_sync_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionKey` varchar(64) NOT NULL,
	`documentId` int,
	`eventType` enum('upload','metadata_refresh','share_link_create','workbook_export','failure') NOT NULL,
	`status` enum('pending','success','error') NOT NULL DEFAULT 'pending',
	`idempotencyKey` varchar(191) NOT NULL,
	`summary` text NOT NULL,
	`detailsJson` text,
	`errorMessage` text,
	`attemptedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onedrive_sync_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `onedrive_sync_events_idempotencyKey_unique` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `unit_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`villaKey` varchar(128) NOT NULL,
	`community` varchar(128) NOT NULL,
	`phaseKey` varchar(64),
	`documentType` enum('brochure','spa','owner_document','floorplan','source_file','marketing','other') NOT NULL,
	`websiteVisibility` enum('card_link','master_admin') NOT NULL DEFAULT 'master_admin',
	`shareAccess` enum('anyone_link','restricted') NOT NULL DEFAULT 'anyone_link',
	`filename` varchar(255) NOT NULL,
	`mimeType` varchar(128) NOT NULL,
	`sizeBytes` bigint,
	`description` text,
	`driveId` varchar(255) NOT NULL,
	`itemId` varchar(512) NOT NULL,
	`parentItemId` varchar(512),
	`webUrl` text,
	`shareUrl` text,
	`etag` varchar(512),
	`versionLabel` varchar(128),
	`uploadedBy` varchar(320) NOT NULL,
	`uploadedByName` varchar(255),
	`removedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `unit_documents_id` PRIMARY KEY(`id`),
	CONSTRAINT `unitDocuments_drive_item_unique` UNIQUE(`driveId`,`itemId`)
);
--> statement-breakpoint
ALTER TABLE `activity_audit` MODIFY COLUMN `eventType` enum('sign_in','property_edit','access_grant_create','access_grant_update','access_grant_delete','access_role_update','document_create','document_update','document_remove','onedrive_sync') NOT NULL;--> statement-breakpoint
CREATE INDEX `onedriveConnections_status_idx` ON `onedrive_connections` (`status`);--> statement-breakpoint
CREATE INDEX `onedriveSyncEvents_connection_idx` ON `onedrive_sync_events` (`connectionKey`);--> statement-breakpoint
CREATE INDEX `onedriveSyncEvents_document_idx` ON `onedrive_sync_events` (`documentId`);--> statement-breakpoint
CREATE INDEX `onedriveSyncEvents_status_idx` ON `onedrive_sync_events` (`status`);--> statement-breakpoint
CREATE INDEX `unitDocuments_villaKey_idx` ON `unit_documents` (`villaKey`);--> statement-breakpoint
CREATE INDEX `unitDocuments_community_idx` ON `unit_documents` (`community`);--> statement-breakpoint
CREATE INDEX `unitDocuments_type_idx` ON `unit_documents` (`documentType`);--> statement-breakpoint
CREATE INDEX `unitDocuments_visibility_idx` ON `unit_documents` (`websiteVisibility`);