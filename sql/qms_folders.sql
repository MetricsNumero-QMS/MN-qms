-- QMS controlled folders: organization, permissions, sharing, lifecycle, audit

CREATE TABLE IF NOT EXISTS `qms_folders` (
  `folder_id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) DEFAULT NULL,
  `folder_name` varchar(150) NOT NULL,
  `description` varchar(500) DEFAULT '',
  `category_menu` varchar(50) NOT NULL,
  `category_submenu` varchar(50) NOT NULL,
  `visibility` enum('private','restricted','shared','public') NOT NULL DEFAULT 'restricted',
  `lifecycle_status` enum('draft','active','under_review','approved','archived','obsolete') NOT NULL DEFAULT 'draft',
  `owner` varchar(155) NOT NULL,
  `inherit_permissions` tinyint(1) NOT NULL DEFAULT 1,
  `review_date` date DEFAULT NULL,
  `retain_until` date DEFAULT NULL,
  `tags` varchar(255) DEFAULT '',
  `created_by` varchar(155) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0-active,1-deleted',
  PRIMARY KEY (`folder_id`),
  KEY `idx_qms_folders_category` (`category_menu`,`category_submenu`,`status`),
  KEY `idx_qms_folders_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `qms_folder_permissions` (
  `perm_id` int(11) NOT NULL AUTO_INCREMENT,
  `folder_id` int(11) NOT NULL,
  `user_email` varchar(155) NOT NULL,
  `access_role` enum('owner','editor','viewer','auditor') NOT NULL DEFAULT 'viewer',
  `granted_by` varchar(155) NOT NULL,
  `granted_at` datetime NOT NULL,
  PRIMARY KEY (`perm_id`),
  UNIQUE KEY `uniq_folder_user` (`folder_id`,`user_email`),
  KEY `idx_folder_perm_user` (`user_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `qms_folder_shares` (
  `share_id` int(11) NOT NULL AUTO_INCREMENT,
  `folder_id` int(11) NOT NULL,
  `shared_with` varchar(155) NOT NULL,
  `access_role` enum('editor','viewer','auditor') NOT NULL DEFAULT 'viewer',
  `share_token` varchar(64) NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_by` varchar(155) NOT NULL,
  `created_at` datetime NOT NULL,
  `revoked` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`share_id`),
  KEY `idx_folder_share_folder` (`folder_id`),
  KEY `idx_folder_share_user` (`shared_with`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `qms_folder_documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `folder_id` int(11) NOT NULL,
  `doc_num` int(11) NOT NULL,
  `added_by` varchar(155) NOT NULL,
  `added_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_folder_doc` (`folder_id`,`doc_num`),
  KEY `idx_folder_doc_num` (`doc_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `qms_folder_audit` (
  `audit_id` int(11) NOT NULL AUTO_INCREMENT,
  `folder_id` int(11) DEFAULT NULL,
  `actor` varchar(155) NOT NULL,
  `action` varchar(80) NOT NULL,
  `details` text,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`audit_id`),
  KEY `idx_folder_audit_folder` (`folder_id`),
  KEY `idx_folder_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
