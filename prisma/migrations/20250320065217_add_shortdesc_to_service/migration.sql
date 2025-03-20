/*
  Warnings:

  - Added the required column `shortDesc` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `service` ADD COLUMN `shortDesc` TEXT NOT NULL;
