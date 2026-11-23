(function () {
    var el = document.getElementById('dashChartData');
    if (!el || typeof Chart === 'undefined') return;
    var data = {};
    try { data = JSON.parse(el.textContent || '{}'); } catch (e) { return; }

    var palette = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#f43f5e', '#6366f1', '#94a3b8'];
    var cats = data.categories || [];
    var donut = document.getElementById('dashDonut');
    if (donut) {
        new Chart(donut, {
            type: 'doughnut',
            data: {
                labels: cats.map(function (c) { return c.category; }),
                datasets: [{
                    data: cats.map(function (c) { return Number(c.total) || 0; }),
                    backgroundColor: palette,
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '68%',
                plugins: { legend: { display: false } }
            }
        });
    }

    var days = [];
    var map = {};
    (data.activity || []).forEach(function (row) {
        var key = moment(row.day).format('YYYY-MM-DD');
        map[key] = { views: Number(row.views) || 0, downloads: Number(row.downloads) || 0, uploads: 0 };
    });
    (data.uploads || []).forEach(function (row) {
        var key = moment(row.day).format('YYYY-MM-DD');
        if (!map[key]) map[key] = { views: 0, downloads: 0, uploads: 0 };
        map[key].uploads = Number(row.uploads) || 0;
    });
    for (var i = 29; i >= 0; i--) {
        days.push(moment().subtract(i, 'days').format('YYYY-MM-DD'));
    }
    var line = document.getElementById('dashActivity');
    if (line) {
        new Chart(line, {
            type: 'line',
            data: {
                labels: days.map(function (d) { return moment(d).format('D MMM'); }),
                datasets: [
                    { label: 'Uploads', data: days.map(function (d) { return (map[d] || {}).uploads || 0; }), borderColor: '#3b82f6', backgroundColor: 'transparent', tension: 0.35, pointRadius: 0, borderWidth: 2 },
                    { label: 'Downloads', data: days.map(function (d) { return (map[d] || {}).downloads || 0; }), borderColor: '#10b981', backgroundColor: 'transparent', tension: 0.35, pointRadius: 0, borderWidth: 2 },
                    { label: 'Views', data: days.map(function (d) { return (map[d] || {}).views || 0; }), borderColor: '#f59e0b', backgroundColor: 'transparent', tension: 0.35, pointRadius: 0, borderWidth: 2 }
                ]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 6, color: '#94a3b8' } },
                    y: { beginAtZero: true, grid: { color: '#eef2f7' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }
})();
