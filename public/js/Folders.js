(function ($) {
    var state = {
        menu: '',
        submenu: '',
        username: '',
        userrole: 0,
        folders: [],
        allFolders: [],
        selectedId: null,
        detail: null,
        users: [],
        categoryDocs: [],
        searchTimer: null,
        lastQuery: '',
        loadSeq: 0
    };

    function cfg() {
        var el = document.getElementById('folderAppConfig');
        if (!el) return;
        state.menu = el.getAttribute('data-menu') || '';
        state.submenu = el.getAttribute('data-submenu') || '';
        state.username = el.getAttribute('data-username') || '';
        state.userrole = Number(el.getAttribute('data-userrole') || 0);
    }

    function api(url, method, data) {
        return $.ajax({
            url: url,
            method: method || 'GET',
            data: data || {},
            dataType: 'JSON'
        });
    }

    function showMsg(text, ok) {
        var $msg = $('#folderWorkspaceMsg');
        $msg.removeClass('is-ok is-err').addClass(ok ? 'is-ok' : 'is-err').text(text);
        setTimeout(function () { $msg.removeClass('is-ok is-err').text(''); }, 3500);
    }

    function fmtDate(value) {
        if (!value) return '';
        return moment(value).isValid() ? moment(value).format('DD-MMM-YYYY') : '';
    }

    function fmtDateTime(value) {
        if (!value) return '';
        return moment(value).isValid() ? moment(value).format('DD-MMM-YYYY HH:mm') : '';
    }

    function inputDate(value) {
        if (!value) return '';
        return moment(value).isValid() ? moment(value).format('YYYY-MM-DD') : '';
    }

    function badge(kind, value) {
        return '<span class="folder-badge ' + value + '">' + kind + ': ' + String(value).replace(/_/g, ' ') + '</span>';
    }

    function openWorkspace() {
        $('#folderOverlay, #folderWorkspace').addClass('is-open');
        $('#folderWorkspace').attr('aria-hidden', 'false');
        $('#openFolderWorkspace').addClass('is-open');
        loadFolders();
        loadUsers();
        loadCategoryDocs();
    }

    function closeWorkspace() {
        $('#folderOverlay, #folderWorkspace').removeClass('is-open');
        $('#folderWorkspace').attr('aria-hidden', 'true');
        $('#openFolderWorkspace').removeClass('is-open');
    }

    function loadFolders(query) {
        state.lastQuery = query || '';
        var seq = ++state.loadSeq;
        return api('/folders', 'GET', { menu: state.menu, submenu: state.submenu, q: query || '' }).done(function (res) {
            if (seq !== state.loadSeq) return;
            state.folders = res.folders || [];
            if (!state.lastQuery) state.allFolders = state.folders.slice();
            renderTree();
            fillParentSelects();
            if (state.selectedId) {
                var still = state.folders.some(function (f) { return Number(f.folder_id) === Number(state.selectedId); });
                if (still) loadDetail(state.selectedId);
                else {
                    state.selectedId = null;
                    state.detail = null;
                    renderPlaceholder();
                }
            } else {
                renderPlaceholder();
            }
        }).fail(function (xhr) {
            if (seq !== state.loadSeq) return;
            showMsg((xhr.responseJSON && xhr.responseJSON.message) || 'Unable to load folders.', false);
        });
    }

    function loadUsers() {
        api('/folders/users').done(function (res) {
            state.users = res.users || [];
            fillUserSelects();
        });
    }

    function loadCategoryDocs() {
        api('/folders/documents', 'GET', { menu: state.menu, submenu: state.submenu }).done(function (res) {
            state.categoryDocs = res.documents || [];
            fillDocSelect();
        });
    }

    function fillUserSelects() {
        var opts = '<option value="">Select user</option>';
        state.users.forEach(function (u) {
            opts += '<option value="' + escapeHtml(u.emp_email) + '">' + escapeHtml(u.emp_email) + '</option>';
        });
        $('#folderPermUser, #folderShareUser').html(opts);
    }

    function fillDocSelect() {
        var assigned = {};
        if (state.detail && state.detail.documents) {
            state.detail.documents.forEach(function (d) { assigned[d.doc_num] = true; });
        }
        var opts = '';
        state.categoryDocs.forEach(function (d) {
            if (assigned[d.doc_num]) return;
            opts += '<option value="' + d.doc_num + '">' + escapeHtml(d.doc_name || d.doc) + '</option>';
        });
        $('#folderAddDocs').html(opts || '<option value="">No unassigned documents</option>');
    }

    function fillParentSelects() {
        var current = state.selectedId;
        var source = state.allFolders.length ? state.allFolders : state.folders;
        function options(excludeId) {
            var html = '<option value="">Root of ' + escapeHtml(state.menu + ' / ' + state.submenu) + '</option>';
            source.forEach(function (f) {
                if (excludeId && Number(f.folder_id) === Number(excludeId)) return;
                html += '<option value="' + f.folder_id + '">' + escapeHtml(f.folder_name) + '</option>';
            });
            return html;
        }
        $('#folderCreateParent').html(options());
        $('#folderParent').html(options(current));
    }

    function buildTree(folders) {
        var ids = {};
        folders.forEach(function (f) { ids[Number(f.folder_id)] = true; });
        var byParent = {};
        folders.forEach(function (f) {
            var parentExists = f.parent_id && ids[Number(f.parent_id)];
            var key = parentExists ? Number(f.parent_id) : 0;
            if (!byParent[key]) byParent[key] = [];
            byParent[key].push(f);
        });
        function walk(parentId, depth) {
            var nodes = byParent[parentId] || [];
            var html = '';
            nodes.forEach(function (f) {
                var selected = Number(f.folder_id) === Number(state.selectedId) ? ' is-selected' : '';
                var full = (state.allFolders || []).filter(function (x) { return Number(x.folder_id) === Number(f.folder_id); })[0] || f;
                var docs = full.doc_count || f.doc_count || 0;
                var children = full.child_count || f.child_count || 0;
                html += '<div class="folder-tree-item' + selected + '" role="button" tabindex="0" data-id="' + f.folder_id + '" style="padding-left:' + (8 + depth * 16) + 'px">' +
                    '<i class="fa fa-folder"></i><span>' + escapeHtml(f.folder_name) + '</span>' +
                    '<small class="folder-muted">(' + docs + (children ? ' · ' + children + ' sub' : '') + ')</small></div>';
                html += walk(Number(f.folder_id), depth + 1);
            });
            return html;
        }
        return walk(0, 0);
    }

    function renderTree() {
        var html = buildTree(state.folders);
        if (!html) {
            html = state.lastQuery
                ? '<div class="folder-tree-empty">No folders or documents match this search.</div>'
                : '<div class="folder-tree-empty">No controlled folders yet. Create one to organize, share, and audit documents in this category.</div>';
        }
        $('#folderTreeList').html(html);
    }

    function renderPlaceholder() {
        $('#folderDetailContent').hide();
        $('#folderPlaceholder').show();
    }

    function loadDetail(id) {
        api('/folders/' + id).done(function (res) {
            state.selectedId = id;
            state.detail = res;
            renderTree();
            renderDetail();
        }).fail(function (xhr) {
            showMsg((xhr.responseJSON && xhr.responseJSON.message) || 'Unable to open folder.', false);
        });
    }

    function renderDetail() {
        var folder = state.detail.folder;
        var caps = state.detail.capabilities || {};
        $('#folderPlaceholder').hide();
        $('#folderDetailContent').show();
        $('#folderTitle').text(folder.folder_name);
        $('#folderMeta').html(
            badge('Lifecycle', folder.lifecycle_status) +
            badge('Visibility', folder.visibility) +
            '<span class="folder-muted">Owner: ' + escapeHtml(folder.owner) + ' · Role: ' + escapeHtml(folder.access_role || 'none') + '</span>'
        );
        $('#folderName').val(folder.folder_name);
        $('#folderDesc').val(folder.description || '');
        $('#folderTags').val(folder.tags || '');
        $('#folderVisibility').val(folder.visibility);
        $('#folderInherit').val(String(folder.inherit_permissions));
        $('#folderReview').val(inputDate(folder.review_date));
        $('#folderRetain').val(inputDate(folder.retain_until));
        fillParentSelects();
        $('#folderParent').val(folder.parent_id || '');
        $('#folderSaveBtn, #folderDeleteBtn').toggle(!!(caps.canEdit || caps.canDelete));
        $('#folderSaveBtn').toggle(!!caps.canEdit);
        $('#folderDeleteBtn').toggle(!!caps.canDelete);
        renderDocs();
        renderPerms();
        renderShares();
        renderLifecycle();
        renderAudit();
        fillDocSelect();
    }

    function renderDocs() {
        var rows = state.detail.documents || [];
        var caps = state.detail.capabilities || {};
        var html = '';
        if (!rows.length) {
            html = '<tr><td colspan="5" class="folder-muted">No documents assigned to this folder.</td></tr>';
        } else {
            rows.forEach(function (d) {
                html += '<tr><td>' + escapeHtml(d.doc_name || d.doc || '') + '</td><td>' + escapeHtml(d.docDesc || '') + '</td>' +
                    '<td>' + escapeHtml(String(d.version || '')) + '</td><td>' + fmtDate(d.releaseDt) + '</td><td>' +
                    (caps.canEdit ? '<button type="button" class="folder-danger folder-remove-doc" data-doc="' + d.doc_num + '">Remove</button>' : '') +
                    '</td></tr>';
            });
        }
        $('#folderDocRows').html(html);
        $('#folderDocAssign').toggle(!!caps.canEdit);
    }

    function renderPerms() {
        var rows = state.detail.permissions || [];
        var caps = state.detail.capabilities || {};
        var html = '';
        if (!rows.length) {
            html = '<tr><td colspan="4" class="folder-muted">No explicit permissions.</td></tr>';
        } else {
            rows.forEach(function (p) {
                html += '<tr><td>' + escapeHtml(p.user_email) + '</td><td>' + escapeHtml(p.access_role) + '</td>' +
                    '<td>' + escapeHtml(p.granted_by) + '<br><small>' + fmtDateTime(p.granted_at) + '</small></td><td>' +
                    (caps.canManageAccess && p.user_email !== (state.detail.folder || {}).owner ? '<button type="button" class="folder-danger folder-revoke-perm" data-id="' + p.perm_id + '">Revoke</button>' : '') +
                    '</td></tr>';
            });
        }
        $('#folderPermRows').html(html);
        $('#folderPermAssign').toggle(!!caps.canManageAccess);
    }

    function renderShares() {
        var rows = state.detail.shares || [];
        var caps = state.detail.capabilities || {};
        var html = '';
        if (!rows.length) {
            html = '<tr><td colspan="5" class="folder-muted">This folder has not been shared.</td></tr>';
        } else {
            rows.forEach(function (s) {
                var status = s.revoked ? 'revoked' : (s.expires_at && moment(s.expires_at).isBefore(moment()) ? 'expired' : 'active');
                html += '<tr><td>' + escapeHtml(s.shared_with) + '</td><td>' + escapeHtml(s.access_role) + '</td>' +
                    '<td>' + (s.expires_at ? fmtDateTime(s.expires_at) : 'No expiry') + '</td><td>' + status + '</td><td>' +
                    (caps.canShare && !s.revoked ? '<button type="button" class="folder-danger folder-revoke-share" data-id="' + s.share_id + '">Revoke</button>' : '') +
                    '</td></tr>';
            });
        }
        $('#folderShareRows').html(html);
        $('#folderShareAssign').toggle(!!caps.canShare);
    }

    function renderLifecycle() {
        var folder = state.detail.folder;
        var caps = state.detail.capabilities || {};
        var html = '';
        (folder.next_lifecycle || []).forEach(function (next) {
            html += '<button type="button" class="folder-secondary folder-lifecycle-next" data-status="' + next + '">Move to ' + next.replace('_', ' ') + '</button>';
        });
        $('#folderLifecycleNow').html(badge('Current', folder.lifecycle_status));
        $('#folderLifecycleBtns').html(html || '<span class="folder-muted">No further transitions.</span>');
        $('.folder-lifecycle-next').prop('disabled', !caps.canLifecycle);
        $('#folderReviewHint').text(
            folder.review_date ? ('Next review: ' + fmtDate(folder.review_date)) : 'No review date set.'
        );
        $('#folderRetainHint').text(
            folder.retain_until ? ('Retain until: ' + fmtDate(folder.retain_until)) : 'No retention date set.'
        );
    }

    function renderAudit() {
        var rows = state.detail.audit || [];
        var html = '';
        if (!rows.length) {
            html = '<tr><td colspan="4" class="folder-muted">No audit events yet.</td></tr>';
        } else {
            rows.forEach(function (a) {
                html += '<tr><td>' + fmtDateTime(a.created_at) + '</td><td>' + escapeHtml(a.actor) + '</td>' +
                    '<td>' + escapeHtml(a.action) + '</td><td>' + escapeHtml(a.details || '') + '</td></tr>';
            });
        }
        $('#folderAuditRows').html(html);
    }

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function switchTab(name) {
        $('.folder-tab').removeClass('is-active');
        $('.folder-tab[data-tab="' + name + '"]').addClass('is-active');
        $('.folder-tab-panel').removeClass('is-active');
        if (name === 'create') {
            $('#folderPlaceholder').hide();
            $('#folderDetailContent').hide();
            $('#folderTab-create').addClass('is-active');
            return;
        }
        if (state.selectedId) {
            $('#folderPlaceholder').hide();
            $('#folderDetailContent').show();
            $('#folderTab-' + name).addClass('is-active');
        } else {
            $('#folderDetailContent').hide();
            $('#folderPlaceholder').show();
        }
    }

    function bindEvents() {
        $(document).on('click', '#openFolderWorkspace', function () {
            openWorkspace();
        });
        $(document).on('click', '#folderOverlay, #closeFolderWorkspace', function () {
            closeWorkspace();
        });
        $(document).on('click', '#folderWorkspace', function (e) {
            e.stopPropagation();
        });
        $(document).on('input', '#folderTreeSearch', function () {
            var query = $(this).val();
            clearTimeout(state.searchTimer);
            state.searchTimer = setTimeout(function () { loadFolders(query); }, 250);
        });
        $(document).on('click', '#folderCreateBtn', function () {
            switchTab('create');
        });
        $(document).on('click', '.folder-tree-item', function () {
            loadDetail($(this).data('id'));
            switchTab('overview');
        });
        $(document).on('keydown', '.folder-tree-item', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                $(this).trigger('click');
            }
        });
        $(document).on('click', '.folder-tab', function () {
            switchTab($(this).data('tab'));
        });
        $(document).on('click', '#folderRefreshBtn', function () {
            loadFolders($('#folderTreeSearch').val());
        });
        $(document).on('keydown', function (e) {
            if (e.key === 'Escape' && $('#folderWorkspace').hasClass('is-open')) {
                closeWorkspace();
            }
        });
        $('#folderCreateForm').on('submit', function (e) {
            e.preventDefault();
            if (!$('#createFolderName').val().trim()) {
                showMsg('Folder name is required.', false);
                return;
            }
            api('/folders', 'POST', {
                menu: state.menu,
                submenu: state.submenu,
                folder_name: $('#createFolderName').val(),
                description: $('#createFolderDesc').val(),
                parent_id: $('#folderCreateParent').val(),
                visibility: $('#createFolderVisibility').val(),
                tags: $('#createFolderTags').val(),
                inherit_permissions: $('#createFolderInherit').val(),
                review_date: $('#createFolderReview').val(),
                retain_until: $('#createFolderRetain').val(),
                lifecycle_status: 'draft'
            }).done(function (res) {
                showMsg(res.message, true);
                $('#folderCreateForm')[0].reset();
                state.selectedId = res.folder_id;
                loadFolders();
                switchTab('overview');
            }).fail(function (xhr) {
                showMsg((xhr.responseJSON && xhr.responseJSON.message) || 'Create failed.', false);
            });
        });
        $('#folderSaveBtn').on('click', function () {
            if (!state.selectedId) return;
            api('/folders/' + state.selectedId, 'POST', {
                folder_name: $('#folderName').val(),
                description: $('#folderDesc').val(),
                parent_id: $('#folderParent').val(),
                visibility: $('#folderVisibility').val(),
                tags: $('#folderTags').val(),
                inherit_permissions: $('#folderInherit').val(),
                review_date: $('#folderReview').val(),
                retain_until: $('#folderRetain').val()
            }).done(function (res) {
                showMsg(res.message, true);
                loadFolders();
            }).fail(function (xhr) {
                showMsg((xhr.responseJSON && xhr.responseJSON.message) || 'Update failed.', false);
            });
        });
        $('#folderDeleteBtn').on('click', function () {
            if (!state.selectedId) return;
            if (!window.confirm('Delete this folder? Assigned documents stay in the category list.')) return;
            api('/folders/' + state.selectedId + '/delete', 'POST').done(function (res) {
                showMsg(res.message, true);
                state.selectedId = null;
                loadFolders();
            }).fail(function (xhr) {
                showMsg((xhr.responseJSON && xhr.responseJSON.message) || 'Delete failed.', false);
            });
        });
        $('#folderOpenAccessPanel').on('click', function () {
            if (!state.selectedId) return;
            if (window.qmsOpenAccessPanel) window.qmsOpenAccessPanel(state.selectedId);
        });
        $('#folderGrantPerm').on('click', function () {
            if (!state.selectedId) return;
            if (!$('#folderPermUser').val()) {
                showMsg('Select a user to grant access.', false);
                return;
            }
            api('/folders/' + state.selectedId + '/permissions', 'POST', {
                user_email: $('#folderPermUser').val(),
                access_role: $('#folderPermRole').val()
            }).done(function (res) {
                showMsg(res.message, true);
                loadFolders($('#folderTreeSearch').val());
            }).fail(function (xhr) {
                showMsg((xhr.responseJSON && xhr.responseJSON.message) || 'Permission update failed.', false);
            });
        });
        $(document).on('click', '.folder-revoke-perm', function () {
            api('/folders/' + state.selectedId + '/permissions/' + $(this).data('id') + '/revoke', 'POST').done(function (res) {
                showMsg(res.message, true);
                loadFolders($('#folderTreeSearch').val());
            }).fail(function (xhr) {
                showMsg((xhr.responseJSON && xhr.responseJSON.message) || 'Revoke failed.', false);
            });
        });
        $('#folderCreateShare').on('click', function () {
            if (!state.selectedId) return;
            if (!$('#folderShareUser').val()) {
                showMsg('Select a user to share with.', false);
                return;
            }
            api('/folders/' + state.selectedId + '/shares', 'POST', {
                shared_with: $('#folderShareUser').val(),
                access_role: $('#folderShareRole').val(),
                expires_at: $('#folderShareExpiry').val()
            }).done(function (res) {
                showMsg(res.message, true);
                loadFolders($('#folderTreeSearch').val());
            }).fail(function (xhr) {
                showMsg((xhr.responseJSON && xhr.responseJSON.message) || 'Share failed.', false);
            });
        });
        $(document).on('click', '.folder-revoke-share', function () {
            api('/folders/' + state.selectedId + '/shares/' + $(this).data('id') + '/revoke', 'POST').done(function (res) {
                showMsg(res.message, true);
                loadFolders($('#folderTreeSearch').val());
            }).fail(function (xhr) {
                showMsg((xhr.responseJSON && xhr.responseJSON.message) || 'Revoke failed.', false);
            });
        });
        $(document).on('click', '.folder-lifecycle-next', function () {
            api('/folders/' + state.selectedId + '/lifecycle', 'POST', {
                lifecycle_status: $(this).data('status')
            }).done(function (res) {
                showMsg(res.message, true);
                loadFolders();
            }).fail(function (xhr) {
                showMsg((xhr.responseJSON && xhr.responseJSON.message) || 'Lifecycle update failed.', false);
            });
        });
        $('#folderAssignDocs').on('click', function () {
            var docs = $('#folderAddDocs').val() || [];
            if (!docs.length) {
                showMsg('Select at least one document to assign.', false);
                return;
            }
            api('/folders/' + state.selectedId + '/documents', 'POST', { doc_nums: docs }).done(function (res) {
                showMsg(res.message, true);
                loadFolders($('#folderTreeSearch').val());
            }).fail(function (xhr) {
                showMsg((xhr.responseJSON && xhr.responseJSON.message) || 'Unable to assign documents.', false);
            });
        });
        $(document).on('click', '.folder-remove-doc', function () {
            api('/folders/' + state.selectedId + '/documents/' + $(this).data('doc') + '/remove', 'POST').done(function (res) {
                showMsg(res.message, true);
                loadFolders($('#folderTreeSearch').val());
            }).fail(function (xhr) {
                showMsg((xhr.responseJSON && xhr.responseJSON.message) || 'Unable to remove document.', false);
            });
        });
    }

    $(document).ready(function () {
        if (!$('#openFolderWorkspace').length) return;
        cfg();
        bindEvents();
    });
})(jQuery);
