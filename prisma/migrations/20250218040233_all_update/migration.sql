/*
  Warnings:

  - You are about to drop the column `scoreId` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `testId` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `optionId` on the `questionoption` table. All the data in the column will be lost.
  - You are about to drop the column `valueRangeId` on the `questionoption` table. All the data in the column will be lost.
  - You are about to drop the column `categoryScores` on the `testresult` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(0))`.
  - You are about to drop the `option` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `score` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `valuerange` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `testId` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isForward` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `QuestionOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isForParent` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dateOfBirth` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phoneNumber` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `category` DROP FOREIGN KEY `Category_scoreId_fkey`;

-- DropForeignKey
ALTER TABLE `option` DROP FOREIGN KEY `Option_testId_fkey`;

-- DropForeignKey
ALTER TABLE `question` DROP FOREIGN KEY `Question_testId_fkey`;

-- DropForeignKey
ALTER TABLE `questionoption` DROP FOREIGN KEY `QuestionOption_optionId_fkey`;

-- DropForeignKey
ALTER TABLE `questionoption` DROP FOREIGN KEY `QuestionOption_valueRangeId_fkey`;

-- DropForeignKey
ALTER TABLE `score` DROP FOREIGN KEY `Score_testId_fkey`;

-- DropForeignKey
ALTER TABLE `valuerange` DROP FOREIGN KEY `ValueRange_testId_fkey`;

-- DropIndex
DROP INDEX `Category_scoreId_fkey` ON `category`;

-- DropIndex
DROP INDEX `Question_testId_fkey` ON `question`;

-- DropIndex
DROP INDEX `QuestionOption_optionId_fkey` ON `questionoption`;

-- DropIndex
DROP INDEX `QuestionOption_valueRangeId_fkey` ON `questionoption`;

-- AlterTable
ALTER TABLE `category` DROP COLUMN `scoreId`,
    ADD COLUMN `testId` INTEGER NOT NULL,
    MODIFY `maxQuestions` INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE `question` DROP COLUMN `testId`,
    ADD COLUMN `isForward` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `questionoption` DROP COLUMN `optionId`,
    DROP COLUMN `valueRangeId`,
    ADD COLUMN `label` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `test` ADD COLUMN `isForParent` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `testresult` DROP COLUMN `categoryScores`;

-- AlterTable
ALTER TABLE `user` MODIFY `name` VARCHAR(255) NOT NULL,
    MODIFY `dateOfBirth` DATETIME(3) NOT NULL,
    MODIFY `phoneNumber` VARCHAR(15) NOT NULL,
    MODIFY `role` ENUM('ADMIN', 'SUPERADMIN', 'USER_SELF', 'USER_PARENT') NOT NULL;

-- DropTable
DROP TABLE `option`;

-- DropTable
DROP TABLE `score`;

-- DropTable
DROP TABLE `valuerange`;

-- CreateTable
CREATE TABLE `TestCategoryScore` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testResultId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `score` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestCategoryScore` ADD CONSTRAINT `TestCategoryScore_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestCategoryScore` ADD CONSTRAINT `TestCategoryScore_testResultId_fkey` FOREIGN KEY (`testResultId`) REFERENCES `TestResult`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
