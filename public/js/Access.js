(function () {
    var state = { folderId: null, data: null };

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function $(id) {
        return document.getElementById(id);
    }

    function json(url, method, payload) {
        return fetch(url, {
            method: method || 'GET',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: payload ? JSON.stringify(payload) : undefined
        }).then(function (res) {
            return res.json().then(function (data) { return { ok: res.ok, data: data }; });
        }).then(function (result) {
            if (!result.ok || result.data.success === false) {
                throw new Error((result.data && result.data.message) || 'Request failed.');
            }
            return result.data;
        });
    }

    function showMsg(text, ok) {
        var el = $('qmsAccessMsg');
        if (!el) return;
        el.hidden = !text;
        el.className = 'qms-access-msg' + (ok ? ' is-ok' : ' is-err');
        el.textContent = text || '';
    }

    function closePanel() {
        var modal = $('qmsAccessModal');
        if (modal) modal.hidden = true;
    }

    function render(data) {
        state.data = data;
        var locked = $('qmsAccessLocked');
        var body = $('qmsAccessBody');
        $('qmsAccessTitle').textContent = (data.folder && data.folder.folder_name) || 'Folder access';
        if (data.locked) {
            locked.hidden = false;
            body.hidden = true;
            return;
        }
        locked.hidden = true;
        body.hidden = false;
        var folder = data.folder || {};
        var caps = data.capabilities || {};
        $('qmsAccessMeta').innerHTML =
            '<span>Owner: ' + esc(folder.owner) + '</span>' +
            '<span>Your role: ' + esc((data.access && data.access.role) || 'none') + '</span>';

        var rows = (data.permissions || []).concat(
            (data.effective || []).filter(function (row) { return row.source === 'owner'; })
        );
        var seen = {};
        var people = [];
        rows.forEach(function (row) {
            var email = row.user_email || row.principal;
            if (!email || seen[email]) return;
            seen[email] = true;
            people.push({
                email: email,
                role: row.access_role || row.role,
                id: row.perm_id || row.id,
                source: row.source || 'permission'
            });
        });
        if (!people.length && folder.owner) {
            people.push({ email: folder.owner, role: 'owner', source: 'owner' });
        }
        $('qmsAccessRows').innerHTML = people.length ? people.map(function (row) {
            var revoke = caps.canManage && row.id && row.email !== folder.owner
                ? '<button type="button" data-revoke-perm="' + row.id + '">Revoke</button>'
                : '';
            return '<tr><td>' + esc(row.email) + '</td><td>' + esc(row.role) + '</td><td>' + revoke + '</td></tr>';
        }).join('') : '<tr><td colspan="3">No users granted yet.</td></tr>';

        var opts = '<option value="">Select user</option>';
        (data.users || []).forEach(function (u) {
            opts += '<option value="' + esc(u.emp_email) + '">' + esc(u.emp_email) + '</option>';
        });
        $('qmsAccessUser').innerHTML = opts;
        var grant = $('qmsAccessGrantUser');
        if (grant) grant.style.display = caps.canManage ? '' : 'none';
        var invite = $('qmsAccessInvite');
        if (invite) invite.style.display = (data.canInvite || caps.canShare) ? '' : 'none';
    }

    function load(folderId) {
        state.folderId = folderId;
        json('/folders/' + folderId + '/access').then(function (data) {
            showMsg('', true);
            render(data);
            $('qmsAccessModal').hidden = false;
        }).catch(function (err) {
            showMsg(err.message || 'Unable to load access.', false);
            $('qmsAccessModal').hidden = false;
        });
    }

    function reload() {
        if (state.folderId) load(state.folderId);
    }

    window.qmsOpenAccessPanel = function (folderId) {
        if (!folderId) return;
        load(folderId);
    };

    window.qmsRequestFolderAccess = function (folderId) {
        if (!folderId) return;
        json('/folders/' + folderId + '/access-requests', 'POST', { requested_role: 'viewer' })
            .then(function (data) { alert(data.message || 'Request sent.'); })
            .catch(function (err) { alert(err.message || 'Unable to request access.'); });
    };

    function bind() {
        if (!$('qmsAccessModal')) return;
        $('qmsAccessClose').addEventListener('click', closePanel);
        $('qmsAccessModal').addEventListener('click', function (e) {
            if (e.target.id === 'qmsAccessModal') closePanel();
        });
        $('qmsAccessRequestBtn').addEventListener('click', function () {
            json('/folders/' + state.folderId + '/access-requests', 'POST', {
                requested_role: $('qmsAccessReqRole').value,
                message: $('qmsAccessReqMsg').value
            }).then(function (data) {
                showMsg(data.message, true);
            }).catch(function (err) { showMsg(err.message, false); });
        });
        var inviteBtn = $('qmsAccessInviteBtn');
        if (inviteBtn) {
            inviteBtn.addEventListener('click', function () {
                var folder = state.data && state.data.folder;
                closePanel();
                if (window.qmsOpenInvite) {
                    window.qmsOpenInvite(state.folderId, folder && folder.folder_name);
                    return;
                }
                showMsg('Open Document Library to invite a member.', false);
            });
        }
        $('qmsAccessGrantUserBtn').addEventListener('click', function () {
            json('/folders/' + state.folderId + '/permissions', 'POST', {
                user_email: $('qmsAccessUser').value,
                access_role: $('qmsAccessUserRole').value
            }).then(function (data) { showMsg(data.message, true); reload(); })
                .catch(function (err) { showMsg(err.message, false); });
        });
        $('qmsAccessBody').addEventListener('click', function (e) {
            var btn = e.target.closest('button');
            if (!btn) return;
            var perm = btn.getAttribute('data-revoke-perm');
            if (!perm) return;
            json('/folders/' + state.folderId + '/permissions/' + perm + '/revoke', 'POST', {})
                .then(function (data) { showMsg(data.message, true); reload(); })
                .catch(function (err) { showMsg(err.message, false); });
        });
    }

    function bindAlerts() {
        var btn = $('qmsAlertBtn');
        var menu = $('qmsAlertMenu');
        if (!btn || !menu) return;
        function renderAlerts(data) {
            var rows = data.alerts || [];
            var html = rows.length ? rows.map(function (row) {
                return '<a class="qms-alert-item' + (row.is_read ? '' : ' is-unread') + '" href="' + esc(row.href || '/library') + '" data-alert="' + row.alert_id + '">' +
                    '<strong>' + esc(row.title) + '</strong><span>' + esc(row.body) + '</span></a>';
            }).join('') : '<p class="qms-alert-empty">No notifications.</p>';
            html += '<button type="button" class="qms-alert-readall" id="qmsAlertReadAll">Mark all read</button>';
            menu.innerHTML = html;
            var dot = btn.querySelector('.qms-dot');
            if (dot) dot.hidden = !(data.unread > 0);
        }
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var open = menu.hidden;
            menu.hidden = !open;
            if (open) {
                json('/access/alerts').then(renderAlerts).catch(function () {
                    menu.innerHTML = '<p class="qms-alert-empty">Unable to load notifications.</p>';
                });
            }
        });
        menu.addEventListener('click', function (e) {
            var all = e.target.closest('#qmsAlertReadAll');
            if (all) {
                e.preventDefault();
                json('/access/alerts/all/read', 'POST', {}).then(function () {
                    menu.hidden = true;
                    var dot = btn.querySelector('.qms-dot');
                    if (dot) dot.hidden = true;
                });
                return;
            }
            var item = e.target.closest('[data-alert]');
            if (item) json('/access/alerts/' + item.getAttribute('data-alert') + '/read', 'POST', {});
        });
        document.addEventListener('click', function (e) {
            if (!menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) menu.hidden = true;
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        bind();
        bindAlerts();
    });
})();
