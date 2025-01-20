/*
  Warnings:

  - You are about to drop the column `longDesc` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `range` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `shortDesc` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `option` table. All the data in the column will be lost.
  - You are about to drop the column `maxScore` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `test` table. All the data in the column will be lost.
  - You are about to drop the column `totalScore` on the `testresult` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxQuestions` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valueRangeId` to the `QuestionOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Superadmin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admin` ADD COLUMN `name` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `category` DROP COLUMN `longDesc`,
    DROP COLUMN `range`,
    DROP COLUMN `shortDesc`,
    ADD COLUMN `maxQuestions` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `option` DROP COLUMN `value`;

-- AlterTable
ALTER TABLE `question` DROP COLUMN `maxScore`;

-- AlterTable
ALTER TABLE `questionoption` ADD COLUMN `valueRangeId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `superadmin` ADD COLUMN `name` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `test` DROP COLUMN `price`;

-- AlterTable
ALTER TABLE `testresult` DROP COLUMN `totalScore`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `phoneNumber` VARCHAR(15) NOT NULL,
    ADD COLUMN `username` VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE `ValueRange` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NOT NULL,
    `minValue` INTEGER NOT NULL,
    `maxValue` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoryRange` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoryId` INTEGER NOT NULL,
    `minValue` INTEGER NOT NULL,
    `maxValue` INTEGER NOT NULL,
    `label` VARCHAR(255) NOT NULL,
    `desc` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);

-- CreateIndex
CREATE UNIQUE INDEX `User_phoneNumber_key` ON `User`(`phoneNumber`);

-- AddForeignKey
ALTER TABLE `ValueRange` ADD CONSTRAINT `ValueRange_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoryRange` ADD CONSTRAINT `CategoryRange_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionOption` ADD CONSTRAINT `QuestionOption_valueRangeId_fkey` FOREIGN KEY (`valueRangeId`) REFERENCES `ValueRange`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RedefineIndex
CREATE UNIQUE INDEX `Admin_username_key` ON `Admin`(`username`);
DROP INDEX `admin_username` ON `admin`;

-- RedefineIndex
CREATE UNIQUE INDEX `Superadmin_username_key` ON `Superadmin`(`username`);
DROP INDEX `superadmin_username` ON `superadmin`;

-- RedefineIndex
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);
DROP INDEX `email` ON `user`;
