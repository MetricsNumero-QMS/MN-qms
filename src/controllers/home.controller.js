const express = require('express');
const moment = require('moment');
const crypto = require('crypto');
var path = require('path');
const FilesList = require('../models/files.model');
const Dashboard = require('../models/dashboard.model');
const Version = require('../models/version.model');
const Access = require('../models/access.model');
const Folder = require('../models/folder.model');
const Role = require('../models/role.model');
const Mail = require('../models/mail.model');
var dbConn = require('./../../config/db.config');
var docxConverter = require('docx-pdf');
const readXlsxFile = require('read-excel-file/node');
const multer = require('multer');
const fs = require('fs');
var mime = require('mime');
const mammoth = require('mammoth');
const { json } = require('body-parser');
const { authenticate } = require('ldap-authentication');
// login and logout logic starts here-----------------
function safeNextPath(value) {
  var next = String(value || '').trim();
  if (!next || next.charAt(0) !== '/' || next.charAt(1) === '/' || next.indexOf('\\') !== -1) return '';
  if (next.indexOf('://') !== -1) return '';
  if (!/^\/[A-Za-z0-9/_\-.?=&%]*$/.test(next)) return '';
  return next;
}

exports.login = function(req, res) {
  var next = safeNextPath(req.query.next);
  if (next && req.session) req.session.returnTo = next;
  if (req.session && req.session.username && next) {
    return res.redirect(next);
  }
  var created = req.flash('signupNotice');
  var noted = req.flash('loginNotice');
  var notice = [].concat(created || [], noted || []).filter(Boolean).join(' ');
  res.render('login', {
    title  : 'Login Page',
    message:req.flash('message'),
    success: false,
    next: next,
    signupError: '',
    signupOpen: false,
    signupUser: '',
    signupEmail: '',
    signupNotice: notice,
    forgotError: '',
    forgotOpen: false,
    forgotEmail: '',
    resetToken: '',
    resetEmail: '',
    resetError: ''
    });
};

var resetTableReady = false;

function requestOrigin(req) {
  var host = req.get('x-forwarded-host') || req.get('host') || '';
  var proto = req.get('x-forwarded-proto') || req.protocol || 'http';
  return proto + '://' + host;
}

function ensureResetTable(cb) {
  if (resetTableReady) return cb();
  dbConn.query(
    "CREATE TABLE IF NOT EXISTS qms_password_resets (" +
      "reset_id int NOT NULL AUTO_INCREMENT," +
      "emp_email varchar(155) NOT NULL," +
      "reset_token varchar(64) NOT NULL," +
      "expires_at datetime NOT NULL," +
      "used_at datetime DEFAULT NULL," +
      "created_at datetime NOT NULL," +
      "PRIMARY KEY (reset_id)," +
      "UNIQUE KEY uniq_reset_token (reset_token)," +
      "KEY idx_reset_email (emp_email)" +
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8",
    function (err) {
      if (err) return cb(err);
      resetTableReady = true;
      cb();
    }
  );
}

function loginShell(extras) {
  return Object.assign({
    title: 'Login Page',
    message: '',
    success: false,
    next: '',
    signupError: '',
    signupOpen: false,
    signupUser: '',
    signupEmail: '',
    signupNotice: '',
    forgotError: '',
    forgotOpen: false,
    forgotEmail: '',
    resetToken: '',
    resetEmail: '',
    resetError: ''
  }, extras || {});
}

exports.forgotPassword = function (req, res) {
  var email = String(req.body.email || '').trim();
  function fail(message) {
    return res.status(400).render('login', loginShell({
      forgotError: message,
      forgotOpen: true,
      forgotEmail: email
    }));
  }
  if (!email) return fail('Enter the email address for your account.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 155) {
    return fail('Enter a valid email address.');
  }
  ensureResetTable(function (tableErr) {
    if (tableErr) return fail('Unable to start a password reset.');
    dbConn.query(
      "SELECT emp_email FROM login WHERE LOWER(emp_email) = LOWER(?) LIMIT 1",
      [email],
      function (err, rows) {
        if (err) return fail('Unable to start a password reset.');
        var account = rows && rows[0];
        if (!account) {
          req.flash('loginNotice', 'If that email is registered, a reset link is on its way. It expires in 60 minutes.');
          return res.redirect('/login');
        }
        var token = crypto.randomBytes(32).toString('hex');
        var now = moment().format('YYYY-MM-DD HH:mm:ss');
        var expires = moment().add(60, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        var address = account.emp_email;
        dbConn.query(
          "UPDATE qms_password_resets SET used_at = ? WHERE LOWER(emp_email) = LOWER(?) AND used_at IS NULL",
          [now, address],
          function () {
            dbConn.query(
              "INSERT INTO qms_password_resets (emp_email, reset_token, expires_at, created_at) VALUES (?,?,?,?)",
              [address, token, expires, now],
              function (insErr) {
                if (insErr) return fail('Unable to start a password reset.');
                var link = requestOrigin(req) + '/reset-password/' + token;
                Mail.sendMail({
                  to: address,
                  subject: 'Reset your MN-QMS password',
                  html: Mail.passwordResetHtml({ link: link })
                }, function (mailErr) {
                  if (mailErr) return fail(mailErr.message || 'Unable to send the reset email.');
                  req.flash('loginNotice', 'If that email is registered, a reset link is on its way. It expires in 60 minutes.');
                  res.redirect('/login');
                });
              }
            );
          }
        );
      }
    );
  });
};

function loadResetToken(token, cb) {
  if (!/^[a-f0-9]{64}$/.test(token)) return cb(null, null);
  ensureResetTable(function (err) {
    if (err) return cb(err);
    dbConn.query(
      "SELECT * FROM qms_password_resets WHERE reset_token = ? LIMIT 1",
      [token],
      function (qErr, rows) {
        if (qErr) return cb(qErr);
        var row = rows && rows[0];
        if (!row || row.used_at) return cb(null, null);
        if (row.expires_at && moment(row.expires_at).isBefore(moment())) return cb(null, null);
        cb(null, row);
      }
    );
  });
}

exports.resetPasswordForm = function (req, res) {
  var token = String(req.params.token || '');
  loadResetToken(token, function (err, row) {
    if (err || !row) {
      return res.status(400).render('login', loginShell({
        message: 'That reset link is not valid or has expired.'
      }));
    }
    res.render('login', loginShell({
      resetToken: token,
      resetEmail: row.emp_email
    }));
  });
};

exports.resetPassword = function (req, res) {
  var token = String(req.params.token || '');
  var password = String(req.body.password || '');
  var confirmPassword = String(req.body.confirmPassword || '');
  loadResetToken(token, function (err, row) {
    if (err || !row) {
      return res.status(400).render('login', loginShell({
        message: 'That reset link is not valid or has expired.'
      }));
    }
    function fail(message) {
      return res.status(400).render('login', loginShell({
        resetToken: token,
        resetEmail: row.emp_email,
        resetError: message
      }));
    }
    if (!password || !confirmPassword) return fail('Password and confirmed password are required.');
    if (!strongSignupPassword(password)) {
      return fail('Use 8–64 characters with uppercase, lowercase, a number, and a symbol.');
    }
    if (password !== confirmPassword) return fail('Password and confirmed password must match.');
    dbConn.query(
      "UPDATE login SET pswd = ? WHERE LOWER(emp_email) = LOWER(?)",
      [password, row.emp_email],
      function (upErr, result) {
        if (upErr || !result || !result.affectedRows) return fail('Unable to update the password.');
        dbConn.query(
          "UPDATE qms_password_resets SET used_at = ? WHERE reset_id = ?",
          [moment().format('YYYY-MM-DD HH:mm:ss'), row.reset_id],
          function () {
            req.flash('loginNotice', 'Password updated. Sign in with your new password.');
            res.redirect('/login');
          }
        );
      }
    );
  });
};

function strongSignupPassword(value) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/.test(String(value || ''));
}

exports.signup = function (req, res) {
  var username = String(req.body.username || '').trim();
  var email = String(req.body.email || '').trim();
  var password = String(req.body.password || '');
  var confirmPassword = String(req.body.confirmPassword || '');
  function fail(message) {
    return res.status(400).render('login', {
      title: 'Login Page',
      message: '',
      success: false,
      next: '',
      signupError: message,
      signupOpen: true,
      signupUser: username,
      signupEmail: email,
      signupNotice: ''
    });
  }
  if (!username || !email || !password || !confirmPassword) {
    return fail('Username, email id, password, and confirmed password are required.');
  }
  if (username.length > 20) return fail('Username must be 20 characters or fewer.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 155) {
    return fail('Enter a valid email id.');
  }
  if (!strongSignupPassword(password)) {
    return fail('Use 8–64 characters with uppercase, lowercase, a number, and a symbol.');
  }
  if (password !== confirmPassword) return fail('Password and confirmed password must match.');
  dbConn.query("ALTER TABLE login MODIFY pswd varchar(128) NOT NULL", function () {
    dbConn.query(
      "SELECT username, emp_email FROM login WHERE LOWER(username) = LOWER(?) OR LOWER(emp_email) = LOWER(?) LIMIT 1",
      [username, email],
      function (err, rows) {
        if (err) return fail('Unable to create the account.');
        if (rows && rows[0]) {
          if (String(rows[0].emp_email || '').toLowerCase() === email.toLowerCase()) {
            return fail('An account with this email already exists.');
          }
          return fail('That username is already taken.');
        }
        dbConn.query("SELECT COALESCE(MAX(user_id), 0) + 1 AS next_id FROM login", function (idErr, idRows) {
          if (idErr || !idRows || !idRows[0]) return fail('Unable to create the account.');
          dbConn.query(
            "INSERT INTO login (user_id, first_name, last_name, username, emp_email, pswd, user_role, department, reporting_manager, sys_role) VALUES (?, '', '', ?, ?, ?, 0, '', '', 'viewer')",
            [idRows[0].next_id, username, email, password],
            function (insErr) {
              if (insErr) return fail('Unable to create the account.');
              req.flash('signupNotice', 'Account created. Sign in with your email address.');
              res.redirect('/login');
            }
          );
        });
      }
    );
  });
};

async function auth(username,password){
  // return username+' '+password; 
  // auth with admin
  // console.log(password);
  // return false;
  // let options = {
  //   ldapOpts: {
  //     url: 'ldap://openldap:389',
  //     connectTimeout : 30000,
  //     reconnect : true      
  //   },
  //   userDn: 'cn=mohan.b,dc=alpha-numero,dc=com',
    
  //   userPassword: 'lpha',
  //   userSearchBase: 'dc=alpha-numero,dc=com',    
  // }
  // options = {
  //   ldapOpts: {
  //     url: 'ldap://openldap:389',     
  //   },
  //   adminDn: 'cn=admin,dc=alpha-numero,dc=com',
  //   userDn: 'uid=mohan,dc=alpha-numero,dc=com',
  //   verifyUserExists: true,
  //   userSearchBase: 'dc=alpha-numero,dc=com',
  //   usernameAttribute: 'uid',
  //   username: 'mohan',    
  // }
  // user = await authenticate(options)
  // console.log(user)



  // options = {
  //   ldapOpts: {
  //     url: 'ldap://openldap:389', 
  //     connectTimeout : 30000,
  //     reconnect : true         
  //   },
  //   userDn: 'uid=mohan,dc=alpha-numero,dc=com',
  //   userPassword: 'Alpha2023!',    
  //   userSearchBase: 'dc=alpha-numero,dc=com',
  //   usernameAttribute: 'uid',
  //   username: 'mohan.b',    
  // }
  // user = await authenticate(options)
  // console.log(user)
} 

exports.signin = function(req, res) { 
  // try{  
  // auth();
  // }catch(err){
  // console.log(err);
  // }
  
  var username = req.body.username;
  var password = req.body.passwd;
  Role.ensure(function () {
  FilesList.loginChk(username,password,function(err, data){    
    if (err){
      res.send(err);
    }else{        
      var userChk = data[0].length; 
      var rawdt = JSON.parse(JSON.stringify(data[1]));
      if(userChk > 0 ){ 
        req.session.username = req.body.username; 
        req.session.userrole = rawdt;
        if (data[0] && data[0][0]) {
          req.session.firstName = data[0][0].first_name;
          req.session.lastName = data[0][0].last_name;
          Role.attachSession(req, data[0][0]);
        } else {
          Role.attachSession(req, rawdt && rawdt[0] ? rawdt[0] : null);
        } 
        var hour = 3600000;
        req.session.cookie.expires = new Date(Date.now() + hour);
        req.session.cookie.maxAge = hour;
        var next = safeNextPath(req.body.next || (req.session && req.session.returnTo));
        if (req.session) req.session.returnTo = null;
        setTimeout(function() {
        res.redirect(next || '/home');
      }, 500);
      }else{
        req.flash('message','Invalid username or password');
        var failNext = safeNextPath(req.body.next);
        res.redirect(failNext ? ('/login?next=' + encodeURIComponent(failNext)) : '/login');
      }             
    }      
  });
  });             
};

exports.logout = function(req, res) {  
  req.session.destroy();
  res.redirect('/login');      
};

function requireEditorPage(req, res) {
  if (!Role.can(Role.fromRequest(req), 'editor')) {
    if (req.xhr || (req.headers.accept || '').indexOf('json') !== -1) {
      res.status(403).json({ success: false, message: 'Your user role cannot do this.' });
    } else {
      res.redirect('/home');
    }
    return false;
  }
  return true;
}

function requireAdminPage(req, res) {
  if (!Role.isAdmin(req)) {
    res.redirect('/home');
    return false;
  }
  return true;
}
// login and logout logic ends here-----------------

// Home page logic starts here-----------------
function percentChange(current, previous) {
  if (!previous && !current) return { text: 'No change', up: null };
  if (!previous && current) return { text: '+' + current + ' new', up: true };
  var pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { text: 'No change', up: null };
  return { text: (pct > 0 ? '+' : '') + pct + '% this month', up: pct > 0 };
}

exports.home = function(req, res) {
  if(req.session.username == null){      
      return res.redirect('/');
  }
  var username = req.session.username;
  function renderHome() {
    Dashboard.home(username, function (err, data) {
      if (err) {
        console.log(err);
        return res.status(500).send('Unable to load dashboard.');
      }
      var hour = moment().hour();
      var greeting = hour < 12 ? 'Good Morning' : (hour < 17 ? 'Good Afternoon' : 'Good Evening');
      res.render('index', {
        title: 'Dashboard',
        greeting: greeting,
        todayLabel: moment().format('dddd, D MMMM YYYY'),
        totals: data.totals,
        trends: {
          documents: percentChange(data.totals.documentsMonth, data.totals.documentsPrev),
          folders: percentChange(data.totals.foldersMonth, data.totals.foldersPrev),
          libraries: { text: 'No change', up: null },
          pending: data.totals.pending ? { text: '+' + data.totals.pending + ' open', up: true } : { text: 'No change', up: null },
          reviewDue: data.totals.reviewDue ? { text: '+' + data.totals.reviewDue + ' due', up: false } : { text: 'No change', up: null },
          archived: { text: 'No change', up: null }
        },
        categories: data.categories,
        recentDocs: data.recentDocs,
        activityDays: data.activityDays,
        uploadDays: data.uploadDays,
        upcoming: data.upcoming,
        status: data.status,
        notificationCount: data.notificationCount,
        chartData: JSON.stringify({
          categories: data.categories,
          activity: data.activityDays,
          uploads: data.uploadDays,
          status: data.status
        }),
        moment: moment,
        success: false
      });
    });
  }
  if (!req.session.firstName) {
    Dashboard.userByEmail(username, function (uErr, user) {
      if (user) req.session.firstName = user.first_name;
      res.locals.displayName = req.session.firstName || String(username).split('@')[0];
      renderHome();
    });
  } else {
    renderHome();
  }
};

function fileTypeLabel(name) {
  var ext = String(name || '').split('.').pop().toLowerCase();
  if (ext === 'docx' || ext === 'doc') return 'DOCX';
  if (ext === 'pdf') return 'PDF';
  if (ext === 'xlsx' || ext === 'xls') return 'XLSX';
  if (ext === 'pptx' || ext === 'ppt') return 'PPTX';
  return (ext || 'FILE').toUpperCase();
}

function shortPerson(value) {
  var raw = String(value || '').trim();
  if (!raw) return '';
  var token = raw.split('@')[0].split(/[.\s_]+/)[0];
  return token ? token.charAt(0).toUpperCase() + token.slice(1) : raw;
}

function formatLibItem(item) {
  return {
    kind: item.kind,
    id: item.id || null,
    versionId: item.versionId || null,
    isCurrent: item.kind === 'document' ? item.isCurrent !== false : true,
    name: item.name || '',
    fileName: item.fileName || item.name || '',
    typeLabel: item.typeLabel || (item.kind === 'document' ? fileTypeLabel(item.fileName || item.name) : 'Folder'),
    modified: item.modified || null,
    modifiedLabel: item.modified ? moment(item.modified).format('D MMM YYYY') : '--',
    modifiedBy: shortPerson(item.modifiedBy),
    size: item.size || '--',
    canView: item.canView !== false,
    canRequest: !!item.canRequest,
    canEdit: !!item.canEdit,
    canUpload: !!item.canUpload,
    canShare: !!item.canShare,
    canManage: !!item.canManage,
    canDelete: !!item.canDelete,
    locked: !!item.locked,
    accessRole: item.accessRole || '',
    folderId: item.folderId || null,
    requestedRole: item.requestedRole || '',
    requestMessage: item.requestMessage || '',
    href: item.href || '#',
    menu: item.menu || item._menu || '',
    submenu: item.submenu || '',
    download: item.download || '',
    previewUrl: item.previewUrl || '',
    fileUrl: item.fileUrl || '',
    version: item.kind === 'document' ? Version.normalize(item.version) : '',
    qmsVersion: item.kind === 'document' ? Version.normalize(item.qmsVersion) : ''
  };
}

function versionFileName(row, parent) {
  var named = String(row.doc_name || '');
  if (named && /\.[A-Za-z0-9]+$/.test(named)) return named;
  if (row.stored_file) return String(row.stored_file);
  return parent.fileName || parent.name || named;
}

function versionLibItem(parent, row) {
  var isCurrent = Number(row.is_current) === 1;
  var previewUrl = '/versions/' + parent.id + '/' + row.version_id + '/preview';
  var downloadUrl = '/versions/' + parent.id + '/' + row.version_id + '/download';
  return formatLibItem({
    kind: 'document',
    id: parent.id,
    versionId: row.version_id,
    isCurrent: isCurrent,
    name: parent.name,
    fileName: versionFileName(row, parent),
    typeLabel: parent.typeLabel,
    modified: row.created_at || parent.modified,
    modifiedBy: row.created_by || parent.modifiedBy,
    size: parent.size || '--',
    version: row.doc_version,
    qmsVersion: row.qms_version,
    href: parent.href,
    download: isCurrent ? (parent.download || downloadUrl) : downloadUrl,
    previewUrl: isCurrent ? '' : previewUrl,
    fileUrl: row.stored_file ? Version.publicVersionUrl(parent.id, row.stored_file) : '',
    canView: parent.canView !== false,
    canEdit: isCurrent && !!parent.canEdit,
    canUpload: isCurrent && !!parent.canUpload,
    canShare: isCurrent && !!parent.canShare,
    canManage: isCurrent && !!parent.canManage,
    canDelete: isCurrent && !!parent.canDelete,
    accessRole: parent.accessRole || ''
  });
}

function expandVersionItems(items, cb) {
  var list = items || [];
  var ids = [];
  var seen = {};
  list.forEach(function (item) {
    var id = item && item.kind === 'document' ? Number(item.id) : 0;
    if (!id || seen[id]) return;
    seen[id] = true;
    ids.push(id);
  });
  if (!ids.length) return cb(null, list);
  Version.listForDocs(ids, function (err, rows) {
    if (err) {
      console.log(err);
      return cb(null, list);
    }
    var byDoc = {};
    (rows || []).forEach(function (row) {
      var id = Number(row.doc_id);
      if (!byDoc[id]) byDoc[id] = [];
      byDoc[id].push(row);
    });
    var out = [];
    list.forEach(function (item) {
      if (!item || item.kind !== 'document' || !item.id) {
        out.push(item);
        return;
      }
      var vers = byDoc[Number(item.id)] || [];
      var currentVer = vers.filter(function (row) { return Number(row.is_current) === 1; })[0] || vers[0];
      if (currentVer && currentVer.doc_version) item.version = currentVer.doc_version;
      if (vers.length < 2) {
        item.isCurrent = true;
        out.push(item);
        return;
      }
      vers.sort(function (a, b) { return Number(b.seq) - Number(a.seq); });
      vers.forEach(function (row) {
        out.push(versionLibItem(item, row));
      });
    });
    cb(null, out);
  });
}

function docsToItems(docs, recycled) {
  return (docs || []).map(function (doc) {
    var parts = String(doc.doc_path || '').split('/');
    var menu = parts[0] || '';
    var submenu = parts[1] || '';
    var fileName = doc.doc || '';
    var label = doc.doc_name || '';
    if (!label || !/\.[A-Za-z0-9]+$/.test(label)) label = fileName || label;
    return formatLibItem({
      kind: 'document',
      id: doc.doc_num,
      name: label,
      fileName: fileName || label,
      typeLabel: fileTypeLabel(doc.doc || label),
      modified: doc.last_modified || doc.last_access || doc.releaseDt || doc.created_at,
      modifiedBy: doc.updated_by || doc.created_by || '',
      size: '--',
      version: doc.version || '',
      qmsVersion: doc.docRelVer || '',
      href: recycled ? '#' : (menu ? ('/category?menu=' + encodeURIComponent(menu) + '&submenu=' + encodeURIComponent(submenu)) : '/library'),
      download: menu ? ('/downloadDocument/' + encodeURIComponent(menu) + '/' + encodeURIComponent(submenu) + '/' + encodeURIComponent(doc.doc || label)) : ''
    });
  });
}

function foldersToItems(folders, recycled) {
  return (folders || []).map(function (folder) {
    return formatLibItem({
      kind: 'folder',
      id: folder.folder_id,
      name: folder.folder_name,
      typeLabel: 'Folder',
      modified: folder.updated_at || folder.review_date || folder.retain_until,
      modifiedBy: folder.created_by || folder.owner || '',
      size: '--',
      href: recycled ? '#' : ('/library?menu=' + encodeURIComponent(folder.category_menu || '') + '&submenu=' + encodeURIComponent(folder.category_submenu || '') + '&folder=' + folder.folder_id)
    });
  });
}

exports.library = function (req, res) {
  if (req.session.username == null) {
    return res.redirect('/');
  }
  var filter = String(req.query.filter || 'library');
  var allowed = ['library', 'mine', 'shared', 'recent', 'favorites', 'pending', 'expiring', 'recycle'];
  if (allowed.indexOf(filter) === -1) filter = 'library';
  var titles = {
    library: 'Document Library',
    mine: 'My Documents',
    shared: 'Shared With Me',
    recent: 'Recent',
    favorites: 'Favorites',
    pending: 'Pending Approval',
    expiring: 'Expiring Documents',
    recycle: 'Recycle Bin'
  };
  var menu = String(req.query.menu || '');
  var submenu = String(req.query.submenu || '');
  var folderId = req.query.folder || '';
  var searchQ = String(req.query.q || '');

  function renderExplorer(items, crumbs, level, currentFolder) {
    Access.userContext(req, function (cErr, ctx) {
      ctx = ctx || {
        email: req.session.username,
        isAdmin: Role.isAdmin(req),
        sysRole: Role.fromRequest(req),
        identities: [req.session.username],
        department: '',
        linkRoles: {}
      };
      function finish(finalItems, caps) {
        var sysCaps = Role.caps((ctx && ctx.sysRole) || Role.fromRequest(req));
        var canCreate = filter === 'library' && sysCaps.canUpload;
        if (caps && caps.canUpload === false) canCreate = false;
        if (currentFolder && caps && !caps.canUpload) canCreate = false;
        var canInvite = filter === 'library' && sysCaps.canShare;
        var uploadHref = menu && submenu
          ? ('/category?menu=' + encodeURIComponent(menu) + '&submenu=' + encodeURIComponent(submenu))
          : '';
        var departments = ['Admin', 'Bd', 'Flow', 'Global', 'Hr', 'It', 'Purchase', 'Qag', 'VLSI'];
        res.render('library', {
          title: titles[filter],
          pageHeading: titles[filter],
          filter: filter,
          searchQ: searchQ,
          menu: menu,
          submenu: submenu,
          folderId: folderId,
          level: level || 'root',
          crumbs: crumbs,
          items: finalItems,
          itemsJson: JSON.stringify(finalItems).replace(/</g, '\\u003c'),
          canCreate: canCreate,
          canInvite: canInvite,
          uploadHref: uploadHref,
          currentFolder: currentFolder || null,
          departments: departments,
          moment: moment
        });
      }
      function afterAcl(list, caps) {
        if (filter === 'recycle') return finish(list, caps);
        expandVersionItems(list, function (err, expanded) {
          finish(expanded || list, caps);
        });
      }
      function applyAcl(list, caps) {
        if (filter === 'recycle') return afterAcl(list, { canUpload: false });
        Folder.filterLibraryItems(list, ctx, function (fErr, filtered) {
          afterAcl(filtered || list, caps || { canUpload: true });
        });
      }
      function withPending(list, caps) {
        if (filter !== 'pending') return applyAcl(list, caps);
        Access.pendingRequestsFor(ctx, function (pErr, requests) {
          var extra = (requests || []).map(function (row) {
            return formatLibItem({
              kind: 'request',
              id: row.request_id,
              folderId: row.folder_id,
              name: 'Access request · ' + (row.folder_name || 'Folder'),
              fileName: row.requested_by,
              typeLabel: 'Access request',
              modified: row.created_at,
              modifiedBy: row.requested_by,
              requestedRole: row.requested_role,
              requestMessage: row.message || '',
              href: '/library?folder=' + row.folder_id,
              canManage: true
            });
          });
          applyAcl((list || []).concat(extra), caps);
        });
      }
      if (folderId && filter === 'library') {
        return Folder.getById(Number(folderId), function (gErr, folder) {
          if (!folder) return withPending(items);
          Folder.resolveAccess(folder, ctx.email, ctx.isAdmin, function (aErr, access) {
            var caps = Folder.capsFromAccess(access);
            if (!access.canView) {
              var shared = (ctx && ctx.sharedDocs) || {};
              var hasShared = (items || []).some(function (item) {
                return item && item.kind === 'document' && (shared[String(item.id)] || shared[item.id]);
              });
              if (!hasShared) {
                return afterAcl([formatLibItem({
                  kind: 'folder',
                  id: folder.folder_id,
                  name: folder.folder_name,
                  typeLabel: 'Restricted folder',
                  locked: true,
                  canRequest: !!access.canRequest,
                  canView: false,
                  href: '#'
                })], caps);
              }
              return withPending(items, { canUpload: false, canView: true });
            }
            withPending(items, caps);
          }, ctx);
        });
      }
      withPending(items);
    });
  }

  if (filter !== 'library') {
    return Dashboard.library({
      filter: filter,
      q: searchQ,
      username: req.session.username
    }, function (err, data) {
      if (err) {
        console.log(err);
        return res.status(500).send('Unable to load documents.');
      }
      var recycled = filter === 'recycle';
      var items = foldersToItems(data.folders, recycled).concat(docsToItems(data.documents, recycled));
      renderExplorer(items, [
        { label: 'Home', href: '/home' },
        { label: titles[filter], href: '' }
      ], 'filter', null);
    });
  }

  Dashboard.browse({
    menu: menu,
    submenu: submenu,
    folderId: folderId,
    q: searchQ
  }, function (err, data) {
    if (err) {
      console.log(err);
      return res.status(500).send('Unable to load documents.');
    }
    var items = (data.items || []).map(formatLibItem);
    var crumbs = [
      { label: 'Home', href: '/home' },
      { label: 'Document Library', href: '/library' }
    ];
    if (menu) crumbs.push({ label: menu, href: '/library?menu=' + encodeURIComponent(menu) });
    if (submenu) crumbs.push({ label: submenu, href: '/library?menu=' + encodeURIComponent(menu) + '&submenu=' + encodeURIComponent(submenu) });
    if (data.currentFolder) {
      crumbs.push({ label: data.currentFolder.folder_name, href: '' });
    }
    if (crumbs.length) crumbs[crumbs.length - 1].href = '';
    renderExplorer(items, crumbs, data.level, data.currentFolder);
  });
};
//Home page logic ends here-------------------------------------------------------------------------

//Category page logic starts here-------------------------------------------------------------------
//Below method list out the document from the DB, 
//script for reading directory structure is commented is used wher required , for existing files in the folder.
exports.category = function(req, res) {  
  if(req.session.username == null){    
    res.redirect('/'); //if user is not logged-in redirect back to login page //
  }   
  var userole = Role.caps(Role.fromRequest(req)).canUpload ? '' : 'disable';
  const menu            =  req.query.menu;
  const submenu         =  req.query.submenu; 
  const doc_path        =  menu+'/'+submenu;
  const dirStrt         = 'public/pdfFiles'+'/'+menu+'/'+submenu; 
  const conrtedFilePath = 'public/pdfFiles'+'/'+menu+'/'+submenu+'/convertion';  
  // var files   = []; 
  // var conCat = [];  
  // fs.readdirSync(dirStrt).forEach(file => { 
  //    files.push(file);
  //   console.log(file);
  //   var insertData = "INSERT INTO file_info(doc,version,status,doc_path)VALUES(?,?,?,?)"
  //   dbConn.query(insertData, [file,"1","0",doc_path], (err, result) => {
  //   if(err){      
  //     console.log(err);
  //   }       
  //   });
  // });
  // return false;
  const filePath = menu+'/'+submenu;
  const new_files = new FilesList(req.body);
  FilesList.selectAllFiles(new_files, filePath, function(err, files) {
    console.log(files);
    if (err){
      res.send(err);
    }else{     
      setTimeout(function() {                   
        res.render('charterAdmin', {
        title       : 'File List',
        menu        : 'Home'+'>'+'Category'+'>'+ menu + '>'+submenu,
        fetchData   : files[0],
        menu        : menu,
        submenu     : submenu, 
        message     : req.flash('message'),   
        succdel     : req.flash('succdel'),
        succupd     : req.flash('succupd'),
        latestid    : (function () {
          var flashLatest = req.flash('latestid');
          if (flashLatest && flashLatest.length && flashLatest[0]) {
            return flashLatest;
          }
          if (files[1] && files[1][0] && files[1][0].doc_num) {
            return [files[1][0].doc_num];
          }
          if (files[0] && files[0][0] && files[0][0].doc_num) {
            return [files[0][0].doc_num];
          }
          return [];
        })(),
        latestupfile: (function () {
          var flashFile = req.flash('file_name');
          if (flashFile && flashFile.length && flashFile[0]) {
            return flashFile;
          }
          if (files[1] && files[1][0] && files[1][0].doc_name) {
            return [files[1][0].doc_name];
          }
          if (files[0] && files[0][0] && (files[0][0].doc_name || files[0][0].docDn)) {
            return [files[0][0].doc_name || files[0][0].docDn];
          }
          return [];
        })(),
        latestDoc   : files[1],
        userrole    : userole,
        username    : req.session.username,
        moment      : moment,
        success     : false
        });   
        
      }, 500);
      }      
  });    
};

// Uploading document logic starts here -----------------------------------------------------------
//multer library which set the path and upload the file.
const fileStorage = multer.diskStorage({   
  destination: function (req, file, cb) {      
    const menu =  req.params.menu;
    const submenu = req.params.submenu;
    if(menu){
      cb(null, 'public/pdfFiles'+'/'+menu+'/'+submenu);
    }else{
      cb(null, 'public/importUsrDb');
    }
    
  },
  filename: (req, file, cb) => {
    var original = path.basename(file.originalname || 'document').slice(0, 40);
    if (String(req.originalUrl || req.path || '').indexOf('/editDocument') !== -1) {
      cb(null, Date.now() + '-' + original);
    } else {
      cb(null, file.originalname);
    }
  }
})
const uploadDoc = multer({storage : fileStorage});

//Function which upload the document in the server and insert the file detail in database.
exports.uploadDocument = function(req, res) {
  if (!requireEditorPage(req, res)) return;
  var doc_path       = req.params.menu+'/'+req.params.submenu;
  var imgsrc         = req.file.filename;
  var doc_name       = req.body.docname;
  var created_at     = new Date();
  var created_by     = 'kiran';
  var last_modified  = new Date();
  var last_accessed	 = new Date();
  var version        = req.body.docVer;
  var status         = '0'; 
  var docRelVer      = req.body.relsVer;
  var docDesc        = req.body.docDesc;
  var rlsDate        = req.body.rlsDate;
  var rlsDate        = rlsDate.split('-');
  var relsDt         = rlsDate[2]+'-'+rlsDate[1]+'-'+rlsDate[0]; //changing date format as per DB.
  var fileName       = req.file.filename;
  var menu           = req.params.menu;
  var submenu        = req.params.submenu;
  const flName       = imgsrc.split('.')[0];
  const docxChk      = imgsrc.split('.')[1];   
  if(docxChk == 'docx'){
    const extend_pdf            = '.pdf'
    const extend_docx           = '.docx'
    var __dirname               = path.resolve();
    const file                  = __dirname +"/public/pdfFiles/"+'/'+menu+'/'+submenu+'/'+flName;
    const convFile              = __dirname +"/public/pdfFiles/"+'/'+menu+'/'+submenu+'/'+'convertion'+'/'+flName;
    var initialPath             = file+extend_docx;
    var upload_path             = convFile+extend_pdf;
    
    //Method for converting docx to pdf format.
    docxConverter(initialPath,upload_path,function(err,result){
      if(err){
        console.log(err);
      }
      console.log('successfuly converted');    
      });
    }
  //var relsDt         = moment(rlsDate).format('YYYY-MM-DD');
  var insertData     = "INSERT INTO file_info(doc_name,doc_path,doc,created_at,created_by,last_modified,last_accessed,version,status,docRelVer,docDesc,releaseDt,doc_file)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)"
  dbConn.query(insertData, [doc_name,doc_path,imgsrc,created_at,created_by,last_modified,last_accessed,Version.normalize(version),status,Version.normalize(docRelVer),docDesc,relsDt,doc_name], (err, result) => {
  if(err){
    throw err
  } else{
    Version.recordInitial({
      doc_num: result.insertId,
      doc_path: doc_path,
      doc: imgsrc,
      doc_name: doc_name,
      version: version,
      docRelVer: docRelVer,
      docDesc: docDesc,
      releaseDt: relsDt,
      created_by: created_by
    }, created_by, function () {
      req.flash('message','Document Uploaded successfully');
      req.flash('file_name',doc_name);
      req.flash('latestid',result.insertId);
      res.redirect('/category?menu='+req.params.menu+'&'+'submenu'+'='+req.params.submenu);
    });
  }
 })
};

//Function for upadate and maintain file log detail in db to display in dashboard.  
exports.insertLogDet = function(req, res) {     
  var emp_id                  = req.session.username;
  var doc_name                = req.body.view_file_name;
  var doc_access_type         = req.body.file_access_type;
  var doc_id                  = req.body.doc_id;
  var logDateTime             = moment(Date()).format('YYYY-MM-DD H:m:s');
  if (!emp_id || !doc_name) {
    return res.json({ ok: false });
  }
  const fileName              = req.body.view_file_name; 
  const menu                  = req.body.menu; 
  const submenu               = req.body.submenu; 
  const flName                = fileName.split('.')[0];
  const docxChk               = fileName.split('.')[1]; 
 
  FilesList.getDataByDoc(doc_name,doc_access_type, function(err, data) {
   if (err){
     if (!res.headersSent) res.json({ ok: false });
     return;
   }
    if(!data.length > 0){       
     var insertData = "INSERT INTO doc_log_info(doc_name,doc_accessed_type,accessed_datetime,doc_id,emp_id)VALUES(?,?,?,?,?)"
     dbConn.query(insertData, [doc_name,doc_access_type,logDateTime,doc_id,emp_id], (err, result) => {
     if(err){
       console.log(err);
     }
     if (!res.headersSent) res.json({ ok: true });
     });
    }else{    
     var updateLog = "update doc_log_info set accessed_datetime='"+logDateTime+"' where doc_name='"+doc_name+"' and doc_accessed_type='"+doc_access_type+"' and doc_id='"+doc_id+"'"
     dbConn.query(updateLog,  (err, result) => {
     if(err){
       console.log(err);
     }
     if (!res.headersSent) res.json({ ok: true });
     });
    }   
   });   
 };

 //Updating announcement details in DB.
 exports.insertNotification = function(req, res) {     
   var emp_id                  = req.session.username;  
   var doc_id                  = req.body.latDocId;
   const menu                  = req.body.menu; 
   const submenu               = req.body.submenu;
   var redirectUrl             = '/category?menu='+menu+'&'+'submenu'+'='+submenu;

   function insertNotify(id) {
     var parsedId = parseInt(id, 10);
     if (!emp_id || !parsedId) {
       return res.status(400).send({ result: 'error', message: 'No document available to announce.', url: redirectUrl });
     }
     var insertNot = "INSERT INTO notification (emp_id,doc_id)VALUES(?,?)";
     dbConn.query(insertNot, [emp_id, parsedId], (err, result) => {
       if (err) {
         console.log(err);
         return res.status(500).send({ result: 'error', message: 'Unable to send announcement.', url: redirectUrl });
       }
       res.send({ result: 'redirect', url: redirectUrl });
     });
   }

   if (doc_id !== undefined && String(doc_id).trim() !== '' && !isNaN(parseInt(doc_id, 10))) {
     return insertNotify(doc_id);
   }

   var filePath = menu + '/' + submenu;
   dbConn.query(
     "SELECT doc_num FROM file_info WHERE status = 0 AND doc_path = ? ORDER BY doc_num DESC LIMIT 1",
     [filePath],
     function (err, rows) {
       if (err || !rows || !rows.length) {
         return res.status(400).send({ result: 'error', message: 'No document available to announce.', url: redirectUrl });
       }
       insertNotify(rows[0].doc_num);
     }
   );
 } 
// Uploading document logic ends here ------------------------

// Updating document logic starts here ------------------------
exports.getData = function(req, res) {  
  const id =  req.body.id;        
  FilesList.getDataById(id, function(err, data) {
    if (err){
      res.send(err);
    }else{
      console.log(data);              
      res.send(data);       
    }      
  }); 
};

exports.editDocument = function(req, res) {
  if (!requireEditorPage(req, res)) return;
  var id                 = req.body.doc_id;
  var doc_name           = req.body.docname;
  var docDesc            = req.body.docDesc;
  var rlsDate            = req.body.rlsDate || '';
  var parts              = String(rlsDate).split('-');
  var relsDt             = parts.length === 3 ? (parts[2]+'-'+parts[1]+'-'+parts[0]) : rlsDate;
  var comment            = String(req.body.changeComment || '').trim();
  var bumpType           = req.body.bumpType === 'major' ? 'major' : 'minor';
  var redirectUrl        = '/category?menu='+req.params.menu+'&submenu='+req.params.submenu;
  var actorName          = (req.session && req.session.username) ? req.session.username : 'user';
  if (!comment) {
    req.flash('succdel', 'A change comment is required for each new version.');
    return res.redirect(redirectUrl);
  }
  FilesList.getDataById(id, function(err, rows) {
    if (err || !rows || !rows[0]) {
      req.flash('succdel', 'Document was not found.');
      return res.redirect(redirectUrl);
    }
    var current = rows[0];
    var nextDoc = Version.bump(current.version, bumpType);
    var nextQms = Version.bump(current.docRelVer, bumpType);
    var liveName = req.file ? req.file.filename : current.doc;
    var sourcePath = req.file
      ? path.join(path.resolve(), 'public', 'pdfFiles', req.params.menu, req.params.submenu, req.file.filename)
      : Version.liveFilePath(current);
    Version.createSnapshot(current, {
      bump_type: bumpType,
      change_comment: comment,
      created_by: actorName,
      source_path: sourcePath,
      stored_name: liveName,
      doc_version: nextDoc,
      qms_version: nextQms,
      doc_name: doc_name,
      doc_desc: docDesc,
      release_dt: relsDt
    }, function (snapErr) {
      if (snapErr) {
        req.flash('succdel', snapErr.message || 'Unable to save version history.');
        return res.redirect(redirectUrl);
      }
      Version.updateCurrentFile(id, {
        doc: liveName,
        doc_name: doc_name,
        docRelVer: nextQms,
        docDesc: docDesc,
        version: nextDoc,
        releaseDt: relsDt
      }, function (updErr) {
        if (updErr) {
          req.flash('succdel', 'Version saved but the current file record was not updated.');
          return res.redirect(redirectUrl);
        }
        req.flash('succupd', 'Document updated to v' + nextDoc + '.');
        req.flash('file_name', doc_name);
        req.flash('latestid', id);
        res.redirect(redirectUrl);
      });
    });
  });
};
// Updating document logic ends here --------------------------------------------------------------
// Deleting document logic starts here ------------------------------------------------------------
// Logic for deleting the files is commented temproraly.
exports.deleteDocument = function(req, res) {
  if (!requireEditorPage(req, res)) return;
  //var doc_id        = req.params.doc_id;
  var doc_id          = req.query.doc_num;
  var __dirname       = path.resolve();    
  var updateData      = "update file_info set status = 1 where doc_num = ?"     
  dbConn.query(updateData, [doc_id],(err, result) => {
  if (err) throw err       
    req.flash('succdel','Document Deleted successfully');    
    return res.send({result: 'redirect', url:'/category?menu='+req.query.menu+'&'+'submenu'+'='+req.query.submenu})  
    //res.redirect('/category?menu='+req.query.menu+'&'+'submenu'+'='+req.query.submenu);
    //res.redirect('/category?menu='+req.params.menu+'&'+'submenu'+'='+req.params.submenu);
  })
  // const directoryPath = __dirname +"/public/pdfFiles/"+req.session.menu+'/'+req.session.submenu+'/'+doc_name;  
  // fs.unlink(directoryPath, err => {
  //   if (err) {
  //     throw err
  //   }else{      
  //     var updateData = "update file_info set status = 1 where doc_name= doc_name"     
  //     dbConn.query(updateData, (err, result) => {
  //     if (err) throw err 
  //       req.flash('succdel','Document Deleted successfully');         
  //       res.redirect('/category');
  //     })
  //   }      
  // })         
};
// Deleting document logic ends here ------------------------


exports.charterAdmin = function(req, res) {  
  res.render('charterAdmin', {
    title  : 'Charter Admin',
    success: false
    });         
};

//About us page.
exports.about = function(req, res) {
  if(req.session.username == null){    
    res.redirect('/'); //if user is not logged-in redirect back to login page //
  }  
  setTimeout(function() { 
  res.render('about', {
    title  : 'About Page',
    success: false
    });  
  }, 500);       
};

//Contact us page.
exports.contact = function(req, res) {  
  if(req.session.username == null){    
    res.redirect('/'); //if user is not logged-in redirect back to login page //
  }
  setTimeout(function() { 
  res.render('contact', {
    title  : 'Contact Page',
    success: false
    }); 
  }, 500);          
};

var PROFILE_DEPARTMENTS = ['Admin', 'Bd', 'Flow', 'Global', 'Hr', 'It', 'Purchase', 'Qag', 'VLSI'];

function renderProfile(req, res, user, extra) {
  var opts = extra || {};
  res.render('userProfile', {
    title: 'User Profile',
    user: user || {},
    departments: PROFILE_DEPARTMENTS,
    error: opts.error || '',
    notice: opts.notice || ''
  });
}

//User Profile page.
exports.userProfile = function (req, res) {
  if (req.session.username == null) {
    return res.redirect('/');
  }
  FilesList.userDetById(req.session.username, function (err, result) {
    var user = !err && result && result[0] ? result[0] : null;
    if (!user) return res.redirect('/');
    var flashed = req.flash('profileNotice');
    renderProfile(req, res, user, { notice: flashed && flashed[0] ? flashed[0] : '' });
  });
};

exports.updateUserProfile = function (req, res) {
  if (req.session.username == null) {
    return res.redirect('/');
  }
  var currentEmail = String(req.session.username);
  FilesList.userDetById(currentEmail, function (err, result) {
    var user = !err && result && result[0] ? result[0] : null;
    if (!user) return res.redirect('/');
    var username = String(req.body.username || '').trim();
    var email = String(req.body.email || '').trim();
    var department = String(req.body.department || '').trim();
    var draft = {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: username,
      emp_email: email,
      department: department
    };
    function fail(message) {
      renderProfile(req, res, draft, { error: message });
    }
    if (!username || username.length > 20) {
      return fail('Username is required and must be 20 characters or fewer.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 155) {
      return fail('Enter a valid email address.');
    }
    var currentDept = String(user.department || '').trim();
    if (!department || (PROFILE_DEPARTMENTS.indexOf(department) === -1 && department !== currentDept)) {
      return fail('Choose a department.');
    }
    dbConn.query(
      "SELECT username, emp_email FROM login WHERE user_id <> ? AND (LOWER(emp_email) = LOWER(?) OR username = ?) LIMIT 1",
      [user.user_id, email, username],
      function (qErr, rows) {
        if (qErr) return fail('Unable to update the profile.');
        if (rows && rows[0]) {
          if (String(rows[0].username) === username) return fail('That username is already in use.');
          return fail('That email address is already in use.');
        }
        dbConn.query(
          "UPDATE login SET username = ?, emp_email = ?, department = ? WHERE user_id = ? AND (emp_email = ? OR username = ?)",
          [username, email, department, user.user_id, currentEmail, currentEmail],
          function (uErr, updated) {
            if (uErr || !updated || !updated.affectedRows) return fail('Unable to update the profile.');
            req.session.username = email;
            req.flash('profileNotice', 'Profile updated.');
            res.redirect('/userProfile');
          }
        );
      }
    );
  });
};

//Password change page.
exports.paswdChange = function(req, res) {  
  if(req.session.username == null){    
    res.redirect('/'); //if user is not logged-in redirect back to login page //
  }
  setTimeout(function() { 
  res.render('pswdChange', {
    title   : 'Password Change',
    username: req.session.username,
    succupd :  req.flash('succupd'),
    success : false
    }); 
    }, 500);             
};


//Import user page.
exports.importUser = function(req, res) {  
  if(req.session.username == null){    
    res.redirect('/'); //if user is not logged-in redirect back to login page //
  }
  if (!requireAdminPage(req, res)) return;
  setTimeout(function() {
  res.render('importUser', {
  title  : 'User Import Page',
  successMsg: req.flash('success'),
  success: false
  }); 
  }, 500);           
};

//Add user page.
exports.addUser = function(req, res) {  
  if(req.session.username == null){    
    res.redirect('/'); //if user is not logged-in redirect back to login page //
  }
  var firstname            = req.body.firstname;
  var lastname             = req.body.lastname;
  var username             = req.body.username;
  var email                = req.body.email;
  var department           = req.body.department;
  var manager              = req.body.manager;  

  var insertUser = "insert into login (first_name,last_name,username,emp_email,pswd,reporting_manager) values(?,?,?,?,?,?)"
  dbConn.query(insertUser, [firstname,lastname,username,email,'alpha2016',department,manager], (err, result) => {
  if(err){
    throw err
  }else{
    req.flash('success','User added successfully');         
    res.redirect('/importUser'); 
  }
  });           
};

exports.importUserDb = function(req, res) {  
  if(req.session.username == null){    
    res.redirect('/'); //if user is not logged-in redirect back to login page //
  }
  if (!requireAdminPage(req, res)) return;
  var __dirname               = path.resolve();
  const file                  = __dirname +"/public/importUsrDb/"+req.file.filename;
  readXlsxFile(file).then((rows) => {
    rows.shift();    
    for (var k = 0; k < rows.length; k++) {
      rows[k].push("alpha2016");
    }
    var insertUser = "insert into login (first_name,last_name,username,emp_email,reporting_manager,pswd) values ?"
    dbConn.query(insertUser, [rows], (err, result) => {
    if(err){
      throw err
    }else{
      req.flash('success','User added successfully');         
      res.redirect('/importUser'); 
    }
    });    
  });            
};

exports.downloadTmplt = function(req,res){
  var __dirname = path.resolve();
  const file    = __dirname +"/public/ImportUserTemplate.xlsx";
  var mimetype  = mime.lookup(file);
  res.setHeader('Content-disposition', 'attachment; filename=ImportUserTemplate.xlsx');
  res.setHeader('Content-type', mimetype);
  var filestream = fs.createReadStream(file);
  filestream.pipe(res); 
}
exports.changePassword = function(req, res) {  
  var pass       = req.body.paswd;
  var email      = req.body.email_id;  
  var updateData = "update login set pswd='"+pass+"' where emp_email='"+email+"'";
  dbConn.query(updateData, (err,result) => {
    if(err){
      console.log(err);
    }else{
      req.flash('succupd','Password Updated successfully');         
      res.redirect('/paswdChange'); 
    }    
  });           
};
exports.releaseNote = function(req,res){ 
  var __dirname = path.resolve();
  const file = __dirname +"/public/pdfFiles/QMS_Release_note.docx";
  var mimetype = mime.lookup(file);
  res.setHeader('Content-disposition','attachment;filename=QMS_Release_note.docx');
  res.setHeader('Content-type', mimetype);
  var filestream = fs.createReadStream(file);
  filestream.pipe(res); 
}
function resolveStoredFile(menu, submenu, docname) {
  var baseDir = path.join(path.resolve(), 'public', 'pdfFiles');
  var name = path.basename(String(docname || ''));
  if (!name) return null;
  var parts = submenu && submenu !== '_'
    ? [String(menu || ''), String(submenu), name]
    : [String(menu || ''), name];
  var filePath = path.resolve.apply(path, [baseDir].concat(parts));
  if (filePath.indexOf(baseDir + path.sep) !== 0) return null;
  return filePath;
}

function gateStoredFile(req, res, menu, submenu, docname, minRole, next) {
  if (!req.session || !req.session.username) {
    return res.status(401).json({ success: false, message: 'Please login to open this file.' });
  }
  Access.userContext(req, function (cErr, ctx) {
    Folder.getFileByStored(menu, submenu, docname, function (err, doc) {
      if (err) return res.status(500).json({ success: false, message: 'Unable to open this file.' });
      if (!doc) return next();
      Folder.bestDocAccess(doc.doc_num, ctx, function (aErr, access) {
        if (aErr) return res.status(500).json({ success: false, message: 'Unable to resolve permissions.' });
        if (!access.canView || (minRole && (Folder.roleRank[access.role] || 0) < (Folder.roleRank[minRole] || 0))) {
          return res.status(403).json({ success: false, message: 'You do not have permission to open this file.' });
        }
        next();
      });
    });
  });
}

exports.downloadDoc = function(req,res){
  const docname = req.params.doc_name;
  gateStoredFile(req, res, req.params.menu, req.params.submenu, docname, 'viewer', function () {
    var file = resolveStoredFile(req.params.menu, req.params.submenu, docname);
    if (!file) return res.status(404).end();
    var mimetype  = mime.lookup(file);
    res.setHeader('Content-disposition', 'attachment; filename=' + docname);
    res.setHeader('Content-type', mimetype);
    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
  });
}

function previewFilePath(menu, submenu, docname) {
  return resolveStoredFile(menu, submenu, docname);
}

exports.previewDocument = function(req, res) {
  gateStoredFile(req, res, req.params.menu, req.params.submenu, req.params.doc_name, 'viewer', function () {
  var filePath = previewFilePath(req.params.menu, req.params.submenu, req.params.doc_name);
  if (!filePath) {
    return res.status(400).json({ error: 'Invalid file path.' });
  }
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found.' });
  }
  var ext = path.extname(filePath).toLowerCase();
  var fileName = path.basename(filePath);
  var mimeTypes = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.ppt': 'application/vnd.ms-powerpoint'
  };
  res.setHeader('Content-Type', mimeTypes[ext] || mime.lookup(filePath) || 'application/octet-stream');
  res.setHeader('Content-Disposition', 'inline; filename="' + fileName.replace(/"/g, '') + '"');
  res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
  return fs.createReadStream(filePath).pipe(res);
  });
};

module.exports.uploadDoc = uploadDoc;


