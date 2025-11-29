CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`sessionId` varchar(100) NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`price` int NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`imageUrl` text NOT NULL,
	`pdfUrl` text NOT NULL,
	`pdfFileKey` varchar(500) NOT NULL,
	`finishedSize` varchar(100),
	`categoryId` int,
	`featured` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patterns_id` PRIMARY KEY(`id`),
	CONSTRAINT `patterns_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`patternId` int NOT NULL,
	`stripeSessionId` varchar(255) NOT NULL,
	`stripePaymentIntentId` varchar(255),
	`amount` int NOT NULL,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`purchasedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchases_id` PRIMARY KEY(`id`),
	CONSTRAINT `purchases_stripeSessionId_unique` UNIQUE(`stripeSessionId`)
);
--> statement-breakpoint
ALTER TABLE `chatMessages` ADD CONSTRAINT `chatMessages_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `patterns` ADD CONSTRAINT `patterns_categoryId_categories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_patternId_patterns_id_fk` FOREIGN KEY (`patternId`) REFERENCES `patterns`(`id`) ON DELETE no action ON UPDATE no action;