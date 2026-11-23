-- Document version history: one row per snapshot, current file stays on file_info

CREATE TABLE IF NOT EXISTS `qms_doc_versions` (
  `version_id` int(11) NOT NULL AUTO_INCREMENT,
  `doc_id` int(11) NOT NULL,
  `seq` int(11) NOT NULL,
  `doc_version` varchar(20) NOT NULL DEFAULT '1.0',
  `qms_version` varchar(20) NOT NULL DEFAULT '1.0',
  `bump_type` enum('initial','minor','major','restore') NOT NULL DEFAULT 'initial',
  `change_comment` varchar(500) NOT NULL DEFAULT '',
  `stored_file` varchar(255) NOT NULL DEFAULT '',
  `doc_name` varchar(255) NOT NULL DEFAULT '',
  `doc_desc` varchar(1000) DEFAULT '',
  `release_dt` date DEFAULT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT 0,
  `restored_from_id` int(11) DEFAULT NULL,
  `created_by` varchar(155) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`version_id`),
  UNIQUE KEY `uniq_doc_seq` (`doc_id`,`seq`),
  KEY `idx_doc_versions_doc` (`doc_id`,`is_current`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
