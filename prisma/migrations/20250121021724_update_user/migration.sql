/*
  Warnings:

  - You are about to drop the column `createdBy` on the `test` table. All the data in the column will be lost.
  - You are about to drop the `admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `superadmin` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `password` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `test` DROP FOREIGN KEY `Test_createdBy_fkey`;

-- DropIndex
DROP INDEX `Test_createdBy_fkey` ON `test`;

-- AlterTable
ALTER TABLE `test` DROP COLUMN `createdBy`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `role` ENUM('USER', 'ADMIN', 'SUPERADMIN') NOT NULL DEFAULT 'USER',
    MODIFY `password` VARCHAR(255) NOT NULL,
    MODIFY `dateOfBirth` DATETIME(3) NULL,
    MODIFY `phoneNumber` VARCHAR(15) NULL;

-- DropTable
DROP TABLE `admin`;

-- DropTable
DROP TABLE `superadmin`;
