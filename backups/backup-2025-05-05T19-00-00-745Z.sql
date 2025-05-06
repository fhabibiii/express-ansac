/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.4.5-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: db_ansac
-- ------------------------------------------------------
-- Server version	11.4.5-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES
('09a25c60-c09c-4691-9735-cff4e1e2fe3b','2a00a819b46f113fd8c6008d1c18bf2dedba96a7d827b5c4a620bb319d80364f','2025-05-05 11:00:24.206','20250314070454_add_blog_model',NULL,NULL,'2025-05-05 11:00:24.165',1),
('09d26319-fd9d-401c-89f9-21e16630aef3','69469744aa7b514c4bf1d4131b8657c36cde309044aebc9835bd6197c3f21050','2025-05-05 11:00:24.967','20250505105902_add_uuid_and_address',NULL,NULL,'2025-05-05 11:00:24.387',1),
('24a5b6af-b2ea-43b2-841c-559377500b0f','1650633dd33ff09b918fe87ca6c878be0d9dd0691974c7180fb13aab53b8ffb0','2025-05-05 11:00:24.163','20250218125426_questionorder',NULL,NULL,'2025-05-05 11:00:23.828',1),
('26759f2f-0ee8-4145-8336-85d2f5a46a12','b755085cc8a7e6491e399051eca163b22512b7653247a2b81a883557f50c6af0','2025-05-05 11:00:23.355','20250121021724_update_user',NULL,NULL,'2025-05-05 11:00:23.261',1),
('3122bc78-0f2c-42c7-9ec1-3ffc5a5558e3','dd16c0b7940e1eea2cef5011375f8e602a26d97a2e37e330734bcc56d1c2f90a','2025-05-05 11:00:24.295','20250317100339_add_faq_model',NULL,NULL,'2025-05-05 11:00:24.282',1),
('4cd4832e-4c51-4255-8383-b47c376089c8','d6cf89426fbdec9a104a056090d85ea3d9a30c2e28294f98cc28a0208b2a746f','2025-05-05 11:00:24.367','20250320055405_add_service_model',NULL,NULL,'2025-05-05 11:00:24.354',1),
('5baf0a51-0d36-4d23-a937-578441b45ff7','0fdeb74850b29be8dbdebd62563fb4df549cc46bd702f8389b93e812ce3b9f47','2025-05-05 11:00:23.826','20250218082521_target_test',NULL,NULL,'2025-05-05 11:00:23.805',1),
('5dc89b73-1eb8-44c4-a074-41ae380f90d0','d3f41961df1a56c189493d351eb7ec912653a1655b38fcfda816f77248e5e698','2025-05-05 11:00:24.353','20250317102512_add_faq_answer_model',NULL,NULL,'2025-05-05 11:00:24.297',1),
('7a2376a4-c173-401f-81be-76e8a62588d8','8b9161164aededd3da113a9616a8500eebfe03d3d17accf30dbf91f293774af7','2025-05-05 11:00:23.259','20250120121711_update_all',NULL,NULL,'2025-05-05 11:00:22.879',1),
('d475d20a-344a-4aea-a410-5266dc898af2','ed922b8ba4f3ca60acf7518712f02093b0d06e6e07f24794a89fe2bf3f112b81','2025-05-05 11:00:24.281','20250315163105_add_gallery_models',NULL,NULL,'2025-05-05 11:00:24.207',1),
('da51e336-fb99-419a-a02d-0427f1d0f922','3b18d8bb665d060a655bd15e18dc67e794be5c8821da27262e8a2d81975c537a','2025-05-05 11:00:22.877','20250119131029_first',NULL,NULL,'2025-05-05 11:00:22.576',1),
('f8533115-1046-4513-a866-885ac76ace46','fba22c87985976ab0bacd8d2124187fd25c86898e4ce0ea73b6bba026107b3f5','2025-05-05 11:00:24.386','20250320065217_add_shortdesc_to_service',NULL,NULL,'2025-05-05 11:00:24.368',1),
('f98808b7-ed5b-4fdc-9ae3-f266e7f1097f','3e4ff6d9414f985cd80d4b9e0cade7aede1495c3a4086609acfe18d777aa9232','2025-05-05 11:00:23.804','20250218040233_all_update',NULL,NULL,'2025-05-05 11:00:23.357',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog`
--

DROP TABLE IF EXISTS `blog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `imageUrl` text NOT NULL,
  `content` longtext NOT NULL,
  `createdBy` int(11) NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `uuid` varchar(191) NOT NULL DEFAULT uuid(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Blog_uuid_key` (`uuid`),
  KEY `Blog_createdBy_fkey` (`createdBy`),
  CONSTRAINT `Blog_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog`
--

LOCK TABLES `blog` WRITE;
/*!40000 ALTER TABLE `blog` DISABLE KEYS */;
/*!40000 ALTER TABLE `blog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faq`
--

DROP TABLE IF EXISTS `faq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `faq` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question` text NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `order` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `uuid` varchar(191) NOT NULL DEFAULT uuid(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Faq_uuid_key` (`uuid`),
  KEY `Faq_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faq`
--

LOCK TABLES `faq` WRITE;
/*!40000 ALTER TABLE `faq` DISABLE KEYS */;
/*!40000 ALTER TABLE `faq` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faqanswer`
--

DROP TABLE IF EXISTS `faqanswer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqanswer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `faqId` int(11) NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `uuid` varchar(191) NOT NULL DEFAULT uuid(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `FaqAnswer_uuid_key` (`uuid`),
  KEY `FaqAnswer_faqId_idx` (`faqId`),
  CONSTRAINT `FaqAnswer_faqId_fkey` FOREIGN KEY (`faqId`) REFERENCES `faq` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqanswer`
--

LOCK TABLES `faqanswer` WRITE;
/*!40000 ALTER TABLE `faqanswer` DISABLE KEYS */;
/*!40000 ALTER TABLE `faqanswer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gallery`
--

DROP TABLE IF EXISTS `gallery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `gallery` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `createdBy` int(11) NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `uuid` varchar(191) NOT NULL DEFAULT uuid(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Gallery_uuid_key` (`uuid`),
  KEY `Gallery_createdBy_fkey` (`createdBy`),
  CONSTRAINT `Gallery_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery`
--

LOCK TABLES `gallery` WRITE;
/*!40000 ALTER TABLE `gallery` DISABLE KEYS */;
/*!40000 ALTER TABLE `gallery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `galleryimage`
--

DROP TABLE IF EXISTS `galleryimage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `galleryimage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `imageUrl` text NOT NULL,
  `galleryId` int(11) NOT NULL,
  `isThumbnail` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `uuid` varchar(191) NOT NULL DEFAULT uuid(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `GalleryImage_uuid_key` (`uuid`),
  KEY `GalleryImage_galleryId_idx` (`galleryId`),
  CONSTRAINT `GalleryImage_galleryId_fkey` FOREIGN KEY (`galleryId`) REFERENCES `gallery` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `galleryimage`
--

LOCK TABLES `galleryimage` WRITE;
/*!40000 ALTER TABLE `galleryimage` DISABLE KEYS */;
/*!40000 ALTER TABLE `galleryimage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question`
--

DROP TABLE IF EXISTS `question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `question` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `text` text NOT NULL,
  `option1Label` varchar(255) NOT NULL DEFAULT 'Tidak Benar',
  `option1Value` int(11) NOT NULL,
  `option2Label` varchar(255) NOT NULL DEFAULT 'Agak Benar',
  `option2Value` int(11) NOT NULL,
  `option3Label` varchar(255) NOT NULL DEFAULT 'Benar',
  `option3Value` int(11) NOT NULL,
  `subskalaId` int(11) NOT NULL,
  `uuid` varchar(191) NOT NULL DEFAULT uuid(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Question_uuid_key` (`uuid`),
  KEY `Question_subskalaId_fkey` (`subskalaId`),
  CONSTRAINT `Question_subskalaId_fkey` FOREIGN KEY (`subskalaId`) REFERENCES `subskala` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question`
--

LOCK TABLES `question` WRITE;
/*!40000 ALTER TABLE `question` DISABLE KEYS */;
/*!40000 ALTER TABLE `question` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questionorder`
--

DROP TABLE IF EXISTS `questionorder`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `questionorder` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `testId` int(11) NOT NULL,
  `questionId` int(11) NOT NULL,
  `order` int(11) NOT NULL,
  `uuid` varchar(191) NOT NULL DEFAULT uuid(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `QuestionOrder_uuid_key` (`uuid`),
  KEY `QuestionOrder_testId_fkey` (`testId`),
  KEY `QuestionOrder_questionId_fkey` (`questionId`),
  CONSTRAINT `QuestionOrder_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `QuestionOrder_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `test` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questionorder`
--

LOCK TABLES `questionorder` WRITE;
/*!40000 ALTER TABLE `questionorder` DISABLE KEYS */;
/*!40000 ALTER TABLE `questionorder` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service`
--

DROP TABLE IF EXISTS `service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `service` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `imageUrl` text NOT NULL,
  `content` longtext NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `shortDesc` text NOT NULL,
  `uuid` varchar(191) NOT NULL DEFAULT uuid(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Service_uuid_key` (`uuid`),
  KEY `Service_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service`
--

LOCK TABLES `service` WRITE;
/*!40000 ALTER TABLE `service` DISABLE KEYS */;
/*!40000 ALTER TABLE `service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subskala`
--

DROP TABLE IF EXISTS `subskala`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `subskala` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `testId` int(11) NOT NULL,
  `label1` varchar(255) NOT NULL DEFAULT 'Normal',
  `description1` text NOT NULL,
  `minValue1` int(11) NOT NULL,
  `maxValue1` int(11) NOT NULL,
  `label2` varchar(255) NOT NULL DEFAULT 'Borderline',
  `description2` text NOT NULL,
  `minValue2` int(11) NOT NULL,
  `maxValue2` int(11) NOT NULL,
  `label3` varchar(255) NOT NULL DEFAULT 'Abnormal',
  `description3` text NOT NULL,
  `minValue3` int(11) NOT NULL,
  `maxValue3` int(11) NOT NULL,
  `uuid` varchar(191) NOT NULL DEFAULT uuid(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Subskala_uuid_key` (`uuid`),
  KEY `Subskala_testId_fkey` (`testId`),
  CONSTRAINT `Subskala_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `test` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subskala`
--

LOCK TABLES `subskala` WRITE;
/*!40000 ALTER TABLE `subskala` DISABLE KEYS */;
/*!40000 ALTER TABLE `subskala` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `test`
--

DROP TABLE IF EXISTS `test`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `test` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `shortDesc` text NOT NULL,
  `longDesc` text NOT NULL,
  `minAge` int(11) NOT NULL,
  `maxAge` int(11) NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `target` varchar(20) NOT NULL,
  `uuid` varchar(191) NOT NULL DEFAULT uuid(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Test_uuid_key` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `test`
--

LOCK TABLES `test` WRITE;
/*!40000 ALTER TABLE `test` DISABLE KEYS */;
/*!40000 ALTER TABLE `test` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testresult`
--

DROP TABLE IF EXISTS `testresult`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `testresult` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `testId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `uuid` varchar(191) NOT NULL DEFAULT uuid(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `TestResult_uuid_key` (`uuid`),
  KEY `TestResult_userId_fkey` (`userId`),
  KEY `TestResult_testId_fkey` (`testId`),
  CONSTRAINT `TestResult_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `test` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `TestResult_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testresult`
--

LOCK TABLES `testresult` WRITE;
/*!40000 ALTER TABLE `testresult` DISABLE KEYS */;
/*!40000 ALTER TABLE `testresult` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testresultsubskala`
--

DROP TABLE IF EXISTS `testresultsubskala`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `testresultsubskala` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `testResultId` int(11) NOT NULL,
  `subskalaId` int(11) NOT NULL,
  `score` int(11) NOT NULL,
  `uuid` varchar(191) NOT NULL DEFAULT uuid(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `TestResultSubskala_uuid_key` (`uuid`),
  KEY `TestResultSubskala_testResultId_fkey` (`testResultId`),
  KEY `TestResultSubskala_subskalaId_fkey` (`subskalaId`),
  CONSTRAINT `TestResultSubskala_subskalaId_fkey` FOREIGN KEY (`subskalaId`) REFERENCES `subskala` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `TestResultSubskala_testResultId_fkey` FOREIGN KEY (`testResultId`) REFERENCES `testresult` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testresultsubskala`
--

LOCK TABLES `testresultsubskala` WRITE;
/*!40000 ALTER TABLE `testresultsubskala` DISABLE KEYS */;
/*!40000 ALTER TABLE `testresultsubskala` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `dateOfBirth` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `phoneNumber` varchar(15) NOT NULL,
  `username` varchar(255) NOT NULL,
  `role` enum('ADMIN','SUPERADMIN','USER_SELF','USER_PARENT') NOT NULL,
  `uuid` varchar(191) NOT NULL DEFAULT uuid(),
  `address` text NOT NULL DEFAULT 'No address provided',
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_username_key` (`username`),
  UNIQUE KEY `User_phoneNumber_key` (`phoneNumber`),
  UNIQUE KEY `User_email_key` (`email`),
  UNIQUE KEY `User_uuid_key` (`uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES
(2,'Updated Name','testuser1@example.com','$2a$12$a4GbA6tbhz7Ql7GTFwSinOPZcvF0Du/4.YXqHYaHnDg0xN9ah462y','1995-05-05 00:00:00.000','2025-05-05 12:22:19.527','2025-05-05 15:56:59.755','9876543210','testuser1','USER_PARENT','f0264d24-621f-466f-9213-128cfeccea61','456 New Street, Updated City, 54321');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-05-06  2:00:01
