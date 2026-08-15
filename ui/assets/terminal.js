/*
HackerBrain OS - terminal.js
Terminal emulator: command history, output formatting, syntax highlighting.
Supports EN/ES interface language. Local only.
WARNING: authorized security testing only.
*/

(function () {
  'use strict';

  const outEl = document.getElementById('term-output');
  const inputEl = document.getElementById('term-input');

  const history = [];
  let historyIndex = -1;
  let lang = 'en';

  const STR = {
    en: {
      banner: [
        'HACKERBRAIN OS - LOCAL PENTESTING COMMAND CENTER',
        'local session | authorized testing only | offline engine',
        'type "help" for commands, or ask a question in plain text',
        ''
      ],
      analysis: '--- engine analysis ---',
      nonZero: '(command returned non-zero)',
      noOutput: '(no output)',
      engineOffline: '[assistant engine offline] Engine not reachable on localhost.',
      seconds: 's'
    },
    es: {
      banner: [
        'HACKERBRAIN OS - CENTRO LOCAL DE PENTESTING',
        'sesion local | solo pruebas autorizadas | engine offline',
        'escribe "help" para comandos, o haz una pregunta en texto plano',
        ''
      ],
      analysis: '--- analisis del engine ---',
      nonZero: '(el comando devolvio codigo distinto de cero)',
      noOutput: '(sin salida)',
      engineOffline: '[assistant engine offline] Engine no accesible en localhost.',
      seconds: 's'
    }
  };

  function str(key) {
    const d = STR[lang] || STR.en;
    return d[key] !== undefined ? d[key] : STR.en[key];
  }

  function esc(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function highlight(line) {
    // minimal syntax highlighting for common tokens
    let out = esc(line);
    out = out.replace(
      /(nmap|masscan|gobuster|ffuf|feroxbuster|nikto|wpscan|sqlmap|hydra|john|hashcat|nuclei|searchsploit|msfconsole|tcpdump|tshark|aircrack-ng|whois|dig|curl|wget|ping|nslookup|host|amass|sublist3r|theHarvester)/g,
      '<span class="accent">$1</span>'
    );
    out = out.replace(/(-[A-Za-z0-9]+)/g, '<span class="out-warn">$1</span>');
    out = out.replace(/(\d+\.\d+\.\d+\.\d+)/g, '<span class="out-ok">$1</span>');
    return out;
  }

  function print(text, cls) {
    const div = document.createElement('div');
    div.className = 'out-line ' + (cls || '');
    div.innerHTML = cls === 'out-cmd' ? highlight(text) : esc(text);
    outEl.appendChild(div);
    outEl.scrollTop = outEl.scrollHeight;
  }

  function clear() {
    outEl.innerHTML = '';
  }

  function renderResult(res) {
    if (!res) return;
    if (res.verbose && Array.isArray(res.verbose)) {
      res.verbose.forEach(function (v) {
        print(v, 'out-verbose');
      });
    }
    if (res.error) print(res.error, 'out-err');
    if (res.output) {
      String(res.output).split('\n').forEach(function (l) {
        print(l, 'out-info');
      });
    } else if (res.ok) {
      print(str('noOutput'), 'out-info');
    }
    if (res.analysis) {
      print(str('analysis'), 'out-ok');
      print(res.analysis, 'out-ok');
    }
    if (res.ok === false && !res.error) print(str('nonZero'), 'out-warn');
    print('[' + (res.duration || '0.00') + str('seconds') + ']', 'out-info');
  }

  function printBanner() {
    str('banner').forEach(function (l) { print(l, 'out-cmd'); });
  }

  function submit(cb) {
    const value = inputEl.value.trim();
    if (!value) return;
    history.push(value);
    historyIndex = history.length;
    print('> ' + value, 'out-cmd');
    inputEl.value = '';
    cb(value);
  }

  function onKey(e, cb) {
    if (e.key === 'Enter') {
      submit(cb);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex -= 1;
        inputEl.value = history[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        historyIndex += 1;
        inputEl.value = history[historyIndex];
      } else {
        historyIndex = history.length;
        inputEl.value = '';
      }
    }
  }

  // Switch language and re-print the banner (output history is kept).
  function setLang(next) {
    lang = next === 'es' ? 'es' : 'en';
    clear();
    printBanner();
  }

  function getLang() {
    return lang;
  }

  window.HBTerminal = {
    print: print,
    printBanner: printBanner,
    renderResult: renderResult,
    submit: submit,
    onKey: onKey,
    setLang: setLang,
    getLang: getLang,
    str: str
  };
})();
