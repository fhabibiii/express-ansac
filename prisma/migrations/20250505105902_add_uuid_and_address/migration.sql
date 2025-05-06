-- Menghapus semua data dari tabel (karena ini hanya data uji coba)
DELETE FROM `FaqAnswer`;
DELETE FROM `Faq`;
DELETE FROM `GalleryImage`;
DELETE FROM `Gallery`;
DELETE FROM `Blog`;
DELETE FROM `QuestionOrder`;
DELETE FROM `TestResultSubskala`;
DELETE FROM `TestResult`;
DELETE FROM `Question`;
DELETE FROM `Subskala`;
DELETE FROM `Test`;
DELETE FROM `Service`;
DELETE FROM `User`;

-- Mengubah enum BlogStatus menjadi ContentStatus
-- ContentStatus mapping sudah dihandle oleh Prisma melalui @@map("BlogStatus")

-- AlterTable: Menambahkan kolom uuid dan address
ALTER TABLE `Blog` ADD COLUMN `uuid` VARCHAR(191) NOT NULL DEFAULT (uuid());
ALTER TABLE `Faq` ADD COLUMN `uuid` VARCHAR(191) NOT NULL DEFAULT (uuid());
ALTER TABLE `FaqAnswer` ADD COLUMN `uuid` VARCHAR(191) NOT NULL DEFAULT (uuid());
ALTER TABLE `Gallery` ADD COLUMN `uuid` VARCHAR(191) NOT NULL DEFAULT (uuid());
ALTER TABLE `GalleryImage` ADD COLUMN `uuid` VARCHAR(191) NOT NULL DEFAULT (uuid());
ALTER TABLE `Question` ADD COLUMN `uuid` VARCHAR(191) NOT NULL DEFAULT (uuid());
ALTER TABLE `QuestionOrder` ADD COLUMN `uuid` VARCHAR(191) NOT NULL DEFAULT (uuid());
ALTER TABLE `Service` ADD COLUMN `uuid` VARCHAR(191) NOT NULL DEFAULT (uuid());
ALTER TABLE `Subskala` ADD COLUMN `uuid` VARCHAR(191) NOT NULL DEFAULT (uuid());
ALTER TABLE `Test` ADD COLUMN `uuid` VARCHAR(191) NOT NULL DEFAULT (uuid());
ALTER TABLE `TestResult` ADD COLUMN `uuid` VARCHAR(191) NOT NULL DEFAULT (uuid());
ALTER TABLE `TestResultSubskala` ADD COLUMN `uuid` VARCHAR(191) NOT NULL DEFAULT (uuid());
ALTER TABLE `User` ADD COLUMN `uuid` VARCHAR(191) NOT NULL DEFAULT (uuid()),
    ADD COLUMN `address` TEXT NOT NULL DEFAULT 'No address provided';

-- CreateIndex
CREATE UNIQUE INDEX `Blog_uuid_key` ON `Blog`(`uuid`);
CREATE UNIQUE INDEX `Faq_uuid_key` ON `Faq`(`uuid`);
CREATE UNIQUE INDEX `FaqAnswer_uuid_key` ON `FaqAnswer`(`uuid`);
CREATE UNIQUE INDEX `Gallery_uuid_key` ON `Gallery`(`uuid`);
CREATE UNIQUE INDEX `GalleryImage_uuid_key` ON `GalleryImage`(`uuid`);
CREATE UNIQUE INDEX `Question_uuid_key` ON `Question`(`uuid`);
CREATE UNIQUE INDEX `QuestionOrder_uuid_key` ON `QuestionOrder`(`uuid`);
CREATE UNIQUE INDEX `Service_uuid_key` ON `Service`(`uuid`);
CREATE UNIQUE INDEX `Subskala_uuid_key` ON `Subskala`(`uuid`);
CREATE UNIQUE INDEX `Test_uuid_key` ON `Test`(`uuid`);
CREATE UNIQUE INDEX `TestResult_uuid_key` ON `TestResult`(`uuid`);
CREATE UNIQUE INDEX `TestResultSubskala_uuid_key` ON `TestResultSubskala`(`uuid`);
CREATE UNIQUE INDEX `User_uuid_key` ON `User`(`uuid`);