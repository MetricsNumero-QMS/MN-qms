(function () {
    var page = document.getElementById('libPage');
    if (!page) return;

    var raw = document.getElementById('libItemsJson');
    var items = [];
    try {
        var text = raw ? raw.textContent : '[]';
        items = JSON.parse(text) || [];
    } catch (e) {
        try {
            var decoded = raw ? new DOMParser().parseFromString(raw.innerHTML, 'text/html').documentElement.textContent : '[]';
            items = JSON.parse(decoded) || [];
        } catch (e2) {
            items = [];
        }
    }

    var state = {
        kind: 'all',
        sort: 'name',
        dir: 'asc',
        view: 'list',
        page: 1,
        pageSize: 10,
        q: ''
    };

    var currentSlice = [];
    var rowMenu = document.createElement('div');
    rowMenu.className = 'lib-row-menu';
    rowMenu.hidden = true;
    document.body.appendChild(rowMenu);
    var activeItem = null;
    var lastPreviewItem = null;
    var pendingUpdate = { item: null, mode: '' };
    var pendingOpenApp = null;
    var placeMode = 'copy';
    var selectedDest = '';
    var inviteTarget = null;

    function sysCanInvite() {
        var role = String(page.getAttribute('data-sys-role') || '').toLowerCase();
        return role === 'admin' || role === 'editor' || page.getAttribute('data-can-invite') === '1';
    }

    var body = document.getElementById('libTableBody');
    var grid = document.getElementById('libGridView');
    var empty = document.getElementById('libEmpty');
    var range = document.getElementById('libRange');
    var pageNum = document.getElementById('libPageNum');
    var prevBtn = document.getElementById('libPrev');
    var nextBtn = document.getElementById('libNext');
    var searchInput = document.getElementById('libSearchInput');

    function iconFor(item) {
        if (item.kind !== 'document') return '<span class="lib-ico folder"><i class="fa fa-folder"></i></span>';
        var t = String(item.typeLabel || '').toUpperCase();
        if (t === 'DOCX' || t === 'DOC') return '<span class="lib-ico word">W</span>';
        if (t === 'PDF') return '<span class="lib-ico pdf"><i class="fa fa-file-pdf"></i></span>';
        if (t === 'XLSX' || t === 'XLS') return '<span class="lib-ico xls"><i class="fa fa-file-excel"></i></span>';
        if (t === 'PPTX' || t === 'PPT') return '<span class="lib-ico ppt"><i class="fa fa-file-powerpoint"></i></span>';
        return '<span class="lib-ico file"><i class="fa fa-file"></i></span>';
    }

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function filtered() {
        var q = state.q.toLowerCase();
        return items.filter(function (item) {
            if (state.kind === 'folder' && item.kind === 'document') return false;
            if (state.kind === 'document' && item.kind !== 'document') return false;
            if (q && String(item.name || '').toLowerCase().indexOf(q) === -1) return false;
            return true;
        }).sort(function (a, b) {
            function verNum(item) {
                if (item.kind !== 'document') return -1;
                var p = String(item.version || '0').split('.');
                return (parseInt(p[0], 10) || 0) * 1000 + (parseInt(p[1], 10) || 0);
            }
            var aDoc = a.kind === 'document' ? 1 : 0;
            var bDoc = b.kind === 'document' ? 1 : 0;
            if (state.sort === 'name' && aDoc !== bDoc) return aDoc - bDoc;
            var av = a[state.sort] || '';
            var bv = b[state.sort] || '';
            if (state.sort === 'modified') {
                av = a.modified ? new Date(a.modified).getTime() : 0;
                bv = b.modified ? new Date(b.modified).getTime() : 0;
            }
            if (state.sort === 'version') {
                av = verNum(a);
                bv = verNum(b);
            }
            if (av < bv) return state.dir === 'asc' ? -1 : 1;
            if (av > bv) return state.dir === 'asc' ? 1 : -1;
            var nameCmp = String(a.name || '').localeCompare(String(b.name || ''));
            if (nameCmp !== 0) return nameCmp;
            if (a.kind === 'document' && b.kind === 'document') {
                var aCur = a.isCurrent === false ? 0 : 1;
                var bCur = b.isCurrent === false ? 0 : 1;
                if (aCur !== bCur) return bCur - aCur;
                return verNum(b) - verNum(a);
            }
            return 0;
        });
    }

    function render() {
        var rows = filtered();
        var pages = Math.max(1, Math.ceil(rows.length / state.pageSize));
        if (state.page > pages) state.page = pages;
        var start = (state.page - 1) * state.pageSize;
        var slice = rows.slice(start, start + state.pageSize);
        var from = rows.length ? start + 1 : 0;
        var to = start + slice.length;

        currentSlice = slice;
        empty.hidden = rows.length > 0;
        document.getElementById('libListView').hidden = state.view !== 'list';
        grid.hidden = state.view !== 'grid';

        body.innerHTML = slice.map(function (item, idx) {
            var canView = canPreview(item);
            var nameClass = 'lib-name' + (canView ? ' lib-open-view' : '');
            var nameHref = canView ? '#' : esc(item.href || '#');
            var prior = item.kind === 'document' && item.isCurrent === false;
            var locked = !!item.locked;
            var versionCell = '--';
            if (item.kind === 'document') {
                versionCell = 'v' + esc(item.version || '1.0');
                if (prior) versionCell += ' <span class="lib-ver-prior">previous</span>';
            }
            return '<tr data-kind="' + esc(item.kind) + '" data-id="' + esc(item.id || '') + '"' +
                ' class="' + (prior ? 'is-prior' : '') + (locked ? ' is-locked' : '') + '">' +
                '<td><a class="' + nameClass + '" href="' + nameHref + '" data-i="' + idx + '"' +
                    (canView ? ' title="View" role="button"' : '') + '>' +
                    iconFor(item) + '<span>' + esc(item.name) + (locked ? ' <i class="fa fa-lock"></i>' : '') + '</span></a></td>' +
                '<td>' + esc(item.typeLabel) + '</td>' +
                '<td>' + versionCell + '</td>' +
                '<td>' + esc(item.modifiedLabel || '--') + '</td>' +
                '<td>' + esc(item.modifiedBy || '') + '</td>' +
                '<td>' + esc(item.size || '--') + '</td>' +
                '<td class="lib-actions-col">' +
                    '<button type="button" class="lib-row-actions" data-i="' + idx + '" aria-label="Actions for ' + esc(item.name) + '"><i class="fa fa-ellipsis-h"></i></button>' +
                '</td></tr>';
        }).join('');

        grid.innerHTML = slice.map(function (item, idx) {
            var canView = canPreview(item);
            if (canView) {
                return '<button type="button" class="lib-tile lib-open-view" data-i="' + idx + '" title="View">' +
                    iconFor(item) +
                    '<strong>' + esc(item.name) + '</strong>' +
                    '<span>' + esc(item.typeLabel) + (item.version ? ' · v' + esc(item.version) + (item.isCurrent === false ? ' previous' : ' current') : '') + ' · ' + esc(item.modifiedLabel || '--') + '</span></button>';
            }
            return '<a class="lib-tile" href="' + esc(item.href) + '">' +
                iconFor(item) +
                '<strong>' + esc(item.name) + '</strong>' +
                '<span>' + esc(item.typeLabel) + ' · ' + esc(item.modifiedLabel || '--') + '</span></a>';
        }).join('');

        range.textContent = rows.length
            ? 'Showing ' + from + ' to ' + to + ' of ' + rows.length + ' items'
            : 'Showing 0 items';
        pageNum.textContent = String(state.page);
        prevBtn.disabled = state.page <= 1;
        nextBtn.disabled = state.page >= pages;
    }

    function closeMenus(except) {
        document.querySelectorAll('.lib-menu').forEach(function (el) {
            if (el !== except) el.hidden = true;
        });
    }

    function toggleMenu(id) {
        var menu = document.getElementById(id);
        if (!menu) return;
        var next = !menu.hidden;
        closeMenus(menu);
        menu.hidden = next;
    }

    function closeRowMenu() {
        rowMenu.hidden = true;
    }

    function itemLink(item) {
        if (item.download) return item.download;
        if (item.href && item.href !== '#') return item.href;
        return '';
    }

    function canPreview(item) {
        return item && item.kind === 'document' && !item.locked && page.getAttribute('data-filter') !== 'recycle';
    }

    function updateExt(item) {
        var name = String((item && (item.fileName || item.name || item.typeLabel)) || '');
        var ext = name.indexOf('.') >= 0 ? name.split('.').pop() : name;
        return String(ext || '').toLowerCase();
    }

    function isUpdatableType(item) {
        var allowed = ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx'];
        if (allowed.indexOf(updateExt(item)) !== -1) return true;
        return allowed.indexOf(String((item && item.typeLabel) || '').toLowerCase()) !== -1;
    }

    function canUpdateFile(item) {
        return !!(item && item.kind === 'document' && item.id && item.isCurrent !== false && !item.locked
            && item.canEdit !== false && page.getAttribute('data-filter') !== 'recycle' && isUpdatableType(item));
    }

    function canOpenInApp(item) {
        return !!(item && item.kind === 'document' && !item.locked && item.canView !== false
            && page.getAttribute('data-filter') !== 'recycle' && isUpdatableType(item));
    }

    function absoluteUrl(path) {
        if (!path) return '';
        if (/^https?:\/\//i.test(path)) return path;
        if (path.charAt(0) !== '/') path = '/' + path;
        return window.location.origin + path;
    }

    function publicFileUrl(item) {
        if (!item) return '';
        if (item.fileUrl) return absoluteUrl(item.fileUrl);
        var download = String(item.download || '');
        var parts = download.split('/').filter(Boolean);
        if (parts[0] === 'downloadDocument' && parts.length >= 4) {
            var segs = parts.slice(1).map(function (part) {
                try { return encodeURIComponent(decodeURIComponent(part)); }
                catch (err) { return encodeURIComponent(part); }
            });
            return window.location.origin + '/pdfFiles/' + segs.join('/');
        }
        return absoluteUrl(item.previewUrl || item.download);
    }

    function officeScheme(ext) {
        ext = String(ext || '').toLowerCase();
        if (ext === 'doc' || ext === 'docx') return 'ms-word';
        if (ext === 'xls' || ext === 'xlsx') return 'ms-excel';
        if (ext === 'ppt' || ext === 'pptx') return 'ms-powerpoint';
        return '';
    }

    function appNameFor(ext) {
        ext = String(ext || '').toLowerCase();
        if (ext === 'doc' || ext === 'docx') return 'Microsoft Word';
        if (ext === 'xls' || ext === 'xlsx') return 'Microsoft Excel';
        if (ext === 'ppt' || ext === 'pptx') return 'Microsoft PowerPoint';
        if (ext === 'pdf') return 'your PDF app';
        return 'the desktop app';
    }

    function launchAppUri(uri) {
        var link = document.createElement('a');
        link.href = uri;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(function () {
            if (link.parentNode) link.parentNode.removeChild(link);
        }, 400);
    }

    function closeOpenAppModal() {
        var modal = document.getElementById('libOpenAppModal');
        if (modal) modal.hidden = true;
        pendingOpenApp = null;
    }

    function openInApp(item) {
        if (!canOpenInApp(item)) {
            alert('This file cannot be opened in an app here.');
            return;
        }
        var ext = updateExt(item);
        if (['doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx'].indexOf(ext) === -1) {
            ext = String(item.typeLabel || '').toLowerCase();
        }
        var fileUrl = publicFileUrl(item);
        var scheme = officeScheme(ext);
        if (scheme && fileUrl) {
            var cmd = (item.canEdit !== false && item.isCurrent !== false) ? 'ofe' : 'ofv';
            launchAppUri(scheme + ':' + cmd + '|u|' + encodeURI(fileUrl));
            return;
        }
        if (fileUrl) {
            window.open(fileUrl, '_blank', 'noopener');
            return;
        }
        if (item.download) window.location.href = item.download;
    }

    function findDocItem(id) {
        if (pendingUpdate.item && String(pendingUpdate.item.id) === String(id)) return pendingUpdate.item;
        if (lastPreviewItem && String(lastPreviewItem.id) === String(id)) return lastPreviewItem;
        if (activeItem && activeItem.kind === 'document' && String(activeItem.id) === String(id)) return activeItem;
        return items.filter(function (item) {
            return item.kind === 'document' && String(item.id) === String(id) && item.isCurrent !== false;
        })[0] || null;
    }

    function openPreview(item) {
        var parts = String(item.download || '').split('/').filter(Boolean);
        var menu = page.getAttribute('data-menu') || '';
        var submenu = page.getAttribute('data-submenu') || '';
        var fileName = item.fileName || item.name || '';
        if (parts[0] === 'downloadDocument' && parts.length >= 4) {
            menu = decodeURIComponent(parts[1] || '');
            submenu = decodeURIComponent(parts[2] || '');
            fileName = decodeURIComponent(parts.slice(3).join('/'));
        }
        if (!fileName || !window.jQuery) return;
        var trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'user_logdet viewFile';
        trigger.setAttribute('data-file_name', fileName);
        trigger.setAttribute('data-menu', menu);
        trigger.setAttribute('data-submenu', submenu);
        trigger.setAttribute('data-file_access_type', '0');
        lastPreviewItem = item;
        if (item.id) trigger.setAttribute('data-doc_id', String(item.id));
        if (canUpdateFile(item)) trigger.setAttribute('data-can_update', '1');
        if (item.editMode) trigger.setAttribute('data-edit_mode', '1');
        if (item.version) trigger.setAttribute('data-version', String(item.version));
        if (item.previewUrl) trigger.setAttribute('data-preview_url', item.previewUrl);
        if (item.download) trigger.setAttribute('data-download_url', item.download);
        if (item.fileUrl) trigger.setAttribute('data-file_url', item.fileUrl);
        trigger.hidden = true;
        document.body.appendChild(trigger);
        window.jQuery(trigger).trigger('click');
        trigger.remove();
    }

    function openUpdateEditor(item) {
        if (!canUpdateFile(item)) {
            alert('This file cannot be updated here.');
            return;
        }
        pendingUpdate.item = item;
        pendingUpdate.mode = '';
        var editItem = {};
        Object.keys(item).forEach(function (key) { editItem[key] = item[key]; });
        editItem.editMode = true;
        openPreview(editItem);
    }

    function postJson(url, payload) {
        return fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'same-origin'
        }).then(function (res) {
            return res.json().then(function (data) { return { ok: res.ok, data: data }; });
        }).then(function (result) {
            if (!result.ok || !result.data.success) {
                throw new Error((result.data && result.data.message) || 'Request failed.');
            }
            return result.data;
        });
    }

    function needsStoredItem(item) {
        return item && item.id && (item.kind === 'folder' || item.kind === 'document');
    }

    function openPlaceModal(mode) {
        if (!needsStoredItem(activeItem)) {
            alert('Open a folder or file before using this action.');
            return;
        }
        placeMode = mode;
        var modal = document.getElementById('libPlaceModal');
        var msg = document.getElementById('libPlaceMsg');
        document.getElementById('libPlaceTitle').textContent = mode === 'copy' ? 'Copy to' : 'Move to';
        document.getElementById('libPlaceSubmit').textContent = mode === 'copy' ? 'Copy' : 'Move';
        document.getElementById('libPlaceHint').textContent = (mode === 'copy' ? 'Copy' : 'Move') + ' "' + activeItem.name + '" into another folder.';
        msg.hidden = true;
        selectedDest = '';
        document.getElementById('libPlaceDest').value = '';
        var tree = document.getElementById('libPlaceTree');
        tree.innerHTML = 'Loading folders...';
        modal.hidden = false;
        fetch('/folders/destinations', { headers: { 'Accept': 'application/json' }, credentials: 'same-origin' })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                var folders = (data.folders || []).filter(function (folder) {
                    return String(folder.folder_id) !== String(activeItem.id) || activeItem.kind !== 'folder';
                });
                if (!folders.length) {
                    tree.innerHTML = 'No destination folders yet';
                    return;
                }
                var byParent = {};
                folders.forEach(function (folder) {
                    var parentKey = folder.parent_id ? String(folder.parent_id) : '';
                    if (!byParent[parentKey]) byParent[parentKey] = [];
                    byParent[parentKey].push(folder);
                });
                Object.keys(byParent).forEach(function (key) {
                    byParent[key].sort(function (a, b) {
                        return String(a.folder_name).localeCompare(String(b.folder_name));
                    });
                });
                function branch(parentKey) {
                    var nodes = byParent[parentKey] || [];
                    if (!nodes.length) return '';
                    return '<ul>' + nodes.map(function (folder) {
                        var id = String(folder.folder_id);
                        return '<li><button type="button" class="lib-tree-item" data-dest="' + esc(id) + '"><i class="fa fa-folder"></i> ' + esc(folder.folder_name) + '</button>' + branch(id) + '</li>';
                    }).join('') + '</ul>';
                }
                tree.innerHTML = branch('');
            })
            .catch(function () {
                tree.innerHTML = 'Unable to load folders';
            });
    }

    function openDeleteModal(item, mode) {
        activeItem = item;
        var isFile = item.kind === 'document';
        var permanent = mode === 'purge';
        var noun = isFile ? 'file' : 'folder';
        var nested = !isFile && (item.kind === 'category' || item.kind === 'department' || item.kind === 'folder');
        document.getElementById('libDeleteTitle').textContent = permanent ? 'Delete permanently' : 'Delete ' + noun;
        document.getElementById('libDeleteHint').textContent = permanent
            ? 'This ' + noun + ' will be removed and cannot be restored.'
            : (nested
                ? 'This folder and everything inside it will be moved to the Recycle Bin.'
                : 'This ' + noun + ' will be moved to the Recycle Bin.');
        document.getElementById('libDeleteName').textContent = item.name || '';
        document.getElementById('libDeleteMsg').hidden = true;
        var confirmBtn = document.getElementById('libDeleteConfirm');
        confirmBtn.textContent = permanent ? 'Delete permanently' : 'Delete';
        confirmBtn.disabled = false;
        confirmBtn.setAttribute('data-mode', mode);
        document.getElementById('libDeleteModal').hidden = false;
        confirmBtn.focus();
    }

    function openRenameModal() {
        if (!activeItem || !activeItem.id) {
            alert('This item cannot be renamed.');
            return;
        }
        document.getElementById('libRenameHint').textContent = 'Rename "' + activeItem.name + '".';
        document.getElementById('libRenameName').value = activeItem.name || '';
        document.getElementById('libRenameMsg').hidden = true;
        document.getElementById('libRenameModal').hidden = false;
        document.getElementById('libRenameName').focus();
    }

    function isLibraryFolder(item) {
        return item && (item.kind === 'folder' || item.kind === 'category' || item.kind === 'department');
    }

    var inviteCal = {
        view: new Date(),
        selected: null,
        hours: 18,
        minutes: 0
    };
    var inviteCalMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var inviteCalShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function invitePad(n) {
        return n < 10 ? '0' + n : String(n);
    }

    function inviteStartOfDay(d) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    function inviteSameDay(a, b) {
        return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    function inviteNextSlot(from) {
        var d = new Date(from.getTime());
        d.setSeconds(0, 0);
        var mins = d.getMinutes();
        var bump = mins % 15 === 0 ? 15 : 15 - (mins % 15);
        d.setMinutes(mins + bump);
        return d;
    }

    function inviteFormatHidden(d) {
        return d.getFullYear() + '-' + invitePad(d.getMonth() + 1) + '-' + invitePad(d.getDate()) + 'T' + invitePad(d.getHours()) + ':' + invitePad(d.getMinutes());
    }

    function inviteFormatLabel(d) {
        var h = d.getHours();
        var h12 = h % 12 || 12;
        return d.getDate() + ' ' + inviteCalShort[d.getMonth()] + ' ' + d.getFullYear() + ', ' + h12 + ':' + invitePad(d.getMinutes()) + ' ' + (h < 12 ? 'AM' : 'PM');
    }

    function syncInviteExpiry() {
        var hidden = document.getElementById('libInviteExpiry');
        var label = document.getElementById('libInviteExpireLabel');
        var clear = document.getElementById('libInviteExpireClear');
        if (!hidden || !label) return;
        if (!inviteCal.selected) {
            hidden.value = '';
            label.textContent = 'Choose a date and time';
            label.classList.add('is-empty');
            if (clear) clear.hidden = true;
            return;
        }
        hidden.value = inviteFormatHidden(inviteCal.selected);
        label.textContent = inviteFormatLabel(inviteCal.selected);
        label.classList.remove('is-empty');
        if (clear) clear.hidden = false;
    }

    function closeInviteCal() {
        var cal = document.getElementById('libInviteCal');
        var btn = document.getElementById('libInviteExpireBtn');
        if (cal) cal.hidden = true;
        if (btn) btn.setAttribute('aria-expanded', 'false');
    }

    function inviteTimeParts() {
        var h24 = inviteCal.hours;
        return {
            hour12: h24 % 12 || 12,
            minute: inviteCal.minutes,
            meridiem: h24 < 12 ? 'AM' : 'PM'
        };
    }

    function inviteHoursFromParts(hour12, meridiem) {
        var hour = Number(hour12) % 12;
        if (meridiem === 'PM') hour += 12;
        return hour;
    }

    function renderInviteCal() {
        var cal = document.getElementById('libInviteCal');
        if (!cal) return;
        var today = inviteStartOfDay(new Date());
        var year = inviteCal.view.getFullYear();
        var month = inviteCal.view.getMonth();
        var first = new Date(year, month, 1);
        var startDay = first.getDay();
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var canPrev = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth());
        var html = '';
        html += '<div class="lib-cal-head">';
        html += '<button type="button" class="lib-cal-nav" data-cal-nav="-1"' + (canPrev ? '' : ' disabled') + ' aria-label="Previous month"><i class="fa fa-chevron-left"></i></button>';
        html += '<div class="lib-cal-title">' + inviteCalMonths[month] + ' ' + year + '</div>';
        html += '<button type="button" class="lib-cal-nav" data-cal-nav="1" aria-label="Next month"><i class="fa fa-chevron-right"></i></button>';
        html += '</div>';
        html += '<div class="lib-cal-week"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>';
        html += '<div class="lib-cal-grid">';
        var i;
        for (i = 0; i < startDay; i++) html += '<span class="lib-cal-empty"></span>';
        for (i = 1; i <= daysInMonth; i++) {
            var cell = new Date(year, month, i);
            var disabled = cell < today;
            var cls = 'lib-cal-day';
            if (inviteSameDay(cell, today)) cls += ' is-today';
            if (inviteCal.selected && inviteSameDay(cell, inviteCal.selected)) cls += ' is-selected';
            html += '<button type="button" class="' + cls + '" data-cal-day="' + i + '"' + (disabled ? ' disabled' : '') + '>' + i + '</button>';
        }
        html += '</div>';
        var parts = inviteTimeParts();
        html += '<div class="lib-cal-time"><span>Time</span>';
        html += '<select id="libInviteHour" aria-label="Hour">';
        for (i = 1; i <= 12; i++) {
            html += '<option value="' + i + '"' + (i === parts.hour12 ? ' selected' : '') + '>' + i + '</option>';
        }
        html += '</select><span>:</span><select id="libInviteMinute" aria-label="Minute">';
        [0, 15, 30, 45].forEach(function (minute) {
            html += '<option value="' + minute + '"' + (minute === parts.minute ? ' selected' : '') + '>' + invitePad(minute) + '</option>';
        });
        html += '</select><select id="libInviteMeridiem" aria-label="AM or PM">';
        html += '<option value="AM"' + (parts.meridiem === 'AM' ? ' selected' : '') + '>AM</option>';
        html += '<option value="PM"' + (parts.meridiem === 'PM' ? ' selected' : '') + '>PM</option>';
        html += '</select></div>';
        html += '<div class="lib-cal-foot">';
        html += '<button type="button" class="lib-cal-link" data-cal-action="clear">Clear</button>';
        html += '<button type="button" class="lib-cal-link" data-cal-action="today">Today</button>';
        html += '<button type="button" class="lib-cal-done" data-cal-action="done">Done</button>';
        html += '</div>';
        cal.innerHTML = html;
        if (!cal.hidden) positionInviteCal();
    }

    function positionInviteCal() {
        var cal = document.getElementById('libInviteCal');
        var card = document.querySelector('#libInviteModal .lib-modal-card');
        if (!cal || cal.hidden) return;
        var anchor = card || document.getElementById('libInviteExpireBtn');
        if (!anchor) return;
        var rect = anchor.getBoundingClientRect();
        var calW = cal.offsetWidth || 360;
        var calH = cal.offsetHeight || 380;
        var left = rect.left + (rect.width - calW) / 2;
        left = Math.max(12, Math.min(left, window.innerWidth - calW - 12));
        var top = rect.top - calH - 12;
        if (top < 12) top = 12;
        cal.style.left = left + 'px';
        cal.style.top = top + 'px';
    }

    function openInviteCal() {
        var cal = document.getElementById('libInviteCal');
        var btn = document.getElementById('libInviteExpireBtn');
        if (!cal) return;
        if (inviteCal.selected) {
            inviteCal.view = new Date(inviteCal.selected.getFullYear(), inviteCal.selected.getMonth(), 1);
            inviteCal.hours = inviteCal.selected.getHours();
            inviteCal.minutes = inviteCal.selected.getMinutes();
        } else {
            var now = new Date();
            inviteCal.view = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        if (cal.parentNode !== document.body) document.body.appendChild(cal);
        renderInviteCal();
        cal.hidden = false;
        positionInviteCal();
        if (btn) btn.setAttribute('aria-expanded', 'true');
    }

    function resetInviteExpiry() {
        inviteCal.selected = null;
        inviteCal.hours = 18;
        inviteCal.minutes = 0;
        inviteCal.view = new Date();
        closeInviteCal();
        syncInviteExpiry();
    }

    function pickInviteDay(year, month, day) {
        var next = new Date(year, month, day, inviteCal.hours, inviteCal.minutes, 0, 0);
        if (next.getTime() <= Date.now()) {
            next = inviteNextSlot(new Date());
            if (!inviteSameDay(next, new Date(year, month, day))) return false;
            inviteCal.hours = next.getHours();
            inviteCal.minutes = next.getMinutes() - (next.getMinutes() % 15);
            next.setMinutes(inviteCal.minutes);
        }
        inviteCal.selected = next;
        inviteCal.view = new Date(year, month, 1);
        syncInviteExpiry();
        renderInviteCal();
        return true;
    }

    function applyInviteTime() {
        var hourEl = document.getElementById('libInviteHour');
        var minuteEl = document.getElementById('libInviteMinute');
        var merEl = document.getElementById('libInviteMeridiem');
        if (!hourEl || !minuteEl || !merEl) return;
        var hours = inviteHoursFromParts(hourEl.value, merEl.value);
        var minutes = Number(minuteEl.value);
        if (!inviteCal.selected) {
            inviteCal.hours = hours;
            inviteCal.minutes = minutes;
            return;
        }
        var next = new Date(
            inviteCal.selected.getFullYear(),
            inviteCal.selected.getMonth(),
            inviteCal.selected.getDate(),
            hours,
            minutes,
            0,
            0
        );
        if (next.getTime() <= Date.now()) {
            renderInviteCal();
            return;
        }
        inviteCal.hours = hours;
        inviteCal.minutes = minutes;
        inviteCal.selected = next;
        syncInviteExpiry();
    }

    function openInviteModal(item) {
        var folder = item || activeItem;
        if (!folder) {
            alert('Open a folder before inviting a member.');
            return;
        }
        var menu = '';
        var submenu = '';
        if (folder.kind === 'category') {
            menu = folder.name || '';
        } else if (folder.kind === 'department') {
            menu = page.getAttribute('data-menu') || '';
            submenu = folder.name || '';
        }
        if (!folder.id && !menu) {
            alert('Open a folder before inviting a member.');
            return;
        }
        inviteTarget = {
            id: folder.id || '',
            name: folder.name || 'this folder',
            kind: folder.kind || 'folder',
            menu: menu,
            submenu: submenu
        };
        document.getElementById('libInviteMsg').hidden = true;
        document.getElementById('libInviteForm').reset();
        resetInviteExpiry();
        document.getElementById('libInviteModal').hidden = false;
        document.getElementById('libInviteEmail').focus();
    }

    window.qmsOpenInvite = function (folderId, name) {
        openInviteModal({ id: folderId, name: name || 'this folder' });
    };

    function openShareModal() {
        if (!activeItem) return;
        if (activeItem.kind !== 'folder' && activeItem.kind !== 'document') {
            alert('Open a folder or file before sharing it.');
            return;
        }
        document.getElementById('libShareHint').textContent = 'Send "' + activeItem.name + '" to an email address.';
        document.getElementById('libShareMsg').hidden = true;
        document.getElementById('libShareForm').reset();
        document.getElementById('libShareModal').hidden = false;
        document.getElementById('libShareEmail').focus();
    }

    function openRowMenu(btn, item) {
        activeItem = item;
        var isFile = item.kind === 'document';
        var recycled = page.getAttribute('data-filter') === 'recycle';
        var actions;
        if (recycled) {
            actions = [{ key: 'restore', label: 'Restore', icon: 'fa-undo' }];
            if (isFile && item.download) actions.push({ key: 'download', label: 'Download', icon: 'fa-download' });
            actions.push({ key: 'purge', label: 'Delete permanently', icon: 'fa-trash', danger: true });
        } else if (item.kind === 'request') {
            actions = [
                { key: 'approve', label: 'Approve access', icon: 'fa-check' },
                { key: 'deny', label: 'Deny access', icon: 'fa-times', danger: true }
            ];
        } else if (item.locked) {
            actions = [];
            if (item.canRequest) actions.push({ key: 'request', label: 'Request access', icon: 'fa-unlock' });
            if (isLibraryFolder(item) && (item.id || item.kind !== 'folder') && sysCanInvite()) {
                actions.push({ key: 'invite', label: 'Invite member', icon: 'fa-user-plus' });
            }
        } else if (isFile && item.isCurrent === false) {
            actions = [
                { key: 'view', label: 'View', icon: 'fa-eye' }
            ];
            if (canOpenInApp(item)) actions.push({ key: 'open-app', label: 'Open in app', icon: 'fa-desktop' });
            if (item.id) actions.push({ key: 'history', label: 'Version history', icon: 'fa-history' });
            if (item.download) actions.push({ key: 'download', label: 'Download', icon: 'fa-download' });
        } else {
            actions = [
                isFile
                    ? { key: 'view', label: 'View', icon: 'fa-eye' }
                    : { key: 'open', label: 'Open', icon: 'fa-folder-open' }
            ];
            if (canOpenInApp(item)) actions.push({ key: 'open-app', label: 'Open in app', icon: 'fa-desktop' });
            if (item.id && (isFile || item.kind === 'folder') && item.canEdit !== false) {
                actions.push({ key: 'rename', label: 'Rename', icon: 'fa-pencil' });
            }
            if (item.kind === 'folder' && item.id) {
                actions.push({ key: 'access', label: 'Who has access', icon: 'fa-user-lock' });
            }
            if (isLibraryFolder(item) && sysCanInvite() && (item.id || item.kind === 'category' || item.kind === 'department')) {
                actions.push({ key: 'invite', label: 'Invite member', icon: 'fa-user-plus' });
            }
            if (canUpdateFile(item)) actions.push({ key: 'update', label: 'Update file', icon: 'fa-upload' });
            if (isFile && item.id) actions.push({ key: 'history', label: 'Version history', icon: 'fa-history' });
            if (isFile && item.download && item.canView !== false) actions.push({ key: 'download', label: 'Download', icon: 'fa-download' });
            if (item.canEdit !== false) {
                actions.push({ key: 'copy', label: 'Copy to', icon: 'fa-copy' });
                actions.push({ key: 'move', label: 'Move to', icon: 'fa-arrow-right' });
            }
            if (isFile && item.canShare !== false) actions.push({ key: 'share', label: 'Share through mail', icon: 'fa-envelope' });
            if (item.canDelete !== false) actions.push({ key: 'delete', label: 'Delete', icon: 'fa-trash', danger: true });
        }
        rowMenu.innerHTML = actions.map(function (action) {
            return '<button type="button" data-action="' + action.key + '"' + (action.danger ? ' class="is-danger"' : '') + '><i class="fa ' + action.icon + '"></i> ' + action.label + '</button>';
        }).join('');
        rowMenu.hidden = false;
        var rect = btn.getBoundingClientRect();
        var menuHeight = rowMenu.offsetHeight || 240;
        var menuWidth = rowMenu.offsetWidth || 220;
        var top = rect.bottom + 6;
        if (top + menuHeight > window.innerHeight - 8) top = rect.top - menuHeight - 6;
        if (top < 8) top = 8;
        if (top + menuHeight > window.innerHeight - 8) top = Math.max(8, window.innerHeight - menuHeight - 8);
        var left = rect.right - menuWidth;
        if (left < 8) left = 8;
        if (left + menuWidth > window.innerWidth - 8) left = Math.max(8, window.innerWidth - menuWidth - 8);
        rowMenu.style.top = top + 'px';
        rowMenu.style.left = left + 'px';
    }

    document.addEventListener('click', function (e) {
        var viewTrigger = e.target.closest('.lib-open-view');
        if (viewTrigger) {
            e.preventDefault();
            e.stopPropagation();
            closeRowMenu();
            closeMenus();
            var viewItem = currentSlice[Number(viewTrigger.getAttribute('data-i'))];
            if (canPreview(viewItem)) openPreview(viewItem);
            return;
        }
        if (e.target.closest('.lib-row-menu')) return;
        closeRowMenu();
        var actionBtn = e.target.closest('.lib-row-actions');
        if (actionBtn) {
            e.preventDefault();
            e.stopPropagation();
            var item = currentSlice[Number(actionBtn.getAttribute('data-i'))];
            if (item) openRowMenu(actionBtn, item);
            return;
        }
        var split = e.target.closest('.lib-split');
        if (split && split.getAttribute('data-menu')) {
            if (e.target.closest('.lib-menu')) return;
            toggleMenu(split.getAttribute('data-menu'));
            return;
        }
        closeMenus();
    });

    rowMenu.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-action]');
        if (!btn || !activeItem) return;
        var action = btn.getAttribute('data-action');
        var item = activeItem;
        closeRowMenu();
        if (action === 'open') {
            if (item.href && item.href !== '#') window.location.href = item.href;
            return;
        }
        if (action === 'view') {
            openPreview(item);
            return;
        }
        if (action === 'open-app') {
            openInApp(item);
            return;
        }
        if (action === 'access') {
            if (item.id && window.qmsOpenAccessPanel) window.qmsOpenAccessPanel(item.id);
            return;
        }
        if (action === 'request') {
            if (item.id && window.qmsRequestFolderAccess) window.qmsRequestFolderAccess(item.id);
            return;
        }
        if (action === 'approve' || action === 'deny') {
            if (!item.folderId || !item.id) return;
            postJson('/folders/' + item.folderId + '/access-requests/' + item.id + '/decide', { decision: action === 'approve' ? 'approved' : 'denied' })
                .then(function () { window.location.reload(); })
                .catch(function (err) { alert(err.message || 'Unable to update the request.'); });
            return;
        }
        if (action === 'update') {
            openUpdateEditor(item);
            return;
        }
        if (action === 'history') {
            if (item.id && window.qmsOpenVersionHistory) window.qmsOpenVersionHistory(item.id, item.name);
            return;
        }
        if (action === 'download') {
            if (item.download) window.location.href = item.download;
            return;
        }
        if (action === 'duplicate') {
            if (!item.id) return;
            postJson('/library/duplicate', {
                id: item.id,
                source_folder_id: page.getAttribute('data-folder') || ''
            }).then(function () { window.location.reload(); })
                .catch(function (err) { alert(err.message || 'Unable to duplicate this file.'); });
            return;
        }
        if (action === 'rename') {
            openRenameModal();
            return;
        }
        if (action === 'restore') {
            if (!item.id) return;
            postJson('/library/restore', { kind: item.kind, id: item.id })
                .then(function () { window.location.reload(); })
                .catch(function (err) { alert(err.message || 'Unable to restore this item.'); });
            return;
        }
        if (action === 'purge') {
            openDeleteModal(item, 'purge');
            return;
        }
        if (action === 'copy' || action === 'move') {
            openPlaceModal(action);
            return;
        }
        if (action === 'invite') {
            openInviteModal(item);
            return;
        }
        if (action === 'share') {
            openShareModal();
            return;
        }
        if (action === 'delete') {
            var locationFolder = item && (item.kind === 'category' || item.kind === 'department');
            if (!locationFolder && !needsStoredItem(item)) {
                alert('Open a folder or file before deleting it.');
                return;
            }
            openDeleteModal(item, 'delete');
        }
    });

    document.querySelectorAll('#libFilterMenu [data-filter-kind]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            state.kind = btn.getAttribute('data-filter-kind');
            state.page = 1;
            document.querySelectorAll('#libFilterMenu [data-filter-kind]').forEach(function (el) {
                el.classList.toggle('is-active', el === btn);
            });
            render();
        });
    });

    document.querySelectorAll('#libSortMenu [data-sort]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var key = btn.getAttribute('data-sort');
            if (state.sort === key) state.dir = state.dir === 'asc' ? 'desc' : 'asc';
            else { state.sort = key; state.dir = 'asc'; }
            document.querySelectorAll('#libSortMenu [data-sort]').forEach(function (el) {
                el.classList.toggle('is-active', el === btn);
            });
            render();
        });
    });

    document.querySelectorAll('.lib-table thead th[data-sort]').forEach(function (th) {
        th.addEventListener('click', function () {
            var key = th.getAttribute('data-sort');
            if (state.sort === key) state.dir = state.dir === 'asc' ? 'desc' : 'asc';
            else { state.sort = key; state.dir = 'asc'; }
            render();
        });
    });

    document.querySelectorAll('.lib-view-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            state.view = btn.getAttribute('data-view');
            document.querySelectorAll('.lib-view-btn').forEach(function (el) {
                el.classList.toggle('is-active', el === btn);
            });
            render();
        });
    });

    prevBtn.addEventListener('click', function () { if (state.page > 1) { state.page -= 1; render(); } });
    nextBtn.addEventListener('click', function () { state.page += 1; render(); });

    if (searchInput) {
        var timer = null;
        searchInput.addEventListener('input', function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                state.q = searchInput.value.trim();
                state.page = 1;
                render();
            }, 160);
        });
        state.q = searchInput.value.trim();
    }

    function openFolderModal() {
        var modal = document.getElementById('libFolderModal');
        var hint = document.getElementById('libFolderHint');
        var msg = document.getElementById('libFolderMsg');
        var menu = page.getAttribute('data-menu') || '';
        var submenu = page.getAttribute('data-submenu') || '';
        if (menu && submenu) hint.textContent = 'Create a folder in ' + menu + ' / ' + submenu + '.';
        else if (menu) hint.textContent = 'Create a folder in ' + menu + '.';
        else hint.textContent = 'Create a folder.';
        document.getElementById('libFolderForm').querySelector('button[type="submit"]').disabled = false;
        msg.hidden = true;
        modal.hidden = false;
        document.getElementById('libFolderName').focus();
    }

    function closeFolderModal() {
        document.getElementById('libFolderModal').hidden = true;
        document.getElementById('libFolderForm').reset();
    }

    function openUploadHintModal() {
        var modal = document.getElementById('libUploadHintModal');
        if (modal) modal.hidden = false;
    }

    function closeUploadHintModal() {
        var modal = document.getElementById('libUploadHintModal');
        if (modal) modal.hidden = true;
    }

    function startUpload(e) {
        e.preventDefault();
        e.stopPropagation();
        closeMenus();
        if (page.getAttribute('data-can-create') !== '1') {
            alert('Your user role cannot upload documents.');
            return;
        }
        var folder = page.getAttribute('data-folder') || '';
        if (!folder) {
            openUploadHintModal();
            return;
        }
        document.getElementById('libUploadInput').click();
    }

    ['libNewBtn', 'libNewFolderBtn', 'libNewFolderMenu'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('click', function (e) {
            e.preventDefault();
            openFolderModal();
        });
    });
    ['libUploadBtn', 'libUploadText', 'libUploadHint'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('click', startUpload);
    });
    document.getElementById('libUploadInput').addEventListener('change', function () {
        var input = document.getElementById('libUploadInput');
        var folder = page.getAttribute('data-folder') || '';
        if (!input.files || !input.files.length) return;
        if (folder) uploadFiles(folder, input.files);
        else openUploadHintModal();
        input.value = '';
    });
    document.getElementById('libPlaceTree').addEventListener('click', function (e) {
        var btn = e.target.closest('.lib-tree-item');
        if (!btn) return;
        selectedDest = btn.getAttribute('data-dest') || '';
        document.getElementById('libPlaceDest').value = selectedDest;
        document.querySelectorAll('.lib-tree-item').forEach(function (el) {
            el.classList.toggle('is-selected', el === btn);
        });
    });
    document.getElementById('libPlaceCancel').addEventListener('click', function () {
        document.getElementById('libPlaceModal').hidden = true;
    });
    document.getElementById('libPlaceModal').addEventListener('click', function (e) {
        if (e.target.id === 'libPlaceModal') document.getElementById('libPlaceModal').hidden = true;
    });
    document.getElementById('libPlaceForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = document.getElementById('libPlaceMsg');
        var dest = selectedDest || document.getElementById('libPlaceDest').value;
        if (!activeItem || !dest) {
            msg.className = 'lib-modal-msg is-err';
            msg.textContent = 'Choose a destination folder.';
            msg.hidden = false;
            return;
        }
        postJson('/folders/transfer', {
            mode: placeMode,
            kind: activeItem.kind,
            id: activeItem.id,
            destination_id: dest,
            source_folder_id: page.getAttribute('data-folder') || ''
        }).then(function () {
            window.location.reload();
        }).catch(function (err) {
            msg.className = 'lib-modal-msg is-err';
            msg.textContent = err.message || 'Unable to complete that action.';
            msg.hidden = false;
        });
    });

    var inviteCancel = document.getElementById('libInviteCancel');
    if (inviteCancel) {
        inviteCancel.addEventListener('click', function () {
            closeInviteCal();
            document.getElementById('libInviteModal').hidden = true;
        });
    }
    var inviteModal = document.getElementById('libInviteModal');
    if (inviteModal) {
        inviteModal.addEventListener('click', function (e) {
            if (e.target.id === 'libInviteModal') {
                closeInviteCal();
                document.getElementById('libInviteModal').hidden = true;
            }
        });
    }
    var inviteExpireBtn = document.getElementById('libInviteExpireBtn');
    if (inviteExpireBtn) {
        inviteExpireBtn.addEventListener('click', function () {
            var cal = document.getElementById('libInviteCal');
            if (cal && !cal.hidden) closeInviteCal();
            else openInviteCal();
        });
    }
    var inviteExpireClear = document.getElementById('libInviteExpireClear');
    if (inviteExpireClear) {
        inviteExpireClear.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            inviteCal.selected = null;
            inviteCal.hours = 18;
            inviteCal.minutes = 0;
            syncInviteExpiry();
            renderInviteCal();
        });
    }
    var inviteCalEl = document.getElementById('libInviteCal');
    if (inviteCalEl) {
        inviteCalEl.addEventListener('click', function (e) {
            var nav = e.target.closest('[data-cal-nav]');
            if (nav && !nav.disabled) {
                var step = parseInt(nav.getAttribute('data-cal-nav'), 10) || 0;
                inviteCal.view = new Date(inviteCal.view.getFullYear(), inviteCal.view.getMonth() + step, 1);
                renderInviteCal();
                return;
            }
            var dayBtn = e.target.closest('[data-cal-day]');
            if (dayBtn && !dayBtn.disabled) {
                pickInviteDay(inviteCal.view.getFullYear(), inviteCal.view.getMonth(), parseInt(dayBtn.getAttribute('data-cal-day'), 10));
                return;
            }
            var action = e.target.closest('[data-cal-action]');
            if (!action) return;
            var kind = action.getAttribute('data-cal-action');
            if (kind === 'clear') {
                inviteCal.selected = null;
                inviteCal.hours = 18;
                inviteCal.minutes = 0;
                syncInviteExpiry();
                renderInviteCal();
                return;
            }
            if (kind === 'today') {
                var slot = inviteNextSlot(new Date());
                inviteCal.hours = slot.getHours();
                inviteCal.minutes = slot.getMinutes() - (slot.getMinutes() % 15);
                pickInviteDay(slot.getFullYear(), slot.getMonth(), slot.getDate());
                return;
            }
            if (kind === 'done') closeInviteCal();
        });
        inviteCalEl.addEventListener('change', function (e) {
            if (e.target && e.target.closest('#libInviteHour, #libInviteMinute, #libInviteMeridiem')) applyInviteTime();
        });
    }
    document.addEventListener('keydown', function (e) {
        var cal = document.getElementById('libInviteCal');
        if ((e.key === 'Escape' || e.keyCode === 27) && cal && !cal.hidden) {
            e.preventDefault();
            closeInviteCal();
        }
    });
    document.addEventListener('mousedown', function (e) {
        var cal = document.getElementById('libInviteCal');
        if (!cal || cal.hidden) return;
        if (e.target.closest('#libInviteCal, #libInviteExpireBtn, #libInviteExpireClear')) return;
        closeInviteCal();
    });
    window.addEventListener('resize', function () {
        var cal = document.getElementById('libInviteCal');
        if (cal && !cal.hidden) positionInviteCal();
    });
    var inviteForm = document.getElementById('libInviteForm');
    if (inviteForm) {
        inviteForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var msg = document.getElementById('libInviteMsg');
            var email = document.getElementById('libInviteEmail').value.trim();
            var submitBtn = document.querySelector('#libInviteForm button[type="submit"]');
            var folderId = inviteTarget && inviteTarget.id;
            var roleValue = document.getElementById('libInviteRole').value;
            var deptEl = document.getElementById('libInviteDept');
            var visEl = document.getElementById('libInviteVisibility');
            if ((!folderId && !(inviteTarget && inviteTarget.menu)) || !email || !roleValue || !deptEl || !deptEl.value || !visEl || !visEl.value) {
                msg.className = 'lib-modal-msg is-err';
                msg.textContent = 'Email address, role, department, and visibility are required.';
                msg.hidden = false;
                return;
            }
            if (inviteCal.selected && inviteCal.selected.getTime() <= Date.now()) {
                msg.className = 'lib-modal-msg is-err';
                msg.textContent = 'Choose an expiry date and time in the future.';
                msg.hidden = false;
                openInviteCal();
                return;
            }
            closeInviteCal();
            msg.hidden = true;
            if (submitBtn) submitBtn.disabled = true;
            var payload = {
                email: email,
                access_role: roleValue,
                department: deptEl ? deptEl.value : '',
                visibility: visEl.value,
                expires_at: document.getElementById('libInviteExpiry').value,
                menu: inviteTarget.menu || '',
                submenu: inviteTarget.submenu || '',
                folder_name: inviteTarget.name || ''
            };
            var url = folderId ? '/folders/' + folderId + '/invite' : '/library/invite';
            postJson(url, payload).then(function (data) {
                if (submitBtn) submitBtn.disabled = false;
                msg.className = 'lib-modal-msg is-ok';
                msg.textContent = (data && data.message) || ('Invite sent to ' + email + '.');
                msg.hidden = false;
                setTimeout(function () {
                    document.getElementById('libInviteModal').hidden = true;
                }, 900);
            }).catch(function (err) {
                if (submitBtn) submitBtn.disabled = false;
                msg.className = 'lib-modal-msg is-err';
                msg.textContent = err.message || 'Unable to send the invite.';
                msg.hidden = false;
            });
        });
    }
    var headerInvite = document.getElementById('libInviteBtn');
    if (headerInvite) {
        headerInvite.addEventListener('click', function () {
            openInviteModal({
                id: page.getAttribute('data-folder'),
                name: page.getAttribute('data-folder-name') || 'this folder'
            });
        });
    }

    document.getElementById('libShareCancel').addEventListener('click', function () {
        document.getElementById('libShareModal').hidden = true;
    });
    document.getElementById('libShareModal').addEventListener('click', function (e) {
        if (e.target.id === 'libShareModal') document.getElementById('libShareModal').hidden = true;
    });
    document.getElementById('libShareForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = document.getElementById('libShareMsg');
        var email = document.getElementById('libShareEmail').value.trim();
        var submitBtn = document.querySelector('#libShareForm button[type="submit"]');
        if (!activeItem || !email) return;
        if (activeItem.kind !== 'document' || !activeItem.id) {
            msg.className = 'lib-modal-msg is-err';
            msg.textContent = 'Choose a file to share by email.';
            msg.hidden = false;
            return;
        }
        msg.hidden = true;
        if (submitBtn) submitBtn.disabled = true;
        postJson('/library/documents/' + activeItem.id + '/share-mail', {
            email: email,
            expires_at: document.getElementById('libShareExpiry').value
        }).then(function (data) {
            if (submitBtn) submitBtn.disabled = false;
            msg.className = 'lib-modal-msg is-ok';
            msg.textContent = (data && data.message) || ('Share email sent to ' + email + '.');
            msg.hidden = false;
            setTimeout(function () {
                document.getElementById('libShareModal').hidden = true;
            }, 900);
        }).catch(function (err) {
            if (submitBtn) submitBtn.disabled = false;
            msg.className = 'lib-modal-msg is-err';
            msg.textContent = err.message || 'Unable to send the share email.';
            msg.hidden = false;
        });
    });

    function closeDeleteModal() {
        document.getElementById('libDeleteModal').hidden = true;
    }
    document.getElementById('libDeleteCancel').addEventListener('click', closeDeleteModal);
    document.getElementById('libDeleteModal').addEventListener('click', function (e) {
        if (e.target.id === 'libDeleteModal') closeDeleteModal();
    });
    document.getElementById('libDeleteConfirm').addEventListener('click', function () {
        var isLocation = activeItem && (activeItem.kind === 'category' || activeItem.kind === 'department');
        if (!activeItem || (!isLocation && !activeItem.id)) return;
        var btn = document.getElementById('libDeleteConfirm');
        var msg = document.getElementById('libDeleteMsg');
        var mode = btn.getAttribute('data-mode');
        btn.disabled = true;
        var request = mode === 'purge'
            ? postJson('/library/purge', { kind: activeItem.kind, id: activeItem.id })
            : (isLocation
                ? postJson('/library/location/delete', {
                    kind: activeItem.kind,
                    menu: activeItem.menu || (activeItem.kind === 'category' ? activeItem.name : ''),
                    submenu: activeItem.kind === 'department' ? (activeItem.submenu || activeItem.name) : ''
                })
                : (activeItem.kind === 'folder'
                    ? postJson('/folders/' + activeItem.id + '/delete', {})
                    : postJson('/library/documents/' + activeItem.id + '/delete', {})));
        request.then(function () {
            window.location.reload();
        }).catch(function (err) {
            btn.disabled = false;
            msg.textContent = err.message || 'Unable to delete.';
            msg.hidden = false;
        });
    });
    document.addEventListener('keydown', function (e) {
        if ((e.key === 'Escape' || e.keyCode === 27) && !document.getElementById('libDeleteModal').hidden) {
            closeDeleteModal();
        }
    });

    document.getElementById('libRenameCancel').addEventListener('click', function () {
        document.getElementById('libRenameModal').hidden = true;
    });
    document.getElementById('libRenameModal').addEventListener('click', function (e) {
        if (e.target.id === 'libRenameModal') document.getElementById('libRenameModal').hidden = true;
    });
    document.getElementById('libRenameForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = document.getElementById('libRenameMsg');
        var name = document.getElementById('libRenameName').value.trim();
        if (!activeItem || !name) return;
        postJson('/library/rename', { kind: activeItem.kind, id: activeItem.id, name: name })
            .then(function () { window.location.reload(); })
            .catch(function (err) {
                msg.className = 'lib-modal-msg is-err';
                msg.textContent = err.message || 'Unable to rename.';
                msg.hidden = false;
            });
    });

    function uploadToLocation(menu, submenu, fileList) {
        var files = Array.prototype.slice.call(fileList || []);
        if (!menu || !files.length) return;
        var index = 0;
        function next() {
            if (index >= files.length) {
                window.location.reload();
                return;
            }
            var body = new FormData();
            body.append('doc_file', files[index]);
            index += 1;
            var url = '/library/upload?menu=' + encodeURIComponent(menu) + '&submenu=' + encodeURIComponent(submenu || '');
            fetch(url, {
                method: 'POST',
                body: body,
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' }
            }).then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
                .then(function (result) {
                    if (!result.ok || !result.data.success) {
                        throw new Error((result.data && result.data.message) || 'Unable to upload document.');
                    }
                    next();
                })
                .catch(function (err) {
                    alert(err.message || 'Unable to upload document.');
                });
        }
        next();
    }

    function uploadFiles(folderId, fileList) {
        var files = Array.prototype.slice.call(fileList || []);
        if (!folderId || !files.length) return;
        var index = 0;
        function next() {
            if (index >= files.length) {
                window.location.reload();
                return;
            }
            var body = new FormData();
            body.append('doc_file', files[index]);
            index += 1;
            fetch('/folders/' + encodeURIComponent(folderId) + '/upload', {
                method: 'POST',
                body: body,
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' }
            }).then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
                .then(function (result) {
                    if (!result.ok || !result.data.success) {
                        throw new Error((result.data && result.data.message) || 'Unable to upload document.');
                    }
                    next();
                })
                .catch(function (err) {
                    alert(err.message || 'Unable to upload document.');
                });
        }
        next();
    }

    var dropZone = document.getElementById('libDrop');
    var dropDepth = 0;
    page.addEventListener('dragenter', function (e) {
        if (!e.dataTransfer || [].indexOf.call(e.dataTransfer.types || [], 'Files') === -1) return;
        dropDepth += 1;
        e.preventDefault();
        dropZone.hidden = false;
    });
    page.addEventListener('dragover', function (e) {
        if (!e.dataTransfer || [].indexOf.call(e.dataTransfer.types || [], 'Files') === -1) return;
        e.preventDefault();
        dropZone.hidden = false;
    });
    page.addEventListener('dragleave', function () {
        dropDepth = Math.max(0, dropDepth - 1);
        if (!dropDepth) dropZone.hidden = true;
    });
    page.addEventListener('drop', function (e) {
        if (!e.dataTransfer) return;
        e.preventDefault();
        dropDepth = 0;
        dropZone.hidden = true;
        var row = e.target.closest('tr[data-kind="folder"]');
        var folderId = row && row.getAttribute('data-id') ? row.getAttribute('data-id') : (page.getAttribute('data-folder') || '');
        if (!folderId) {
            openUploadHintModal();
            return;
        }
        var target = currentSlice.filter(function (item) { return item.kind === 'folder' && String(item.id) === String(folderId); })[0];
        if (target && target.canUpload === false) {
            alert('You do not have permission to upload into this folder.');
            return;
        }
        uploadFiles(folderId, e.dataTransfer.files);
    });

    function openUpdateChoice(item) {
        if (!canUpdateFile(item)) {
            alert('This file cannot be updated here.');
            return;
        }
        pendingUpdate.item = item;
        pendingUpdate.mode = '';
        var modal = document.getElementById('libUpdateChoiceModal');
        var text = document.getElementById('libUpdateChoiceText');
        var msg = document.getElementById('libUpdateChoiceMsg');
        var ver = item.version || '1.0';
        if (text) {
            text.textContent = 'How should “' + (item.name || 'this document') + '” (v' + ver + ') be updated?';
        }
        if (msg) {
            msg.hidden = true;
            msg.textContent = '';
        }
        if (modal) {
            if (modal.parentElement !== document.body) document.body.appendChild(modal);
            modal.hidden = false;
        }
    }

    function closeUpdateChoice() {
        var modal = document.getElementById('libUpdateChoiceModal');
        if (modal) modal.hidden = true;
    }

    function startReplacePicker(mode) {
        saveEditedDocument(mode === 'current' ? 'current' : 'new');
    }

    function saveEditedDocument(mode) {
        if (!pendingUpdate.item) return;
        pendingUpdate.mode = mode === 'current' ? 'current' : 'new';
        if (!window.qmsDocEditor || !window.qmsDocEditor.toFile) {
            showUpdateError('The document editor is not available.');
            return;
        }
        var keepBtn = document.getElementById('libUpdateKeepCurrent');
        var newBtn = document.getElementById('libUpdateNewVersion');
        if (keepBtn) keepBtn.disabled = true;
        if (newBtn) newBtn.disabled = true;
        window.qmsDocEditor.toFile().then(function (file) {
            return uploadReplacement([file]);
        }).catch(function (err) {
            if (keepBtn) keepBtn.disabled = false;
            if (newBtn) newBtn.disabled = false;
            showUpdateError(err.message || 'Unable to save this document.');
        });
    }

    function showUpdateError(message) {
        var modal = document.getElementById('libUpdateChoiceModal');
        var msg = document.getElementById('libUpdateChoiceMsg');
        if (msg) {
            msg.className = 'lib-modal-msg is-err';
            msg.textContent = message || 'Unable to update this file.';
            msg.hidden = false;
        }
        if (modal) modal.hidden = false;
    }

    function uploadReplacement(fileList) {
        var item = pendingUpdate.item;
        var mode = pendingUpdate.mode || 'new';
        var files = Array.prototype.slice.call(fileList || []);
        if (!item || !item.id || !files.length) return;
        var ext = String(files[0].name || '').split('.').pop().toLowerCase();
        if (['doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx'].indexOf(ext) === -1) {
            showUpdateError('Upload a Word, PDF, PowerPoint, or Excel file.');
            return;
        }
        var body = new FormData();
        body.append('doc_file', files[0]);
        body.append('mode', mode);
        fetch('/library/documents/' + encodeURIComponent(item.id) + '/update?mode=' + encodeURIComponent(mode), {
            method: 'POST',
            body: body,
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        }).then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
            .then(function (result) {
                if (!result.ok || !result.data.success) {
                    throw new Error((result.data && result.data.message) || 'Unable to update this file.');
                }
                closeUpdateChoice();
                if (window.qmsHideViewModal) window.qmsHideViewModal();
                window.location.reload();
            })
            .catch(function (err) {
                var keepBtn = document.getElementById('libUpdateKeepCurrent');
                var newBtn = document.getElementById('libUpdateNewVersion');
                if (keepBtn) keepBtn.disabled = false;
                if (newBtn) newBtn.disabled = false;
                showUpdateError(err.message || 'Unable to update this file.');
            });
    }

    window.qmsStartFileUpdate = function (itemOrId) {
        var item = itemOrId && typeof itemOrId === 'object' ? itemOrId : findDocItem(itemOrId);
        openUpdateEditor(item);
    };

    var uploadHintModal = document.getElementById('libUploadHintModal');
    var uploadHintOk = document.getElementById('libUploadHintOk');
    var openAppModal = document.getElementById('libOpenAppModal');
    var openAppOk = document.getElementById('libOpenAppOk');
    var openAppDownload = document.getElementById('libOpenAppDownload');
    if (uploadHintOk) uploadHintOk.addEventListener('click', closeUploadHintModal);
    if (uploadHintModal) {
        uploadHintModal.addEventListener('click', function (e) {
            if (e.target.id === 'libUploadHintModal') closeUploadHintModal();
        });
    }
    if (openAppOk) openAppOk.addEventListener('click', closeOpenAppModal);
    if (openAppDownload) {
        openAppDownload.addEventListener('click', function () {
            var item = pendingOpenApp;
            closeOpenAppModal();
            if (item && item.download) window.location.href = item.download;
        });
    }
    if (openAppModal) {
        openAppModal.addEventListener('click', function (e) {
            if (e.target.id === 'libOpenAppModal') closeOpenAppModal();
        });
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && uploadHintModal && !uploadHintModal.hidden) closeUploadHintModal();
        if (e.key === 'Escape' && openAppModal && !openAppModal.hidden) closeOpenAppModal();
        if (e.key === 'Escape' && updateChoiceModal && !updateChoiceModal.hidden) closeUpdateChoice();
    });

    var updateChoiceModal = document.getElementById('libUpdateChoiceModal');
    var updateKeepBtn = document.getElementById('libUpdateKeepCurrent');
    var updateNewBtn = document.getElementById('libUpdateNewVersion');
    var updateCancelBtn = document.getElementById('libUpdateChoiceCancel');
    var replaceInput = document.getElementById('libReplaceInput');
    var viewUpdateBtn = document.getElementById('qmsViewUpdate');
    var viewSaveBtn = document.getElementById('qmsViewSave');
    if (updateKeepBtn) updateKeepBtn.addEventListener('click', function () { startReplacePicker('current'); });
    if (updateNewBtn) updateNewBtn.addEventListener('click', function () { startReplacePicker('new'); });
    if (updateCancelBtn) updateCancelBtn.addEventListener('click', closeUpdateChoice);
    if (updateChoiceModal) {
        updateChoiceModal.addEventListener('click', function (e) {
            if (e.target.id === 'libUpdateChoiceModal') closeUpdateChoice();
        });
    }
    if (replaceInput) {
        replaceInput.addEventListener('change', function () {
            uploadReplacement(replaceInput.files);
            replaceInput.value = '';
        });
    }
    if (viewUpdateBtn) {
        viewUpdateBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var item = lastPreviewItem || findDocItem(viewUpdateBtn.getAttribute('data-doc-id'));
            openUpdateEditor(item);
        });
    }
    if (viewSaveBtn) {
        viewSaveBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var item = pendingUpdate.item || lastPreviewItem || findDocItem(viewSaveBtn.getAttribute('data-doc-id') || (viewUpdateBtn && viewUpdateBtn.getAttribute('data-doc-id')));
            if (item) pendingUpdate.item = item;
            openUpdateChoice(item);
        });
    }

    document.getElementById('libFolderCancel').addEventListener('click', closeFolderModal);
    document.getElementById('libFolderModal').addEventListener('click', function (e) {
        if (e.target.id === 'libFolderModal') closeFolderModal();
    });

    document.getElementById('libFolderForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = document.getElementById('libFolderMsg');
        var payload = {
            menu: page.getAttribute('data-menu'),
            submenu: page.getAttribute('data-submenu'),
            folder_name: document.getElementById('libFolderName').value,
            description: document.getElementById('libFolderDesc').value,
            parent_id: page.getAttribute('data-folder') || '',
            visibility: 'restricted',
            inherit_permissions: 1,
            lifecycle_status: 'draft'
        };
        fetch('/folders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'same-origin'
        }).then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
            .then(function (result) {
                if (!result.ok || !result.data.success) {
                    throw new Error((result.data && result.data.message) || 'Unable to create folder.');
                }
                window.location.reload();
            })
            .catch(function (err) {
                msg.className = 'lib-modal-msg is-err';
                msg.textContent = err.message || 'Unable to create folder.';
                msg.hidden = false;
            });
    });

    render();

    var openId = '';
    try { openId = new URLSearchParams(window.location.search).get('open') || ''; } catch (e) { openId = ''; }
    if (openId) {
        var openTarget = items.filter(function (item) {
            return item.kind === 'document' && String(item.id) === String(openId) && item.isCurrent !== false && !item.locked;
        })[0];
        if (openTarget) {
            setTimeout(function () { openPreview(openTarget); }, 250);
        }
        if (window.history && window.history.replaceState) {
            try {
                var cleaned = new URL(window.location.href);
                cleaned.searchParams.delete('open');
                window.history.replaceState({}, '', cleaned.pathname + cleaned.search + cleaned.hash);
            } catch (err) {}
        }
    }
})();
