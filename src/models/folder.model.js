var moment = require('moment');
var dbConn = require('./../../config/db.config');
var Access = require('./access.model');
var Role = require('./role.model');

var ROLE_RANK = { viewer: 1, auditor: 2, editor: 3, owner: 4 };
var LIFECYCLE_NEXT = {
  draft: ['active', 'under_review', 'obsolete'],
  active: ['under_review', 'archived'],
  under_review: ['approved', 'draft', 'active'],
  approved: ['active', 'archived'],
  archived: ['active', 'obsolete'],
  obsolete: ['archived']
};

var tablesReady = false;
var tablesSql = [
  "CREATE TABLE IF NOT EXISTS `qms_folders` (" +
    "`folder_id` int(11) NOT NULL AUTO_INCREMENT," +
    "`parent_id` int(11) DEFAULT NULL," +
    "`folder_name` varchar(150) NOT NULL," +
    "`description` varchar(500) DEFAULT ''," +
    "`category_menu` varchar(50) NOT NULL," +
    "`category_submenu` varchar(50) NOT NULL," +
    "`visibility` enum('private','restricted','shared','public') NOT NULL DEFAULT 'restricted'," +
    "`lifecycle_status` enum('draft','active','under_review','approved','archived','obsolete') NOT NULL DEFAULT 'draft'," +
    "`owner` varchar(155) NOT NULL," +
    "`inherit_permissions` tinyint(1) NOT NULL DEFAULT 1," +
    "`review_date` date DEFAULT NULL," +
    "`retain_until` date DEFAULT NULL," +
    "`tags` varchar(255) DEFAULT ''," +
    "`created_by` varchar(155) NOT NULL," +
    "`created_at` datetime NOT NULL," +
    "`updated_at` datetime NOT NULL," +
    "`status` tinyint(1) NOT NULL DEFAULT 0," +
    "PRIMARY KEY (`folder_id`)," +
    "KEY `idx_qms_folders_category` (`category_menu`,`category_submenu`,`status`)," +
    "KEY `idx_qms_folders_parent` (`parent_id`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8",
  "CREATE TABLE IF NOT EXISTS `qms_folder_permissions` (" +
    "`perm_id` int(11) NOT NULL AUTO_INCREMENT," +
    "`folder_id` int(11) NOT NULL," +
    "`user_email` varchar(155) NOT NULL," +
    "`access_role` enum('owner','editor','viewer','auditor') NOT NULL DEFAULT 'viewer'," +
    "`granted_by` varchar(155) NOT NULL," +
    "`granted_at` datetime NOT NULL," +
    "PRIMARY KEY (`perm_id`)," +
    "UNIQUE KEY `uniq_folder_user` (`folder_id`,`user_email`)," +
    "KEY `idx_folder_perm_user` (`user_email`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8",
  "CREATE TABLE IF NOT EXISTS `qms_folder_shares` (" +
    "`share_id` int(11) NOT NULL AUTO_INCREMENT," +
    "`folder_id` int(11) NOT NULL," +
    "`shared_with` varchar(155) NOT NULL," +
    "`access_role` enum('editor','viewer','auditor') NOT NULL DEFAULT 'viewer'," +
    "`share_token` varchar(64) NOT NULL," +
    "`expires_at` datetime DEFAULT NULL," +
    "`created_by` varchar(155) NOT NULL," +
    "`created_at` datetime NOT NULL," +
    "`revoked` tinyint(1) NOT NULL DEFAULT 0," +
    "PRIMARY KEY (`share_id`)," +
    "KEY `idx_folder_share_folder` (`folder_id`)," +
    "KEY `idx_folder_share_user` (`shared_with`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8",
  "CREATE TABLE IF NOT EXISTS `qms_folder_documents` (" +
    "`id` int(11) NOT NULL AUTO_INCREMENT," +
    "`folder_id` int(11) NOT NULL," +
    "`doc_num` int(11) NOT NULL," +
    "`added_by` varchar(155) NOT NULL," +
    "`added_at` datetime NOT NULL," +
    "PRIMARY KEY (`id`)," +
    "UNIQUE KEY `uniq_folder_doc` (`folder_id`,`doc_num`)," +
    "KEY `idx_folder_doc_num` (`doc_num`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8",
  "CREATE TABLE IF NOT EXISTS `qms_folder_audit` (" +
    "`audit_id` int(11) NOT NULL AUTO_INCREMENT," +
    "`folder_id` int(11) DEFAULT NULL," +
    "`actor` varchar(155) NOT NULL," +
    "`action` varchar(80) NOT NULL," +
    "`details` text," +
    "`created_at` datetime NOT NULL," +
    "PRIMARY KEY (`audit_id`)," +
    "KEY `idx_folder_audit_folder` (`folder_id`)," +
    "KEY `idx_folder_audit_created` (`created_at`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8",
  "CREATE TABLE IF NOT EXISTS `qms_file_shares` (" +
    "`share_id` int(11) NOT NULL AUTO_INCREMENT," +
    "`doc_num` int(11) NOT NULL," +
    "`folder_id` int(11) DEFAULT NULL," +
    "`shared_with` varchar(155) NOT NULL," +
    "`share_token` varchar(64) NOT NULL," +
    "`expires_at` datetime DEFAULT NULL," +
    "`created_by` varchar(155) NOT NULL DEFAULT ''," +
    "`created_at` datetime NOT NULL," +
    "`last_used_at` datetime DEFAULT NULL," +
    "`file_name` varchar(255) NOT NULL DEFAULT ''," +
    "`revoked` tinyint(1) NOT NULL DEFAULT 0," +
    "PRIMARY KEY (`share_id`)," +
    "UNIQUE KEY `uniq_file_share_token` (`share_token`)," +
    "KEY `idx_file_share_doc` (`doc_num`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8",
  "CREATE TABLE IF NOT EXISTS `qms_folder_invites` (" +
    "`invite_id` int(11) NOT NULL AUTO_INCREMENT," +
    "`folder_id` int(11) DEFAULT NULL," +
    "`category_menu` varchar(50) NOT NULL DEFAULT ''," +
    "`category_submenu` varchar(50) NOT NULL DEFAULT ''," +
    "`invited_email` varchar(155) NOT NULL," +
    "`access_role` enum('admin','member','editor','viewer','auditor') NOT NULL DEFAULT 'viewer'," +
    "`department` varchar(80) NOT NULL DEFAULT ''," +
    "`visibility` enum('private','public') NOT NULL DEFAULT 'private'," +
    "`invite_token` varchar(64) NOT NULL," +
    "`expires_at` datetime DEFAULT NULL," +
    "`created_by` varchar(155) NOT NULL DEFAULT ''," +
    "`created_at` datetime NOT NULL," +
    "`accepted_at` datetime DEFAULT NULL," +
    "`accepted_by` varchar(155) NOT NULL DEFAULT ''," +
    "`revoked` tinyint(1) NOT NULL DEFAULT 0," +
    "PRIMARY KEY (`invite_id`)," +
    "UNIQUE KEY `uniq_folder_invite_token` (`invite_token`)," +
    "KEY `idx_folder_invite_folder` (`folder_id`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8"
];

var extraAlters = [
  "ALTER TABLE qms_folder_invites MODIFY folder_id int(11) DEFAULT NULL",
  "ALTER TABLE qms_folder_invites ADD COLUMN category_menu varchar(50) NOT NULL DEFAULT ''",
  "ALTER TABLE qms_folder_invites ADD COLUMN category_submenu varchar(50) NOT NULL DEFAULT ''",
  "ALTER TABLE qms_folder_invites MODIFY access_role enum('admin','member','editor','viewer','auditor') NOT NULL DEFAULT 'viewer'",
  "ALTER TABLE qms_folder_invites ADD COLUMN department varchar(80) NOT NULL DEFAULT ''",
  "ALTER TABLE qms_folder_invites ADD COLUMN visibility enum('private','public') NOT NULL DEFAULT 'private'"
];

function runSql(sql, params, cb) {
  dbConn.query(sql, params || [], function (err, res) {
    if (err) return cb(err);
    cb(null, res);
  });
}

function ensureTables(cb) {
  if (tablesReady) return cb(null);
  var i = 0;
  function next(err) {
    if (err) return cb(err);
    if (i >= tablesSql.length) return alterNext(0);
    runSql(tablesSql[i++], [], next);
  }
  function alterNext(idx) {
    if (idx >= extraAlters.length) {
      return Access.ensureTables(function (aErr) {
        if (aErr) return cb(aErr);
        tablesReady = true;
        cb(null);
      });
    }
    runSql(extraAlters[idx], [], function () { alterNext(idx + 1); });
  }
  next();
}

function withTables(fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var cb = args[args.length - 1];
    ensureTables(function (err) {
      if (err) return cb(err);
      fn.apply(null, args);
    });
  };
}

function likeTerm(q) {
  return '%' + String(q || '').replace(/[%_]/g, '\\$&') + '%';
}

var Folder = {};

Folder.roleRank = ROLE_RANK;
Folder.lifecycleNext = LIFECYCLE_NEXT;

Folder.ensureTables = ensureTables;

Folder.listByCategory = withTables(function (menu, submenu, cb) {
  var sql =
    "SELECT f.*, " +
    "(SELECT COUNT(*) FROM qms_folder_documents d WHERE d.folder_id = f.folder_id) AS doc_count, " +
    "(SELECT COUNT(*) FROM qms_folders c WHERE c.parent_id = f.folder_id AND c.status = 0) AS child_count " +
    "FROM qms_folders f " +
    "WHERE f.status = 0 AND f.category_menu = ? AND f.category_submenu = ? " +
    "ORDER BY f.folder_name ASC";
  runSql(sql, [menu, submenu], cb);
});

Folder.search = withTables(function (menu, submenu, q, cb) {
  var term = likeTerm(q);
  var sql =
    "SELECT DISTINCT f.*, " +
    "(SELECT COUNT(*) FROM qms_folder_documents d WHERE d.folder_id = f.folder_id) AS doc_count, " +
    "(SELECT COUNT(*) FROM qms_folders c WHERE c.parent_id = f.folder_id AND c.status = 0) AS child_count " +
    "FROM qms_folders f " +
    "LEFT JOIN qms_folder_documents fd ON fd.folder_id = f.folder_id " +
    "LEFT JOIN file_info fi ON fi.doc_num = fd.doc_num " +
    "WHERE f.status = 0 AND f.category_menu = ? AND f.category_submenu = ? " +
    "AND (f.folder_name LIKE ? OR f.description LIKE ? OR f.tags LIKE ? OR fi.doc_name LIKE ? OR fi.docDesc LIKE ? OR fi.doc LIKE ?) " +
    "ORDER BY f.folder_name ASC";
  runSql(sql, [menu, submenu, term, term, term, term, term, term], cb);
});

Folder.getById = withTables(function (folderId, cb) {
  runSql("SELECT * FROM qms_folders WHERE folder_id = ? AND status = 0", [folderId], function (err, rows) {
    if (err) return cb(err);
    cb(null, rows && rows[0] ? rows[0] : null);
  });
});

Folder.getByIdAny = withTables(function (folderId, cb) {
  runSql("SELECT * FROM qms_folders WHERE folder_id = ?", [folderId], function (err, rows) {
    if (err) return cb(err);
    cb(null, rows && rows[0] ? rows[0] : null);
  });
});

Folder.create = withTables(function (data, cb) {
  var sql =
    "INSERT INTO qms_folders (parent_id, folder_name, description, category_menu, category_submenu, " +
    "visibility, lifecycle_status, owner, inherit_permissions, review_date, retain_until, tags, " +
    "created_by, created_at, updated_at, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0)";
  var params = [
    data.parent_id || null,
    data.folder_name,
    data.description || '',
    data.category_menu,
    data.category_submenu,
    data.visibility || 'restricted',
    data.lifecycle_status || 'draft',
    data.owner,
    data.inherit_permissions === 0 ? 0 : 1,
    data.review_date || null,
    data.retain_until || null,
    data.tags || '',
    data.created_by,
    data.created_at,
    data.updated_at
  ];
  runSql(sql, params, function (err, res) {
    if (err) return cb(err);
    var days = Number(data.recert_interval_days) || 90;
    var due = moment().add(days, 'days').format('YYYY-MM-DD');
    runSql(
      "UPDATE qms_folders SET recert_interval_days = ?, recert_due = ? WHERE folder_id = ?",
      [days, due, res.insertId],
      function () {
        Folder.grantPermission({
          folder_id: res.insertId,
          user_email: data.owner,
          access_role: 'owner',
          granted_by: data.created_by,
          granted_at: data.created_at
        }, function (permErr) {
          if (permErr) return cb(permErr);
          cb(null, { folder_id: res.insertId });
        });
      }
    );
  });
});

Folder.update = withTables(function (folderId, data, cb) {
  var sql =
    "UPDATE qms_folders SET parent_id = ?, folder_name = ?, description = ?, visibility = ?, " +
    "inherit_permissions = ?, review_date = ?, retain_until = ?, tags = ?, updated_at = ? " +
    "WHERE folder_id = ? AND status = 0";
  runSql(sql, [
    data.parent_id || null,
    data.folder_name,
    data.description || '',
    data.visibility,
    data.inherit_permissions === 0 ? 0 : 1,
    data.review_date || null,
    data.retain_until || null,
    data.tags || '',
    data.updated_at,
    folderId
  ], cb);
});

Folder.setLifecycle = withTables(function (folderId, status, updatedAt, cb) {
  runSql(
    "UPDATE qms_folders SET lifecycle_status = ?, updated_at = ? WHERE folder_id = ? AND status = 0",
    [status, updatedAt, folderId],
    cb
  );
});

Folder.softDeleteTree = withTables(function (folderId, updatedAt, cb) {
  var ids = [];
  function walk(id, done) {
    ids.push(Number(id));
    Folder.listChildren(id, function (err, children) {
      if (err) return done(err);
      var list = children || [];
      var i = 0;
      function next() {
        if (i >= list.length) return done();
        walk(list[i++].folder_id, function (wErr) {
          if (wErr) return done(wErr);
          next();
        });
      }
      next();
    });
  }
  walk(folderId, function (err) {
    if (err) return cb(err);
    var pending = ids.length;
    if (!pending) return cb(null);
    var failed = null;
    ids.forEach(function (id) {
      runSql(
        "UPDATE file_info fi INNER JOIN qms_folder_documents fd ON fd.doc_num = fi.doc_num SET fi.status = 1 WHERE fd.folder_id = ? AND fi.status = 0",
        [id],
        function (fErr) {
          if (fErr) failed = fErr;
          runSql(
            "UPDATE qms_folders SET status = 1, updated_at = ? WHERE folder_id = ? AND status = 0",
            [updatedAt, id],
            function (uErr) {
              if (uErr) failed = uErr;
              pending -= 1;
              if (!pending) cb(failed);
            }
          );
        }
      );
    });
  });
});

Folder.hideLocation = withTables(function (menu, submenu, updatedAt, cb) {
  var folderSql;
  var folderParams;
  var fileSql;
  var fileParams;
  if (submenu) {
    folderSql = "UPDATE qms_folders SET status = 1, updated_at = ? WHERE status = 0 AND category_menu = ? AND category_submenu = ?";
    folderParams = [updatedAt, menu, submenu];
    fileSql = "UPDATE file_info SET status = 1 WHERE status = 0 AND doc_path = ?";
    fileParams = [menu + '/' + submenu];
  } else {
    folderSql = "UPDATE qms_folders SET status = 1, updated_at = ? WHERE status = 0 AND category_menu = ?";
    folderParams = [updatedAt, menu];
    var likePrefix = String(menu).replace(/[\\%_]/g, '\\$&') + '/%';
    fileSql = "UPDATE file_info SET status = 1 WHERE status = 0 AND (doc_path = ? OR doc_path LIKE ?)";
    fileParams = [menu, likePrefix];
  }
  var linkedSql = submenu
    ? "UPDATE file_info fi INNER JOIN qms_folder_documents fd ON fd.doc_num = fi.doc_num INNER JOIN qms_folders f ON f.folder_id = fd.folder_id SET fi.status = 1 WHERE fi.status = 0 AND f.category_menu = ? AND f.category_submenu = ?"
    : "UPDATE file_info fi INNER JOIN qms_folder_documents fd ON fd.doc_num = fi.doc_num INNER JOIN qms_folders f ON f.folder_id = fd.folder_id SET fi.status = 1 WHERE fi.status = 0 AND f.category_menu = ?";
  var linkedParams = submenu ? [menu, submenu] : [menu];
  runSql(fileSql, fileParams, function (err) {
    if (err) return cb(err);
    runSql(linkedSql, linkedParams, function (lErr) {
      if (lErr) return cb(lErr);
      runSql(folderSql, folderParams, cb);
    });
  });
});

Folder.softDelete = withTables(function (folderId, updatedAt, cb) {
  runSql(
    "UPDATE qms_folders SET status = 1, updated_at = ? WHERE folder_id = ? AND status = 0",
    [updatedAt, folderId],
    cb
  );
});

Folder.listPicker = withTables(function (cb) {
  runSql(
    "SELECT folder_id, folder_name, parent_id, category_menu, category_submenu FROM qms_folders WHERE status = 0 ORDER BY folder_name",
    [],
    cb
  );
});

Folder.listDocLocations = withTables(function (cb) {
  runSql(
    "SELECT SUBSTRING_INDEX(doc_path, '/', 1) AS menu, " +
    "IF(INSTR(doc_path, '/') > 0, SUBSTRING_INDEX(doc_path, '/', -1), '') AS submenu " +
    "FROM file_info WHERE status = 0 AND doc_path <> '' AND doc_path NOT LIKE 'library/%' " +
    "GROUP BY menu, submenu",
    [],
    cb
  );
});

Folder.getFile = withTables(function (docNum, cb) {
  runSql("SELECT * FROM file_info WHERE doc_num = ? AND status = 0", [docNum], function (err, rows) {
    if (err) return cb(err);
    cb(null, rows && rows[0] ? rows[0] : null);
  });
});

Folder.findByNameInPath = withTables(function (docPath, originalName, cb) {
  var name = String(originalName || '').replace(/^.*[\\/]/, '').trim();
  if (!name) return cb(null, null);
  runSql(
    "SELECT * FROM file_info WHERE status = 0 AND doc_path = ? AND (doc_name = ? OR doc = ? OR doc_file = ?) ORDER BY doc_num DESC LIMIT 1",
    [docPath, name, name, name],
    function (err, rows) {
      if (err) return cb(err);
      cb(null, rows && rows[0] ? rows[0] : null);
    }
  );
});

Folder.setFilePath = withTables(function (docNum, docPath, cb) {
  runSql("UPDATE file_info SET doc_path = ?, last_modified = CURDATE() WHERE doc_num = ? AND status = 0", [docPath, docNum], cb);
});

Folder.place = withTables(function (folderId, data, cb) {
  runSql(
    "UPDATE qms_folders SET parent_id = ?, category_menu = ?, category_submenu = ?, updated_at = ? WHERE folder_id = ? AND status = 0",
    [data.parent_id || null, data.category_menu || '', data.category_submenu || '', data.updated_at, folderId],
    cb
  );
});

Folder.hideDocument = withTables(function (docNum, cb) {
  runSql("UPDATE file_info SET status = 1 WHERE doc_num = ?", [docNum], cb);
});

Folder.renameFolder = withTables(function (folderId, name, updatedAt, cb) {
  runSql(
    "UPDATE qms_folders SET folder_name = ?, updated_at = ? WHERE folder_id = ? AND status = 0",
    [name, updatedAt, folderId],
    cb
  );
});

Folder.renameFile = withTables(function (docNum, name, cb) {
  runSql("UPDATE file_info SET doc_name = ? WHERE doc_num = ? AND status = 0", [name, docNum], cb);
});

Folder.getFileAny = withTables(function (docNum, cb) {
  runSql("SELECT * FROM file_info WHERE doc_num = ?", [docNum], function (err, rows) {
    if (err) return cb(err);
    cb(null, rows && rows[0] ? rows[0] : null);
  });
});

Folder.restoreFile = withTables(function (docNum, cb) {
  runSql("UPDATE file_info SET status = 0 WHERE doc_num = ? AND status = 1", [docNum], cb);
});

Folder.restoreFolder = withTables(function (folderId, updatedAt, cb) {
  runSql("UPDATE qms_folders SET status = 0, updated_at = ? WHERE folder_id = ? AND status = 1", [updatedAt, folderId], cb);
});

Folder.purgeFile = withTables(function (docNum, cb) {
  runSql("DELETE FROM qms_folder_documents WHERE doc_num = ?", [docNum], function (err) {
    if (err) return cb(err);
    runSql("DELETE FROM file_info WHERE doc_num = ?", [docNum], cb);
  });
});

Folder.purgeFolder = withTables(function (folderId, cb) {
  runSql("DELETE FROM qms_folders WHERE folder_id = ? AND status = 1", [folderId], cb);
});

Folder.listChildren = withTables(function (folderId, cb) {
  runSql("SELECT folder_id FROM qms_folders WHERE parent_id = ? AND status = 0", [folderId], cb);
});

Folder.listPermissions = withTables(function (folderId, cb) {
  runSql(
    "SELECT * FROM qms_folder_permissions WHERE folder_id = ? ORDER BY access_role, user_email",
    [folderId],
    cb
  );
});

Folder.grantPermission = withTables(function (data, cb) {
  var sql =
    "INSERT INTO qms_folder_permissions (folder_id, user_email, access_role, granted_by, granted_at) " +
    "VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE access_role = VALUES(access_role), granted_by = VALUES(granted_by), granted_at = VALUES(granted_at)";
  runSql(sql, [data.folder_id, data.user_email, data.access_role, data.granted_by, data.granted_at], cb);
});

Folder.grantPermissionAtLeast = withTables(function (data, cb) {
  runSql(
    "SELECT access_role FROM qms_folder_permissions WHERE folder_id = ? AND user_email = ? LIMIT 1",
    [data.folder_id, data.user_email],
    function (err, rows) {
      if (err) return cb(err);
      var existing = rows && rows[0] ? rows[0].access_role : '';
      var newRank = ROLE_RANK[data.access_role] || 0;
      var oldRank = ROLE_RANK[existing] || 0;
      if (existing && oldRank >= newRank) return cb(null, { existed: true, access_role: existing });
      Folder.grantPermission(data, cb);
    }
  );
});

Folder.createInvite = withTables(function (data, cb) {
  var sql =
    "INSERT INTO qms_folder_invites (folder_id, category_menu, category_submenu, invited_email, access_role, department, visibility, invite_token, expires_at, created_by, created_at, revoked) " +
    "VALUES (?,?,?,?,?,?,?,?,?,?,?,0)";
  runSql(sql, [
    data.folder_id || null,
    data.category_menu || '',
    data.category_submenu || '',
    data.invited_email,
    data.access_role || 'viewer',
    data.department || '',
    data.visibility === 'public' ? 'public' : 'private',
    data.invite_token,
    data.expires_at || null,
    data.created_by,
    data.created_at
  ], cb);
});

Folder.listForLocation = withTables(function (menu, submenu, cb) {
  var menuName = String(menu || '').trim();
  var subName = String(submenu || '').trim();
  if (menuName && subName) {
    return runSql(
      "SELECT * FROM qms_folders WHERE status = 0 AND category_menu = ? AND category_submenu = ?",
      [menuName, subName],
      cb
    );
  }
  if (menuName) {
    return runSql("SELECT * FROM qms_folders WHERE status = 0 AND category_menu = ?", [menuName], cb);
  }
  runSql("SELECT * FROM qms_folders WHERE status = 0", [], cb);
});

Folder.getInviteByToken = withTables(function (token, cb) {
  runSql("SELECT * FROM qms_folder_invites WHERE invite_token = ? LIMIT 1", [token], function (err, rows) {
    if (err) return cb(err);
    cb(null, rows && rows[0] ? rows[0] : null);
  });
});

Folder.acceptInvite = withTables(function (inviteId, acceptedBy, cb) {
  runSql(
    "UPDATE qms_folder_invites SET accepted_at = ?, accepted_by = ? WHERE invite_id = ?",
    [moment().format('YYYY-MM-DD HH:mm:ss'), acceptedBy, inviteId],
    cb
  );
});

Folder.revokePermission = withTables(function (permId, folderId, cb) {
  runSql("DELETE FROM qms_folder_permissions WHERE perm_id = ? AND folder_id = ?", [permId, folderId], cb);
});

Folder.listShares = withTables(function (folderId, cb) {
  runSql(
    "SELECT * FROM qms_folder_shares WHERE folder_id = ? ORDER BY created_at DESC",
    [folderId],
    cb
  );
});

Folder.createFileShare = withTables(function (data, cb) {
  var sql =
    "INSERT INTO qms_file_shares (doc_num, folder_id, shared_with, share_token, expires_at, created_by, created_at, file_name, revoked) " +
    "VALUES (?,?,?,?,?,?,?,?,0)";
  runSql(sql, [
    data.doc_num,
    data.folder_id || null,
    data.shared_with,
    data.share_token,
    data.expires_at || null,
    data.created_by,
    data.created_at,
    data.file_name || ''
  ], cb);
});

Folder.getFileShareByToken = withTables(function (token, cb) {
  runSql("SELECT * FROM qms_file_shares WHERE share_token = ? LIMIT 1", [token], function (err, rows) {
    if (err) return cb(err);
    cb(null, rows && rows[0] ? rows[0] : null);
  });
});

Folder.touchFileShare = withTables(function (shareId, cb) {
  runSql("UPDATE qms_file_shares SET last_used_at = ? WHERE share_id = ?", [moment().format('YYYY-MM-DD HH:mm:ss'), shareId], cb);
});

Folder.createShare = withTables(function (data, cb) {
  var sql =
    "INSERT INTO qms_folder_shares (folder_id, shared_with, access_role, share_token, expires_at, created_by, created_at, revoked) " +
    "VALUES (?,?,?,?,?,?,?,0)";
  runSql(sql, [
    data.folder_id,
    data.shared_with,
    data.access_role,
    data.share_token,
    data.expires_at || null,
    data.created_by,
    data.created_at
  ], cb);
});

Folder.revokeShare = withTables(function (shareId, folderId, cb) {
  runSql("UPDATE qms_folder_shares SET revoked = 1 WHERE share_id = ? AND folder_id = ?", [shareId, folderId], cb);
});

Folder.listDocuments = withTables(function (folderId, cb) {
  var sql =
    "SELECT fd.id, fd.folder_id, fd.doc_num, fd.added_by, fd.added_at, " +
    "fi.doc_name, fi.doc, fi.docDesc, fi.version, fi.docRelVer, fi.releaseDt, fi.doc_path, fi.status " +
    "FROM qms_folder_documents fd " +
    "LEFT JOIN file_info fi ON fi.doc_num = fd.doc_num " +
    "WHERE fd.folder_id = ? ORDER BY fd.added_at DESC";
  runSql(sql, [folderId], cb);
});

Folder.saveUploadedFile = withTables(function (data, cb) {
  var sql =
    "INSERT INTO file_info(doc_name,doc_path,doc,created_at,created_by,last_modified,last_accessed,version,status,docRelVer,docDesc,releaseDt,doc_file) " +
    "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)";
  runSql(sql, [
    data.doc_name,
    data.doc_path,
    data.doc,
    data.created_at,
    data.created_by,
    data.last_modified,
    data.last_accessed,
    data.version || '1.0',
    0,
    data.docRelVer || '1.0',
    data.docDesc || '',
    data.releaseDt,
    data.doc_name
  ], function (err, res) {
    if (err) return cb(err);
    cb(null, { doc_num: res.insertId });
  });
});

Folder.addDocument = withTables(function (data, cb) {
  var sql =
    "INSERT INTO qms_folder_documents (folder_id, doc_num, added_by, added_at) VALUES (?,?,?,?)";
  runSql(sql, [data.folder_id, data.doc_num, data.added_by, data.added_at], cb);
});

Folder.removeDocument = withTables(function (folderId, docNum, cb) {
  runSql("DELETE FROM qms_folder_documents WHERE folder_id = ? AND doc_num = ?", [folderId, docNum], cb);
});

Folder.listCategoryDocuments = withTables(function (filePath, cb) {
  var sql =
    "SELECT doc_num, doc_name, doc, docDesc, version, docRelVer, releaseDt, doc_path " +
    "FROM file_info WHERE status = 0 AND doc_path = ? ORDER BY doc_name";
  runSql(sql, [filePath], cb);
});

Folder.addAudit = withTables(function (data, cb) {
  var sql = "INSERT INTO qms_folder_audit (folder_id, actor, action, details, created_at) VALUES (?,?,?,?,?)";
  runSql(sql, [data.folder_id || null, data.actor, data.action, data.details || '', data.created_at], function (err) {
    if (err) return cb(err);
    cb(null);
  });
});

Folder.listAudit = withTables(function (folderId, cb) {
  runSql(
    "SELECT * FROM qms_folder_audit WHERE folder_id = ? ORDER BY created_at DESC, audit_id DESC LIMIT 200",
    [folderId],
    cb
  );
});

Folder.listUsers = withTables(function (cb) {
  runSql(
    "SELECT DISTINCT emp_email, username, first_name, last_name, user_role FROM login WHERE emp_email <> '' ORDER BY emp_email",
    [],
    cb
  );
});

Folder.listAncestors = withTables(function (folder, cb) {
  var chain = [];
  function walk(current) {
    if (!current || !current.parent_id) return cb(null, chain);
    Folder.getByIdAny(current.parent_id, function (err, parent) {
      if (err) return cb(err);
      if (!parent || parent.status === 1) return cb(null, chain);
      chain.push(parent);
      walk(parent);
    });
  }
  walk(folder);
});

function isOwnerOf(folder, ctx) {
  if (!folder) return false;
  if (Access.matchesIdentity(ctx, folder.owner)) return true;
  return false;
}

function applyUserRows(rows, ctx, field, roleField, source, consider, now) {
  (rows || []).forEach(function (row) {
    if (row.revoked) return;
    if (row.expires_at && new Date(row.expires_at) < now) return;
    if (!Access.matchesIdentity(ctx, row[field])) return;
    consider(row[roleField], source);
  });
}

Folder.resolveAccess = withTables(function (folder, userEmail, isAdmin, cb, ctx) {
  function run(context) {
    var sysRole = (context && context.sysRole) || (isAdmin || (context && context.isAdmin) ? 'admin' : 'viewer');
    if (isAdmin || (context && context.isAdmin) || sysRole === 'admin') {
      return cb(null, { role: 'owner', source: 'admin', canView: true, canRequest: false });
    }
    if (isOwnerOf(folder, context)) {
      return cb(null, { role: 'owner', source: 'owner', canView: true, canRequest: false });
    }

    var best = { role: null, source: null, rank: 0 };
    var now = new Date();

    function consider(role, source) {
      var rank = ROLE_RANK[role] || 0;
      if (rank > best.rank) {
        best = { role: role, source: source, rank: rank };
      }
    }

    function finish() {
      var link = context.linkRoles && context.linkRoles[String(folder.folder_id)];
      if (link && !link.revoked && (!link.until || new Date(link.until) > now)) {
        consider(link.role || 'viewer', 'link');
      }
      if (folder.visibility === 'public') consider('viewer', 'public');
      if (!best.role) {
        return cb(null, Role.applySysCap({
          role: null,
          source: null,
          canView: false,
          canRequest: folder.visibility === 'restricted' || folder.visibility === 'shared'
        }, sysRole));
      }
      cb(null, Role.applySysCap({ role: best.role, source: best.source, canView: true, canRequest: false }, sysRole));
    }

    function walkGroups(target, then) {
      Access.listGroupGrants(target.folder_id, function (gErr, grants) {
        if (!gErr) Access.applyGroupGrants(target, context, grants, consider);
        then();
      });
    }

    Folder.listPermissions(folder.folder_id, function (err, perms) {
      if (err) return cb(err);
      applyUserRows(perms, context, 'user_email', 'access_role', 'permission', consider, now);
      Folder.listShares(folder.folder_id, function (shareErr, shares) {
        if (shareErr) return cb(shareErr);
        applyUserRows(shares, context, 'shared_with', 'access_role', 'share', consider, now);
        walkGroups(folder, function () {
          if (!Number(folder.inherit_permissions) || !folder.parent_id) return finish();
          Folder.listAncestors(folder, function (ancErr, ancestors) {
            if (ancErr) return cb(ancErr);
            var i = 0;
            function nextAncestor() {
              if (i >= (ancestors || []).length) return finish();
              var parent = ancestors[i++];
              if (isOwnerOf(parent, context)) consider('owner', 'inherited');
              if (parent.visibility === 'public') consider('viewer', 'inherited-public');
              Folder.listPermissions(parent.folder_id, function (pErr, pRows) {
                if (pErr) return cb(pErr);
                applyUserRows(pRows, context, 'user_email', 'access_role', 'inherited', consider, now);
                Folder.listShares(parent.folder_id, function (sErr, sRows) {
                  if (sErr) return cb(sErr);
                  applyUserRows(sRows, context, 'shared_with', 'access_role', 'inherited-share', consider, now);
                  walkGroups(parent, function () {
                    if (Number(parent.inherit_permissions)) return nextAncestor();
                    finish();
                  });
                });
              });
            }
            nextAncestor();
          });
        });
      });
    });
  }

  if (ctx && ctx.identities) return run(ctx);
  Access.getLoginUser(userEmail, function (uErr, user) {
    run({
      email: userEmail,
      sysRole: Role.fromUser(user) || (isAdmin ? 'admin' : 'viewer'),
      isAdmin: !!isAdmin || Role.fromUser(user) === 'admin',
      department: user && user.department ? String(user.department).trim() : '',
      identities: [userEmail, user && user.emp_email, user && user.username].filter(Boolean),
      linkRoles: {}
    });
  });
});

Folder.hasCycle = withTables(function (folderId, newParentId, cb) {
  if (!newParentId) return cb(null, false);
  if (Number(folderId) === Number(newParentId)) return cb(null, true);
  Folder.getById(newParentId, function (err, parent) {
    if (err) return cb(err);
    if (!parent) return cb(null, false);
    Folder.listAncestors(parent, function (aErr, ancestors) {
      if (aErr) return cb(aErr);
      var ids = [Number(parent.folder_id)].concat((ancestors || []).map(function (a) { return Number(a.folder_id); }));
      cb(null, ids.indexOf(Number(folderId)) !== -1);
    });
  });
});

Folder.capsFromAccess = function (access) {
  var role = access && access.role;
  var rank = ROLE_RANK[role] || 0;
  return {
    accessRole: role || '',
    accessSource: (access && access.source) || '',
    canView: !!(access && access.canView),
    canRequest: !!(access && access.canRequest),
    canUpload: rank >= ROLE_RANK.editor,
    canEdit: rank >= ROLE_RANK.editor,
    canShare: rank >= ROLE_RANK.editor,
    canManage: rank >= ROLE_RANK.owner,
    canDelete: rank >= ROLE_RANK.owner
  };
};

Folder.bestDocAccess = withTables(function (docNum, ctx, cb) {
  Access.foldersForDocs([docNum], function (err, map) {
    if (err) return cb(err);
    var ids = map[docNum] || [];
    if (!ids.length) {
      var fallback = Role.unscopedDocRole((ctx && ctx.sysRole) || 'viewer');
      return cb(null, { role: fallback, source: 'category', canView: true, canRequest: false, folderIds: [] });
    }
    var best = { role: null, source: null, rank: 0, canView: false, canRequest: false, folderIds: ids };
    var i = 0;
    function next() {
      if (i >= ids.length) {
        if (!best.role && ctx && ctx.sharedDocs && ctx.sharedDocs[String(docNum)]) {
          return cb(null, { role: 'viewer', source: 'mail', canView: true, canRequest: false, folderIds: ids });
        }
        if (!best.role) return cb(null, best);
        best.canView = true;
        return cb(null, best);
      }
      Folder.getById(ids[i++], function (gErr, folder) {
        if (gErr || !folder) return next();
        Folder.resolveAccess(folder, ctx.email, ctx.isAdmin, function (aErr, access) {
          if (aErr) return next();
          var rank = ROLE_RANK[access.role] || 0;
          if (access.canRequest) best.canRequest = true;
          if (access.canView && rank >= best.rank) {
            best = {
              role: access.role,
              source: access.source,
              rank: rank,
              canView: true,
              canRequest: false,
              folderIds: ids,
              folderId: folder.folder_id
            };
          }
          next();
        }, ctx);
      });
    }
    next();
  });
});

Folder.filterLibraryItems = withTables(function (items, ctx, cb) {
  var list = items || [];
  var folderIds = [];
  var docIds = [];
  list.forEach(function (item) {
    if (item && item.kind === 'folder' && item.id) folderIds.push(Number(item.id));
    if (item && item.kind === 'document' && item.id) docIds.push(Number(item.id));
  });
  Access.foldersForDocs(docIds, function (err, docMap) {
    if (err) return cb(null, list);
    Object.keys(docMap || {}).forEach(function (docId) {
      (docMap[docId] || []).forEach(function (fid) { folderIds.push(Number(fid)); });
    });
    var uniqueIds = [];
    var seen = {};
    folderIds.forEach(function (id) {
      if (!id || seen[id]) return;
      seen[id] = true;
      uniqueIds.push(id);
    });
    var accessByFolder = {};
    var i = 0;
    function nextFolder() {
      if (i >= uniqueIds.length) return apply();
      var id = uniqueIds[i++];
      Folder.getById(id, function (gErr, folder) {
        if (gErr || !folder) {
          accessByFolder[id] = { role: null, canView: false, canRequest: false };
          return nextFolder();
        }
        Folder.resolveAccess(folder, ctx.email, ctx.isAdmin, function (aErr, access) {
          accessByFolder[id] = access || { role: null, canView: false, canRequest: false };
          accessByFolder[id].visibility = folder.visibility;
          nextFolder();
        }, ctx);
      });
    }
    function decorateFolderItem(item, access) {
      var caps = Folder.capsFromAccess(access);
      item.accessRole = caps.accessRole;
      item.accessSource = caps.accessSource;
      item.canView = caps.canView;
      item.canRequest = caps.canRequest;
      item.canUpload = caps.canUpload;
      item.canEdit = caps.canEdit;
      item.canShare = caps.canShare;
      item.canManage = caps.canManage;
      item.canDelete = caps.canDelete || caps.canEdit;
      item.locked = !caps.canView;
      if (item.locked) {
        item.href = '#';
        item.typeLabel = 'Restricted folder';
      }
      return item;
    }
    function apply() {
      var out = [];
      list.forEach(function (item) {
        if (!item) return;
        if (item.kind === 'category' || item.kind === 'department') {
          item.canDelete = Role.caps((ctx && ctx.sysRole) || 'viewer').canDelete;
          out.push(item);
          return;
        }
        if (item.kind === 'folder' && item.id) {
          var access = accessByFolder[Number(item.id)] || { canView: false, canRequest: false };
          var sysInvite = Role.caps((ctx && ctx.sysRole) || 'viewer').canShare;
          if (access.canView) {
            decorateFolderItem(item, access);
            item.canInvite = sysInvite;
            out.push(item);
            return;
          }
          if (access.canRequest || sysInvite) {
            decorateFolderItem(item, access);
            item.canInvite = sysInvite;
            out.push(item);
          }
          return;
        }
        if (item.kind === 'document' && item.id) {
          var ids = docMap[item.id] || [];
          if (!ids.length) {
            var fallback = Role.unscopedDocRole((ctx && ctx.sysRole) || 'viewer');
            var openCaps = Folder.capsFromAccess({ role: fallback, canView: true });
            item.accessRole = openCaps.accessRole;
            item.canView = true;
            item.canEdit = openCaps.canEdit;
            item.canUpload = openCaps.canUpload;
            item.canShare = openCaps.canShare;
            item.canManage = false;
            item.canDelete = openCaps.canDelete;
            item.locked = false;
            out.push(item);
            return;
          }
          var best = { rank: 0, access: null };
          var anyRequest = false;
          ids.forEach(function (fid) {
            var acc = accessByFolder[Number(fid)];
            if (!acc) return;
            if (acc.canRequest) anyRequest = true;
            if (acc.canView && (ROLE_RANK[acc.role] || 0) >= best.rank) {
              best = { rank: ROLE_RANK[acc.role] || 0, access: acc };
            }
          });
          if (!best.access) {
            if (ctx.sharedDocs && ctx.sharedDocs[String(item.id)]) {
              item.accessRole = 'viewer';
              item.accessSource = 'mail';
              item.canView = true;
              item.canEdit = false;
              item.canUpload = false;
              item.canShare = false;
              item.canManage = false;
              item.canDelete = false;
              item.locked = false;
              out.push(item);
            }
            return;
          }
          var caps = Folder.capsFromAccess(best.access);
          item.accessRole = caps.accessRole;
          item.canView = true;
          item.canEdit = caps.canEdit;
          item.canUpload = caps.canUpload;
          item.canShare = caps.canShare;
          item.canManage = caps.canManage;
          item.canDelete = caps.canDelete;
          item.locked = false;
          item.canRequest = anyRequest && !caps.canView;
          out.push(item);
          return;
        }
        out.push(item);
      });
      cb(null, out);
    }
    nextFolder();
  });
});

Folder.getFileByStored = withTables(function (menu, submenu, fileName, cb) {
  var name = String(fileName || '').replace(/^.*[\\/]/, '');
  var pathA = submenu && submenu !== '_' ? String(menu) + '/' + String(submenu) : String(menu);
  var pathB = String(menu);
  runSql(
    "SELECT * FROM file_info WHERE status = 0 AND doc = ? AND (doc_path = ? OR doc_path = ?) ORDER BY doc_num DESC LIMIT 1",
    [name, pathA, pathB],
    function (err, rows) {
      if (err) return cb(err);
      cb(null, rows && rows[0] ? rows[0] : null);
    }
  );
});

Folder.copyInheritedGrants = withTables(function (folder, actorName, cb) {
  if (!folder.parent_id) return cb();
  Folder.getById(folder.parent_id, function (err, parent) {
    if (err || !parent) return cb(err);
    Folder.listPermissions(parent.folder_id, function (pErr, perms) {
      if (pErr) return cb(pErr);
      Access.listGroupGrants(parent.folder_id, function (gErr, grants) {
        if (gErr) return cb(gErr);
        var now = moment().format('YYYY-MM-DD HH:mm:ss');
        var rows = perms || [];
        var i = 0;
        function nextPerm() {
          if (i >= rows.length) return nextGrant(0);
          var p = rows[i++];
          if (p.user_email === folder.owner) return nextPerm();
          Folder.grantPermission({
            folder_id: folder.folder_id,
            user_email: p.user_email,
            access_role: p.access_role === 'owner' ? 'editor' : p.access_role,
            granted_by: actorName,
            granted_at: now
          }, function () { nextPerm(); });
        }
        var groupRows = grants || [];
        function nextGrant(gi) {
          if (gi >= groupRows.length) return cb();
          var g = groupRows[gi];
          Access.grantGroup({
            folder_id: folder.folder_id,
            group_type: g.group_type,
            group_key: g.group_key,
            access_role: g.access_role === 'owner' ? 'editor' : g.access_role,
            granted_by: actorName,
            granted_at: now
          }, function () { nextGrant(gi + 1); });
        }
        nextPerm();
      });
    });
  });
});

module.exports = Folder;
