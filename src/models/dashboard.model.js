var fs = require('fs');
var path = require('path');
var dbConn = require('./../../config/db.config');

function query(sql, params, cb) {
  dbConn.query(sql, params || [], function (err, rows) {
    if (err) return cb(err);
    cb(null, rows);
  });
}

function first(rows) {
  return rows && rows[0] ? rows[0] : {};
}

var Dashboard = {};

Dashboard.userByEmail = function (email, cb) {
  query(
    "SELECT first_name, last_name, username, emp_email, user_role, sys_role, department FROM login WHERE emp_email = ? OR username = ? LIMIT 1",
    [email, email],
    function (err, rows) {
      if (err) return cb(err);
      cb(null, rows && rows[0] ? rows[0] : null);
    }
  );
};

Dashboard.home = function (username, cb) {
  var sql = [
    "SELECT COUNT(*) AS total FROM file_info WHERE status = 0",
    "SELECT COUNT(*) AS total FROM file_info WHERE status = 0 AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')",
    "SELECT COUNT(*) AS total FROM file_info WHERE status = 0 AND created_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01') AND created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')",
    "SELECT COUNT(*) AS total FROM qms_folders WHERE status = 0",
    "SELECT COUNT(*) AS total FROM qms_folders WHERE status = 0 AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')",
    "SELECT COUNT(*) AS total FROM qms_folders WHERE status = 0 AND created_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01') AND created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')",
    "SELECT COUNT(DISTINCT SUBSTRING_INDEX(doc_path, '/', 1)) AS total FROM file_info WHERE status = 0",
    "SELECT COUNT(*) AS total FROM qms_folders WHERE status = 0 AND lifecycle_status = 'under_review'",
    "SELECT COUNT(*) AS total FROM qms_folders WHERE status = 0 AND review_date IS NOT NULL AND review_date <= DATE_ADD(CURDATE(), INTERVAL 14 DAY)",
    "SELECT COUNT(*) AS total FROM qms_folders WHERE status = 0 AND lifecycle_status IN ('archived', 'obsolete')",
    "SELECT COUNT(*) AS total FROM file_info WHERE status = 1",
    "SELECT SUBSTRING_INDEX(doc_path, '/', 1) AS category, COUNT(*) AS total FROM file_info WHERE status = 0 GROUP BY category ORDER BY total DESC",
    "SELECT fi.doc_num, fi.doc_name, fi.doc, fi.doc_path, fi.docDesc, fi.releaseDt, l.accessed_datetime, l.emp_id, l.doc_accessed_type FROM doc_log_info l LEFT JOIN file_info fi ON fi.doc_num = l.doc_id WHERE fi.doc_num IS NOT NULL ORDER BY l.accessed_datetime DESC LIMIT 8",
    "SELECT DATE(accessed_datetime) AS day, SUM(doc_accessed_type = 0) AS views, SUM(doc_accessed_type = 1) AS downloads FROM doc_log_info WHERE accessed_datetime >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY DATE(accessed_datetime) ORDER BY day",
    "SELECT created_at AS day, COUNT(*) AS uploads FROM file_info WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY created_at ORDER BY day",
    "SELECT folder_id, folder_name, review_date, retain_until, lifecycle_status FROM qms_folders WHERE status = 0 AND (review_date IS NOT NULL OR retain_until IS NOT NULL) ORDER BY COALESCE(review_date, retain_until) ASC LIMIT 8",
    "SELECT COUNT(*) AS total FROM notification",
    "SELECT COUNT(*) AS approved FROM file_info WHERE status = 0",
    "SELECT COUNT(*) AS review FROM qms_folders WHERE status = 0 AND lifecycle_status = 'under_review'",
    "SELECT COUNT(*) AS draft FROM qms_folders WHERE status = 0 AND lifecycle_status = 'draft'",
    "SELECT COUNT(*) AS expired FROM qms_folders WHERE status = 0 AND retain_until IS NOT NULL AND retain_until < CURDATE()",
    "SELECT COUNT(*) AS archived FROM qms_folders WHERE status = 0 AND lifecycle_status IN ('archived', 'obsolete')"
  ].join(';');

  dbConn.query(sql, function (err, sets) {
    if (err) return cb(err);
    var docs = first(sets[0]).total || 0;
    var docsMonth = first(sets[1]).total || 0;
    var docsPrev = first(sets[2]).total || 0;
    var folders = first(sets[3]).total || 0;
    var foldersMonth = first(sets[4]).total || 0;
    var foldersPrev = first(sets[5]).total || 0;
    cb(null, {
      totals: {
        documents: docs,
        documentsMonth: docsMonth,
        documentsPrev: docsPrev,
        folders: folders,
        foldersMonth: foldersMonth,
        foldersPrev: foldersPrev,
        libraries: first(sets[6]).total || 0,
        pending: first(sets[7]).total || 0,
        reviewDue: first(sets[8]).total || 0,
        archived: (first(sets[9]).total || 0) + (first(sets[10]).total || 0)
      },
      categories: sets[11] || [],
      recentDocs: sets[12] || [],
      activityDays: sets[13] || [],
      uploadDays: sets[14] || [],
      upcoming: sets[15] || [],
      notificationCount: first(sets[16]).total || 0,
      status: {
        approved: first(sets[17]).approved || 0,
        review: first(sets[18]).review || 0,
        draft: first(sets[19]).draft || 0,
        expired: first(sets[20]).expired || 0,
        archived: first(sets[21]).archived || 0
      }
    });
  });
};

Dashboard.library = function (opts, cb) {
  var filter = opts.filter || 'library';
  var q = String(opts.q || '').trim();
  var user = opts.username || '';
  var like = '%' + q.replace(/[%_]/g, '\\$&') + '%';
  var params = [];
  var sql;

  function finish(err, docs, folders) {
    if (err) return cb(err);
    cb(null, { documents: docs || [], folders: folders || [] });
  }

  if (filter === 'shared') {
    sql =
      "SELECT DISTINCT fi.doc_num, fi.doc_name, fi.doc, fi.doc_path, fi.docDesc, fi.version, fi.releaseDt, fi.created_by, fi.created_at, s.access_role " +
      "FROM qms_folder_shares s " +
      "INNER JOIN qms_folder_documents fd ON fd.folder_id = s.folder_id " +
      "INNER JOIN file_info fi ON fi.doc_num = fd.doc_num " +
      "WHERE s.revoked = 0 AND (s.expires_at IS NULL OR s.expires_at > NOW()) AND s.shared_with = ? AND fi.status = 0";
    params.push(user);
    if (q) {
      sql += " AND (fi.doc_name LIKE ? OR fi.docDesc LIKE ? OR fi.doc LIKE ?)";
      params.push(like, like, like);
    }
    sql += " ORDER BY fi.doc_name";
    return query(sql, params, function (err, docs) { finish(err, docs, []); });
  }

  if (filter === 'recent') {
    sql =
      "SELECT fi.doc_num, fi.doc_name, fi.doc, fi.doc_path, fi.docDesc, fi.version, fi.releaseDt, fi.created_by, MAX(l.accessed_datetime) AS last_access " +
      "FROM doc_log_info l INNER JOIN file_info fi ON fi.doc_num = l.doc_id WHERE fi.status = 0";
    if (q) {
      sql += " AND (fi.doc_name LIKE ? OR fi.docDesc LIKE ? OR fi.doc LIKE ?)";
      params.push(like, like, like);
    }
    sql += " GROUP BY fi.doc_num, fi.doc_name, fi.doc, fi.doc_path, fi.docDesc, fi.version, fi.releaseDt, fi.created_by ORDER BY last_access DESC LIMIT 100";
    return query(sql, params, function (err, docs) { finish(err, docs, []); });
  }

  if (filter === 'mine') {
    sql =
      "SELECT DISTINCT fi.doc_num, fi.doc_name, fi.doc, fi.doc_path, fi.docDesc, fi.version, fi.releaseDt, fi.created_by, fi.updated_by, fi.created_at, fi.last_modified " +
      "FROM file_info fi LEFT JOIN doc_log_info l ON l.doc_id = fi.doc_num " +
      "WHERE fi.status = 0 AND (fi.created_by = ? OR l.emp_id = ?)";
    params.push(user, user);
    if (q) {
      sql += " AND (fi.doc_name LIKE ? OR fi.docDesc LIKE ? OR fi.doc LIKE ?)";
      params.push(like, like, like);
    }
    sql += " ORDER BY fi.last_modified DESC, fi.doc_name";
    return query(sql, params, function (err, docs) { finish(err, docs, []); });
  }

  if (filter === 'pending') {
    return query(
      "SELECT folder_id, folder_name, lifecycle_status, review_date, category_menu, category_submenu, tags FROM qms_folders WHERE status = 0 AND lifecycle_status IN ('under_review', 'draft') ORDER BY folder_name",
      [],
      function (err, folders) {
        if (err) return finish(err);
        query(
          "SELECT fi.doc_num, fi.doc_name, fi.doc, fi.doc_path, fi.docDesc, fi.version, fi.releaseDt, f.folder_name " +
          "FROM qms_folders f INNER JOIN qms_folder_documents fd ON fd.folder_id = f.folder_id INNER JOIN file_info fi ON fi.doc_num = fd.doc_num " +
          "WHERE f.status = 0 AND f.lifecycle_status IN ('under_review', 'draft') AND fi.status = 0 ORDER BY fi.doc_name",
          [],
          function (dErr, docs) { finish(dErr, docs, folders); }
        );
      }
    );
  }

  if (filter === 'expiring') {
    return query(
      "SELECT folder_id, folder_name, lifecycle_status, review_date, retain_until, category_menu, category_submenu FROM qms_folders " +
      "WHERE status = 0 AND ((review_date IS NOT NULL AND review_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)) OR (retain_until IS NOT NULL AND retain_until <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)) OR (recert_due IS NOT NULL AND recert_due <= DATE_ADD(CURDATE(), INTERVAL 14 DAY))) " +
      "ORDER BY COALESCE(review_date, retain_until)",
      [],
      function (err, folders) { finish(err, [], folders); }
    );
  }

  if (filter === 'recycle') {
    sql = "SELECT doc_num, doc_name, doc, doc_path, docDesc, version, releaseDt, created_by, created_at, last_modified FROM file_info WHERE status = 1";
    if (q) {
      sql += " AND (doc_name LIKE ? OR docDesc LIKE ? OR doc LIKE ?)";
      params.push(like, like, like);
    }
    sql += " ORDER BY last_modified DESC, doc_name";
    return query(sql, params, function (err, docs) {
      if (err) return finish(err);
      var folderSql = "SELECT folder_id, folder_name, updated_at, created_by, owner, category_menu, category_submenu FROM qms_folders WHERE status = 1";
      var folderParams = [];
      if (q) {
        folderSql += " AND folder_name LIKE ?";
        folderParams.push(like);
      }
      folderSql += " ORDER BY updated_at DESC, folder_name";
      query(folderSql, folderParams, function (fErr, folders) { finish(fErr, docs, folders); });
    });
  }

  if (filter === 'favorites') {
    return finish(null, [], []);
  }

  sql = "SELECT doc_num, doc_name, doc, doc_path, docDesc, version, releaseDt, created_by, created_at, last_modified FROM file_info WHERE status = 0";
  if (q) {
    sql += " AND (doc_name LIKE ? OR docDesc LIKE ? OR doc LIKE ? OR doc_path LIKE ?)";
    params.push(like, like, like, like);
  }
  sql += " ORDER BY doc_path, doc_name";
  query(sql, params, function (err, docs) { finish(err, docs, []); });
};

function addItem(items, item) {
  items.push(item);
}

function formatSize(bytes) {
  var n = Number(bytes) || 0;
  if (n < 0) n = 0;
  var units = ['B', 'KB', 'MB', 'GB'];
  var i = 0;
  var value = n;
  while (value >= 1024 && i < units.length - 1) {
    value = value / 1024;
    i += 1;
  }
  var text = i === 0 ? String(Math.round(value)) : (value >= 10 ? value.toFixed(0) : value.toFixed(1));
  return text + ' ' + units[i];
}

function diskSize(docPath, fileName) {
  var parts = String(docPath || '').split('/').map(function (part) {
    return path.basename(part);
  }).filter(Boolean);
  var name = path.basename(String(fileName || ''));
  if (!parts.length || !name) return 0;
  var filePath = path.join.apply(path, [path.resolve(), 'public', 'pdfFiles'].concat(parts, [name]));
  try {
    var stat = fs.statSync(filePath);
    return stat.isFile() ? stat.size : 0;
  } catch (e) {
    return 0;
  }
}

function applyContainerSizes(items, done) {
  items.forEach(function (item) {
    if (item.kind === 'document') item.size = formatSize(diskSize(item._docPath, item.fileName));
  });
  var needsTree = items.some(function (item) {
    return item.kind === 'folder' || item.kind === 'category' || item.kind === 'department';
  });
  if (!needsTree) {
    items.forEach(function (item) { delete item._docPath; delete item._menu; });
    return done();
  }
  query("SELECT folder_id, parent_id, category_menu, category_submenu FROM qms_folders WHERE status = 0", [], function (err, folders) {
    if (err) return done();
    query(
      "SELECT fd.folder_id, fi.doc, fi.doc_path FROM qms_folder_documents fd INNER JOIN file_info fi ON fi.doc_num = fd.doc_num WHERE fi.status = 0",
      [],
      function (dErr, links) {
        if (dErr) return done();
        query(
          "SELECT doc, doc_path FROM file_info WHERE status = 0",
          [],
          function (fErr, files) {
            if (fErr) return done();
            var children = {};
            var folderMeta = {};
            (folders || []).forEach(function (folder) {
              var id = String(folder.folder_id);
              var parent = folder.parent_id ? String(folder.parent_id) : '0';
              folderMeta[id] = folder;
              if (!children[parent]) children[parent] = [];
              children[parent].push(id);
            });
            var docsByFolder = {};
            (links || []).forEach(function (row) {
              var id = String(row.folder_id);
              if (!docsByFolder[id]) docsByFolder[id] = [];
              docsByFolder[id].push({ bytes: diskSize(row.doc_path, row.doc), key: String(row.doc_path || '') + '/' + path.basename(String(row.doc || '')) });
            });
            var pathBytes = {};
            var menuBytes = {};
            var pathKeys = {};
            (files || []).forEach(function (row) {
              var bytes = diskSize(row.doc_path, row.doc);
              var parts = String(row.doc_path || '').split('/');
              var menu = parts[0] || '';
              var full = parts.length > 1 ? parts[0] + '/' + parts[1] : menu;
              var key = String(row.doc_path || '') + '/' + path.basename(String(row.doc || ''));
              pathKeys[key] = true;
              menuBytes[menu] = (menuBytes[menu] || 0) + bytes;
              pathBytes[full] = (pathBytes[full] || 0) + bytes;
            });
            function folderBytes(id, seen) {
              if (seen[id]) return 0;
              seen[id] = true;
              var total = 0;
              (docsByFolder[id] || []).forEach(function (doc) { total += doc.bytes; });
              (children[id] || []).forEach(function (child) { total += folderBytes(child, seen); });
              return total;
            }
            function linkedBytes(ids) {
              var total = 0;
              var seen = {};
              function walk(id) {
                if (seen[id]) return;
                seen[id] = true;
                (docsByFolder[id] || []).forEach(function (doc) {
                  if (!pathKeys[doc.key]) total += doc.bytes;
                });
                (children[id] || []).forEach(walk);
              }
              ids.forEach(walk);
              return total;
            }
            items.forEach(function (item) {
              if (item.kind === 'folder' && item.id) {
                item.size = formatSize(folderBytes(String(item.id), {}));
              } else if (item.kind === 'category') {
                var catIds = Object.keys(folderMeta).filter(function (id) {
                  return folderMeta[id].category_menu === item.name;
                });
                item.size = formatSize((menuBytes[item.name] || 0) + linkedBytes(catIds));
              } else if (item.kind === 'department') {
                var depKey = (item._menu || '') + '/' + item.name;
                var depIds = Object.keys(folderMeta).filter(function (id) {
                  return folderMeta[id].category_menu === item._menu && folderMeta[id].category_submenu === item.name;
                });
                item.size = formatSize((pathBytes[depKey] || 0) + linkedBytes(depIds));
              }
              delete item._docPath;
              delete item._menu;
            });
            done();
          }
        );
      }
    );
  });
}

function folderItem(folder, menu, submenu) {
  var href = menu || submenu
    ? '/library?menu=' + encodeURIComponent(menu) + '&submenu=' + encodeURIComponent(submenu) + '&folder=' + folder.folder_id
    : '/library?folder=' + folder.folder_id;
  return {
    kind: 'folder',
    id: folder.folder_id,
    name: folder.folder_name,
    typeLabel: 'Folder',
    modified: folder.updated_at || folder.created_at,
    modifiedBy: folder.created_by || folder.owner || '',
    size: '--',
    href: href
  };
}

function browseInsideFolder(menu, submenu, folderId, matches, cb) {
  query("SELECT * FROM qms_folders WHERE folder_id = ? AND status = 0", [folderId], function (err, rows) {
    if (err) return cb(err);
    var currentFolder = rows && rows[0] ? rows[0] : null;
    if (!currentFolder) return cb(null, { level: 'folder', items: [], currentFolder: null });
    var catMenu = menu || currentFolder.category_menu || '';
    var catSub = submenu || currentFolder.category_submenu || '';
    query(
      "SELECT * FROM qms_folders WHERE status = 0 AND parent_id = ? ORDER BY folder_name",
      [folderId],
      function (fErr, folders) {
        if (fErr) return cb(fErr);
        query(
          "SELECT fi.doc_num, fi.doc_name, fi.doc, fi.doc_path, fi.docDesc, fi.version, fi.releaseDt, fi.created_by, fi.updated_by, fi.created_at, fi.last_modified " +
          "FROM qms_folder_documents fd INNER JOIN file_info fi ON fi.doc_num = fd.doc_num " +
          "WHERE fd.folder_id = ? AND fi.status = 0 ORDER BY fi.doc_name",
          [folderId],
          function (dErr, docs) {
            if (dErr) return cb(dErr);
            var items = [];
            (folders || []).forEach(function (folder) {
              if (!matches(folder.folder_name)) return;
              addItem(items, folderItem(folder, catMenu, catSub));
            });
            (docs || []).forEach(function (doc) {
              var fileName = doc.doc || '';
              var label = doc.doc_name || '';
              if (!label || !/\.[A-Za-z0-9]+$/.test(label)) label = fileName || label;
              if (!matches(label) && !matches(doc.doc_name || '')) return;
              var pathParts = String(doc.doc_path || '').split('/');
              var docMenu = pathParts[0] || catMenu;
              var docSub = pathParts[1] || catSub;
              addItem(items, {
                kind: 'document',
                id: doc.doc_num,
                name: label,
                fileName: fileName || label,
                typeLabel: fileTypeLabel(doc.doc || label),
                modified: doc.last_modified || doc.releaseDt || doc.created_at,
                modifiedBy: doc.updated_by || doc.created_by || '',
                size: '--',
                version: doc.version || '',
                qmsVersion: doc.docRelVer || '',
                _docPath: doc.doc_path,
                href: catMenu ? ('/category?menu=' + encodeURIComponent(catMenu) + '&submenu=' + encodeURIComponent(catSub)) : '#',
                download: docMenu ? ('/downloadDocument/' + encodeURIComponent(docMenu) + '/' + encodeURIComponent(docSub) + '/' + encodeURIComponent(doc.doc || label)) : ''
              });
            });
            applyContainerSizes(items, function () {
              cb(null, { level: 'folder', items: items, currentFolder: currentFolder });
            });
          }
        );
      }
    );
  });
}

Dashboard.browse = function (opts, cb) {
  var menu = opts.menu || '';
  var submenu = opts.submenu || '';
  var folderId = opts.folderId ? Number(opts.folderId) : 0;
  var q = String(opts.q || '').trim().toLowerCase();

  function matches(name) {
    return !q || String(name || '').toLowerCase().indexOf(q) !== -1;
  }

  if (folderId) {
    return browseInsideFolder(menu, submenu, folderId, matches, cb);
  }

  if (!menu) {
    var sql =
      "SELECT SUBSTRING_INDEX(doc_path, '/', 1) AS name, COUNT(*) AS doc_count, MAX(last_modified) AS modified, MAX(COALESCE(updated_by, created_by)) AS modified_by " +
      "FROM file_info WHERE status = 0 AND doc_path NOT LIKE 'library/%' GROUP BY name";
    return query(sql, [], function (err, cats) {
      if (err) return cb(err);
      query(
        "SELECT category_menu AS name, COUNT(*) AS folder_count, MAX(updated_at) AS modified, MAX(created_by) AS modified_by FROM qms_folders WHERE status = 0 AND category_menu <> '' GROUP BY category_menu",
        [],
        function (fErr, folderCats) {
          if (fErr) return cb(fErr);
          var map = {};
          (cats || []).forEach(function (row) {
            if (!row.name || row.name === 'library') return;
            map[row.name] = {
              kind: 'category',
              name: row.name,
              menu: row.name,
              typeLabel: 'Folder',
              modified: row.modified,
              modifiedBy: row.modified_by || '',
              size: '--',
              href: '/library?menu=' + encodeURIComponent(row.name),
              count: Number(row.doc_count) || 0
            };
          });
          (folderCats || []).forEach(function (row) {
            if (!map[row.name]) {
              map[row.name] = {
                kind: 'category',
                name: row.name,
                menu: row.name,
                typeLabel: 'Folder',
                modified: row.modified,
                modifiedBy: row.modified_by || '',
                size: '--',
                href: '/library?menu=' + encodeURIComponent(row.name),
                count: 0
              };
            }
            map[row.name].count += Number(row.folder_count) || 0;
            if (row.modified && (!map[row.name].modified || new Date(row.modified) > new Date(map[row.name].modified))) {
              map[row.name].modified = row.modified;
              map[row.name].modifiedBy = row.modified_by || map[row.name].modifiedBy;
            }
          });
          var items = Object.keys(map).sort().map(function (k) { return map[k]; }).filter(function (item) {
            return matches(item.name);
          });
          query(
            "SELECT * FROM qms_folders WHERE status = 0 AND (category_menu = '' OR category_menu IS NULL) AND (parent_id IS NULL OR parent_id = 0) ORDER BY folder_name",
            [],
            function (lErr, loose) {
              if (lErr) return cb(lErr);
              (loose || []).forEach(function (folder) {
                if (!matches(folder.folder_name)) return;
                items.push(folderItem(folder, '', ''));
              });
              applyContainerSizes(items, function () {
                cb(null, { level: 'root', items: items, currentFolder: null });
              });
            }
          );
        }
      );
    });
  }

  if (!submenu) {
    return query(
      "SELECT SUBSTRING_INDEX(doc_path, '/', -1) AS name, COUNT(*) AS doc_count, MAX(last_modified) AS modified, MAX(COALESCE(updated_by, created_by)) AS modified_by " +
      "FROM file_info WHERE status = 0 AND INSTR(doc_path, '/') > 0 AND SUBSTRING_INDEX(doc_path, '/', 1) = ? GROUP BY name",
      [menu],
      function (err, deps) {
        if (err) return cb(err);
        query(
          "SELECT category_submenu AS name, COUNT(*) AS folder_count, MAX(updated_at) AS modified, MAX(created_by) AS modified_by FROM qms_folders WHERE status = 0 AND category_menu = ? AND category_submenu <> '' GROUP BY category_submenu",
          [menu],
          function (fErr, folderDeps) {
            if (fErr) return cb(fErr);
            var map = {};
            (deps || []).forEach(function (row) {
              map[row.name] = {
                kind: 'department',
                name: row.name,
                menu: menu,
                submenu: row.name,
                typeLabel: 'Folder',
                modified: row.modified,
                modifiedBy: row.modified_by || '',
                size: '--',
                _menu: menu,
                href: '/library?menu=' + encodeURIComponent(menu) + '&submenu=' + encodeURIComponent(row.name)
              };
            });
            (folderDeps || []).forEach(function (row) {
              if (!map[row.name]) {
                map[row.name] = {
                  kind: 'department',
                  name: row.name,
                  menu: menu,
                  submenu: row.name,
                  typeLabel: 'Folder',
                  modified: row.modified,
                  modifiedBy: row.modified_by || '',
                  size: '--',
                  _menu: menu,
                  href: '/library?menu=' + encodeURIComponent(menu) + '&submenu=' + encodeURIComponent(row.name)
                };
              }
            });
            var items = Object.keys(map).sort().map(function (k) { return map[k]; }).filter(function (item) {
              return matches(item.name);
            });
            query(
              "SELECT * FROM qms_folders WHERE status = 0 AND category_menu = ? AND (category_submenu = '' OR category_submenu IS NULL) AND (parent_id IS NULL OR parent_id = 0) ORDER BY folder_name",
              [menu],
              function (lErr, loose) {
                if (lErr) return cb(lErr);
                (loose || []).forEach(function (folder) {
                  if (!matches(folder.folder_name)) return;
                  items.push(folderItem(folder, menu, ''));
                });
                query(
                  "SELECT doc_num, doc_name, doc, doc_path, docDesc, version, releaseDt, created_by, updated_by, created_at, last_modified " +
                  "FROM file_info WHERE status = 0 AND doc_path = ? ORDER BY doc_name",
                  [menu],
                  function (pErr, parentDocs) {
                    if (pErr) return cb(pErr);
                    (parentDocs || []).forEach(function (doc) {
                      var fileName = doc.doc || '';
                      var label = doc.doc_name || '';
                      if (!label || !/\.[A-Za-z0-9]+$/.test(label)) label = fileName || label;
                      if (!matches(label) && !matches(doc.doc_name || '')) return;
                      addItem(items, {
                        kind: 'document',
                        id: doc.doc_num,
                        name: label,
                        fileName: fileName || label,
                        typeLabel: fileTypeLabel(doc.doc || label),
                        modified: doc.last_modified || doc.releaseDt || doc.created_at,
                        modifiedBy: doc.updated_by || doc.created_by || '',
                        size: '--',
                        version: doc.version || '',
                        qmsVersion: doc.docRelVer || '',
                        _docPath: doc.doc_path,
                        href: '/category?menu=' + encodeURIComponent(menu),
                        download: '/downloadDocument/' + encodeURIComponent(menu) + '/_/' + encodeURIComponent(doc.doc || label)
                      });
                    });
                    applyContainerSizes(items, function () {
                      cb(null, { level: 'menu', items: items, currentFolder: null });
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  }

  var path = menu + '/' + submenu;
  var folderSql = folderId
    ? "SELECT * FROM qms_folders WHERE status = 0 AND category_menu = ? AND category_submenu = ? AND parent_id = ? ORDER BY folder_name"
    : "SELECT * FROM qms_folders WHERE status = 0 AND category_menu = ? AND category_submenu = ? AND (parent_id IS NULL OR parent_id = 0) ORDER BY folder_name";
  var folderParams = folderId ? [menu, submenu, folderId] : [menu, submenu];

  function loadFolderMeta(next) {
    if (!folderId) return next(null, null);
    query("SELECT * FROM qms_folders WHERE folder_id = ? AND status = 0", [folderId], function (err, rows) {
      next(err, rows && rows[0] ? rows[0] : null);
    });
  }

  loadFolderMeta(function (mErr, currentFolder) {
    if (mErr) return cb(mErr);
    query(folderSql, folderParams, function (err, folders) {
      if (err) return cb(err);
      var docSql;
      var docParams;
      if (folderId) {
        docSql =
          "SELECT fi.doc_num, fi.doc_name, fi.doc, fi.doc_path, fi.docDesc, fi.version, fi.releaseDt, fi.created_by, fi.updated_by, fi.created_at, fi.last_modified " +
          "FROM qms_folder_documents fd INNER JOIN file_info fi ON fi.doc_num = fd.doc_num " +
          "WHERE fd.folder_id = ? AND fi.status = 0 ORDER BY fi.doc_name";
        docParams = [folderId];
      } else {
        docSql =
          "SELECT doc_num, doc_name, doc, doc_path, docDesc, version, releaseDt, created_by, updated_by, created_at, last_modified " +
          "FROM file_info WHERE status = 0 AND doc_path = ? ORDER BY doc_name";
        docParams = [path];
      }
      query(docSql, docParams, function (dErr, docs) {
        if (dErr) return cb(dErr);
        var items = [];
        (folders || []).forEach(function (folder) {
          if (!matches(folder.folder_name)) return;
          addItem(items, {
            kind: 'folder',
            id: folder.folder_id,
            name: folder.folder_name,
            typeLabel: 'Folder',
            modified: folder.updated_at || folder.created_at,
            modifiedBy: folder.created_by || folder.owner || '',
            size: '--',
            href: '/library?menu=' + encodeURIComponent(menu) + '&submenu=' + encodeURIComponent(submenu) + '&folder=' + folder.folder_id
          });
        });
        (docs || []).forEach(function (doc) {
          var fileName = doc.doc || '';
          var label = doc.doc_name || '';
          if (!label || !/\.[A-Za-z0-9]+$/.test(label)) label = fileName || label;
          if (!matches(label) && !matches(doc.doc_name || '')) return;
          addItem(items, {
            kind: 'document',
            id: doc.doc_num,
            name: label,
            fileName: fileName || label,
            typeLabel: fileTypeLabel(doc.doc || label),
            modified: doc.last_modified || doc.releaseDt || doc.created_at,
            modifiedBy: doc.updated_by || doc.created_by || '',
            size: '--',
            version: doc.version || '',
            qmsVersion: doc.docRelVer || '',
            _docPath: doc.doc_path,
            href: '/category?menu=' + encodeURIComponent(menu) + '&submenu=' + encodeURIComponent(submenu),
            download: '/downloadDocument/' + encodeURIComponent(menu) + '/' + encodeURIComponent(submenu) + '/' + encodeURIComponent(doc.doc || label)
          });
        });
        applyContainerSizes(items, function () {
          cb(null, { level: folderId ? 'folder' : 'location', items: items, currentFolder: currentFolder });
        });
      });
    });
  });
};

function fileTypeLabel(name) {
  var ext = String(name || '').split('.').pop().toLowerCase();
  if (ext === 'docx' || ext === 'doc') return 'DOCX';
  if (ext === 'pdf') return 'PDF';
  if (ext === 'xlsx' || ext === 'xls') return 'XLSX';
  if (ext === 'pptx' || ext === 'ppt') return 'PPTX';
  return (ext || 'FILE').toUpperCase();
}

module.exports = Dashboard;
