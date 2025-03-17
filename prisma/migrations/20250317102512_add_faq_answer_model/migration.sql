/*
  Warnings:

  - You are about to drop the column `answer` on the `faq` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `faq` DROP COLUMN `answer`;

-- CreateTable
CREATE TABLE `FaqAnswer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` TEXT NOT NULL,
    `faqId` INTEGER NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FaqAnswer_faqId_idx`(`faqId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FaqAnswer` ADD CONSTRAINT `FaqAnswer_faqId_fkey` FOREIGN KEY (`faqId`) REFERENCES `Faq`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
