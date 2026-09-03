ALTER TABLE `property_access_grants` ADD `inventoryKey` varchar(128);--> statement-breakpoint
ALTER TABLE `villa_listings` ADD `phaseKey` varchar(64);--> statement-breakpoint
ALTER TABLE `villa_listings` ADD `inventoryKey` varchar(128);--> statement-breakpoint
CREATE INDEX `property_access_grants_inventory_idx` ON `property_access_grants` (`projectKey`,`inventoryKey`);--> statement-breakpoint
CREATE INDEX `villa_listings_phase_idx` ON `villa_listings` (`community`,`phaseKey`);--> statement-breakpoint
CREATE INDEX `villa_listings_inventory_idx` ON `villa_listings` (`community`,`inventoryKey`);