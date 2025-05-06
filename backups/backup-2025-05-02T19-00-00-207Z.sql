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
('3695734d-2f94-49fb-abc6-2086a30af53d','3e4ff6d9414f985cd80d4b9e0cade7aede1495c3a4086609acfe18d777aa9232','2025-05-02 08:40:45.957','20250218040233_all_update',NULL,NULL,'2025-05-02 08:40:45.688',1),
('565cd3e9-0a8f-4638-954b-743cf266ab6c','fba22c87985976ab0bacd8d2124187fd25c86898e4ce0ea73b6bba026107b3f5','2025-05-02 08:40:46.453','20250320065217_add_shortdesc_to_service',NULL,NULL,'2025-05-02 08:40:46.438',1),
('5f5b396f-6907-497c-a2a7-46479f455880','2a00a819b46f113fd8c6008d1c18bf2dedba96a7d827b5c4a620bb319d80364f','2025-05-02 08:40:46.261','20250314070454_add_blog_model',NULL,NULL,'2025-05-02 08:40:46.234',1),
('6f32a33a-b6a9-4035-94e8-8d9203bf9f11','0fdeb74850b29be8dbdebd62563fb4df549cc46bd702f8389b93e812ce3b9f47','2025-05-02 08:40:45.981','20250218082521_target_test',NULL,NULL,'2025-05-02 08:40:45.968',1),
('769a22b6-241c-4e89-9876-a6fbc7d97836','ed922b8ba4f3ca60acf7518712f02093b0d06e6e07f24794a89fe2bf3f112b81','2025-05-02 08:40:46.331','20250315163105_add_gallery_models',NULL,NULL,'2025-05-02 08:40:46.273',1),
('81dd06db-9b9b-410f-8e3a-a39f7d37d1ae','1650633dd33ff09b918fe87ca6c878be0d9dd0691974c7180fb13aab53b8ffb0','2025-05-02 08:40:46.223','20250218125426_questionorder',NULL,NULL,'2025-05-02 08:40:45.995',1),
('9df441e4-a429-4b2d-ac0c-c39738b66ca1','d6cf89426fbdec9a104a056090d85ea3d9a30c2e28294f98cc28a0208b2a746f','2025-05-02 08:40:46.427','20250320055405_add_service_model',NULL,NULL,'2025-05-02 08:40:46.416',1),
('a713aece-9b62-44ab-b66f-cb45ed1fdb40','d3f41961df1a56c189493d351eb7ec912653a1655b38fcfda816f77248e5e698','2025-05-02 08:40:46.406','20250317102512_add_faq_answer_model',NULL,NULL,'2025-05-02 08:40:46.364',1),
('dfbf07ba-9841-47b8-b128-2ec73785989e','dd16c0b7940e1eea2cef5011375f8e602a26d97a2e37e330734bcc56d1c2f90a','2025-05-02 08:40:46.353','20250317100339_add_faq_model',NULL,NULL,'2025-05-02 08:40:46.342',1),
('fa49a2a9-431c-4b36-9327-aec740616c70','3b18d8bb665d060a655bd15e18dc67e794be5c8821da27262e8a2d81975c537a','2025-05-02 08:40:45.312','20250119131029_first',NULL,NULL,'2025-05-02 08:40:45.060',1),
('fe0569f9-c9cd-4165-abdf-d935cf10b6cb','b755085cc8a7e6491e399051eca163b22512b7653247a2b81a883557f50c6af0','2025-05-02 08:40:45.676','20250121021724_update_user',NULL,NULL,'2025-05-02 08:40:45.613',1),
('ff5c71b7-b068-4ac6-9526-2f963cfa8332','8b9161164aededd3da113a9616a8500eebfe03d3d17accf30dbf91f293774af7','2025-05-02 08:40:45.602','20250120121711_update_all',NULL,NULL,'2025-05-02 08:40:45.324',1);
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
  PRIMARY KEY (`id`),
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
  PRIMARY KEY (`id`),
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
  PRIMARY KEY (`id`),
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
  PRIMARY KEY (`id`),
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
  PRIMARY KEY (`id`),
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
  PRIMARY KEY (`id`),
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
  PRIMARY KEY (`id`),
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
  PRIMARY KEY (`id`),
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
  PRIMARY KEY (`id`),
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
  PRIMARY KEY (`id`)
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
  PRIMARY KEY (`id`),
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
  PRIMARY KEY (`id`),
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_username_key` (`username`),
  UNIQUE KEY `User_phoneNumber_key` (`phoneNumber`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES
(1,'Test User','testuser12@example.com','$2a$10$Ixiek4S/h5Sy3vAD4Whb3eV8MNlKivmFMrb41Id.ZU7nYqHW7ZQY.','2000-01-01 00:00:00.000','2025-05-02 09:32:47.118','2025-05-02 09:32:47.118','12345678912','testuser','USER_SELF'),
(2,'Test User','testuser1@example.com','$2a$10$Js6EV.rlJnoBsmyEyLdaPelCNm/bMQIPDgjgRNAoI583HdsPiIy7S','2000-01-01 00:00:00.000','2025-05-02 10:07:46.315','2025-05-02 10:07:46.315','123456789121','testuser1','USER_SELF');
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

-- Dump completed on 2025-05-03  2:00:00
