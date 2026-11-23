var MAIL = require('../../config/mail.config');

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, function (ch) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
  });
}

function fileShareHtml(opts) {
  var fileName = escapeHtml(opts.fileName || 'Shared document');
  var sender = escapeHtml(opts.sender || 'A QMS user');
  var link = escapeHtml(opts.link || '#');
  var note = opts.expiresLabel
    ? 'This link stays available until <strong>' + escapeHtml(opts.expiresLabel) + '</strong>.'
    : 'Open the link while signed in to go straight to the file. If you are not signed in, you will be asked to log in first.';
  return (
    '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#1b2433;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6fb;padding:28px 12px;">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(18,54,140,0.08);">' +
    '<tr><td style="background:linear-gradient(90deg,#07144a 0%,#0b2270 52%,#12368c 100%);padding:22px 28px;">' +
    '<div style="color:#ffffff;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.85;">MN-QMS</div>' +
    '<div style="color:#ffffff;font-size:22px;font-weight:700;margin-top:6px;">A document was shared with you</div>' +
    '</td></tr>' +
    '<tr><td style="padding:28px;">' +
    '<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hello,</p>' +
    '<p style="margin:0 0 18px;font-size:15px;line-height:1.6;"><strong>' + sender + '</strong> shared a file from the MN-QMS Document Library.</p>' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f9fd;border:1px solid #d9e2f5;border-radius:12px;margin:0 0 22px;">' +
    '<tr><td style="padding:16px 18px;">' +
    '<div style="font-size:12px;color:#5b6b86;text-transform:uppercase;letter-spacing:0.08em;">Document</div>' +
    '<div style="font-size:16px;font-weight:700;color:#12368c;margin-top:6px;">' + fileName + '</div>' +
    '</td></tr></table>' +
    '<p style="margin:0 0 22px;font-size:14px;line-height:1.6;color:#445066;">' + note + '</p>' +
    '<p style="margin:0 0 8px;" align="center">' +
    '<a href="' + link + '" style="display:inline-block;background:#12368c;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px;">Open document</a>' +
    '</p>' +
    '<p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:#6b7a90;word-break:break-all;">If the button does not work, copy this link:<br>' + link + '</p>' +
    '</td></tr>' +
    '<tr><td style="padding:16px 28px 22px;background:#f8fafc;color:#6b7a90;font-size:12px;">This message was sent by MN-QMS. Do not share the link if the document is confidential.</td></tr>' +
    '</table></td></tr></table></body></html>'
  );
}

function inviteMemberHtml(opts) {
  var folderName = escapeHtml(opts.folderName || 'a folder');
  var sender = escapeHtml(opts.sender || 'A QMS user');
  var role = escapeHtml(opts.roleLabel || 'Viewer');
  var link = escapeHtml(opts.link || '#');
  var note = opts.expiresLabel
    ? 'This invite stays available until <strong>' + escapeHtml(opts.expiresLabel) + '</strong>.'
    : 'Open the link while signed in to join the folder. If you are not signed in, you will be asked to log in first.';
  return (
    '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#1b2433;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6fb;padding:28px 12px;">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(18,54,140,0.08);">' +
    '<tr><td style="background:linear-gradient(90deg,#07144a 0%,#0b2270 52%,#12368c 100%);padding:22px 28px;">' +
    '<div style="color:#ffffff;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.85;">MN-QMS</div>' +
    '<div style="color:#ffffff;font-size:22px;font-weight:700;margin-top:6px;">You are invited to a folder</div>' +
    '</td></tr>' +
    '<tr><td style="padding:28px;">' +
    '<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hello,</p>' +
    '<p style="margin:0 0 18px;font-size:15px;line-height:1.6;"><strong>' + sender + '</strong> invited you to a folder in the MN-QMS Document Library.</p>' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f9fd;border:1px solid #d9e2f5;border-radius:12px;margin:0 0 22px;">' +
    '<tr><td style="padding:16px 18px;">' +
    '<div style="font-size:12px;color:#5b6b86;text-transform:uppercase;letter-spacing:0.08em;">Folder</div>' +
    '<div style="font-size:16px;font-weight:700;color:#12368c;margin-top:6px;">' + folderName + '</div>' +
    '<div style="font-size:13px;color:#445066;margin-top:8px;">Role: ' + role +
      (opts.department ? ' · ' + escapeHtml(opts.department) : '') +
      ' · ' + escapeHtml(opts.visibility === 'public' ? 'Public' : 'Private') + '</div>' +
    '</td></tr></table>' +
    '<p style="margin:0 0 22px;font-size:14px;line-height:1.6;color:#445066;">' + note + '</p>' +
    '<p style="margin:0 0 8px;" align="center">' +
    '<a href="' + link + '" style="display:inline-block;background:#12368c;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px;">Join folder</a>' +
    '</p>' +
    '<p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:#6b7a90;word-break:break-all;">If the button does not work, copy this link:<br>' + link + '</p>' +
    '</td></tr>' +
    '<tr><td style="padding:16px 28px 22px;background:#f8fafc;color:#6b7a90;font-size:12px;">This message was sent by MN-QMS. Use the invited email address when you sign in.</td></tr>' +
    '</table></td></tr></table></body></html>'
  );
}

function passwordResetHtml(opts) {
  var link = escapeHtml(opts.link || '#');
  return (
    '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#1b2433;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6fb;padding:28px 12px;">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(18,54,140,0.08);">' +
    '<tr><td style="background:linear-gradient(90deg,#07144a 0%,#0b2270 52%,#12368c 100%);padding:22px 28px;">' +
    '<div style="color:#ffffff;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.85;">MN-QMS</div>' +
    '<div style="color:#ffffff;font-size:22px;font-weight:700;margin-top:6px;">Reset your password</div>' +
    '</td></tr>' +
    '<tr><td style="padding:28px;">' +
    '<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hello,</p>' +
    '<p style="margin:0 0 18px;font-size:15px;line-height:1.6;">A password reset was requested for your MN-QMS account. This link expires in 60 minutes and can be used once.</p>' +
    '<p style="margin:0 0 8px;" align="center">' +
    '<a href="' + link + '" style="display:inline-block;background:#12368c;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px;">Reset password</a>' +
    '</p>' +
    '<p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:#6b7a90;word-break:break-all;">If the button does not work, copy this link:<br>' + link + '</p>' +
    '</td></tr>' +
    '<tr><td style="padding:16px 28px 22px;background:#f8fafc;color:#6b7a90;font-size:12px;">If you did not ask for this, you can ignore the message. Your password will stay the same.</td></tr>' +
    '</table></td></tr></table></body></html>'
  );
}

function sendMail(opts, cb) {
  var apiKey = MAIL.apiKey || '';
  var fromEmail = MAIL.fromEmail || '';
  var fromName = MAIL.fromName || 'MN-QMS';
  if (!apiKey || !fromEmail) {
    return cb(new Error('Mail is not configured on the server.'));
  }
  var to = String(opts.to || '').trim();
  if (!to) return cb(new Error('Recipient email is required.'));
  var payload = {
    from: fromName + ' <' + fromEmail + '>',
    to: [to],
    subject: opts.subject || 'A document was shared with you',
    html: opts.html || ''
  };
  if (typeof fetch !== 'function') {
    return cb(new Error('This server cannot send email.'));
  }
  fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  }).then(function (res) {
    return res.text().then(function (text) {
      var data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { message: text }; }
      if (!res.ok) {
        return cb(new Error(data.message || data.error || 'Unable to send the email.'));
      }
      cb(null, data);
    });
  }).catch(function (err) {
    cb(err || new Error('Unable to send the email.'));
  });
}

module.exports = {
  sendMail: sendMail,
  fileShareHtml: fileShareHtml,
  inviteMemberHtml: inviteMemberHtml,
  passwordResetHtml: passwordResetHtml,
  escapeHtml: escapeHtml
};
