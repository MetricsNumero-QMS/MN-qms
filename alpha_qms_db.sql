-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: alpha_qms_db
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.24.04.5

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ants_categories`
--

DROP TABLE IF EXISTS `ants_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ants_categories` (
  `category_name` varchar(20) NOT NULL,
  `user_role_access` int NOT NULL,
  `empID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ants_categories`
--

LOCK TABLES `ants_categories` WRITE;
/*!40000 ALTER TABLE `ants_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `ants_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doc_log_info`
--

DROP TABLE IF EXISTS `doc_log_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doc_log_info` (
  `emp_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `doc_id` int NOT NULL,
  `doc_name` varchar(255) NOT NULL,
  `doc_accessed_type` int NOT NULL COMMENT '0-viewed,1-downloaded',
  `accessed_datetime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doc_log_info`
--

LOCK TABLES `doc_log_info` WRITE;
/*!40000 ALTER TABLE `doc_log_info` DISABLE KEYS */;
INSERT INTO `doc_log_info` VALUES ('mohan.b@alpha-numero',21,'AN_FRM_GL_ChangeRequestNote_GNRL.docx',0,'2023-03-22 14:52:15'),('mohan.b@alpha-numero',22,'AN_FRM_GL_KnowledgeSharing_GNRL.docx',0,'2023-03-22 14:52:17'),('mohan.b@alpha-numero',23,'AN_FRM_GL_ProcessRevisionRequest.xlsx',0,'2023-03-22 14:52:19'),('mohan.b@alpha-numero',24,'AN_FRM_GL_ProjectInitiation_GNRL.xlsx',0,'2023-03-22 14:52:22'),('mohan.b@alpha-numero',52,'Process Mapping.docx',0,'2023-03-22 14:52:42'),('mohan.b@alpha-numero',53,'Quality Objective.docx',0,'2023-03-22 14:52:46'),('mohan.b@alpha-numero',50,'AN_QMS_GL_Quality_Manual.docx',0,'2023-03-22 14:52:48'),('mohan.b@alpha-numero',21,'AN_FRM_GL_ChangeRequestNote_GNRL.docx',1,'2023-03-22 14:53:02'),('mohan.b@alpha-numero',22,'AN_FRM_GL_KnowledgeSharing_GNRL.docx',1,'2023-03-22 14:53:02'),('mohan.b@alpha-numero',23,'AN_FRM_GL_ProcessRevisionRequest.xlsx',1,'2023-03-22 14:53:03'),('mohan.b@alpha-numero',174,'AN_TMP_GL_ChangeRequest.xlsx',1,'2023-03-22 15:13:45'),('mohan.b@alpha-numero',174,'AN_TMP_GL_ChangeRequest.xlsx',0,'2023-03-22 15:14:00'),('mohan.b@alpha-numero',1,'AN_CHTR_GL_QA.docx',0,'2024-02-21 14:07:00'),('mohan.b@alpha-numero',1,'AN_CHTR_GL_QA.docx',1,'2024-02-21 14:04:59'),('mohan.b@alpha-numero',58,'AN_PRC_GL_ConfigurationManagement.docx',0,'2023-03-27 14:47:12'),('mohan.b@alpha-numero',58,'AN_PRC_GL_ConfigurationManagement.docx',1,'2023-03-27 14:47:18'),('mohan.b@alpha-numero',57,'AN_PRC_GL_ChangeManagement.docx',0,'2023-03-27 14:47:27'),('mohan.b@alpha-numero',177,'AN_TMP_GL_EffortEstimation.xlsx',0,'2023-03-27 15:26:57'),('mohan.b@alpha-numero',189,'AN_TMP_GL_Excel.xlsx',0,'2023-03-29 12:33:48'),('mohan.b@alpha-numero',197,'project use case.pptx',0,'2023-03-31 12:50:51'),('mohan.b@alpha-numero',197,'project use case.pptx',1,'2025-06-23 05:45:41'),('mohan.b@alpha-numero',198,'javascript_tutorial.pdf',0,'2023-03-31 12:51:47'),('mohan.b@alpha-numero',199,'PHP_Intermidiate.docx',0,'2023-03-31 12:56:32'),('mohan.b@alpha-numero',199,'PHP_Intermidiate.docx',1,'2023-03-31 12:52:43'),('mohan.b@alpha-numero',200,'aws_doc.docx',0,'2023-04-03 10:38:57'),('mohan.b@alpha-numero',204,'docker.docx',0,'2024-02-20 15:20:58'),('mohan.b@alpha-numero',205,'NDA - Balachandra Mohan.pdf',0,'2023-03-31 15:11:27'),('mohan.b@alpha-numero',207,'domain_name_local_project.docx',0,'2024-02-19 12:16:58'),('mohan.b@alpha-numero',208,'merging file in git.docx',0,'2024-02-19 12:17:04'),('mohan.b@alpha-numero',208,'merging file in git.docx',1,'2023-10-26 18:34:07'),('mohan.b@alpha-numero',209,'css_tutorial.pdf',0,'2023-11-27 14:49:19'),('mohan.b@alpha-numero',10,'AN_CHK_GL_IQAReport_QAG_MR.xlsx',1,'2023-11-28 11:57:55'),('mohan.b@alpha-numero',14,'AN_CHK_GL_QMSRelease_GNRL.xlsx',0,'2023-11-28 11:59:01'),('mohan.b@alpha-numero',3,'AN_CHK_BD_ProposalReview_GNRL.xlsx',0,'2023-11-28 17:31:42'),('mohan.b@alpha-numero',4,'AN_CHK_BD_SOWContract_GNRL.xlsx',0,'2023-11-28 17:31:46'),('mohan.b@alpha-numero',201,'AN_CHK_GL_IQAReport_QAG_MR.xlsx',0,'2023-12-07 15:38:38'),('mohan.b@alpha-numero',210,'QMS_Release_note.docx',0,'2023-12-04 14:36:14'),('mohan.b@alpha-numero',218,'AN_TMP_GL_CustomerComplaint.xlsx',1,'2023-12-07 16:14:25'),('mohan.b@alpha-numero',218,'AN_TMP_GL_CustomerComplaint.xlsx',0,'2023-12-07 16:14:03'),('mohan.b@alpha-numero',204,'docker.docx',1,'2024-02-19 18:52:10'),('mohan.b@alpha-numero',220,'ImportUserTemplate.xlsx',0,'2024-02-20 15:20:01'),('mohan.b@alpha-numero',220,'1708422615143-QMS_Release_note (7).docx',0,'2024-02-20 15:21:15'),('mohan.b@alpha-numero',221,'js-cheatsheet8.pdf',0,'2024-02-20 15:22:05'),('mohan.b@alpha-numero',221,'1708422752033-Two.pdf',0,'2024-02-20 15:22:35'),('mohan.b@alpha-numero',221,'1708422752033-Two.pdf',1,'2024-02-20 15:22:44'),('mohan.b@alpha-numero.com',55,'CLM.pdf',1,'2025-06-24 06:53:12'),('mohan.b@alpha-numero.com',55,'CLM.pdf',0,'2025-06-24 06:53:19'),('mohan.b@alpha-numero.com',56,'MN-application-list.docx',1,'2025-06-24 06:54:02'),('mohan.b@alpha-numero.com',56,'MN-application-list.docx',0,'2025-06-24 06:58:25'),('mohan.b@alpha-numero.com',57,'Software Development.docx',1,'2025-06-24 07:14:53'),('mohan.b@alpha-numero.com',57,'Software Development.docx',0,'2025-06-24 07:14:56'),('mohan.b@alpha-numero.com',60,'Project Milestone achievement.pdf',1,'2025-06-24 08:44:08'),('mohan.b@alpha-numero.com',1,'AN_CHK_ADM_Maintenance.xlsx',1,'2026-08-31 09:49:33'),('mohan2mba23@gmail.com',22,'MN_CHK_GL_IQAReport_Admin.xlsx',1,'2026-08-31 05:34:52'),('balachandra.mohan@metricsnumero.com',3,'AN_PRC_ADM_AdminInfrastructure.docx',0,'2026-10-08 09:35:37'),('balachandra.mohan@metricsnumero.com',3,'AN_PRC_ADM_AdminInfrastructure.docx',1,'2026-08-31 11:29:04'),('balachandra.mohan@metricsnumero.com',1,'AN_CHK_ADM_Maintenance.xlsx',0,'2026-10-09 11:51:01'),('balachandra.mohan@metricsnumero.com',10,'AN_CHK_GL_IQAReport_Admin.xlsx',0,'2026-10-08 06:26:15'),('balachandra.mohan@metricsnumero.com',16,'AN_CHK_GL_IQAReport_TopManagement.xlsx',0,'2026-09-01 05:19:42'),('balachandra.mohan@metricsnumero.com',14,'AN_CHK_GL_IQAReport_Purchase.xlsx',0,'2026-09-04 05:14:16'),('balachandra.mohan@metricsnumero.com',13,'AN_CHK_GL_IQAReport_IT.xlsx',0,'2026-09-01 10:26:25'),('balachandra.mohan@metricsnumero.com',12,'AN_CHK_GL_IQAReport_HR.xlsx',0,'2026-08-31 11:10:43'),('balachandra.mohan@metricsnumero.com',11,'AN_CHK_GL_IQAReport_BD.xlsx',0,'2026-08-31 11:17:22'),('balachandra.mohan@metricsnumero.com',18,'AN_CHK_GL_ProjectProcessPlan_GNRL.xlsx',0,'2026-08-31 11:19:02'),('balachandra.mohan@metricsnumero.com',17,'AN_CHK_GL_ProjectClosure_GNRL.xlsx',0,'2026-08-31 11:31:11'),('mohan2mba23@gmail.com',19,'MN_CHK_ADM_Maintenance.xlsx',0,'2026-10-09 11:23:31'),('mohan2mba23@gmail.com',32,'contract.pdf',0,'2026-09-01 11:15:25'),('mohan2mba23@gmail.com',33,'MN PPT TEMPLATE.pptx',0,'2026-09-01 09:31:02'),('mohan2mba23@gmail.com',35,'Advanced_Python_OOP_Interview_Guide_10_Years.docx',0,'2026-09-25 19:06:29'),('mohan2mba23@gmail.com',47,'MindDocsAI-Tech-Stack.docx',0,'2026-10-06 09:58:12'),('mohan2mba23@gmail.com',50,'1791338106677-1_MindDocsAI-Tech-Stack.docx',0,'2026-10-07 02:11:02'),('mohan2mba23@gmail.com',50,'1_MindDocsAI-Tech-Stack.docx',0,'2026-10-07 03:03:12'),('mohan2mba23@gmail.com',50,'1791339191472-1_MindDocsAI-Tech-Stack.docx',0,'2026-10-07 02:41:12'),('mohan2mba23@gmail.com',50,'1340886577-1_MindDocsAI-Tech-St.docx',0,'2026-10-07 02:52:23'),('mohan2mba23@gmail.com',50,'1341555779-1_MindDocsAI-Tech-St.docx',0,'2026-10-07 05:20:06'),('mohan2mba23@gmail.com',47,'1791286045670-MindDocsAI-Tech-Stack.docx',0,'2026-10-07 09:54:52'),('mohan2mba23@gmail.com',51,'1791343859258-GitHub_Actions_Step_by_Step_Guide.docx',0,'2026-10-09 11:36:59'),('mohan2mba23@gmail.com',50,'1350454685-1_MindDocsAI-Tech-St.docx',0,'2026-10-07 05:21:47'),('mohan2mba23@gmail.com',50,'1350530285-1_MindDocsAI-Tech-St.docx',0,'2026-10-08 06:13:03'),('mohan2mba23@gmail.com',53,'1791343859258-GitHub_Actions_Step_by_St-copy2.docx',0,'2026-10-07 05:31:54'),('mohan2mba23@gmail.com',45,'Advanced_Python_OOP_Interview_Guide_10_Y-copy.docx',0,'2026-10-08 06:25:41'),('mohan2mba23@gmail.com',54,'1791441231786-AIML Development Life Cycle.docx',0,'2026-10-08 11:51:56'),('qms.admin@metricsnumero.com',47,'1366942781-MindDocsAI-Tech-Stac.docx',0,'2026-10-09 11:59:16');
/*!40000 ALTER TABLE `doc_log_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `file_access`
--

DROP TABLE IF EXISTS `file_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `file_access` (
  `empID` int NOT NULL,
  `user_role` int NOT NULL,
  `idEdited` int NOT NULL,
  `isRemoved` int NOT NULL,
  `isUpdated` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `file_access`
--

LOCK TABLES `file_access` WRITE;
/*!40000 ALTER TABLE `file_access` DISABLE KEYS */;
/*!40000 ALTER TABLE `file_access` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `file_info`
--

DROP TABLE IF EXISTS `file_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `file_info` (
  `doc_num` int NOT NULL AUTO_INCREMENT,
  `doc_name` varchar(255) NOT NULL,
  `doc_path` varchar(255) NOT NULL,
  `doc` varchar(255) DEFAULT NULL,
  `created_by` varchar(50) NOT NULL,
  `updated_by` varchar(155) DEFAULT NULL,
  `created_at` date NOT NULL,
  `last_modified` date NOT NULL,
  `last_accessed` date NOT NULL,
  `version` varchar(20) NOT NULL DEFAULT '1.0',
  `status` int NOT NULL,
  `doc_file` longblob NOT NULL,
  `docRelVer` varchar(20) NOT NULL DEFAULT '1.0',
  `docDesc` varchar(255) NOT NULL,
  `releaseDt` date DEFAULT NULL,
  PRIMARY KEY (`doc_num`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `file_info`
--

LOCK TABLES `file_info` WRITE;
/*!40000 ALTER TABLE `file_info` DISABLE KEYS */;
INSERT INTO `file_info` VALUES (1,'AN_CHK_ADM_Maintenance','Charter/Admin','AN_CHK_ADM_Maintenance.xlsx','kiran',NULL,'2025-06-24','2025-06-24','2025-06-24','1.00',1,_binary 'AN_CHK_ADM_Maintenance','1.00','AN_CHK_ADM_Maintenance','2025-06-24'),(2,'AN_CHTR_GL_QA','Charter/Admin','AN_CHTR_GL_QA.docx','kiran',NULL,'2025-06-24','2025-06-24','2025-06-24','1.00',1,_binary 'AN_CHTR_GL_QA','1.00','AN_CHTR_GL_QA','2025-06-24'),(3,'AN_PRC_ADM_AdminInfrastructure','Charter/Admin','AN_PRC_ADM_AdminInfrastructure.docx','kiran',NULL,'2025-06-24','2025-06-24','2025-06-24','1.00',1,_binary 'AN_PRC_ADM_AdminInfrastructure','1.00','AN_PRC_ADM_AdminInfrastructure','2025-06-24'),(5,'AN_CHK_BD_SOWContract_GNRL','Checklist/Admin','AN_CHK_BD_SOWContract_GNRL.xlsx','kiran',NULL,'2025-06-24','2025-06-24','2025-06-24','1.00',1,_binary 'AN_CHK_BD_SOWContract_GNRL','1.00','AN_CHK_BD_SOWContract_GNRL','2025-06-24'),(6,'AN_CHK_GL_IQAReport_Admin','Checklist/Admin','AN_CHK_GL_IQAReport_Admin.xlsx','kiran',NULL,'2025-06-24','2025-06-24','2025-06-24','1.00',1,_binary 'AN_CHK_GL_IQAReport_Admin','1.00','AN_CHK_GL_IQAReport_Admin','2025-06-24'),(7,'AN_CHK_GL_QMSRelease_GNRL','Checklist/Admin','AN_CHK_GL_QMSRelease_GNRL.xlsx','kiran',NULL,'2025-06-24','2025-06-24','2025-06-24','1.00',1,_binary 'AN_CHK_GL_QMSRelease_GNRL','1.00','AN_CHK_GL_QMSRelease_GNRL','2025-06-24'),(10,'AN_CHK_GL_IQAReport_Admin','Charter/Flow','AN_CHK_GL_IQAReport_Admin.xlsx','kiran',NULL,'2025-06-24','2025-06-24','2025-06-24','1.00',1,_binary 'AN_CHK_GL_IQAReport_Admin','1.00','AN_CHK_GL_IQAReport_Admin','2025-06-25'),(11,'AN_CHK_GL_IQAReport_BD','Charter/Flow','AN_CHK_GL_IQAReport_BD.xlsx','kiran',NULL,'2025-06-24','2025-06-24','2025-06-24','1.00',1,_binary 'AN_CHK_GL_IQAReport_BD','1.00','AN_CHK_GL_IQAReport_BD','2025-06-24'),(12,'AN_CHK_GL_IQAReport_HR','Charter/Flow','AN_CHK_GL_IQAReport_HR.xlsx','kiran',NULL,'2025-06-24','2025-06-24','2025-06-24','1.00',1,_binary 'AN_CHK_GL_IQAReport_HR','1.00','AN_CHK_GL_IQAReport_HR','2025-06-24'),(13,'AN_CHK_GL_IQAReport_IT','Charter/Flow','AN_CHK_GL_IQAReport_IT.xlsx','kiran',NULL,'2025-06-24','2025-06-24','2025-06-24','1.00',1,_binary 'AN_CHK_GL_IQAReport_IT','1.00','AN_CHK_GL_IQAReport_IT','2025-06-24'),(14,'AN_CHK_GL_IQAReport_Purchase','Charter/Flow','AN_CHK_GL_IQAReport_Purchase.xlsx','kiran',NULL,'2025-06-24','2025-06-24','2025-06-24','1.00',1,_binary 'AN_CHK_GL_IQAReport_Purchase','1.00','AN_CHK_GL_IQAReport_Purchase','2025-06-24'),(15,'AN_CHK_GL_IQAReport_QAG_MR','Charter/Flow','AN_CHK_GL_IQAReport_QAG_MR.xlsx','kiran',NULL,'2025-06-24','2025-06-24','2025-06-24','1.00',1,_binary 'AN_CHK_GL_IQAReport_QAG_MR','1.00','AN_CHK_GL_IQAReport_QAG_MR','2025-06-24'),(16,'AN_CHK_GL_IQAReport_TopManagement','Charter/Flow','AN_CHK_GL_IQAReport_TopManagement.xlsx','kiran',NULL,'2025-06-24','2025-06-24','2025-06-24','1.00',1,_binary 'AN_CHK_GL_IQAReport_TopManagement','1.00','AN_CHK_GL_IQAReport_TopManagement','2025-06-24'),(17,'AN_CHK_GL_ProjectClosure_GNRL','Charter/Flow','AN_CHK_GL_ProjectClosure_GNRL.xlsx','kiran',NULL,'2025-06-24','2025-06-24','2025-06-24','1.00',1,_binary 'AN_CHK_GL_ProjectClosure_GNRL','1.00','AN_CHK_GL_ProjectClosure_GNRL','2025-06-24'),(18,'AN_CHK_GL_ProjectProcessPlan_GNRL','Charter/Flow','AN_CHK_GL_ProjectProcessPlan_GNRL.xlsx','kiran',NULL,'2025-06-24','2025-06-24','2025-06-24','1.00',1,_binary 'AN_CHK_GL_ProjectProcessPlan_GNRL','1.00','AN_CHK_GL_ProjectProcessPlan_GNRL','2025-06-24'),(19,'MN_CHK_ADM_Maintenance.xlsx','Checklist/Admin','MN_CHK_ADM_Maintenance.xlsx','kiran',NULL,'2026-01-07','2026-01-07','2026-01-07','1.00',1,_binary 'MN_CHK_ADM_Maintenance.xlsx','1.00','MN_CHK_ADM_Maintenance','2025-10-01'),(20,'MN_CHK_BD_ProposalReview_GNRL.xlsx','Checklist/Bd','MN_CHK_BD_ProposalReview_GNRL.xlsx','kiran',NULL,'2026-01-07','2026-01-07','2026-01-07','1.00',1,_binary 'MN_CHK_BD_ProposalReview_GNRL.xlsx','1.00','MN_CHK_BD_ProposalReview_GNR','2025-06-02'),(21,'MN_CHK_BD_SOWContract_GNRL.xlsx','Checklist/Bd','MN_CHK_BD_SOWContract_GNRL.xlsx','kiran',NULL,'2026-01-07','2026-01-07','2026-01-07','1.00',1,_binary 'MN_CHK_BD_SOWContract_GNRL.xlsx','1.00','MN_CHK_BD_SOWContract_GNRL','2025-06-02'),(22,'MN_CHK_GL_IQAReport_Admin.xlsx','Checklist/Global','MN_CHK_GL_IQAReport_Admin.xlsx','kiran',NULL,'2026-01-07','2026-01-07','2026-01-07','1.00',1,_binary 'MN_CHK_GL_IQAReport_Admin.xlsx','1.00','MN_CHK_GL_IQAReport_Admin','2025-06-02'),(23,'MN_CHK_GL_IQAReport_BD.xlsx','Checklist/Global','MN_CHK_GL_IQAReport_BD.xlsx','kiran',NULL,'2026-01-07','2026-01-07','2026-01-07','1.00',1,_binary 'MN_CHK_GL_IQAReport_BD.xlsx','1.00','MN_CHK_GL_IQAReport_BD','2025-06-02'),(24,'MN_CHK_GL_IQAReport_HR.xlsx','Checklist/Global','MN_CHK_GL_IQAReport_HR.xlsx','kiran',NULL,'2026-01-07','2026-01-07','2026-01-07','1.00',1,_binary 'MN_CHK_GL_IQAReport_HR.xlsx','1.00','MN_CHK_GL_IQAReport_HR.','2025-06-02'),(25,'MN_CHK_GL_IQAReport_IT.xlsx','Checklist/Global','MN_CHK_GL_IQAReport_IT.xlsx','kiran',NULL,'2026-01-07','2026-01-07','2026-01-07','1.00',1,_binary 'MN_CHK_GL_IQAReport_IT.xlsx','1.00','MN_CHK_GL_IQAReport_IT','2025-06-02'),(26,'MN_CHK_GL_IQAReport_Purchase.xlsx','Checklist/Global','MN_CHK_GL_IQAReport_Purchase.xlsx','kiran',NULL,'2026-01-07','2026-01-07','2026-01-07','1.00',1,_binary 'MN_CHK_GL_IQAReport_Purchase.xlsx','1.00','MN_CHK_GL_IQAReport_Purchase','2025-06-02'),(27,'MN_CHK_GL_IQAReport_QAG_MR.xlsx','Checklist/Global','MN_CHK_GL_IQAReport_QAG_MR.xlsx','kiran',NULL,'2026-01-07','2026-01-07','2026-01-07','1.00',1,_binary 'MN_CHK_GL_IQAReport_QAG_MR.xlsx','1.00','MN_CHK_GL_IQAReport_QAG_MR','2025-06-02'),(28,'MN_CHK_GL_IQAReport_TopManagement.xlsx','Checklist/Global','MN_CHK_GL_IQAReport_TopManagement.xlsx','kiran',NULL,'2026-01-07','2026-01-07','2026-01-07','1.00',1,_binary 'MN_CHK_GL_IQAReport_TopManagement.xlsx','1.00','MN_CHK_GL_IQAReport_TopManagement','2025-06-02'),(29,'MN_CHK_GL_ProjectClosure_GNRL.xlsx','Checklist/Global','MN_CHK_GL_ProjectClosure_GNRL.xlsx','kiran',NULL,'2026-01-07','2026-01-07','2026-01-07','1.00',1,_binary 'MN_CHK_GL_ProjectClosure_GNRL.xlsx','1.00','MN_CHK_GL_ProjectClosure_GNRL','2025-06-02'),(30,'MN_CHK_GL_ProjectProcessPlan_GNRL.xlsx','Checklist/Global','MN_CHK_GL_ProjectProcessPlan_GNRL.xlsx','kiran',NULL,'2026-01-07','2026-01-07','2026-01-07','1.00',1,_binary 'MN_CHK_GL_ProjectProcessPlan_GNRL.xlsx','1.00','MN_CHK_GL_ProjectProcessPlan_GNRL','2025-06-02'),(31,'MN_CHK_GL_QMSRelease_GNRL.xlsx','Checklist/Global','MN_CHK_GL_QMSRelease_GNRL.xlsx','kiran',NULL,'2026-01-07','2026-01-07','2026-01-07','1.00',1,_binary 'MN_CHK_GL_QMSRelease_GNRL.xlsx','1.00','MN_CHK_GL_QMSRelease_GNRL','2025-06-02'),(32,'contract.pdf','Charter/Flow','contract.pdf','kiran',NULL,'2026-09-01','2026-09-01','2026-09-01','1.10',1,_binary 'contract.pdf','1.00','Lorrem ipsum','2026-08-31'),(33,'MN PPT TEMPLATE.pptx','Charter/Flow','MN PPT TEMPLATE.pptx','kiran',NULL,'2026-09-01','2026-09-01','2026-09-01','1.00',1,_binary 'MN PPT TEMPLATE.pptx','1.00','lorrem ipsum','2026-09-01'),(34,'alpha_qms_db.sql','library/6','alpha_qms_db.sql','mohan2mba23@gmail.com',NULL,'2026-09-25','2026-09-25','2026-09-25','1.00',1,_binary 'alpha_qms_db.sql','1.00','','2026-09-25'),(42,'Python_OOP_Interview.docx','Charter/Flow','Advanced_Python_OOP_Interview_Guide_10_Years.docx','mohan2mba23@gmail.com',NULL,'2026-09-25','2026-09-25','2026-09-25','1.00',1,_binary 'Python_OOP_Interview.docx','1.00','','2026-09-25'),(44,'Python_OOP_Interview.docx','Charter/Flow','Advanced_Python_OOP_Interview_Guide_10_Years.docx','mohan2mba23@gmail.com',NULL,'2026-09-25','2026-09-25','2026-09-25','1.00',1,_binary 'Python_OOP_Interview.docx','1.00','','2026-09-25'),(47,'MindDocsAI-Tech-Stack.docx','library/7','1366942781-MindDocsAI-Tech-Stac.docx','mohan2mba23@gmail.com',NULL,'2026-10-06','2026-10-07','2026-10-06','1.4',0,_binary 'MindDocsAI-Tech-Stack.docx','1.4','','2026-10-07'),(48,'MindDocsAI-Tech-Stack.docx','library/7','MindDocsAI-Tech-Stack.docx','mohan2mba23@gmail.com',NULL,'2026-10-06','2026-10-06','2026-10-06','1',1,_binary 'MindDocsAI-Tech-Stack.docx','1','','2026-10-06'),(49,'MindDocsAI-Tech-Stack.docx','library/7','MindDocsAI-Tech-Stack.docx','mohan2mba23@gmail.com',NULL,'2026-10-06','2026-10-06','2026-10-06','1',1,_binary 'MindDocsAI-Tech-Stack.docx','1','','2026-10-06'),(50,'1_MindDocsAI-Tech-Stack.docx','library/11','1350530285-1_MindDocsAI-Tech-St.docx','mohan2mba23@gmail.com',NULL,'2026-10-07','2026-10-07','2026-10-07','1.5',0,_binary '1_MindDocsAI-Tech-Stack.docx','1.5','','2026-10-07'),(51,'GitHub_Actions_Step_by_Step_Guide.docx','library/7','1791343859258-GitHub_Actions_Step_by_Step_Guide.docx','mohan2mba23@gmail.com',NULL,'2026-10-07','2026-10-07','2026-10-07','1.0',0,_binary 'GitHub_Actions_Step_by_Step_Guide.docx','1.0','','2026-10-07'),(54,'AIML Development Life Cycle.docx','library/10','1791441231786-AIML Development Life Cycle.docx','mohan2mba23@gmail.com',NULL,'2026-10-08','2026-10-08','2026-10-08','1.0',1,_binary 'AIML Development Life Cycle.docx','1.0','','2026-10-08');
/*!40000 ALTER TABLE `file_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login`
--

DROP TABLE IF EXISTS `login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login` (
  `user_id` int NOT NULL,
  `first_name` varchar(155) NOT NULL,
  `last_name` varchar(155) NOT NULL,
  `username` varchar(20) NOT NULL,
  `emp_email` varchar(155) NOT NULL,
  `pswd` varchar(128) NOT NULL,
  `user_role` int NOT NULL COMMENT '0-users,1-manager,2-admin',
  `department` varchar(155) NOT NULL,
  `reporting_manager` varchar(20) NOT NULL,
  `sys_role` varchar(20) NOT NULL DEFAULT 'viewer'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login`
--

LOCK TABLES `login` WRITE;
/*!40000 ALTER TABLE `login` DISABLE KEYS */;
INSERT INTO `login` VALUES (1,'','','balachandra mohan','balachandra.mohan@metricsnumero.com','Mohan@123',2,'','','admin'),(2,'','','Aishwary Mandal','aishwary.m@alpha-numero.com','alpha2016',1,'','','admin'),(3,'','','Penjani K','penjani.k@alpha-numero.com','alpha2016',1,'','','admin'),(4,'','','Shyam Sah','shyam.s@alpha-numero.com','alpha2016',1,'','','admin'),(5,'','','Mikul Shah','mikul.s@alpha-numero.com','alpha2016',1,'','','admin'),(6,'','','Mansi Naik','mansi.n@alpha-numero.com','alpha2016',1,'','','admin'),(7,'','','Hari Patel','haresh.p@alpha-numero.com','alpha2016',0,'','','viewer'),(8,'','','Mit S','mit.s@alpha-numero.com','alpha2016',0,'','','viewer'),(9,'','','Santhi A','santhi.a@alpha-numero.com','alpha2016',0,'','','viewer'),(10,'','','dummy','antsuser','alpha2016',1,'','','admin'),(11,'text','text','test','mohan2mba2311@gmail.com','alpha2016',0,'','tesdeee','viewer'),(12,'balachandra','mohan','test','mohan2mba23@gmail.com','alpha2016',0,'','test','viewer'),(13,'mohan','kumar','mohan kumar','mohan@gmail.com','',0,'','shyam','viewer'),(14,'ramesh','kumar','mohan kumar','ramesh@gmail.com','',0,'','shyam','viewer'),(15,'suresh','kumar','suresh kumar','suresh@gmail.com','',0,'','shyam','viewer'),(16,'ramesh','kumar','mohan kumar','ramesh@gmail.com','',0,'','shyam','viewer'),(17,'suresh','kumar','suresh kumar','suresh@gmail.com','',0,'','shyam','viewer'),(18,'ramesh','kumar','mohan kumar','ramesh@gmail.com','alpha2016',0,'','shyam','viewer'),(19,'suresh','kumar','suresh kumar','suresh@gmail.com','alpha2016',0,'','shyam','viewer'),(20,'prabu','deva','prabhu deva','brabhu@gmail.com','alpha2016',0,'','shyam sha','viewer'),(21,'ragini','kanth','rajnikanth','ragini@gmail.com','alpha2016',0,'','shyam sha','viewer'),(22,'balachandra','mohan','mnumero-us','balachandra.mohan@metricsnumero.com','Mohan@123',0,'','test','viewer'),(23,'test','test','test','test@gmail.com','alpha2016',0,'','test','viewer'),(24,'test','test','test','test@gmail.com','alpha2016',0,'','test','viewer'),(25,'Firstname','Lastname','Username','Email','alpha2016',0,'','Reporting Manager','viewer'),(26,'Firstname','Lastname','Username','Email','alpha2016',0,'','Reporting Manager','viewer'),(27,'test','test','mohan kumar','mohan','alpha2016',0,'','shyam','viewer'),(28,'test','test','mohan kumar','mohan','alpha2016',0,'','shyam','viewer'),(29,'test','test','mohan kumar','mohan','alpha2016',0,'','shyam','viewer'),(30,'undefined','undefined','undefined','test','undefined',0,'Metrics@2024','1','viewer'),(31,'undefined','undefined','test','test@gmail.com','Metrics@2024',1,'tst','','admin'),(32,'undefined','undefined','t1','t1@gmail.com','Metrics@2024',0,'dept1','undefined','viewer'),(33,'undefined','undefined','t1','uy@gmail.com','Metrics@2024',0,'dept1','undefined','viewer'),(34,'undefined','undefined','usr1','user1@gmail.com','Metrics@2024',0,'userdeot','6','viewer'),(35,'undefined','undefined','yiokp','yoknh@gmail.com','Metrics@2024',1,'tere','','admin'),(36,'undefined','undefined','test','taswe@gmail.com','Metrics@2024',1,'teer','','admin'),(37,'undefined','undefined','test','tnbie@gmail.com','Metrics@2024',1,'tefdh','','admin'),(38,'undefined','undefined','user12','user12@gmail.com','Metrics@2024',1,'user12','','admin'),(39,'undefined','undefined','user13','user13@gmail.com','Metrics@2024',0,'user13','38','viewer'),(40,'undefined','undefined','user21','user21@gmail.com','Metrics@2024',0,'user21','1','viewer'),(41,'undefined','undefined','user22','user22@gmail.com','Metrics@2024',0,'user22','2','viewer'),(42,'undefined','undefined','user23','user23@gmail.com','Metrics@2024',0,'user23','3','viewer'),(43,'undefined','undefined','manager1','manager1@gmail.com','Metrics@2024',0,'manager1','','viewer'),(44,'undefined','undefined','asdfsd','sdfdsf@gmail.com','Metrics@2024',1,'sdfsdf','','admin'),(45,'undefined','undefined','a','a@gmail.com','Metrics@2024',1,'sdf','','admin'),(46,'undefined','undefined','aa','m@gmail.com','Metrics@2024',1,'f','','admin'),(47,'undefined','undefined','test','test4545@gmail.com','Metrics@2024',0,'dsfdf','3','viewer'),(48,'undefined','undefined','ter','fgfg@hmail.com','Metrics@2024',0,'f','6','viewer'),(49,'undefined','undefined','terer','testing@gmail.com','Metrics@2024',1,'sdfdf','','admin'),(50,'Admin','Test','qms.admin','qms.admin@metricsnumero.com','QmsAdmin#2026',1,'Quality','QMS Lead','admin'),(51,'Editor','Test','qms.editor','qms.editor@metricsnumero.com','QmsEditor#2026',0,'Quality','QMS Lead','editor'),(52,'Viewer','Test','qms.viewer','qms.viewer@metricsnumero.com','QmsViewer#2026',0,'Quality','QMS Lead','viewer'),(53,'Auditor','Test','qms.auditor','qms.auditor@metricsnumero.com','QmsAuditor#2026',0,'Quality','QMS Lead','auditor');
/*!40000 ALTER TABLE `login` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `notify_id` int NOT NULL AUTO_INCREMENT,
  `emp_id` varchar(55) NOT NULL,
  `doc_id` int NOT NULL,
  PRIMARY KEY (`notify_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES (1,'mohan.b@alpha-numero.com',157),(2,'mohan.b@alpha-numero.com',158),(3,'mohan.b@alpha-numero.com',160),(4,'mohan.b@alpha-numero.com',160),(5,'mohan.b@alpha-numero.com',161),(6,'aishwary.m@alpha-numero.com',162),(7,'aishwary.m@alpha-numero.com',163),(8,'mohan.b@alpha-numero.com',170),(9,'mohan.b@alpha-numero.com',171),(10,'mohan.b@alpha-numero.com',1),(11,'mohan.b@alpha-numero.com',171),(12,'mohan.b@alpha-numero.com',1),(13,'mohan.b@alpha-numero.com',174),(14,'mohan.b@alpha-numero.com',174),(15,'mohan.b@alpha-numero.com',176),(16,'mohan.b@alpha-numero.com',189),(17,'mohan.b@alpha-numero.com',194),(18,'mohan.b@alpha-numero.com',195),(19,'mohan.b@alpha-numero.com',1),(20,'mohan.b@alpha-numero.com',196),(21,'mohan.b@alpha-numero.com',1),(22,'mohan.b@alpha-numero.com',199),(23,'mohan.b@alpha-numero.com',208),(24,'mohan.b@alpha-numero.com',220),(26,'mohan.b@alpha-numero.com',57),(27,'mohan.b@alpha-numero.com',7),(28,'mohan2mba23@gmail.com',18),(29,'mohan2mba23@gmail.com',18);
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qms_access_alerts`
--

DROP TABLE IF EXISTS `qms_access_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qms_access_alerts` (
  `alert_id` int NOT NULL AUTO_INCREMENT,
  `user_email` varchar(155) NOT NULL,
  `folder_id` int DEFAULT NULL,
  `kind` varchar(40) NOT NULL DEFAULT 'info',
  `title` varchar(180) NOT NULL DEFAULT '',
  `body` varchar(500) NOT NULL DEFAULT '',
  `href` varchar(255) NOT NULL DEFAULT '',
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`alert_id`),
  KEY `idx_access_alerts_user` (`user_email`,`is_read`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qms_access_alerts`
--

LOCK TABLES `qms_access_alerts` WRITE;
/*!40000 ALTER TABLE `qms_access_alerts` DISABLE KEYS */;
INSERT INTO `qms_access_alerts` VALUES (1,'aishwary.m@alpha-numero.com',7,'share','Access granted: test','mohan2mba23@gmail.com gave you viewer access to test.','/library?folder=7',0,'2026-10-06 11:52:49'),(2,'antsuser',1,'request','Access requested: QA Policies test','mohan2mba23@gmail.com asked for access. Review it under Pending Approval.','/library?filter=pending',0,'2026-10-08 09:31:57'),(3,'qms.viewer@metricsnumero.com',10,'share','File shared: AIML Development Life Cycle.docx','qms.editor@metricsnumero.com shared AIML Development Life Cycle.docx with you.','/library?folder=10',0,'2026-10-08 11:47:34'),(4,'qms.auditor@metricsnumero.com',10,'share','File shared: AIML Development Life Cycle.docx','qms.editor@metricsnumero.com shared AIML Development Life Cycle.docx with you.','/library?folder=10',0,'2026-10-08 11:49:37'),(5,'balachandra.mohan@metricsnumero.com',10,'share','File shared: AIML Development Life Cycle.docx','qms.admin@metricsnumero.com shared AIML Development Life Cycle.docx with you.','/library?folder=10',0,'2026-10-08 11:51:28'),(6,'qms.viewer@metricsnumero.com',10,'share','Folder invite: test','qms.editor@metricsnumero.com invited you to test as viewer.','/library?folder=10',0,'2026-10-09 06:09:17'),(7,'qms.auditor@metricsnumero.com',10,'share','Folder invite: test','qms.editor@metricsnumero.com invited you to test as viewer.','/library?folder=10',0,'2026-10-09 06:10:29'),(8,'qms.admin@metricsnumero.com',18,'request','Access requested: Aviation','mohan2mba23@gmail.com asked for access. Review it under Pending Approval.','/library?filter=pending',0,'2026-10-23 09:24:16');
/*!40000 ALTER TABLE `qms_access_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qms_access_template_grants`
--

DROP TABLE IF EXISTS `qms_access_template_grants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qms_access_template_grants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `template_id` int NOT NULL,
  `group_type` enum('department','menu','team') NOT NULL DEFAULT 'department',
  `group_key` varchar(80) NOT NULL,
  `access_role` enum('owner','editor','viewer','auditor') NOT NULL DEFAULT 'viewer',
  PRIMARY KEY (`id`),
  KEY `idx_template_grants` (`template_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qms_access_template_grants`
--

LOCK TABLES `qms_access_template_grants` WRITE;
/*!40000 ALTER TABLE `qms_access_template_grants` DISABLE KEYS */;
INSERT INTO `qms_access_template_grants` VALUES (1,1,'department','HR','viewer'),(2,2,'department','Charter','viewer'),(3,2,'menu','Charter','viewer');
/*!40000 ALTER TABLE `qms_access_template_grants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qms_access_templates`
--

DROP TABLE IF EXISTS `qms_access_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qms_access_templates` (
  `template_id` int NOT NULL AUTO_INCREMENT,
  `template_name` varchar(80) NOT NULL,
  `description` varchar(255) DEFAULT '',
  `visibility` varchar(20) NOT NULL DEFAULT 'restricted',
  `inherit_permissions` tinyint(1) NOT NULL DEFAULT '0',
  `recert_interval_days` int NOT NULL DEFAULT '90',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`template_id`),
  UNIQUE KEY `uniq_access_template_name` (`template_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qms_access_templates`
--

LOCK TABLES `qms_access_templates` WRITE;
/*!40000 ALTER TABLE `qms_access_templates` DISABLE KEYS */;
INSERT INTO `qms_access_templates` VALUES (1,'HR confidential','Restricted folder. HR department can view. Inheritance off.','restricted',0,90,'2026-10-06 11:50:40'),(2,'Charter team','Restricted folder. Charter group can view.','restricted',1,90,'2026-10-06 11:50:40'),(3,'Internal shared','Shared with people you grant. Inheritance on.','shared',1,180,'2026-10-06 11:50:40'),(4,'Company public','Visible to every logged-in user as viewer.','public',1,365,'2026-10-06 11:50:40');
/*!40000 ALTER TABLE `qms_access_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qms_doc_versions`
--

DROP TABLE IF EXISTS `qms_doc_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qms_doc_versions` (
  `version_id` int NOT NULL AUTO_INCREMENT,
  `doc_id` int NOT NULL,
  `seq` int NOT NULL,
  `doc_version` varchar(20) NOT NULL DEFAULT '1.0',
  `qms_version` varchar(20) NOT NULL DEFAULT '1.0',
  `bump_type` enum('initial','minor','major','restore') NOT NULL DEFAULT 'initial',
  `change_comment` varchar(500) NOT NULL DEFAULT '',
  `stored_file` varchar(255) NOT NULL DEFAULT '',
  `doc_name` varchar(255) NOT NULL DEFAULT '',
  `doc_desc` varchar(1000) DEFAULT '',
  `release_dt` date DEFAULT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT '0',
  `restored_from_id` int DEFAULT NULL,
  `created_by` varchar(155) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`version_id`),
  UNIQUE KEY `uniq_doc_seq` (`doc_id`,`seq`),
  KEY `idx_doc_versions_doc` (`doc_id`,`is_current`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qms_doc_versions`
--

LOCK TABLES `qms_doc_versions` WRITE;
/*!40000 ALTER TABLE `qms_doc_versions` DISABLE KEYS */;
INSERT INTO `qms_doc_versions` VALUES (1,47,1,'1.0','1.0','initial','Initial version','1_MindDocsAI-Tech-Stack.docx','MindDocsAI-Tech-Stack.docx','','2026-10-06',0,NULL,'mohan2mba23@gmail.com','2026-10-06 11:05:44'),(2,48,1,'1.0','1.0','initial','Initial version','1_MindDocsAI-Tech-Stack.docx','MindDocsAI-Tech-Stack.docx','','2026-10-06',1,NULL,'mohan2mba23@gmail.com','2026-10-06 11:10:24'),(3,49,1,'1.0','1.0','initial','Initial version','1_MindDocsAI-Tech-Stack.docx','MindDocsAI-Tech-Stack.docx','','2026-10-06',1,NULL,'mohan2mba23@gmail.com','2026-10-06 11:10:45'),(4,47,2,'1.1','1.1','minor','Uploaded a new file from Document Library.','2_1791285496075-MindDocsAI-Tech-Stack.docx','MindDocsAI-Tech-Stack.docx','','2026-10-06',0,NULL,'mohan2mba23@gmail.com','2026-10-06 11:18:17'),(5,47,3,'1.2','1.2','minor','Uploaded a new file from Document Library.','3_1791285527671-MindDocsAI-Tech-Stack.docx','MindDocsAI-Tech-Stack.docx','','2026-10-06',0,NULL,'mohan2mba23@gmail.com','2026-10-06 11:18:48'),(6,47,4,'1.3','1.3','minor','Uploaded a new file from Document Library.','4_1791286045670-MindDocsAI-Tech-Stack.docx','MindDocsAI-Tech-Stack.docx','','2026-10-06',0,NULL,'mohan2mba23@gmail.com','2026-10-06 11:27:26'),(7,50,1,'1.0','1.0','initial','Initial version','1_1791338106677-1_MindDocsAI-Tech-Stack.docx','1_MindDocsAI-Tech-Stack.docx','','2026-10-07',0,NULL,'mohan2mba23@gmail.com','2026-10-07 01:55:16'),(8,50,2,'1.1','1.1','minor','Updated file from Document Library.','2_1_MindDocsAI-Tech-Stack.docx','1_MindDocsAI-Tech-Stack.docx','','2026-10-07',0,NULL,'mohan2mba23@gmail.com','2026-10-07 02:13:11'),(9,50,3,'1.2','1.2','minor','Updated file from Document Library.','3_1791339191472-1_MindDocsAI-Tech-Stack.docx','1_MindDocsAI-Tech-Stack.docx','','2026-10-07',0,NULL,'mohan2mba23@gmail.com','2026-10-07 02:34:49'),(10,50,4,'1.2','1.2','minor','Updated file from Document Library.','4_1_MindDocsAI-Tech-Stack.docx','1_MindDocsAI-Tech-Stack.docx','','2026-10-07',0,NULL,'mohan2mba23@gmail.com','2026-10-07 02:41:26'),(11,50,5,'1.3','1.3','minor','Updated file from Document Library.','5_1_MindDocsAI-Tech-St.docx','1_MindDocsAI-Tech-Stack.docx','','2026-10-07',0,NULL,'mohan2mba23@gmail.com','2026-10-07 02:52:35'),(12,51,1,'1.0','1.0','initial','Initial version','1_1791343859258-GitHub_Actions_Step_by_Ste.docx','GitHub_Actions_Step_by_Step_Guide.docx','','2026-10-07',1,NULL,'mohan2mba23@gmail.com','2026-10-07 03:30:59'),(13,50,6,'1.4','1.4','minor','Updated file from Document Library.','6_1341555779-1_MindDocsAI-Tech-St.docx','1_MindDocsAI-Tech-Stack.docx','','2026-10-07',0,NULL,'mohan2mba23@gmail.com','2026-10-07 05:20:54'),(14,50,7,'1.5','1.5','minor','Updated file from Document Library.','7_1350454685-1_MindDocsAI-Tech-St.docx','1_MindDocsAI-Tech-Stack.docx','','2026-10-07',1,NULL,'mohan2mba23@gmail.com','2026-10-07 05:22:09'),(15,52,1,'1.0','1.0','initial','Initial version','1_1791343859258-GitHub_Actions_Step_by_Ste.docx','GitHub_Actions_Step_by_Step_Guide - Copy.docx','','2026-10-07',1,NULL,'mohan2mba23@gmail.com','2026-10-07 05:29:31'),(16,53,1,'1.0','1.0','initial','Initial version','1_1791343859258-GitHub_Actions_Step_by_St-.docx','GitHub_Actions_Step_by_Step_Guide - Copy 2.docx','','2026-10-07',1,NULL,'mohan2mba23@gmail.com','2026-10-07 05:31:15'),(17,47,5,'1.4','1.4','minor','Updated file from Document Library.','5_1791286045670-MindDocsAI-Tech-Stack.docx','MindDocsAI-Tech-Stack.docx','','2026-10-07',1,NULL,'mohan2mba23@gmail.com','2026-10-07 09:55:42'),(18,54,1,'1.0','1.0','initial','Initial version','1_1791441231786-AIML_Development_Life_Cycl.docx','AIML Development Life Cycle.docx','','2026-10-08',1,NULL,'mohan2mba23@gmail.com','2026-10-08 06:33:52'),(19,19,1,'1.0','1.0','initial','Initial version','1_MN_CHK_ADM_Maintenance.xlsx','MN_CHK_ADM_Maintenance.xlsx','MN_CHK_ADM_Maintenance','2025-10-01',1,NULL,'qms.admin@metricsnumero.com','2026-10-09 11:24:03');
/*!40000 ALTER TABLE `qms_doc_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qms_file_shares`
--

DROP TABLE IF EXISTS `qms_file_shares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qms_file_shares` (
  `share_id` int NOT NULL AUTO_INCREMENT,
  `doc_num` int NOT NULL,
  `folder_id` int DEFAULT NULL,
  `shared_with` varchar(155) NOT NULL,
  `share_token` varchar(64) NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_by` varchar(155) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL,
  `last_used_at` datetime DEFAULT NULL,
  `file_name` varchar(255) NOT NULL DEFAULT '',
  `revoked` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`share_id`),
  UNIQUE KEY `uniq_file_share_token` (`share_token`),
  KEY `idx_file_share_doc` (`doc_num`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qms_file_shares`
--

LOCK TABLES `qms_file_shares` WRITE;
/*!40000 ALTER TABLE `qms_file_shares` DISABLE KEYS */;
INSERT INTO `qms_file_shares` VALUES (1,54,10,'qms.viewer@metricsnumero.com','66bb212d39d193e49fb00e8153fdacd6',NULL,'test','2026-10-08 11:47:19','2026-10-08 11:47:32','AIML Development Life Cycle.docx',0),(2,54,10,'qms.viewer@metricsnumero.com','ccc633c6ea5b864324d422de9ae7d50a',NULL,'qms.editor@metricsnumero.com','2026-10-08 11:47:32','2026-10-08 11:48:39','AIML Development Life Cycle.docx',0),(3,54,10,'qms.auditor@metricsnumero.com','8b23e8843816466463ebcd4230f2441e',NULL,'qms.editor@metricsnumero.com','2026-10-08 11:49:36',NULL,'AIML Development Life Cycle.docx',0),(4,54,10,'balachandra.mohan@metricsnumero.com','f388daf4775d28eaf4ff4a4c4456b97d','2026-10-09 17:21:00','qms.admin@metricsnumero.com','2026-10-08 11:51:27','2026-10-08 11:51:54','AIML Development Life Cycle.docx',0);
/*!40000 ALTER TABLE `qms_file_shares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qms_folder_access_requests`
--

DROP TABLE IF EXISTS `qms_folder_access_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qms_folder_access_requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `folder_id` int NOT NULL,
  `requested_by` varchar(155) NOT NULL,
  `requested_role` enum('viewer','auditor','editor') NOT NULL DEFAULT 'viewer',
  `message` varchar(400) DEFAULT '',
  `status` enum('pending','approved','denied') NOT NULL DEFAULT 'pending',
  `decided_by` varchar(155) DEFAULT '',
  `decided_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`request_id`),
  KEY `idx_access_req_folder` (`folder_id`,`status`),
  KEY `idx_access_req_user` (`requested_by`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qms_folder_access_requests`
--

LOCK TABLES `qms_folder_access_requests` WRITE;
/*!40000 ALTER TABLE `qms_folder_access_requests` DISABLE KEYS */;
INSERT INTO `qms_folder_access_requests` VALUES (1,1,'mohan2mba23@gmail.com','viewer','','pending','',NULL,'2026-10-08 09:31:57'),(2,18,'mohan2mba23@gmail.com','viewer','','pending','',NULL,'2026-10-23 09:24:16');
/*!40000 ALTER TABLE `qms_folder_access_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qms_folder_audit`
--

DROP TABLE IF EXISTS `qms_folder_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qms_folder_audit` (
  `audit_id` int NOT NULL AUTO_INCREMENT,
  `folder_id` int DEFAULT NULL,
  `actor` varchar(155) NOT NULL,
  `action` varchar(80) NOT NULL,
  `details` text,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`audit_id`),
  KEY `idx_folder_audit_folder` (`folder_id`),
  KEY `idx_folder_audit_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qms_folder_audit`
--

LOCK TABLES `qms_folder_audit` WRITE;
/*!40000 ALTER TABLE `qms_folder_audit` DISABLE KEYS */;
INSERT INTO `qms_folder_audit` VALUES (1,1,'antsuser','folder.create','{\"name\":\"QA Policies\",\"parent_id\":null}','2026-09-24 11:19:56'),(2,1,'antsuser','lifecycle.change','{\"from\":\"draft\",\"to\":\"active\"}','2026-09-24 11:20:21'),(3,1,'antsuser','lifecycle.change','{\"from\":\"active\",\"to\":\"under_review\"}','2026-09-24 11:20:21'),(4,1,'antsuser','lifecycle.change','{\"from\":\"under_review\",\"to\":\"approved\"}','2026-09-24 11:20:22'),(5,1,'antsuser','permission.grant','{\"user_email\":\"aishwary.m@alpha-numero.com\",\"access_role\":\"editor\"}','2026-09-24 11:20:22'),(6,1,'antsuser','share.create','{\"shared_with\":\"haresh.p@alpha-numero.com\",\"access_role\":\"viewer\"}','2026-09-24 11:20:23'),(7,1,'antsuser','document.add','{\"doc_nums\":[1,2],\"added\":2}','2026-09-24 11:20:23'),(8,2,'antsuser','folder.create','{\"name\":\"SOPs\",\"parent_id\":1}','2026-09-24 11:20:24'),(9,3,'aishwary.m@alpha-numero.com','folder.create','{\"name\":\"Work Instructions\",\"parent_id\":1}','2026-09-24 11:29:57'),(10,3,'aishwary.m@alpha-numero.com','document.add','{\"doc_nums\":[3],\"added\":1}','2026-09-24 11:29:58'),(11,3,'aishwary.m@alpha-numero.com','lifecycle.change','{\"from\":\"draft\",\"to\":\"active\"}','2026-09-24 11:29:58'),(12,4,'aishwary.m@alpha-numero.com','folder.create','{\"name\":\"Records\",\"parent_id\":1}','2026-09-24 11:42:23'),(13,4,'aishwary.m@alpha-numero.com','document.add','{\"doc_nums\":[1],\"added\":1}','2026-09-24 11:42:40'),(14,5,'mohan2mba23@gmail.com','folder.create','{\"name\":\"testing\",\"parent_id\":null}','2026-09-24 11:46:01'),(15,5,'mohan2mba23@gmail.com','document.add','{\"doc_nums\":[3],\"added\":1}','2026-09-24 11:46:40'),(16,6,'mohan2mba23@gmail.com','folder.create','{\"name\":\"policies\",\"parent_id\":null}','2026-09-25 17:29:38'),(17,6,'mohan2mba23@gmail.com','document.upload','{\"doc_num\":34,\"name\":\"alpha_qms_db.sql\"}','2026-09-25 17:37:05'),(18,7,'mohan2mba23@gmail.com','folder.create','{\"name\":\"test\",\"parent_id\":null}','2026-09-25 17:44:43'),(19,7,'mohan2mba23@gmail.com','document.upload','{\"doc_num\":35,\"name\":\"Advanced_Python_OOP_Interview_Guide_10_Years.docx\"}','2026-09-25 17:45:11'),(20,7,'mohan2mba23@gmail.com','document.upload','{\"doc_num\":36,\"name\":\"dashoard-v1.png\"}','2026-09-25 17:51:58'),(21,8,'mohan2mba23@gmail.com','folder.create','{\"name\":\"test folder\",\"parent_id\":null}','2026-09-25 18:46:30'),(22,9,'mohan2mba23@gmail.com','folder.copy','{\"source_id\":7,\"destination_id\":1}','2026-09-25 19:23:57'),(23,10,'mohan2mba23@gmail.com','folder.copy','{\"source_id\":7,\"destination_id\":6}','2026-09-25 19:53:35'),(24,7,'mohan2mba23@gmail.com','document.upload','{\"doc_num\":47,\"name\":\"MindDocsAI-Tech-Stack.docx\"}','2026-10-06 09:11:45'),(25,7,'mohan2mba23@gmail.com','document.upload','{\"doc_num\":48,\"name\":\"MindDocsAI-Tech-Stack.docx\"}','2026-10-06 11:10:24'),(26,7,'mohan2mba23@gmail.com','document.upload','{\"doc_num\":49,\"name\":\"MindDocsAI-Tech-Stack.docx\"}','2026-10-06 11:10:45'),(27,7,'mohan2mba23@gmail.com','permission.grant','{\"user_email\":\"aishwary.m@alpha-numero.com\",\"access_role\":\"viewer\"}','2026-10-06 11:52:49'),(28,11,'mohan2mba23@gmail.com','folder.create','{\"name\":\"test-v1\",\"parent_id\":null}','2026-10-06 11:54:11'),(29,11,'mohan2mba23@gmail.com','document.upload','{\"doc_num\":50,\"name\":\"1_MindDocsAI-Tech-Stack.docx\"}','2026-10-07 01:55:07'),(30,11,'mohan2mba23@gmail.com','document.replace','{\"doc_num\":50,\"mode\":\"new\",\"version\":\"1.1\"}','2026-10-07 02:13:11'),(31,11,'mohan2mba23@gmail.com','document.replace','{\"doc_num\":50,\"mode\":\"new\",\"version\":\"1.2\"}','2026-10-07 02:41:26'),(32,11,'mohan2mba23@gmail.com','document.replace','{\"doc_num\":50,\"mode\":\"new\",\"version\":\"1.3\"}','2026-10-07 02:52:36'),(33,7,'mohan2mba23@gmail.com','document.upload','{\"doc_num\":51,\"name\":\"GitHub_Actions_Step_by_Step_Guide.docx\"}','2026-10-07 03:30:59'),(34,11,'mohan2mba23@gmail.com','document.replace','{\"doc_num\":50,\"mode\":\"new\",\"version\":\"1.4\"}','2026-10-07 05:20:55'),(35,11,'mohan2mba23@gmail.com','document.replace','{\"doc_num\":50,\"mode\":\"new\",\"version\":\"1.5\"}','2026-10-07 05:22:10'),(36,7,'mohan2mba23@gmail.com','document.replace','{\"doc_num\":47,\"mode\":\"new\",\"version\":\"1.4\"}','2026-10-07 09:55:43'),(37,10,'mohan2mba23@gmail.com','document.upload','{\"doc_num\":54,\"name\":\"AIML Development Life Cycle.docx\"}','2026-10-08 06:33:52'),(38,10,'qms.editor@metricsnumero.com','file.share-mail','{\"doc_num\":54,\"shared_with\":\"qms.viewer@metricsnumero.com\"}','2026-10-08 11:47:34'),(39,10,'qms.editor@metricsnumero.com','file.share-mail','{\"doc_num\":54,\"shared_with\":\"qms.auditor@metricsnumero.com\"}','2026-10-08 11:49:37'),(40,10,'qms.admin@metricsnumero.com','file.share-mail','{\"doc_num\":54,\"shared_with\":\"balachandra.mohan@metricsnumero.com\"}','2026-10-08 11:51:28'),(41,10,'qms.editor@metricsnumero.com','folder.invite','{\"invited_email\":\"qms.viewer@metricsnumero.com\",\"access_role\":\"viewer\"}','2026-10-09 06:09:17'),(42,10,'qms.viewer@metricsnumero.com','folder.invite.accept','{\"invited_email\":\"qms.viewer@metricsnumero.com\",\"access_role\":\"viewer\"}','2026-10-09 06:09:20'),(43,10,'qms.editor@metricsnumero.com','folder.invite','{\"invited_email\":\"qms.auditor@metricsnumero.com\",\"access_role\":\"viewer\"}','2026-10-09 06:10:29'),(44,12,'qms.admin@metricsnumero.com','folder.delete','{\"name\":\"Delete check\"}','2026-10-11 09:07:57'),(45,6,'qms.admin@metricsnumero.com','folder.delete','{\"name\":\"policies\"}','2026-10-11 09:26:38'),(46,18,'qms.admin@metricsnumero.com','folder.create','{\"name\":\"Aviation\",\"parent_id\":null}','2026-10-11 09:27:27');
/*!40000 ALTER TABLE `qms_folder_audit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qms_folder_documents`
--

DROP TABLE IF EXISTS `qms_folder_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qms_folder_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `folder_id` int NOT NULL,
  `doc_num` int NOT NULL,
  `added_by` varchar(155) NOT NULL,
  `added_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_folder_doc` (`folder_id`,`doc_num`),
  KEY `idx_folder_doc_num` (`doc_num`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qms_folder_documents`
--

LOCK TABLES `qms_folder_documents` WRITE;
/*!40000 ALTER TABLE `qms_folder_documents` DISABLE KEYS */;
INSERT INTO `qms_folder_documents` VALUES (1,1,1,'antsuser','2026-09-24 11:20:23'),(2,1,2,'antsuser','2026-09-24 11:20:23'),(3,3,3,'aishwary.m@alpha-numero.com','2026-09-24 11:29:58'),(4,4,1,'aishwary.m@alpha-numero.com','2026-09-24 11:42:40'),(5,5,3,'mohan2mba23@gmail.com','2026-09-24 11:46:40'),(6,6,34,'mohan2mba23@gmail.com','2026-09-25 17:37:05'),(16,7,47,'mohan2mba23@gmail.com','2026-10-06 09:11:45'),(17,7,48,'mohan2mba23@gmail.com','2026-10-06 11:10:24'),(18,7,49,'mohan2mba23@gmail.com','2026-10-06 11:10:44'),(19,11,50,'mohan2mba23@gmail.com','2026-10-07 01:55:07'),(20,7,51,'mohan2mba23@gmail.com','2026-10-07 03:30:59'),(23,10,54,'mohan2mba23@gmail.com','2026-10-08 06:33:52');
/*!40000 ALTER TABLE `qms_folder_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qms_folder_group_grants`
--

DROP TABLE IF EXISTS `qms_folder_group_grants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qms_folder_group_grants` (
  `grant_id` int NOT NULL AUTO_INCREMENT,
  `folder_id` int NOT NULL,
  `group_type` enum('department','menu','team') NOT NULL DEFAULT 'department',
  `group_key` varchar(80) NOT NULL,
  `access_role` enum('owner','editor','viewer','auditor') NOT NULL DEFAULT 'viewer',
  `granted_by` varchar(155) NOT NULL DEFAULT '',
  `granted_at` datetime NOT NULL,
  PRIMARY KEY (`grant_id`),
  UNIQUE KEY `uniq_folder_group` (`folder_id`,`group_type`,`group_key`),
  KEY `idx_folder_group_folder` (`folder_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qms_folder_group_grants`
--

LOCK TABLES `qms_folder_group_grants` WRITE;
/*!40000 ALTER TABLE `qms_folder_group_grants` DISABLE KEYS */;
/*!40000 ALTER TABLE `qms_folder_group_grants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qms_folder_invites`
--

DROP TABLE IF EXISTS `qms_folder_invites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qms_folder_invites` (
  `invite_id` int NOT NULL AUTO_INCREMENT,
  `folder_id` int DEFAULT NULL,
  `invited_email` varchar(155) NOT NULL,
  `access_role` enum('admin','member','editor','viewer','auditor') NOT NULL DEFAULT 'viewer',
  `invite_token` varchar(64) NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_by` varchar(155) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL,
  `accepted_at` datetime DEFAULT NULL,
  `accepted_by` varchar(155) NOT NULL DEFAULT '',
  `revoked` tinyint(1) NOT NULL DEFAULT '0',
  `category_menu` varchar(50) NOT NULL DEFAULT '',
  `category_submenu` varchar(50) NOT NULL DEFAULT '',
  `department` varchar(80) NOT NULL DEFAULT '',
  `visibility` enum('private','public') NOT NULL DEFAULT 'private',
  PRIMARY KEY (`invite_id`),
  UNIQUE KEY `uniq_folder_invite_token` (`invite_token`),
  KEY `idx_folder_invite_folder` (`folder_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qms_folder_invites`
--

LOCK TABLES `qms_folder_invites` WRITE;
/*!40000 ALTER TABLE `qms_folder_invites` DISABLE KEYS */;
INSERT INTO `qms_folder_invites` VALUES (1,10,'qms.viewer@metricsnumero.com','viewer','5024f14a5df8ba095695f1479231712b',NULL,'qms.editor@metricsnumero.com','2026-10-09 06:09:15','2026-10-09 06:09:20','qms.viewer@metricsnumero.com',0,'','','','private'),(2,10,'qms.auditor@metricsnumero.com','viewer','a7f5df2c427a01f2f9f48fbf5c7c48e1',NULL,'qms.editor@metricsnumero.com','2026-10-09 06:10:28',NULL,'',0,'','','','private'),(3,1,'balachandra.mohan@metricsnumero.com','member','ce5d3539c46803291be4a240a0d9bb85',NULL,'qms.admin@metricsnumero.com','2026-10-10 12:06:03',NULL,'',0,'Charter','','All','public');
/*!40000 ALTER TABLE `qms_folder_invites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qms_folder_links`
--

DROP TABLE IF EXISTS `qms_folder_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qms_folder_links` (
  `link_id` int NOT NULL AUTO_INCREMENT,
  `folder_id` int NOT NULL,
  `share_token` varchar(64) NOT NULL,
  `access_role` enum('viewer','auditor','editor') NOT NULL DEFAULT 'viewer',
  `password_hash` varchar(255) NOT NULL DEFAULT '',
  `expires_at` datetime DEFAULT NULL,
  `created_by` varchar(155) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL,
  `revoked` tinyint(1) NOT NULL DEFAULT '0',
  `last_used_at` datetime DEFAULT NULL,
  PRIMARY KEY (`link_id`),
  UNIQUE KEY `uniq_folder_link_token` (`share_token`),
  KEY `idx_folder_link_folder` (`folder_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qms_folder_links`
--

LOCK TABLES `qms_folder_links` WRITE;
/*!40000 ALTER TABLE `qms_folder_links` DISABLE KEYS */;
/*!40000 ALTER TABLE `qms_folder_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qms_folder_permissions`
--

DROP TABLE IF EXISTS `qms_folder_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qms_folder_permissions` (
  `perm_id` int NOT NULL AUTO_INCREMENT,
  `folder_id` int NOT NULL,
  `user_email` varchar(155) NOT NULL,
  `access_role` enum('owner','editor','viewer','auditor') NOT NULL DEFAULT 'viewer',
  `granted_by` varchar(155) NOT NULL,
  `granted_at` datetime NOT NULL,
  PRIMARY KEY (`perm_id`),
  UNIQUE KEY `uniq_folder_user` (`folder_id`,`user_email`),
  KEY `idx_folder_perm_user` (`user_email`)
) ENGINE=InnoDB AUTO_INCREMENT=901 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qms_folder_permissions`
--

LOCK TABLES `qms_folder_permissions` WRITE;
/*!40000 ALTER TABLE `qms_folder_permissions` DISABLE KEYS */;
INSERT INTO `qms_folder_permissions` VALUES (1,1,'antsuser','owner','antsuser','2026-09-24 11:19:56'),(2,1,'aishwary.m@alpha-numero.com','editor','antsuser','2026-09-24 11:20:22'),(3,2,'antsuser','owner','antsuser','2026-09-24 11:20:24'),(4,3,'aishwary.m@alpha-numero.com','owner','aishwary.m@alpha-numero.com','2026-09-24 11:29:57'),(5,4,'aishwary.m@alpha-numero.com','owner','aishwary.m@alpha-numero.com','2026-09-24 11:42:23'),(6,5,'mohan2mba23@gmail.com','owner','mohan2mba23@gmail.com','2026-09-24 11:46:01'),(7,6,'mohan2mba23@gmail.com','owner','mohan2mba23@gmail.com','2026-09-25 17:29:34'),(8,7,'mohan2mba23@gmail.com','owner','mohan2mba23@gmail.com','2026-09-25 17:44:42'),(9,8,'mohan2mba23@gmail.com','owner','mohan2mba23@gmail.com','2026-09-25 18:46:29'),(10,9,'mohan2mba23@gmail.com','owner','mohan2mba23@gmail.com','2026-09-25 19:23:56'),(11,10,'mohan2mba23@gmail.com','owner','mohan2mba23@gmail.com','2026-09-25 19:53:34'),(12,7,'aishwary.m@alpha-numero.com','viewer','mohan2mba23@gmail.com','2026-10-06 11:52:49'),(13,11,'mohan2mba23@gmail.com','owner','mohan2mba23@gmail.com','2026-10-06 11:54:11'),(14,6,'qms.editor@metricsnumero.com','editor','system','2026-10-11 09:26:03'),(15,7,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(16,10,'qms.editor@metricsnumero.com','editor','system','2026-10-11 09:26:03'),(17,11,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(18,1,'qms.editor@metricsnumero.com','editor','system','2026-10-11 09:26:03'),(19,2,'qms.editor@metricsnumero.com','editor','system','2026-10-11 09:26:03'),(20,3,'qms.editor@metricsnumero.com','editor','system','2026-10-11 09:26:03'),(21,4,'qms.editor@metricsnumero.com','editor','system','2026-10-11 09:26:03'),(22,5,'qms.editor@metricsnumero.com','editor','system','2026-10-11 09:26:03'),(23,9,'qms.editor@metricsnumero.com','editor','system','2026-10-11 09:26:03'),(24,8,'qms.editor@metricsnumero.com','editor','system','2026-10-11 09:26:03'),(29,6,'qms.viewer@metricsnumero.com','viewer','system','2026-10-11 09:26:03'),(30,7,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(31,10,'qms.viewer@metricsnumero.com','viewer','system','2026-10-11 09:26:03'),(32,11,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(33,1,'qms.viewer@metricsnumero.com','viewer','system','2026-10-11 09:26:03'),(34,2,'qms.viewer@metricsnumero.com','viewer','system','2026-10-11 09:26:03'),(35,3,'qms.viewer@metricsnumero.com','viewer','system','2026-10-11 09:26:03'),(36,4,'qms.viewer@metricsnumero.com','viewer','system','2026-10-11 09:26:03'),(37,5,'qms.viewer@metricsnumero.com','viewer','system','2026-10-11 09:26:03'),(38,9,'qms.viewer@metricsnumero.com','viewer','system','2026-10-11 09:26:03'),(39,8,'qms.viewer@metricsnumero.com','viewer','system','2026-10-11 09:26:03'),(44,6,'qms.auditor@metricsnumero.com','auditor','system','2026-10-11 09:26:03'),(45,7,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(46,10,'qms.auditor@metricsnumero.com','auditor','system','2026-10-11 09:26:03'),(47,11,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(48,1,'qms.auditor@metricsnumero.com','auditor','system','2026-10-11 09:26:03'),(49,2,'qms.auditor@metricsnumero.com','auditor','system','2026-10-11 09:26:03'),(50,3,'qms.auditor@metricsnumero.com','auditor','system','2026-10-11 09:26:03'),(51,4,'qms.auditor@metricsnumero.com','auditor','system','2026-10-11 09:26:03'),(52,5,'qms.auditor@metricsnumero.com','auditor','system','2026-10-11 09:26:03'),(53,9,'qms.auditor@metricsnumero.com','auditor','system','2026-10-11 09:26:03'),(54,8,'qms.auditor@metricsnumero.com','auditor','system','2026-10-11 09:26:03'),(80,6,'qms.editor@alpha-numero.com','editor','system','2026-10-08 11:33:32'),(81,7,'qms.editor@alpha-numero.com','editor','system','2026-10-08 11:33:32'),(82,10,'qms.editor@alpha-numero.com','editor','system','2026-10-08 11:33:32'),(83,11,'qms.editor@alpha-numero.com','editor','system','2026-10-08 11:33:32'),(84,1,'qms.editor@alpha-numero.com','editor','system','2026-10-08 11:33:32'),(85,2,'qms.editor@alpha-numero.com','editor','system','2026-10-08 11:33:32'),(86,3,'qms.editor@alpha-numero.com','editor','system','2026-10-08 11:33:32'),(87,4,'qms.editor@alpha-numero.com','editor','system','2026-10-08 11:33:32'),(88,5,'qms.editor@alpha-numero.com','editor','system','2026-10-08 11:33:32'),(89,9,'qms.editor@alpha-numero.com','editor','system','2026-10-08 11:33:32'),(90,8,'qms.editor@alpha-numero.com','editor','system','2026-10-08 11:33:32'),(95,6,'qms.viewer@alpha-numero.com','viewer','system','2026-10-08 11:33:32'),(96,7,'qms.viewer@alpha-numero.com','viewer','system','2026-10-08 11:33:32'),(97,10,'qms.viewer@alpha-numero.com','viewer','system','2026-10-08 11:33:32'),(98,11,'qms.viewer@alpha-numero.com','viewer','system','2026-10-08 11:33:32'),(99,1,'qms.viewer@alpha-numero.com','viewer','system','2026-10-08 11:33:32'),(100,2,'qms.viewer@alpha-numero.com','viewer','system','2026-10-08 11:33:32'),(101,3,'qms.viewer@alpha-numero.com','viewer','system','2026-10-08 11:33:32'),(102,4,'qms.viewer@alpha-numero.com','viewer','system','2026-10-08 11:33:32'),(103,5,'qms.viewer@alpha-numero.com','viewer','system','2026-10-08 11:33:32'),(104,9,'qms.viewer@alpha-numero.com','viewer','system','2026-10-08 11:33:32'),(105,8,'qms.viewer@alpha-numero.com','viewer','system','2026-10-08 11:33:32'),(110,6,'qms.auditor@alpha-numero.com','auditor','system','2026-10-08 11:33:32'),(111,7,'qms.auditor@alpha-numero.com','auditor','system','2026-10-08 11:33:32'),(112,10,'qms.auditor@alpha-numero.com','auditor','system','2026-10-08 11:33:32'),(113,11,'qms.auditor@alpha-numero.com','auditor','system','2026-10-08 11:33:32'),(114,1,'qms.auditor@alpha-numero.com','auditor','system','2026-10-08 11:33:32'),(115,2,'qms.auditor@alpha-numero.com','auditor','system','2026-10-08 11:33:32'),(116,3,'qms.auditor@alpha-numero.com','auditor','system','2026-10-08 11:33:32'),(117,4,'qms.auditor@alpha-numero.com','auditor','system','2026-10-08 11:33:32'),(118,5,'qms.auditor@alpha-numero.com','auditor','system','2026-10-08 11:33:32'),(119,9,'qms.auditor@alpha-numero.com','auditor','system','2026-10-08 11:33:32'),(120,8,'qms.auditor@alpha-numero.com','auditor','system','2026-10-08 11:33:32'),(332,17,'qms.editor@metricsnumero.com','editor','system','2026-10-11 09:08:44'),(333,16,'qms.editor@metricsnumero.com','editor','system','2026-10-11 09:08:44'),(335,17,'qms.viewer@metricsnumero.com','viewer','system','2026-10-11 09:08:44'),(336,16,'qms.viewer@metricsnumero.com','viewer','system','2026-10-11 09:08:44'),(338,17,'qms.auditor@metricsnumero.com','auditor','system','2026-10-11 09:08:44'),(339,16,'qms.auditor@metricsnumero.com','auditor','system','2026-10-11 09:08:44'),(344,18,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:27:26'),(345,18,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(346,18,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(347,18,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(348,19,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:33:38'),(349,20,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:33:38'),(350,21,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:33:38'),(351,22,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:33:38'),(352,23,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:33:38'),(353,24,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:33:38'),(354,25,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:33:38'),(355,26,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:33:38'),(356,27,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:33:38'),(357,19,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(358,20,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(359,21,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(360,22,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(361,23,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(362,24,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(363,25,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(364,26,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(365,27,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(372,19,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(373,20,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(374,21,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(375,22,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(376,23,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(377,24,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(378,25,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(379,26,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(380,27,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(387,19,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(388,20,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(389,21,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(390,22,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(391,23,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(392,24,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(393,25,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(394,26,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(395,27,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(402,28,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(403,29,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(404,30,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(405,31,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(406,32,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(407,33,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(408,34,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(409,35,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(410,36,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(411,37,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(412,38,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(413,39,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(414,40,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(415,41,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(416,42,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(417,43,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(418,44,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(419,45,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(420,46,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(421,47,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(422,48,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(423,49,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(424,50,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(425,51,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(426,52,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(427,53,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(428,54,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(429,55,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(430,56,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(431,57,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(432,58,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(433,59,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(434,60,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(435,61,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(436,62,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(437,63,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(438,64,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(439,65,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(440,66,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(441,67,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(442,68,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(443,69,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(444,70,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(445,71,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(446,72,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(447,73,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(448,74,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(449,75,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(450,76,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(451,77,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(452,78,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(453,79,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(454,80,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(455,81,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(456,82,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(457,83,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(458,84,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(459,85,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(460,86,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(461,87,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(462,88,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(463,89,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(464,90,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 09:41:46'),(465,28,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(466,29,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(467,30,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(468,31,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(469,32,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(470,33,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(471,34,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(472,35,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(473,36,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(474,37,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(475,38,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(476,39,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(477,40,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(478,41,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(479,42,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(480,43,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(481,44,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(482,45,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(483,46,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(484,47,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(485,48,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(486,49,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(487,50,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(488,51,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(489,52,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(490,53,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(491,54,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(492,55,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(493,56,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(494,57,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(495,58,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(496,59,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(497,60,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(498,61,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(499,62,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(500,63,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(501,64,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(502,65,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(503,66,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(504,67,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(505,68,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(506,69,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(507,70,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(508,71,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(509,72,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(510,73,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(511,74,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(512,75,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(513,76,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(514,77,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(515,78,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(516,79,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(517,80,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(518,81,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(519,82,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(520,83,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(521,84,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(522,85,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(523,86,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(524,87,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(525,88,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(526,89,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(527,90,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(528,28,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(529,29,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(530,30,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(531,31,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(532,32,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(533,33,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(534,34,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(535,35,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(536,36,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(537,37,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(538,38,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(539,39,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(540,40,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(541,41,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(542,42,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(543,43,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(544,44,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(545,45,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(546,46,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(547,47,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(548,48,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(549,49,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(550,50,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(551,51,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(552,52,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(553,53,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(554,54,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(555,55,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(556,56,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(557,57,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(558,58,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(559,59,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(560,60,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(561,61,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(562,62,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(563,63,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(564,64,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(565,65,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(566,66,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(567,67,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(568,68,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(569,69,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(570,70,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(571,71,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(572,72,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(573,73,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(574,74,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(575,75,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(576,76,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(577,77,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(578,78,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(579,79,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(580,80,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(581,81,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(582,82,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(583,83,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(584,84,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(585,85,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(586,86,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(587,87,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(588,88,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(589,89,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(590,90,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(591,28,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(592,29,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(593,30,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(594,31,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(595,32,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(596,33,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(597,34,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(598,35,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(599,36,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(600,37,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(601,38,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(602,39,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(603,40,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(604,41,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(605,42,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(606,43,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(607,44,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(608,45,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(609,46,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(610,47,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(611,48,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(612,49,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(613,50,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(614,51,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(615,52,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(616,53,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(617,54,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(618,55,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(619,56,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(620,57,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(621,58,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(622,59,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(623,60,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(624,61,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(625,62,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(626,63,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(627,64,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(628,65,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(629,66,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(630,67,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(631,68,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(632,69,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(633,70,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(634,71,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(635,72,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(636,73,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(637,74,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(638,75,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(639,76,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(640,77,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(641,78,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(642,79,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(643,80,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(644,81,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(645,82,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(646,83,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(647,84,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(648,85,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(649,86,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(650,87,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(651,88,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(652,89,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(653,90,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(675,91,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 10:14:54'),(676,92,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 10:14:54'),(677,93,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 10:14:54'),(678,94,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 10:14:54'),(679,95,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 10:14:54'),(680,96,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 10:14:54'),(681,97,'qms.admin@metricsnumero.com','owner','qms.admin@metricsnumero.com','2026-10-11 10:14:54'),(682,91,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(683,92,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(684,93,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(685,94,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(686,95,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(687,96,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(688,97,'qms.editor@metricsnumero.com','editor','system','2026-11-20 10:46:40'),(689,91,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(690,92,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(691,93,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(692,94,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(693,95,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(694,96,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(695,97,'qms.viewer@metricsnumero.com','viewer','system','2026-11-20 10:46:40'),(696,91,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(697,92,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(698,93,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(699,94,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(700,95,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(701,96,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40'),(702,97,'qms.auditor@metricsnumero.com','auditor','system','2026-11-20 10:46:40');
/*!40000 ALTER TABLE `qms_folder_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qms_folder_shares`
--

DROP TABLE IF EXISTS `qms_folder_shares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qms_folder_shares` (
  `share_id` int NOT NULL AUTO_INCREMENT,
  `folder_id` int NOT NULL,
  `shared_with` varchar(155) NOT NULL,
  `access_role` enum('editor','viewer','auditor') NOT NULL DEFAULT 'viewer',
  `share_token` varchar(64) NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_by` varchar(155) NOT NULL,
  `created_at` datetime NOT NULL,
  `revoked` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`share_id`),
  KEY `idx_folder_share_folder` (`folder_id`),
  KEY `idx_folder_share_user` (`shared_with`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qms_folder_shares`
--

LOCK TABLES `qms_folder_shares` WRITE;
/*!40000 ALTER TABLE `qms_folder_shares` DISABLE KEYS */;
INSERT INTO `qms_folder_shares` VALUES (1,1,'haresh.p@alpha-numero.com','viewer','c65b6de3c99cbc4b1878ab264bb1736b',NULL,'antsuser','2026-09-24 11:20:23',0);
/*!40000 ALTER TABLE `qms_folder_shares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qms_folders`
--

DROP TABLE IF EXISTS `qms_folders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qms_folders` (
  `folder_id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int DEFAULT NULL,
  `folder_name` varchar(150) NOT NULL,
  `description` varchar(500) DEFAULT '',
  `category_menu` varchar(50) NOT NULL,
  `category_submenu` varchar(50) NOT NULL,
  `visibility` enum('private','restricted','shared','public') NOT NULL DEFAULT 'restricted',
  `lifecycle_status` enum('draft','active','under_review','approved','archived','obsolete') NOT NULL DEFAULT 'draft',
  `owner` varchar(155) NOT NULL,
  `inherit_permissions` tinyint(1) NOT NULL DEFAULT '1',
  `review_date` date DEFAULT NULL,
  `retain_until` date DEFAULT NULL,
  `tags` varchar(255) DEFAULT '',
  `created_by` varchar(155) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `recert_interval_days` int NOT NULL DEFAULT '90',
  `recert_due` date DEFAULT NULL,
  `last_recert_at` datetime DEFAULT NULL,
  `last_recert_by` varchar(155) NOT NULL DEFAULT '',
  PRIMARY KEY (`folder_id`),
  KEY `idx_qms_folders_category` (`category_menu`,`category_submenu`,`status`),
  KEY `idx_qms_folders_parent` (`parent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qms_folders`
--

LOCK TABLES `qms_folders` WRITE;
/*!40000 ALTER TABLE `qms_folders` DISABLE KEYS */;
INSERT INTO `qms_folders` VALUES (1,NULL,'QA Policies test','Controlled policy folder','Charter','Admin','restricted','approved','antsuser',1,NULL,NULL,'policy,qa','antsuser','2026-09-24 11:19:56','2026-10-11 09:26:22',1,90,NULL,NULL,''),(2,1,'SOPs','','Charter','Admin','restricted','draft','antsuser',1,NULL,NULL,'','antsuser','2026-09-24 11:20:24','2026-10-11 09:26:22',1,90,NULL,NULL,''),(3,1,'Work Instructions','UI test folder','Charter','Admin','restricted','active','aishwary.m@alpha-numero.com',1,NULL,NULL,'test','aishwary.m@alpha-numero.com','2026-09-24 11:29:57','2026-10-11 09:26:22',1,90,NULL,NULL,''),(4,1,'Records','Controlled records','Charter','Admin','restricted','draft','aishwary.m@alpha-numero.com',1,NULL,NULL,'records','aishwary.m@alpha-numero.com','2026-09-24 11:42:23','2026-10-11 09:26:22',1,90,NULL,NULL,''),(5,NULL,'testing','testing creating new folder','Charter','Admin','public','draft','mohan2mba23@gmail.com',1,'2026-09-24','2026-09-30','','mohan2mba23@gmail.com','2026-09-24 11:46:01','2026-10-11 09:26:22',1,90,NULL,NULL,''),(6,NULL,'policies','','','','restricted','draft','mohan2mba23@gmail.com',1,NULL,NULL,'','mohan2mba23@gmail.com','2026-09-25 17:29:34','2026-10-11 09:26:38',1,90,NULL,NULL,''),(7,NULL,'test','','','','restricted','draft','mohan2mba23@gmail.com',1,NULL,NULL,'','mohan2mba23@gmail.com','2026-09-25 17:44:42','2026-09-25 17:44:42',0,90,NULL,NULL,''),(8,NULL,'test folder','','Checklist','Admin','restricted','draft','mohan2mba23@gmail.com',1,NULL,NULL,'','mohan2mba23@gmail.com','2026-09-25 18:46:29','2026-10-11 09:26:30',1,90,NULL,NULL,''),(9,1,'test','','Charter','Admin','restricted','draft','mohan2mba23@gmail.com',1,NULL,NULL,'','mohan2mba23@gmail.com','2026-09-25 19:23:56','2026-10-11 09:26:22',1,90,NULL,NULL,''),(10,6,'test','','','','restricted','draft','mohan2mba23@gmail.com',1,NULL,NULL,'','mohan2mba23@gmail.com','2026-09-25 19:53:34','2026-10-11 09:26:38',1,90,NULL,NULL,''),(11,NULL,'test-v1','','','','restricted','draft','mohan2mba23@gmail.com',1,NULL,NULL,'','mohan2mba23@gmail.com','2026-10-06 11:54:11','2026-10-06 11:54:11',0,90,'2027-01-04',NULL,''),(18,NULL,'Aviation','','','','restricted','draft','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:27:26','2026-10-11 09:27:26',0,90,'2027-01-09',NULL,''),(19,NULL,'Admin','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:33:38','2026-10-11 09:33:38',0,90,'2027-01-09',NULL,''),(20,NULL,'Bd','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:33:38','2026-10-11 09:33:38',0,90,'2027-01-09',NULL,''),(21,NULL,'Flow','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:33:38','2026-10-11 09:33:38',0,90,'2027-01-09',NULL,''),(22,NULL,'Global','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:33:38','2026-10-11 09:33:38',0,90,'2027-01-09',NULL,''),(23,NULL,'Hr','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:33:38','2026-10-11 09:33:38',0,90,'2027-01-09',NULL,''),(24,NULL,'It','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:33:38','2026-10-11 09:33:38',0,90,'2027-01-09',NULL,''),(25,NULL,'Purchase','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:33:38','2026-10-11 09:33:38',0,90,'2027-01-09',NULL,''),(26,NULL,'Qag','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:33:38','2026-10-11 09:33:38',0,90,'2027-01-09',NULL,''),(27,NULL,'VLSI','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:33:38','2026-10-11 09:33:38',0,90,'2027-01-09',NULL,''),(28,19,'Charter','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(29,19,'Checklist','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(30,19,'External','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(31,19,'Forms','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(32,19,'Guideline','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(33,19,'Manual','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(34,19,'Process','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(35,20,'Charter','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(36,20,'Checklist','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(37,20,'External','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(38,20,'Forms','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(39,20,'Guideline','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(40,20,'Manual','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(41,20,'Process','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(42,21,'Charter','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(43,21,'Checklist','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(44,21,'External','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(45,21,'Forms','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(46,21,'Guideline','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(47,21,'Manual','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(48,21,'Process','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(49,22,'Charter','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(50,22,'Checklist','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(51,22,'External','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(52,22,'Forms','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(53,22,'Guideline','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(54,22,'Manual','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(55,22,'Process','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(56,23,'Charter','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(57,23,'Checklist','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(58,23,'External','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(59,23,'Forms','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(60,23,'Guideline','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(61,23,'Manual','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(62,23,'Process','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(63,24,'Charter','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(64,24,'Checklist','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(65,24,'External','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(66,24,'Forms','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(67,24,'Guideline','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(68,24,'Manual','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(69,24,'Process','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(70,25,'Charter','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(71,25,'Checklist','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(72,25,'External','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(73,25,'Forms','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(74,25,'Guideline','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(75,25,'Manual','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(76,25,'Process','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(77,26,'Charter','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(78,26,'Checklist','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(79,26,'External','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(80,26,'Forms','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(81,26,'Guideline','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(82,26,'Manual','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(83,26,'Process','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(84,27,'Charter','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(85,27,'Checklist','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(86,27,'External','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(87,27,'Forms','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(88,27,'Guideline','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(89,27,'Manual','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(90,27,'Process','','','','public','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 09:41:46','2026-10-11 09:41:46',0,90,'2027-01-09',NULL,''),(91,18,'Charter','','','','restricted','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 10:14:54','2026-10-11 10:14:54',0,90,'2027-01-09',NULL,''),(92,18,'Checklist','','','','restricted','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 10:14:54','2026-10-11 10:14:54',0,90,'2027-01-09',NULL,''),(93,18,'External','','','','restricted','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 10:14:54','2026-10-11 10:14:54',0,90,'2027-01-09',NULL,''),(94,18,'Forms','','','','restricted','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 10:14:54','2026-10-11 10:14:54',0,90,'2027-01-09',NULL,''),(95,18,'Guideline','','','','restricted','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 10:14:54','2026-10-11 10:14:54',0,90,'2027-01-09',NULL,''),(96,18,'Manual','','','','restricted','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 10:14:54','2026-10-11 10:14:54',0,90,'2027-01-09',NULL,''),(97,18,'Process','','','','restricted','active','qms.admin@metricsnumero.com',1,NULL,NULL,'','qms.admin@metricsnumero.com','2026-10-11 10:14:54','2026-10-11 10:14:54',0,90,'2027-01-09',NULL,'');
/*!40000 ALTER TABLE `qms_folders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qms_password_resets`
--

DROP TABLE IF EXISTS `qms_password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qms_password_resets` (
  `reset_id` int NOT NULL AUTO_INCREMENT,
  `emp_email` varchar(155) NOT NULL,
  `reset_token` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`reset_id`),
  UNIQUE KEY `uniq_reset_token` (`reset_token`),
  KEY `idx_reset_email` (`emp_email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qms_password_resets`
--

LOCK TABLES `qms_password_resets` WRITE;
/*!40000 ALTER TABLE `qms_password_resets` DISABLE KEYS */;
INSERT INTO `qms_password_resets` VALUES (2,'balachandra.mohan@metricsnumero.com','0cb46f582187db0cc66c384e89989e2cf1f39ab46424aa096bbfe2cacbf14d57','2026-10-10 17:50:45','2026-10-10 16:51:35','2026-10-10 16:50:45');
/*!40000 ALTER TABLE `qms_password_resets` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-23  9:14:11
