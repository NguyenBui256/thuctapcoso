-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: ttcs
-- ------------------------------------------------------
-- Server version	9.0.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activities` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(255) NOT NULL,
  `details` varchar(255) DEFAULT NULL,
  `timestamp` datetime(6) NOT NULL,
  `issue_id` bigint DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKfnlbt151ks6975qvb05wf8gdj` (`project_id`),
  KEY `FKpvf4ratvee5lkickfakkwduvt` (`issue_id`),
  KEY `FKq6cjukylkgxdjkm9npk9va2f2` (`user_id`),
  CONSTRAINT `FKfnlbt151ks6975qvb05wf8gdj` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `FKpvf4ratvee5lkickfakkwduvt` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`),
  CONSTRAINT `FKq6cjukylkgxdjkm9npk9va2f2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
INSERT INTO `activities` VALUES (1,'PROJECT_CREATED','Created E-Commerce Platform project','2024-01-15 09:00:00.000000',NULL,1,1),(2,'MEMBER_ADDED','Added John Doe to E-Commerce Platform','2024-01-15 10:05:00.000000',NULL,1,1),(3,'PROJECT_UPDATED','Updated E-Commerce Platform description','2024-03-25 14:30:00.000000',NULL,1,3),(4,'PROJECT_CREATED','Created Food Delivery App project','2024-01-20 11:30:00.000000',NULL,2,3),(5,'MEMBER_ADDED','Added Sarah Davis to Food Delivery App','2024-01-20 12:05:00.000000',NULL,2,3);
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attachment`
--

DROP TABLE IF EXISTS `attachment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attachment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content_type` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` bigint DEFAULT NULL,
  `is_delete` bit(1) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `issue_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKgknxmpkgwf70jokab8a4gvt8o` (`issue_id`),
  KEY `FKsthq9nduup0a4j1n0lmfcc1j9` (`created_by`),
  CONSTRAINT `FKgknxmpkgwf70jokab8a4gvt8o` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`),
  CONSTRAINT `FKsthq9nduup0a4j1n0lmfcc1j9` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attachment`
--

LOCK TABLES `attachment` WRITE;
/*!40000 ALTER TABLE `attachment` DISABLE KEYS */;
/*!40000 ALTER TABLE `attachment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `issue_id` bigint DEFAULT NULL,
  `task_id` int DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK5x0kmwc95ahvid2us6y48wl9r` (`issue_id`),
  KEY `FKfknte4fhjhet3l1802m1yqa50` (`task_id`),
  KEY `FKqm52p1v3o13hy268he0wcngr5` (`user_id`),
  CONSTRAINT `FK5x0kmwc95ahvid2us6y48wl9r` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`),
  CONSTRAINT `FKfknte4fhjhet3l1802m1yqa50` FOREIGN KEY (`task_id`) REFERENCES `task` (`id`),
  CONSTRAINT `FKqm52p1v3o13hy268he0wcngr5` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `epics`
--

DROP TABLE IF EXISTS `epics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `epics` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_date` datetime(6) NOT NULL,
  `description` text,
  `subject` varchar(255) NOT NULL,
  `updated_date` datetime(6) DEFAULT NULL,
  `created_by_id` bigint DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  `updated_by_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKj6natoibqfvao49pefgmidb1a` (`updated_by_id`),
  KEY `FKl2smuwqtucerei0i07udhd8f7` (`created_by_id`),
  KEY `FKpmrhvxyak5nn759bbaj9pcpa5` (`project_id`),
  CONSTRAINT `FKj6natoibqfvao49pefgmidb1a` FOREIGN KEY (`updated_by_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKl2smuwqtucerei0i07udhd8f7` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKpmrhvxyak5nn759bbaj9pcpa5` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `epics`
--

LOCK TABLES `epics` WRITE;
/*!40000 ALTER TABLE `epics` DISABLE KEYS */;
/*!40000 ALTER TABLE `epics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `issue_status`
--

DROP TABLE IF EXISTS `issue_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `issue_status` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `wip_limit` int DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK2o5hasmgnh6vhccsy6r4g2p79` (`created_by`),
  KEY `FK6k3x050jex1mc59kxvvt1w1ub` (`updated_by`),
  KEY `FKeld0k4bkpy63tiw3k1rceqdy` (`project_id`),
  CONSTRAINT `FK2o5hasmgnh6vhccsy6r4g2p79` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FK6k3x050jex1mc59kxvvt1w1ub` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKeld0k4bkpy63tiw3k1rceqdy` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `issue_status`
--

LOCK TABLES `issue_status` WRITE;
/*!40000 ALTER TABLE `issue_status` DISABLE KEYS */;
/*!40000 ALTER TABLE `issue_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `issue_tags`
--

DROP TABLE IF EXISTS `issue_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `issue_tags` (
  `issue_id` bigint NOT NULL,
  `tag_id` bigint NOT NULL,
  KEY `FK57ildehmbrelpv8j1l76jaqto` (`issue_id`),
  KEY `FKe0nm3dfcyokaycykrg10kfa7u` (`tag_id`),
  CONSTRAINT `FK57ildehmbrelpv8j1l76jaqto` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`),
  CONSTRAINT `FKe0nm3dfcyokaycykrg10kfa7u` FOREIGN KEY (`tag_id`) REFERENCES `project_setting_tags` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `issue_tags`
--

LOCK TABLES `issue_tags` WRITE;
/*!40000 ALTER TABLE `issue_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `issue_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `issues`
--

DROP TABLE IF EXISTS `issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `issues` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `back_points` int DEFAULT NULL,
  `created_date` datetime(6) NOT NULL,
  `description` text,
  `design_points` int DEFAULT NULL,
  `front_points` int DEFAULT NULL,
  `position` int DEFAULT NULL,
  `story_points` int DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `type` enum('STORY','TASK') DEFAULT NULL,
  `updated_date` datetime(6) DEFAULT NULL,
  `ux_points` int DEFAULT NULL,
  `assignee_id` bigint DEFAULT NULL,
  `created_by_id` bigint DEFAULT NULL,
  `epic_id` bigint DEFAULT NULL,
  `parent_id` bigint DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  `sprint_id` bigint DEFAULT NULL,
  `status_id` bigint DEFAULT NULL,
  `updated_by_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK6tkde1c2odhrtreahor01p5fb` (`assignee_id`),
  KEY `FK7k0i7uroc5perdxkbgilb1aak` (`status_id`),
  KEY `FK9dv7dy82mg9598oxgpivxjjd1` (`sprint_id`),
  KEY `FKahpmt08iasgl77xgix5f7ihbt` (`updated_by_id`),
  KEY `FKaxw1cvm6o4r7vdednj01v82x6` (`parent_id`),
  KEY `FKd7xrshb4yh4ybx9ruuk1mjrew` (`epic_id`),
  KEY `FKg9pe16ifmx53tq3w9s49pajco` (`project_id`),
  KEY `FKx7sywpi65ldw8kt1egcsd153` (`created_by_id`),
  CONSTRAINT `FK6tkde1c2odhrtreahor01p5fb` FOREIGN KEY (`assignee_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK7k0i7uroc5perdxkbgilb1aak` FOREIGN KEY (`status_id`) REFERENCES `issue_status` (`id`),
  CONSTRAINT `FK9dv7dy82mg9598oxgpivxjjd1` FOREIGN KEY (`sprint_id`) REFERENCES `sprints` (`id`),
  CONSTRAINT `FKahpmt08iasgl77xgix5f7ihbt` FOREIGN KEY (`updated_by_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKaxw1cvm6o4r7vdednj01v82x6` FOREIGN KEY (`parent_id`) REFERENCES `issues` (`id`),
  CONSTRAINT `FKd7xrshb4yh4ybx9ruuk1mjrew` FOREIGN KEY (`epic_id`) REFERENCES `epics` (`id`),
  CONSTRAINT `FKg9pe16ifmx53tq3w9s49pajco` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `FKx7sywpi65ldw8kt1egcsd153` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `issues`
--

LOCK TABLES `issues` WRITE;
/*!40000 ALTER TABLE `issues` DISABLE KEYS */;
/*!40000 ALTER TABLE `issues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kanban_swimland`
--

DROP TABLE IF EXISTS `kanban_swimland`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kanban_swimland` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `order` int DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK3pudghfrerap1x6hh28sbiyp6` (`project_id`),
  KEY `FKbxw85sv6ja53b464dglft46cx` (`created_by`),
  KEY `FKgw03osn2qweuanukdtha1ygvo` (`updated_by`),
  CONSTRAINT `FK3pudghfrerap1x6hh28sbiyp6` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `FKbxw85sv6ja53b464dglft46cx` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKgw03osn2qweuanukdtha1ygvo` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kanban_swimland`
--

LOCK TABLES `kanban_swimland` WRITE;
/*!40000 ALTER TABLE `kanban_swimland` DISABLE KEYS */;
/*!40000 ALTER TABLE `kanban_swimland` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `module`
--

DROP TABLE IF EXISTS `module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `module` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` longtext,
  `name` varchar(100) DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK5q5ki4h0sxsqsoppox3lwselq` (`created_by`),
  KEY `FKo9p61lwd3ylfvsx8wg1w1v0cj` (`updated_by`),
  CONSTRAINT `FK5q5ki4h0sxsqsoppox3lwselq` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKo9p61lwd3ylfvsx8wg1w1v0cj` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `module`
--

LOCK TABLES `module` WRITE;
/*!40000 ALTER TABLE `module` DISABLE KEYS */;
/*!40000 ALTER TABLE `module` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `object_id` int DEFAULT NULL,
  `type` varchar(20) DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `receiver_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdammjl0v5xfaegi926ugx6254` (`receiver_id`),
  KEY `FKjat1pd6d8t4bnxxseeerpyk3c` (`updated_by`),
  KEY `FKtgninnxqh316uxq4f7826d4ft` (`created_by`),
  CONSTRAINT `FKdammjl0v5xfaegi926ugx6254` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKjat1pd6d8t4bnxxseeerpyk3c` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKtgninnxqh316uxq4f7826d4ft` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_settings`
--

DROP TABLE IF EXISTS `notification_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `notification_type` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKecbv9ykcvn40qxm7be2pdseso` (`project_id`),
  KEY `FKmh6alfw96lc851ea0snhijfk` (`user_id`),
  CONSTRAINT `FKecbv9ykcvn40qxm7be2pdseso` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `FKmh6alfw96lc851ea0snhijfk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_settings`
--

LOCK TABLES `notification_settings` WRITE;
/*!40000 ALTER TABLE `notification_settings` DISABLE KEYS */;
INSERT INTO `notification_settings` VALUES (1,'2025-04-11 01:33:54.397063','all','2025-04-11 01:33:54.397063',1,11),(2,'2025-04-11 01:33:54.397063','all','2025-04-11 01:33:54.397063',4,11),(3,'2025-04-11 01:33:54.397063','all','2025-04-11 01:33:54.397063',2,11);
/*!40000 ALTER TABLE `notification_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `api_path` varchar(255) NOT NULL,
  `method` varchar(255) NOT NULL,
  `module` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK3q5mtag69mnv2p4sjdn3o92mh` (`updated_by`),
  KEY `FKswqlowwcdv4nsgr00xfgdi4ky` (`created_by`),
  CONSTRAINT `FK3q5mtag69mnv2p4sjdn3o92mh` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKswqlowwcdv4nsgr00xfgdi4ky` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pjsetting_point`
--

DROP TABLE IF EXISTS `pjsetting_point`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pjsetting_point` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `order` int DEFAULT NULL,
  `point` float DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK6bo7h95g2f17f5fxw79c5d5ak` (`project_id`),
  KEY `FKa6hppkyey79nl3fo667iefjpb` (`updated_by`),
  KEY `FKp07xl12xrsxn2fna19gwxat4b` (`created_by`),
  CONSTRAINT `FK6bo7h95g2f17f5fxw79c5d5ak` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `FKa6hppkyey79nl3fo667iefjpb` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKp07xl12xrsxn2fna19gwxat4b` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pjsetting_point`
--

LOCK TABLES `pjsetting_point` WRITE;
/*!40000 ALTER TABLE `pjsetting_point` DISABLE KEYS */;
/*!40000 ALTER TABLE `pjsetting_point` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pjsetting_priority`
--

DROP TABLE IF EXISTS `pjsetting_priority`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pjsetting_priority` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `order` int DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK1kwxvbu581w256yvj8ux1n0t4` (`project_id`),
  KEY `FKg2ggwd8xpec2rne5truo28jwo` (`created_by`),
  KEY `FKrwt7qdiikxwcku427ddfujfmn` (`updated_by`),
  CONSTRAINT `FK1kwxvbu581w256yvj8ux1n0t4` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `FKg2ggwd8xpec2rne5truo28jwo` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKrwt7qdiikxwcku427ddfujfmn` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pjsetting_priority`
--

LOCK TABLES `pjsetting_priority` WRITE;
/*!40000 ALTER TABLE `pjsetting_priority` DISABLE KEYS */;
/*!40000 ALTER TABLE `pjsetting_priority` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pjsetting_severity`
--

DROP TABLE IF EXISTS `pjsetting_severity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pjsetting_severity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `order` int DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK6xqpgvf47gm589od2q5roxljf` (`created_by`),
  KEY `FK981kj5v5t40rsce3debawkxxe` (`updated_by`),
  KEY `FKlmpfqo0rjyk6pt5d54s5atrot` (`project_id`),
  CONSTRAINT `FK6xqpgvf47gm589od2q5roxljf` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FK981kj5v5t40rsce3debawkxxe` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKlmpfqo0rjyk6pt5d54s5atrot` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pjsetting_severity`
--

LOCK TABLES `pjsetting_severity` WRITE;
/*!40000 ALTER TABLE `pjsetting_severity` DISABLE KEYS */;
/*!40000 ALTER TABLE `pjsetting_severity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pjsetting_status`
--

DROP TABLE IF EXISTS `pjsetting_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pjsetting_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `archived` bit(1) DEFAULT NULL,
  `closed` bit(1) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `order` int DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `type` varchar(20) DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK93ti2vw9olufavhsqtunx04ka` (`created_by`),
  KEY `FKeaeidscn7k7l9w3dbrdvmbs6q` (`project_id`),
  KEY `FKfqa5xkbvpqebqyuh1hxuuwu31` (`updated_by`),
  CONSTRAINT `FK93ti2vw9olufavhsqtunx04ka` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKeaeidscn7k7l9w3dbrdvmbs6q` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `FKfqa5xkbvpqebqyuh1hxuuwu31` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pjsetting_status`
--

LOCK TABLES `pjsetting_status` WRITE;
/*!40000 ALTER TABLE `pjsetting_status` DISABLE KEYS */;
/*!40000 ALTER TABLE `pjsetting_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pjsetting_type`
--

DROP TABLE IF EXISTS `pjsetting_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pjsetting_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `order` int DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK4b9gt0onj2863wmby9b7wew20` (`updated_by`),
  KEY `FKk5oyqkr3ox81yjccek1m007hq` (`project_id`),
  KEY `FKpssfv27wpxt8k3b62rjnmfl7m` (`created_by`),
  CONSTRAINT `FK4b9gt0onj2863wmby9b7wew20` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKk5oyqkr3ox81yjccek1m007hq` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `FKpssfv27wpxt8k3b62rjnmfl7m` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pjsetting_type`
--

LOCK TABLES `pjsetting_type` WRITE;
/*!40000 ALTER TABLE `pjsetting_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `pjsetting_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` longtext,
  `is_deleted` bit(1) DEFAULT NULL,
  `is_public` bit(1) DEFAULT NULL,
  `logo_url` longtext,
  `name` varchar(100) DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `owner_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK130q86aiyxo2fdp6lytxvwoxx` (`created_by`),
  KEY `FK7tetln4r9qig7tp05lsdqe8xo` (`owner_id`),
  KEY `FKcxi5aq1mh0o004qhkfo5ajfki` (`updated_by`),
  CONSTRAINT `FK130q86aiyxo2fdp6lytxvwoxx` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FK7tetln4r9qig7tp05lsdqe8xo` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKcxi5aq1mh0o004qhkfo5ajfki` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project`
--

LOCK TABLES `project` WRITE;
/*!40000 ALTER TABLE `project` DISABLE KEYS */;
INSERT INTO `project` VALUES (1,'2024-01-15 09:00:00.000000','2024-03-25 14:30:00.000000','An e-commerce platform project',_binary '\0',_binary '','https://example.com/logos/ecommerce.png','E-Commerce Platform',1,3,3),(2,'2024-01-20 11:30:00.000000','2024-03-18 10:45:00.000000','Mobile application for food delivery',_binary '\0',_binary '','https://example.com/logos/foodapp.png','Food Delivery App',3,3,3),(3,'2024-01-25 14:15:00.000000','2024-02-28 16:20:00.000000','Content management system',_binary '\0',_binary '\0','https://example.com/logos/cms.png','CMS Project',1,1,1),(4,'2024-02-01 10:00:00.000000','2024-03-10 13:40:00.000000','Social media analytics dashboard',_binary '\0',_binary '','https://example.com/logos/analytics.png','Social Analytics',3,3,3),(5,'2024-02-05 13:20:00.000000','2024-03-15 15:10:00.000000','Educational platform for online courses',_binary '\0',_binary '\0','https://example.com/logos/education.png','Educational Platform',1,1,1);
/*!40000 ALTER TABLE `project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_member`
--

DROP TABLE IF EXISTS `project_member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_member` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `is_admin` bit(1) DEFAULT NULL,
  `is_delete` bit(1) DEFAULT NULL,
  `total_point` int DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  `project_role_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK103dwxad12nbaxtmnwus4eft2` (`project_id`),
  KEY `FKbkcqo6oq4rjkisnygal20mome` (`created_by`),
  KEY `FKcmcv5nt078h4j1bqsj6s48alg` (`project_role_id`),
  KEY `FKfckggwvc14kkhb9nwffa2a9mt` (`updated_by`),
  KEY `FKmep5284pv47j2o523l14wyx4g` (`user_id`),
  CONSTRAINT `FK103dwxad12nbaxtmnwus4eft2` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `FKbkcqo6oq4rjkisnygal20mome` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKcmcv5nt078h4j1bqsj6s48alg` FOREIGN KEY (`project_role_id`) REFERENCES `project_role` (`id`),
  CONSTRAINT `FKfckggwvc14kkhb9nwffa2a9mt` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKmep5284pv47j2o523l14wyx4g` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_member`
--

LOCK TABLES `project_member` WRITE;
/*!40000 ALTER TABLE `project_member` DISABLE KEYS */;
INSERT INTO `project_member` VALUES (1,'2024-01-15 10:00:00.000000','2024-01-15 10:00:00.000000',_binary '',_binary '\0',120,1,1,1,1,3),(2,'2024-01-15 10:05:00.000000','2024-03-20 14:30:00.000000',_binary '\0',_binary '\0',85,1,3,1,2,4),(3,'2024-01-15 10:10:00.000000','2024-03-20 14:35:00.000000',_binary '\0',_binary '\0',75,1,3,1,2,6),(4,'2024-01-15 10:15:00.000000','2024-03-20 14:40:00.000000',_binary '\0',_binary '\0',90,1,3,1,3,8),(5,'2024-01-20 12:00:00.000000','2024-01-20 12:00:00.000000',_binary '',_binary '\0',110,3,3,2,4,3),(6,'2024-01-20 12:05:00.000000','2024-03-18 11:00:00.000000',_binary '\0',_binary '\0',65,3,3,2,5,7),(7,'2024-01-20 12:10:00.000000','2024-03-18 11:05:00.000000',_binary '\0',_binary '\0',70,3,3,2,6,9),(8,'2024-01-25 15:00:00.000000','2024-01-25 15:00:00.000000',_binary '',_binary '\0',100,1,1,3,7,1),(9,'2024-01-25 15:05:00.000000','2024-02-28 16:30:00.000000',_binary '\0',_binary '\0',55,1,1,3,8,5),(10,'2024-02-01 10:30:00.000000','2024-02-01 10:30:00.000000',_binary '',_binary '\0',95,3,3,4,9,3),(11,'2024-02-01 10:35:00.000000','2024-03-10 13:50:00.000000',_binary '\0',_binary '\0',60,3,3,4,10,10),(12,'2024-02-05 13:45:00.000000','2024-02-05 13:45:00.000000',_binary '',_binary '\0',80,1,1,5,11,1),(13,'2024-02-05 13:50:00.000000','2024-03-15 15:20:00.000000',_binary '\0',_binary '\0',50,1,1,5,12,2);
/*!40000 ALTER TABLE `project_member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_module`
--

DROP TABLE IF EXISTS `project_module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_module` (
  `project_id` bigint NOT NULL,
  `module_id` int NOT NULL,
  PRIMARY KEY (`project_id`,`module_id`),
  KEY `FKir434pmee2n1rk0tii4vbcm3g` (`module_id`),
  CONSTRAINT `FKfqwcf5m5sipuainmynnni3a98` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `FKir434pmee2n1rk0tii4vbcm3g` FOREIGN KEY (`module_id`) REFERENCES `module` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_module`
--

LOCK TABLES `project_module` WRITE;
/*!40000 ALTER TABLE `project_module` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_module` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_role`
--

DROP TABLE IF EXISTS `project_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_role` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `role_name` varchar(255) DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK46k1y1hy4519cxk1ab2i6he44` (`created_by`),
  KEY `FKiq2sl57a7w7f8vavsy1bma527` (`updated_by`),
  KEY `FKpfnbi8wmwbr6ddejkm9fxoat8` (`project_id`),
  CONSTRAINT `FK46k1y1hy4519cxk1ab2i6he44` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKiq2sl57a7w7f8vavsy1bma527` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKpfnbi8wmwbr6ddejkm9fxoat8` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_role`
--

LOCK TABLES `project_role` WRITE;
/*!40000 ALTER TABLE `project_role` DISABLE KEYS */;
INSERT INTO `project_role` VALUES (1,'2024-01-15 09:30:00.000000','2024-01-15 09:30:00.000000','Project Lead',1,1,1),(2,'2024-01-15 09:32:00.000000','2024-01-15 09:32:00.000000','Developer',1,1,1),(3,'2024-01-15 09:34:00.000000','2024-01-15 09:34:00.000000','QA Engineer',1,1,1),(4,'2024-01-20 11:40:00.000000','2024-01-20 11:40:00.000000','Project Lead',3,3,2),(5,'2024-01-20 11:42:00.000000','2024-01-20 11:42:00.000000','Developer',3,3,2),(6,'2024-01-20 11:44:00.000000','2024-01-20 11:44:00.000000','UX Designer',3,3,2),(7,'2024-01-25 14:30:00.000000','2024-01-25 14:30:00.000000','Project Lead',1,1,3),(8,'2024-01-25 14:32:00.000000','2024-01-25 14:32:00.000000','Content Manager',1,1,3),(9,'2024-02-01 10:15:00.000000','2024-02-01 10:15:00.000000','Project Lead',3,3,4),(10,'2024-02-01 10:17:00.000000','2024-02-01 10:17:00.000000','Data Analyst',3,3,4),(11,'2024-02-05 13:30:00.000000','2024-02-05 13:30:00.000000','Project Lead',1,1,5),(12,'2024-02-05 13:32:00.000000','2024-02-05 13:32:00.000000','Course Creator',1,1,5);
/*!40000 ALTER TABLE `project_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_role_permission`
--

DROP TABLE IF EXISTS `project_role_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_role_permission` (
  `project_role_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL,
  PRIMARY KEY (`project_role_id`,`permission_id`),
  KEY `FKnty7y2oadq50uptwemd2mvsu6` (`permission_id`),
  CONSTRAINT `FKfphndr4r3w0rbulo624whte4m` FOREIGN KEY (`project_role_id`) REFERENCES `project_role` (`id`),
  CONSTRAINT `FKnty7y2oadq50uptwemd2mvsu6` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_role_permission`
--

LOCK TABLES `project_role_permission` WRITE;
/*!40000 ALTER TABLE `project_role_permission` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_role_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_setting_tags`
--

DROP TABLE IF EXISTS `project_setting_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_setting_tags` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `color` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `project_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKqembsoj27xqpw1e5f9r4u3skm` (`project_id`),
  CONSTRAINT `FKqembsoj27xqpw1e5f9r4u3skm` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_setting_tags`
--

LOCK TABLES `project_setting_tags` WRITE;
/*!40000 ALTER TABLE `project_setting_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_setting_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_wiki_page`
--

DROP TABLE IF EXISTS `project_wiki_page`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_wiki_page` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text,
  `edit_count` int DEFAULT NULL,
  `is_delete` bit(1) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK1pj32aeb1iww3h3eb9d3lu6lx` (`updated_by`),
  KEY `FKjypegb86nc8gvih91v4v2ula` (`created_by`),
  KEY `FKt6inx0gcdyj5qinn0ec1u6vrt` (`project_id`),
  CONSTRAINT `FK1pj32aeb1iww3h3eb9d3lu6lx` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKjypegb86nc8gvih91v4v2ula` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKt6inx0gcdyj5qinn0ec1u6vrt` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_wiki_page`
--

LOCK TABLES `project_wiki_page` WRITE;
/*!40000 ALTER TABLE `project_wiki_page` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_wiki_page` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKofx66keruapi6vyqpv6f2or37` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrator with full access','ADMIN',1),(2,'Regular user with limited access','USER',1),(3,'Project manager with project control','PROJECT_MANAGER',1),(4,'Developer role','DEVELOPER',1),(5,'QA role','QA',1);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sprint_issue`
--

DROP TABLE IF EXISTS `sprint_issue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sprint_issue` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `issue_id` bigint DEFAULT NULL,
  `sprint_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK4ksdw4s4jnbkm5qk4qn7vi0ko` (`created_by`),
  KEY `FK95filtu6iw1c5nxelhbkkyl66` (`sprint_id`),
  KEY `FKdxgpx1eixjclu3id3ua1073sk` (`updated_by`),
  KEY `FKk3ojympnes5otx0ngex9pf1b4` (`issue_id`),
  CONSTRAINT `FK4ksdw4s4jnbkm5qk4qn7vi0ko` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FK95filtu6iw1c5nxelhbkkyl66` FOREIGN KEY (`sprint_id`) REFERENCES `sprints` (`id`),
  CONSTRAINT `FKdxgpx1eixjclu3id3ua1073sk` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKk3ojympnes5otx0ngex9pf1b4` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sprint_issue`
--

LOCK TABLES `sprint_issue` WRITE;
/*!40000 ALTER TABLE `sprint_issue` DISABLE KEYS */;
/*!40000 ALTER TABLE `sprint_issue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sprints`
--

DROP TABLE IF EXISTS `sprints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sprints` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_date` datetime(6) NOT NULL,
  `description` text,
  `end_date` datetime(6) NOT NULL,
  `name` varchar(255) NOT NULL,
  `start_date` datetime(6) NOT NULL,
  `status` varchar(255) NOT NULL,
  `updated_date` datetime(6) DEFAULT NULL,
  `created_by_id` bigint DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  `updated_by_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK4476hgdsntkm4vyvmb6787c6x` (`created_by_id`),
  KEY `FK4q3voefk1vaf7o28qxea92j6x` (`project_id`),
  KEY `FKkdnor9p333hweolyxprwtttnc` (`updated_by_id`),
  CONSTRAINT `FK4476hgdsntkm4vyvmb6787c6x` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK4q3voefk1vaf7o28qxea92j6x` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `FKkdnor9p333hweolyxprwtttnc` FOREIGN KEY (`updated_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sprints`
--

LOCK TABLES `sprints` WRITE;
/*!40000 ALTER TABLE `sprints` DISABLE KEYS */;
/*!40000 ALTER TABLE `sprints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task`
--

DROP TABLE IF EXISTS `task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` text,
  `due_date` date DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `status_id` int DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `user_story_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKbhwpp8tr117vvbxhf5sbkdkc9` (`user_id`),
  KEY `FKi75bqbl5r8u5gggir9qg1wp7u` (`status_id`),
  KEY `FKlso25fkuj3mijovbxi6md7c39` (`user_story_id`),
  CONSTRAINT `FKbhwpp8tr117vvbxhf5sbkdkc9` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKi75bqbl5r8u5gggir9qg1wp7u` FOREIGN KEY (`status_id`) REFERENCES `pjsetting_status` (`id`),
  CONSTRAINT `FKlso25fkuj3mijovbxi6md7c39` FOREIGN KEY (`user_story_id`) REFERENCES `user_story` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task`
--

LOCK TABLES `task` WRITE;
/*!40000 ALTER TABLE `task` DISABLE KEYS */;
/*!40000 ALTER TABLE `task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_attachment`
--

DROP TABLE IF EXISTS `task_attachment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_attachment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `attachment_id` int DEFAULT NULL,
  `task_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK1fu40vw34nr2nfm8gkpb6mhd6` (`created_by`),
  KEY `FKatvxh0bhfi5x49hlce5oq4jn0` (`updated_by`),
  KEY `FKkhw6fprv9kv6uio43mem40px6` (`task_id`),
  KEY `FKmpw2c3ke61l5ee0t2qwmp163j` (`attachment_id`),
  CONSTRAINT `FK1fu40vw34nr2nfm8gkpb6mhd6` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKatvxh0bhfi5x49hlce5oq4jn0` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKkhw6fprv9kv6uio43mem40px6` FOREIGN KEY (`task_id`) REFERENCES `task` (`id`),
  CONSTRAINT `FKmpw2c3ke61l5ee0t2qwmp163j` FOREIGN KEY (`attachment_id`) REFERENCES `attachment` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_attachment`
--

LOCK TABLES `task_attachment` WRITE;
/*!40000 ALTER TABLE `task_attachment` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_attachment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_tag`
--

DROP TABLE IF EXISTS `task_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_tag` (
  `id` int NOT NULL,
  `tag_id` bigint NOT NULL,
  KEY `FK3b48t42i3n251g7w2sf1vg9q3` (`tag_id`),
  KEY `FKshqq032qhlgxf3xtt276xa5es` (`id`),
  CONSTRAINT `FK3b48t42i3n251g7w2sf1vg9q3` FOREIGN KEY (`tag_id`) REFERENCES `project_setting_tags` (`id`),
  CONSTRAINT `FKshqq032qhlgxf3xtt276xa5es` FOREIGN KEY (`id`) REFERENCES `task` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_tag`
--

LOCK TABLES `task_tag` WRITE;
/*!40000 ALTER TABLE `task_tag` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_watcher`
--

DROP TABLE IF EXISTS `task_watcher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_watcher` (
  `task_id` int NOT NULL,
  `user_id` bigint NOT NULL,
  KEY `FKqtxa0jkgs8a6pcdly63pm9849` (`user_id`),
  KEY `FKrj71e06exsed4cks6gedhcx6x` (`task_id`),
  CONSTRAINT `FKqtxa0jkgs8a6pcdly63pm9849` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKrj71e06exsed4cks6gedhcx6x` FOREIGN KEY (`task_id`) REFERENCES `task` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_watcher`
--

LOCK TABLES `task_watcher` WRITE;
/*!40000 ALTER TABLE `task_watcher` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_watcher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_setting`
--

DROP TABLE IF EXISTS `user_setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_setting` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `email_noti_enable` bit(1) DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKaq5q998x4b33hm6c0m6h6c6ox` (`user_id`),
  KEY `FKbmpcjrl6f0hw22a02t27poqjy` (`updated_by`),
  KEY `FKfrecqecr3m20cfsxedsxq782v` (`created_by`),
  CONSTRAINT `FK839ngxoo1gsfh47faem953kxr` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKbmpcjrl6f0hw22a02t27poqjy` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKfrecqecr3m20cfsxedsxq782v` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_setting`
--

LOCK TABLES `user_setting` WRITE;
/*!40000 ALTER TABLE `user_setting` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_setting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_settings`
--

DROP TABLE IF EXISTS `user_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bio` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `language` varchar(255) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `theme` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `comment_updates` bit(1) NOT NULL,
  `deadline_reminders` bit(1) NOT NULL,
  `mention_updates` bit(1) NOT NULL,
  `project_updates` bit(1) NOT NULL,
  `task_updates` bit(1) NOT NULL,
  `weekly_digest` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK4bos7satl9xeqd18frfeqg6tt` (`user_id`),
  CONSTRAINT `FK8v82nj88rmai0nyck19f873dw` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_settings`
--

LOCK TABLES `user_settings` WRITE;
/*!40000 ALTER TABLE `user_settings` DISABLE KEYS */;
INSERT INTO `user_settings` VALUES (1,NULL,'2025-04-11 01:31:16.694747','en',NULL,'light','2025-04-11 01:31:16.694747',11,_binary '',_binary '',_binary '',_binary '',_binary '',_binary '');
/*!40000 ALTER TABLE `user_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_story`
--

DROP TABLE IF EXISTS `user_story`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_story` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `back_points` int DEFAULT NULL,
  `description` text,
  `design_points` int DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `front_points` int DEFAULT NULL,
  `is_block` bit(1) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `ux_points` int DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `sprint_id` bigint DEFAULT NULL,
  `status_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK75uxjwjk6eciph4sax0dpqc7i` (`sprint_id`),
  KEY `FKpkqjqstb2xxnbx6xpmu3vbgjj` (`created_by`),
  KEY `FKsf55smycubg44ipjala3pmueh` (`updated_by`),
  KEY `FKsjfrp5e56jn9os9d0went915b` (`status_id`),
  CONSTRAINT `FK75uxjwjk6eciph4sax0dpqc7i` FOREIGN KEY (`sprint_id`) REFERENCES `sprints` (`id`),
  CONSTRAINT `FKpkqjqstb2xxnbx6xpmu3vbgjj` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKsf55smycubg44ipjala3pmueh` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKsjfrp5e56jn9os9d0went915b` FOREIGN KEY (`status_id`) REFERENCES `pjsetting_status` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_story`
--

LOCK TABLES `user_story` WRITE;
/*!40000 ALTER TABLE `user_story` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_story` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_story_tag`
--

DROP TABLE IF EXISTS `user_story_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_story_tag` (
  `id` int NOT NULL,
  `tag_id` bigint NOT NULL,
  PRIMARY KEY (`id`,`tag_id`),
  KEY `FK8d3fkcs8hfaj8g8ydrbcmp3dd` (`tag_id`),
  CONSTRAINT `FK8d3fkcs8hfaj8g8ydrbcmp3dd` FOREIGN KEY (`tag_id`) REFERENCES `project_setting_tags` (`id`),
  CONSTRAINT `FK9xoapoprky9j6mfqkcuqpswtn` FOREIGN KEY (`id`) REFERENCES `user_story` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_story_tag`
--

LOCK TABLES `user_story_tag` WRITE;
/*!40000 ALTER TABLE `user_story_tag` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_story_tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_story_user`
--

DROP TABLE IF EXISTS `user_story_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_story_user` (
  `user_story_id` int NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`user_story_id`,`user_id`),
  KEY `FKjcihkupnku17m4xeqxa9rn6ce` (`user_id`),
  CONSTRAINT `FKjcihkupnku17m4xeqxa9rn6ce` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKlut44i6y0o74jj4a60vgw5dkx` FOREIGN KEY (`user_story_id`) REFERENCES `user_story` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_story_user`
--

LOCK TABLES `user_story_user` WRITE;
/*!40000 ALTER TABLE `user_story_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_story_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_story_watcher`
--

DROP TABLE IF EXISTS `user_story_watcher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_story_watcher` (
  `user_story_id` int NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`user_story_id`,`user_id`),
  KEY `FKe16aerbvcfih3j3q6havclnl7` (`user_id`),
  CONSTRAINT `FKe16aerbvcfih3j3q6havclnl7` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKo0ub5sbsms3sqrp82g12pugm3` FOREIGN KEY (`user_story_id`) REFERENCES `user_story` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_story_watcher`
--

LOCK TABLES `user_story_watcher` WRITE;
/*!40000 ALTER TABLE `user_story_watcher` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_story_watcher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT (now()),
  `updated_at` datetime(6) DEFAULT (now()),
  `avatar` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `role_id` bigint DEFAULT NULL,
  `bio` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKci7xr690rvyv3bnfappbyh8x0` (`updated_by`),
  KEY `FKibk1e3kaxy5sfyeekp8hbhnim` (`created_by`),
  CONSTRAINT `FKci7xr690rvyv3bnfappbyh8x0` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKibk1e3kaxy5sfyeekp8hbhnim` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'2024-01-01 00:00:00.000000','2024-01-01 00:00:00.000000','https://example.com/avatars/admin.jpg','admin@example.com','System Administrator','$2a$10$abcdefghijklmnopqrstuvwxyz1234567890','admin',NULL,NULL,1,NULL),(2,'2024-01-02 10:30:00.000000','2024-03-15 14:20:00.000000','https://example.com/avatars/john.jpg','john.doe@example.com','John Doe','$2a$10$abcdefghijklmnopqrstuvwxyz1234567890','johndoe',1,1,2,NULL),(3,'2024-01-03 09:45:00.000000','2024-02-20 11:10:00.000000','https://example.com/avatars/jane.jpg','jane.smith@example.com','Jane Smith','$2a$10$abcdefghijklmnopqrstuvwxyz1234567890','janesmith',1,1,3,NULL),(4,'2024-01-04 14:20:00.000000','2024-03-10 16:40:00.000000','https://example.com/avatars/michael.jpg','michael.johnson@example.com','Michael Johnson','$2a$10$abcdefghijklmnopqrstuvwxyz1234567890','michaelj',1,1,4,NULL),(5,'2024-01-05 11:15:00.000000','2024-02-28 09:30:00.000000','https://example.com/avatars/emily.jpg','emily.williams@example.com','Emily Williams','$2a$10$abcdefghijklmnopqrstuvwxyz1234567890','emilyw',1,1,5,NULL),(6,'2024-01-06 13:50:00.000000','2024-03-05 15:25:00.000000','https://example.com/avatars/robert.jpg','robert.brown@example.com','Robert Brown','$2a$10$abcdefghijklmnopqrstuvwxyz1234567890','robertb',1,1,4,NULL),(7,'2024-01-07 08:40:00.000000','2024-02-15 10:55:00.000000','https://example.com/avatars/sarah.jpg','sarah.davis@example.com','Sarah Davis','$2a$10$abcdefghijklmnopqrstuvwxyz1234567890','sarahd',1,3,4,NULL),(8,'2024-01-08 15:30:00.000000','2024-03-20 13:15:00.000000','https://example.com/avatars/david.jpg','david.miller@example.com','David Miller','$2a$10$abcdefghijklmnopqrstuvwxyz1234567890','davidm',1,3,5,NULL),(9,'2024-01-09 12:20:00.000000','2024-02-25 14:50:00.000000','https://example.com/avatars/jennifer.jpg','jennifer.wilson@example.com','Jennifer Wilson','$2a$10$abcdefghijklmnopqrstuvwxyz1234567890','jenniferw',1,3,4,NULL),(10,'2024-01-10 10:10:00.000000','2024-03-12 09:20:00.000000','https://example.com/avatars/thomas.jpg','thomas.moore@example.com','Thomas Moore','$2a$10$abcdefghijklmnopqrstuvwxyz1234567890','thomasm',1,3,5,NULL),(11,NULL,NULL,'03.AA95B8','btvn256@gmail.com','Bui The Vinh Nguyen','$2a$10$iPdYGi3vcbCO.4QpAFSbRukg1JweP92gW01PmSZv/NTvUTh0wNTuy','nguyen',NULL,NULL,2,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `watchers`
--

DROP TABLE IF EXISTS `watchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `watchers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `issue_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK42mxm44nk97idxdpaygubwsub` (`user_id`),
  KEY `FKf0s6by6b2tv9613lmm6b3be1p` (`issue_id`),
  CONSTRAINT `FK42mxm44nk97idxdpaygubwsub` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKf0s6by6b2tv9613lmm6b3be1p` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `watchers`
--

LOCK TABLES `watchers` WRITE;
/*!40000 ALTER TABLE `watchers` DISABLE KEYS */;
/*!40000 ALTER TABLE `watchers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wiki_page_attachment`
--

DROP TABLE IF EXISTS `wiki_page_attachment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wiki_page_attachment` (
  `wiki_page_id` int NOT NULL,
  `attachment_id` int NOT NULL,
  PRIMARY KEY (`wiki_page_id`,`attachment_id`),
  KEY `FKi2h7kidue92uwikhxoov0553r` (`attachment_id`),
  CONSTRAINT `FKi2h7kidue92uwikhxoov0553r` FOREIGN KEY (`attachment_id`) REFERENCES `attachment` (`id`),
  CONSTRAINT `FKqwdfhy01u3oo4gdoj46rmy30a` FOREIGN KEY (`wiki_page_id`) REFERENCES `project_wiki_page` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wiki_page_attachment`
--

LOCK TABLES `wiki_page_attachment` WRITE;
/*!40000 ALTER TABLE `wiki_page_attachment` DISABLE KEYS */;
/*!40000 ALTER TABLE `wiki_page_attachment` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-11  9:14:33
