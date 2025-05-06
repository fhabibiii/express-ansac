/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `Blog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `Faq` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `FaqAnswer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `Gallery` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `GalleryImage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `QuestionOrder` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `Service` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `Subskala` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `Test` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `TestResult` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `TestResultSubskala` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable: Menambahkan kolom uuid sebagai opsional (nullable) terlebih dahulu
ALTER TABLE `blog` ADD COLUMN `uuid` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `faq` ADD COLUMN `uuid` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `faqanswer` ADD COLUMN `uuid` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `gallery` ADD COLUMN `uuid` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `galleryimage` ADD COLUMN `uuid` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `question` ADD COLUMN `uuid` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `questionorder` ADD COLUMN `uuid` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `service` ADD COLUMN `uuid` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `subskala` ADD COLUMN `uuid` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `test` ADD COLUMN `uuid` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `testresult` ADD COLUMN `uuid` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `testresultsubskala` ADD COLUMN `uuid` VARCHAR(191) NULL;

-- AlterTable: Menambahkan kolom uuid sebagai opsional dan address dengan default value
ALTER TABLE `user` ADD COLUMN `address` TEXT NULL DEFAULT 'No address provided',
    ADD COLUMN `uuid` VARCHAR(191) NULL;

-- Update: Mengisi kolom uuid untuk semua record yang ada dengan nilai UUID baru
UPDATE `blog` SET `uuid` = UUID() WHERE `uuid` IS NULL;
UPDATE `faq` SET `uuid` = UUID() WHERE `uuid` IS NULL;
UPDATE `faqanswer` SET `uuid` = UUID() WHERE `uuid` IS NULL;
UPDATE `gallery` SET `uuid` = UUID() WHERE `uuid` IS NULL;
UPDATE `galleryimage` SET `uuid` = UUID() WHERE `uuid` IS NULL;
UPDATE `question` SET `uuid` = UUID() WHERE `uuid` IS NULL;
UPDATE `questionorder` SET `uuid` = UUID() WHERE `uuid` IS NULL;
UPDATE `service` SET `uuid` = UUID() WHERE `uuid` IS NULL;
UPDATE `subskala` SET `uuid` = UUID() WHERE `uuid` IS NULL;
UPDATE `test` SET `uuid` = UUID() WHERE `uuid` IS NULL;
UPDATE `testresult` SET `uuid` = UUID() WHERE `uuid` IS NULL;
UPDATE `testresultsubskala` SET `uuid` = UUID() WHERE `uuid` IS NULL;
UPDATE `user` SET `uuid` = UUID() WHERE `uuid` IS NULL;

-- AlterTable: Mengubah kolom uuid menjadi NOT NULL setelah diisi nilai
ALTER TABLE `blog` MODIFY `uuid` VARCHAR(191) NOT NULL;
ALTER TABLE `faq` MODIFY `uuid` VARCHAR(191) NOT NULL;
ALTER TABLE `faqanswer` MODIFY `uuid` VARCHAR(191) NOT NULL;
ALTER TABLE `gallery` MODIFY `uuid` VARCHAR(191) NOT NULL;
ALTER TABLE `galleryimage` MODIFY `uuid` VARCHAR(191) NOT NULL;
ALTER TABLE `question` MODIFY `uuid` VARCHAR(191) NOT NULL;
ALTER TABLE `questionorder` MODIFY `uuid` VARCHAR(191) NOT NULL;
ALTER TABLE `service` MODIFY `uuid` VARCHAR(191) NOT NULL;
ALTER TABLE `subskala` MODIFY `uuid` VARCHAR(191) NOT NULL;
ALTER TABLE `test` MODIFY `uuid` VARCHAR(191) NOT NULL;
ALTER TABLE `testresult` MODIFY `uuid` VARCHAR(191) NOT NULL;
ALTER TABLE `testresultsubskala` MODIFY `uuid` VARCHAR(191) NOT NULL;
ALTER TABLE `user` MODIFY `uuid` VARCHAR(191) NOT NULL;

-- AlterTable: Mengubah kolom address menjadi NOT NULL setelah diisi nilai default
ALTER TABLE `user` MODIFY `address` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `BaseModel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BaseModel_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BaseContent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BaseContent_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Blog_uuid_key` ON `Blog`(`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `Faq_uuid_key` ON `Faq`(`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `FaqAnswer_uuid_key` ON `FaqAnswer`(`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `Gallery_uuid_key` ON `Gallery`(`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `GalleryImage_uuid_key` ON `GalleryImage`(`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `Question_uuid_key` ON `Question`(`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `QuestionOrder_uuid_key` ON `QuestionOrder`(`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `Service_uuid_key` ON `Service`(`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `Subskala_uuid_key` ON `Subskala`(`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `Test_uuid_key` ON `Test`(`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `TestResult_uuid_key` ON `TestResult`(`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `TestResultSubskala_uuid_key` ON `TestResultSubskala`(`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `User_uuid_key` ON `User`(`uuid`);
