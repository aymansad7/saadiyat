CREATE TABLE `app_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(64) NOT NULL,
	`settingValue` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `app_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `app_settings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `gate_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`success` boolean NOT NULL,
	`visitorId` varchar(64),
	`ip` varchar(64),
	`userAgent` text,
	`submittedValue` varchar(32),
	`flagReason` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gate_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gate_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitorId` varchar(64) NOT NULL,
	`ip` varchar(64),
	`userAgent` text,
	`label` varchar(128),
	`pageHits` int NOT NULL DEFAULT 0,
	`firstSeenAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`leftAt` timestamp,
	CONSTRAINT `gate_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `gate_sessions_visitorId_unique` UNIQUE(`visitorId`)
);
--> statement-breakpoint
CREATE TABLE `page_hits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitorId` varchar(64),
	`ip` varchar(64),
	`path` varchar(512) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `page_hits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
	`visitorId` varchar(64),
	`ip` varchar(64),
	`userAgent` text,
	`summary` varchar(512) NOT NULL,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `security_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `gate_attempts_visitor_idx` ON `gate_attempts` (`visitorId`);--> statement-breakpoint
CREATE INDEX `gate_attempts_ip_idx` ON `gate_attempts` (`ip`);--> statement-breakpoint
CREATE INDEX `gate_attempts_createdAt_idx` ON `gate_attempts` (`createdAt`);--> statement-breakpoint
CREATE INDEX `gate_sessions_lastSeen_idx` ON `gate_sessions` (`lastSeenAt`);--> statement-breakpoint
CREATE INDEX `gate_sessions_ip_idx` ON `gate_sessions` (`ip`);--> statement-breakpoint
CREATE INDEX `page_hits_visitor_idx` ON `page_hits` (`visitorId`);--> statement-breakpoint
CREATE INDEX `page_hits_createdAt_idx` ON `page_hits` (`createdAt`);--> statement-breakpoint
CREATE INDEX `security_events_type_idx` ON `security_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `security_events_createdAt_idx` ON `security_events` (`createdAt`);