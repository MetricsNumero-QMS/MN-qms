-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 27, 2023 at 12:56 PM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 7.4.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `alpha_qms_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `ants_categories`
--

CREATE TABLE `ants_categories` (
  `category_name` varchar(20) NOT NULL,
  `user_role_access` int(10) NOT NULL,
  `empID` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `doc_log_info`
--

CREATE TABLE `doc_log_info` (
  `emp_id` varchar(20) NOT NULL,
  `doc_id` int(10) NOT NULL,
  `doc_name` varchar(255) NOT NULL,
  `doc_accessed_type` int(10) NOT NULL COMMENT '0-viewed,1-downloaded',
  `accessed_datetime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `doc_log_info`
--

INSERT INTO `doc_log_info` (`emp_id`, `doc_id`, `doc_name`, `doc_accessed_type`, `accessed_datetime`) VALUES
('mohan.b@alpha-numero', 21, 'AN_FRM_GL_ChangeRequestNote_GNRL.docx', 0, '2023-03-22 14:52:15'),
('mohan.b@alpha-numero', 22, 'AN_FRM_GL_KnowledgeSharing_GNRL.docx', 0, '2023-03-22 14:52:17'),
('mohan.b@alpha-numero', 23, 'AN_FRM_GL_ProcessRevisionRequest.xlsx', 0, '2023-03-22 14:52:19'),
('mohan.b@alpha-numero', 24, 'AN_FRM_GL_ProjectInitiation_GNRL.xlsx', 0, '2023-03-22 14:52:22'),
('mohan.b@alpha-numero', 52, 'Process Mapping.docx', 0, '2023-03-22 14:52:42'),
('mohan.b@alpha-numero', 53, 'Quality Objective.docx', 0, '2023-03-22 14:52:46'),
('mohan.b@alpha-numero', 50, 'AN_QMS_GL_Quality_Manual.docx', 0, '2023-03-22 14:52:48'),
('mohan.b@alpha-numero', 21, 'AN_FRM_GL_ChangeRequestNote_GNRL.docx', 1, '2023-03-22 14:53:02'),
('mohan.b@alpha-numero', 22, 'AN_FRM_GL_KnowledgeSharing_GNRL.docx', 1, '2023-03-22 14:53:02'),
('mohan.b@alpha-numero', 23, 'AN_FRM_GL_ProcessRevisionRequest.xlsx', 1, '2023-03-22 14:53:03'),
('mohan.b@alpha-numero', 174, 'AN_TMP_GL_ChangeRequest.xlsx', 1, '2023-03-22 15:13:45'),
('mohan.b@alpha-numero', 174, 'AN_TMP_GL_ChangeRequest.xlsx', 0, '2023-03-22 15:14:00'),
('mohan.b@alpha-numero', 1, 'AN_CHTR_GL_QA.docx', 0, '2023-10-26 18:32:42'),
('mohan.b@alpha-numero', 1, 'AN_CHTR_GL_QA.docx', 1, '2023-10-26 18:32:38'),
('mohan.b@alpha-numero', 58, 'AN_PRC_GL_ConfigurationManagement.docx', 0, '2023-03-27 14:47:12'),
('mohan.b@alpha-numero', 58, 'AN_PRC_GL_ConfigurationManagement.docx', 1, '2023-03-27 14:47:18'),
('mohan.b@alpha-numero', 57, 'AN_PRC_GL_ChangeManagement.docx', 0, '2023-03-27 14:47:27'),
('mohan.b@alpha-numero', 177, 'AN_TMP_GL_EffortEstimation.xlsx', 0, '2023-03-27 15:26:57'),
('mohan.b@alpha-numero', 189, 'AN_TMP_GL_Excel.xlsx', 0, '2023-03-29 12:33:48'),
('mohan.b@alpha-numero', 197, 'project use case.pptx', 0, '2023-03-31 12:50:51'),
('mohan.b@alpha-numero', 197, 'project use case.pptx', 1, '2023-03-31 12:50:58'),
('mohan.b@alpha-numero', 198, 'javascript_tutorial.pdf', 0, '2023-03-31 12:51:47'),
('mohan.b@alpha-numero', 199, 'PHP_Intermidiate.docx', 0, '2023-03-31 12:56:32'),
('mohan.b@alpha-numero', 199, 'PHP_Intermidiate.docx', 1, '2023-03-31 12:52:43'),
('mohan.b@alpha-numero', 200, 'aws_doc.docx', 0, '2023-04-03 10:38:57'),
('mohan.b@alpha-numero', 204, 'docker.docx', 0, '2023-03-31 15:04:33'),
('mohan.b@alpha-numero', 205, 'NDA - Balachandra Mohan.pdf', 0, '2023-03-31 15:11:27'),
('mohan.b@alpha-numero', 207, 'domain_name_local_project.docx', 0, '2023-03-31 17:04:35'),
('mohan.b@alpha-numero', 208, 'merging file in git.docx', 0, '2023-04-03 10:39:01'),
('mohan.b@alpha-numero', 208, 'merging file in git.docx', 1, '2023-10-26 18:34:07');

-- --------------------------------------------------------

--
-- Table structure for table `file_access`
--

CREATE TABLE `file_access` (
  `empID` int(10) NOT NULL,
  `user_role` int(10) NOT NULL,
  `idEdited` int(10) NOT NULL,
  `isRemoved` int(10) NOT NULL,
  `isUpdated` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `file_info`
--

CREATE TABLE `file_info` (
  `doc_num` int(10) NOT NULL,
  `doc_name` varchar(20) NOT NULL,
  `doc_path` varchar(20) NOT NULL,
  `doc` varchar(50) DEFAULT NULL,
  `created_by` varchar(50) NOT NULL,
  `created_at` date NOT NULL,
  `last_modified` date NOT NULL,
  `last_accessed` date NOT NULL,
  `version` decimal(3,2) NOT NULL,
  `status` int(5) NOT NULL,
  `doc_file` longblob NOT NULL,
  `docRelVer` decimal(3,2) NOT NULL,
  `docDesc` varchar(255) NOT NULL,
  `releaseDt` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `file_info`
--

INSERT INTO `file_info` (`doc_num`, `doc_name`, `doc_path`, `doc`, `created_by`, `created_at`, `last_modified`, `last_accessed`, `version`, `status`, `doc_file`, `docRelVer`, `docDesc`, `releaseDt`) VALUES
(1, 'AN_CHTR_GL_QA.docx', 'Charter/Admin', 'AN_CHTR_GL_QA.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.30', 0, '', '1.20', 'You could use a package for this. ', '2023-03-04'),
(2, 'AN CHK ADM Maintenan', 'Checklist/Admin', 'AN_CHK_ADM_Maintenance.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(3, 'AN CHK BD ProposalRe', 'Checklist/Bd', 'AN_CHK_BD_ProposalReview_GNRL.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(4, 'AN CHK BD SOWContrac', 'Checklist/Bd', 'AN_CHK_BD_SOWContract_GNRL.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(5, 'AN CHK GL IQAReport ', 'Checklist/Global', 'AN_CHK_GL_IQAReport_Admin.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(6, 'AN CHK GL IQAReport ', 'Checklist/Global', 'AN_CHK_GL_IQAReport_BD.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(7, 'AN CHK GL IQAReport ', 'Checklist/Global', 'AN_CHK_GL_IQAReport_HR.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(8, 'AN CHK GL IQAReport ', 'Checklist/Global', 'AN_CHK_GL_IQAReport_IT.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(9, 'AN CHK GL IQAReport ', 'Checklist/Global', 'AN_CHK_GL_IQAReport_Purchase.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(10, 'AN CHK GL IQAReport ', 'Checklist/Global', 'AN_CHK_GL_IQAReport_QAG_MR.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(11, 'AN CHK GL IQAReport ', 'Checklist/Global', 'AN_CHK_GL_IQAReport_TopManagement.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(12, 'AN CHK GL ProjectClo', 'Checklist/Global', 'AN_CHK_GL_ProjectClosure_GNRL.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(13, 'AN CHK GL ProjectPro', 'Checklist/Global', 'AN_CHK_GL_ProjectProcessPlan_GNRL.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(14, 'AN CHK GL QMSRelease', 'Checklist/Global', 'AN_CHK_GL_QMSRelease_GNRL.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(15, 'AN CHK HR EmployeeEx', 'Checklist/Hr', 'AN_CHK_HR_EmployeeExitChecklist_GNRL.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(16, 'AN CHK HR EmployeeOn', 'Checklist/Hr', 'AN_CHK_HR_EmployeeOnBoardingChecklist_GNRL.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(17, 'AN CHK IT EmployeeEx', 'Checklist/It', 'AN_CHK_IT_EmployeeExitChecklist_GNRL.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(18, 'AN CHK IT EmployeeOn', 'Checklist/It', 'AN_CHK_IT_EmployeeOnBoardingChecklist_GNRL.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(19, 'AN CHK VLSI IQARepor', 'Checklist/VLSI', 'AN_CHK_VLSI_IQAReport_VLSIAero_GNRL.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(20, 'AN CHK VLSI Verifica', 'Checklist/VLSI', 'AN_CHK_VLSI_VerificationCaseAndProcedure_GNRL.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(21, 'AN FRM GL ChangeRequ', 'Forms/Global', 'AN_FRM_GL_ChangeRequestNote_GNRL.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(22, 'AN FRM GL KnowledgeS', 'Forms/Global', 'AN_FRM_GL_KnowledgeSharing_GNRL.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(23, 'AN FRM GL ProcessRev', 'Forms/Global', 'AN_FRM_GL_ProcessRevisionRequest.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(24, 'AN FRM GL ProjectIni', 'Forms/Global', 'AN_FRM_GL_ProjectInitiation_GNRL.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(25, 'AN FRM HR EmployeeEx', 'Forms/Hr', 'AN_FRM_HR_EmployeeExitStatement_GNRL.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(26, 'AN FRM HR ExitInterv', 'Forms/Hr', 'AN_FRM_HR_ExitInterview_GNRL.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(27, 'AN FRM HR InterviewE', 'Forms/Hr', 'AN_FRM_HR_InterviewEvaluation_Non-Technical.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(28, 'AN FRM HR InterviewE', 'Forms/Hr', 'AN_FRM_HR_InterviewEvaluation_Technical.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(29, 'AN FRM HR Pre-Employ', 'Forms/Hr', 'AN_FRM_HR_Pre-EmploymentApplication.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(30, 'AN FRM HR ProbationP', 'Forms/Hr', 'AN_FRM_HR_ProbationPeriodPerformanceAssessment_GNR', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(31, 'AN FRM HR Requisitio', 'Forms/Hr', 'AN_FRM_HR_RequisitionForm.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(32, 'AN FRM HR TrainingAt', 'Forms/Hr', 'AN_FRM_HR_TrainingAttendanceSheet_GNRL.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(33, 'AN FRM HR TrainingFe', 'Forms/Hr', 'AN_FRM_HR_TrainingFeedbackForm_GNRL.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(34, 'AN FRM PUR VendorQue', 'Forms/Purchase', 'AN_FRM_PUR_VendorQuestionnaire_GNRL.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(35, 'AN FRM QA CustomerFe', 'Forms/Qag', 'AN_FRM_QA_CustomerFeedback.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(36, 'AN FRM QA QMSRelease', 'Forms/Qag', 'AN_FRM_QA_QMSReleaseNote_ReleaseVersion.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(37, 'AN GDL GL BusinessCo', 'Guideline/Global', 'AN_GDL_GL_BusinessContinuityPlan.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(38, 'AN GDL GL Casual Ana', 'Guideline/Global', 'AN_GDL_GL_Casual_Analysis.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(39, 'AN GDL GL DAR', 'Guideline/Global', 'AN_GDL_GL_DAR.pptx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(40, 'AN GDL GL Externally', 'Guideline/Global', 'AN_GDL_GL_ExternallyProvidedPropertyControl.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(41, 'AN GDL GL Growth Str', 'Guideline/Global', 'AN_GDL_GL_Growth Strategy.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(42, 'AN GDL GL QMSRelease', 'Guideline/Global', 'AN_GDL_GL_QMSRelease.pptx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(43, 'AN GDL GL TailoringA', 'Guideline/Global', 'AN_GDL_GL_TailoringAndWaiver.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(44, 'AN GDL GL TeamingAnd', 'Guideline/Global', 'AN_GDL_GL_TeamingAndCommunication.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(45, 'AN GDL IT Maintenanc', 'Guideline/It', 'AN_GDL_IT_Maintenance.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(46, 'AN GDL IT SLA', 'Guideline/It', 'AN_GDL_IT_SLA.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(47, 'AN GDL PUR PurchaseT', 'Guideline/Purchase', 'AN_GDL_PUR_PurchaseTandC.xlsx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(48, 'AN GDL VLSI MetricsA', 'Guideline/VLSI', 'AN_GDL_VLSI_MetricsAndMeasurement.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(49, 'AN GDL VLSI VLSICodi', 'Guideline/VLSI', 'AN_GDL_VLSI_VLSICodingStandards.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(50, 'AN QMS GL Quality Ma', 'Manual/Admin', 'AN_QMS_GL_Quality_Manual.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(51, 'Organization Chart', 'Manual/Admin', 'Organization Chart.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(52, 'Process Mapping', 'Manual/Admin', 'Process Mapping.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(53, 'Quality Objective', 'Manual/Admin', 'Quality Objective.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(54, 'Roles and Responsibi', 'Manual/Admin', 'Roles and Responsibilities.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(55, 'AN PRC ADM AdminInfr', 'Process/Admin', 'AN_PRC_ADM_AdminInfrastructure.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', 'test description', '0000-00-00'),
(56, 'AN PRC BD ProposalPr', 'Process/Bd', 'AN_PRC_BD_ProposalProcess.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '1.00', 'Although the package I found, require the file to be read from disk it seems and not from buffer', '0000-00-00'),
(57, 'AN PRC GL ChangeMana', 'Process/Global', 'AN_PRC_GL_ChangeManagement.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(58, 'AN PRC GL Configurat', 'Process/Global', 'AN_PRC_GL_ConfigurationManagement.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(59, 'AN PRC GL ControlOfW', 'Process/Global', 'AN_PRC_GL_ControlOfWorkTransfer.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(60, 'AN PRC GL Corrective', 'Process/Global', 'AN_PRC_GL_CorrectiveAction.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(61, 'AN PRC GL Counterfei', 'Process/Global', 'AN_PRC_GL_CounterfeitPrevention.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(62, 'AN PRC GL CustomerSa', 'Process/Global', 'AN_PRC_GL_CustomerSatisfactionAssessment.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(63, 'AN PRC GL DocumentAn', 'Process/Global', 'AN_PRC_GL_DocumentAndRecordControl.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(64, 'AN PRC GL Management', 'Process/Global', 'AN_PRC_GL_ManagementReview.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(65, 'AN PRC GL MetricsMea', 'Process/Global', 'AN_PRC_GL_MetricsMeasurement.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(66, 'AN PRC GL NonConform', 'Process/Global', 'AN_PRC_GL_NonConformingOutputControl.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(67, 'AN PRC GL ProjectMan', 'Process/Global', 'AN_PRC_GL_ProjectManagement.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(68, 'AN PRC GL QMSFormati', 'Process/Global', 'AN_PRC_GL_QMSFormationAndEnhancement.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(69, 'AN PRC GL QualityAss', 'Process/Global', 'AN_PRC_GL_QualityAssurance.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(70, 'AN PRC GL RiskManage', 'Process/Global', 'AN_PRC_GL_RiskManagement.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(71, 'AN PRC HR HumanResou', 'Process/Hr', 'AN_PRC_HR_HumanResource.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(72, 'AN PRC IT ITInfrastr', 'Process/It', 'AN_PRC_IT_ITInfrastructure.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(73, 'AN PRC PUR Purchase', 'Process/Purchase', 'AN_PRC_PUR_Purchase.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(74, 'AN PRC VLSI Verifica', 'Process/VLSI', 'AN_PRC_VLSI_VerificationProcessDefinition.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(75, 'Admin Infrastructure', 'Process/Flow', 'Admin Infrastructure.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(76, 'Change Management', 'Process/Flow', 'Change Management.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(77, 'Confuguration manage', 'Process/Flow', 'Confuguration management.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(78, 'Control of Work Tran', 'Process/Flow', 'Control of Work Transfer.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(79, 'Corrective Action Pr', 'Process/Flow', 'Corrective Action Process.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(80, 'Counterfeit Preventi', 'Process/Flow', 'Counterfeit Prevention.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(81, 'Customer Satisfactio', 'Process/Flow', 'Customer Satisfaction.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(82, 'Document & Control', 'Process/Flow', 'Document & Control.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(83, 'HR', 'Process/Flow', 'HR.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(84, 'IT Infrastructure', 'Process/Flow', 'IT Infrastructure.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(85, 'Management Review', 'Process/Flow', 'Management Review.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(86, 'Metrics Measurement', 'Process/Flow', 'Metrics Measurement.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(87, 'NonConforming Output', 'Process/Flow', 'NonConforming Output Control.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(88, 'Project Management', 'Process/Flow', 'Project Management.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(89, 'Proposal', 'Process/Flow', 'Proposal.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(90, 'Purchase', 'Process/Flow', 'Purchase.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(91, 'Quality Assurance', 'Process/Flow', 'Quality Assurance.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(92, 'Risk Management', 'Process/Flow', 'Risk Management.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(93, 'VLSI Aero Verificati', 'Process/Flow', 'VLSI Aero Verification.docx', '', '0000-00-00', '0000-00-00', '0000-00-00', '1.00', 0, '', '0.00', '', NULL),
(194, 'AN_TMP_GL_ChangeRequ', 'Charter/Admin', 'AN_TMP_GL_ChangeRequest.xlsx', 'kiran', '2023-03-30', '2023-03-30', '2023-03-30', '3.20', 1, '', '1.20', 'description', '2023-03-28'),
(195, 'AN_TMP_GL_CustomerCo', 'Charter/Admin', 'AN_TMP_GL_CustomerComplaint.xlsx', 'kiran', '2023-03-30', '2023-03-30', '2023-03-30', '2.40', 1, '', '3.20', '\r\ncomments needs to be added', '2023-03-20'),
(196, 'AN_TMP_GL_ChangeRequ', 'Charter/Bd', 'AN_TMP_GL_ChangeRequest.xlsx', 'kiran', '2023-03-30', '2023-03-30', '2023-03-30', '2.30', 0, '', '1.20', 'This files is for testing', '2023-03-27'),
(197, 'project use case.ppt', 'Charter/Admin', 'project use case.pptx', 'kiran', '2023-03-31', '2023-03-31', '2023-03-31', '3.20', 0, '', '2.20', 'pptx testing', '2023-03-29'),
(198, 'javascript_tutorial.', 'Charter/Admin', 'javascript_tutorial.pdf', 'kiran', '2023-03-31', '2023-03-31', '2023-03-31', '1.20', 0, '', '2.30', 'testing with pdf', '2023-03-22'),
(199, 'PHP_Intermidiate.doc', 'Charter/Admin', 'PHP_Intermidiate.docx', 'kiran', '2023-03-31', '2023-03-31', '2023-03-31', '3.20', 1, '', '2.10', 'testing with docx', '2023-03-27'),
(200, 'aws_doc.docx', 'Charter/Admin', 'aws_doc.docx', 'kiran', '2023-03-31', '2023-03-31', '2023-03-31', '2.10', 1, '', '1.20', 'testing', '2023-03-29'),
(201, 'aws_doc.docx', 'Charter/Bd', 'aws_doc.docx', 'kiran', '2023-03-31', '2023-03-31', '2023-03-31', '2.30', 0, '', '1.20', 'testing  async and await', '2023-03-28'),
(202, 'PHP_Intermidiate.doc', 'Charter/Bd', 'PHP_Intermidiate.docx', 'kiran', '2023-03-31', '2023-03-31', '2023-03-31', '2.20', 0, '', '1.20', 'sdsdsd', '2023-03-21'),
(203, 'aws_doc.docx', 'Charter/Bd', 'aws_doc.docx', 'kiran', '2023-03-31', '2023-03-31', '2023-03-31', '2.20', 0, '', '1.20', 'testing await ', '2023-03-28'),
(204, 'docker.docx', 'Charter/Admin', 'docker.docx', 'kiran', '2023-03-31', '2023-03-31', '2023-03-31', '4.20', 0, '', '1.20', 'testing document convertion', '2023-03-29'),
(205, 'NDA - Balachandra Mo', 'Charter/Admin', 'NDA - Balachandra Mohan.pdf', 'kiran', '2023-03-31', '2023-03-31', '2023-03-31', '3.10', 0, '', '2.10', 'testing upload file', '2023-03-28'),
(206, 'mongo installation.d', 'Charter/Admin', 'mongo installation.docx', 'kiran', '2023-03-31', '2023-03-31', '2023-03-31', '2.30', 1, '', '1.20', 'testing doc', '2023-03-15'),
(207, 'domain_name_local_pr', 'Charter/Admin', 'domain_name_local_project.docx', 'kiran', '2023-03-31', '2023-03-31', '2023-03-31', '2.30', 0, '', '1.10', 'comment description', '2023-03-07'),
(208, 'merging file in git.', 'Charter/Admin', 'merging file in git.docx', 'kiran', '2023-04-03', '2023-04-03', '2023-04-03', '3.30', 0, '', '2.20', 'final testing updating', '2023-04-03');

-- --------------------------------------------------------

--
-- Table structure for table `login`
--

CREATE TABLE `login` (
  `first_name` varchar(155) NOT NULL,
  `last_name` varchar(155) NOT NULL,
  `username` varchar(20) NOT NULL,
  `emp_email` varchar(155) NOT NULL,
  `pswd` varchar(25) NOT NULL,
  `user_role` int(10) NOT NULL COMMENT '0-users,1-admin',
  `reporting_manager` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `login`
--

INSERT INTO `login` (`first_name`, `last_name`, `username`, `emp_email`, `pswd`, `user_role`, `reporting_manager`) VALUES
('', '', 'balachandra mohan', 'mohan.b@alpha-numero.com', 'alpha2016', 1, ''),
('', '', 'Aishwary Mandal', 'aishwary.m@alpha-numero.com', 'alpha2016', 1, ''),
('', '', 'Penjani K', 'penjani.k@alpha-numero.com', 'alpha2016', 1, ''),
('', '', 'Shyam Sah', 'shyam.s@alpha-numero.com', 'alpha2016', 1, ''),
('', '', 'Mikul Shah', 'mikul.s@alpha-numero.com', 'alpha2016', 1, ''),
('', '', 'Mansi Naik', 'mansi.n@alpha-numero.com', 'alpha2016', 1, ''),
('', '', 'Hari Patel', 'haresh.p@alpha-numero.com', 'alpha2016', 0, ''),
('', '', 'Mit S', 'mit.s@alpha-numero.com', 'alpha2016', 0, ''),
('', '', 'Santhi A', 'santhi.a@alpha-numero.com', 'alpha2016', 0, ''),
('', '', 'dummy', 'antsuser', 'alpha2016', 1, ''),
('text', 'text', 'test', 'mohan2mba2311@gmail.com', 'alpha2016', 0, 'tesdeee'),
('balachandra', 'mohan', 'test', 'mohan2mba23@gmail.com', 'alpha2016', 0, 'test'),
('mohan', 'kumar', 'mohan kumar', 'mohan@gmail.com', '', 0, 'shyam'),
('ramesh', 'kumar', 'mohan kumar', 'ramesh@gmail.com', '', 0, 'shyam'),
('suresh', 'kumar', 'suresh kumar', 'suresh@gmail.com', '', 0, 'shyam'),
('ramesh', 'kumar', 'mohan kumar', 'ramesh@gmail.com', '', 0, 'shyam'),
('suresh', 'kumar', 'suresh kumar', 'suresh@gmail.com', '', 0, 'shyam'),
('ramesh', 'kumar', 'mohan kumar', 'ramesh@gmail.com', 'alpha2016', 0, 'shyam'),
('suresh', 'kumar', 'suresh kumar', 'suresh@gmail.com', 'alpha2016', 0, 'shyam'),
('prabu', 'deva', 'prabhu deva', 'brabhu@gmail.com', 'alpha2016', 0, 'shyam sha'),
('ragini', 'kanth', 'rajnikanth', 'ragini@gmail.com', 'alpha2016', 0, 'shyam sha');

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `notify_id` int(10) NOT NULL,
  `emp_id` varchar(55) NOT NULL,
  `doc_id` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `notification`
--

INSERT INTO `notification` (`notify_id`, `emp_id`, `doc_id`) VALUES
(1, 'mohan.b@alpha-numero.com', 157),
(2, 'mohan.b@alpha-numero.com', 158),
(3, 'mohan.b@alpha-numero.com', 160),
(4, 'mohan.b@alpha-numero.com', 160),
(5, 'mohan.b@alpha-numero.com', 161),
(6, 'aishwary.m@alpha-numero.com', 162),
(7, 'aishwary.m@alpha-numero.com', 163),
(8, 'mohan.b@alpha-numero.com', 170),
(9, 'mohan.b@alpha-numero.com', 171),
(10, 'mohan.b@alpha-numero.com', 1),
(11, 'mohan.b@alpha-numero.com', 171),
(12, 'mohan.b@alpha-numero.com', 1),
(13, 'mohan.b@alpha-numero.com', 174),
(14, 'mohan.b@alpha-numero.com', 174),
(15, 'mohan.b@alpha-numero.com', 176),
(16, 'mohan.b@alpha-numero.com', 189),
(17, 'mohan.b@alpha-numero.com', 194),
(18, 'mohan.b@alpha-numero.com', 195),
(19, 'mohan.b@alpha-numero.com', 1),
(20, 'mohan.b@alpha-numero.com', 196),
(21, 'mohan.b@alpha-numero.com', 1),
(22, 'mohan.b@alpha-numero.com', 199),
(23, 'mohan.b@alpha-numero.com', 208);

-- --------------------------------------------------------

--
-- Table structure for table `tool_access_info`
--

CREATE TABLE `tool_access_info` (
  `username` varchar(50) NOT NULL,
  `empID` int(10) NOT NULL,
  `user_role` int(10) NOT NULL,
  `log_date` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `user_info`
--

CREATE TABLE `user_info` (
  `username` varchar(10) DEFAULT NULL,
  `empID` int(10) DEFAULT NULL,
  `employee_name` varchar(50) DEFAULT NULL,
  `user_role` int(10) DEFAULT NULL,
  `department` varchar(20) DEFAULT NULL,
  `read_access` int(10) DEFAULT NULL,
  `rwr_access` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user_info`
--

INSERT INTO `user_info` (`username`, `empID`, `employee_name`, `user_role`, `department`, `read_access`, `rwr_access`) VALUES
(NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_log`
--

CREATE TABLE `user_log` (
  `id` int(10) NOT NULL,
  `username` varchar(100) NOT NULL,
  `date_time` datetime NOT NULL,
  `ipaddress` varchar(155) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `file_info`
--
ALTER TABLE `file_info`
  ADD PRIMARY KEY (`doc_num`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`notify_id`);

--
-- Indexes for table `user_log`
--
ALTER TABLE `user_log`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `file_info`
--
ALTER TABLE `file_info`
  MODIFY `doc_num` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=209;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `notify_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `user_log`
--
ALTER TABLE `user_log`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
