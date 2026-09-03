ALTER TABLE `inventory_unit_events` MODIFY COLUMN `eventType` enum('first_seen','status_change','source_status_change','price_change','removed','reappeared') NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_sync_runs` ADD `sourceStatusChanges` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_unit_events` ADD `fromSourceStatus` varchar(64);--> statement-breakpoint
ALTER TABLE `inventory_unit_events` ADD `toSourceStatus` varchar(64);--> statement-breakpoint
ALTER TABLE `inventory_unit_state` ADD `sourceStatus` varchar(64);