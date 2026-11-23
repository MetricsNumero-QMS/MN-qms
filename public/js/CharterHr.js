//Loader 
// $(function(){
//     $('body').Wload({text:' Loading'});
//     $('body').Wload('hide',{time:1000});
// })


$(document).ready(function() {  
       

    //To hide the url parameter value
    if ($('#filtertable').length && location.href.includes('?')) {         
        var myNewURL = "category";
        window.history.pushState({}, document.title, "/" + myNewURL );
    }

    if ($('#filtertable').length) {
    $('body').addClass('qms-cat-lock');
    try {
    var dataTable = $('#filtertable').DataTable({
        pageLength: 10,
        paging: true,
        lengthChange: false,
        searching: true,
        info: true,
        autoWidth: false,
        ordering: true,
        order: [],
        columnDefs: [
            { orderable: false, targets: 'nosort' },
            { orderable: false, targets: -1, width: '200px', className: 'qms-dt-actions' }
        ],
        language: {
            emptyTable: "No documents found",
            zeroRecords: "No matching documents",
            info: "Showing _START_ to _END_ of _TOTAL_ documents",
            infoEmpty: "Showing 0 documents",
            infoFiltered: "(filtered from _MAX_ documents)",
            paginate: {
                previous: "‹",
                next: "›"
            }
        },
        dom: '<"qms-dt-scroll"t><"qms-dt-footer"ip>'
    });
    dataTable.columns.adjust();

    $("#filterbox").on("keyup input", function(){
        dataTable.search(this.value).draw();
    });

    //Saperate method for datepicker and input file as it is not working on pagination.
    //var table = $('#filtertable').DataTable();
    $('#filtertable').on('draw.dt', function () { 
        $('.selectedFile').off('change.qmseditfile').on('change.qmseditfile', function () {                    
            //To display input file name in another input text value
            var a = $('.selectedFile').val().toString().split('\\');
            $('.fakeInput').val(a[a.length - 1]);                
            //To Extract file name and display in  doc input
            var fileInput = document.getElementById('selectedFile');   
            var filename  = fileInput.files[0].name;
            var docName   = filename.split('.').slice(0, -1).join('.');   //To remove extension from the file name.          
            // var dcName    = docName.split('_').join(' '); //to remove _ from the file name.
            document.getElementById('editDocName').value =  filename;               
        }); 
    });
    } catch (dtErr) {
        console.log(dtErr);
    }
    }

    $('.selectedFile').on('change.qmseditfile', function () {                
        if (!this.files || !this.files[0]) return;
        var filename = this.files[0].name;
        $('.fakeInput').val(filename);
        $('#qmsEditFileLabel').text(filename);
        $('#myModalEdit .qms-file-drop').addClass('is-selected');
        var editName = document.getElementById('editDocName');
        if (editName) editName.value = filename;
    }); 
       
    //alert fade out option for file upload.
    $('.succmsg').delay(2000).fadeOut();
    
    //alert fade out method for password change.
    $('.pswdchmsg').delay(2000).fadeOut();

    function qmsResetUploadForm() {
        var form = document.getElementById('updateUser');
        if (form) form.reset();
        $('#qmsFileLabel').text('Choose a file');
        $('.qms-file-drop').removeClass('is-selected');
        qmsHideCal();
    }

    function qmsHideUploadModal() {
        qmsHideCal();
        $('#upldDoc').removeClass('is-open show in').hide().attr('aria-hidden', 'true');
        qmsResetUploadForm();
        if (!$('#myModalEdit').hasClass('is-open')) {
            $('.qms-upload-backdrop').remove();
        }
    }

    function qmsHideEditModal() {
        qmsHideCal();
        $('#myModalEdit').removeClass('is-open show in').hide().attr('aria-hidden', 'true');
        if (!$('#upldDoc').hasClass('is-open')) {
            $('.qms-upload-backdrop').remove();
        }
    }

    function qmsHideAllFormModals() {
        qmsHideCal();
        $('#upldDoc, #myModalEdit').removeClass('is-open show in').hide().attr('aria-hidden', 'true');
        $('.qms-upload-backdrop').remove();
        qmsResetUploadForm();
    }

    function qmsEnsureBackdrop() {
        if (!$('.qms-upload-backdrop').length) {
            $('<div class="qms-upload-backdrop"></div>').appendTo('body');
        }
    }

    function qmsShowEditModal() {
        qmsHideCal();
        $('#upldDoc').removeClass('is-open show in').hide().attr('aria-hidden', 'true');
        var $modal = $('#myModalEdit');
        if (!$modal.length) return;
        $modal.appendTo('body');
        if ($('#editDatepicker').hasClass('hasDatepicker')) {
            $('#editDatepicker').datepicker('destroy');
        }
        qmsEnsureBackdrop();
        $modal.addClass('is-open show in').css({
            display: 'block',
            opacity: 1,
            visibility: 'visible'
        }).attr('aria-hidden', 'false');
    }

    var qmsCalMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var qmsCalView = new Date();
    var qmsCalInput = '#datepicker';

    function qmsPad(n) {
        return n < 10 ? '0' + n : String(n);
    }

    function qmsFormatDate(d) {
        return qmsPad(d.getDate()) + '-' + qmsPad(d.getMonth() + 1) + '-' + d.getFullYear();
    }

    function qmsParseDate(str) {
        var p = String(str || '').split('-');
        if (p.length !== 3) return null;
        var day = parseInt(p[0], 10);
        var month = parseInt(p[1], 10) - 1;
        var year = parseInt(p[2], 10);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
        var d = new Date(year, month, day);
        return isNaN(d.getTime()) ? null : d;
    }

    function qmsSameDay(a, b) {
        return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    function qmsEnsureCal() {
        var $cal = $('#qmsCal');
        if ($cal.length) return $cal;
        $cal = $('<div class="qms-cal" id="qmsCal" hidden></div>');
        $('body').append($cal);
        return $cal;
    }

    function qmsHideCal() {
        $('#qmsCal').attr('hidden', true).removeClass('is-open');
    }

    function qmsPositionCal() {
        var $wrap = $(qmsCalInput).closest('.qms-date-wrap');
        var $cal = $('#qmsCal');
        if (!$wrap.length || !$cal.length) return;
        var rect = $wrap[0].getBoundingClientRect();
        var top = rect.bottom + 8;
        var left = rect.left;
        var calW = 308;
        if (left + calW > window.innerWidth - 12) {
            left = Math.max(12, window.innerWidth - calW - 12);
        }
        if (top + 340 > window.innerHeight) {
            top = Math.max(12, rect.top - 348);
        }
        $cal.css({ top: top + 'px', left: left + 'px' });
    }

    function qmsRenderCal() {
        var $cal = qmsEnsureCal();
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var selected = qmsParseDate($(qmsCalInput).val());
        var year = qmsCalView.getFullYear();
        var month = qmsCalView.getMonth();
        var first = new Date(year, month, 1);
        var startDay = first.getDay();
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var canNext = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth());
        var html = '';
        html += '<div class="qms-cal-head">';
        html += '<button type="button" class="qms-cal-nav" data-cal-nav="-1" aria-label="Previous month"><i class="fa fa-chevron-left"></i></button>';
        html += '<div class="qms-cal-title">' + qmsCalMonths[month] + ' ' + year + '</div>';
        html += '<button type="button" class="qms-cal-nav" data-cal-nav="1"' + (canNext ? '' : ' disabled') + ' aria-label="Next month"><i class="fa fa-chevron-right"></i></button>';
        html += '</div>';
        html += '<div class="qms-cal-week"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>';
        html += '<div class="qms-cal-grid">';
        var i;
        for (i = 0; i < startDay; i++) html += '<span class="qms-cal-empty"></span>';
        for (i = 1; i <= daysInMonth; i++) {
            var cell = new Date(year, month, i);
            var disabled = cell > today;
            var cls = 'qms-cal-day';
            if (disabled) cls += ' is-disabled';
            if (qmsSameDay(cell, today)) cls += ' is-today';
            if (selected && qmsSameDay(cell, selected)) cls += ' is-selected';
            html += '<button type="button" class="' + cls + '" data-cal-day="' + i + '"' + (disabled ? ' disabled' : '') + '>' + i + '</button>';
        }
        html += '</div>';
        html += '<div class="qms-cal-foot"><button type="button" class="qms-cal-today" data-cal-today="1">Today</button></div>';
        $cal.html(html);
        qmsPositionCal();
    }

    function qmsOpenCal(inputSel) {
        if (inputSel) qmsCalInput = inputSel;
        var $input = $(qmsCalInput);
        if ($input.hasClass('hasDatepicker')) {
            $input.datepicker('destroy');
        }
        var selected = qmsParseDate($input.val());
        qmsCalView = selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : new Date();
        var $cal = qmsEnsureCal();
        $cal.removeAttr('hidden').addClass('is-open');
        qmsRenderCal();
    }

    function qmsShowUploadModal() {
        var $modal = $('#upldDoc');
        if (!$modal.length) return;
        qmsHideCal();
        $('#myModalEdit').removeClass('is-open show in').hide().attr('aria-hidden', 'true');
        $modal.appendTo('body');
        if ($('#datepicker').hasClass('hasDatepicker')) {
            $('#datepicker').datepicker('destroy');
        }
        qmsEnsureBackdrop();
        $modal.addClass('is-open show in').css({
            display: 'block',
            opacity: 1,
            visibility: 'visible'
        }).attr('aria-hidden', 'false');
    }

    function qmsBumpVersion(value, bumpType) {
        var parts = String(value == null ? '1.0' : value).split('.');
        var major = parseInt(parts[0], 10);
        var minor = parseInt(parts[1], 10);
        if (isNaN(major) || major < 0) major = 1;
        if (isNaN(minor) || minor < 0) minor = 0;
        if (bumpType === 'major') {
            major += 1;
            minor = 0;
        } else {
            minor += 1;
        }
        return major + '.' + minor;
    }

    window.qmsApplyVersionBump = function (currentDoc, currentQms) {
        var doc = currentDoc || $('#docVerUpd').attr('data-current') || $('#docVerUpd').val() || '1.0';
        var qms = currentQms || $('#relsVerDoc').attr('data-current') || $('#relsVerDoc').val() || '1.0';
        $('#docVerUpd').attr('data-current', doc);
        $('#relsVerDoc').attr('data-current', qms);
        var bump = $('input[name="bumpType"]:checked').val() || 'minor';
        var nextDoc = qmsBumpVersion(doc, bump);
        var nextQms = qmsBumpVersion(qms, bump);
        $('#docVerUpd').val(nextDoc);
        $('#relsVerDoc').val(nextQms);
        $('#qmsMinorHint').text('(' + qmsBumpVersion(doc, 'minor') + ' / QMS ' + qmsBumpVersion(qms, 'minor') + ')');
        $('#qmsMajorHint').text('(' + qmsBumpVersion(doc, 'major') + ' / QMS ' + qmsBumpVersion(qms, 'major') + ')');
    };

    $(document).off('change.qmsbump').on('change.qmsbump', 'input[name="bumpType"]', function () {
        if (typeof qmsApplyVersionBump === 'function') qmsApplyVersionBump();
    });

    $(document).off('click.qmsedit').on('click.qmsedit', '.qms-edit-file, button.edit', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var id = $(this).attr('data-id') || $(this).data('id');
        qmsShowEditModal();
        if (!id) return;
        $.ajax({
            url: '/getData',
            method: 'POST',
            data: { id: id },
            dataType: 'JSON',
            success: function (data) {
                var dataDet = data && data[0] ? data[0] : {};
                var relsDt = dataDet.releaseDt ? moment(dataDet.releaseDt).format('DD-MM-YYYY') : '';
                $('#editDocName').val(dataDet.doc_name || '');
                $('.old_doc_file').val(dataDet.doc || '');
                $('.doc_id').val(dataDet.doc_num || '');
                $('#fakeInput').val(dataDet.doc || '');
                $('#qmsEditFileLabel').text(dataDet.doc || 'Choose a file');
                $('#myModalEdit .qms-file-drop').toggleClass('is-selected', !!dataDet.doc);
                $('#relsVerDoc').val(dataDet.docRelVer || '');
                $('#editDocDesc').val(dataDet.docDesc || '');
                $('#docVerUpd').val(dataDet.version || '');
                $('#editDatepicker').val(relsDt);
                $('#changeComment').val('');
                $('input[name="bumpType"][value="minor"]').prop('checked', true);
                if (typeof qmsApplyVersionBump === 'function') qmsApplyVersionBump(dataDet.version, dataDet.docRelVer);
            }
        });
    });

    $(document).off('click.qmsupload').on('click.qmsupload', '.qms-upload-btn, #qmsOpenUpload', function (e) {
        e.preventDefault();
        e.stopPropagation();
        qmsShowUploadModal();
    });

    $(document).off('click.qmsuploadclose').on('click.qmsuploadclose', '#upldDoc [data-dismiss="modal"], #upldDoc .qms-form-close, #myModalEdit [data-dismiss="modal"], #myModalEdit .qms-form-close, .qms-upload-backdrop', function (e) {
        e.preventDefault();
        qmsHideAllFormModals();
    });

    $(document).off('keydown.qmsupload').on('keydown.qmsupload', function (e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            if ($('#qmsCal').hasClass('is-open')) {
                qmsHideCal();
                return;
            }
            if ($('#upldDoc').hasClass('is-open') || $('#myModalEdit').hasClass('is-open')) {
                qmsHideAllFormModals();
            }
        }
    });

    $(document).off('click.qmscal').on('click.qmscal', '#datepicker, #qmsDateTrigger, #editDatepicker, #qmsEditDateTrigger', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $wrap = $(this).closest('.qms-date-wrap');
        var inputId = $wrap.find('input.rlsDate').attr('id') || 'datepicker';
        var inputSel = '#' + inputId;
        if ($('#qmsCal').hasClass('is-open') && qmsCalInput === inputSel) {
            qmsHideCal();
        } else {
            qmsOpenCal(inputSel);
        }
    });

    $(document).off('click.qmcalnav').on('click.qmcalnav', '#qmsCal [data-cal-nav]', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var step = parseInt($(this).attr('data-cal-nav'), 10) || 0;
        qmsCalView = new Date(qmsCalView.getFullYear(), qmsCalView.getMonth() + step, 1);
        qmsRenderCal();
    });

    $(document).off('click.qmcalday').on('click.qmcalday', '#qmsCal [data-cal-day]', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if ($(this).prop('disabled')) return;
        var day = parseInt($(this).attr('data-cal-day'), 10);
        var picked = new Date(qmsCalView.getFullYear(), qmsCalView.getMonth(), day);
        $(qmsCalInput).val(qmsFormatDate(picked)).trigger('change');
        qmsHideCal();
    });

    $(document).off('click.qmcaltoday').on('click.qmcaltoday', '#qmsCal [data-cal-today]', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var today = new Date();
        qmsCalView = new Date(today.getFullYear(), today.getMonth(), 1);
        $(qmsCalInput).val(qmsFormatDate(today)).trigger('change');
        qmsHideCal();
    });

    $(document).off('mousedown.qmcalout').on('mousedown.qmcalout', function (e) {
        if (!$('#qmsCal').hasClass('is-open')) return;
        if ($(e.target).closest('#qmsCal, #datepicker, #qmsDateTrigger, .qms-date-wrap').length) return;
        qmsHideCal();
    });

    //To update the status of file access download / view in DB   
    $(document).on('click', '.user_logdet', function(){
        var view_file_name   = $(this).data('file_name');   
        var file_access_type = $(this).data('file_access_type');   
        var doc_id           = $(this).data('doc_id'); 
        var menu             = $(this).data('menu');
        var submenu          = $(this).data('submenu');      
        $.ajax({
            url     : "/insertLogDet",
            method  : "post",
            data    : {view_file_name:view_file_name,file_access_type:file_access_type,doc_id:doc_id,menu:menu,submenu:submenu},
            success : function(data){
            }
        });        
     });

    function qmsEscapeHtml(value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function qmsResetViewModal() {
        var $modal = $('#qmsViewModal');
        $modal.find('.qms-view-loading').show();
        $modal.find('.qms-view-frame').hide().attr('src', 'about:blank');
        $modal.find('.qms-view-html').hide().empty().removeClass('is-editing').removeAttr('contenteditable');
        $modal.find('.qms-view-table-wrap').hide().empty();
        $modal.find('.qms-view-error').hide().empty();
        $modal.find('.qms-replace-note').attr('hidden', 'hidden').empty();
        $modal.find('.qms-edit-hint').attr('hidden', 'hidden');
    }

    function qmsShowViewError(message, downloadHref) {
        var $modal = $('#qmsViewModal');
        $modal.find('.qms-view-loading').hide();
        var html = '<p>' + qmsEscapeHtml(message) + '</p>';
        if (downloadHref) {
            html += '<p><a class="btn btn-primary" href="' + qmsEscapeHtml(downloadHref) + '">Download file</a></p>';
        }
        $modal.find('.qms-view-error').html(html).show();
    }

    function qmsRenderXlsx(rows) {
        if (!rows || !rows.length) {
            return '<p>This spreadsheet is empty.</p>';
        }
        var html = '<div class="qms-xlsx-scroll"><table class="qms-xlsx-table">';
        rows.forEach(function (row, index) {
            html += '<tr>';
            (row || []).forEach(function (cell) {
                var tag = index === 0 ? 'th' : 'td';
                html += '<' + tag + '>' + qmsEscapeHtml(cell) + '</' + tag + '>';
            });
            html += '</tr>';
        });
        html += '</table></div>';
        return html;
    }

    function qmsShowViewModal() {
        var $modal = $('#qmsViewModal');
        if (!$modal.length) return $modal;
        if (!$modal.parent().is('body')) {
            $modal.appendTo('body');
        }
        $modal.addClass('show in').attr('aria-hidden', 'false').css({
            display: 'block',
            paddingRight: '0px'
        });
        if (!$('.qms-view-backdrop').length) {
            $('<div class="modal-backdrop fade show in qms-view-backdrop"></div>').appendTo('body');
        }
        $('body').addClass('modal-open');
        try {
            if ($.fn.modal) {
                $modal.modal({ backdrop: false, keyboard: true, show: true });
            }
        } catch (err) {}
        return $modal;
    }

    function qmsHideViewModal() {
        var $modal = $('#qmsViewModal');
        $modal.removeClass('show in is-editing').attr('aria-hidden', 'true').hide();
        $modal.find('.qms-view-update').attr('hidden', 'hidden').removeAttr('data-doc-id');
        $modal.find('.qms-view-save').attr('hidden', 'hidden');
        $modal.find('.qms-view-replace').attr('hidden', 'hidden');
        $modal.find('.qms-view-kicker').text('Document preview');
        $modal.find('.qms-view-html').removeClass('is-editing').removeAttr('contenteditable');
        $modal.find('.qms-edit-label').hide();
        $('.qms-view-backdrop').remove();
        $('body').removeClass('modal-open');
        if (window.qmsDocEditor && window.qmsDocEditor.close) window.qmsDocEditor.close();
        qmsResetViewModal();
    }

    $(document).off('click.qmsview', '.viewFile').on('click.qmsview', '.viewFile', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $btn = $(this);
        var fileName = String($btn.attr('data-file_name') || $btn.data('file_name') || '');
        var menu = String($btn.attr('data-menu') || $btn.data('menu') || '');
        var submenu = String($btn.attr('data-submenu') || $btn.data('submenu') || '');
        var ext = (fileName.split('.').pop() || '').toLowerCase();
        var customPreview = String($btn.attr('data-preview_url') || $btn.attr('data-preview-url') || '');
        var customDownload = String($btn.attr('data-download_url') || $btn.attr('data-download-url') || '');
        var customFileUrl = String($btn.attr('data-file_url') || $btn.attr('data-file-url') || '');
        var downloadUrl = customDownload || ('/downloadDocument/' + encodeURIComponent(menu) + '/' + encodeURIComponent(submenu) + '/' + encodeURIComponent(fileName));
        var $modal = qmsShowViewModal();
        if (!$modal.length) return;

        $modal.find('.qms-view-title').text(fileName || 'View file');
        $modal.find('.qms-view-download').attr('href', downloadUrl);
        var editMode = String($btn.attr('data-edit_mode') || '') === '1';
        var docId = String($btn.attr('data-doc_id') || $btn.attr('data-doc-id') || '');
        var $update = $modal.find('.qms-view-update');
        var $save = $modal.find('.qms-view-save');
        $save.attr('hidden', 'hidden');
        $modal.find('.qms-view-replace').attr('hidden', 'hidden');
        $modal.removeClass('is-editing');
        $modal.find('.qms-view-kicker').text('Document preview');
        $update.attr('hidden', 'hidden').removeAttr('data-doc-id');
        qmsResetViewModal();

        function showOriginalFrame(url) {
            $modal.find('.qms-view-loading').text('Opening original document…').show();
            $modal.find('.qms-view-frame').off('load.qmsview').on('load.qmsview', function () {
                var src = $(this).attr('src') || '';
                if (!src || src === 'about:blank') return;
                $modal.find('.qms-view-loading').hide();
                $(this).show();
            }).attr({
                src: url,
                allowfullscreen: 'true'
            });
        }

        var originalUrl = customFileUrl
            ? (customFileUrl.indexOf('http') === 0 ? customFileUrl : (window.location.origin + customFileUrl))
            : (window.location.origin + '/pdfFiles/' + encodeURIComponent(menu) + '/' + encodeURIComponent(submenu) + '/' + encodeURIComponent(fileName));
        var previewUrl = customPreview || ('/previewDocument/' + encodeURIComponent(menu) + '/' + encodeURIComponent(submenu) + '/' + encodeURIComponent(fileName));
        var officeExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

        if (editMode) {
            $modal.addClass('is-editing');
            $modal.find('.qms-view-kicker').text('Edit original document');
            $update.attr('hidden', 'hidden');
            $modal.find('.qms-view-replace').attr('hidden', 'hidden');
            $save.removeAttr('hidden');
            $modal.find('.qms-edit-hint').removeAttr('hidden');
            $modal.find('.qms-view-loading').text('Opening original document…').show();
            if (!window.qmsDocEditor || !window.qmsDocEditor.open) {
                qmsShowViewError('The document editor is not available.', downloadUrl);
                return;
            }
            $save.attr('data-doc-id', docId);
            window.qmsDocEditor.open({
                modal: $modal[0],
                url: customDownload || downloadUrl,
                fallbackUrl: customFileUrl || originalUrl,
                previewUrl: previewUrl,
                originalUrl: originalUrl,
                officeUrl: officeExts.indexOf(ext) !== -1
                    ? ('https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(originalUrl))
                    : '',
                ext: ext,
                fileName: fileName
            }).catch(function (err) {
                qmsShowViewError((err && err.message) || 'Unable to open this document for editing.', downloadUrl);
            });
            return;
        }

        if (ext === 'pdf') {
            showOriginalFrame(previewUrl);
            return;
        }

        if (officeExts.indexOf(ext) !== -1) {
            showOriginalFrame('https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(originalUrl));
            return;
        }

        qmsShowViewError('Preview is available for PDF, Word (.doc/.docx), and Excel (.xlsx) files.', downloadUrl);
    });

    window.qmsHideViewModal = qmsHideViewModal;
    window.qmsShowViewModal = qmsShowViewModal;

    $(document).on('click', '#qmsViewModal .qms-view-close, #qmsViewModal [data-dismiss="modal"], .qms-view-backdrop', function () {
        var choice = document.getElementById('libUpdateChoiceModal');
        if (choice && !choice.hidden) return;
        qmsHideViewModal();
    });

    $(document).on('keydown', function (e) {
        if ((e.key === 'Escape' || e.keyCode === 27) && $('#qmsViewModal').hasClass('show')) {
            var choice = document.getElementById('libUpdateChoiceModal');
            if (choice && !choice.hidden) return;
            qmsHideViewModal();
        }
    });

    $(document).off('click.qmsdel', '.qms-del-file').on('click.qmsdel', '.qms-del-file', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $btn = $(this);
        var doc_num = $btn.attr('data-doc_num');
        var menu = $btn.attr('data-menu');
        var submenu = $btn.attr('data-submenu');
        if (!doc_num) return;
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        $btn.prop('disabled', true);
        $.ajax({
            url: '/deleteDocument',
            method: 'GET',
            data: { doc_num: doc_num, menu: menu, submenu: submenu },
            success: function (response) {
                if (response && response.url) {
                    window.location.replace(response.url);
                } else {
                    window.location.reload();
                }
            },
            error: function () {
                $btn.prop('disabled', false);
                alert('Unable to delete this file. Please try again.');
            }
        });
    });
 
    
     //Setting notification on file upload to dahsboard.
    $(document).on('click', '.sendNotification', function(){
        var latDoc          = $(this).attr('data-latest_doc');
        var menu            = $(this).data('menu');
        var submenu         = $(this).data('submenu');
        if (!latDoc) {
            alert('No document available to announce.');
            return;
        }
        $.ajax({
            url     : "/insertNotification",
            method  : "post",
            data    : {latDocId:latDoc,menu:menu,submenu:submenu},
            success : function(response){
                if (response && response.url) {
                    window.location.replace(response.url);
                }
            },
            error: function (xhr) {
                var msg = (xhr.responseJSON && xhr.responseJSON.message) || 'Unable to send announcement.';
                alert(msg);
            }
        });
    });                        
    
    var $notifyBtn = $(".notify-btn");
    if ($notifyBtn.length) {
        var chkNotify = $notifyBtn.data('file_name');
        if (chkNotify && String(chkNotify).length > 0) {
            $(".chgnotclr").css("color","white");
            $notifyBtn.addClass("notify-btnntfy");
            $notifyBtn.prop('disabled', false);
        } else {
            $(".chgnotclr").css("cursor","not-allowed");
            $(".chgnotclr").css("pointer-events","none");
            $(".chgnotclr").css("color","#4a4c4d");
        }
    } 
});


// UPLOADING DOCUMENT STARTS HERE -----------------------------------------------------------------

$(document).on('focus', '#datepicker', function(){
    $(this).prop('readonly', true);
});

// To extract file name and display in input box in insert modal
$(document).on('change', '#formFile', function(){    
    var fileInput = document.getElementById('formFile');
    if (!fileInput.files || !fileInput.files[0]) return;
    var filename  = fileInput.files[0].name;
    document.getElementById('docName').value =  filename;
    $('#qmsFileLabel').text(filename);
    $('.qms-file-drop').addClass('is-selected');
});

//Decimal validation release version , uploading document.
// function rlsCheckDecimal(inputtxt) 
// { 
//     var decimal =  /^[-+]?[0-9]+\.[0-9]+$/; 
//     if(!inputtxt.value.match(decimal)) 
//     { 
//         alert('Invalid input , Please enter valid decimal number.')
//         document.getElementById("relsVer").value="";
//         document.getElementById("relsVer").focus();
//         return false;
//     }
// } 

//Decimal validation  document version , uploading document.
// function docCheckDecimal(inputtxt) 
// { 
//     var decimal =  /^[-+]?[0-9]+\.[0-9]+$/; 
//     if(!inputtxt.value.match(decimal)) 
//     { 
//         alert('Invalid input , Please enter valid decimal number.')
//         document.getElementById("docVer").value="";
//         document.getElementById("docVer").focus();
//         return false;
//     }
// } 
// $(document).on("click", "#delConfAlrt", function(e){
//     e.preventDefault();         
//     var theme = "red";              
//     $.jAlert({     
//     'title': 'Delete Confirmation',     
//     'content': 'Are you sure you want to delete this File?',     
//     'theme': theme,     
//     'backgroundColor': 'white',     
//     'btns': [{'text':'Yes', 'theme':theme}],
//     'onConfirm': function(){
//         theme = "red";  
//         $.jAlert({
//             'title': 'File(s) Removed',
//             'content': 'The files are removed!',
//             'theme': theme,
//             'closeOnClick': true,
//             'backgroundColor': 'black'
//            });    
//         }
//     });
//      return true;
// });
$(document).on("click", "#delConfAlrt", function(e){
    e.preventDefault();         
    jConfirm('Are you sure to delete the account permanently?', 'Confirmation Title goes here', function(result) {
        if (result){
        var doc_num   = $(this).data('doc_num');
        var menu      = $(this).data('menu');
        var submenu   = $(this).data('submenu');        
        $.ajax({
            url     : "/deleteDocument",
            method  : "post",
            data    : {doc_num:doc_num,menu:menu,submenu:submenu},
            success : function(response){
                window.location.replace(response.url);
            }
        }); 
        }
        // jAlert('Your account is removed','You clicked OK');
        // }
        // else{
        // jAlert('Your account is safe', 'You clicked cancel');    
        // }
    });
    
});

//Validating file upload 
function validateFileType() {
    var inputElement = document.getElementById('formFile');
    var files = inputElement.files;
    if(files.length==0){
        alert("Please choose a file first...");
        return false;
    }else{
        var filename = files[0].name;
        var fileSize = files[0].size;
        /* getting file extenstion eg- .jpg,.png, etc */
        var extension = filename.substr(filename.lastIndexOf("."));
        /* define allowed file types */
        var allowedExtensionsRegx = /(\.xlsx|\.docx|\.pptx|\.doc|\.pdf)$/i;
        /* testing extension with regular expression */
        var isAllowed = allowedExtensionsRegx.test(extension);
        /* 1024 = 1MB */
        var size = Math.round((fileSize / 1024));
        if (!size >= 2*1024) {           
            alert("Invalid file size, please select a file less than or equal to 2mb size.");
            inputElement.value = "";
            return false;
        }
        // if(!isAllowed){
        //     alert("Invalid File Type.Please choose .xlsx , .pdf, .docs , .pptx format.");
        //     inputElement.value = "";
        //     return false;
        // }
    }
}


//Tooltip method for notification.
$(function () { $("[data-toggle = 'tooltip']").tooltip(); });

//To reset input value on close.
$('.close-btn-design').on('click', function () {
document.getElementById("formFile").value="";
});

//To reset add user forms input value on resset button (userprofile and upload file).
$('#resetForm').on('click', function () {
var form = document.getElementById("updateUser");
form.reset();
$('#qmsFileLabel').text('Choose a file');
$('.qms-file-drop').removeClass('is-selected');
});

// UPDATING DOCUMENT STARTS HERE -----------------------------------------------------------------
$(document).on("focusin", "#editDatepicker", function(){
    $(this).prop('readonly', true);  
});
$(document).on("focusout", "#editDatepicker", function(){
    $(this).prop('readonly', false); 
});


//Decimal validation  release version , updating document.
function rlsCheckDecimalUpt(inputtxt) 
{ 
    var decimal =  /^[-+]?[0-9]+\.[0-9]+$/; 
    if(!inputtxt.value.match(decimal)) 
    { 
        alert('Invalid input , Please enter valid decimal number.')
        document.getElementById("relsVerDoc").value="";
        document.getElementById("relsVerDoc").focus();
        return false;
    }
} 

//Decimal validation  document version , updating document.
function docCheckDecimalUpt(inputtxt) 
{ 
    var decimal =  /^[-+]?[0-9]+\.[0-9]+$/; 
    if(!inputtxt.value.match(decimal)) 
    { 
        alert('Invalid input , Please enter valid decimal number.')
        document.getElementById("docVerUpd").value="";
        document.getElementById("docVerUpd").focus();
        return false;
    }
} 

//Validating file upload for updating.
$(document).on('click', '.updfile', function(){        
    var fileInput = document.getElementById('selectedFile');   
    var fakeInput = document.getElementById('fakeInput');
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        return true;
    }
    var filename  = fileInput.files[0].name;            
    var fileSize  = fileInput.files[0].size;
    /* getting file extenstion eg- .jpg,.png, etc */
    var extension = filename.substr(filename.lastIndexOf("."));
    /* define allowed file types */
    var allowedExtensionsRegx = /(\.xlsx|\.docx|\.pptx|\.doc|\.pdf)$/i;
    /* testing extension with regular expression */
    var isAllowed = allowedExtensionsRegx.test(extension);            
    /* 1024 = 1MB */
    var size = Math.round((fileSize / 1024));    
    if (!size >= 2*1024) {           
        alert("Invalid file size, please select a file less than or equal to 2mb size.");
        fileInput.value = "";
        fakeInput.value = "";
        return false;
    }
    if(!isAllowed){
        alert("Invalid File Type.Please choose .xlsx , .pdf, .docs , .pptx formats.");
        fileInput.value = "";
        fakeInput.value = "";            
        return false;
    }
});


//Displaying file detail in modal based on particular doc id.

//Updating document.
$(document).on('click', '.update', function(){  
    var id      = $('.doc_id').val();
    var old_doc = $('.old_doc_file').val(); 
    $.ajax({
        url:"/editDocument",
        method:"POST",
        data:{id:id,old_doc:old_doc},      
        dataType:"JSON",
        success:function(data){                                   
        }
    });    
  });
  $(document).on('click','#resetUserUpdate', function () {   
    var form = document.getElementById("updateForm");       
    if (form) form.reset();
    $('#qmsEditFileLabel').text('Choose a file');
    $('#myModalEdit .qms-file-drop').removeClass('is-selected');
    // $('#fileDescription').val('');
    // alert("test");
    // $('#fileDescription').html('');
    // $('textarea[name="content"]').val('');
    // $("#fileDescription").prop("val","");
    // $('#fileDescription').val('').change();
    // const textarea = document.getElementById('fileDescription');  
    // textarea.value = ' ';
    // alert("testing");
    });

//Deleting files.





//CHANGE PASSWORD PAGE STARTS HERE -----------------------------------------------------------------------

//validating password and confirm passsword 
function matchPassword() {  
    var pw1 = document.getElementById("paswd").value;  
    var pw2 = document.getElementById("cpaswd").value;      
    if(pw1 !== pw2){   
      alert("Passwords did not match");        
    }
    return false;
}

//To reset password change forms input value on resset button.
$('.rsBtn').on('click', function () {
    var form = document.getElementById("pswdchng");
    form.reset();
    });



// IMPORT USER PAGE HERE --------------------------------------------------------------------------

//Validating import user file
function checkfile(sender) {
    var validExts = [".xlsx"];
    var fileExt = sender.value;
    fileExt = fileExt.substring(fileExt.lastIndexOf('.'));
    if (validExts.indexOf(fileExt) < 0) {        
        alert("Invalid file type, Please use template.");
        document.getElementById("formFile").value="";
        return false;
    } else return true;
}


//LOGIN PAGE HERE ---------------------------------------------------------------------------------
//To reset password change forms input value on resset button in LOGIN form.
$('.cls_btn').on('click', function () {
    var form = document.getElementById("login");
    form.reset();
}); 

$('.jconfirm').on('click', function(e){
    e.preventDefault();
    var doc_num   = $(this).data('doc_num');
    var menu      = $(this).data('menu');
    var submenu   = $(this).data('submenu');        
    confirm( function(){
        //successAlert('Confirmed');        
        console.log(doc_num);     
        console.log(menu);     
        console.log(submenu);    
        // return false;
        $.ajax({
            url     : "/deleteDocument",
            method  : "get",
            data    : {doc_num:doc_num,menu:menu,submenu:submenu},
            success : function(response){                
            window.location.replace(response.url);
            }
        }); 
    }, function(){
        // errorAlert('Denied');
    });
    return false; 
});

