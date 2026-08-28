ALTER TABLE `allowed_emails` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `allowed_emails` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `allowed_emails` ADD `passwordFailedAttempts` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `allowed_emails` ADD `passwordLockedUntil` timestamp;--> statement-breakpoint
ALTER TABLE `allowed_emails` ADD `passwordUpdatedAt` timestamp;
