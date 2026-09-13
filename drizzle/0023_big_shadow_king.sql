CREATE TABLE `registered_sale_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dataset` enum('saadiyat','other') NOT NULL,
	`projectSlug` varchar(128) NOT NULL,
	`projectName` varchar(255) NOT NULL,
	`sourceFile` varchar(255) NOT NULL,
	`sourceRow` int NOT NULL,
	`saleApplicationDate` varchar(10) NOT NULL,
	`assetClass` varchar(64),
	`propertyType` varchar(64),
	`propertyLayout` varchar(64),
	`buildingLabel` varchar(128),
	`saleableAreaSqm` double NOT NULL,
	`registeredSellingPriceAed` bigint NOT NULL,
	`registeredRateAedSqm` double,
	`soldShare` double,
	`landPlotGroundAreaSqm` double,
	`saleApplicationType` varchar(64),
	`saleSequence` varchar(32),
	`matchType` enum('unit_exact','area_group') NOT NULL,
	`matchedUnitName` varchar(191),
	`candidateUnitNamesJson` text,
	`matchEvidence` text NOT NULL,
	`importedBy` varchar(320) NOT NULL,
	`importedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `registered_sale_transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `registeredSale_source_row_unique` UNIQUE(`sourceFile`,`sourceRow`)
);
--> statement-breakpoint
CREATE INDEX `registeredSale_project_idx` ON `registered_sale_transactions` (`dataset`,`projectSlug`);--> statement-breakpoint
CREATE INDEX `registeredSale_unit_idx` ON `registered_sale_transactions` (`matchedUnitName`);--> statement-breakpoint
CREATE INDEX `registeredSale_sale_date_idx` ON `registered_sale_transactions` (`saleApplicationDate`);