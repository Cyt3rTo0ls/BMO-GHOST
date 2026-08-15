/*
HackerBrain OS - app.js
Frontend logic: WebSocket client, REST API calls, dynamic updates.
Bilingual interface (EN/ES) with persistent language choice.
Local only. WARNING: authorized security testing only.
*/

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  // ---------------- i18n ----------------
  const I18N = {
    en: {
      st_project: 'PROJECT: default',
      st_session: 'SESSION: 00:00',
      st_engine_check: 'engine: checking',
      st_engine_online: 'engine: online',
      st_engine_offline: 'engine: offline (local)',
      st_free: 'FREE',
      st_pro: 'PRO',
      nav_terminal: 'TERMINAL',
      nav_vulns: 'VULNERABILITIES',
      nav_vault: 'VAULT',
      nav_reports: 'REPORTS',
      nav_memory: 'MEMORY',
      term_placeholder: 'type a command or question...',
      term_quick: 'QUICK:',
      quick_status: 'status',
      quick_nmap: 'nmap loopback',
      quick_searchsploit: 'searchsploit list',
      quick_whoami: 'whoami',
      vulns_title: 'VULNERABILITIES',
      vulns_refresh: 'REFRESH',
      vuln_exploit: 'EXPLOIT',
      vuln_details: 'DETAILS',
      vuln_mitigate: 'MITIGATE',
      vuln_none: 'no findings recorded',
      vault_title: 'CREDENTIAL VAULT',
      vault_reveal: 'REVEAL',
      vault_locked: 'Vault requires PRO activation.',
      vault_goto_pro: 'ACTIVATE PRO',
      vault_master_pw: 'master password',
      vault_unlock: 'UNLOCK',
      vault_service: 'service',
      vault_user: 'username',
      vault_pass: 'password',
      vault_store: 'STORE',
      vault_col_id: 'ID',
      vault_col_service: 'SERVICE',
      vault_col_user: 'USERNAME',
      vault_col_pass: 'PASSWORD',
      reports_title: 'REPORT GENERATOR',
      reports_locked: 'Report generation requires PRO activation.',
      reports_goto_pro: 'ACTIVATE PRO',
      reports_template: 'Template',
      reports_format: 'Format',
      reports_tpl_exec: 'Executive',
      reports_tpl_tech: 'Technical',
      reports_tpl_pci: 'PCI-DSS',
      reports_tpl_hipaa: 'HIPAA',
      reports_sec_scope: 'scope',
      reports_sec_findings: 'findings',
      reports_sec_recs: 'recommendations',
      reports_sec_risk: 'risk overview',
      reports_generate: 'GENERATE',
      reports_saved: 'report saved locally: ',
      reports_failed: 'generation failed',
      memory_title: 'MEMORY',
      memory_refresh: 'REFRESH',
      memory_hosts: 'HOSTS',
      memory_creds: 'CREDENTIALS',
      memory_notes: 'NOTES',
      memory_none: 'none',
      timeline_title: 'TIMELINE',
      pro_title: 'PRO ACTIVATION',
      pro_info: 'Price: 35 USDT (one-time, permanent).\nWallet (TON): ',
      pro_info2: '\nContact: ',
      pro_info3: ' on Telegram.\nSteps: pay, contact, send screenshot, receive 6-digit key, enter below.',
      pro_key_ph: '6-digit key',
      pro_activate: 'ACTIVATE',
      pro_close: 'CLOSE',
      pro_activated: 'PRO activated.',
      pro_invalid: 'Invalid key. The key was not accepted.',
      msg_engine_offline: 'Assistant engine offline. HackerBrain OS is a LOCAL application: the engine runs on this machine. Start your local engine (see data/config.yaml -> engine) to enable conversational analysis.',
      msg_quota: 'Free tier daily limit (20 queries) reached. Activate PRO for unlimited usage.',
      msg_unlock_failed: 'unlock failed',
      msg_vault_locked: 'vault locked or corrupted',
      msg_exploit: '[EXPLOIT] review the finding and craft a PoC manually. Authorized targets only.',
      msg_mitigate: '[MITIGATE] apply vendor patch, harden config, restrict exposure.',
      msg_details: '[DETAILS] stored in local memory. See MEMORY panel and reports.',
      msg_target: 'Target set to ',
      mem_placeholder: 'note title...'
    },
    es: {
      st_project: 'PROYECTO: default',
      st_session: 'SESION: 00:00',
      st_engine_check: 'engine: comprobando',
      st_engine_online: 'engine: en linea',
      st_engine_offline: 'engine: offline (local)',
      st_free: 'FREE',
      st_pro: 'PRO',
      nav_terminal: 'TERMINAL',
      nav_vulns: 'VULNERABILIDADES',
      nav_vault: 'VAULT',
      nav_reports: 'INFORMES',
      nav_memory: 'MEMORIA',
      term_placeholder: 'escribe un comando o una pregunta...',
      term_quick: 'RAPIDO:',
      quick_status: 'estado',
      quick_nmap: 'nmap loopback',
      quick_searchsploit: 'lista searchsploit',
      quick_whoami: 'whoami',
      vulns_title: 'VULNERABILIDADES',
      vulns_refresh: 'ACTUALIZAR',
      vuln_exploit: 'EXPLOTAR',
      vuln_details: 'DETALLES',
      vuln_mitigate: 'MITIGAR',
      vuln_none: 'sin hallazgos registrados',
      vault_title: 'VAULT DE CREDENCIALES',
      vault_reveal: 'REVELAR',
      vault_locked: 'El vault requiere activacion PRO.',
      vault_goto_pro: 'ACTIVAR PRO',
      vault_master_pw: 'contrasena maestra',
      vault_unlock: 'DESBLOQUEAR',
      vault_service: 'servicio',
      vault_user: 'usuario',
      vault_pass: 'contrasena',
      vault_store: 'GUARDAR',
      vault_col_id: 'ID',
      vault_col_service: 'SERVICIO',
      vault_col_user: 'USUARIO',
      vault_col_pass: 'CONTRASENA',
      reports_title: 'GENERADOR DE INFORMES',
      reports_locked: 'La generacion de informes requiere activacion PRO.',
      reports_goto_pro: 'ACTIVAR PRO',
      reports_template: 'Plantilla',
      reports_format: 'Formato',
      reports_tpl_exec: 'Ejecutivo',
      reports_tpl_tech: 'Tecnico',
      reports_tpl_pci: 'PCI-DSS',
      reports_tpl_hipaa: 'HIPAA',
      reports_sec_scope: 'alcance',
      reports_sec_findings: 'hallazgos',
      reports_sec_recs: 'recomendaciones',
      reports_sec_risk: 'vista de riesgo',
      reports_generate: 'GENERAR',
      reports_saved: 'informe guardado localmente: ',
      reports_failed: 'fallo la generacion',
      memory_title: 'MEMORIA',
      memory_refresh: 'ACTUALIZAR',
      memory_hosts: 'HOSTS',
      memory_creds: 'CREDENCIALES',
      memory_notes: 'NOTAS',
      memory_none: 'ninguno',
      timeline_title: 'LINEA DE TIEMPO',
      pro_title: 'ACTIVACION PRO',
      pro_info: 'Precio: 35 USDT (pago unico, permanente).\nWallet (TON): ',
      pro_info2: '\nContacto: ',
      pro_info3: ' en Telegram.\nPasos: pagar, contactar, enviar captura, recibir key de 6 digitos, introducirla abajo.',
      pro_key_ph: 'key de 6 digitos',
      pro_activate: 'ACTIVAR',
      pro_close: 'CERRAR',
      pro_activated: 'PRO activado.',
      pro_invalid: 'Key invalida. La key no fue aceptada.',
      msg_engine_offline: 'Assistant engine offline. HackerBrain OS es una aplicacion LOCAL: el engine corre en esta maquina. Arranca tu engine local (ver data/config.yaml -> engine) para habilitar el analisis conversacional.',
      msg_quota: 'Limite diario de la version gratuita (20 consultas) alcanzado. Activa PRO para uso ilimitado.',
      msg_unlock_failed: 'fallo el desbloqueo',
      msg_vault_locked: 'vault bloqueado o corrupto',
      msg_exploit: '[EXPLOTAR] revisa el hallazgo y crea un PoC manualmente. Solo objetivos autorizados.',
      msg_mitigate: '[MITIGAR] aplica el parche del proveedor, refuerza la configuracion, restringe la exposicion.',
      msg_details: '[DETALLES] almacenado en la memoria local. Ver panel MEMORIA e informes.',
      msg_target: 'Objetivo fijado: ',
      mem_placeholder: 'titulo de la nota...'
    }
  };

  const STORAGE_KEY = 'hb_lang';
  let lang = 'en';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') lang = saved;
  } catch (e) { /* private mode */ }

  function t(key) {
    const d = I18N[lang] || I18N.en;
    return d[key] !== undefined ? d[key] : I18N.en[key];
  }

  function applyLang() {
    // Static texts
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.dataset.i18n;
      if (el.tagName === 'OPTION') el.textContent = t(key);
      else el.textContent = t(key);
    });
    // Placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.placeholder = t(el.dataset.i18nPh);
    });
    // Pro modal info block
    $('pro-info').textContent =
      t('pro_info') + 'UQCznm2Z1o56J51EfNSnO922mzOQRhOF3m_o5T9Qx8WhK4w9' +
      t('pro_info2') + '@Cyt3rTo0ls' + t('pro_info3');
    document.documentElement.lang = lang;
    HBTerminal.setLang(lang);
    loadStatus();
  }

  function setLang(next) {
    lang = next === 'es' ? 'es' : 'en';
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    $('btn-lang').textContent = lang === 'en' ? 'EN' : 'ES';
    applyLang();
  }

  // ---------------- state ----------------
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
      $('status-time').textContent = t('st_session') + ' ' + fmtDuration(Date.now() - sessionStart);
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
        HBTerminal.print(data.message || t('msg_engine_offline'), 'out-err');
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
      $('btn-pro').textContent = pro ? t('st_pro') : t('st_free');
      $('btn-pro').classList.toggle('pro-on', pro);
      $('status-engine').textContent = s.engine_available
        ? t('st_engine_online')
        : t('st_engine_offline');
      $('status-ver').textContent = 'v' + s.version + ' LOCAL';
      const q = s.quota === -1 ? 'unlimited' : (s.queries_today + '/' + s.quota);
      $('status-project').textContent = t('st_project') + ' ' + s.project + ' | QUOTA: ' + q;
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
      const vulns = m.vulnerabilities || [];
      if (!vulns.length) {
        list.innerHTML = '<span class="dim">' + t('vuln_none') + '</span>';
      }
      vulns.forEach(function (v) {
        const card = document.createElement('div');
        card.className = 'vuln-card';
        card.innerHTML =
          '<span class="sev sev-' + v.severity + '">' + v.severity + '</span>' +
          '<span class="meta">' + (v.cve_id || 'no-cve') + ' | ' + (v.host || '?') + ':' + (v.port || '-') + '</span>' +
          '<span class="desc">' + (v.description || '').slice(0, 120) + '</span>' +
          '<div class="row">' +
          '  <button class="card-btn" data-act="exploit">' + t('vuln_exploit') + '</button>' +
          '  <button class="card-btn" data-act="details">' + t('vuln_details') + '</button>' +
          '  <button class="card-btn" data-act="mitigate">' + t('vuln_mitigate') + '</button>' +
          '</div>';
        list.appendChild(card);
      });
      renderMemory(m);
    } catch (e) { /* ignore */ }
  }

  function renderMemory(m) {
    const none = t('memory_none');
    $('mem-hosts').innerHTML = (m.hosts || []).map(function (h) {
      return '<li>' + h.ip + (h.os ? ' [' + h.os + ']' : '') + '</li>';
    }).join('') || '<li class="dim">' + none + '</li>';

    $('mem-creds').innerHTML = (m.credentials || []).map(function (c) {
      return '<li>' + c.username + '@' + (c.host || '?') + '</li>';
    }).join('') || '<li class="dim">' + none + '</li>';

    $('mem-notes').innerHTML = (m.notes || []).slice(0, 10).map(function (n) {
      return '<li>' + (n.title || 'note').slice(0, 40) + '</li>';
    }).join('') || '<li class="dim">' + none + '</li>';
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
    if (!r.ok) {
      HBTerminal.print((r.error || t('msg_unlock_failed')).replace(/^vault locked or corrupted/, t('msg_vault_locked')), 'out-err');
      return;
    }
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
      ? t('reports_saved') + r.file
      : (r.error || t('reports_failed'));
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
    $('pro-result').textContent = r.ok ? t('pro_activated') : t('pro_invalid');
    if (r.ok) {
      pro = true;
      $('btn-pro').textContent = t('st_pro');
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

    $('btn-lang').addEventListener('click', function () {
      setLang(HBTerminal.getLang() === 'en' ? 'es' : 'en');
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
      const msg =
        btn.dataset.act === 'exploit' ? t('msg_exploit') :
        btn.dataset.act === 'mitigate' ? t('msg_mitigate') :
        t('msg_details');
      HBTerminal.print(msg, 'out-info');
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
    setLang(lang); // apply stored language (sets banner text, labels, status)
    wireEvents();
    setSessionTimer();
    connectWS();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
