const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const multer = require('multer');
const Folder = require('../models/folder.model');
const Version = require('../models/version.model');
const Access = require('../models/access.model');
const Role = require('../models/role.model');
const Mail = require('../models/mail.model');

var folderUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      var dir = path.join(path.resolve(), 'public', 'pdfFiles', 'library', String(req.params.id || ''));
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + path.basename(file.originalname).slice(0, 40));
    }
  })
});
exports.folderUpload = folderUpload;

function safeSegment(value) {
  return String(value || '').replace(/[\\/]/g, '').trim();
}

var locationUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      var menu = safeSegment(req.query.menu);
      var submenu = safeSegment(req.query.submenu);
      if (!menu) return cb(new Error('Open a folder before uploading a document.'));
      var dir = submenu
        ? path.join(path.resolve(), 'public', 'pdfFiles', menu, submenu)
        : path.join(path.resolve(), 'public', 'pdfFiles', menu);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + path.basename(file.originalname).slice(0, 40));
    }
  })
});
exports.locationUpload = locationUpload;

function nowStamp() {
  return moment().format('YYYY-MM-DD HH:mm:ss');
}

function dateOrNull(value) {
  if (!value) return null;
  var parsed = moment(value, ['YYYY-MM-DD', 'DD-MM-YYYY', moment.ISO_8601], true);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
}

function actor(req) {
  return req.session && req.session.username ? req.session.username : '';
}

function displayName(req) {
  var first = String((req.session && req.session.firstName) || '').trim();
  var last = String((req.session && req.session.lastName) || '').trim();
  var name = (first + ' ' + last).trim();
  return name || actor(req) || 'A QMS user';
}

function originOf(req) {
  var host = req.get('x-forwarded-host') || req.get('host') || '';
  var proto = req.get('x-forwarded-proto') || req.protocol || 'http';
  return proto + '://' + host;
}

function fileLibraryHref(doc, folder) {
  var parts = String((doc && doc.doc_path) || '').split('/');
  var menu = (folder && folder.category_menu) || parts[0] || '';
  var submenu = (folder && folder.category_submenu) || parts[1] || '';
  var href = '/library?open=' + encodeURIComponent(doc.doc_num);
  if (menu) href += '&menu=' + encodeURIComponent(menu);
  if (submenu) href += '&submenu=' + encodeURIComponent(submenu);
  if (folder && folder.folder_id) href += '&folder=' + folder.folder_id;
  return href;
}

function folderLibraryHref(folder) {
  if (!folder) return '/library';
  var href = '/library?folder=' + folder.folder_id;
  if (folder.category_menu) href += '&menu=' + encodeURIComponent(folder.category_menu);
  if (folder.category_submenu) href += '&submenu=' + encodeURIComponent(folder.category_submenu);
  return href;
}

function roleLabel(role) {
  if (role === 'member') return 'Member';
  if (role === 'admin') return 'Admin';
  var value = String(role || 'viewer');
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function allowedInviteRoles(req) {
  var roles = ['member'];
  if (Role.isAdmin(req)) roles.push('admin');
  return roles;
}

function rejectInviteRole(req, res, role) {
  if (allowedInviteRoles(req).indexOf(role) !== -1) return false;
  if (role === 'admin') {
    res.status(403).json({ success: false, message: 'Only an admin can invite someone with Admin access.' });
    return true;
  }
  res.status(400).json({
    success: false,
    message: role
      ? (Role.isAdmin(req)
        ? 'Choose Member or Admin access.'
        : 'Choose Member access.')
      : 'Choose a role.'
  });
  return true;
}

function inviteScope(req, res) {
  var department = String(req.body.department || '').trim().slice(0, 80);
  var visibility = String(req.body.visibility || '').toLowerCase();
  if (!department) {
    res.status(400).json({ success: false, message: 'Choose a department.' });
    return null;
  }
  if (visibility !== 'public' && visibility !== 'private') {
    res.status(400).json({ success: false, message: 'Choose Public or Private visibility.' });
    return null;
  }
  return { department: department, visibility: visibility };
}

function grantInviteAccess(invite, cb) {
  function grantList(folders, done) {
    var list = folders || [];
    var i = 0;
    function next(err) {
      if (err) return done(err);
      if (i >= list.length) return done(null, list[0] || null);
      var folder = list[i++];
      var folderRole = invite.access_role === 'admin'
        ? 'owner'
        : (invite.access_role === 'member' ? 'viewer' : (invite.access_role || 'viewer'));
      Folder.grantPermissionAtLeast({
        folder_id: folder.folder_id,
        user_email: invite.invited_email,
        access_role: folderRole,
        granted_by: invite.created_by || '',
        granted_at: nowStamp()
      }, function (gErr) { next(gErr); });
    }
    next();
  }
  if (invite.category_menu) {
    return Folder.listForLocation(invite.category_menu, invite.category_submenu, function (err, folders) {
      if (err) return cb(err);
      var list = folders || [];
      if (invite.folder_id && !list.some(function (row) { return Number(row.folder_id) === Number(invite.folder_id); })) {
        return Folder.getById(invite.folder_id, function (gErr, folder) {
          if (folder) list.push(folder);
          grantList(list, cb);
        });
      }
      grantList(list, cb);
    });
  }
  if (!invite.folder_id) return cb(new Error('Invite has no folder.'));
  Folder.getById(invite.folder_id, function (err, folder) {
    if (err) return cb(err);
    if (!folder) return cb(new Error('That folder is no longer available.'));
    grantList([folder], cb);
  });
}

function isAdmin(req) {
  return Role.isAdmin(req);
}

function requireAuth(req, res) {
  if (!req.session || !req.session.username) {
    res.status(401).json({ success: false, message: 'Please login to continue.' });
    return false;
  }
  return true;
}

function bumpIfExisting(req, res, docPath, file, onMiss) {
  Folder.findByNameInPath(docPath, file.originalname, function (err, existing) {
    if (err) return res.status(500).json({ success: false, message: 'Unable to check existing documents.' });
    if (!existing) return onMiss();
    var livePath = path.join(storedFileDir(existing.doc_path), file.filename);
    var nextDoc = Version.bump(existing.version, 'minor');
    var nextQms = Version.bump(existing.docRelVer, 'minor');
    Version.createSnapshot(existing, {
      bump_type: 'minor',
      change_comment: 'Uploaded a new file from Document Library.',
      created_by: actor(req),
      source_path: livePath,
      stored_name: file.filename,
      doc_version: nextDoc,
      qms_version: nextQms,
      doc_name: existing.doc_name || file.originalname,
      doc_desc: existing.docDesc || '',
      release_dt: moment().format('YYYY-MM-DD')
    }, function (sErr) {
      if (sErr) return res.status(500).json({ success: false, message: sErr.message || 'Unable to save the new version.' });
      Version.updateCurrentFile(existing.doc_num, {
        doc: file.filename,
        doc_name: existing.doc_name || file.originalname,
        docRelVer: nextQms,
        docDesc: existing.docDesc || '',
        version: nextDoc,
        releaseDt: moment().format('YYYY-MM-DD')
      }, function (uErr) {
        if (uErr) return res.status(500).json({ success: false, message: 'Unable to update the current version.' });
        res.json({ success: true, message: 'Document updated to v' + nextDoc + '.' });
      });
    });
  });
}

function canDo(role, minRole) {
  return (Folder.roleRank[role] || 0) >= (Folder.roleRank[minRole] || 0);
}

function sanitizeName(name) {
  return String(name || '').trim().slice(0, 150);
}

function audit(folderId, req, action, details, cb) {
  Folder.addAudit({
    folder_id: folderId || null,
    actor: actor(req),
    action: action,
    details: typeof details === 'string' ? details : JSON.stringify(details || {}),
    created_at: nowStamp()
  }, cb || function () {});
}

function loadFolderAccess(req, res, folderId, minRole, next) {
  Access.userContext(req, function (cErr, ctx) {
    if (cErr) return res.status(500).json({ success: false, message: 'Unable to resolve permissions.' });
    Folder.getById(folderId, function (err, folder) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to load folder.' });
      if (!folder) return res.status(404).json({ success: false, message: 'Folder not found.' });
      Folder.resolveAccess(folder, actor(req), isAdmin(req), function (aErr, access) {
        if (aErr) return res.status(500).json({ success: false, message: 'Unable to resolve permissions.' });
        if (!access.canView || (minRole && !canDo(access.role, minRole))) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission for this folder action.',
            canRequest: !!access.canRequest
          });
        }
        next(folder, access, ctx);
      }, ctx);
    });
  });
}

function requireDocMin(req, res, docNum, minRole, next) {
  Access.userContext(req, function (err, ctx) {
    if (err) return res.status(500).json({ success: false, message: 'Unable to resolve permissions.' });
    Folder.bestDocAccess(docNum, ctx, function (aErr, access) {
      if (aErr) return res.status(500).json({ success: false, message: 'Unable to resolve permissions.' });
      if (!access.canView || (minRole && !canDo(access.role, minRole))) {
        return res.status(403).json({ success: false, message: 'You do not have permission for this file.' });
      }
      next(access, ctx);
    });
  });
}

function notifyAccess(userEmail, folder, kind, title, body) {
  if (!userEmail || !folder) return;
  Access.notify(userEmail, {
    folder_id: folder.folder_id,
    kind: kind,
    title: title,
    body: body,
    href: '/library?folder=' + folder.folder_id +
      (folder.category_menu ? '&menu=' + encodeURIComponent(folder.category_menu) : '') +
      (folder.category_submenu ? '&submenu=' + encodeURIComponent(folder.category_submenu) : '')
  });
}

function decorateFolder(folder, access) {
  return {
    folder_id: folder.folder_id,
    parent_id: folder.parent_id,
    folder_name: folder.folder_name,
    description: folder.description,
    category_menu: folder.category_menu,
    category_submenu: folder.category_submenu,
    visibility: folder.visibility,
    lifecycle_status: folder.lifecycle_status,
    owner: folder.owner,
    inherit_permissions: folder.inherit_permissions,
    review_date: folder.review_date,
    retain_until: folder.retain_until,
    tags: folder.tags,
    created_by: folder.created_by,
    created_at: folder.created_at,
    updated_at: folder.updated_at,
    doc_count: folder.doc_count || 0,
    child_count: folder.child_count || 0,
    access_role: access ? access.role : null,
    access_source: access ? access.source : null,
    next_lifecycle: Folder.lifecycleNext[folder.lifecycle_status] || []
  };
}

function filterVisible(folders, req, cb) {
  var visible = [];
  var i = 0;
  function next() {
    if (i >= folders.length) return cb(null, visible);
    var folder = folders[i++];
    Folder.resolveAccess(folder, actor(req), isAdmin(req), function (err, access) {
      if (err) return cb(err);
      if (access.canView) visible.push(decorateFolder(folder, access));
      next();
    });
  }
  next();
}

exports.list = function (req, res) {
  if (!requireAuth(req, res)) return;
  var menu = req.query.menu || '';
  var submenu = req.query.submenu || '';
  var q = (req.query.q || '').trim();
  if (!menu || !submenu) {
    return res.status(400).json({ success: false, message: 'Category menu and submenu are required.' });
  }
  var loader = q ? function (cb) { Folder.search(menu, submenu, q, cb); } : function (cb) { Folder.listByCategory(menu, submenu, cb); };
  loader(function (err, rows) {
    if (err) return res.status(500).json({ success: false, message: 'Unable to list folders.' });
    includeAncestors(rows || [], function (aErr, withParents) {
      if (aErr) return res.status(500).json({ success: false, message: 'Unable to list folders.' });
      filterVisible(withParents || [], req, function (fErr, visible) {
        if (fErr) return res.status(500).json({ success: false, message: 'Unable to apply folder permissions.' });
        res.json({ success: true, folders: visible, query: q });
      });
    });
  });
};

function includeAncestors(folders, cb) {
  var byId = {};
  (folders || []).forEach(function (f) { byId[Number(f.folder_id)] = f; });
  var queue = (folders || []).filter(function (f) {
    return f.parent_id && !byId[Number(f.parent_id)];
  }).map(function (f) { return Number(f.parent_id); });

  function next() {
    if (!queue.length) return cb(null, folders);
    var id = queue.shift();
    if (byId[id]) return next();
    Folder.getById(id, function (err, parent) {
      if (err) return cb(err);
      if (parent) {
        byId[Number(parent.folder_id)] = parent;
        folders.push(parent);
        if (parent.parent_id && !byId[Number(parent.parent_id)]) {
          queue.push(Number(parent.parent_id));
        }
      }
      next();
    });
  }
  next();
}

exports.create = function (req, res) {
  if (!requireAuth(req, res)) return;
  if (!Role.requireMin(req, res, 'editor')) return;
  var name = sanitizeName(req.body.folder_name);
  var menu = String(req.body.menu || '');
  var submenu = String(req.body.submenu || '');
  if (!name) return res.status(400).json({ success: false, message: 'Folder name is required.' });

  function persist(parentId) {
    var payload = {
      parent_id: parentId,
      folder_name: name,
      description: String(req.body.description || '').trim().slice(0, 500),
      category_menu: menu,
      category_submenu: submenu,
      visibility: req.body.visibility || 'restricted',
      lifecycle_status: req.body.lifecycle_status || 'draft',
      owner: actor(req),
      inherit_permissions: req.body.inherit_permissions === 0 || req.body.inherit_permissions === '0' ? 0 : 1,
      review_date: dateOrNull(req.body.review_date),
      retain_until: dateOrNull(req.body.retain_until),
      tags: String(req.body.tags || '').trim().slice(0, 255),
      created_by: actor(req),
      created_at: nowStamp(),
      updated_at: nowStamp()
    };
    Folder.create(payload, function (err, created) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to create folder.' });
      audit(created.folder_id, req, 'folder.create', { name: name, parent_id: parentId });
      res.json({ success: true, folder_id: created.folder_id, message: 'Folder created.' });
    });
  }

  var parentId = req.body.parent_id ? Number(req.body.parent_id) : null;
  if (!parentId) return persist(null);
  loadFolderAccess(req, res, parentId, 'editor', function (parent) {
    if (parent.category_menu !== menu || parent.category_submenu !== submenu) {
      return res.status(400).json({ success: false, message: 'Parent folder must belong to the same category.' });
    }
    persist(parentId);
  });
};

exports.detail = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  loadFolderAccess(req, res, folderId, 'viewer', function (folder, access) {
    Folder.listPermissions(folderId, function (pErr, perms) {
      if (pErr) return res.status(500).json({ success: false, message: 'Unable to load permissions.' });
      Folder.listShares(folderId, function (sErr, shares) {
        if (sErr) return res.status(500).json({ success: false, message: 'Unable to load shares.' });
        Folder.listDocuments(folderId, function (dErr, docs) {
          if (dErr) return res.status(500).json({ success: false, message: 'Unable to load documents.' });
          Folder.listAudit(folderId, function (aErr, logs) {
            if (aErr) return res.status(500).json({ success: false, message: 'Unable to load audit log.' });
            res.json({
              success: true,
              folder: decorateFolder(folder, access),
              permissions: perms || [],
              shares: shares || [],
              documents: docs || [],
              audit: logs || [],
              capabilities: {
                canEdit: canDo(access.role, 'editor') && folder.lifecycle_status !== 'obsolete',
                canShare: canDo(access.role, 'editor'),
                canManageAccess: canDo(access.role, 'owner'),
                canLifecycle: canDo(access.role, 'editor'),
                canDelete: canDo(access.role, 'owner'),
                canAudit: canDo(access.role, 'auditor')
              }
            });
          });
        });
      });
    });
  });
};

exports.update = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  loadFolderAccess(req, res, folderId, 'editor', function (folder) {
    if (folder.lifecycle_status === 'obsolete') {
      return res.status(400).json({ success: false, message: 'Obsolete folders cannot be edited. Restore the lifecycle first.' });
    }
    var name = sanitizeName(req.body.folder_name);
    if (!name) return res.status(400).json({ success: false, message: 'Folder name is required.' });
    var parentId = req.body.parent_id ? Number(req.body.parent_id) : null;
    Folder.hasCycle(folderId, parentId, function (cErr, cyclic) {
      if (cErr) return res.status(500).json({ success: false, message: 'Unable to validate folder move.' });
      if (cyclic) return res.status(400).json({ success: false, message: 'A folder cannot be moved into itself or its descendants.' });
      var payload = {
        parent_id: parentId,
        folder_name: name,
        description: String(req.body.description || '').trim().slice(0, 500),
        visibility: req.body.visibility || folder.visibility,
        inherit_permissions: req.body.inherit_permissions === 0 || req.body.inherit_permissions === '0' ? 0 : 1,
        review_date: dateOrNull(req.body.review_date),
        retain_until: dateOrNull(req.body.retain_until),
        tags: String(req.body.tags || '').trim().slice(0, 255),
        updated_at: nowStamp()
      };
      Folder.update(folderId, payload, function (err) {
        if (err) return res.status(500).json({ success: false, message: 'Unable to update folder.' });
        audit(folderId, req, 'folder.update', payload);
        res.json({ success: true, message: 'Folder updated.' });
      });
    });
  });
};

function safeLocationName(value) {
  var name = String(value || '').trim();
  if (!name || name.length > 80) return '';
  if (/[\\/]|\.\./.test(name)) return '';
  return name;
}

exports.remove = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  loadFolderAccess(req, res, folderId, 'editor', function (folder) {
    Folder.softDeleteTree(folderId, nowStamp(), function (dErr) {
      if (dErr) return res.status(500).json({ success: false, message: 'Unable to delete folder.' });
      audit(folderId, req, 'folder.delete', { name: folder.folder_name });
      res.json({ success: true, message: 'Folder deleted.' });
    });
  });
};

exports.removeLocation = function (req, res) {
  if (!requireAuth(req, res)) return;
  if (!Role.requireMin(req, res, 'editor')) return;
  var kind = String(req.body.kind || '');
  var menu = safeLocationName(req.body.menu);
  var submenu = kind === 'department' ? safeLocationName(req.body.submenu) : '';
  if (kind !== 'category' && kind !== 'department') {
    return res.status(400).json({ success: false, message: 'Choose a folder to delete.' });
  }
  if (!menu || (kind === 'department' && !submenu)) {
    return res.status(400).json({ success: false, message: 'Choose a folder to delete.' });
  }
  Folder.hideLocation(menu, submenu, nowStamp(), function (err) {
    if (err) return res.status(500).json({ success: false, message: 'Unable to delete folder.' });
    res.json({ success: true, message: 'Folder deleted.' });
  });
};

exports.grantPermission = function (req, res) {
  if (!requireAuth(req, res)) return;
  if (!Role.requireMin(req, res, 'editor')) return;
  var folderId = Number(req.params.id);
  loadFolderAccess(req, res, folderId, 'owner', function (folder) {
    var email = String(req.body.user_email || '').trim();
    var role = req.body.access_role || 'viewer';
    if (!email) return res.status(400).json({ success: false, message: 'User email is required.' });
    if (['owner', 'editor', 'viewer', 'auditor'].indexOf(role) === -1) {
      return res.status(400).json({ success: false, message: 'Invalid access role.' });
    }
    Folder.grantPermission({
      folder_id: folderId,
      user_email: email,
      access_role: role,
      granted_by: actor(req),
      granted_at: nowStamp()
    }, function (err) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to grant permission.' });
      audit(folderId, req, 'permission.grant', { user_email: email, access_role: role });
      notifyAccess(email, folder, 'share', 'Access granted: ' + folder.folder_name,
        actor(req) + ' gave you ' + role + ' access to ' + folder.folder_name + '.');
      res.json({ success: true, message: 'Permission granted.' });
    });
  });
};

exports.revokePermission = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  var permId = Number(req.params.permId);
  loadFolderAccess(req, res, folderId, 'owner', function (folder) {
    Folder.listPermissions(folderId, function (lErr, perms) {
      var row = (perms || []).filter(function (p) { return Number(p.perm_id) === permId; })[0];
      Folder.revokePermission(permId, folderId, function (err) {
        if (err) return res.status(500).json({ success: false, message: 'Unable to revoke permission.' });
        audit(folderId, req, 'permission.revoke', { perm_id: permId });
        if (row) {
          notifyAccess(row.user_email, folder, 'revoke', 'Access revoked: ' + folder.folder_name,
            actor(req) + ' removed your access to ' + folder.folder_name + '.');
        }
        res.json({ success: true, message: 'Permission revoked.' });
      });
    });
  });
};

exports.share = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  loadFolderAccess(req, res, folderId, 'editor', function (folder) {
    var email = String(req.body.shared_with || '').trim();
    var role = req.body.access_role || 'viewer';
    if (!email) return res.status(400).json({ success: false, message: 'Share recipient is required.' });
    if (['editor', 'viewer', 'auditor'].indexOf(role) === -1) {
      return res.status(400).json({ success: false, message: 'Invalid share role.' });
    }
    Folder.createShare({
      folder_id: folderId,
      shared_with: email,
      access_role: role,
      share_token: crypto.randomBytes(16).toString('hex'),
      expires_at: req.body.expires_at ? moment(req.body.expires_at).format('YYYY-MM-DD HH:mm:ss') : null,
      created_by: actor(req),
      created_at: nowStamp()
    }, function (err, result) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to share folder.' });
      audit(folderId, req, 'share.create', { shared_with: email, access_role: role, expires_at: req.body.expires_at || null });
      notifyAccess(email, folder, 'share', 'Folder shared: ' + folder.folder_name,
        actor(req) + ' shared ' + folder.folder_name + ' with you as ' + role + '.');
      res.json({ success: true, share_id: result.insertId, message: 'Folder shared.' });
    });
  });
};

exports.revokeShare = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  var shareId = Number(req.params.shareId);
  loadFolderAccess(req, res, folderId, 'editor', function (folder) {
    Folder.listShares(folderId, function (lErr, shares) {
      var row = (shares || []).filter(function (s) { return Number(s.share_id) === shareId; })[0];
      Folder.revokeShare(shareId, folderId, function (err) {
        if (err) return res.status(500).json({ success: false, message: 'Unable to revoke share.' });
        audit(folderId, req, 'share.revoke', { share_id: shareId });
        if (row) {
          notifyAccess(row.shared_with, folder, 'revoke', 'Share revoked: ' + folder.folder_name,
            actor(req) + ' revoked your share on ' + folder.folder_name + '.');
        }
        res.json({ success: true, message: 'Share revoked.' });
      });
    });
  });
};

exports.changeLifecycle = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  loadFolderAccess(req, res, folderId, 'editor', function (folder, access) {
    var next = req.body.lifecycle_status;
    var allowed = Folder.lifecycleNext[folder.lifecycle_status] || [];
    if (allowed.indexOf(next) === -1) {
      return res.status(400).json({ success: false, message: 'That lifecycle transition is not allowed.' });
    }
    if (folder.lifecycle_status === 'obsolete' && !isAdmin(req) && access.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Only an owner or admin can restore an obsolete folder.' });
    }
    Folder.setLifecycle(folderId, next, nowStamp(), function (err) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to update lifecycle.' });
      audit(folderId, req, 'lifecycle.change', { from: folder.lifecycle_status, to: next });
      res.json({ success: true, message: 'Lifecycle updated to ' + next + '.' });
    });
  });
};

exports.uploadToLocation = function (req, res) {
  if (!requireAuth(req, res)) return;
  if (!Role.requireMin(req, res, 'editor')) return;
  if (!req.file) return res.status(400).json({ success: false, message: 'Choose a file to upload.' });
  var menu = safeSegment(req.query.menu);
  var submenu = safeSegment(req.query.submenu);
  var folderId = Number(req.query.folder || req.body.folder_id || 0);
  if (folderId) {
    return loadFolderAccess(req, res, folderId, 'editor', function () {
      req.params.id = folderId;
      exports.uploadToFolder(req, res);
    });
  }
  if (!menu) return res.status(400).json({ success: false, message: 'Open a folder before uploading a document.' });
  var today = moment().format('YYYY-MM-DD');
  var docPath = submenu ? menu + '/' + submenu : menu;
  bumpIfExisting(req, res, docPath, req.file, function () {
  Folder.saveUploadedFile({
    doc_name: req.file.originalname,
    doc_path: docPath,
    doc: req.file.filename,
    created_at: today,
    created_by: actor(req).slice(0, 50),
    last_modified: today,
    last_accessed: today,
    version: '1.0',
    docRelVer: '1.0',
    docDesc: '',
    releaseDt: today
  }, function (err, saved) {
    if (err) return res.status(500).json({ success: false, message: 'Unable to upload document.' });
    Folder.getFile(saved.doc_num, function (gErr, doc) {
      Version.recordInitial(doc || {
        doc_num: saved.doc_num,
        doc_path: docPath,
        doc: req.file.filename,
        doc_name: req.file.originalname,
        version: '1.0',
        docRelVer: '1.0',
        releaseDt: today,
        created_by: actor(req)
      }, actor(req), function () {
        res.json({ success: true, message: 'Document uploaded as v1.0.' });
      });
    });
  });
  });
};

exports.uploadToFolder = function (req, res) {
  if (!requireAuth(req, res)) return;
  if (!req.file) return res.status(400).json({ success: false, message: 'Choose a file to upload.' });
  var folderId = Number(req.params.id);
  loadFolderAccess(req, res, folderId, 'editor', function (folder) {
    if (folder.lifecycle_status === 'obsolete' || folder.lifecycle_status === 'archived') {
      return res.status(400).json({ success: false, message: 'Documents cannot be added to archived or obsolete folders.' });
    }
    var today = moment().format('YYYY-MM-DD');
    var docPath = 'library/' + folderId;
    bumpIfExisting(req, res, docPath, req.file, function () {
    Folder.saveUploadedFile({
      doc_name: req.file.originalname,
      doc_path: docPath,
      doc: req.file.filename,
      created_at: today,
      created_by: actor(req).slice(0, 50),
      last_modified: today,
      last_accessed: today,
      version: '1.0',
      docRelVer: '1.0',
      docDesc: '',
      releaseDt: today
    }, function (err, saved) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to upload document.' });
      Folder.addDocument({
        folder_id: folderId,
        doc_num: saved.doc_num,
        added_by: actor(req),
        added_at: nowStamp()
      }, function (aErr) {
        if (aErr) return res.status(500).json({ success: false, message: 'Unable to add document to folder.' });
        audit(folderId, req, 'document.upload', { doc_num: saved.doc_num, name: req.file.originalname });
        Folder.getFile(saved.doc_num, function (gErr, doc) {
          Version.recordInitial(doc || {
            doc_num: saved.doc_num,
            doc_path: docPath,
            doc: req.file.filename,
            doc_name: req.file.originalname,
            version: '1.0',
            docRelVer: '1.0',
            releaseDt: today,
            created_by: actor(req)
          }, actor(req), function () {
            res.json({ success: true, message: 'Document uploaded as v1.0.' });
          });
        });
      });
    });
    });
  });
};

exports.addDocuments = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  loadFolderAccess(req, res, folderId, 'editor', function (folder) {
    if (folder.lifecycle_status === 'obsolete' || folder.lifecycle_status === 'archived') {
      return res.status(400).json({ success: false, message: 'Documents cannot be added to archived or obsolete folders.' });
    }
    var docNums = req.body.doc_nums || req.body['doc_nums[]'] || [];
    if (!Array.isArray(docNums)) docNums = String(docNums).split(',');
    docNums = docNums.map(Number).filter(Boolean);
    if (!docNums.length) return res.status(400).json({ success: false, message: 'Select at least one document.' });
    var filePath = folder.category_menu + '/' + folder.category_submenu;
    Folder.listCategoryDocuments(filePath, function (err, available) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to load category documents.' });
      var allowed = {};
      (available || []).forEach(function (d) { allowed[d.doc_num] = true; });
      var i = 0;
      var added = 0;
      function next() {
        if (i >= docNums.length) {
          audit(folderId, req, 'document.add', { doc_nums: docNums, added: added });
          return res.json({ success: true, message: added + ' document(s) added to folder.' });
        }
        var docNum = docNums[i++];
        if (!allowed[docNum]) return next();
        Folder.addDocument({
          folder_id: folderId,
          doc_num: docNum,
          added_by: actor(req),
          added_at: nowStamp()
        }, function (aErr) {
          if (!aErr) added += 1;
          next();
        });
      }
      next();
    });
  });
};

exports.removeDocument = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  var docNum = Number(req.params.docNum);
  loadFolderAccess(req, res, folderId, 'editor', function () {
    Folder.removeDocument(folderId, docNum, function (err) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to remove document.' });
      audit(folderId, req, 'document.remove', { doc_num: docNum });
      res.json({ success: true, message: 'Document removed from folder.' });
    });
  });
};

function libraryDestinations(locations, folders) {
  var depMap = {};
  function addDep(menu, submenu) {
    menu = String(menu || '').trim();
    submenu = String(submenu || '').trim();
    if (!menu || menu === 'library') return;
    if (!depMap[menu]) depMap[menu] = {};
    if (submenu && submenu !== menu) depMap[menu][submenu] = true;
  }
  (locations || []).forEach(function (row) { addDep(row.menu, row.submenu); });
  (folders || []).forEach(function (row) { addDep(row.category_menu, row.category_submenu); });

  var children = {};
  (folders || []).forEach(function (folder) {
    var key = folder.parent_id ? String(folder.parent_id) : '0';
    if (!children[key]) children[key] = [];
    children[key].push(folder);
  });
  Object.keys(children).forEach(function (key) {
    children[key].sort(function (a, b) {
      return String(a.folder_name).localeCompare(String(b.folder_name));
    });
  });

  var items = [];
  var seen = {};
  function pushNode(id, name, parentId) {
    if (seen[id]) return;
    seen[id] = true;
    items.push({ folder_id: id, folder_name: name, parent_id: parentId || '' });
  }
  function addFolder(folder, parentKey) {
    var id = String(folder.folder_id);
    pushNode(id, folder.folder_name, parentKey);
    (children[id] || []).forEach(function (child) { addFolder(child, id); });
  }

  Object.keys(depMap).sort().forEach(function (menu) {
    var subs = Object.keys(depMap[menu]).sort();
    pushNode('loc:' + menu, menu, '');
    subs.forEach(function (sub) {
      var locId = 'loc:' + menu + '/' + sub;
      pushNode(locId, sub, 'loc:' + menu);
      (children['0'] || []).forEach(function (folder) {
        if (folder.category_menu === menu && folder.category_submenu === sub) addFolder(folder, locId);
      });
    });
  });

  (children['0'] || []).forEach(function (folder) {
    if (folder.category_menu) return;
    addFolder(folder, '');
  });
  return items;
}

function parseLocation(value) {
  var loc = String(value || '').slice(4);
  var slash = loc.indexOf('/');
  if (slash === -1) return { menu: loc, submenu: '' };
  return { menu: loc.slice(0, slash), submenu: loc.slice(slash + 1) };
}

function shiftStoredFile(doc, menu, submenu, copyFile) {
  var parts = String(doc.doc_path || '').split('/');
  var fileName = path.basename(String(doc.doc || ''));
  if (!fileName) return;
  var root = path.resolve();
  var oldPath = path.join(root, 'public', 'pdfFiles', parts[0] || '', parts[1] || '', fileName);
  var newDir = submenu
    ? path.join(root, 'public', 'pdfFiles', menu, submenu)
    : path.join(root, 'public', 'pdfFiles', menu);
  var newPath = path.join(newDir, fileName);
  if (!fs.existsSync(oldPath) || path.resolve(oldPath) === path.resolve(newPath)) return;
  fs.mkdirSync(newDir, { recursive: true });
  if (copyFile) fs.copyFileSync(oldPath, newPath);
  else fs.renameSync(oldPath, newPath);
}

exports.destinations = function (req, res) {
  if (!requireAuth(req, res)) return;
  Folder.listDocLocations(function (err, locations) {
    if (err) return res.status(500).json({ success: false, message: 'Unable to load folders.' });
    Folder.listPicker(function (fErr, folders) {
      if (fErr) return res.status(500).json({ success: false, message: 'Unable to load folders.' });
      res.json({ success: true, folders: libraryDestinations(locations, folders) });
    });
  });
};

exports.transfer = function (req, res) {
  if (!requireAuth(req, res)) return;
  if (!Role.requireMin(req, res, 'editor')) return;
  var mode = req.body.mode === 'copy' ? 'copy' : 'move';
  var kind = req.body.kind === 'document' ? 'document' : 'folder';
  var id = Number(req.body.id);
  var destRaw = String(req.body.destination_id || '');
  var destId = Number(destRaw);
  var sourceId = req.body.source_folder_id ? Number(req.body.source_folder_id) : 0;
  if (!id || !destRaw) return res.status(400).json({ success: false, message: 'Choose a destination folder.' });

  if (destRaw.indexOf('loc:') === 0) {
    var place = parseLocation(destRaw);
    if (!place.menu) return res.status(400).json({ success: false, message: 'Choose a destination folder.' });
    var docPath = place.submenu ? place.menu + '/' + place.submenu : place.menu;
    if (kind === 'document') {
      return requireDocMin(req, res, id, 'editor', function () {
      return Folder.getFile(id, function (fErr, doc) {
        if (fErr || !doc) return res.status(404).json({ success: false, message: 'Document was not found.' });
        try { shiftStoredFile(doc, place.menu, place.submenu, mode === 'copy'); } catch (e) {}
        if (mode === 'copy') {
          return Folder.saveUploadedFile({
            doc_name: doc.doc_name || doc.doc,
            doc_path: docPath,
            doc: doc.doc,
            created_at: moment().format('YYYY-MM-DD'),
            created_by: actor(req).slice(0, 50),
            last_modified: moment().format('YYYY-MM-DD'),
            last_accessed: moment().format('YYYY-MM-DD'),
            version: doc.version || 1,
            docRelVer: doc.docRelVer || 1,
            docDesc: doc.docDesc || '',
            releaseDt: doc.releaseDt || moment().format('YYYY-MM-DD')
          }, function (cErr) {
            if (cErr) return res.status(500).json({ success: false, message: 'Unable to copy the document.' });
            res.json({ success: true, message: 'Document copied.' });
          });
        }
        Folder.setFilePath(id, docPath, function (pErr) {
          if (pErr) return res.status(500).json({ success: false, message: 'Unable to move the document.' });
          if (!sourceId) return res.json({ success: true, message: 'Document moved.' });
          Folder.removeDocument(sourceId, id, function () {
            res.json({ success: true, message: 'Document moved.' });
          });
        });
      });
      });
    }
    if (mode === 'move') {
      return loadFolderAccess(req, res, id, 'editor', function () {
      return Folder.place(id, {
        parent_id: null,
        category_menu: place.menu,
        category_submenu: place.submenu,
        updated_at: nowStamp()
      }, function (pErr) {
        if (pErr) return res.status(500).json({ success: false, message: 'Unable to move folder.' });
        res.json({ success: true, message: 'Folder moved.' });
      });
      });
    }
    return loadFolderAccess(req, res, id, 'editor', function (folder) {
      Folder.create({
        parent_id: null,
        folder_name: folder.folder_name,
        description: folder.description || '',
        category_menu: place.menu,
        category_submenu: place.submenu,
        visibility: folder.visibility || 'restricted',
        lifecycle_status: 'draft',
        owner: actor(req),
        inherit_permissions: 1,
        tags: folder.tags || '',
        created_by: actor(req),
        created_at: nowStamp(),
        updated_at: nowStamp()
      }, function (cErr) {
        if (cErr) return res.status(500).json({ success: false, message: 'Unable to copy folder.' });
        res.json({ success: true, message: 'Folder copied.' });
      });
    });
  }

  if (!destId) return res.status(400).json({ success: false, message: 'Choose a destination folder.' });

  function loadFolder(folderId, next) {
    Folder.getById(folderId, function (err, folder) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to load folder.' });
      if (!folder) return res.status(404).json({ success: false, message: 'Folder not found.' });
      next(folder);
    });
  }

  if (kind === 'document') {
    return requireDocMin(req, res, id, 'editor', function () {
    return loadFolderAccess(req, res, destId, 'editor', function () {
      Folder.addDocument({
        folder_id: destId,
        doc_num: id,
        added_by: actor(req),
        added_at: nowStamp()
      }, function (err) {
        if (err && err.code !== 'ER_DUP_ENTRY') {
          return res.status(500).json({ success: false, message: 'Unable to add the document.' });
        }
        if (mode === 'copy' || !sourceId || sourceId === destId) {
          return res.json({ success: true, message: mode === 'copy' ? 'Document copied.' : 'Document moved.' });
        }
        Folder.removeDocument(sourceId, id, function (rErr) {
          if (rErr) return res.status(500).json({ success: false, message: 'Unable to move the document.' });
          res.json({ success: true, message: 'Document moved.' });
        });
      });
    });
    });
  }

  loadFolderAccess(req, res, id, 'editor', function (folder) {
    if (mode === 'move') {
      return loadFolderAccess(req, res, destId, 'editor', function () {
      return Folder.hasCycle(id, destId, function (cErr, cyclic) {
        if (cErr) return res.status(500).json({ success: false, message: 'Unable to move folder.' });
        if (cyclic) return res.status(400).json({ success: false, message: 'A folder cannot be moved into itself.' });
        Folder.update(id, {
          parent_id: destId,
          folder_name: folder.folder_name,
          description: folder.description,
          visibility: folder.visibility,
          inherit_permissions: folder.inherit_permissions,
          review_date: folder.review_date,
          retain_until: folder.retain_until,
          tags: folder.tags,
          updated_at: nowStamp()
        }, function (uErr) {
          if (uErr) return res.status(500).json({ success: false, message: 'Unable to move folder.' });
          audit(id, req, 'folder.move', { destination_id: destId });
          res.json({ success: true, message: 'Folder moved.' });
        });
      });
      });
    }
    loadFolderAccess(req, res, destId, 'editor', function (dest) {
      Folder.create({
        parent_id: destId,
        folder_name: folder.folder_name,
        description: folder.description || '',
        category_menu: dest.category_menu || '',
        category_submenu: dest.category_submenu || '',
        visibility: folder.visibility || 'restricted',
        lifecycle_status: 'draft',
        owner: actor(req),
        inherit_permissions: 1,
        tags: folder.tags || '',
        created_by: actor(req),
        created_at: nowStamp(),
        updated_at: nowStamp()
      }, function (cErr, created) {
        if (cErr) return res.status(500).json({ success: false, message: 'Unable to copy folder.' });
        Folder.listDocuments(id, function (lErr, docs) {
          if (lErr || !docs || !docs.length) {
            audit(created.folder_id, req, 'folder.copy', { source_id: id, destination_id: destId });
            return res.json({ success: true, message: 'Folder copied.' });
          }
          var i = 0;
          function next() {
            if (i >= docs.length) {
              audit(created.folder_id, req, 'folder.copy', { source_id: id, destination_id: destId });
              return res.json({ success: true, message: 'Folder copied.' });
            }
            var doc = docs[i++];
            if (!doc.doc_num) return next();
            Folder.addDocument({
              folder_id: created.folder_id,
              doc_num: doc.doc_num,
              added_by: actor(req),
              added_at: nowStamp()
            }, function () { next(); });
          }
          next();
        });
      });
    });
  });
};

function storedFileDir(docPath) {
  var parts = String(docPath || '').split('/');
  return path.join(path.resolve(), 'public', 'pdfFiles', parts[0] || '', parts[1] || '');
}

function splitFileName(name) {
  var base = path.basename(String(name || 'file'));
  var dot = base.lastIndexOf('.');
  if (dot <= 0) return { base: base, ext: '' };
  return { base: base.slice(0, dot), ext: base.slice(dot) };
}

function nextDuplicateNames(storedName, displayName, dir) {
  var storedParts = splitFileName(storedName || displayName);
  var labelParts = splitFileName(displayName || storedName);
  var ext = storedParts.ext.slice(0, 12);
  var n = 1;
  var stored = '';
  while (n < 100) {
    var tag = n === 1 ? '-copy' : '-copy' + n;
    var room = 50 - tag.length - ext.length;
    if (room < 1) room = 1;
    stored = (storedParts.base.slice(0, room) + tag + ext).slice(0, 50);
    if (!fs.existsSync(path.join(dir, stored))) break;
    n += 1;
  }
  var labelTag = n === 1 ? ' - Copy' : ' - Copy ' + n;
  return {
    stored: stored,
    label: (labelParts.base + labelTag + labelParts.ext).slice(0, 255)
  };
}

exports.duplicateItem = function (req, res) {
  if (!requireAuth(req, res)) return;
  if (!Role.requireMin(req, res, 'editor')) return;
  var id = Number(req.body.id);
  var sourceId = req.body.source_folder_id ? Number(req.body.source_folder_id) : 0;
  if (!id) return res.status(400).json({ success: false, message: 'File was not found.' });
  requireDocMin(req, res, id, 'editor', function () {
  Folder.getFile(id, function (err, doc) {
    if (err || !doc) return res.status(404).json({ success: false, message: 'File was not found.' });
    var dir = storedFileDir(doc.doc_path);
    var names = nextDuplicateNames(doc.doc || doc.doc_name, doc.doc_name || doc.doc, dir);
    var oldName = path.basename(String(doc.doc || ''));
    var oldPath = oldName ? path.join(dir, oldName) : '';
    try {
      if (oldPath && fs.existsSync(oldPath)) {
        fs.mkdirSync(dir, { recursive: true });
        fs.copyFileSync(oldPath, path.join(dir, names.stored));
      }
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Unable to duplicate the file.' });
    }
    var today = moment().format('YYYY-MM-DD');
    Folder.saveUploadedFile({
      doc_name: names.label,
      doc_path: doc.doc_path,
      doc: names.stored,
      created_at: today,
      created_by: actor(req).slice(0, 50),
      last_modified: today,
      last_accessed: today,
      version: doc.version || 1,
      docRelVer: doc.docRelVer || 1,
      docDesc: doc.docDesc || '',
      releaseDt: doc.releaseDt || today
    }, function (cErr, saved) {
      if (cErr || !saved) return res.status(500).json({ success: false, message: 'Unable to duplicate the file.' });
      Folder.getFile(saved.doc_num, function (gErr, copyDoc) {
        Version.recordInitial(copyDoc || {
          doc_num: saved.doc_num,
          doc_path: doc.doc_path,
          doc: names.stored,
          doc_name: names.label,
          version: doc.version || 1,
          docRelVer: doc.docRelVer || 1,
          docDesc: doc.docDesc || '',
          releaseDt: doc.releaseDt || today,
          created_by: actor(req)
        }, actor(req), function () {
          if (!sourceId) return res.json({ success: true, message: 'File duplicated.' });
          Folder.addDocument({
            folder_id: sourceId,
            doc_num: saved.doc_num,
            added_by: actor(req),
            added_at: nowStamp()
          }, function () {
            res.json({ success: true, message: 'File duplicated.' });
          });
        });
      });
    });
  });
  });
};

exports.renameItem = function (req, res) {
  if (!requireAuth(req, res)) return;
  if (!Role.requireMin(req, res, 'editor')) return;
  var kind = req.body.kind === 'document' ? 'document' : 'folder';
  var id = Number(req.body.id);
  var name = sanitizeName(req.body.name);
  if (!id || !name) return res.status(400).json({ success: false, message: 'A name is required.' });
  if (kind === 'document') {
    return requireDocMin(req, res, id, 'editor', function () {
      Folder.renameFile(id, name, function (err) {
        if (err) return res.status(500).json({ success: false, message: 'Unable to rename the document.' });
        res.json({ success: true, message: 'Document renamed.' });
      });
    });
  }
  loadFolderAccess(req, res, id, 'editor', function () {
    Folder.renameFolder(id, name, nowStamp(), function (err) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to rename the folder.' });
      res.json({ success: true, message: 'Folder renamed.' });
    });
  });
};

exports.restoreItem = function (req, res) {
  if (!requireAuth(req, res)) return;
  if (!Role.requireMin(req, res, 'editor')) return;
  var kind = req.body.kind === 'document' ? 'document' : 'folder';
  var id = Number(req.body.id);
  if (!id) return res.status(400).json({ success: false, message: 'Item was not found.' });
  var done = function (err) {
    if (err) return res.status(500).json({ success: false, message: 'Unable to restore this item.' });
    res.json({ success: true, message: 'Item restored.' });
  };
  if (kind === 'document') return Folder.restoreFile(id, done);
  Folder.restoreFolder(id, nowStamp(), done);
};

exports.purgeItem = function (req, res) {
  if (!requireAuth(req, res)) return;
  if (!Role.requireMin(req, res, 'admin')) return;
  var kind = req.body.kind === 'document' ? 'document' : 'folder';
  var id = Number(req.body.id);
  if (!id) return res.status(400).json({ success: false, message: 'Item was not found.' });
  if (kind === 'folder') {
    return Folder.purgeFolder(id, function (err) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to delete this folder.' });
      res.json({ success: true, message: 'Folder deleted permanently.' });
    });
  }
  Folder.getFileAny(id, function (err, doc) {
    if (!err && doc && doc.doc) {
      var parts = String(doc.doc_path || '').split('/');
      var filePath = path.join(path.resolve(), 'public', 'pdfFiles', parts[0] || '', parts[1] || '', path.basename(String(doc.doc)));
      try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
    }
    Folder.purgeFile(id, function (pErr) {
      if (pErr) return res.status(500).json({ success: false, message: 'Unable to delete this document.' });
      res.json({ success: true, message: 'Document deleted permanently.' });
    });
  });
};

var ALLOWED_UPDATE_EXTS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'];

var replaceUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      var dir = path.join(path.resolve(), 'public', 'pdfFiles', '_updates');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      var ext = path.extname(file.originalname || '');
      var base = path.basename(file.originalname || 'file', ext).replace(/[^\w.-]+/g, '_').slice(0, 18) || 'file';
      cb(null, String(Date.now()).slice(-10) + '-' + base + ext);
    }
  }),
  fileFilter: function (req, file, cb) {
    var ext = path.extname(file.originalname || '').toLowerCase();
    if (ALLOWED_UPDATE_EXTS.indexOf(ext) === -1) {
      return cb(new Error('Upload a Word, PDF, PowerPoint, or Excel file.'));
    }
    cb(null, true);
  }
});

function extFamily(ext) {
  ext = String(ext || '').toLowerCase().replace(/^\./, '');
  if (['doc', 'docx'].indexOf(ext) !== -1) return 'word';
  if (['xls', 'xlsx'].indexOf(ext) !== -1) return 'excel';
  if (['ppt', 'pptx'].indexOf(ext) !== -1) return 'ppt';
  if (ext === 'pdf') return 'pdf';
  return ext;
}

function originalExt(doc) {
  return path.extname(doc && doc.doc ? doc.doc : '') ||
    path.extname(doc && doc.doc_name ? doc.doc_name : '') ||
    path.extname(doc && doc.doc_file ? doc.doc_file : '');
}

function keepOriginalName(doc, uploadName) {
  var current = String((doc && (doc.doc_name || doc.doc)) || '').replace(/^.*[\\/]/, '').trim();
  var ext = originalExt(doc) || path.extname(uploadName || '');
  var base = current ? current.replace(/\.[^.]+$/, '') : String(uploadName || 'document').replace(/\.[^.]+$/, '');
  return ((base || 'document') + ext).slice(0, 255);
}

exports.updateLibraryDocument = function (req, res) {
  replaceUpload.single('doc_file')(req, res, function (upErr) {
    if (upErr) return res.status(400).json({ success: false, message: upErr.message || 'Unable to upload that file.' });
    if (!requireAuth(req, res)) return;
    if (!Role.requireMin(req, res, 'editor')) return;
    if (!req.file) return res.status(400).json({ success: false, message: 'Choose a file to upload.' });
    var docNum = Number(req.params.docNum);
    if (!docNum) return res.status(400).json({ success: false, message: 'Document was not found.' });
    var mode = String(req.body.mode || req.query.mode || '') === 'current' ? 'current' : 'new';
    requireDocMin(req, res, docNum, 'editor', function (access) {
      Folder.getFile(docNum, function (err, doc) {
        if (err) return res.status(500).json({ success: false, message: 'Unable to load document.' });
        if (!doc) return res.status(404).json({ success: false, message: 'Document was not found.' });
        var today = moment().format('YYYY-MM-DD');
        var sourceExt = originalExt(doc);
        var uploadExt = path.extname(req.file.originalname || '');
        if (sourceExt && uploadExt && extFamily(sourceExt) !== extFamily(uploadExt)) {
          return res.status(400).json({
            success: false,
            message: 'Keep the original ' + sourceExt.replace('.', '').toUpperCase() + ' format when updating this document.'
          });
        }
        var storedName = path.basename(String(doc.doc || req.file.originalname || 'document'));
        var nextName = keepOriginalName(doc, req.file.originalname);
        if (mode === 'current') {
          return Version.replaceCurrentFile(doc, {
            created_by: actor(req),
            source_path: req.file.path,
            stored_name: storedName,
            doc_name: nextName
          }, function (rErr, result) {
            if (rErr) return res.status(500).json({ success: false, message: rErr.message || 'Unable to replace the file.' });
            Version.updateCurrentFile(doc.doc_num, {
              doc: result.doc || doc.doc,
              doc_name: nextName,
              docRelVer: doc.docRelVer,
              docDesc: doc.docDesc || '',
              version: doc.version,
              releaseDt: doc.releaseDt || today,
              last_modified: today
            }, function (uErr) {
              if (uErr) {
                console.log('updateCurrentFile current', uErr);
                return res.status(500).json({ success: false, message: uErr.message || 'Unable to save the updated file.' });
              }
              if (access && access.folderId) {
                audit(access.folderId, req, 'document.replace', { doc_num: doc.doc_num, mode: 'current' });
              }
              res.json({
                success: true,
                message: 'File updated in the current version (v' + Version.normalize(doc.version) + ').',
                version: Version.normalize(doc.version),
                mode: 'current'
              });
            });
          });
        }
        Version.createSnapshot(doc, {
          bump_type: 'minor',
          change_comment: 'Updated file from Document Library.',
          created_by: actor(req),
          source_path: req.file.path,
          stored_name: storedName,
          doc_name: nextName,
          doc_desc: doc.docDesc || '',
          release_dt: today
        }, function (sErr, snap) {
          if (sErr) return res.status(500).json({ success: false, message: sErr.message || 'Unable to save the new version.' });
          var liveName;
          try {
            liveName = Version.overwriteLive(doc, req.file.path);
          } catch (copyErr) {
            return res.status(500).json({ success: false, message: copyErr.message || 'Unable to save the new version.' });
          }
          var nextDoc = (snap && snap.doc_version) || Version.bump(doc.version, 'minor');
          var nextQms = (snap && snap.qms_version) || Version.bump(doc.docRelVer, 'minor');
          Version.updateCurrentFile(doc.doc_num, {
            doc: liveName || doc.doc,
            doc_name: nextName,
            docRelVer: nextQms,
            docDesc: doc.docDesc || '',
            version: nextDoc,
            releaseDt: today,
            last_modified: today
          }, function (uErr) {
            if (uErr) {
              console.log('updateCurrentFile new', uErr);
              return res.status(500).json({ success: false, message: uErr.message || 'Unable to save the new version.' });
            }
            if (access && access.folderId) {
              audit(access.folderId, req, 'document.replace', { doc_num: doc.doc_num, mode: 'new', version: nextDoc });
            }
            res.json({
              success: true,
              message: 'Document updated to v' + nextDoc + '.',
              version: nextDoc,
              mode: 'new'
            });
          });
        });
      });
    });
  });
};

exports.inviteLocation = function (req, res) {
  if (!requireAuth(req, res)) return;
  if (!Role.requireMin(req, res, 'editor')) return;
  var email = String(req.body.email || req.body.invited_email || '').trim();
  var role = String(req.body.access_role || '').toLowerCase();
  var menu = String(req.body.menu || '').trim();
  var submenu = String(req.body.submenu || '').trim();
  var folderName = String(req.body.folder_name || menu || submenu || 'Document Library').trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
  }
  if (rejectInviteRole(req, res, role)) return;
  var scope = inviteScope(req, res);
  if (!scope) return;
  if (!menu && !submenu) {
    return res.status(400).json({ success: false, message: 'Choose a folder to invite someone to.' });
  }
  var expiresAt = req.body.expires_at ? moment(req.body.expires_at).format('YYYY-MM-DD HH:mm:ss') : null;
  if (req.body.expires_at && !moment(expiresAt).isValid()) expiresAt = null;
  Folder.listForLocation(menu, submenu, function (err, folders) {
    if (err) return res.status(500).json({ success: false, message: 'Unable to load folders.' });
    if (!folders || !folders.length) {
      return res.status(404).json({ success: false, message: 'No folders were found in this location.' });
    }
    var token = crypto.randomBytes(16).toString('hex');
    Folder.createInvite({
      folder_id: folders[0].folder_id,
      category_menu: menu,
      category_submenu: submenu,
      invited_email: email,
      access_role: role,
      department: scope.department,
      visibility: scope.visibility,
      invite_token: token,
      expires_at: expiresAt,
      created_by: actor(req),
      created_at: nowStamp()
    }, function (sErr) {
      if (sErr) return res.status(500).json({ success: false, message: 'Unable to create the invite.' });
      var link = originOf(req) + '/invite/folder/' + token;
      var expiresLabel = expiresAt ? moment(expiresAt).format('D MMM YYYY, h:mm A') : '';
      Mail.sendMail({
        to: email,
        subject: displayName(req) + ' invited you to ' + folderName,
        html: Mail.inviteMemberHtml({
          folderName: folderName,
          sender: displayName(req),
          roleLabel: roleLabel(role),
          department: scope.department,
          visibility: scope.visibility,
          link: link,
          expiresLabel: expiresLabel
        })
      }, function (mErr) {
        if (mErr) {
          return res.status(502).json({ success: false, message: mErr.message || 'Unable to send the invite email.' });
        }
        res.json({ success: true, message: 'Invite sent to ' + email + '.' });
      });
    });
  });
};

exports.inviteMember = function (req, res) {
  if (!requireAuth(req, res)) return;
  if (!Role.requireMin(req, res, 'editor')) return;
  var folderId = Number(req.params.id);
  var email = String(req.body.email || req.body.invited_email || '').trim();
  var role = String(req.body.access_role || '').toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
  }
  if (rejectInviteRole(req, res, role)) return;
  var scope = inviteScope(req, res);
  if (!scope) return;
  var expiresAt = req.body.expires_at ? moment(req.body.expires_at).format('YYYY-MM-DD HH:mm:ss') : null;
  if (req.body.expires_at && !moment(expiresAt).isValid()) expiresAt = null;
  Folder.getById(folderId, function (fErr, folder) {
    if (fErr) return res.status(500).json({ success: false, message: 'Unable to load folder.' });
    if (!folder) return res.status(404).json({ success: false, message: 'Folder was not found.' });
    var token = crypto.randomBytes(16).toString('hex');
    Folder.createInvite({
      folder_id: folderId,
      category_menu: folder.category_menu || '',
      category_submenu: folder.category_submenu || '',
      invited_email: email,
      access_role: role,
      department: scope.department,
      visibility: scope.visibility,
      invite_token: token,
      expires_at: expiresAt,
      created_by: actor(req),
      created_at: nowStamp()
    }, function (err) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to create the invite.' });
      var link = originOf(req) + '/invite/folder/' + token;
      var expiresLabel = expiresAt ? moment(expiresAt).format('D MMM YYYY, h:mm A') : '';
      Mail.sendMail({
        to: email,
        subject: displayName(req) + ' invited you to ' + folder.folder_name,
        html: Mail.inviteMemberHtml({
          folderName: folder.folder_name,
          sender: displayName(req),
          roleLabel: roleLabel(role),
          department: scope.department,
          visibility: scope.visibility,
          link: link,
          expiresLabel: expiresLabel
        })
      }, function (mErr) {
        if (mErr) {
          return res.status(502).json({ success: false, message: mErr.message || 'Unable to send the invite email.' });
        }
        audit(folderId, req, 'folder.invite', {
          invited_email: email,
          access_role: role,
          department: scope.department,
          visibility: scope.visibility
        });
        notifyAccess(email, folder, 'share', 'Folder invite: ' + folder.folder_name,
          actor(req) + ' invited you to ' + folder.folder_name + ' as ' + role + '.');
        res.json({ success: true, message: 'Invite sent to ' + email + '.' });
      });
    });
  });
};

exports.openFolderInvite = function (req, res) {
  var token = String(req.params.token || '').replace(/[^a-f0-9]/gi, '');
  if (!token) {
    return res.status(404).render('login', { title: 'Login Page', message: 'That invite link is not valid.', success: false, next: '' });
  }
  Folder.getInviteByToken(token, function (err, invite) {
    if (err || !invite || invite.revoked) {
      return res.status(404).render('login', { title: 'Login Page', message: 'That invite link is not valid.', success: false, next: '' });
    }
    if (invite.expires_at && moment(invite.expires_at).isBefore(moment())) {
      return res.status(410).render('login', { title: 'Login Page', message: 'That invite link has expired.', success: false, next: '' });
    }
    if (!req.session || !req.session.username) {
      return res.redirect('/login?next=' + encodeURIComponent('/invite/folder/' + token));
    }
    Access.userContext(req, function (cErr, ctx) {
      if (cErr || !ctx) {
        return res.status(500).render('login', { title: 'Login Page', message: 'Unable to accept this invite.', success: false, next: '' });
      }
      if (!Access.matchesIdentity(ctx, invite.invited_email)) {
        return res.render('login', {
          title: 'Login Page',
          message: 'Sign in as ' + invite.invited_email + ' to join this folder.',
          success: false,
          next: '/invite/folder/' + token
        });
      }
      grantInviteAccess(invite, function (gErr, folder) {
        if (gErr || !folder) {
          return res.status(404).render('login', { title: 'Login Page', message: 'That folder is no longer available.', success: false, next: '' });
        }
        function finishAccept() {
          function done() {
          Folder.acceptInvite(invite.invite_id, actor(req), function () {});
          audit(folder.folder_id, req, 'folder.invite.accept', {
            invited_email: invite.invited_email,
            access_role: invite.access_role,
            department: invite.department || '',
            visibility: invite.visibility || 'private'
          });
          var href = folderLibraryHref(folder);
          if (invite.category_menu && !invite.folder_id) {
            href = '/library?menu=' + encodeURIComponent(invite.category_menu);
            if (invite.category_submenu) href += '&submenu=' + encodeURIComponent(invite.category_submenu);
          }
          req.session.save(function () {
            res.redirect(href);
          });
          }
          if (!invite.department || String(invite.department).toLowerCase() === 'all') return done();
          Role.setDepartment(invite.invited_email, invite.department, function () { done(); });
        }
        if (invite.access_role !== 'admin') return finishAccept();
        Role.promoteToAdmin(invite.invited_email, function (pErr) {
          if (pErr) {
            return res.status(500).render('login', {
              title: 'Login Page',
              message: pErr.message || 'Unable to grant Admin access.',
              success: false,
              next: ''
            });
          }
          Role.attachSession(req, { sys_role: 'admin' });
          finishAccept();
        });
      });
    });
  });
};

exports.shareLibraryDocument = function (req, res) {
  if (!requireAuth(req, res)) return;
  if (!Role.requireMin(req, res, 'editor')) return;
  var docNum = Number(req.params.docNum);
  var email = String(req.body.email || req.body.shared_with || '').trim();
  if (!docNum) return res.status(400).json({ success: false, message: 'Document was not found.' });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
  }
  var expiresAt = req.body.expires_at ? moment(req.body.expires_at).format('YYYY-MM-DD HH:mm:ss') : null;
  if (req.body.expires_at && !moment(expiresAt).isValid()) expiresAt = null;
  requireDocMin(req, res, docNum, 'editor', function (access) {
    Folder.getFile(docNum, function (err, doc) {
      if (err || !doc) return res.status(404).json({ success: false, message: 'Document was not found.' });
      var token = crypto.randomBytes(16).toString('hex');
      var fileName = doc.doc_name || doc.doc || 'Shared document';
      var folderId = access && access.folderId ? access.folderId : null;
      function storeAndSend(folder) {
        Folder.createFileShare({
          doc_num: docNum,
          folder_id: (folder && folder.folder_id) || folderId,
          shared_with: email,
          share_token: token,
          expires_at: expiresAt,
          created_by: actor(req),
          created_at: nowStamp(),
          file_name: fileName
        }, function (sErr) {
          if (sErr) return res.status(500).json({ success: false, message: 'Unable to create the share link.' });
          var link = originOf(req) + '/share/file/' + token;
          var expiresLabel = expiresAt ? moment(expiresAt).format('D MMM YYYY, h:mm A') : '';
          Mail.sendMail({
            to: email,
            subject: displayName(req) + ' shared a document: ' + fileName,
            html: Mail.fileShareHtml({
              fileName: fileName,
              sender: displayName(req),
              link: link,
              expiresLabel: expiresLabel
            })
          }, function (mErr) {
            if (mErr) {
              return res.status(502).json({ success: false, message: mErr.message || 'Unable to send the email.' });
            }
            if (folder) {
              notifyAccess(email, folder, 'share', 'File shared: ' + fileName,
                actor(req) + ' shared ' + fileName + ' with you.');
              audit(folder.folder_id, req, 'file.share-mail', { doc_num: docNum, shared_with: email });
            }
            res.json({ success: true, message: 'Share email sent to ' + email + '.' });
          });
        });
      }
      if (!folderId) return storeAndSend(null);
      Folder.getById(folderId, function (fErr, folder) {
        storeAndSend(folder || null);
      });
    });
  });
};

exports.openFileShare = function (req, res) {
  var token = String(req.params.token || '').replace(/[^a-f0-9]/gi, '');
  if (!token) {
    return res.status(404).render('login', { title: 'Login Page', message: 'That file link is not valid.', success: false, next: '' });
  }
  Folder.getFileShareByToken(token, function (err, share) {
    if (err || !share || share.revoked) {
      return res.status(404).render('login', { title: 'Login Page', message: 'That file link is not valid.', success: false, next: '' });
    }
    if (share.expires_at && moment(share.expires_at).isBefore(moment())) {
      return res.status(410).render('login', { title: 'Login Page', message: 'That file link has expired.', success: false, next: '' });
    }
    if (!req.session || !req.session.username) {
      var next = '/share/file/' + token;
      return res.redirect('/login?next=' + encodeURIComponent(next));
    }
    Folder.getFile(share.doc_num, function (fErr, doc) {
      if (fErr || !doc) {
        return res.status(404).render('login', { title: 'Login Page', message: 'That file is no longer available.', success: false, next: '' });
      }
      function finish(folder) {
        req.session.sharedDocs = req.session.sharedDocs || {};
        req.session.sharedDocs[String(doc.doc_num)] = {
          token: token,
          until: share.expires_at || null,
          folderId: (folder && folder.folder_id) || share.folder_id || null
        };
        Folder.touchFileShare(share.share_id, function () {});
        var href = fileLibraryHref(doc, folder);
        req.session.save(function () {
          res.redirect(href);
        });
      }
      if (!share.folder_id) {
        return Access.foldersForDocs([doc.doc_num], function (mErr, map) {
          var ids = (map && map[doc.doc_num]) || [];
          if (!ids.length) return finish(null);
          Folder.getById(ids[0], function (gErr, folder) {
            finish(folder || null);
          });
        });
      }
      Folder.getById(share.folder_id, function (gErr, folder) {
        finish(folder || null);
      });
    });
  });
};

exports.removeLibraryDocument = function (req, res) {
  if (!requireAuth(req, res)) return;
  if (!Role.requireMin(req, res, 'editor')) return;
  var docNum = Number(req.params.docNum);
  if (!docNum) return res.status(400).json({ success: false, message: 'Document was not found.' });
  requireDocMin(req, res, docNum, 'editor', function () {
    Folder.hideDocument(docNum, function (err) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to delete document.' });
      res.json({ success: true, message: 'Document deleted.' });
    });
  });
};

exports.categoryDocuments = function (req, res) {
  if (!requireAuth(req, res)) return;
  var menu = req.query.menu || '';
  var submenu = req.query.submenu || '';
  if (!menu || !submenu) return res.status(400).json({ success: false, message: 'Category is required.' });
  Folder.listCategoryDocuments(menu + '/' + submenu, function (err, docs) {
    if (err) return res.status(500).json({ success: false, message: 'Unable to load documents.' });
    res.json({ success: true, documents: docs || [] });
  });
};

exports.users = function (req, res) {
  if (!requireAuth(req, res)) return;
  Folder.listUsers(function (err, users) {
    if (err) return res.status(500).json({ success: false, message: 'Unable to load users.' });
    res.json({ success: true, users: users || [] });
  });
};
