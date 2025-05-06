-- AlterTable
ALTER TABLE `blog` ALTER COLUMN `uuid` DROP DEFAULT;

-- AlterTable
ALTER TABLE `faq` ALTER COLUMN `uuid` DROP DEFAULT;

-- AlterTable
ALTER TABLE `faqanswer` ALTER COLUMN `uuid` DROP DEFAULT;

-- AlterTable
ALTER TABLE `gallery` ALTER COLUMN `uuid` DROP DEFAULT;

-- AlterTable
ALTER TABLE `galleryimage` ALTER COLUMN `uuid` DROP DEFAULT;

-- AlterTable
ALTER TABLE `question` ALTER COLUMN `uuid` DROP DEFAULT;

-- AlterTable
ALTER TABLE `questionorder` ALTER COLUMN `uuid` DROP DEFAULT;

-- AlterTable
ALTER TABLE `service` ALTER COLUMN `uuid` DROP DEFAULT;

-- AlterTable
ALTER TABLE `subskala` ALTER COLUMN `uuid` DROP DEFAULT;

-- AlterTable
ALTER TABLE `test` ALTER COLUMN `uuid` DROP DEFAULT;

-- AlterTable
ALTER TABLE `testresult` ALTER COLUMN `uuid` DROP DEFAULT;

-- AlterTable
ALTER TABLE `testresultsubskala` ALTER COLUMN `uuid` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` ALTER COLUMN `uuid` DROP DEFAULT,
    ALTER COLUMN `address` DROP DEFAULT;

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
