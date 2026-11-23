const fs = require('fs');
const path = require('path');
const moment = require('moment');
const Version = require('../models/version.model');
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

function mapVersion(docId, row) {
  var stored = row.stored_file || '';
  return {
    version_id: row.version_id,
    seq: row.seq,
    doc_version: row.doc_version,
    qms_version: row.qms_version,
    bump_type: row.bump_type,
    change_comment: row.change_comment,
    stored_file: stored,
    doc_name: row.doc_name,
    doc_desc: row.doc_desc,
    release_dt: row.release_dt,
    is_current: !!row.is_current,
    restored_from_id: row.restored_from_id,
    created_by: row.created_by,
    created_at: row.created_at,
    file_url: stored ? Version.publicVersionUrl(docId, stored) : '',
    preview_url: '/versions/' + docId + '/' + row.version_id + '/preview',
    download_url: '/versions/' + docId + '/' + row.version_id + '/download'
  };
}

function sendFile(req, res, versionRow, inline) {
  var filePath = Version.versionFilePath(versionRow.doc_id, versionRow.stored_file);
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'That version file was not found.' });
  }
  var ext = path.extname(filePath).toLowerCase();
  var mimeTypes = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.ppt': 'application/vnd.ms-powerpoint'
  };
  var name = path.basename(filePath);
  res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
  res.setHeader('Content-Disposition', (inline ? 'inline' : 'attachment') + '; filename="' + name.replace(/"/g, '') + '"');
  return fs.createReadStream(filePath).pipe(res);
}

function requireDocRole(req, res, docId, minRole, next) {
  Access.userContext(req, function (err, ctx) {
    if (err) return res.status(500).json({ success: false, message: 'Unable to resolve permissions.' });
    Folder.bestDocAccess(docId, ctx, function (aErr, access) {
      if (aErr) return res.status(500).json({ success: false, message: 'Unable to resolve permissions.' });
      if (!access.canView || (minRole && (Folder.roleRank[access.role] || 0) < (Folder.roleRank[minRole] || 0))) {
        return res.status(403).json({ success: false, message: 'You do not have permission for this file.' });
      }
      next(access, ctx);
    });
  });
}

exports.list = function (req, res) {
  if (!requireAuth(req, res)) return;
  var docId = Number(req.params.docId);
  if (!docId) return res.status(400).json({ success: false, message: 'Document was not found.' });
  requireDocRole(req, res, docId, 'viewer', function () {
  Folder.getFileAny(docId, function (err, doc) {
    if (err) return res.status(500).json({ success: false, message: 'Unable to load versions.' });
    if (!doc) return res.status(404).json({ success: false, message: 'Document was not found.' });
    Version.ensureInitial(doc, actor(req), function (vErr, rows) {
      if (vErr) return res.status(500).json({ success: false, message: 'Unable to load versions.' });
      var versions = (rows || []).map(function (row) { return mapVersion(docId, row); });
      var current = versions.filter(function (row) { return row.is_current; })[0] || versions[0] || null;
      res.json({
        success: true,
        doc_id: docId,
        name: doc.doc_name || doc.doc,
        current_version: Version.normalize(doc.version),
        current_qms: Version.normalize(doc.docRelVer),
        next_minor: {
          doc: Version.bump(doc.version, 'minor'),
          qms: Version.bump(doc.docRelVer, 'minor')
        },
        next_major: {
          doc: Version.bump(doc.version, 'major'),
          qms: Version.bump(doc.docRelVer, 'major')
        },
        current: current,
        versions: versions
      });
    });
  });
  });
};

exports.preview = function (req, res) {
  if (!requireAuth(req, res)) return;
  var docId = Number(req.params.docId);
  var versionId = Number(req.params.versionId);
  requireDocRole(req, res, docId, 'viewer', function () {
  Version.get(docId, versionId, function (err, row) {
    if (err || !row) return res.status(404).json({ success: false, message: 'Version was not found.' });
    sendFile(req, res, row, true);
  });
  });
};

exports.download = function (req, res) {
  if (!requireAuth(req, res)) return;
  var docId = Number(req.params.docId);
  var versionId = Number(req.params.versionId);
  requireDocRole(req, res, docId, 'viewer', function () {
  Version.get(docId, versionId, function (err, row) {
    if (err || !row) return res.status(404).json({ success: false, message: 'Version was not found.' });
    sendFile(req, res, row, false);
  });
  });
};

exports.restore = function (req, res) {
  if (!requireAuth(req, res)) return;
  if (!Role.requireMin(req, res, 'editor')) return;
  var docId = Number(req.params.docId);
  var versionId = Number(req.params.versionId);
  var comment = String(req.body.changeComment || req.body.comment || '').trim();
  var bumpType = req.body.bumpType === 'major' ? 'major' : 'minor';
  if (!comment) return res.status(400).json({ success: false, message: 'A change comment is required.' });
  requireDocRole(req, res, docId, 'editor', function () {
  Folder.getFile(docId, function (err, doc) {
    if (err) return res.status(500).json({ success: false, message: 'Unable to restore this version.' });
    if (!doc) return res.status(404).json({ success: false, message: 'Document was not found.' });
    Version.get(docId, versionId, function (vErr, source) {
      if (vErr || !source) return res.status(404).json({ success: false, message: 'Version was not found.' });
      if (source.is_current) return res.status(400).json({ success: false, message: 'That version is already current.' });
      var sourcePath = Version.versionFilePath(docId, source.stored_file);
      if (!sourcePath || !fs.existsSync(sourcePath)) {
        return res.status(404).json({ success: false, message: 'The snapshot file is missing.' });
      }
      var liveName;
      try {
        liveName = Version.copyIntoLive(doc, sourcePath, source.stored_file || doc.doc);
      } catch (copyErr) {
        return res.status(500).json({ success: false, message: 'Unable to restore the file.' });
      }
      var nextDoc = Version.bump(doc.version, bumpType);
      var nextQms = Version.bump(doc.docRelVer, bumpType);
      var livePath = path.join(path.resolve(), 'public', 'pdfFiles');
      var parts = String(doc.doc_path || '').split('/').filter(Boolean);
      var restoredLive = path.join.apply(path, [livePath].concat(parts).concat([liveName]));
      Version.createSnapshot(doc, {
        bump_type: 'restore',
        change_comment: comment,
        created_by: actor(req),
        source_path: restoredLive,
        stored_name: liveName,
        doc_version: nextDoc,
        qms_version: nextQms,
        doc_name: source.doc_name || doc.doc_name,
        doc_desc: source.doc_desc != null ? source.doc_desc : doc.docDesc,
        release_dt: moment().format('YYYY-MM-DD'),
        restored_from_id: source.version_id
      }, function (sErr, snap) {
        if (sErr) return res.status(500).json({ success: false, message: sErr.message || 'Unable to restore this version.' });
        Version.updateCurrentFile(docId, {
          doc: liveName,
          doc_name: source.doc_name || doc.doc_name,
          docRelVer: nextQms,
          docDesc: source.doc_desc != null ? source.doc_desc : (doc.docDesc || ''),
          version: nextDoc,
          releaseDt: moment().format('YYYY-MM-DD')
        }, function (uErr) {
          if (uErr) return res.status(500).json({ success: false, message: 'File restored but current record was not updated.' });
          res.json({
            success: true,
            message: 'Restored as v' + nextDoc + ' (new current version).',
            version: snap
          });
        });
      });
    });
  });
  });
};
