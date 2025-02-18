/*
  Warnings:

  - You are about to drop the column `isForParent` on the `test` table. All the data in the column will be lost.
  - Added the required column `target` to the `Test` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `test` DROP COLUMN `isForParent`,
    ADD COLUMN `target` VARCHAR(20) NOT NULL;
