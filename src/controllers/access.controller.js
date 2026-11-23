const crypto = require('crypto');
const moment = require('moment');
const Folder = require('../models/folder.model');
const Access = require('../models/access.model');
const Role = require('../models/role.model');

function requireAuth(req, res) {
  if (!req.session || !req.session.username) {
    if (req.xhr || (req.headers.accept || '').indexOf('json') !== -1) {
      res.status(401).json({ success: false, message: 'Please login.' });
    } else {
      res.redirect('/login');
    }
    return false;
  }
  return true;
}

function actor(req) {
  return String(req.session.username || req.session.emp_email || 'user').slice(0, 155);
}

function canDo(role, minRole) {
  return (Folder.roleRank[role] || 0) >= (Folder.roleRank[minRole] || 0);
}

function originOf(req) {
  var host = req.get('x-forwarded-host') || req.get('host') || '';
  var proto = req.get('x-forwarded-proto') || req.protocol || 'http';
  return proto + '://' + host;
}

function folderHref(folder) {
  if (!folder) return '/library';
  var href = '/library?folder=' + folder.folder_id;
  if (folder.category_menu) href += '&menu=' + encodeURIComponent(folder.category_menu);
  if (folder.category_submenu) href += '&submenu=' + encodeURIComponent(folder.category_submenu);
  return href;
}

function loadAccess(req, res, folderId, minRole, next) {
  Access.userContext(req, function (cErr, ctx) {
    if (cErr) return res.status(500).json({ success: false, message: 'Unable to resolve access.' });
    Folder.getById(folderId, function (err, folder) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to load folder.' });
      if (!folder) return res.status(404).json({ success: false, message: 'Folder not found.' });
      Folder.resolveAccess(folder, ctx.email, ctx.isAdmin, function (aErr, access) {
        if (aErr) return res.status(500).json({ success: false, message: 'Unable to resolve permissions.' });
        if (minRole === 'request') return next(folder, access, ctx);
        if (!access.canView || (minRole && !canDo(access.role, minRole))) {
          return res.status(403).json({ success: false, message: 'You do not have permission for this folder action.', canRequest: !!access.canRequest });
        }
        next(folder, access, ctx);
      }, ctx);
    });
  });
}

function notifyFolderPeople(folder, emails, payload) {
  var list = [folder.owner].concat(emails || []);
  Access.notifyMany(list, payload);
}

exports.panel = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  loadAccess(req, res, folderId, 'request', function (folder, access, ctx) {
    if (!access.canView && !ctx.isAdmin) {
      return res.json({
        success: true,
        locked: true,
        canRequest: !!access.canRequest,
        folder: {
          folder_id: folder.folder_id,
          folder_name: folder.folder_name,
          visibility: folder.visibility,
          owner: folder.owner
        },
        capabilities: Folder.capsFromAccess(access)
      });
    }
    Folder.listPermissions(folderId, function (pErr, perms) {
      if (pErr) return res.status(500).json({ success: false, message: 'Unable to load permissions.' });
      Folder.listShares(folderId, function (sErr, shares) {
        if (sErr) return res.status(500).json({ success: false, message: 'Unable to load shares.' });
        Access.listGroupGrants(folderId, function (gErr, groups) {
          if (gErr) return res.status(500).json({ success: false, message: 'Unable to load group access.' });
          Access.listLinks(folderId, function (lErr, links) {
            if (lErr) return res.status(500).json({ success: false, message: 'Unable to load links.' });
            Access.listRequests(folderId, function (rErr, requests) {
              if (rErr) return res.status(500).json({ success: false, message: 'Unable to load requests.' });
              Access.listTemplates(function (tErr, templates) {
                if (tErr) templates = [];
                Access.listDepartments(function (dErr, departments) {
                  if (dErr) departments = [];
                  Folder.listUsers(function (uErr, users) {
                    if (uErr) users = [];
                    var inherited = [];
                    function finish() {
                      var caps = Folder.capsFromAccess(access);
                      var effective = [];
                      effective.push({ principal: folder.owner, type: 'owner', role: 'owner', source: 'owner', inherited: false });
                      (perms || []).forEach(function (p) {
                        effective.push({
                          principal: p.user_email,
                          type: 'user',
                          role: p.access_role,
                          source: 'permission',
                          inherited: false,
                          id: p.perm_id,
                          granted_by: p.granted_by,
                          granted_at: p.granted_at
                        });
                      });
                      (groups || []).forEach(function (g) {
                        effective.push({
                          principal: g.group_key,
                          type: g.group_type,
                          role: g.access_role,
                          source: 'group',
                          inherited: false,
                          id: g.grant_id,
                          granted_by: g.granted_by,
                          granted_at: g.granted_at
                        });
                      });
                      (shares || []).forEach(function (s) {
                        if (s.revoked) return;
                        effective.push({
                          principal: s.shared_with,
                          type: 'share',
                          role: s.access_role,
                          source: 'share',
                          inherited: false,
                          id: s.share_id,
                          expires_at: s.expires_at,
                          granted_by: s.created_by
                        });
                      });
                      inherited.forEach(function (row) { effective.push(row); });
                      res.json({
                        success: true,
                        locked: false,
                        folder: {
                          folder_id: folder.folder_id,
                          folder_name: folder.folder_name,
                          visibility: folder.visibility,
                          owner: folder.owner,
                          inherit_permissions: folder.inherit_permissions,
                          recert_due: folder.recert_due,
                          recert_interval_days: folder.recert_interval_days,
                          last_recert_at: folder.last_recert_at,
                          last_recert_by: folder.last_recert_by,
                          parent_id: folder.parent_id,
                          category_menu: folder.category_menu,
                          category_submenu: folder.category_submenu
                        },
                        access: access,
                        capabilities: caps,
                        canInvite: Role.caps(ctx.sysRole).canShare,
                        effective: effective,
                        permissions: perms || [],
                        shares: shares || [],
                        groups: groups || [],
                        links: (links || []).map(function (row) { return Access.mapLink(row, originOf(req)); }),
                        requests: requests || [],
                        templates: templates || [],
                        departments: departments || [],
                        users: users || []
                      });
                    }
                    if (!Number(folder.inherit_permissions) || !folder.parent_id) return finish();
                    Folder.listAncestors(folder, function (aErr, ancestors) {
                      if (aErr || !ancestors || !ancestors.length) return finish();
                      var parent = ancestors[0];
                      Folder.listPermissions(parent.folder_id, function (ipErr, iPerms) {
                        Access.listGroupGrants(parent.folder_id, function (igErr, iGroups) {
                          (iPerms || []).forEach(function (p) {
                            inherited.push({
                              principal: p.user_email,
                              type: 'user',
                              role: p.access_role,
                              source: 'inherited',
                              inherited: true
                            });
                          });
                          (iGroups || []).forEach(function (g) {
                            inherited.push({
                              principal: g.group_key,
                              type: g.group_type,
                              role: g.access_role,
                              source: 'inherited',
                              inherited: true
                            });
                          });
                          finish();
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

exports.grantGroup = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  loadAccess(req, res, folderId, 'owner', function (folder) {
    var groupType = req.body.group_type || 'department';
    var groupKey = String(req.body.group_key || '').trim();
    var role = req.body.access_role || 'viewer';
    if (['department', 'menu', 'team'].indexOf(groupType) === -1) {
      return res.status(400).json({ success: false, message: 'Choose department, menu, or team.' });
    }
    if (!groupKey) return res.status(400).json({ success: false, message: 'A department or group name is required.' });
    if (['owner', 'editor', 'viewer', 'auditor'].indexOf(role) === -1) {
      return res.status(400).json({ success: false, message: 'Invalid access role.' });
    }
    Access.grantGroup({
      folder_id: folderId,
      group_type: groupType,
      group_key: groupKey,
      access_role: role,
      granted_by: actor(req),
      granted_at: moment().format('YYYY-MM-DD HH:mm:ss')
    }, function (err) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to grant group access.' });
      Folder.addAudit({
        folder_id: folderId,
        actor: actor(req),
        action: 'group.grant',
        details: JSON.stringify({ group_type: groupType, group_key: groupKey, access_role: role }),
        created_at: moment().format('YYYY-MM-DD HH:mm:ss')
      }, function () {});
      Access.usersInDepartment(groupKey, function (uErr, users) {
        var emails = (users || []).map(function (u) { return u.emp_email || u.username; });
        Access.notifyMany(emails.concat([folder.owner]), {
          folder_id: folderId,
          kind: 'share',
          title: 'Access granted to ' + groupKey,
          body: actor(req) + ' gave the ' + groupKey + ' ' + groupType + ' ' + role + ' access to ' + folder.folder_name + '.',
          href: folderHref(folder)
        });
        res.json({ success: true, message: groupKey + ' now has ' + role + ' access.' });
      });
    });
  });
};

exports.revokeGroup = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  var grantId = Number(req.params.grantId);
  loadAccess(req, res, folderId, 'owner', function (folder) {
    Access.revokeGroup(grantId, folderId, function (err) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to revoke group access.' });
      Folder.addAudit({
        folder_id: folderId,
        actor: actor(req),
        action: 'group.revoke',
        details: JSON.stringify({ grant_id: grantId }),
        created_at: moment().format('YYYY-MM-DD HH:mm:ss')
      }, function () {});
      Access.notify(folder.owner, {
        folder_id: folderId,
        kind: 'revoke',
        title: 'Group access revoked',
        body: actor(req) + ' revoked a department or group grant on ' + folder.folder_name + '.',
        href: folderHref(folder)
      });
      res.json({ success: true, message: 'Group access revoked.' });
    });
  });
};

exports.applyTemplate = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  var templateId = Number(req.params.templateId);
  loadAccess(req, res, folderId, 'owner', function (folder) {
    Access.getTemplate(templateId, function (err, template) {
      if (err || !template) return res.status(404).json({ success: false, message: 'Template was not found.' });
      var days = Number(template.recert_interval_days) || 90;
      Folder.update(folderId, {
        parent_id: folder.parent_id,
        folder_name: folder.folder_name,
        description: folder.description,
        visibility: template.visibility || folder.visibility,
        inherit_permissions: template.inherit_permissions ? 1 : 0,
        review_date: folder.review_date,
        retain_until: folder.retain_until,
        tags: folder.tags,
        updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
      }, function (uErr) {
        if (uErr) return res.status(500).json({ success: false, message: 'Unable to apply the template.' });
        Access.recertify(folderId, actor(req), days, function () {
          var grants = template.grants || [];
          var i = 0;
          function next() {
            if (i >= grants.length) {
              Folder.addAudit({
                folder_id: folderId,
                actor: actor(req),
                action: 'template.apply',
                details: JSON.stringify({ template: template.template_name }),
                created_at: moment().format('YYYY-MM-DD HH:mm:ss')
              }, function () {});
              Access.notify(folder.owner, {
                folder_id: folderId,
                kind: 'share',
                title: 'Template applied: ' + template.template_name,
                body: actor(req) + ' applied the ' + template.template_name + ' access template to ' + folder.folder_name + '.',
                href: folderHref(folder)
              });
              return res.json({ success: true, message: 'Applied ' + template.template_name + '.' });
            }
            var g = grants[i++];
            Access.grantGroup({
              folder_id: folderId,
              group_type: g.group_type,
              group_key: g.group_key,
              access_role: g.access_role,
              granted_by: actor(req)
            }, function () { next(); });
          }
          next();
        });
      });
    });
  });
};

exports.setInherit = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  loadAccess(req, res, folderId, 'owner', function (folder) {
    var inherit = req.body.inherit_permissions === 0 || req.body.inherit_permissions === '0' ? 0 : 1;
    var copy = req.body.copy_parent === 1 || req.body.copy_parent === '1' || req.body.copy_parent === true;
    Folder.update(folderId, {
      parent_id: folder.parent_id,
      folder_name: folder.folder_name,
      description: folder.description,
      visibility: folder.visibility,
      inherit_permissions: inherit,
      review_date: folder.review_date,
      retain_until: folder.retain_until,
      tags: folder.tags,
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
    }, function (err) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to update inheritance.' });
      function done() {
        Folder.addAudit({
          folder_id: folderId,
          actor: actor(req),
          action: inherit ? 'inherit.on' : 'inherit.off',
          details: JSON.stringify({ copy_parent: copy }),
          created_at: moment().format('YYYY-MM-DD HH:mm:ss')
        }, function () {});
        res.json({
          success: true,
          message: inherit ? 'This folder now inherits parent access.' : 'This folder uses its own access list.'
        });
      }
      if (!inherit && copy) {
        folder.inherit_permissions = 0;
        return Folder.copyInheritedGrants(folder, actor(req), done);
      }
      done();
    });
  });
};

exports.requestAccess = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  Folder.getById(folderId, function (err, folder) {
    if (err || !folder) return res.status(404).json({ success: false, message: 'Folder not found.' });
    Access.userContext(req, function (cErr, ctx) {
      if (cErr) return res.status(500).json({ success: false, message: 'Unable to request access.' });
      Folder.resolveAccess(folder, ctx.email, ctx.isAdmin, function (aErr, access) {
        if (access && access.canView) {
          return res.json({ success: true, message: 'You already have access to this folder.' });
        }
        Access.createRequest({
          folder_id: folderId,
          requested_by: actor(req),
          requested_role: req.body.requested_role === 'editor' ? 'editor' : (req.body.requested_role === 'auditor' ? 'auditor' : 'viewer'),
          message: String(req.body.message || '').trim().slice(0, 400)
        }, function (rErr, created) {
          if (rErr) return res.status(500).json({ success: false, message: 'Unable to send the access request.' });
          Access.notify(folder.owner, {
            folder_id: folderId,
            kind: 'request',
            title: 'Access requested: ' + folder.folder_name,
            body: actor(req) + ' asked for access. Review it under Pending Approval.',
            href: '/library?filter=pending'
          });
          res.json({
            success: true,
            message: created && created.existing ? 'Your request is already waiting for approval.' : 'Access request sent to the folder owner.'
          });
        });
      }, ctx);
    });
  });
};

exports.decideRequest = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  var requestId = Number(req.params.requestId);
  var decision = req.body.decision === 'denied' ? 'denied' : 'approved';
  loadAccess(req, res, folderId, 'owner', function (folder) {
    Access.getRequest(requestId, function (err, row) {
      if (err || !row || Number(row.folder_id) !== folderId) {
        return res.status(404).json({ success: false, message: 'Request was not found.' });
      }
      if (row.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'That request was already decided.' });
      }
      Access.decideRequest(requestId, decision, actor(req), function (dErr) {
        if (dErr) return res.status(500).json({ success: false, message: 'Unable to update the request.' });
        function finish() {
          Access.notify(row.requested_by, {
            folder_id: folderId,
            kind: decision === 'approved' ? 'share' : 'revoke',
            title: decision === 'approved' ? ('Access approved: ' + folder.folder_name) : ('Access denied: ' + folder.folder_name),
            body: actor(req) + ' ' + decision + ' your request for ' + folder.folder_name + '.',
            href: folderHref(folder)
          });
          res.json({ success: true, message: decision === 'approved' ? 'Access approved.' : 'Access denied.' });
        }
        if (decision !== 'approved') return finish();
        Folder.grantPermission({
          folder_id: folderId,
          user_email: row.requested_by,
          access_role: row.requested_role || 'viewer',
          granted_by: actor(req),
          granted_at: moment().format('YYYY-MM-DD HH:mm:ss')
        }, function () { finish(); });
      });
    });
  });
};

exports.createLink = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  loadAccess(req, res, folderId, 'editor', function (folder) {
    var role = req.body.access_role || 'viewer';
    if (['viewer', 'auditor', 'editor'].indexOf(role) === -1) {
      return res.status(400).json({ success: false, message: 'Invalid link role.' });
    }
    var token = crypto.randomBytes(18).toString('hex');
    var password = String(req.body.password || '').trim();
    var expires = req.body.expires_at ? moment(req.body.expires_at).format('YYYY-MM-DD HH:mm:ss') : null;
    Access.createLink({
      folder_id: folderId,
      share_token: token,
      access_role: role,
      password_hash: Access.hashSecret(password),
      expires_at: expires,
      created_by: actor(req)
    }, function (err, result) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to create the link.' });
      var url = originOf(req) + '/folders/shared/' + token;
      Folder.addAudit({
        folder_id: folderId,
        actor: actor(req),
        action: 'link.create',
        details: JSON.stringify({ role: role, expires_at: expires, has_password: !!password }),
        created_at: moment().format('YYYY-MM-DD HH:mm:ss')
      }, function () {});
      res.json({
        success: true,
        message: 'Link created.',
        url: url,
        link_id: result.insertId
      });
    });
  });
};

exports.revokeLink = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  var linkId = Number(req.params.linkId);
  loadAccess(req, res, folderId, 'editor', function (folder) {
    Access.revokeLink(linkId, folderId, function (err) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to revoke the link.' });
      Folder.addAudit({
        folder_id: folderId,
        actor: actor(req),
        action: 'link.revoke',
        details: JSON.stringify({ link_id: linkId }),
        created_at: moment().format('YYYY-MM-DD HH:mm:ss')
      }, function () {});
      Access.notify(folder.owner, {
        folder_id: folderId,
        kind: 'revoke',
        title: 'Folder link revoked',
        body: actor(req) + ' revoked a share link for ' + folder.folder_name + '.',
        href: folderHref(folder)
      });
      res.json({ success: true, message: 'Link revoked.' });
    });
  });
};

exports.openShared = function (req, res) {
  var token = String(req.params.token || '');
  Access.getLinkByToken(token, function (err, link) {
    if (err || !link || link.revoked) {
      return res.status(404).render('login', { title: 'Login Page', message: 'That folder link is not valid.', success: false });
    }
    if (link.expires_at && moment(link.expires_at).isBefore(moment())) {
      return res.status(410).render('login', { title: 'Login Page', message: 'That folder link has expired.', success: false });
    }
    Folder.getById(link.folder_id, function (fErr, folder) {
      if (fErr || !folder) {
        return res.status(404).render('login', { title: 'Login Page', message: 'That folder is no longer available.', success: false });
      }
      if (!req.session || !req.session.username) {
      return res.redirect('/login');
    }
    res.render('folder-link', {
        title: 'Open shared folder',
        folder: folder,
        link: link,
        needsPassword: !!link.password_hash,
        token: token,
        message: req.flash('message'),
        success: false
      });
    });
  });
};

exports.redeemShared = function (req, res) {
  if (!requireAuth(req, res)) return;
  var token = String(req.params.token || '');
  Access.getLinkByToken(token, function (err, link) {
    if (err || !link || link.revoked) {
      return res.status(404).json({ success: false, message: 'That folder link is not valid.' });
    }
    if (link.expires_at && moment(link.expires_at).isBefore(moment())) {
      return res.status(410).json({ success: false, message: 'That folder link has expired.' });
    }
    if (link.password_hash && !Access.verifySecret(req.body.password, link.password_hash)) {
      if (req.xhr || (req.headers.accept || '').indexOf('json') !== -1) {
        return res.status(403).json({ success: false, message: 'The password is incorrect.' });
      }
      req.flash('message', 'The password is incorrect.');
      return res.redirect('/folders/shared/' + token);
    }
    Folder.getById(link.folder_id, function (fErr, folder) {
      if (fErr || !folder) return res.status(404).json({ success: false, message: 'Folder not found.' });
      req.session.folderLinks = req.session.folderLinks || {};
      req.session.folderLinks[String(folder.folder_id)] = {
        role: link.access_role || 'viewer',
        until: link.expires_at,
        token: token
      };
      Access.touchLink(link.link_id);
      var href = folderHref(folder);
      if (req.xhr || (req.headers.accept || '').indexOf('json') !== -1) {
        return res.json({ success: true, url: href });
      }
      res.redirect(href);
    });
  });
};

exports.recertify = function (req, res) {
  if (!requireAuth(req, res)) return;
  var folderId = Number(req.params.id);
  loadAccess(req, res, folderId, 'owner', function (folder) {
    var days = Number(req.body.recert_interval_days || folder.recert_interval_days || 90);
    Access.recertify(folderId, actor(req), days, function (err) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to recertify access.' });
      Folder.addAudit({
        folder_id: folderId,
        actor: actor(req),
        action: 'access.recertify',
        details: JSON.stringify({ recert_interval_days: days }),
        created_at: moment().format('YYYY-MM-DD HH:mm:ss')
      }, function () {});
      res.json({ success: true, message: 'Access recertified. Next review is in ' + days + ' days.' });
    });
  });
};

exports.alerts = function (req, res) {
  if (!requireAuth(req, res)) return;
  Access.userContext(req, function (err, ctx) {
    if (err) return res.status(500).json({ success: false, message: 'Unable to load notifications.' });
    Access.ensureRecertAlerts(function () {
      Access.listAlerts(ctx, function (lErr, rows) {
        if (lErr) return res.status(500).json({ success: false, message: 'Unable to load notifications.' });
        Access.unreadCount(ctx, function (cErr, count) {
          res.json({ success: true, alerts: rows || [], unread: count || 0 });
        });
      });
    });
  });
};

exports.readAlert = function (req, res) {
  if (!requireAuth(req, res)) return;
  Access.userContext(req, function (err, ctx) {
    if (err) return res.status(500).json({ success: false, message: 'Unable to update notification.' });
    if (req.params.id === 'all') {
      return Access.markAllRead(ctx, function () {
        res.json({ success: true });
      });
    }
    Access.markRead(Number(req.params.id), ctx, function () {
      res.json({ success: true });
    });
  });
};

exports.meta = function (req, res) {
  if (!requireAuth(req, res)) return;
  Access.listTemplates(function (err, templates) {
    Access.listDepartments(function (dErr, departments) {
      res.json({
        success: true,
        templates: templates || [],
        departments: departments || []
      });
    });
  });
};

exports.pending = function (req, res) {
  if (!requireAuth(req, res)) return;
  Access.userContext(req, function (err, ctx) {
    if (err) return res.status(500).json({ success: false, message: 'Unable to load requests.' });
    Access.pendingRequestsFor(ctx, function (pErr, rows) {
      if (pErr) return res.status(500).json({ success: false, message: 'Unable to load requests.' });
      res.json({ success: true, requests: rows || [] });
    });
  });
};

exports.requireAuth = requireAuth;
exports.loadAccess = loadAccess;
exports.actor = actor;
exports.canDo = canDo;
exports.folderHref = folderHref;
exports.notifyFolderPeople = notifyFolderPeople;
