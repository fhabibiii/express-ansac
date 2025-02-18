/*
  Warnings:

  - You are about to drop the column `categoryId` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `isForward` on the `question` table. All the data in the column will be lost.
  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categoryrange` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `questionoption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `testcategoryscore` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `option1Value` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `option2Value` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `option3Value` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subskalaId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `category` DROP FOREIGN KEY `Category_testId_fkey`;

-- DropForeignKey
ALTER TABLE `categoryrange` DROP FOREIGN KEY `CategoryRange_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `question` DROP FOREIGN KEY `Question_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `questionoption` DROP FOREIGN KEY `QuestionOption_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `testcategoryscore` DROP FOREIGN KEY `TestCategoryScore_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `testcategoryscore` DROP FOREIGN KEY `TestCategoryScore_testResultId_fkey`;

-- DropIndex
DROP INDEX `Question_categoryId_fkey` ON `question`;

-- AlterTable
ALTER TABLE `question` DROP COLUMN `categoryId`,
    DROP COLUMN `isForward`,
    ADD COLUMN `option1Label` VARCHAR(255) NOT NULL DEFAULT 'Tidak Benar',
    ADD COLUMN `option1Value` INTEGER NOT NULL,
    ADD COLUMN `option2Label` VARCHAR(255) NOT NULL DEFAULT 'Agak Benar',
    ADD COLUMN `option2Value` INTEGER NOT NULL,
    ADD COLUMN `option3Label` VARCHAR(255) NOT NULL DEFAULT 'Benar',
    ADD COLUMN `option3Value` INTEGER NOT NULL,
    ADD COLUMN `subskalaId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `category`;

-- DropTable
DROP TABLE `categoryrange`;

-- DropTable
DROP TABLE `questionoption`;

-- DropTable
DROP TABLE `testcategoryscore`;

-- CreateTable
CREATE TABLE `Subskala` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `testId` INTEGER NOT NULL,
    `label1` VARCHAR(255) NOT NULL DEFAULT 'Normal',
    `description1` TEXT NOT NULL,
    `minValue1` INTEGER NOT NULL,
    `maxValue1` INTEGER NOT NULL,
    `label2` VARCHAR(255) NOT NULL DEFAULT 'Borderline',
    `description2` TEXT NOT NULL,
    `minValue2` INTEGER NOT NULL,
    `maxValue2` INTEGER NOT NULL,
    `label3` VARCHAR(255) NOT NULL DEFAULT 'Abnormal',
    `description3` TEXT NOT NULL,
    `minValue3` INTEGER NOT NULL,
    `maxValue3` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestResultSubskala` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testResultId` INTEGER NOT NULL,
    `subskalaId` INTEGER NOT NULL,
    `score` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuestionOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `order` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Subskala` ADD CONSTRAINT `Subskala_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_subskalaId_fkey` FOREIGN KEY (`subskalaId`) REFERENCES `Subskala`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestResultSubskala` ADD CONSTRAINT `TestResultSubskala_testResultId_fkey` FOREIGN KEY (`testResultId`) REFERENCES `TestResult`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestResultSubskala` ADD CONSTRAINT `TestResultSubskala_subskalaId_fkey` FOREIGN KEY (`subskalaId`) REFERENCES `Subskala`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionOrder` ADD CONSTRAINT `QuestionOrder_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionOrder` ADD CONSTRAINT `QuestionOrder_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
