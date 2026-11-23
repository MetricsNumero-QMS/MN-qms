var crypto = require('crypto');
var moment = require('moment');
var dbConn = require('./../../config/db.config');
var Role = require('./role.model');

var Access = {};
var tablesReady = false;

function runSql(sql, params, cb) {
  dbConn.query(sql, params || [], function (err, res) {
    if (err) return cb(err);
    cb(null, res);
  });
}

function stamp() {
  return moment().format('YYYY-MM-DD HH:mm:ss');
}

var tablesSql = [
  "CREATE TABLE IF NOT EXISTS `qms_folder_group_grants` (" +
    "`grant_id` int(11) NOT NULL AUTO_INCREMENT," +
    "`folder_id` int(11) NOT NULL," +
    "`group_type` enum('department','menu','team') NOT NULL DEFAULT 'department'," +
    "`group_key` varchar(80) NOT NULL," +
    "`access_role` enum('owner','editor','viewer','auditor') NOT NULL DEFAULT 'viewer'," +
    "`granted_by` varchar(155) NOT NULL DEFAULT ''," +
    "`granted_at` datetime NOT NULL," +
    "PRIMARY KEY (`grant_id`)," +
    "UNIQUE KEY `uniq_folder_group` (`folder_id`,`group_type`,`group_key`)," +
    "KEY `idx_folder_group_folder` (`folder_id`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8",
  "CREATE TABLE IF NOT EXISTS `qms_access_templates` (" +
    "`template_id` int(11) NOT NULL AUTO_INCREMENT," +
    "`template_name` varchar(80) NOT NULL," +
    "`description` varchar(255) DEFAULT ''," +
    "`visibility` varchar(20) NOT NULL DEFAULT 'restricted'," +
    "`inherit_permissions` tinyint(1) NOT NULL DEFAULT 0," +
    "`recert_interval_days` int(11) NOT NULL DEFAULT 90," +
    "`created_at` datetime NOT NULL," +
    "PRIMARY KEY (`template_id`)," +
    "UNIQUE KEY `uniq_access_template_name` (`template_name`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8",
  "CREATE TABLE IF NOT EXISTS `qms_access_template_grants` (" +
    "`id` int(11) NOT NULL AUTO_INCREMENT," +
    "`template_id` int(11) NOT NULL," +
    "`group_type` enum('department','menu','team') NOT NULL DEFAULT 'department'," +
    "`group_key` varchar(80) NOT NULL," +
    "`access_role` enum('owner','editor','viewer','auditor') NOT NULL DEFAULT 'viewer'," +
    "PRIMARY KEY (`id`)," +
    "KEY `idx_template_grants` (`template_id`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8",
  "CREATE TABLE IF NOT EXISTS `qms_folder_access_requests` (" +
    "`request_id` int(11) NOT NULL AUTO_INCREMENT," +
    "`folder_id` int(11) NOT NULL," +
    "`requested_by` varchar(155) NOT NULL," +
    "`requested_role` enum('viewer','auditor','editor') NOT NULL DEFAULT 'viewer'," +
    "`message` varchar(400) DEFAULT ''," +
    "`status` enum('pending','approved','denied') NOT NULL DEFAULT 'pending'," +
    "`decided_by` varchar(155) DEFAULT ''," +
    "`decided_at` datetime DEFAULT NULL," +
    "`created_at` datetime NOT NULL," +
    "PRIMARY KEY (`request_id`)," +
    "KEY `idx_access_req_folder` (`folder_id`,`status`)," +
    "KEY `idx_access_req_user` (`requested_by`,`status`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8",
  "CREATE TABLE IF NOT EXISTS `qms_folder_links` (" +
    "`link_id` int(11) NOT NULL AUTO_INCREMENT," +
    "`folder_id` int(11) NOT NULL," +
    "`share_token` varchar(64) NOT NULL," +
    "`access_role` enum('viewer','auditor','editor') NOT NULL DEFAULT 'viewer'," +
    "`password_hash` varchar(255) NOT NULL DEFAULT ''," +
    "`expires_at` datetime DEFAULT NULL," +
    "`created_by` varchar(155) NOT NULL DEFAULT ''," +
    "`created_at` datetime NOT NULL," +
    "`revoked` tinyint(1) NOT NULL DEFAULT 0," +
    "`last_used_at` datetime DEFAULT NULL," +
    "PRIMARY KEY (`link_id`)," +
    "UNIQUE KEY `uniq_folder_link_token` (`share_token`)," +
    "KEY `idx_folder_link_folder` (`folder_id`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8",
  "CREATE TABLE IF NOT EXISTS `qms_access_alerts` (" +
    "`alert_id` int(11) NOT NULL AUTO_INCREMENT," +
    "`user_email` varchar(155) NOT NULL," +
    "`folder_id` int(11) DEFAULT NULL," +
    "`kind` varchar(40) NOT NULL DEFAULT 'info'," +
    "`title` varchar(180) NOT NULL DEFAULT ''," +
    "`body` varchar(500) NOT NULL DEFAULT ''," +
    "`href` varchar(255) NOT NULL DEFAULT ''," +
    "`is_read` tinyint(1) NOT NULL DEFAULT 0," +
    "`created_at` datetime NOT NULL," +
    "PRIMARY KEY (`alert_id`)," +
    "KEY `idx_access_alerts_user` (`user_email`,`is_read`,`created_at`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8"
];

var extraAlters = [
  "ALTER TABLE qms_folders ADD COLUMN recert_interval_days int(11) NOT NULL DEFAULT 90",
  "ALTER TABLE qms_folders ADD COLUMN recert_due date DEFAULT NULL",
  "ALTER TABLE qms_folders ADD COLUMN last_recert_at datetime DEFAULT NULL",
  "ALTER TABLE qms_folders ADD COLUMN last_recert_by varchar(155) NOT NULL DEFAULT ''"
];

function seedTemplates(cb) {
  runSql("SELECT COUNT(*) AS n FROM qms_access_templates", [], function (err, rows) {
    if (err) return cb();
    if (rows && rows[0] && Number(rows[0].n) > 0) return cb();
    var now = stamp();
    var seeds = [
      ['HR confidential', 'Restricted folder. HR department can view. Inheritance off.', 'restricted', 0, 90, [['department', 'HR', 'viewer']]],
      ['Charter team', 'Restricted folder. Charter group can view.', 'restricted', 1, 90, [['department', 'Charter', 'viewer'], ['menu', 'Charter', 'viewer']]],
      ['Internal shared', 'Shared with people you grant. Inheritance on.', 'shared', 1, 180, []],
      ['Company public', 'Visible to every logged-in user as viewer.', 'public', 1, 365, []]
    ];
    var i = 0;
    function next() {
      if (i >= seeds.length) return cb();
      var seed = seeds[i++];
      runSql(
        "INSERT INTO qms_access_templates (template_name, description, visibility, inherit_permissions, recert_interval_days, created_at) VALUES (?,?,?,?,?,?)",
        [seed[0], seed[1], seed[2], seed[3], seed[4], now],
        function (insErr, res) {
          if (insErr || !res) return next();
          var grants = seed[5] || [];
          var g = 0;
          function nextGrant() {
            if (g >= grants.length) return next();
            var grant = grants[g++];
            runSql(
              "INSERT INTO qms_access_template_grants (template_id, group_type, group_key, access_role) VALUES (?,?,?,?)",
              [res.insertId, grant[0], grant[1], grant[2]],
              function () { nextGrant(); }
            );
          }
          nextGrant();
        }
      );
    }
    next();
  });
}

function ensureTables(cb) {
  if (tablesReady) return cb();
  var i = 0;
  function next(err) {
    if (err) return cb(err);
    if (i >= tablesSql.length) return alterNext(0);
    runSql(tablesSql[i++], [], next);
  }
  function alterNext(idx) {
    if (idx >= extraAlters.length) {
      return seedTemplates(function () {
        Role.ensure(function () {
          tablesReady = true;
          cb();
        });
      });
    }
    runSql(extraAlters[idx], [], function () { alterNext(idx + 1); });
  }
  next();
}

function withTables(fn) {
  return function () {
    var args = arguments;
    var self = this;
    ensureTables(function (err) {
      if (err) {
        var cb = args[args.length - 1];
        if (typeof cb === 'function') return cb(err);
        return;
      }
      fn.apply(self, args);
    });
  };
}

function unique(list) {
  var out = [];
  var seen = {};
  (list || []).forEach(function (item) {
    var key = String(item || '').trim().toLowerCase();
    if (!key || seen[key]) return;
    seen[key] = true;
    out.push(String(item).trim());
  });
  return out;
}

function hashSecret(password) {
  if (!password) return '';
  var salt = crypto.randomBytes(16).toString('hex');
  var hash = crypto.scryptSync(String(password), salt, 32).toString('hex');
  return salt + ':' + hash;
}

function verifySecret(password, stored) {
  if (!stored) return !password;
  var parts = String(stored).split(':');
  if (parts.length !== 2) return false;
  try {
    var hash = crypto.scryptSync(String(password || ''), parts[0], 32).toString('hex');
    return hash === parts[1];
  } catch (e) {
    return false;
  }
}

Access.ensureTables = ensureTables;
Access.hashSecret = hashSecret;
Access.verifySecret = verifySecret;

Access.getLoginUser = withTables(function (identifier, cb) {
  runSql(
    "SELECT first_name, last_name, username, emp_email, user_role, sys_role, department FROM login WHERE emp_email = ? OR username = ? LIMIT 1",
    [identifier, identifier],
    function (err, rows) {
      if (err) return cb(err);
      cb(null, rows && rows[0] ? rows[0] : null);
    }
  );
});

Access.userContext = withTables(function (req, cb) {
  var email = String((req.session && (req.session.username || req.session.emp_email)) || '');
  Access.getLoginUser(email, function (err, user) {
    if (err) return cb(err);
    var sysRole = Role.fromUser(user) || Role.fromRequest(req);
    if (req.session && !req.session.sysRole) req.session.sysRole = sysRole;
    var sharedDocs = {};
    var rawShares = (req.session && req.session.sharedDocs) || {};
    Object.keys(rawShares).forEach(function (id) {
      var row = rawShares[id];
      if (row && row.until && moment(row.until).isBefore(moment())) return;
      sharedDocs[String(id)] = row || true;
    });
    if (req.session) req.session.sharedDocs = sharedDocs;
    cb(null, {
      email: email,
      sysRole: sysRole,
      isAdmin: sysRole === 'admin',
      caps: Role.caps(sysRole),
      department: user && user.department ? String(user.department).trim() : '',
      identities: unique([email, user && user.emp_email, user && user.username]),
      linkRoles: (req.session && req.session.folderLinks) || {},
      sharedDocs: sharedDocs,
      user: user
    });
  });
});

Access.matchesIdentity = function (ctx, value) {
  var needle = String(value || '').trim().toLowerCase();
  if (!needle) return false;
  return (ctx.identities || []).some(function (id) {
    return String(id || '').trim().toLowerCase() === needle;
  });
};

Access.listGroupGrants = withTables(function (folderId, cb) {
  runSql("SELECT * FROM qms_folder_group_grants WHERE folder_id = ? ORDER BY group_type, group_key", [folderId], cb);
});

Access.grantGroup = withTables(function (data, cb) {
  runSql(
    "INSERT INTO qms_folder_group_grants (folder_id, group_type, group_key, access_role, granted_by, granted_at) VALUES (?,?,?,?,?,?) " +
    "ON DUPLICATE KEY UPDATE access_role = VALUES(access_role), granted_by = VALUES(granted_by), granted_at = VALUES(granted_at)",
    [data.folder_id, data.group_type, data.group_key, data.access_role, data.granted_by, data.granted_at || stamp()],
    cb
  );
});

Access.revokeGroup = withTables(function (grantId, folderId, cb) {
  runSql("DELETE FROM qms_folder_group_grants WHERE grant_id = ? AND folder_id = ?", [grantId, folderId], cb);
});

Access.applyGroupGrants = function (folder, ctx, grants, consider) {
  (grants || []).forEach(function (g) {
    var key = String(g.group_key || '').trim().toLowerCase();
    if (!key) return;
    if (g.group_type === 'department' && ctx.department && ctx.department.toLowerCase() === key) {
      consider(g.access_role, 'department');
    }
    if (g.group_type === 'team' && ctx.department && ctx.department.toLowerCase() === key) {
      consider(g.access_role, 'team');
    }
    if (g.group_type === 'menu' && folder.category_menu && String(folder.category_menu).toLowerCase() === key) {
      consider(g.access_role, 'menu');
    }
  });
};

Access.listDepartments = withTables(function (cb) {
  runSql(
    "SELECT department AS name FROM login WHERE department IS NOT NULL AND department <> '' GROUP BY department " +
    "UNION SELECT category_menu AS name FROM qms_folders WHERE status = 0 AND category_menu <> '' GROUP BY category_menu " +
    "ORDER BY name",
    [],
    cb
  );
});

Access.listTemplates = withTables(function (cb) {
  runSql("SELECT * FROM qms_access_templates ORDER BY template_name", [], function (err, rows) {
    if (err) return cb(err);
    runSql("SELECT * FROM qms_access_template_grants", [], function (gErr, grants) {
      if (gErr) return cb(gErr);
      var byT = {};
      (grants || []).forEach(function (g) {
        if (!byT[g.template_id]) byT[g.template_id] = [];
        byT[g.template_id].push(g);
      });
      cb(null, (rows || []).map(function (row) {
        row.grants = byT[row.template_id] || [];
        return row;
      }));
    });
  });
});

Access.getTemplate = withTables(function (templateId, cb) {
  runSql("SELECT * FROM qms_access_templates WHERE template_id = ?", [templateId], function (err, rows) {
    if (err) return cb(err);
    var row = rows && rows[0] ? rows[0] : null;
    if (!row) return cb(null, null);
    runSql("SELECT * FROM qms_access_template_grants WHERE template_id = ?", [templateId], function (gErr, grants) {
      if (gErr) return cb(gErr);
      row.grants = grants || [];
      cb(null, row);
    });
  });
});

Access.listRequests = withTables(function (folderId, cb) {
  runSql("SELECT * FROM qms_folder_access_requests WHERE folder_id = ? ORDER BY created_at DESC", [folderId], cb);
});

Access.createRequest = withTables(function (data, cb) {
  runSql(
    "SELECT request_id FROM qms_folder_access_requests WHERE folder_id = ? AND requested_by = ? AND status = 'pending' LIMIT 1",
    [data.folder_id, data.requested_by],
    function (err, rows) {
      if (err) return cb(err);
      if (rows && rows[0]) return cb(null, { request_id: rows[0].request_id, existing: true });
      runSql(
        "INSERT INTO qms_folder_access_requests (folder_id, requested_by, requested_role, message, status, created_at) VALUES (?,?,?,?, 'pending', ?)",
        [data.folder_id, data.requested_by, data.requested_role || 'viewer', data.message || '', stamp()],
        function (insErr, res) {
          if (insErr) return cb(insErr);
          cb(null, { request_id: res.insertId, existing: false });
        }
      );
    }
  );
});

Access.getRequest = withTables(function (requestId, cb) {
  runSql("SELECT * FROM qms_folder_access_requests WHERE request_id = ?", [requestId], function (err, rows) {
    if (err) return cb(err);
    cb(null, rows && rows[0] ? rows[0] : null);
  });
});

Access.decideRequest = withTables(function (requestId, status, decidedBy, cb) {
  runSql(
    "UPDATE qms_folder_access_requests SET status = ?, decided_by = ?, decided_at = ? WHERE request_id = ? AND status = 'pending'",
    [status, decidedBy, stamp(), requestId],
    cb
  );
});

Access.pendingRequestsFor = withTables(function (ctx, cb) {
  var sql =
    "SELECT r.*, f.folder_name, f.owner, f.category_menu, f.category_submenu, f.visibility " +
    "FROM qms_folder_access_requests r INNER JOIN qms_folders f ON f.folder_id = r.folder_id " +
    "WHERE r.status = 'pending' AND f.status = 0";
  var params = [];
  if (!ctx.isAdmin) {
    sql += " AND f.owner IN (" + (ctx.identities || ['']).map(function () { return '?'; }).join(',') + ")";
    params = (ctx.identities || []).slice();
    if (!params.length) return cb(null, []);
  }
  sql += " ORDER BY r.created_at DESC";
  runSql(sql, params, cb);
});

Access.listLinks = withTables(function (folderId, cb) {
  runSql("SELECT * FROM qms_folder_links WHERE folder_id = ? ORDER BY created_at DESC", [folderId], cb);
});

Access.createLink = withTables(function (data, cb) {
  runSql(
    "INSERT INTO qms_folder_links (folder_id, share_token, access_role, password_hash, expires_at, created_by, created_at, revoked) VALUES (?,?,?,?,?,?,?,0)",
    [
      data.folder_id,
      data.share_token,
      data.access_role || 'viewer',
      data.password_hash || '',
      data.expires_at || null,
      data.created_by,
      stamp()
    ],
    cb
  );
});

Access.getLinkByToken = withTables(function (token, cb) {
  runSql("SELECT * FROM qms_folder_links WHERE share_token = ? LIMIT 1", [token], function (err, rows) {
    if (err) return cb(err);
    cb(null, rows && rows[0] ? rows[0] : null);
  });
});

Access.touchLink = withTables(function (linkId, cb) {
  runSql("UPDATE qms_folder_links SET last_used_at = ? WHERE link_id = ?", [stamp(), linkId], cb || function () {});
});

Access.revokeLink = withTables(function (linkId, folderId, cb) {
  runSql("UPDATE qms_folder_links SET revoked = 1 WHERE link_id = ? AND folder_id = ?", [linkId, folderId], cb);
});

Access.notify = withTables(function (userEmail, data, cb) {
  if (!userEmail) return (cb || function () {})();
  runSql(
    "INSERT INTO qms_access_alerts (user_email, folder_id, kind, title, body, href, is_read, created_at) VALUES (?,?,?,?,?,?,0,?)",
    [
      userEmail,
      data.folder_id || null,
      data.kind || 'info',
      String(data.title || '').slice(0, 180),
      String(data.body || '').slice(0, 500),
      String(data.href || '').slice(0, 255),
      stamp()
    ],
    cb || function () {}
  );
});

Access.notifyMany = function (emails, data, cb) {
  var list = unique(emails);
  var i = 0;
  function next() {
    if (i >= list.length) return (cb || function () {})();
    Access.notify(list[i++], data, function () { next(); });
  }
  next();
};

Access.listAlerts = withTables(function (ctx, cb) {
  var ids = ctx.identities || [];
  if (!ids.length) return cb(null, []);
  runSql(
    "SELECT * FROM qms_access_alerts WHERE user_email IN (" + ids.map(function () { return '?'; }).join(',') + ") ORDER BY created_at DESC LIMIT 40",
    ids,
    cb
  );
});

Access.unreadCount = withTables(function (ctx, cb) {
  var ids = ctx.identities || [ctx.email];
  ids = unique(ids);
  if (!ids.length) return cb(null, 0);
  runSql(
    "SELECT COUNT(*) AS n FROM qms_access_alerts WHERE is_read = 0 AND user_email IN (" + ids.map(function () { return '?'; }).join(',') + ")",
    ids,
    function (err, rows) {
      if (err) return cb(err);
      cb(null, rows && rows[0] ? Number(rows[0].n) || 0 : 0);
    }
  );
});

Access.markRead = withTables(function (alertId, ctx, cb) {
  var ids = ctx.identities || [];
  if (!ids.length) return cb();
  runSql(
    "UPDATE qms_access_alerts SET is_read = 1 WHERE alert_id = ? AND user_email IN (" + ids.map(function () { return '?'; }).join(',') + ")",
    [alertId].concat(ids),
    cb
  );
});

Access.markAllRead = withTables(function (ctx, cb) {
  var ids = ctx.identities || [];
  if (!ids.length) return cb();
  runSql(
    "UPDATE qms_access_alerts SET is_read = 1 WHERE is_read = 0 AND user_email IN (" + ids.map(function () { return '?'; }).join(',') + ")",
    ids,
    cb
  );
});

Access.foldersForDocs = withTables(function (docIds, cb) {
  docIds = (docIds || []).map(Number).filter(function (id) { return id > 0; });
  if (!docIds.length) return cb(null, {});
  runSql(
    "SELECT fd.doc_num, fd.folder_id FROM qms_folder_documents fd INNER JOIN qms_folders f ON f.folder_id = fd.folder_id " +
    "WHERE f.status = 0 AND fd.doc_num IN (" + docIds.join(',') + ")",
    [],
    function (err, rows) {
      if (err) return cb(err);
      var map = {};
      (rows || []).forEach(function (row) {
        if (!map[row.doc_num]) map[row.doc_num] = [];
        map[row.doc_num].push(Number(row.folder_id));
      });
      cb(null, map);
    }
  );
});

Access.usersInDepartment = withTables(function (department, cb) {
  runSql(
    "SELECT emp_email, username FROM login WHERE department = ?",
    [department],
    cb
  );
});

Access.recertify = withTables(function (folderId, actor, intervalDays, cb) {
  var days = Number(intervalDays) || 90;
  var due = moment().add(days, 'days').format('YYYY-MM-DD');
  runSql(
    "UPDATE qms_folders SET last_recert_at = ?, last_recert_by = ?, recert_due = ?, recert_interval_days = ?, updated_at = ? WHERE folder_id = ? AND status = 0",
    [stamp(), actor, due, days, stamp(), folderId],
    cb
  );
});

Access.dueRecertFolders = withTables(function (cb) {
  runSql(
    "SELECT folder_id, folder_name, owner, recert_due FROM qms_folders WHERE status = 0 AND recert_due IS NOT NULL AND recert_due <= CURDATE()",
    [],
    cb
  );
});

Access.ensureRecertAlerts = withTables(function (cb) {
  Access.dueRecertFolders(function (err, rows) {
    if (err) return (cb || function () {})();
    var i = 0;
    function next() {
      if (i >= (rows || []).length) return (cb || function () {})();
      var folder = rows[i++];
      runSql(
        "SELECT alert_id FROM qms_access_alerts WHERE folder_id = ? AND kind = 'recert' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) LIMIT 1",
        [folder.folder_id],
        function (sErr, existing) {
          if (sErr || (existing && existing[0])) return next();
          Access.notify(folder.owner, {
            folder_id: folder.folder_id,
            kind: 'recert',
            title: 'Recertify access: ' + folder.folder_name,
            body: 'Confirm who still needs this folder. Access review is due.',
            href: '/library?folder=' + folder.folder_id
          }, function () { next(); });
        }
      );
    }
    next();
  });
});

Access.mapLink = function (row, origin) {
  return {
    link_id: row.link_id,
    folder_id: row.folder_id,
    access_role: row.access_role,
    expires_at: row.expires_at,
    created_by: row.created_by,
    created_at: row.created_at,
    revoked: !!row.revoked,
    has_password: !!(row.password_hash),
    last_used_at: row.last_used_at,
    url: (origin || '') + '/folders/shared/' + row.share_token,
    status: row.revoked ? 'revoked' : (row.expires_at && moment(row.expires_at).isBefore(moment()) ? 'expired' : 'active')
  };
};

module.exports = Access;
