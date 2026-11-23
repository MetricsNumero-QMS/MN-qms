const express = require('express');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const bodyParser = require('body-parser');
var path = require('path');
const moment = require('moment');
const flash = require('connect-flash');
// create express app
const app = express();
const port = process.env.PORT || 5000;

// Required when nginx terminates HTTPS and proxies to this app
app.set('trust proxy', 1);

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/css',express.static(__dirname +'/css'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session({
secret:'secret',
proxy: true,
cookie:{
  maxAge : 30 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax',
  secure: 'auto'
},
saveUninitialized : true,
resave : false
}));
app.use(flash());
app.use(cookieParser());
app.use(bodyParser.json())
function prettyDisplayName(value) {
  var raw = String(value || '').trim();
  if (!raw) return 'User';
  var token = raw.split('@')[0].split(/[.\s_]+/)[0];
  return token.charAt(0).toUpperCase() + token.slice(1);
}
const Access = require('./src/models/access.model');
const Role = require('./src/models/role.model');
Role.ensure(function (err) {
  if (err) console.log('Unable to initialize user roles.');
});
app.use(function (req, res, next) {
  res.locals.navPath = req.path || '';
  res.locals.navMenu = req.query.menu || '';
  res.locals.navSubmenu = req.query.submenu || '';
  res.locals.navQuery = req.query || {};
  res.locals.notificationCount = 0;
  var sysRole = Role.fromRequest(req);
  var caps = Role.caps(sysRole);
  res.locals.sysRole = sysRole;
  res.locals.roleLabel = Role.label(sysRole);
  res.locals.roleCaps = caps;
  if (req.session && req.session.username) {
    res.locals.username = req.session.username;
    res.locals.displayName = prettyDisplayName(req.session.firstName || req.session.username);
    res.locals.userrole = caps.isAdmin ? 1 : 0;
  } else {
    res.locals.username = '';
    res.locals.displayName = '';
    res.locals.userrole = 0;
    res.locals.sysRole = '';
    res.locals.roleLabel = '';
    res.locals.roleCaps = Role.caps('viewer');
  }
  if (!res.locals.navActive) {
    var filter = req.query && req.query.filter;
    if (req.path === '/home') res.locals.navActive = 'dashboard';
    else if (req.path === '/library') res.locals.navActive = filter || 'library';
    else if (req.path === '/category') res.locals.navActive = 'library';
    else if (req.path === '/userProfile' || req.path === '/paswdChange' || req.path === '/importUser') res.locals.navActive = 'profile';
    else res.locals.navActive = '';
  }
  if (!req.session || !req.session.username) return next();
  Access.userContext(req, function (err, ctx) {
    if (err || !ctx) return next();
    Access.unreadCount(ctx, function (cErr, n) {
      res.locals.notificationCount = n || 0;
      next();
    });
  });
});
// define a root route
const webRoutes = require('./src/routes/web.routes');
app.use('/', webRoutes);
module.exports = app;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});