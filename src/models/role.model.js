var moment = require('moment');
var dbConn = require('./../../config/db.config');

var Role = {};

Role.RANK = { viewer: 1, auditor: 2, editor: 3, admin: 4 };
Role.FOLDER_RANK = { viewer: 1, auditor: 2, editor: 3, owner: 4 };

Role.DUMMY_USERS = [
  {
    first_name: 'Admin',
    last_name: 'Test',
    username: 'qms.admin',
    emp_email: 'qms.admin@metricsnumero.com',
    pswd: 'QmsAdmin#2026',
    sys_role: 'admin',
    user_role: 1,
    folder_role: null
  },
  {
    first_name: 'Editor',
    last_name: 'Test',
    username: 'qms.editor',
    emp_email: 'qms.editor@metricsnumero.com',
    pswd: 'QmsEditor#2026',
    sys_role: 'editor',
    user_role: 0,
    folder_role: 'editor'
  },
  {
    first_name: 'Viewer',
    last_name: 'Test',
    username: 'qms.viewer',
    emp_email: 'qms.viewer@metricsnumero.com',
    pswd: 'QmsViewer#2026',
    sys_role: 'viewer',
    user_role: 0,
    folder_role: 'viewer'
  },
  {
    first_name: 'Auditor',
    last_name: 'Test',
    username: 'qms.auditor',
    emp_email: 'qms.auditor@metricsnumero.com',
    pswd: 'QmsAuditor#2026',
    sys_role: 'auditor',
    user_role: 0,
    folder_role: 'auditor'
  }
];

function runSql(sql, params, cb) {
  dbConn.query(sql, params || [], function (err, res) {
    if (err) return cb(err);
    cb(null, res);
  });
}

Role.normalize = function (value) {
  var role = String(value || '').toLowerCase().trim();
  return Role.RANK[role] ? role : '';
};

Role.fromUser = function (user) {
  var named = Role.normalize(user && user.sys_role);
  if (named) return named;
  if (user && Number(user.user_role) > 0) return 'admin';
  return 'viewer';
};

Role.fromRequest = function (req) {
  if (req && req.session && req.session.sysRole) {
    var named = Role.normalize(req.session.sysRole);
    if (named) return named;
  }
  try {
    if (req && req.session && req.session.userrole && Number(req.session.userrole[0].user_role) > 0) {
      return 'admin';
    }
  } catch (e) {}
  return 'viewer';
};

Role.isAdmin = function (req) {
  return Role.fromRequest(req) === 'admin';
};

Role.can = function (sysRole, minRole) {
  return (Role.RANK[Role.normalize(sysRole) || 'viewer'] || 0) >= (Role.RANK[minRole] || 0);
};

Role.caps = function (sysRole) {
  var role = Role.normalize(sysRole) || 'viewer';
  var rank = Role.RANK[role] || 1;
  return {
    sysRole: role,
    isAdmin: role === 'admin',
    canView: rank >= 1,
    canAudit: rank >= 2,
    canUpload: rank >= 3,
    canEdit: rank >= 3,
    canShare: rank >= 3,
    canCreateFolder: rank >= 3,
    canDelete: rank >= 3,
    canRecycle: rank >= 3,
    canSeePending: rank >= 3,
    canManageUsers: role === 'admin'
  };
};

Role.label = function (sysRole) {
  var role = Role.normalize(sysRole) || 'viewer';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

Role.capFolderRole = function (folderRole, sysRole) {
  var sys = Role.normalize(sysRole) || 'viewer';
  if (sys === 'admin') return folderRole || 'owner';
  if (!folderRole) return null;
  if (sys === 'viewer') return 'viewer';
  if (sys === 'auditor') {
    return (Role.FOLDER_RANK[folderRole] || 0) > Role.FOLDER_RANK.auditor ? 'auditor' : folderRole;
  }
  return folderRole;
};

Role.unscopedDocRole = function (sysRole) {
  var sys = Role.normalize(sysRole) || 'viewer';
  if (sys === 'admin' || sys === 'editor') return 'editor';
  if (sys === 'auditor') return 'auditor';
  return 'viewer';
};

Role.applySysCap = function (access, sysRole) {
  var sys = Role.normalize(sysRole) || 'viewer';
  access = access || { role: null, source: null, canView: false, canRequest: false };
  if (sys === 'admin') {
    return { role: 'owner', source: access.source || 'admin', canView: true, canRequest: false };
  }
  if (!access.canView) return access;
  var capped = Role.capFolderRole(access.role, sys);
  if (!capped) {
    return { role: null, source: null, canView: false, canRequest: !!access.canRequest };
  }
  return { role: capped, source: access.source, canView: true, canRequest: false };
};

Role.attachSession = function (req, user) {
  var sys = Role.fromUser(user);
  req.session.sysRole = sys;
  req.session.userrole = [{ user_role: sys === 'admin' ? 1 : 0 }];
  if (user) {
    req.session.firstName = user.first_name || req.session.firstName;
    req.session.lastName = user.last_name || req.session.lastName;
  }
};

Role.setDepartment = function (email, department, cb) {
  var value = String(email || '').trim();
  var dept = String(department || '').trim().slice(0, 80);
  if (!value || !dept) return cb(null);
  runSql(
    "UPDATE login SET department = ? WHERE LOWER(emp_email) = LOWER(?) OR LOWER(username) = LOWER(?)",
    [dept, value, value],
    function (err) { cb(err || null); }
  );
};

Role.promoteToAdmin = function (email, cb) {
  var value = String(email || '').trim();
  if (!value) return cb(new Error('Email is required.'));
  runSql(
    "SELECT user_id FROM login WHERE LOWER(emp_email) = LOWER(?) OR LOWER(username) = LOWER(?) LIMIT 1",
    [value, value],
    function (err, rows) {
      if (err) return cb(err);
      if (!rows || !rows[0]) return cb(new Error('No user account was found for ' + value + '.'));
      runSql(
        "UPDATE login SET sys_role = 'admin', user_role = 1 WHERE user_id = ?",
        [rows[0].user_id],
        cb
      );
    }
  );
};

Role.requireMin = function (req, res, minRole) {
  var sys = Role.fromRequest(req);
  if (Role.can(sys, minRole)) return true;
  res.status(403).json({ success: false, message: 'Your user role cannot do this.' });
  return false;
};

var ready = false;

function grantDummyFolderAccess(cb) {
  var now = moment().format('YYYY-MM-DD HH:mm:ss');
  var i = 0;
  function next() {
    if (i >= Role.DUMMY_USERS.length) return cb();
    var user = Role.DUMMY_USERS[i++];
    if (!user.folder_role) return next();
    runSql(
      "INSERT INTO qms_folder_permissions (folder_id, user_email, access_role, granted_by, granted_at) " +
      "SELECT folder_id, ?, ?, 'system', ? FROM qms_folders WHERE status = 0 " +
      "ON DUPLICATE KEY UPDATE access_role = VALUES(access_role), granted_by = VALUES(granted_by), granted_at = VALUES(granted_at)",
      [user.emp_email, user.folder_role, now],
      function () { next(); }
    );
  }
  next();
}

function upsertDummyUser(user, cb) {
  var oldEmail = String(user.username || '') + '@alpha-numero.com';
  runSql(
    "SELECT user_id FROM login WHERE emp_email = ? OR emp_email = ? OR username = ? LIMIT 1",
    [user.emp_email, oldEmail, user.username],
    function (err, rows) {
      if (err) return cb(err);
      if (rows && rows[0]) {
        return runSql(
          "UPDATE login SET first_name = ?, last_name = ?, username = ?, emp_email = ?, pswd = ?, user_role = ?, department = ?, reporting_manager = ?, sys_role = ? WHERE user_id = ?",
          [user.first_name, user.last_name, user.username, user.emp_email, user.pswd, user.user_role, 'Quality', 'QMS Lead', user.sys_role, rows[0].user_id],
          function (uErr) {
            if (uErr) return cb(uErr);
            runSql(
              "UPDATE qms_folder_permissions SET user_email = ? WHERE user_email = ?",
              [user.emp_email, oldEmail],
              function () { cb(); }
            );
          }
        );
      }
      runSql("SELECT COALESCE(MAX(user_id), 0) + 1 AS next_id FROM login", [], function (idErr, idRows) {
        if (idErr) return cb(idErr);
        var nextId = (idRows && idRows[0] && idRows[0].next_id) ? Number(idRows[0].next_id) : 1;
        runSql(
          "INSERT INTO login (user_id, first_name, last_name, username, emp_email, pswd, user_role, department, reporting_manager, sys_role) VALUES (?,?,?,?,?,?,?,?,?,?)",
          [nextId, user.first_name, user.last_name, user.username, user.emp_email, user.pswd, user.user_role, 'Quality', 'QMS Lead', user.sys_role],
          cb
        );
      });
    }
  );
}

Role.ensure = function (cb) {
  cb = cb || function () {};
  function finish() {
    grantDummyFolderAccess(function () {
      ready = true;
      cb();
    });
  }
  if (ready) return finish();
  runSql("ALTER TABLE login ADD COLUMN sys_role varchar(20) NOT NULL DEFAULT 'viewer'", [], function () {
    runSql("UPDATE login SET sys_role = 'admin' WHERE (sys_role IS NULL OR sys_role = '' OR sys_role = 'viewer') AND user_role > 0", [], function () {
      runSql("UPDATE login SET sys_role = 'viewer' WHERE sys_role IS NULL OR sys_role = ''", [], function () {
        var i = 0;
        function nextUser(err) {
          if (err) return cb(err);
          if (i >= Role.DUMMY_USERS.length) return finish();
          upsertDummyUser(Role.DUMMY_USERS[i++], nextUser);
        }
        nextUser();
      });
    });
  });
};

module.exports = Role;
