(function (window) {
    var state = {
        ext: '',
        fileName: '',
        modal: null,
        kind: '',
        ready: false,
        dirty: false,
        originalBuffer: null,
        zip: null,
        wordXml: '',
        wordParas: [],
        pptSlides: [],
        workbook: null,
        pdfPages: []
    };

    var CDN = {
        mammoth: 'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js',
        xlsx: 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
        pdfjs: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
        jszip: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
        pdflib: 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js'
    };

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[data-qms-src="' + src + '"]');
            if (existing) {
                if (existing.getAttribute('data-qms-loaded') === '1') return resolve();
                existing.addEventListener('load', resolve);
                existing.addEventListener('error', reject);
                return;
            }
            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.setAttribute('data-qms-src', src);
            script.onload = function () {
                script.setAttribute('data-qms-loaded', '1');
                resolve();
            };
            script.onerror = function () { reject(new Error('Unable to load the document editor.')); };
            document.head.appendChild(script);
        });
    }

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function xmlEsc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    function decodeXml(value) {
        return String(value || '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'");
    }

    function $(modal, sel) {
        return modal ? modal.querySelector(sel) : null;
    }

    function fileFamily(ext) {
        ext = String(ext || '').toLowerCase().replace(/^\./, '');
        if (['doc', 'docx'].indexOf(ext) !== -1) return 'word';
        if (['xls', 'xlsx'].indexOf(ext) !== -1) return 'excel';
        if (['ppt', 'pptx'].indexOf(ext) !== -1) return 'ppt';
        if (ext === 'pdf') return 'pdf';
        return ext;
    }

    function showLoading(modal, text) {
        var el = $(modal, '.qms-view-loading');
        if (el) {
            el.textContent = text || 'Loading document for editing…';
            el.style.display = 'block';
        }
        ['.qms-view-frame', '.qms-view-html', '.qms-view-table-wrap', '.qms-view-error'].forEach(function (sel) {
            var pane = $(modal, sel);
            if (!pane) return;
            if (sel === '.qms-view-frame') pane.setAttribute('src', 'about:blank');
            pane.style.display = 'none';
        });
    }

    function hideLoading(modal) {
        var el = $(modal, '.qms-view-loading');
        if (el) el.style.display = 'none';
    }

    function htmlPane(modal) {
        return $(modal, '.qms-view-html');
    }

    function tablePane(modal) {
        return $(modal, '.qms-view-table-wrap');
    }

    function ensureEditLabel(modal, text) {
        var label = $(modal, '.qms-edit-label');
        if (!label && modal) {
            label = document.createElement('div');
            label.className = 'qms-edit-label';
            var html = htmlPane(modal);
            var table = tablePane(modal);
            var target = (html && html.parentNode) || (table && table.parentNode);
            if (target) target.insertBefore(label, html || table);
        }
        if (label) {
            label.textContent = text || 'Edit original content';
            label.style.display = 'block';
        }
    }

    function fetchBuffer(url, fallbackUrl) {
        return fetch(url, { credentials: 'same-origin' }).then(function (res) {
            if (!res.ok) {
                if (fallbackUrl && fallbackUrl !== url) return fetchBuffer(fallbackUrl);
                throw new Error('Unable to open this document for editing.');
            }
            return res.arrayBuffer();
        });
    }

    function mimeFor(ext) {
        var types = {
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ppt: 'application/vnd.ms-powerpoint',
            pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        };
        return types[ext] || 'application/octet-stream';
    }

    function originalName() {
        var ext = state.ext || 'docx';
        var name = String(state.fileName || 'document').replace(/^.*[\\/]/, '');
        if (!/\.[A-Za-z0-9]+$/.test(name)) name += '.' + ext;
        return name;
    }

    function asOriginalFile(data) {
        return new File([data], originalName(), { type: mimeFor(state.ext) });
    }

    function markDirty() {
        state.dirty = true;
    }

    function watchDirty(modal) {
        if (!modal || modal._qmsDirtyBound) return;
        modal._qmsDirtyBound = true;
        modal.addEventListener('input', function (e) {
            if (e.target && (e.target.isContentEditable || e.target.closest('[contenteditable="true"]'))) {
                markDirty();
            }
        });
    }

    function zipFromBuffer(buffer) {
        return loadScript(CDN.jszip).then(function () {
            return window.JSZip.loadAsync(buffer);
        });
    }

    function fileFromZip() {
        return state.zip.generateAsync({
            type: 'blob',
            mimeType: mimeFor(state.ext),
            compression: 'DEFLATE'
        }).then(function (blob) {
            return asOriginalFile(blob);
        });
    }

    function wordTexts(pXml) {
        var texts = [];
        String(pXml).replace(/<w:t\b([^>]*)>([\s\S]*?)<\/w:t>/g, function (_, _attrs, text) {
            texts.push(decodeXml(text));
            return _;
        });
        return texts.join('');
    }

    function patchWordPara(pXml, text) {
        var n = 0;
        var next = String(pXml).replace(/<w:t\b([^>]*)>([\s\S]*?)<\/w:t>/g, function (match, attrs) {
            n += 1;
            if (n === 1) {
                attrs = String(attrs || '');
                if (!/\bxml:space=/.test(attrs)) attrs += ' xml:space="preserve"';
                return '<w:t' + attrs + '>' + xmlEsc(text) + '</w:t>';
            }
            return match.replace(/>([\s\S]*?)<\/w:t>/, '></w:t>');
        });
        if (!n && text) {
            next = String(pXml).replace(/<\/w:p>/, '<w:r><w:t xml:space="preserve">' + xmlEsc(text) + '</w:t></w:r></w:p>');
        }
        return next;
    }

    function openWord(buffer, modal) {
        return zipFromBuffer(buffer).then(function (zip) {
            var docFile = zip.file('word/document.xml');
            if (!docFile) throw new Error('not-ooxml');
            state.zip = zip;
            return docFile.async('string');
        }).then(function (xml) {
            state.wordXml = xml;
            state.wordParas = [];
            xml.replace(/<w:p\b[\s\S]*?<\/w:p>/g, function (pXml) {
                state.wordParas.push(pXml);
                return pXml;
            });
            if (!state.wordParas.length) state.wordParas.push('<w:p><w:r><w:t></w:t></w:r></w:p>');
            var pane = htmlPane(modal);
            pane.classList.add('is-editing');
            pane.removeAttribute('contenteditable');
            pane.innerHTML = state.wordParas.map(function (pXml, idx) {
                return '<p class="qms-edit-p" contenteditable="true" data-i="' + idx + '">' + esc(wordTexts(pXml)) + '</p>';
            }).join('');
            pane.style.display = 'block';
            ensureEditLabel(modal, 'Edit original Word content');
            hideLoading(modal);
            state.kind = 'word';
            state.ready = true;
        }).catch(function (err) {
            if (String(err && err.message) !== 'not-ooxml') throw err;
            return loadScript(CDN.mammoth).then(function () {
                return window.mammoth.convertToHtml({ arrayBuffer: buffer });
            }).then(function (result) {
                var pane = htmlPane(modal);
                pane.classList.add('is-editing');
                pane.setAttribute('contenteditable', 'true');
                pane.innerHTML = result.value || '<p></p>';
                pane.style.display = 'block';
                ensureEditLabel(modal, 'Edit original Word content');
                hideLoading(modal);
                state.kind = 'word-html';
                state.ready = true;
            });
        });
    }

    function collectWordXml() {
        var pane = htmlPane(state.modal);
        var nodes = pane.querySelectorAll('[data-i]');
        var i = 0;
        return state.wordXml.replace(/<w:p\b[\s\S]*?<\/w:p>/g, function (pXml) {
            var node = nodes[i];
            var text = node ? String(node.innerText || '').replace(/\u00a0/g, ' ') : wordTexts(pXml);
            i += 1;
            return patchWordPara(pXml, text);
        });
    }

    function openExcel(buffer, modal) {
        return loadScript(CDN.xlsx).then(function () {
            var workbook = window.XLSX.read(buffer, { type: 'array', cellStyles: true });
            state.workbook = workbook;
            var sheet = workbook.Sheets[workbook.SheetNames[0]] || {};
            var rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
            if (!rows.length) rows = [['']];
            var width = 1;
            rows.forEach(function (row) { if (row.length > width) width = row.length; });
            width = Math.max(width + 1, 3);
            while (rows.length < 12) rows.push([]);
            var html = '<div class="qms-xlsx-scroll"><table class="qms-xlsx-table is-editing">';
            rows.forEach(function (row) {
                html += '<tr>';
                for (var c = 0; c < width; c += 1) {
                    html += '<td contenteditable="true">' + esc(row[c] == null ? '' : row[c]) + '</td>';
                }
                html += '</tr>';
            });
            html += '</table></div>';
            var pane = tablePane(modal);
            pane.innerHTML = html;
            pane.style.display = 'block';
            ensureEditLabel(modal, 'Edit original spreadsheet content');
            hideLoading(modal);
            state.kind = 'excel';
            state.ready = true;
        });
    }

    function openPpt(buffer, modal) {
        return zipFromBuffer(buffer).then(function (zip) {
            var names = Object.keys(zip.files).filter(function (name) {
                return /ppt\/slides\/slide\d+\.xml$/i.test(name);
            }).sort(function (a, b) {
                return a.localeCompare(b, undefined, { numeric: true });
            });
            if (!names.length) throw new Error('This presentation cannot be edited in the original format.');
            state.zip = zip;
            state.pptSlides = [];
            var chain = Promise.resolve();
            names.forEach(function (name) {
                chain = chain.then(function () {
                    return zip.files[name].async('string').then(function (xml) {
                        var texts = [];
                        String(xml).replace(/<a:t\b([^>]*)>([\s\S]*?)<\/a:t>/g, function (_, attrs, text) {
                            texts.push({ attrs: attrs || '', text: decodeXml(text) });
                            return _;
                        });
                        if (!texts.length) texts.push({ attrs: '', text: '' });
                        state.pptSlides.push({ name: name, xml: xml, texts: texts });
                    });
                });
            });
            return chain;
        }).then(function () {
            var pane = htmlPane(modal);
            pane.classList.add('is-editing');
            pane.removeAttribute('contenteditable');
            pane.innerHTML = state.pptSlides.map(function (slide, sIdx) {
                var boxes = slide.texts.map(function (item, tIdx) {
                    return '<p class="qms-edit-p" contenteditable="true" data-s="' + sIdx + '" data-t="' + tIdx + '">' + esc(item.text) + '</p>';
                }).join('');
                return '<section class="qms-edit-page"><h4>Slide ' + (sIdx + 1) + '</h4>' + boxes + '</section>';
            }).join('');
            pane.style.display = 'block';
            ensureEditLabel(modal, 'Edit original PowerPoint content');
            hideLoading(modal);
            state.kind = 'ppt';
            state.ready = true;
        });
    }

    function openPdf(buffer, modal) {
        return loadScript(CDN.pdfjs).then(function () {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            return window.pdfjsLib.getDocument({ data: buffer }).promise;
        }).then(function (pdf) {
            state.pdfPages = [];
            var chain = Promise.resolve();
            var i;
            for (i = 1; i <= pdf.numPages; i += 1) {
                (function (pageNo) {
                    chain = chain.then(function () {
                        return pdf.getPage(pageNo).then(function (page) {
                            var view = page.view || [0, 0, 595, 842];
                            return page.getTextContent().then(function (content) {
                                var text = (content.items || []).map(function (item) { return item.str; }).join(' ').replace(/\s+/g, ' ').trim();
                                state.pdfPages.push({
                                    text: text,
                                    width: view[2] || 595,
                                    height: view[3] || 842
                                });
                            });
                        });
                    });
                })(i);
            }
            return chain;
        }).then(function () {
            if (!state.pdfPages.length) state.pdfPages.push({ text: '', width: 595, height: 842 });
            var pane = htmlPane(modal);
            pane.classList.add('is-editing');
            pane.removeAttribute('contenteditable');
            pane.innerHTML = state.pdfPages.map(function (page, idx) {
                return '<section class="qms-edit-page" data-p="' + idx + '" contenteditable="true">' +
                    '<h4>Page ' + (idx + 1) + '</h4><p>' + esc(page.text || '') + '</p></section>';
            }).join('');
            pane.style.display = 'block';
            ensureEditLabel(modal, 'Edit original PDF content');
            hideLoading(modal);
            state.kind = 'pdf';
            state.ready = true;
        });
    }

    function toWordFile() {
        if (state.kind === 'word' && state.zip && state.wordXml) {
            state.zip.file('word/document.xml', collectWordXml());
            return fileFromZip();
        }
        return Promise.resolve(asOriginalFile(state.originalBuffer));
    }

    function toExcelFile() {
        return loadScript(CDN.xlsx).then(function () {
            var workbook = state.workbook;
            var sheet = workbook.Sheets[workbook.SheetNames[0]];
            var table = tablePane(state.modal).querySelector('table');
            var maxR = 0;
            var maxC = 0;
            Array.prototype.forEach.call(table.querySelectorAll('tr'), function (tr, r) {
                Array.prototype.forEach.call(tr.cells, function (td, c) {
                    var val = String(td.innerText || '').replace(/\u00a0/g, ' ').replace(/\s+$/g, '');
                    var addr = window.XLSX.utils.encode_cell({ r: r, c: c });
                    var cell = sheet[addr];
                    if (val === '') {
                        if (cell) delete sheet[addr];
                        return;
                    }
                    maxR = Math.max(maxR, r);
                    maxC = Math.max(maxC, c);
                    var num = Number(val);
                    var isNum = val !== '' && !isNaN(num) && !/^\s/.test(val) && String(num) === val.trim();
                    if (cell) {
                        if (isNum) {
                            cell.t = 'n';
                            cell.v = num;
                        } else {
                            cell.t = 's';
                            cell.v = val;
                        }
                        delete cell.w;
                    } else {
                        sheet[addr] = isNum ? { t: 'n', v: num } : { t: 's', v: val };
                    }
                });
            });
            if (sheet['!ref']) {
                var range = window.XLSX.utils.decode_range(sheet['!ref']);
                range.e.r = Math.max(range.e.r, maxR);
                range.e.c = Math.max(range.e.c, maxC);
                sheet['!ref'] = window.XLSX.utils.encode_range(range);
            }
            var bookType = state.ext === 'xls' ? 'xls' : 'xlsx';
            var out = window.XLSX.write(workbook, { bookType: bookType, type: 'array', cellStyles: true });
            return asOriginalFile(out);
        });
    }

    function toPptFile() {
        var pane = htmlPane(state.modal);
        state.pptSlides.forEach(function (slide, sIdx) {
            slide.texts.forEach(function (item, tIdx) {
                var node = pane.querySelector('[data-s="' + sIdx + '"][data-t="' + tIdx + '"]');
                if (node) item.text = String(node.innerText || '').replace(/\u00a0/g, ' ');
            });
            var i = 0;
            var xml = slide.xml.replace(/<a:t\b([^>]*)>([\s\S]*?)<\/a:t>/g, function (match, attrs) {
                var item = slide.texts[i++];
                if (!item) return match;
                return '<a:t' + (attrs || '') + '>' + xmlEsc(item.text) + '</a:t>';
            });
            if (i === 0 && slide.texts[0]) {
                xml = slide.xml.replace(/<\/p:sp>/, '<p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:t>' +
                    xmlEsc(slide.texts[0].text) + '</a:t></a:r></a:p></p:txBody></p:sp>');
            }
            state.zip.file(slide.name, xml);
        });
        return fileFromZip();
    }

    function wrapPdfLines(text, maxWidth, font, size) {
        var words = String(text || ' ').replace(/\s+/g, ' ').trim().split(' ');
        var lines = [];
        var line = '';
        words.forEach(function (word) {
            var next = line ? line + ' ' + word : word;
            if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
                lines.push(line);
                line = word;
            } else {
                line = next;
            }
        });
        if (line) lines.push(line);
        return lines.length ? lines : [' '];
    }

    function toPdfFile() {
        if (!state.dirty && state.originalBuffer) {
            return Promise.resolve(asOriginalFile(state.originalBuffer));
        }
        return loadScript(CDN.pdflib).then(function () {
            var PDFLib = window.PDFLib;
            var pages = state.modal.querySelectorAll('.qms-edit-page');
            return PDFLib.PDFDocument.load(state.originalBuffer).then(function (pdf) {
                return pdf.embedFont(PDFLib.StandardFonts.Helvetica).then(function (font) {
                    var pdfPages = pdf.getPages();
                    Array.prototype.forEach.call(pages, function (node, idx) {
                        var original = state.pdfPages[idx] || {};
                        var heading = node.querySelector('h4');
                        var raw = String(node.innerText || '');
                        if (heading) raw = raw.replace(heading.innerText, '');
                        var text = raw.replace(/^Page \d+\s*/i, '').replace(/\s+/g, ' ').trim();
                        var was = String(original.text || '').replace(/\s+/g, ' ').trim();
                        if (text === was || !pdfPages[idx]) return;
                        var page = pdfPages[idx];
                        var size = page.getSize();
                        page.drawRectangle({
                            x: 0,
                            y: 0,
                            width: size.width,
                            height: size.height,
                            color: PDFLib.rgb(1, 1, 1)
                        });
                        var lines = wrapPdfLines(text, size.width - 72, font, 11);
                        lines.forEach(function (line, lineNo) {
                            page.drawText(line, {
                                x: 36,
                                y: size.height - 48 - (lineNo * 16),
                                size: 11,
                                font: font,
                                color: PDFLib.rgb(0.1, 0.1, 0.1)
                            });
                        });
                    });
                    return pdf.save();
                });
            }).then(function (bytes) {
                return asOriginalFile(bytes);
            });
        });
    }

    window.qmsDocEditor = {
        open: function (opts) {
            opts = opts || {};
            state = {
                ext: String(opts.ext || '').toLowerCase(),
                fileName: opts.fileName || 'document',
                modal: opts.modal,
                kind: fileFamily(opts.ext),
                ready: false,
                dirty: false,
                originalBuffer: null,
                zip: null,
                wordXml: '',
                wordParas: [],
                pptSlides: [],
                workbook: null,
                pdfPages: []
            };
            if (!state.modal || !opts.url) {
                return Promise.reject(new Error('Unable to open this document for editing.'));
            }
            showLoading(state.modal, 'Opening original document…');
            var html = htmlPane(state.modal);
            var table = tablePane(state.modal);
            if (html) {
                html.classList.remove('is-editing');
                html.removeAttribute('contenteditable');
                html.innerHTML = '';
                html.style.display = 'none';
            }
            if (table) {
                table.innerHTML = '';
                table.style.display = 'none';
            }
            watchDirty(state.modal);
            return fetchBuffer(opts.url, opts.fallbackUrl).then(function (buffer) {
                state.originalBuffer = buffer;
                if (state.ext === 'pdf') return openPdf(buffer, state.modal);
                if (state.ext === 'xlsx' || state.ext === 'xls') return openExcel(buffer, state.modal);
                if (state.ext === 'pptx' || state.ext === 'ppt') return openPpt(buffer, state.modal);
                if (state.ext === 'docx' || state.ext === 'doc') return openWord(buffer, state.modal);
                throw new Error('This file type cannot be edited here.');
            });
        },
        toFile: function () {
            if (!state.ready || !state.modal) {
                return Promise.reject(new Error('The document is still loading.'));
            }
            if (!state.dirty && state.originalBuffer) {
                return Promise.resolve(asOriginalFile(state.originalBuffer));
            }
            if (state.kind === 'excel') return toExcelFile();
            if (state.kind === 'pdf') return toPdfFile();
            if (state.kind === 'ppt') return toPptFile();
            return toWordFile();
        },
        close: function () {
            state.ready = false;
            state.dirty = false;
            state.originalBuffer = null;
            state.zip = null;
            state.workbook = null;
            state.modal = null;
        }
    };
})(window);
