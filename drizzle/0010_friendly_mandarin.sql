ALTER TABLE `property_access_grants` ADD `phaseKey` varchar(64);--> statement-breakpoint
ALTER TABLE `property_access_grants` ADD COLUMN `phaseKey` varchar(64);
CREATE INDEX `property_access_grants_phase_idx` ON `property_access_grants` (`projectKey`,`phaseKey`);
