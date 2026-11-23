var fs = require('fs');
var path = require('path');
var moment = require('moment');
var dbConn = require('./../../config/db.config');

var Version = {};
var tablesReady = false;

function runSql(sql, params, cb) {
  dbConn.query(sql, params, cb);
}

function ensureTables(cb) {
  if (tablesReady) return cb();
  runSql(
    "CREATE TABLE IF NOT EXISTS `qms_doc_versions` (" +
      "`version_id` int(11) NOT NULL AUTO_INCREMENT," +
      "`doc_id` int(11) NOT NULL," +
      "`seq` int(11) NOT NULL," +
      "`doc_version` varchar(20) NOT NULL DEFAULT '1.0'," +
      "`qms_version` varchar(20) NOT NULL DEFAULT '1.0'," +
      "`bump_type` enum('initial','minor','major','restore') NOT NULL DEFAULT 'initial'," +
      "`change_comment` varchar(500) NOT NULL DEFAULT ''," +
      "`stored_file` varchar(255) NOT NULL DEFAULT ''," +
      "`doc_name` varchar(255) NOT NULL DEFAULT ''," +
      "`doc_desc` varchar(1000) DEFAULT ''," +
      "`release_dt` date DEFAULT NULL," +
      "`is_current` tinyint(1) NOT NULL DEFAULT 0," +
      "`restored_from_id` int(11) DEFAULT NULL," +
      "`created_by` varchar(155) NOT NULL DEFAULT ''," +
      "`created_at` datetime NOT NULL," +
      "PRIMARY KEY (`version_id`)," +
      "UNIQUE KEY `uniq_doc_seq` (`doc_id`,`seq`)," +
      "KEY `idx_doc_versions_doc` (`doc_id`,`is_current`)" +
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8",
    [],
    function (err) {
      if (err) return cb(err);
      runSql("ALTER TABLE file_info MODIFY version varchar(20) NOT NULL DEFAULT '1.0'", [], function () {
        runSql("ALTER TABLE file_info MODIFY docRelVer varchar(20) NOT NULL DEFAULT '1.0'", [], function () {
          runSql("ALTER TABLE file_info MODIFY doc varchar(255) NULL", [], function () {
            runSql("ALTER TABLE file_info MODIFY doc_name varchar(255) NOT NULL", [], function () {
              tablesReady = true;
              cb();
            });
          });
        });
      });
    }
  );
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

function parseVer(value) {
  var raw = String(value == null ? '' : value).trim();
  var parts = raw.split('.');
  var major = parseInt(parts[0], 10);
  var minor = parseInt(parts[1], 10);
  if (isNaN(major) || major < 0) major = 1;
  if (isNaN(minor) || minor < 0) minor = 0;
  if (!raw) {
    major = 1;
    minor = 0;
  }
  return { major: major, minor: minor };
}

function formatVer(parts) {
  return String(parts.major) + '.' + String(parts.minor);
}

Version.formatVer = formatVer;
Version.parseVer = parseVer;

Version.bump = function (value, bumpType) {
  var parts = parseVer(value);
  if (bumpType === 'major') {
    parts.major += 1;
    parts.minor = 0;
  } else {
    parts.minor += 1;
  }
  return formatVer(parts);
};

Version.normalize = function (value) {
  return formatVer(parseVer(value));
};

Version.cmp = function (a, b) {
  var pa = parseVer(a);
  var pb = parseVer(b);
  if (pa.major !== pb.major) return pa.major - pb.major;
  return pa.minor - pb.minor;
};

Version.maxOf = function (values) {
  var best = '0.0';
  (values || []).forEach(function (value) {
    if (value == null || value === '') return;
    var next = Version.normalize(value);
    if (Version.cmp(next, best) > 0) best = next;
  });
  return best;
};

function liveDir(docPath) {
  var parts = String(docPath || '').split('/').filter(Boolean).map(function (part) {
    return String(part).replace(/[\\/]/g, '');
  });
  return path.join.apply(path, [path.resolve(), 'public', 'pdfFiles'].concat(parts));
}

function liveFilePath(doc) {
  var name = path.basename(String(doc && doc.doc ? doc.doc : ''));
  if (!name) return '';
  return path.join(liveDir(doc.doc_path), name);
}

function versionDir(docId) {
  var dir = path.join(path.resolve(), 'public', 'pdfFiles', '_versions', String(docId));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function versionFilePath(docId, storedFile) {
  var name = path.basename(String(storedFile || ''));
  if (!name) return '';
  var filePath = path.join(versionDir(docId), name);
  var base = path.join(path.resolve(), 'public', 'pdfFiles', '_versions');
  if (filePath.indexOf(base + path.sep) !== 0) return '';
  return filePath;
}

function publicVersionUrl(docId, storedFile) {
  return '/pdfFiles/_versions/' + encodeURIComponent(String(docId)) + '/' + encodeURIComponent(path.basename(String(storedFile || '')));
}

function copyToStore(docId, seq, sourcePath, originalName) {
  if (!sourcePath || !fs.existsSync(sourcePath)) return '';
  var ext = path.extname(originalName || sourcePath) || path.extname(sourcePath);
  var base = path.basename(originalName || sourcePath, ext).replace(/[^\w.-]+/g, '_').slice(0, 40) || 'file';
  var stored = String(seq) + '_' + base + ext;
  var dest = path.join(versionDir(docId), stored);
  fs.copyFileSync(sourcePath, dest);
  return stored;
}

function copyIntoLive(doc, sourcePath, preferredName) {
  var dir = liveDir(doc.doc_path);
  fs.mkdirSync(dir, { recursive: true });
  var ext = path.extname(preferredName || sourcePath) || path.extname(sourcePath) || '';
  var rawBase = path.basename(preferredName || sourcePath, ext).replace(/^\d{10,}-/, '');
  var base = rawBase.replace(/[^\w.-]+/g, '_').slice(0, 20) || 'file';
  var stored = String(Date.now()).slice(-10) + '-' + base + ext;
  var dest = path.join(dir, stored);
  fs.copyFileSync(sourcePath, dest);
  return stored;
}

function overwriteLive(doc, sourcePath) {
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    throw new Error('The updated file was not found.');
  }
  var dest = liveFilePath(doc);
  if (!dest) {
    var dir = liveDir(doc.doc_path);
    fs.mkdirSync(dir, { recursive: true });
    dest = path.join(dir, path.basename(String(doc.doc || doc.doc_name || 'document')));
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
  }
  fs.copyFileSync(sourcePath, dest);
  return path.basename(dest);
}

function stamp() {
  return moment().format('YYYY-MM-DD HH:mm:ss');
}

function rowFromDoc(doc, extra) {
  extra = extra || {};
  return {
    doc_id: doc.doc_num,
    seq: extra.seq || 1,
    doc_version: Version.normalize(extra.doc_version || doc.version || '1.0'),
    qms_version: Version.normalize(extra.qms_version || doc.docRelVer || '1.0'),
    bump_type: extra.bump_type || 'initial',
    change_comment: extra.change_comment || 'Initial version',
    stored_file: extra.stored_file || '',
    doc_name: extra.doc_name || doc.doc_name || '',
    doc_desc: extra.doc_desc != null ? extra.doc_desc : (doc.docDesc || ''),
    release_dt: extra.release_dt || doc.releaseDt || null,
    is_current: extra.is_current ? 1 : 0,
    restored_from_id: extra.restored_from_id || null,
    created_by: extra.created_by || doc.created_by || '',
    created_at: extra.created_at || stamp()
  };
}

function insertRow(row, cb) {
  runSql(
    "INSERT INTO qms_doc_versions (doc_id, seq, doc_version, qms_version, bump_type, change_comment, stored_file, doc_name, doc_desc, release_dt, is_current, restored_from_id, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      row.doc_id, row.seq, row.doc_version, row.qms_version, row.bump_type, row.change_comment,
      row.stored_file, row.doc_name, row.doc_desc, row.release_dt, row.is_current,
      row.restored_from_id, row.created_by, row.created_at
    ],
    cb
  );
}

Version.liveFilePath = liveFilePath;
Version.versionFilePath = versionFilePath;
Version.publicVersionUrl = publicVersionUrl;

Version.list = withTables(function (docId, cb) {
  runSql(
    "SELECT * FROM qms_doc_versions WHERE doc_id = ? ORDER BY seq DESC",
    [docId],
    cb
  );
});

Version.listForDocs = withTables(function (ids, cb) {
  ids = (ids || []).map(Number).filter(function (id) { return id > 0; });
  if (!ids.length) return cb(null, []);
  runSql(
    "SELECT * FROM qms_doc_versions WHERE doc_id IN (" + ids.join(',') + ") ORDER BY doc_id ASC, seq DESC",
    [],
    cb
  );
});

Version.get = withTables(function (docId, versionId, cb) {
  runSql(
    "SELECT * FROM qms_doc_versions WHERE doc_id = ? AND version_id = ?",
    [docId, versionId],
    function (err, rows) {
      if (err) return cb(err);
      cb(null, rows && rows[0] ? rows[0] : null);
    }
  );
});

Version.maxSeq = withTables(function (docId, cb) {
  runSql("SELECT MAX(seq) AS maxSeq FROM qms_doc_versions WHERE doc_id = ?", [docId], function (err, rows) {
    if (err) return cb(err);
    cb(null, (rows && rows[0] && rows[0].maxSeq) ? Number(rows[0].maxSeq) : 0);
  });
});

Version.ensureInitial = withTables(function (doc, actor, cb) {
  if (!doc || !doc.doc_num) return cb(null, null);
  Version.list(doc.doc_num, function (err, rows) {
    if (err) return cb(err);
    if (rows && rows.length) return cb(null, rows);
    var stored = copyToStore(doc.doc_num, 1, liveFilePath(doc), doc.doc || doc.doc_name);
    var row = rowFromDoc(doc, {
      seq: 1,
      bump_type: 'initial',
      change_comment: 'Initial version',
      stored_file: stored,
      is_current: 1,
      created_by: actor || doc.created_by || ''
    });
    insertRow(row, function (insErr) {
      if (insErr) return cb(insErr);
      Version.list(doc.doc_num, cb);
    });
  });
});

Version.recordInitial = withTables(function (doc, actor, cb) {
  Version.ensureInitial(doc, actor, cb);
});

Version.freezeCurrent = withTables(function (doc, actor, cb) {
  Version.ensureInitial(doc, actor, function (err, rows) {
    if (err) return cb(err);
    var current = (rows || []).filter(function (row) {
      return Number(row.is_current) === 1;
    })[0] || (rows && rows[0]);
    if (!current) return cb(null, rows);
    var storedPath = current.stored_file ? versionFilePath(doc.doc_num, current.stored_file) : '';
    if (storedPath && fs.existsSync(storedPath)) return cb(null, rows);
    var stored = copyToStore(doc.doc_num, current.seq, liveFilePath(doc), doc.doc || doc.doc_name);
    if (!stored) return cb(null, rows);
    runSql(
      "UPDATE qms_doc_versions SET stored_file = ? WHERE version_id = ?",
      [stored, current.version_id],
      function (uErr) {
        if (uErr) return cb(uErr);
        Version.list(doc.doc_num, cb);
      }
    );
  });
});

Version.createSnapshot = withTables(function (doc, opts, cb) {
  opts = opts || {};
  var actor = opts.created_by || '';
  var comment = String(opts.change_comment || '').trim();
  var bumpType = opts.bump_type === 'major' ? 'major' : (opts.bump_type === 'restore' ? 'restore' : 'minor');
  if (!comment) return cb(new Error('A change comment is required.'));
  Version.freezeCurrent(doc, actor, function (err, rows) {
    if (err) return cb(err);
    Version.maxSeq(doc.doc_num, function (mErr, maxSeq) {
      if (mErr) return cb(mErr);
      var nextSeq = (maxSeq || 0) + 1;
      var bump = bumpType === 'major' ? 'major' : 'minor';
      var historyDoc = Version.maxOf([doc.version].concat((rows || []).map(function (row) { return row.doc_version; })));
      var historyQms = Version.maxOf([doc.docRelVer].concat((rows || []).map(function (row) { return row.qms_version; })));
      var nextDocVer = Version.bump(historyDoc, bump);
      var nextQmsVer = Version.bump(historyQms, bump);
      if (opts.doc_version && Version.cmp(opts.doc_version, nextDocVer) > 0) nextDocVer = Version.normalize(opts.doc_version);
      if (opts.qms_version && Version.cmp(opts.qms_version, nextQmsVer) > 0) nextQmsVer = Version.normalize(opts.qms_version);
      var sourcePath = opts.source_path || liveFilePath(doc);
      var stored = copyToStore(doc.doc_num, nextSeq, sourcePath, opts.stored_name || doc.doc || doc.doc_name);
      runSql("UPDATE qms_doc_versions SET is_current = 0 WHERE doc_id = ?", [doc.doc_num], function (uErr) {
        if (uErr) return cb(uErr);
        var row = rowFromDoc(doc, {
          seq: nextSeq,
          doc_version: nextDocVer,
          qms_version: nextQmsVer,
          bump_type: bumpType,
          change_comment: comment.slice(0, 500),
          stored_file: stored,
          doc_name: opts.doc_name || doc.doc_name,
          doc_desc: opts.doc_desc != null ? opts.doc_desc : doc.docDesc,
          release_dt: opts.release_dt || doc.releaseDt,
          is_current: 1,
          restored_from_id: opts.restored_from_id || null,
          created_by: actor
        });
        insertRow(row, function (insErr, res) {
          if (insErr) return cb(insErr);
          cb(null, {
            version_id: res.insertId,
            seq: nextSeq,
            doc_version: nextDocVer,
            qms_version: nextQmsVer,
            stored_file: stored
          });
        });
      });
    });
  });
});

function sqlDate(value) {
  var parsed = moment(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
}

function clip(value, max) {
  return String(value == null ? '' : value).slice(0, max);
}

Version.replaceCurrentFile = withTables(function (doc, opts, cb) {
  opts = opts || {};
  var sourcePath = opts.source_path;
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    return cb(new Error('The replacement file was not found.'));
  }
  Version.ensureInitial(doc, opts.created_by, function (err, rows) {
    if (err) return cb(err);
    var current = (rows || []).filter(function (row) {
      return Number(row.is_current) === 1;
    })[0] || (rows && rows[0]);
    var liveName;
    var stored = '';
    try {
      liveName = overwriteLive(doc, sourcePath);
      stored = current
        ? copyToStore(doc.doc_num, current.seq, sourcePath, liveName || opts.stored_name || path.basename(sourcePath))
        : '';
    } catch (copyErr) {
      return cb(copyErr);
    }
    if (!current) return cb(null, { doc: liveName, stored_file: stored });
    runSql(
      "UPDATE qms_doc_versions SET stored_file = ?, doc_name = ? WHERE version_id = ?",
      [stored || current.stored_file, clip(opts.doc_name || current.doc_name, 255), current.version_id],
      function (uErr) {
        if (uErr) return cb(uErr);
        cb(null, { doc: liveName, stored_file: stored });
      }
    );
  });
});

Version.updateCurrentFile = withTables(function (docId, data, cb) {
  runSql(
    "UPDATE file_info SET doc = ?, doc_name = ?, docRelVer = ?, docDesc = ?, version = ?, releaseDt = ?, last_modified = ? WHERE doc_num = ?",
    [
      clip(data.doc, 255),
      clip(data.doc_name, 255),
      clip(data.docRelVer || '1.0', 20),
      clip(data.docDesc, 255),
      clip(data.version || '1.0', 20),
      sqlDate(data.releaseDt),
      sqlDate(data.last_modified),
      docId
    ],
    cb
  );
});

Version.copyIntoLive = copyIntoLive;
Version.overwriteLive = overwriteLive;

module.exports = Version;
