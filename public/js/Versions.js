(function () {
    var panel = document.getElementById('qmsVerPanel');
    if (!panel) return;

    var listEl = document.getElementById('qmsVerList');
    var fileEl = document.getElementById('qmsVerFile');
    var restoreBox = document.getElementById('qmsVerRestore');
    var msgEl = document.getElementById('qmsVerMsg');
    var commentEl = document.getElementById('qmsVerRestoreComment');
    var pendingRestore = null;
    var currentDocId = '';

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function closePanel() {
        panel.hidden = true;
        restoreBox.hidden = true;
        pendingRestore = null;
        commentEl.value = '';
        msgEl.hidden = true;
    }

    function showMsg(text) {
        msgEl.textContent = text;
        msgEl.hidden = !text;
    }

    function openPreview(row) {
        if (!window.jQuery) return;
        var trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'viewFile';
        trigger.setAttribute('data-file_name', row.stored_file || row.doc_name || 'document');
        trigger.setAttribute('data-preview_url', row.preview_url || '');
        trigger.setAttribute('data-download_url', row.download_url || '');
        trigger.setAttribute('data-file_url', row.file_url || '');
        trigger.hidden = true;
        document.body.appendChild(trigger);
        window.jQuery(trigger).trigger('click');
        trigger.remove();
    }

    function render(data) {
        fileEl.textContent = data.name || '';
        var rows = data.versions || [];
        if (!rows.length) {
            listEl.innerHTML = '<p>No version history yet.</p>';
            return;
        }
        listEl.innerHTML = rows.map(function (row) {
            var title = 'v' + esc(row.doc_version) + (row.is_current ? ' · current' : '');
            var when = row.created_at ? String(row.created_at).replace('T', ' ').slice(0, 16) : '';
            var bump = row.bump_type ? String(row.bump_type) : '';
            return '<article class="qms-ver-item' + (row.is_current ? ' is-current' : '') + '">' +
                '<div class="qms-ver-meta">' +
                    '<strong>' + title + '</strong>' +
                    '<p>QMS ' + esc(row.qms_version) + ' · ' + esc(bump) + (when ? ' · ' + esc(when) : '') +
                    (row.created_by ? ' · ' + esc(row.created_by) : '') + '</p>' +
                '</div>' +
                '<p class="qms-ver-comment">' + esc(row.change_comment || '') + '</p>' +
            '</article>';
        }).join('');
        listEl._rows = rows;
    }

    function loadHistory(docId, name) {
        currentDocId = String(docId);
        fileEl.textContent = name || '';
        listEl.innerHTML = 'Loading history…';
        restoreBox.hidden = true;
        panel.hidden = false;
        fetch('/versions/' + encodeURIComponent(docId), {
            headers: { 'Accept': 'application/json' },
            credentials: 'same-origin'
        }).then(function (res) { return res.json(); })
            .then(function (data) {
                if (!data.success) throw new Error(data.message || 'Unable to load history.');
                render(data);
            })
            .catch(function (err) {
                listEl.innerHTML = '<p>' + esc(err.message || 'Unable to load history.') + '</p>';
            });
    }

    window.qmsOpenVersionHistory = loadHistory;

    document.addEventListener('click', function (e) {
        var historyBtn = e.target.closest('.qms-ver-history, [data-action="history"]');
        if (historyBtn && historyBtn.getAttribute('data-doc-id')) {
            e.preventDefault();
            e.stopPropagation();
            loadHistory(historyBtn.getAttribute('data-doc-id'), historyBtn.getAttribute('data-doc-name') || '');
            return;
        }
        if (e.target.closest('#qmsVerClose') || e.target === panel) {
            closePanel();
            return;
        }
        if (!panel.hidden && e.target.closest('#qmsVerRestoreCancel')) {
            restoreBox.hidden = true;
            pendingRestore = null;
            return;
        }
        var viewBtn = e.target.closest('.qms-ver-view');
        if (viewBtn && listEl._rows) {
            var viewId = Number(viewBtn.getAttribute('data-view'));
            var viewRow = listEl._rows.filter(function (row) { return Number(row.version_id) === viewId; })[0];
            if (viewRow) openPreview(viewRow);
            return;
        }
        var restoreBtn = e.target.closest('.qms-ver-restore[data-restore]');
        if (restoreBtn) {
            pendingRestore = restoreBtn.getAttribute('data-restore');
            commentEl.value = '';
            showMsg('');
            restoreBox.hidden = false;
            commentEl.focus();
            return;
        }
        if (e.target.closest('#qmsVerRestoreGo')) {
            if (!pendingRestore || !currentDocId) return;
            var comment = commentEl.value.trim();
            if (!comment) {
                showMsg('A change comment is required.');
                return;
            }
            var bump = (document.querySelector('input[name="qmsVerRestoreBump"]:checked') || {}).value || 'minor';
            var goBtn = document.getElementById('qmsVerRestoreGo');
            goBtn.disabled = true;
            fetch('/versions/' + encodeURIComponent(currentDocId) + '/' + encodeURIComponent(pendingRestore) + '/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ changeComment: comment, bumpType: bump })
            }).then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
                .then(function (result) {
                    goBtn.disabled = false;
                    if (!result.ok || !result.data.success) {
                        throw new Error((result.data && result.data.message) || 'Unable to restore.');
                    }
                    window.location.reload();
                })
                .catch(function (err) {
                    goBtn.disabled = false;
                    showMsg(err.message || 'Unable to restore.');
                });
        }
    });

    document.addEventListener('keydown', function (e) {
        if ((e.key === 'Escape' || e.keyCode === 27) && !panel.hidden) closePanel();
    });
})();
