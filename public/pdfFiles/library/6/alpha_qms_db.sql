-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 28, 2024 at 10:53 AM
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
('mohan.b@alpha-numero', 2, 'MN _FRM_HR_ExitInterview_GNRL.docx', 1, '2024-03-20 18:32:11'),
('mohan.b@alpha-numero', 1, 'HR.docx', 1, '2024-03-20 18:32:10'),
('mohan.b@alpha-numero', 1, 'HR.docx', 0, '2024-03-28 11:44:31'),
('mohan.b@alpha-numero', 2, 'MN _FRM_HR_ExitInterview_GNRL.docx', 0, '2024-03-14 14:38:25');

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
(1, 'HR.docx', 'HR', 'HR.docx', 'kiran', '2024-03-13', '2024-03-13', '2024-03-13', '1.00', 0, '', '1.00', 'test', '2024-03-13'),
(2, 'MN _FRM_HR_ExitInter', 'HR', 'MN _FRM_HR_ExitInterview_GNRL.docx', 'kiran', '2024-03-13', '2024-03-13', '2024-03-13', '1.00', 0, '', '1.00', 'MN FRM HR ExitInterview GNRL', '2024-03-13');

-- --------------------------------------------------------

--
-- Table structure for table `login`
--

CREATE TABLE `login` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(155) DEFAULT NULL,
  `last_name` varchar(155) NOT NULL,
  `username` varchar(20) NOT NULL,
  `emp_email` varchar(155) NOT NULL,
  `pswd` varchar(25) NOT NULL,
  `user_role` int(10) NOT NULL COMMENT '0-users,1-manager,2-admin',
  `department` varchar(155) NOT NULL,
  `reporting_manager` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `login`
--

INSERT INTO `login` (`user_id`, `first_name`, `last_name`, `username`, `emp_email`, `pswd`, `user_role`, `department`, `reporting_manager`) VALUES
(1, 'balachandra', 'mohan', 'balachandra mohan', 'balachandra.mohan@metricsnumero.com', 'mn2024', 2, '', ''),
(2, 'shyam', 'sah', 'shyam sah', 'shyam.sah@metricsnumero.com', 'shyam2024', 2, '', ''),
(3, 'undefined', 'undefined', 'test', 'test@metricsnumero.com', 'Metrics@2024', 0, '2', ''),
(4, 'undefined', 'undefined', 'mohan', 'mohan@metricsnumero.com', 'Metrics@2024', 2, '3', ''),
(5, 'undefined', 'undefined', 'vikas', 'vikas@metricsnumero.com', 'Metrics@2024', 1, '1', 'undefined'),
(6, 'undefined', 'undefined', 'user1', 'user1@metricsnumero.com', 'Metrics@2024', 0, '3', 'undefined'),
(7, 'undefined', 'undefined', 'user2', 'user2@metricsnumero.com', 'Metrics@2024', 0, '2', 'undefined'),
(8, 'undefined', 'undefined', 'test', 'test1@metricsnumero.com', 'Metrics@2024', 0, '2', 'undefined'),
(9, 'undefined', 'undefined', 'user5', 'user5@metricsnumero.com', 'Metrics@2024', 0, '4', 'undefined'),
(10, 'undefined', 'undefined', 'sachin tendlukar', 'sachin@metricsnumero.com', 'Metrics@2024', 0, '5', 'undefined'),
(11, 'undefined', 'undefined', 'user6', 'user6@metricsnumero.com', 'Metrics@2024', 0, '2', 'undefined'),
(12, 'undefined', 'undefined', 'robin uthappa', 'robin@metricsnumero.com', 'Metrics@2024', 0, '1', 'undefined'),
(13, 'undefined', 'undefined', 'sourav ganguly', 'sourav@metricsnumero.com', 'Metrics@2024', 0, '2', 'undefined'),
(14, 'undefined', 'undefined', 'mahendar singh dhoni', 'dhoni@metricsnumero.com', 'Metrics@2024', 0, '2', 'undefined'),
(15, 'undefined', 'undefined', 'sakthi', 'sakthi@metricsnumero.com', 'Metrics@2024', 0, '1', 'undefined'),
(16, 'undefined', 'undefined', 'vikas', 'vikas@metricsnumero.com', 'Metrics@2024', 0, '4', 'undefined'),
(17, 'undefined', 'undefined', 'testing', 'testing@metricsnumero.com', 'Metrics@2024', 0, '4', 'undefined'),
(18, 'undefined', 'undefined', 'bala', 'bala@metricsnumero.com', 'Metrics@2024', 0, '3', 'undefined'),
(19, 'undefined', 'undefined', 'chandru', 'chandru@metricsnumero.com', 'Metrics@2024', 0, '1', 'undefined'),
(20, 'undefined', 'undefined', 'madhu', 'madhu@metricsnumero.com', 'Metrics@2024', 0, '5', 'undefined');

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
(23, 'mohan.b@alpha-numero.com', 208),
(24, 'mohan.b@alpha-numero.com', 220);

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

-- --------------------------------------------------------

--
-- Table structure for table `version_control`
--

CREATE TABLE `version_control` (
  `version_id` int(10) NOT NULL,
  `doc_name` varchar(155) NOT NULL,
  `doc_path` varchar(155) NOT NULL,
  `doc_id` int(20) NOT NULL,
  `version` int(10) NOT NULL,
  `created_by` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_by` varchar(100) NOT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `version_control`
--

INSERT INTO `version_control` (`version_id`, `doc_name`, `doc_path`, `doc_id`, `version`, `created_by`, `created_at`, `updated_by`, `updated_at`) VALUES
(1, 'AN_TMP_GL_ChangeRequest.xlsx', 'Category 1/Bd', 215, 1, 'kiran', '2023-11-29 14:16:35', '', '2023-10-03 00:00:00'),
(2, 'AN_TMP_GL_DAR_Weighted.xlsx', 'Category 1/Bd', 216, 1, 'kiran', '2023-11-15 11:51:56', '', '2023-11-06 12:53:11'),
(3, 'AN_TMP_GL_EffortEstimation.xlsx', 'Category 1/Bd', 217, 1, 'kiran', '2023-01-16 11:52:05', '', '2023-06-13 12:53:26'),
(4, '1701255724969-AN_TMP_GL_ChangeRequest.xlsx', 'Category 1/Bd', 215, 1, '', '2023-07-26 11:52:05', 'Kiran', '2023-06-06 00:00:00'),
(5, '1701255904721-AN_TMP_GL_DAR_Weighted.xlsx', 'Category 1/Bd', 215, 1, '', NULL, 'Kiran', '2023-01-24 00:00:00'),
(6, 'AN_TMP_GL_CustomerComplaint.xlsx', 'Category 1/Bd', 218, 1, 'kiran', '0000-00-00 00:00:00', '', '2023-01-10 00:00:00'),
(7, 'AN_TMP_GL_Excel.xlsx', 'Category 1/Bd', 219, 1, 'kiran', '2023-11-30 12:32:41', '', '2022-01-10 00:00:00'),
(8, 'ImportUserTemplate.xlsx', 'Category 1/Admin', 220, 1, 'kiran', '2024-02-20 03:19:50', '', NULL),
(9, '1708422615143-QMS_Release_note (7).docx', 'Category 1/Admin', 220, 1, '', NULL, 'Kiran', '2024-02-20 03:20:15'),
(10, 'js-cheatsheet8.pdf', 'Category 1/Admin', 221, 1, 'kiran', '2024-02-20 03:21:58', '', NULL),
(11, '1708422752033-Two.pdf', 'Category 1/Admin', 221, 1, '', NULL, 'Kiran', '2024-02-20 03:22:32'),
(12, 'Admin Infrastructure.docx', 'HR', 224, 1, 'kiran', '2024-03-13 05:17:24', '', NULL),
(13, 'HR.docx', 'HR', 1, 1, 'kiran', '2024-03-13 05:59:30', '', NULL),
(14, 'MN _FRM_HR_ExitInterview_GNRL.docx', 'HR', 2, 1, 'kiran', '2024-03-13 06:00:18', '', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `file_info`
--
ALTER TABLE `file_info`
  ADD PRIMARY KEY (`doc_num`);

--
-- Indexes for table `login`
--
ALTER TABLE `login`
  ADD PRIMARY KEY (`user_id`);

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
-- Indexes for table `version_control`
--
ALTER TABLE `version_control`
  ADD PRIMARY KEY (`version_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `file_info`
--
ALTER TABLE `file_info`
  MODIFY `doc_num` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `login`
--
ALTER TABLE `login`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `notify_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `user_log`
--
ALTER TABLE `user_log`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `version_control`
--
ALTER TABLE `version_control`
  MODIFY `version_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
