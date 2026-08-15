/*
HackerBrain OS - app.js
Frontend logic: WebSocket client, REST API calls, dynamic updates.
Local only. WARNING: authorized security testing only.
*/

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  let sessionId = null;
  let ws = null;
  let pro = false;
  let sessionStart = Date.now();

  // ---------------- utils ----------------
  function fmtDuration(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    return (
      String(h).padStart(2, '0') + ':' +
      String(m % 60).padStart(2, '0') + ':' +
      String(s % 60).padStart(2, '0')
    );
  }

  async function api(path, opts) {
    const res = await fetch(path, opts || {});
    return res.json();
  }

  function setSessionTimer() {
    setInterval(function () {
      $('status-time').textContent = 'SESSION: ' + fmtDuration(Date.now() - sessionStart);
    }, 1000);
  }

  // ---------------- WebSocket ----------------
  function connectWS() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    ws = new WebSocket(proto + '://' + location.host + '/ws');

    ws.onopen = function () {
      ws.send(JSON.stringify({ type: 'session' }));
      ws.send(JSON.stringify({ type: 'tools' }));
    };

    ws.onmessage = function (ev) {
      let data;
      try { data = JSON.parse(ev.data); } catch (e) { return; }

      if (data.type === 'session') {
        sessionId = data.session_id;
        loadStatus();
        loadMemory();
        loadVulns();
        loadTimeline();
      } else if (data.type === 'result') {
        HBTerminal.renderResult(data);
      } else if (data.type === 'timeline') {
        renderTimeline(data.events || []);
      } else if (data.type === 'tools') {
        // tools list available; not rendered by default
      } else if (data.type === 'error') {
        HBTerminal.print(data.message, 'out-err');
      }
    };

    ws.onclose = function () {
      setTimeout(connectWS, 2000);
    };
  }

  // ---------------- REST loaders ----------------
  async function loadStatus() {
    try {
      const s = await api('/api/status?session_id=' + (sessionId || ''));
      pro = !!s.pro;
      $('btn-pro').textContent = pro ? 'PRO' : 'FREE';
      $('btn-pro').classList.toggle('pro-on', pro);
      $('status-engine').textContent = s.engine_available
        ? 'engine: online'
        : 'engine: offline (local)';
      $('status-ver').textContent = 'v' + s.version + ' LOCAL';
      const q = s.quota === -1 ? 'unlimited' : (s.queries_today + '/' + s.quota);
      $('status-project').textContent = 'PROJECT: ' + s.project + ' | QUOTA: ' + q;
      if (pro) {
        $('vault-lock').classList.add('hidden');
        $('vault-body').classList.remove('hidden');
        $('reports-lock').classList.add('hidden');
        $('reports-body').classList.remove('hidden');
      }
    } catch (e) { /* ignore */ }
  }

  async function loadVulns() {
    try {
      const m = await api('/api/memory?session_id=' + (sessionId || ''));
      const list = $('vuln-list');
      list.innerHTML = '';
      (m.vulnerabilities || []).forEach(function (v) {
        const card = document.createElement('div');
        card.className = 'vuln-card';
        card.innerHTML =
          '<span class="sev sev-' + v.severity + '">' + v.severity + '</span>' +
          '<span class="meta">' + (v.cve_id || 'no-cve') + ' | ' + (v.host || '?') + ':' + (v.port || '-') + '</span>' +
          '<span class="desc">' + (v.description || '').slice(0, 120) + '</span>' +
          '<div class="row">' +
          '  <button class="card-btn" data-act="exploit">EXPLOIT</button>' +
          '  <button class="card-btn" data-act="details">DETAILS</button>' +
          '  <button class="card-btn" data-act="mitigate">MITIGATE</button>' +
          '</div>';
        list.appendChild(card);
      });
      renderMemory(m);
    } catch (e) { /* ignore */ }
  }

  function renderMemory(m) {
    $('mem-hosts').innerHTML = (m.hosts || []).map(function (h) {
      return '<li>' + h.ip + (h.os ? ' [' + h.os + ']' : '') + '</li>';
    }).join('') || '<li class="dim">none</li>';

    $('mem-creds').innerHTML = (m.credentials || []).map(function (c) {
      return '<li>' + c.username + '@' + (c.host || '?') + '</li>';
    }).join('') || '<li class="dim">none</li>';

    $('mem-notes').innerHTML = (m.notes || []).slice(0, 10).map(function (n) {
      return '<li>' + (n.title || 'note').slice(0, 40) + '</li>';
    }).join('') || '<li class="dim">none</li>';
  }

  async function loadMemory() {
    try {
      const m = await api('/api/memory?session_id=' + (sessionId || ''));
      renderMemory(m);
    } catch (e) { /* ignore */ }
  }

  async function loadTimeline() {
    try {
      const ev = await api('/api/timeline?limit=50');
      renderTimeline(ev);
    } catch (e) { /* ignore */ }
  }

  function renderTimeline(events) {
    const list = $('timeline-list');
    list.innerHTML = '';
    (events || []).slice().reverse().forEach(function (e) {
      const div = document.createElement('div');
      div.className = 'tl-event';
      div.innerHTML =
        '<span class="ts">' + (e.ts || '').slice(11, 19) + '</span> ' +
        '<span class="kind">' + (e.kind || 'event') + '</span><br>' +
        '<span>' + (e.detail || '').slice(0, 80) + '</span>';
      list.appendChild(div);
    });
  }

  // ---------------- chat ----------------
  function sendChat(text) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'chat', message: text }));
    } else {
      api('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: text })
      }).then(function (res) {
        if (res.error) HBTerminal.print(res.error, 'out-err');
        if (res.output) HBTerminal.print(res.output, 'out-info');
        loadMemory(); loadVulns(); loadTimeline();
      });
    }
  }

  // ---------------- vault ----------------
  async function vaultUnlock() {
    const pw = $('vault-pw').value;
    if (!pw) return;
    const r = await api('/api/vault/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, password: pw })
    });
    if (!r.ok) { HBTerminal.print(r.error || 'unlock failed', 'out-err'); return; }
    loadVaultEntries();
  }

  async function loadVaultEntries(reveal) {
    const r = await api('/api/vault/entries?session_id=' + (sessionId || '') + '&reveal=' + (reveal ? 'true' : 'false'));
    if (!r.ok) return;
    const tbody = document.querySelector('#vault-table tbody');
    tbody.innerHTML = '';
    (r.entries || []).forEach(function (e) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + e.id + '</td><td>' + e.service + '</td><td>' + e.username + '</td><td>' + e.password + '</td>';
      tbody.appendChild(tr);
    });
  }

  // ---------------- reports ----------------
  async function generateReport() {
    const sections = [];
    if ($('rep-scope').checked) sections.push('scope');
    if ($('rep-findings').checked) sections.push('findings');
    if ($('rep-recs').checked) sections.push('recommendations');
    if ($('rep-risk').checked) sections.push('risk');
    const bar = $('progress-bar');
    bar.style.width = '30%';
    const r = await api('/api/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        template: $('rep-template').value,
        format: $('rep-format').value,
        sections: sections
      })
    });
    bar.style.width = '100%';
    $('report-result').textContent = r.ok
      ? 'report saved locally: ' + r.file
      : (r.error || 'generation failed');
    setTimeout(function () { bar.style.width = '0%'; }, 1500);
  }

  // ---------------- pro activation ----------------
  async function activate() {
    const key = $('pro-key').value.trim();
    if (!key) return;
    const r = await api('/api/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, key: key })
    });
    $('pro-result').textContent = r.message || (r.ok ? 'activated' : 'invalid');
    if (r.ok) {
      pro = true;
      $('btn-pro').textContent = 'PRO';
      $('btn-pro').classList.add('pro-on');
      closeModal();
      loadStatus();
    }
  }

  function openModal() { $('pro-modal').classList.remove('hidden'); }
  function closeModal() { $('pro-modal').classList.add('hidden'); }

  // ---------------- events ----------------
  function wireEvents() {
    $('term-input').addEventListener('keydown', function (e) {
      HBTerminal.onKey(e, sendChat);
    });

    document.querySelectorAll('.qbtn').forEach(function (b) {
      b.addEventListener('click', function () {
        $('term-input').value = b.dataset.cmd;
        HBTerminal.submit(sendChat);
      });
    });

    document.querySelectorAll('.nav-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.nav-btn').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });
        $('view-' + b.dataset.view).classList.add('active');
        if (b.dataset.view === 'vulns') loadVulns();
        if (b.dataset.view === 'memory') loadMemory();
        if (b.dataset.view === 'vault') loadVaultEntries(false);
      });
    });

    $('btn-pro').addEventListener('click', openModal);
    $('btn-close-modal').addEventListener('click', closeModal);
    $('btn-activate').addEventListener('click', activate);
    $('btn-goto-pro').addEventListener('click', openModal);
    document.querySelectorAll('[data-goto-pro]').forEach(function (b) {
      b.addEventListener('click', openModal);
    });

    $('btn-refresh-vulns').addEventListener('click', loadVulns);
    $('btn-refresh-mem').addEventListener('click', loadMemory);
    $('btn-vault-unlock').addEventListener('click', vaultUnlock);
    $('btn-vault-reveal').addEventListener('click', function () {
      loadVaultEntries(true);
    });
    $('btn-vault-store').addEventListener('click', async function () {
      await api('/api/vault/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          service: $('vault-service').value,
          username: $('vault-user').value,
          password: $('vault-pass').value
        })
      });
      loadVaultEntries(false);
    });
    $('btn-generate-report').addEventListener('click', generateReport);

    document.getElementById('vuln-list').addEventListener('click', function (e) {
      const btn = e.target.closest('.card-btn');
      if (!btn) return;
      HBTerminal.print(
        btn.dataset.act === 'exploit' ? '[EXPLOIT] review the finding and craft a PoC manually. Authorized targets only.' :
        btn.dataset.act === 'mitigate' ? '[MITIGATE] apply vendor patch, harden config, restrict exposure.' :
        '[DETAILS] stored in local memory. See MEMORY panel and reports.',
        'out-info'
      );
    });

    window.addEventListener('beforeunload', function () {
      if (sessionId && ws) {
        fetch('/api/session/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId })
        });
      }
    });
  }

  // ---------------- init ----------------
  function init() {
    HBTerminal.printBanner();
    wireEvents();
    setSessionTimer();
    connectWS();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
