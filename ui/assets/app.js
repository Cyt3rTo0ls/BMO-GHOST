/*
BMO-GHOST - app.js
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
      nav_sections: 'NAVIGATION',
      nav_terminal: 'TERMINAL',
      nav_vulns: 'VULNERABILITIES',
      nav_vault: 'VAULT',
      nav_reports: 'REPORTS',
      nav_memory: 'MEMORY',
      nav_pro: 'PRO',
      nav_iotmap: 'IoT MAP',
      nav_osintgraph: 'OSINT GRAPH',
      osintgraph_title: 'OSINT RELATIONSHIP GRAPH',
      osintgraph_locked: 'The OSINT relationship graph requires PRO activation.',
      osintgraph_goto_pro: 'ACTIVATE PRO',
      osintgraph_seed_ph: 'alice@example.com / example.com / 8.8.8.8 / username / +34 600...',
      osintgraph_build: 'BUILD GRAPH',
      facecheck_key: 'FaceCheck ID API key:',
      facecheck_key_ph: 'your FaceCheck ID API key',
      facecheck_savekey: 'SAVE KEY',
      facecheck_image_ph: 'https://.../photo.jpg  or  /local/path.jpg',
      facecheck_search: 'SEARCH FACE',
      iotmap_title: 'GLOBAL EXPOSED DEVICES / IoT',
      iotmap_locked: 'The global exposed-devices map requires PRO activation.',
      iotmap_goto_pro: 'ACTIVATE PRO',
      iotmap_query_ph: 'cameras OR routers OR port:3389',
      iotmap_search: 'SEARCH',
      iotmap_key: 'Shodan API key:',
      iotmap_key_ph: 'your Shodan API key',
      iotmap_savekey: 'SAVE KEY',
      iotmap_hosts: 'HOSTS',
      iotmap_map3d: '3D GLOBE MAP',
      iotmap_filters: 'FILTERS / PRESETS',
      iotmap_filter: 'APPLY COUNTRY',
      iotmap_cat_all: 'Category...',
      iotmap_nokey: 'Add your Shodan API key above to start. (Stored only on your machine, never uploaded.)',
      iotmap_searching: 'Searching Shodan',
      iotmap_noresults: 'No geolocated results to map.',
      term_placeholder: 'type a command or question...',
      term_quick: 'QUICK:',
      quick_status: 'status',
      quick_nmap: 'nmap loopback',
      quick_searchsploit: 'searchsploit list',
      quick_whoami: 'whoami',
      vuln_empty: 'No findings recorded yet. Run a scan or an autonomous engagement to populate this panel.',
      vuln_empty_icon: 'no data',
      vault_unlocked: 'Vault unlocked.',
      vault_stored: 'Credential stored.',
      vault_wrong_pw: 'Vault locked or corrupted.',
      report_ok: 'Report generated successfully.',
      toast_engine_offline: 'Assistant engine offline. Running in local-only mode.',
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
      pro_info: 'Price: 15 USDT (one-time, permanent).\nWallet (TON): ',
      pro_info2: '\nContact: ',
      pro_info3: ' on Telegram.\nSteps: pay, contact, send a screenshot of the payment, receive 6-digit key, enter below.',
      pro_key_ph: '6-digit key',
      pro_activate: 'ACTIVATE',
      pro_close: 'CLOSE',
      pro_activated: 'PRO activated.',
      pro_invalid: 'Invalid key. The key was not accepted.',
      msg_engine_offline: 'Assistant engine offline. BMO-GHOST is a LOCAL application: the engine runs on this machine. Start your local engine (see data/config.yaml -> engine) to enable conversational analysis.',
      msg_quota: 'Free tier daily limit (20 queries) reached. Activate PRO for unlimited usage.',
      msg_unlock_failed: 'unlock failed',
      msg_vault_locked: 'vault locked or corrupted',
      msg_exploit: '[EXPLOIT] review the finding and craft a PoC manually. Authorized targets only.',
      msg_mitigate: '[MITIGATE] apply vendor patch, harden config, restrict exposure.',
      msg_details: '[DETAILS] stored in local memory. See MEMORY panel and reports.',
      model_sel_t: 'Active model (local engine)',
      def_btn_t: 'Defensive mode: honeyports + scan detection',
      export_btn_t: 'Export engagement as ZIP',
      mobile_btn_t: 'Phone / remote access setup',
      mobile_title: 'PHONE REMOTE ACCESS',
      mobile_intro: 'Control BMO-GHOST from your phone on the same WiFi. Install the APK, enter these values, unlock with the PIN.',
      mobile_ip: 'PC IP', mobile_port: 'Port', mobile_pin: 'Login PIN',
      mobile_status: 'Status',
      mobile_ok: 'PHONE MODE ACTIVE - reachable on the network',
      mobile_fw_closed: 'Phone mode OFF - the port is closed by the firewall',
      mobile_fw_after: 'Run this once, then press the button again to verify.',
      mobile_fw_copy: 'Copy this command and run it in a terminal (sudo), then reopen this panel.',
      mobile_host_hint: 'Make sure the server listens on the network:',
      mobile_restart_hint: 'Server is bound to localhost only. Restart it listening on the network:',
      mobile_activate: 'ACTIVATE PHONE MODE',
      mobile_dl: 'DOWNLOAD APK', mobile_close: 'CLOSE',
      pin_t: 'Remote access PIN - enter it on your phone',
      def_on: 'DEF: ON', def_off: 'DEF: OFF',
      login_title: 'BMO-GHOST REMOTE ACCESS',
      login_info: 'You are connecting from another device. Enter the 6-digit PIN shown on the PC to unlock.',
      login_btn: 'UNLOCK', login_ok: 'Remote access unlocked.', login_bad: 'Invalid PIN.',
      def_started: 'Defensive mode ON - honeyports listening.',
      def_stopped: 'Defensive mode OFF.',
      def_scan_alert: '⚠ Possible scan from {ip} (honeyport sweep)',
      def_hit_alert: 'Honeyport hit from {ip}',
      iotmap_monitor: 'MONITOR',
      iot_monitor_on: 'Monitoring query. Alerts will appear when new devices show up.',
      iot_monitor_off: 'Monitoring stopped.',
      iot_new_dev: '🆕 {n} new device(s) for monitored query',
      export_ok: 'Engagement exported (ZIP).', export_fail: 'Export failed (PRO feature?).',
      msg_target: 'Target set to ',
      mem_placeholder: 'note title...',
      pro_view_title: 'PRO FEATURES',
      pro_view_note: 'The free version keeps working: 20 engine queries/day, 50 memory entries, 2 projects, basic recon, dark interface and session timeline. PRO adds the capabilities below.',
      pro_col_free: 'FREE',
      pro_col_pro: 'PRO',
      pro_free_features: [
        '20 assistant engine queries per day',
        '50 memory entries (wiped at session end)',
        '2 simultaneous active projects',
        'Basic reconnaissance tools',
        'Full dark interface',
        'Conversational terminal',
        'Current-session timeline',
        'No report export',
        '1 hour of continuous session'
      ],
      pro_pro_features: [
        'Unlimited assistant engine',
        'Autonomous agent (asks before executing attacks)',
        'Encrypted credential vault (AES-256)',
        'Professional reports (PDF, DOCX, HTML, Markdown)',
        'Persistent memory between sessions',
        'Unlimited projects',
        'Exportable timeline with forensic timestamps',
        'Severity auto-tagging',
        'Semantic memory search',
        'Session snapshots',
        'Mitigation suggestions per vulnerability',
        'Teacher mode (step-by-step)',
        'Local REST API for automation',
        'Slack / Discord / Telegram webhooks',
        'Python plugin system',
        'Automated scan scheduler',
        'Custom PoC integration',
        'IoT / exposed-services scanning (MQTT, OPC-UA, Modbus, CoAP, TR-069, RTSP)',
        'Gamification (achievements and badges)',
        'LAN multi-user collaboration',
        'Playbook marketplace',
        'All Kali Linux / Parrot OS tools',
        'Global IoT map with Shodan (your key, interactive world map)',
        'OSINT relationship graph (Maltego-style, 12 entity types)',
        'Reverse face search (FaceCheck ID, your key)',
        'Defensive mode: honeyports + incoming scan detection',
        'Exposed-credential / breach monitoring',
        'Stealth mode: low-and-slow invisible scanning',
        'Engagement export to ZIP (timeline + findings + report)',
        'Phone remote control (Android APK + PIN login)',
        'IP reputation scoring (abuse reports + blacklists)',
        'Vulnerability confirmation before reporting (verifier engine)',
        'Tech fingerprinting of any target (framework/stack)',
        'Subdomain drift monitor (new hosts alert)',
        'Smart attack-path suggestions from findings',
        'Auto-prioritized remediation plan per host',
        'BMO avatar: 7 live facial expressions tied to engine state',
        'Bilingual AI terminal (EN/ES) with stealth telemetry',
        'Model switcher (pick any local Ollama model at runtime)',
        'Forensic export with SHA-256 evidence hashes',
        'Weekly auto-scan of saved targets',
        'One-command full pentest: recon + scan + exploit + report',
        'Honeytoken generator (fake creds that alert on use)',
        'CVE-to-exploit mapping with local PoC hints',
        'Network attack-surface visualization',
        'Credential spraying detection on local services',
        'Wireless audit suite (WPA handshake capture, deauth)',
        'API fuzzing presets (REST/GraphQL/gRPC)',
        'Password policy auditor (NIST checklist)',
        'Session timeline replay (forensic playback)',
        'Dork generator with one-click search links',
        'Metadata forensics (EXIF/GPS on documents and images)',
        'Fake identity generator (fakenamegenerator.com style, 5 locales)',
        'IP geolocation (country, city, ISP, coords)',
        'CVE lookup engine (by ID or keyword, live feed)',
        'NIST-compliant password generator (800-63B)',
        'Random MAC address generator',
        'Target-specific wordlist builder',
        'Encoder/decoder toolkit (base64, hex, URL, ROT13, binary)',
        'Hash calculator (MD5, SHA1, SHA256, SHA512)',
        'QR code generator',
        'Live DNS blacklist reputation scoring',
        'Subdomain drift monitor with snapshots',
        'Honeytoken canary credentials that alert on use',
        'Reverse shell generator (bash, python, nc, php, perl, ruby, powershell)',
        'msfvenom payload factory (Windows/Linux/Android/php/python/macOS)',
        'Phishing page cloner for authorized social-engineering tests',
        'Office macro (VBA) generator for AV-lab simulations',
        'Persistence script generator (cron, systemd, bashrc, LD_PRELOAD)',
        'Keylogger script generator (authorized lab testing)',
        'Wireless audit workflow (WPA handshake capture + deauth)',
        'Payload + post-exploitation lab suite (SET / Metasploit style)',
        'LSB image steganography (hide data inside images)',
        'IP obfuscation (decimal, octal, hex, IPv6-mapped notations)',
        'Favicon fingerprinting (Shodan-style hash to pivot identical servers)',
        'Subdomain takeover scanner (S3, GitHub Pages, Heroku, Azure fingerprints)',
        'Email spoofing posture (SPF / DMARC / DKIM grading)',
        'Homograph domain generator (typosquat + punycode lookalikes)',
        'CORS misconfiguration scanner (origin reflection probes)',
        'TTL / CDN infrastructure fingerprint',
        'Realistic User-Agent generator (evasion / bot-detection tests)',
        'Offline license-key generator (Luhn checksum, serverless validation)',
        'Phone mode from the web dashboard (open port + PIN for the APK)',
        'Certificate-transparency subdomain discovery (crt.sh + CertSpotter, no key)',
        'Live TLS certificate parser (issuer, SANs, expiry, TLS version)',
        'One-shot web fingerprint (title, server, tech stack, redirects)',
        'robots.txt recon parser (interesting hidden paths)',
        'Cookie hygiene audit (HttpOnly/Secure/SameSite flags)',
        'TCP banner grabber (version disclosure, no full scan)',
        'DNSSEC posture check (signed zones + algorithms)',
        'Local subdomain brute-force (60+ names, invisible to web logs)',
        'Tor exit-node detection (Tor Project exit list)',
        'ASN / network ownership lookup (bgpview + ip-api fallback)',
        'XOR cipher + single-byte key brute force (English scoring)',
        'Recursive base decoder (base16/32/58/64/85 layered)',
        'Hash type identifier (MD5/NTLM/SHA*/bcrypt/phpass...)',
        'Shannon entropy analyzer (spot encrypted/obfuscated payloads)',
        'JWT decoder + HS256 weak-secret cracker',
        'Magic-byte file type detector (offline `file` replacement)',
        'Leetspeak variant generator (smarter cracking wordlists)',
        'Case-permutation generator (bounded password expansion)',
        'Number-pattern generator (years, dates, sequences appended)',
        'Password strength scorer (zxcvbn-lite, offline)',
        'IOC extractor (IPs, domains, URLs, emails, hashes, paths from any text)',
        'URL defanger/refanger (hxxp:// + [.] for safe report sharing)',
        'UUID v4 generator + version/variant parser',
        'MAC vendor lookup (built-in OUI table, offline)',
        'AV-evasion payload factory (msfvenom encoders + UPX packing, lab)',
        'Privilege-escalation checklist generator (Linux + Windows)',
        'Lateral movement builder (impacket, SSH pivots, chisel)',
        'Data-exfiltration techniques (DNS/ICMP/HTTP/tunnel, DLP testing)',
        'Phishing email generator (raw SMTP + tracking pixel, authorized sims)',
        'Rubber Ducky script generator (USB HID lab)',
        'HTML smuggling generator (malware-delivery lab)',
        'Minimal C2 server + agent pair (lab beacon testing)',
        'mimikatz command builder (credential-theft lab)',
        'impacket suite command builder (psexec/wmiexec/secretsdump...)',
        'LLMNR/NBT-NS poisoning launcher (internal lab)',
        'Rogue AP config generator (hostapd + dnsmasq, WiFi lab)',
        'Ransomware SIMULATOR (sandbox-only, AES + restore)',
        'BeEF hook generator (browser lab)',
        'Tunneling / pivoting builder (SSH -L/-R/-D, chisel, iodine)'
      ]
    },
    es: {
      st_project: 'PROYECTO: default',
      st_session: 'SESION: 00:00',
      st_engine_check: 'engine: comprobando',
      st_engine_online: 'engine: en linea',
      st_engine_offline: 'engine: offline (local)',
      st_free: 'FREE',
      st_pro: 'PRO',
      nav_sections: 'NAVEGACION',
      nav_terminal: 'TERMINAL',
      nav_vulns: 'VULNERABILIDADES',
      nav_vault: 'VAULT',
      nav_reports: 'INFORMES',
      nav_memory: 'MEMORIA',
      nav_pro: 'PRO',
      nav_iotmap: 'MAPA IoT',
      nav_osintgraph: 'GRAFO OSINT',
      osintgraph_title: 'GRAFO DE RELACIONES OSINT',
      osintgraph_locked: 'El grafo de relaciones OSINT requiere activacion PRO.',
      osintgraph_goto_pro: 'ACTIVAR PRO',
      osintgraph_seed_ph: 'alice@example.com / example.com / 8.8.8.8 / usuario / +34 600...',
      osintgraph_build: 'CONSTRUIR GRAFO',
      facecheck_key: 'FaceCheck ID API key:',
      facecheck_key_ph: 'tu FaceCheck ID API key',
      facecheck_savekey: 'GUARDAR KEY',
      facecheck_image_ph: 'https://.../foto.jpg  o  /ruta/local.jpg',
      facecheck_search: 'BUSCAR CARA',
      iotmap_title: 'MAPA GLOBAL DE DISPOSITIVOS EXPUESTOS / IOT',
      iotmap_locked: 'El mapa global de dispositivos expuestos requiere activacion PRO.',
      iotmap_goto_pro: 'ACTIVAR PRO',
      iotmap_query_ph: 'cameras OR routers OR port:3389',
      iotmap_search: 'BUSCAR',
      iotmap_key: 'Shodan API key:',
      iotmap_key_ph: 'tu Shodan API key',
      iotmap_savekey: 'GUARDAR KEY',
      iotmap_hosts: 'HOSTS',
      iotmap_map3d: 'MAPA GLOBO 3D',
      iotmap_filters: 'FILTROS / PRESETS',
      iotmap_filter: 'APLICAR PAIS',
      iotmap_cat_all: 'Categoria...',
      iotmap_nokey: 'Configura tu Shodan API key arriba para empezar. (Se guarda solo en tu maquina, nunca se sube).',
      iotmap_searching: 'Buscando en Shodan',
      iotmap_noresults: 'Sin resultados con coordenadas para mapear.',
      term_placeholder: 'escribe un comando o una pregunta...',
      term_quick: 'RAPIDO:',
      quick_status: 'estado',
      quick_nmap: 'nmap loopback',
      quick_searchsploit: 'lista searchsploit',
      quick_whoami: 'whoami',
      vuln_empty: 'Aun no hay hallazgos registrados. Ejecuta un escaneo o un modo autonomo para poblar este panel.',
      vuln_empty_icon: 'sin datos',
      vault_unlocked: 'Vault desbloqueado.',
      vault_stored: 'Credencial guardada.',
      vault_wrong_pw: 'Vault bloqueado o corrupto.',
      report_ok: 'Informe generado correctamente.',
      toast_engine_offline: 'Assistant engine offline. Modo solo-local activo.',
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
      pro_info: 'Precio: 15 USDT (pago unico, permanente).\nWallet (TON): ',
      pro_info2: '\nContacto: ',
      pro_info3: ' en Telegram.\nPasos: pagar, contactar, enviar el capture del pago, recibir key de 6 digitos, introducirla abajo.',
      pro_key_ph: 'key de 6 digitos',
      pro_activate: 'ACTIVAR',
      pro_close: 'CERRAR',
      pro_activated: 'PRO activado.',
      pro_invalid: 'Key invalida. La key no fue aceptada.',
      msg_engine_offline: 'Assistant engine offline. BMO-GHOST es una aplicacion LOCAL: el engine corre en esta maquina. Arranca tu engine local (ver data/config.yaml -> engine) para habilitar el analisis conversacional.',
      msg_quota: 'Limite diario de la version gratuita (20 consultas) alcanzado. Activa PRO para uso ilimitado.',
      msg_unlock_failed: 'fallo el desbloqueo',
      msg_vault_locked: 'vault bloqueado o corrupto',
      msg_exploit: '[EXPLOTAR] revisa el hallazgo y crea un PoC manualmente. Solo objetivos autorizados.',
      msg_mitigate: '[MITIGAR] aplica el parche del proveedor, refuerza la configuracion, restringe la exposicion.',
      msg_details: '[DETALLES] almacenado en la memoria local. Ver panel MEMORIA e informes.',
      model_sel_t: 'Modelo activo (engine local)',
      def_btn_t: 'Modo defensivo: honeyports + deteccion de escaneos',
      export_btn_t: 'Exportar el engagement como ZIP',
      mobile_btn_t: 'Configuracion de acceso remoto / celular',
      mobile_title: 'ACCESO REMOTO DESDE EL CELULAR',
      mobile_intro: 'Controla BMO-GHOST desde tu celular en el mismo WiFi. Instala la APK, introduce estos datos y desbloquea con el PIN.',
      mobile_ip: 'IP de la PC', mobile_port: 'Puerto', mobile_pin: 'PIN de acceso',
      mobile_status: 'Estado',
      mobile_ok: 'MODO CELULAR ACTIVO - accesible en la red',
      mobile_fw_closed: 'Modo celular APAGADO - el puerto esta cerrado por el firewall',
      mobile_fw_after: 'Ejecuta esto una vez, luego pulsa el boton para verificar.',
      mobile_fw_copy: 'Copia este comando y ejecutalo en una terminal (sudo), luego reabre este panel.',
      mobile_host_hint: 'Asegurate de que el servidor escuche en la red:',
      mobile_restart_hint: 'El servidor solo escucha en localhost. Reinicialo escuchando en la red:',
      mobile_activate: 'ACTIVAR MODO CELULAR',
      mobile_dl: 'DESCARGAR APK', mobile_close: 'CERRAR',
      pin_t: 'PIN de acceso remoto - introducelo en tu celular',
      def_on: 'DEF: ON', def_off: 'DEF: OFF',
      login_title: 'BMO-GHOST ACCESO REMOTO',
      login_info: 'Te estas conectando desde otro dispositivo. Introduce el PIN de 6 digitos que muestra la PC para desbloquear.',
      login_btn: 'DESBLOQUEAR', login_ok: 'Acceso remoto desbloqueado.', login_bad: 'PIN invalido.',
      def_started: 'Modo defensivo ON - honeyports escuchando.',
      def_stopped: 'Modo defensivo OFF.',
      def_scan_alert: '⚠ Posible escaneo desde {ip} (barrido de honeyports)',
      def_hit_alert: 'Toque de honeyport desde {ip}',
      iotmap_monitor: 'MONITOREAR',
      iot_monitor_on: 'Buscando en monitoreo. Habra alertas cuando aparezcan dispositivos nuevos.',
      iot_monitor_off: 'Monitoreo detenido.',
      iot_new_dev: '🆕 {n} dispositivo(s) nuevo(s) en la busqueda monitoreada',
      export_ok: 'Engagement exportado (ZIP).', export_fail: 'Fallo el export (¿es PRO?).',
      msg_target: 'Objetivo fijado: ',
      mem_placeholder: 'titulo de la nota...',
      pro_view_title: 'FUNCIONES PRO',
      pro_view_note: 'La version gratuita sigue funcionando: 20 consultas al engine por dia, 50 entradas de memoria, 2 proyectos, reconocimiento basico, interfaz oscura completa y linea de tiempo de sesion. PRO anade las capacidades de abajo.',
      pro_col_free: 'FREE',
      pro_col_pro: 'PRO',
      pro_free_features: [
        '20 consultas al assistant engine por dia',
        '50 entradas de memoria (se borran al cerrar sesion)',
        '2 proyectos activos simultaneos',
        'Herramientas de reconocimiento basico',
        'Interfaz oscura completa',
        'Terminal conversacional',
        'Linea de tiempo de sesion actual',
        'Sin exportacion de informes',
        '1 hora de sesion continua'
      ],
      pro_pro_features: [
        'Assistant engine ilimitado',
        'Agente autonomo (pregunta antes de ejecutar ataques)',
        'Vault de credenciales cifrado (AES-256)',
        'Informes profesionales (PDF, DOCX, HTML, Markdown)',
        'Memoria persistente entre sesiones',
        'Proyectos ilimitados',
        'Linea de tiempo exportable con marcas forenses',
        'Auto-etiquetado por severidad',
        'Busqueda semantica en memoria',
        'Snapshots de sesion',
        'Sugerencia de mitigacion por vulnerabilidad',
        'Modo Teacher (explicaciones paso a paso)',
        'API REST local para automatizacion',
        'Webhooks a Slack / Discord / Telegram',
        'Sistema de plugins en Python',
        'Scheduler de escaneos automaticos',
        'Integracion de PoCs personalizados',
        'Escaneo de IoT / servicios expuestos (MQTT, OPC-UA, Modbus, CoAP, TR-069, RTSP)',
        'Gamificacion (logros y badges tecnicos)',
        'Colaboracion multiusuario en red local',
        'Marketplace de playbooks',
        'Acceso a TODAS las herramientas de Kali Linux / Parrot OS',
        'Mapa global de IoT con Shodan (tu key, globo 3D interactivo con filtros)',
        'Grafo de relaciones OSINT (estilo Maltego, 12 tipos de entidad)',
        'Busqueda facial inversa (FaceCheck ID, con tu key)',
        'Modo defensivo: honeyports + deteccion de escaneos entrantes',
        'Monitoreo de filtraciones / credenciales expuestas',
        'Modo sigilo: escaneo invisible low-and-slow',
        'Exportacion del engagement en ZIP (timeline + hallazgos + informe)',
        'Control remoto desde el celular (APK Android + login por PIN)',
        'Puntuacion de reputacion de IP (abusos + listas negras)',
        'Confirmacion de vulnerabilidades antes de reportarlas (verificador)',
        'Huella tecnologica de cualquier objetivo (framework/stack)',
        'Monitor de deriva de subdominios (alerta de hosts nuevos)',
        'Sugerencias inteligentes de ruta de ataque desde los hallazgos',
        'Plan de remediacion auto-priorizado por host',
        'Avatar BMO: 7 expresiones faciales en vivo segun el estado del engine',
        'Terminal IA bilingue (EN/ES) con telemetria sigilosa',
        'Switcher de modelos (elige cualquier modelo Ollama local al vuelo)',
        'Exportacion forense con hashes SHA-256 de evidencia',
        'Auto-escaneo semanal de objetivos guardados',
        'Pentest completo de un comando: recon + scan + exploit + informe',
        'Generador de honeytokens (credenciales falsas que alertan al usarse)',
        'Mapeo CVE-a-exploit con pistas de PoC locales',
        'Visualizacion de la superficie de ataque de la red',
        'Deteccion de credential spraying en servicios locales',
        'Suite de auditoria inalambrica (captura de handshake WPA, deauth)',
        'Presets de fuzzing de APIs (REST/GraphQL/gRPC)',
        'Auditor de politicas de contraseñas (checklist NIST)',
        'Replay de la linea de tiempo de sesion (reproduccion forense)',
        'Generador de dorks con enlaces de busqueda de un clic',
        'Forensia de metadatos (EXIF/GPS en documentos e imagenes)',
        'Generador de identidades falsas (estilo fakenamegenerator, 5 idiomas)',
        'Geolocalizacion de IP (pais, ciudad, ISP, coordenadas)',
        'Motor de consulta de CVEs (por ID o palabra clave, feed en vivo)',
        'Generador de contraseñas NIST (800-63B)',
        'Generador de direcciones MAC aleatorias',
        'Constructor de wordlists personalizadas por objetivo',
        'Kit de codificadores/decodificadores (base64, hex, URL, ROT13, binario)',
        'Calculadora de hashes (MD5, SHA1, SHA256, SHA512)',
        'Generador de codigos QR',
        'Puntuacion de reputacion DNSBL en vivo',
        'Monitor de deriva de subdominios con snapshots',
        'Credenciales honeytoken canary que alertan al usarse',
        'Generador de reverse shells (bash, python, nc, php, perl, ruby, powershell)',
        'Fabrica de payloads msfvenom (Windows/Linux/Android/php/python/macOS)',
        'Clonador de paginas de phishing para pruebas de ingenieria social autorizadas',
        'Generador de macros de Office (VBA) para simulaciones de laboratorio AV',
        'Generador de scripts de persistencia (cron, systemd, bashrc, LD_PRELOAD)',
        'Generador de scripts keylogger (pruebas de laboratorio autorizadas)',
        'Flujo de auditoria inalambrica (captura de handshake WPA + deauth)',
        'Suite de laboratorio de payloads y post-explotacion (estilo SET / Metasploit)',
        'Esteganografia LSB en imagenes (oculta datos dentro de imagenes)',
        'Ofuscacion de IP (notaciones decimal, octal, hex, IPv6-mapped)',
        'Huella de favicon (hash estilo Shodan para pivotar servidores identicos)',
        'Escanner de subdomain takeover (S3, GitHub Pages, Heroku, Azure)',
        'Postura de seguridad de email (calificacion SPF / DMARC / DKIM)',
        'Generador de dominios homografos (typosquat + punycode)',
        'Escanner de malas configuraciones CORS (sondas de reflexion de origen)',
        'Huella de infraestructura TTL / CDN',
        'Generador de User-Agents realistas (pruebas de evasion / anti-bot)',
        'Generador de claves de licencia offline (checksum Luhn, validacion sin servidor)',
        'Modo celular desde el dashboard web (abre puerto + PIN para la APK)',
        'Descubrimiento de subdominios por transparencia de certificados (crt.sh + CertSpotter, sin key)',
        'Parser de certificados TLS en vivo (emisor, SANs, expiracion, version TLS)',
        'Huella web de un solo disparo (titulo, servidor, stack, redirecciones)',
        'Parser de robots.txt (rutas internas interesantes)',
        'Auditoria de cookies (flags HttpOnly/Secure/SameSite)',
        'Captura de banners TCP (divulgacion de versiones, sin escaneo completo)',
        'Chequeo de postura DNSSEC (zonas firmadas + algoritmos)',
        'Fuerza bruta local de subdominios (60+ nombres, invisible en logs web)',
        'Deteccion de nodos de salida Tor (lista de Tor Project)',
        'Consulta de ASN / propietario de red (bgpview + fallback ip-api)',
        'Cifrado XOR + fuerza bruta de clave de 1 byte (scoring en ingles)',
        'Decodificador base recursivo (base16/32/58/64/85 en capas)',
        'Identificador de tipo de hash (MD5/NTLM/SHA*/bcrypt/phpass...)',
        'Analizador de entropia de Shannon (detecta payloads cifrados/ofuscados)',
        'Decodificador JWT + cracker de secretos HS256 debiles',
        'Detector de tipo de archivo por magic bytes (reemplazo offline de file)',
        'Generador de variantes leetspeak (wordlists de cracking mas inteligentes)',
        'Generador de permutaciones de mayusculas (expansion de passwords acotada)',
        'Generador de patrones numericos (anios, fechas, secuencias)',
        'Evaluador de fortaleza de passwords (zxcvbn-lite, offline)',
        'Extractor de IOCs (IPs, dominios, URLs, emails, hashes, rutas de cualquier texto)',
        'Defang/refang de URLs (hxxp:// + [.] para compartir informes seguros)',
        'Generador de UUID v4 + parser de version/variante',
        'Consulta de fabricante de MAC (tabla OUI integrada, offline)',
        'Fabrica de payloads con evasion de AV (encoders msfvenom + UPX, laboratorio)',
        'Generador de checklist de escalada de privilegios (Linux + Windows)',
        'Constructor de movimiento lateral (impacket, pivotes SSH, chisel)',
        'Tecnicas de exfiltracion de datos (DNS/ICMP/HTTP/tunel, pruebas DLP)',
        'Generador de emails de phishing (SMTP crudo + pixel de tracking, sims autorizadas)',
        'Generador de scripts Rubber Ducky (laboratorio USB HID)',
        'Generador de HTML smuggling (laboratorio de entrega de malware)',
        'Par C2 minimo servidor + agente (pruebas de beacon en laboratorio)',
        'Constructor de comandos mimikatz (laboratorio de robo de credenciales)',
        'Constructor de comandos de la suite impacket (psexec/wmiexec/secretsdump...)',
        'Lanzador de envenenamiento LLMNR/NBT-NS (laboratorio interno)',
        'Generador de configs de AP rogue (hostapd + dnsmasq, laboratorio WiFi)',
        'SIMULADOR de ransomware (solo sandbox, AES + restauracion)',
        'Generador de hook BeEF (laboratorio de navegadores)',
        'Constructor de tuneles / pivoting (SSH -L/-R/-D, chisel, iodine)'
      ]
    }
  };

  const STORAGE_KEY = 'hb_lang';
  const VERBOSE_KEY = 'hb_verbose';
  let verboseEnabled = true;
  try {
    const v = localStorage.getItem(VERBOSE_KEY);
    if (v === '0' || v === 'false') verboseEnabled = false;
  } catch (e) { /* private mode */ }

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
    renderProView();
    loadStatus();
  }

  function renderProView() {
    $('pro-view-note').textContent = t('pro_view_note');
    $('pro-free-list').innerHTML = t('pro_free_features').map(function (f) {
      return '<li>' + f + '</li>';
    }).join('');
    $('pro-pro-list').innerHTML = t('pro_pro_features').map(function (f) {
      return '<li>' + f + '</li>';
    }).join('');
  }

  function setLang(next) {
    lang = next === 'es' ? 'es' : 'en';
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    $('btn-lang').textContent = lang === 'en' ? 'EN' : 'ES';
    applyLang();
  }

  function setVerbose(on) {
    verboseEnabled = !!on;
    try { localStorage.setItem(VERBOSE_KEY, verboseEnabled ? '1' : '0'); } catch (e) { /* ignore */ }
    $('btn-verbose').textContent = verboseEnabled ? (lang === 'es' ? 'VERB: ON' : 'VERBOSE: ON') : (lang === 'es' ? 'VERB: OFF' : 'VERBOSE: OFF');
    $('btn-verbose').classList.toggle('on', verboseEnabled);
  }

  // ---------------- BMO avatar (expressions driven by engine verbose) ----
  const BMO_EXPRESSIONS = {
    neutral:    { img: 'neutral.png',    label: 'NEUTRAL' },
    entusiasta: { img: 'entusiasta.png', label: 'ENTUSIASTA' },
    sutil:      { img: 'sutil.png',      label: 'SUTIL' },
    contento:   { img: 'contento.png',   label: 'CONTENTO' },
    panico:     { img: 'panico.png',     label: 'PANICO' },
    enojado:    { img: 'enojado.png',    label: 'ENOJADO' },
    enfadado:   { img: 'enfadado.png',   label: 'ENFADADO' }
  };
  let bmoTimer = null;
  // When set (via #bmo=<expr> deep link), the expression is pinned so the
  // engine-state updates do not overwrite it (used for screenshots/docs).
  let forcedBmo = null;

  function setBmo(expr, statusText, thinkText) {
    const target = forcedBmo || expr;
    const e = BMO_EXPRESSIONS[target] || BMO_EXPRESSIONS.neutral;
    const avatar = $('bmo-avatar');
    if (!avatar) return;
    avatar.src = '/assets/bmo/' + e.img;
    avatar.classList.remove('anim');
    void avatar.offsetWidth; // restart the pop animation
    avatar.classList.add('anim');
    $('bmo-expression').textContent = e.label;
    if (statusText !== undefined) $('bmo-status').textContent = statusText;
    if (thinkText !== undefined) $('bmo-think').textContent = thinkText;
    const panel = $('bmo-panel');
    if (panel) {
      panel.className = 'bmo-panel expr-' + target + (target === 'entusiasta' || target === 'sutil' ? ' thinking' : '');
    }
    if (forcedBmo) return; // pinned expression: keep it (no idle reset)
    clearTimeout(bmoTimer);
    bmoTimer = setTimeout(function () {
      setBmo('neutral', lang === 'es' ? 'en espera' : 'idle', '--');
    }, 9000);
  }

  // ---------------- state ----------------
  let sessionId = null;
  let ws = null;
  let pro = false;
  let sessionStart = Date.now();
  let sevFilters = { CRITICAL: true, HIGH: true, MEDIUM: true, LOW: true };
  let allVulns = [];
  let engineOnline = false;

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
      $('status-time').textContent = fmtDuration(Date.now() - sessionStart);
    }, 1000);
  }

  // ---------------- toasts ----------------
  function toast(msg, kind) {
    const box = $('toasts');
    const el = document.createElement('div');
    el.className = 'toast ' + (kind || '');
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transition = 'opacity .3s ease';
      setTimeout(function () { el.remove(); }, 320);
    }, 3200);
  }

  // ---------------- severity filters ----------------
  function updateSevCounts(vulns) {
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    (vulns || []).forEach(function (v) {
      const sev = String(v.severity || 'LOW').toUpperCase();
      if (counts[sev] !== undefined) counts[sev] += 1;
    });
    ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].forEach(function (s) {
      const chip = document.querySelector('.sev-chip[data-sev="' + s + '"] .n');
      if (chip) chip.textContent = counts[s];
    });
    $('nav-count-vulns').textContent = (vulns || []).length;
    return counts;
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
        // BMO reacts to the engine result: ok -> CONTENTO, error -> ENFADADO
        if (data.error) {
          setBmo('enfadado', lang === 'es' ? 'error' : 'error', 'duration ' + (data.duration || '0.00') + 's');
        } else {
          setBmo('contento', lang === 'es' ? 'listo' : 'done', 'duration ' + (data.duration || '0.00') + 's');
        }
      } else if (data.type === 'status') {
        // verbose progress event from the server (engine thinking...)
        if (verboseEnabled) {
          HBTerminal.print(data.message || '', 'out-verbose');
        }
        if (data.message && data.message.indexOf('thinking') !== -1) {
          setBmo('entusiasta', lang === 'es' ? 'pensando...' : 'thinking...');
        } else {
          setBmo('sutil', lang === 'es' ? 'analizando...' : 'working...');
        }
      } else if (data.type === 'timeline') {
        renderTimeline(data.events || []);
      } else if (data.type === 'tools') {
        // tools list available; not rendered by default
      } else if (data.type === 'error') {
        HBTerminal.print(data.message || t('msg_engine_offline'), 'out-err');
        setBmo('panico', lang === 'es' ? 'error' : 'error');
        if (!data.message) toast(t('toast_engine_offline'), 'warn');
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
      engineOnline = !!s.engine_available;
      $('btn-pro').textContent = pro ? t('st_pro') : t('st_free');
      $('btn-pro').classList.toggle('pro-on', pro);
      const engineText = $('status-engine').querySelector('[data-i18n]');
      if (engineText) engineText.textContent = s.engine_available ? t('st_engine_online') : t('st_engine_offline');
      const dot = $('engine-dot');
      if (dot) { dot.className = 'dot ' + (s.engine_available ? 'online' : 'offline'); }
      $('status-ver').textContent = 'v' + s.version + ' LOCAL';
      const q = s.quota === -1 ? 'unlimited' : (s.queries_today + '/' + s.quota);
      $('status-project').textContent = s.project + ' | ' + q;
      // BMO reflects the engine state in the status bar
      // (skipped when a #bmo= expression is pinned for screenshots)
      if (!forcedBmo) {
        if (s.engine_available) {
          setBmo('neutral', lang === 'es' ? 'engine en linea' : 'engine online');
        } else {
          setBmo('enojado', lang === 'es' ? 'engine offline' : 'engine offline');
        }
      }
      if (pro) {
        $('vault-lock').classList.add('hidden');
        $('vault-body').classList.remove('hidden');
        $('reports-lock').classList.add('hidden');
        $('reports-body').classList.remove('hidden');
        if (window.maplibregl) { // MapLibre GL loaded (3D globe)
          $('iotmap-lock').classList.add('hidden');
          $('iotmap-body').classList.remove('hidden');
          // If the view was opened by deep link before the license loaded,
          // initIotMap() bailed on !pro: initialize it now that we are PRO.
          if (!iotInitialized && $('iotmap-body') && !$('iotmap-body').classList.contains('hidden')) {
            initIotMap();
          }
        }
        if (window.vis) { // vis-network loaded
          $('osintgraph-lock').classList.add('hidden');
          $('osintgraph-body').classList.remove('hidden');
        }
      }
    } catch (e) { /* ignore */ }
  }

  function renderVulnCards() {
    const list = $('vuln-list');
    list.innerHTML = '';
    const visible = allVulns.filter(function (v) {
      const sev = String(v.severity || 'LOW').toUpperCase();
      return sevFilters[sev] !== false;
    });
    if (!visible.length) {
      const div = document.createElement('div');
      div.className = 'empty-state';
      div.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>' +
        '<span>' + (allVulns.length ? t('vuln_none') : t('vuln_empty')) + '</span>';
      list.appendChild(div);
      return;
    }
    visible.forEach(function (v) {
      const card = document.createElement('div');
      const sev = String(v.severity || 'LOW').toUpperCase();
      card.className = 'vuln-card sev-' + sev;
      card.innerHTML =
        '<div class="top">' +
        '  <span class="sev-badge">' + sev + '</span>' +
        '  <span class="cve">' + (v.cve_id || 'no-cve') + '</span>' +
        '</div>' +
        '<div class="hostline">' +
        '  <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="2" y="10" width="20" height="11" rx="2"/><path d="M6 10V7a6 6 0 0112 0v3"/></svg>' +
        '  ' + (v.host || '?') + (v.port ? ':' + v.port : '') +
        '</div>' +
        '<div class="desc">' + (v.description || '').slice(0, 160) + '</div>' +
        '<div class="actions">' +
        '  <button class="card-btn danger" data-act="exploit">' + t('vuln_exploit') + '</button>' +
        '  <button class="card-btn" data-act="details">' + t('vuln_details') + '</button>' +
        '  <button class="card-btn" data-act="mitigate">' + t('vuln_mitigate') + '</button>' +
        '</div>';
      list.appendChild(card);
    });
  }

  async function loadVulns() {
    try {
      const m = await api('/api/memory?session_id=' + (sessionId || ''));
      allVulns = m.vulnerabilities || [];
      updateSevCounts(allVulns);
      renderVulnCards();
      renderMemory(m);
    } catch (e) { /* ignore */ }
  }

  function renderMemory(m) {
    const none = t('memory_none');
    const stats = m.stats || {};
    $('mem-stat-hosts').textContent = stats.hosts || (m.hosts || []).length;
    $('mem-stat-creds').textContent = stats.credentials || (m.credentials || []).length;
    $('mem-stat-vulns').textContent = stats.vulnerabilities || (m.vulnerabilities || []).length;
    $('mem-stat-notes').textContent = stats.notes || (m.notes || []).length;

    $('mem-hosts').innerHTML = (m.hosts || []).map(function (h) {
      return '<li>' + h.ip + (h.os ? ' <span class="dim">[' + h.os + ']</span>' : '') + '</li>';
    }).join('') || '<li class="dim">' + none + '</li>';

    $('mem-creds').innerHTML = (m.credentials || []).map(function (c) {
      return '<li>' + c.username + '<span class="dim">@' + (c.host || '?') + '</span></li>';
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
      div.className = 'tl-event k-' + (e.kind || 'event');
      div.innerHTML =
        '<span class="ts">' + (e.ts || '').slice(11, 19) + ' UTC</span>' +
        '<span class="kind">' + (e.kind || 'event').toUpperCase() + '</span>' +
        '<span class="detail">' + (e.detail || '').slice(0, 90) + '</span>';
      list.appendChild(div);
    });
  }

  // ---------------- chat ----------------
  function sendChat(text) {
    setBmo('sutil', lang === 'es' ? 'procesando...' : 'processing...');
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
    toast(t('vault_unlocked'), 'ok');
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
    if (r.ok) toast(t('report_ok'), 'ok');
    else toast(r.error || t('reports_failed'), 'err');
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
      toast(t('pro_activated'), 'ok');
      closeModal();
      loadStatus();
    } else {
      toast(t('pro_invalid'), 'err');
    }
  }

  function openModal(id) { $(id || 'pro-modal').classList.remove('hidden'); }
  function closeModal(id) { $(id || 'pro-modal').classList.add('hidden'); }

  // ---------------- events ----------------
  function wireEvents() {
    $('term-input').addEventListener('keydown', function (e) {
      HBTerminal.onKey(e, sendChat);
    });

    $('btn-lang').addEventListener('click', function () {
      setLang(HBTerminal.getLang() === 'en' ? 'es' : 'en');
    });

    $('btn-verbose').addEventListener('click', function () {
      setVerbose(!verboseEnabled);
    });

    $('btn-login').addEventListener('click', doLogin);
    $('login-pin').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doLogin();
    });
    $('btn-mobile').addEventListener('click', openMobileModal);
    $('btn-mobile-close').addEventListener('click', function () { closeModal('mobile-overlay'); });
    $('btn-mobile-dl').addEventListener('click', function () {
      window.open('/apk/BMO-GHOST.apk', '_blank');
    });
    $('btn-mobile-activate').addEventListener('click', function () {
      const fwCmd = $('mobile-hint').querySelector('code');
      if (fwCmd && fwCmd.textContent.indexOf('sudo') !== -1) {
        $('mobile-hint').innerHTML = '<span>' + t('mobile_fw_copy') + '</span><br><code style="color:var(--orange);user-select:all">' + fwCmd.textContent + '</code>';
        toast(t('mobile_fw_copy'), 'warn');
      } else {
        toast(t('mobile_ok'), 'ok');
      }
    });
    $('model-select').addEventListener('change', function () {
      const name = this.value;
      api('/api/models/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: name }),
      }).then(function (r) {
        if (r.ok) toast('model: ' + r.model, 'ok');
      });
    });
    $('btn-defensive').addEventListener('click', toggleDefensive);
    $('btn-export').addEventListener('click', doExport);
    $('btn-iotmap-monitor').addEventListener('click', iotMonitor);

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
        if (b.dataset.view === 'pro') renderProView();
        if (b.dataset.view === 'iotmap') initIotMap();
        if (b.dataset.view === 'osintgraph') initOsintGraph();
      });
    });

    $('btn-pro').addEventListener('click', openModal);
    $('btn-close-modal').addEventListener('click', closeModal);
    $('btn-activate').addEventListener('click', activate);
    $('btn-goto-pro').addEventListener('click', openModal);
    $('btn-pro-view-activate').addEventListener('click', openModal);
    document.querySelectorAll('[data-goto-pro]').forEach(function (b) {
      b.addEventListener('click', openModal);
    });

    document.querySelectorAll('.sev-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        const sev = chip.dataset.sev;
        sevFilters[sev] = !sevFilters[sev];
        chip.classList.toggle('active', sevFilters[sev]);
        renderVulnCards();
      });
    });

    $('btn-refresh-vulns').addEventListener('click', loadVulns);
    $('btn-refresh-mem').addEventListener('click', loadMemory);
    $('btn-vault-unlock').addEventListener('click', vaultUnlock);
    $('btn-vault-reveal').addEventListener('click', function () {
      loadVaultEntries(true);
    });
    $('btn-vault-store').addEventListener('click', async function () {
      const r = await api('/api/vault/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          service: $('vault-service').value,
          username: $('vault-user').value,
          password: $('vault-pass').value
        })
      });
      if (r.ok) {
        toast(t('vault_stored'), 'ok');
        $('vault-service').value = ''; $('vault-user').value = ''; $('vault-pass').value = '';
      } else {
        toast(r.error || t('vault_wrong_pw'), 'err');
      }
      loadVaultEntries(false);
    });
    $('btn-generate-report').addEventListener('click', generateReport);
    $('btn-iotmap-search').addEventListener('click', iotSearch);
    $('btn-iotmap-savekey').addEventListener('click', saveShodanKey);
    $('iotmap-query').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') iotSearch();
    });
    document.querySelectorAll('#iotmap-presets .preset').forEach(function (b) {
      b.addEventListener('click', function () {
        $('iotmap-query').value = b.dataset.query;
        iotSearch();
      });
    });
    $('btn-iotmap-filter').addEventListener('click', iotSearch);
    $('iotmap-country').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') iotSearch();
    });
    $('iotmap-cat').addEventListener('change', iotSearch);
    $('btn-osintgraph-build').addEventListener('click', buildOsintGraph);
    $('osintgraph-seed').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') buildOsintGraph();
    });
    $('btn-facecheck-savekey').addEventListener('click', saveFaceCheckKey);
    $('btn-facecheck-search').addEventListener('click', runFaceCheck);
    $('facecheck-image').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') runFaceCheck();
    });

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

  // ---------------- IoT MAP (PRO) ----------------
  let iotMap = null;
  let iotMarkers = [];
  let iotHosts = [];
  let iotInitialized = false;
  let iotFilterCountry = '';

  function initIotMap() {
    if (!pro) {
      $('iotmap-lock').classList.remove('hidden');
      $('iotmap-body').classList.add('hidden');
      return;
    }
    $('iotmap-lock').classList.add('hidden');
    $('iotmap-body').classList.remove('hidden');
    if (iotInitialized) return;
    iotInitialized = true;

    if (!window.maplibregl) {
      $('iotmap-meta').textContent = 'MapLibre GL failed to load (offline?). The 3D map needs internet access to load the tile layer.';
      return;
    }
    // Dark professional tiles (CartoDB dark matter), rendered on a 3D globe.
    const style = {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }
      },
      layers: [
        {
          id: 'osm',
          type: 'raster',
          source: 'osm',
          paint: { 'raster-saturation': -0.25, 'raster-contrast': 0.05, 'raster-brightness-min': 0.35, 'raster-brightness-max': 0.85 }
        }
      ]
    };
    iotMap = new maplibregl.Map({
      container: 'iotmap-map',
      style: style,
      projection: 'globe',
      center: [-40, 15],
      zoom: 1.8,
      minZoom: 1.2,
      maxZoom: 18,
      attributionControl: { compact: true }
    });
    iotMap.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    // Space atmosphere around the globe, themed to the dashboard.
    iotMap.on('load', function () {
      iotMap.setSky({
        'sky-color': '#05070f',
        'sky-horizon-blend': 0.35,
        'horizon-color': '#0b1430',
        'fog-color': '#0a1124',
        'fog-ground-blend': 0.6
      });
      try {
        iotMap.setFog({ range: [1.6, 12], color: '#0a1124', 'high-color': '#0e1a3a', 'space-color': '#05070f' });
      } catch (e) { /* older maplibre */ }
      checkShodanStatus();
      // #iotmapsearch auto-runs a search on load (deep link / screenshots).
      if ((location.hash || '').indexOf('iotmapsearch') !== -1) {
        setTimeout(function () { iotSearch(); }, 1200);
      }
    });
  }

  async function checkShodanStatus() {
    try {
      const r = await api('/api/shodan/status?session_id=' + (sessionId || ''));
      if (!r.ok) {
        $('iotmap-meta').textContent = r.error || '';
        return;
      }
      if (r.key_configured) {
        const plan = r.info && r.info.plan ? 'plan: ' + r.info.plan : '';
        const credits = r.info && r.info.query_credits !== undefined ? ' | credits: ' + r.info.query_credits : '';
        $('iotmap-meta').textContent = 'Shodan key OK ' + (plan || '') + (credits || '');
      } else {
        $('iotmap-meta').textContent = t('iotmap_nokey');
      }
    } catch (e) { /* ignore */ }
  }

  async function saveShodanKey() {
    const key = $('iotmap-key').value.trim();
    if (!key) { toast('Enter a Shodan API key', 'err'); return; }
    const r = await api('/api/shodan/key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, key: key })
    });
    if (r.ok && r.info && r.info.ok) {
      toast('Shodan key saved and validated (' + (r.info.plan || '') + ')', 'ok');
    } else if (r.ok) {
      toast('Key saved, but validation failed: ' + ((r.info && r.info.error) || ''), 'warn');
    } else {
      toast(r.error || 'Failed to save key', 'err');
    }
    checkShodanStatus();
  }

  function buildIotQuery() {
    // Compose the Shodan query from the search box + active filters.
    let q = $('iotmap-query').value.trim();
    const cat = $('iotmap-cat').value;
    const cc = $('iotmap-country').value.trim().toUpperCase();
    const parts = [];
    if (q) parts.push(q);
    if (cat) parts.push(cat);
    if (cc) parts.push('country:' + cc);
    const final = parts.join(' ') || 'camera';
    $('iotmap-filterinfo').textContent = 'query: "' + final + '"';
    return final;
  }

  async function iotSearch() {
    const q = buildIotQuery();
    $('iotmap-meta').textContent = t('iotmap_searching') + ' ...';
    const r = await api('/api/shodan/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, query: q, limit: 200 })
    });
    if (!r.ok) {
      $('iotmap-meta').textContent = r.error || 'search failed';
      // If the key has no search credits (free plan), offer demo data so the
      // 3D map and filters can still be explored.
      if (r.demo) {
        iotHosts = r.hosts || [];
        $('iotmap-count').textContent = iotHosts.length + ' hosts (DEMO)';
        $('iotmap-meta').textContent = 'DEMO DATA: ' + (r.note || r.error || 'your key has no search credits');
        renderIotHosts();
        renderIotMarkers();
        return;
      }
      toast(r.error || 'search failed', 'err');
      return;
    }
    iotHosts = r.hosts || [];
    $('iotmap-count').textContent = r.mapped + ' mapped / ' + r.total + ' total';
    $('iotmap-meta').textContent =
      "'" + r.query + "' -> " + r.total + ' results, ' + r.mapped + ' on map' +
      (r.top_ports && r.top_ports.length ? ' | top ports: ' + r.top_ports.slice(0, 5).join(', ') : '');
    renderIotHosts();
    renderIotMarkers();
  }

  function renderIotHosts() {
    const box = $('iotmap-hosts');
    box.innerHTML = '';
    if (!iotHosts.length) {
      box.innerHTML = '<div class="dim small">' + t('iotmap_noresults') + '</div>';
      return;
    }
    iotHosts.forEach(function (h) {
      const el = document.createElement('div');
      el.className = 'iotmap-host';
      el.innerHTML =
        '<div class="ip">' + (h.ip || '?') + '</div>' +
        '<div class="meta">' +
        '  <span class="port">:' + (h.port || '?') + '</span>' +
        '  <span class="org">' + ((h.org || h.product || 'unknown').slice(0, 22)) + '</span>' +
        '  <span class="loc">' + (h.city || '') + (h.city && h.country ? ', ' : ' ') + (h.country || '') + '</span>' +
        '</div>';
      el.addEventListener('click', function () { showIotDetail(h); });
      box.appendChild(el);
    });
  }

  function renderIotMarkers() {
    if (!iotMap) return;
    iotMarkers.forEach(function (m) { m.remove(); });
    iotMarkers = [];
    const withGeo = iotHosts.filter(function (h) { return h.lat !== null && h.lon !== null; });
    withGeo.forEach(function (h) {
      const el = document.createElement('div');
      el.className = 'iotmap-marker-dot' + (h.port === 3389 || h.port === 23 || h.port === 21 ? ' hot' : '');
      el.title = (h.ip || '') + ':' + (h.port || '');
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([h.lon, h.lat])
        .setPopup(new maplibregl.Popup({ offset: 18, closeButton: false, maxWidth: '260px' }).setHTML(
          '<div style="font-family:monospace;font-size:11.5px;line-height:1.55">' +
          '<b style="color:#00E5C7;font-size:13px">' + (h.ip || '?') + ':' + (h.port || '?') + '</b><br>' +
          (h.org ? '<span style="color:#ff8c42">' + h.org.slice(0, 40) + '</span><br>' : '') +
          (h.product ? '<span style="color:#8ea0bd">' + h.product.slice(0, 45) + '</span><br>' : '') +
          '<span style="color:#5a6a85">' + (h.city || '') + (h.city && h.country ? ', ' : ' ') + (h.country || '') + '</span>' +
          (h.hostnames && h.hostnames.length ? '<br><span style="color:#4cc9f0">' + h.hostnames[0].slice(0, 40) + '</span>' : '') +
          '</div>'
        ))
        .addTo(iotMap);
      marker.getElement().addEventListener('click', function () { showIotDetail(h); });
      iotMarkers.push(marker);
    });
    if (withGeo.length) {
      // Fly to the cluster of results on the 3D globe.
      let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
      withGeo.forEach(function (h) {
        minLat = Math.min(minLat, h.lat); maxLat = Math.max(maxLat, h.lat);
        minLon = Math.min(minLon, h.lon); maxLon = Math.max(maxLon, h.lon);
      });
      iotMap.fitBounds([[minLon, minLat], [maxLon, maxLat]], { padding: 60, maxZoom: 8, duration: 1800 });
    }
  }

  async function showIotDetail(h) {
    const box = $('iotmap-detail');
    box.classList.remove('hidden');
    box.innerHTML =
      '<div class="view-head"><h3 class="dim small">' + (h.ip || '') + ' - full details</h3></div>' +
      '<div class="dim small">loading host details...</div>';
    const r = await api('/api/shodan/host', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, ip: h.ip })
    });
    if (!r.ok || !r.ports) {
      box.innerHTML =
        '<div class="view-head"><h3 class="dim small">' + (h.ip || '') + '</h3></div>' +
        '<div class="dim small">' + ((r && r.error) || 'no details') + '</div>';
      return;
    }
    let html =
      '<div class="view-head"><h3 class="dim small">' + r.ip + ' - ' + (r.org || '') + '</h3></div>' +
      '<div class="dim small">' +
      '  <span class="iotmap-host"><span class="loc">' + (r.city || '') + (r.city && r.country ? ', ' : ' ') + (r.country || '') + '</span></span>' +
      '  | asn: ' + (r.asn || '-') + ' | isp: ' + (r.isp || '-') + ' | os: ' + (r.os || '-') + '</div>' +
      '<div class="dim small" style="margin-top:6px">ports: ' + (r.ports || []).join(', ') + '</div>';
    if (r.vulns && r.vulns.length) {
      html += '<div style="margin-top:6px"><span class="sev-badge">' + r.vulns.length + ' known vulns</span> ' + r.vulns.slice(0, 10).join(', ') + '</div>';
    }
    if (r.services && r.services.length) {
      html += '<div style="margin-top:8px"><b class="dim small">services</b><pre>' +
        r.services.map(function (s) {
          return (s.port || '?') + '/' + (s.transport || '') + '  ' + (s.product || '') + ' ' + (s.version || '') +
            (s.banner ? '  |  ' + s.banner.slice(0, 120) : '');
        }).join('\n') + '</pre></div>';
    }
    box.innerHTML = html;
  }

  // ---------------- OSINT GRAPH (PRO) ----------------
  let osintNetwork = null;
  let osintGraphInitialized = false;

  function initOsintGraph() {
    if (!pro) {
      $('osintgraph-lock').classList.remove('hidden');
      $('osintgraph-body').classList.add('hidden');
      return;
    }
    $('osintgraph-lock').classList.add('hidden');
    $('osintgraph-body').classList.remove('hidden');
    if (osintGraphInitialized) return;
    osintGraphInitialized = true;
    if (!window.vis) {
      $('osintgraph-meta').textContent = 'vis-network failed to load (offline?). The graph needs internet to load the library.';
      return;
    }
    renderGraphLegend();
    checkFaceCheckStatus();
  }

  function renderGraphLegend() {
    const legend = [
      ['seed', '#00e5c7'], ['person', '#ff5d8f'], ['email', '#ff8c42'], ['domain', '#4cc9f0'],
      ['subdomain', '#4895ef'], ['ip', '#b388ff'], ['username', '#ffd166'], ['phone', '#f15bb5'],
      ['org', '#06d6a0'], ['social', '#9b5de5'], ['breach', '#ef233c'], ['meta', '#adb5bd']
    ];
    $('osintgraph-legend').innerHTML = legend.map(function (l) {
      return '<span><i style="background:' + l[1] + '"></i>' + l[0] + '</span>';
    }).join('');
  }

  async function buildOsintGraph() {
    const seed = $('osintgraph-seed').value.trim();
    if (!seed) { toast('Enter a seed entity', 'err'); return; }
    const depth = parseInt($('osintgraph-depth').value || '2', 10);
    $('osintgraph-meta').textContent = 'building graph for "' + seed + '"... (this runs OSINT lookups, can take ~30-60s)';
    const r = await api('/api/osint/graph', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, seed: seed, depth: depth })
    });
    if (!r.ok) {
      $('osintgraph-meta').textContent = r.error || 'graph failed';
      toast(r.error || 'graph failed', 'err');
      return;
    }
    $('osintgraph-meta').textContent = "'" + r.seed + "' (" + r.seed_type + ') -> ' + r.nodes.length + ' entities, ' + r.edges.length + ' relationships';
    renderOsintGraph(r.nodes, r.edges);
  }

  function renderOsintGraph(nodes, edges) {
    const container = $('osintgraph-canvas');
    const visNodes = (nodes || []).map(function (n) {
      const isSeed = n.type === 'seed';
      const d = n.data || {};
      let tip = n.label;
      if (d.url) tip += '\n' + String(d.url).slice(0, 160);
      if (d.error) tip += '\n' + String(d.error).slice(0, 160);
      return {
        id: n.id,
        label: n.label.length > 30 ? n.label.slice(0, 29) + '…' : n.label,
        color: { background: n.color, border: '#0a0f1a', highlight: { background: n.color, border: '#ffffff' } },
        font: {
          color: '#ffffff',
          face: 'Inter, system-ui, -apple-system, sans-serif',
          size: isSeed ? 16 : 13,
          strokeWidth: isSeed ? 5 : 3,
          strokeColor: 'rgba(5,8,18,0.92)',
          vadjust: 2
        },
        shape: isSeed ? 'box' : 'dot',
        borderRadius: 8,
        shadow: { enabled: true, color: 'rgba(0,0,0,0.45)', size: 12, x: 0, y: 3 },
        size: isSeed ? 24 : 15,
        title: tip
      };
    });
    const visEdges = (edges || []).map(function (e) {
      return {
        from: e.from, to: e.to, label: e.label, arrows: 'to',
        color: { color: '#5b6b8c', highlight: '#00e5c7', opacity: 0.85 },
        font: { color: '#e8eefc', size: 11, face: 'Inter, system-ui, sans-serif', strokeWidth: 3, strokeColor: 'rgba(5,8,18,0.9)', vadjust: 1 },
        width: 1.4, selectionWidth: 2.5,
        smooth: { type: 'continuous', roundness: 0.35 }
      };
    });
    const data = { nodes: new vis.DataSet(visNodes), edges: new vis.DataSet(visEdges) };
    const options = {
      physics: { enabled: true, stabilization: { iterations: 250 }, barnesHut: { gravitationalConstant: -4200, springLength: 130, springConstant: 0.04, damping: 0.09 } },
      interaction: { hover: true, tooltipDelay: 80, navigationButtons: true, keyboard: true, zoomView: true, dragView: true },
      nodes: { borderWidth: 2, chosen: { node: function (v, id, sel, hover) { v.borderWidth = hover || sel ? 3 : 2; } } },
      edges: { chosen: { edge: function (v, id, sel, hover) { v.width = hover || sel ? 3 : 1.4; } } }
    };
    osintNetwork = new vis.Network(container, data, options);
    osintNetwork.on('doubleClick', function () {
      osintNetwork.fit({ animation: true });
    });
    // Center the canvas after stabilization so the graph is never cut off.
    setTimeout(function () {
      if (osintNetwork) osintNetwork.fit({ animation: true, maxZoomLevel: 1.4 });
    }, 600);
  }

  // ---------------- FaceCheck ID (PRO) ----------------
  async function checkFaceCheckStatus() {
    try {
      const r = await api('/api/facecheck/status?session_id=' + (sessionId || ''));
      $('facecheck-meta').textContent = r.key_configured
        ? 'FaceCheck ID key configured. Paste an image URL or local path and search.'
        : 'No FaceCheck ID key yet. Add it above to enable reverse face search (stored only on this machine).';
    } catch (e) { /* ignore */ }
  }

  async function saveFaceCheckKey() {
    const key = $('facecheck-key').value.trim();
    if (!key) { toast('Enter a FaceCheck ID API key', 'err'); return; }
    const r = await api('/api/facecheck/key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, key: key })
    });
    if (r.ok) { toast('FaceCheck ID key saved locally', 'ok'); } else { toast(r.error || 'failed', 'err'); }
    checkFaceCheckStatus();
  }

  async function runFaceCheck() {
    const img = $('facecheck-image').value.trim();
    if (!img) { toast('Enter an image URL or local path', 'err'); return; }
    $('facecheck-meta').textContent = 'searching face... (can take ~30-60s on FaceCheck side)';
    $('facecheck-results').innerHTML = '<div class="dim small">searching...</div>';
    const r = await api('/api/facecheck/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, image_url: img })
    });
    if (!r.ok) {
      $('facecheck-meta').textContent = r.error || 'search failed';
      $('facecheck-results').innerHTML = '';
      toast(r.error || 'search failed', 'err');
      return;
    }
    const matches = r.matches || [];
    $('facecheck-meta').textContent = r.total + ' match(es) found' + (r.status ? ' (' + r.status + ')' : '');
    if (!matches.length) {
      $('facecheck-results').innerHTML = '<div class="dim small">No public matches found for this face.</div>';
      return;
    }
    $('facecheck-results').innerHTML = matches.map(function (m) {
      const url = m.url || '';
      return '<div class="facecheck-hit">' +
        '<div class="url">' + (url ? '<a href="' + url + '" target="_blank" rel="noopener">' + url + '</a>' : 'no url') + '</div>' +
        (m.source ? '<div class="src">' + m.source + '</div>' : '') +
        (m.score ? '<div class="score">score: ' + m.score + '</div>' : '') +
        '</div>';
    }).join('');
  }

  // ---------------- new features: auth, models, defensive, export, alerts ----
  let lastDefTs = 0;
  let lastIotTs = 0;
  let iotMonitorActive = false;

  async function checkAuth() {
    try {
      const r = await api('/api/auth/status');
      if (!r.ok && !r.local) {
        openModal('login-overlay');
        return false;
      }
      return true;
    } catch (e) {
      return true; // server unreachable - let the app try anyway
    }
  }

  function doLogin() {
    const pin = $('login-pin').value.trim();
    $('login-result').textContent = '';
    api('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pin }),
    }).then(function (r) {
      if (r.ok) {
        toast(t('login_ok'), 'ok');
        closeModal('login-overlay');
        loadStatus();
      } else {
        $('login-result').textContent = t('login_bad');
      }
    }).catch(function () {
      $('login-result').textContent = t('login_bad');
    });
  }

  function openMobileModal() {
    openModal('mobile-overlay');
    $('mobile-status').textContent = '...';
    api('/api/mobile/mode').then(function (r) {
      if (!r || !r.ok) { $('mobile-status').textContent = 'error'; return; }
      $('mobile-ip').textContent = r.ip;
      $('mobile-port').textContent = String(r.port || 8080);
      $('mobile-pin').textContent = r.pin || '--';
      const fw = r.firewall || {};
      const reach = r.reachable_on_lan;
      if (reach) {
        $('mobile-status').textContent = t('mobile_ok');
        $('mobile-status').className = 'mobile-status on';
        $('mobile-hint').innerHTML = '';
        $('btn-mobile-activate').style.display = 'none';
      } else if (r.local_only && r.restart_command) {
        $('mobile-status').textContent = t('mobile_fw_closed');
        $('mobile-status').className = 'mobile-status off';
        $('mobile-hint').innerHTML = '<span>' + t('mobile_restart_hint') + '</span><br><code style="color:var(--orange)">' + r.restart_command + '</code>';
        $('btn-mobile-activate').style.display = 'none';
      } else if (fw.need_sudo && fw.command) {
        $('mobile-status').textContent = t('mobile_fw_closed');
        $('mobile-status').className = 'mobile-status off';
        $('mobile-hint').innerHTML = '<span>' + t('mobile_host_hint') + '</span><br><code style="color:var(--orange)">' + fw.command + '</code><br><span class="dim small">' + t('mobile_fw_after') + '</span>';
        $('btn-mobile-activate').style.display = '';
      } else {
        $('mobile-status').textContent = t('mobile_fw_closed');
        $('mobile-status').className = 'mobile-status off';
      }
    }).catch(function () {
      $('mobile-status').textContent = 'error';
    });
  }

  async function loadModels() {
    try {
      const r = await api('/api/models');
      const sel = $('model-select');
      sel.innerHTML = '';
      const opts = (r.models || []).length ? r.models : [r.active || 'local-model'];
      opts.forEach(function (m) {
        const o = document.createElement('option');
        o.value = m; o.textContent = m;
        if (m === r.active) o.selected = true;
        sel.appendChild(o);
      });
    } catch (e) { /* engine off - keep empty */ }
  }

  async function loadPin() {
    try {
      const r = await api('/api/auth/pin');
      if (r.ok) { $('pin-badge').textContent = 'PIN: ' + r.pin; }
    } catch (e) { /* remote - PIN hidden */ }
  }

  async function toggleDefensive() {
    const st = await api('/api/defensive/status').catch(function () { return { running: false }; });
    const wantOn = !st.running;
    const r = await api('/api/defensive/' + (wantOn ? 'start' : 'stop'), { method: 'POST' })
      .catch(function () { return { ok: false }; });
    if (r.ok) {
      $('btn-defensive').textContent = wantOn ? t('def_on') : t('def_off');
      toast(wantOn ? t('def_started') : t('def_stopped'), wantOn ? 'ok' : '');
      lastDefTs = Date.now() / 1000;
    }
  }

  async function pollAlerts() {
    try {
      const d = await api('/api/defensive/events?since=' + lastDefTs);
      (d.events || []).forEach(function (e) {
        if (e.kind === 'scan') toast(t('def_scan_alert').replace('{ip}', e.ip), 'warn');
        else if (e.kind === 'hit') toast(t('def_hit_alert').replace('{ip}', e.ip));
        lastDefTs = Math.max(lastDefTs, e.ts);
      });
      const st = d.status || {};
      $('btn-defensive').textContent = st.running ? t('def_on') : t('def_off');
    } catch (e) { /* ignore */ }
    if (iotMonitorActive) {
      try {
        const i = await api('/api/iot/monitor/check?since=' + lastIotTs);
        (i.alerts || []).forEach(function (a) {
          toast(t('iot_new_dev').replace('{n}', a.count) + ' \"' + a.query + '\"', 'warn');
          lastIotTs = Math.max(lastIotTs, a.ts);
        });
      } catch (e) { /* ignore */ }
    }
  }

  async function doExport() {
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: $('status-project') ? $('status-project').textContent : 'default' }),
      });
      if (!res.ok) { toast(t('export_fail'), 'warn'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bmo_ghost_engagement.zip';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      toast(t('export_ok'), 'ok');
    } catch (e) { toast(t('export_fail'), 'warn'); }
  }

  function iotMonitor() {
    const q = ($('iotmap-query').value || '').trim();
    if (!q) { toast(t('iotmap_query_ph'), 'warn'); return; }
    api('/api/iot/monitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q }),
    }).then(function (r) {
      if (r.ok) {
        iotMonitorActive = true;
        lastIotTs = Date.now() / 1000;
        toast(t('iot_monitor_on'), 'ok');
      }
    });
  }

  // ---------------- init ----------------
  function init() {
    HBTerminal.printBanner();

    // URL hints: #en / #es force the interface language, #pro opens the
    // PRO features view on load (useful for direct links and screenshots).
    const hash = (location.hash || '').toLowerCase();
    if (hash.indexOf('es') !== -1) lang = 'es';
    if (hash.indexOf('en') !== -1) lang = 'en';

    checkAuth();
    loadModels();
    loadPin();
    setInterval(pollAlerts, 15000);
    setLang(lang); // apply stored language (sets banner text, labels, status)
    setVerbose(verboseEnabled);
    wireEvents();
    setSessionTimer();
    connectWS();

    ['pro', 'vulns', 'vault', 'reports', 'memory', 'iotmap', 'osintgraph'].forEach(function (view) {
      if (hash.indexOf(view) !== -1) {
        document.querySelectorAll('.nav-btn').forEach(function (x) { x.classList.remove('active'); });
        document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });
        document.querySelector('.nav-btn[data-view="' + view + '"]').classList.add('active');
        $('view-' + view).classList.add('active');
        if (view === 'pro') renderProView();
        if (view === 'vulns') loadVulns();
        if (view === 'memory') loadMemory();
        if (view === 'vault') loadVaultEntries(false);
        if (view === 'iotmap') initIotMap();
        if (view === 'osintgraph') initOsintGraph();
      }
    });
    // #bmo=<expr> forces a BMO expression on load (screenshots / deep links).
    const bm = hash.match(/bmo(?::|%3A|=)([a-z]+)/);
    if (bm && BMO_EXPRESSIONS[bm[1]]) {
      forcedBmo = bm[1];
      setBmo(bm[1], bm[1], '--');
    }
    // #osintgraph:<seed> auto-builds the graph (deep link / screenshots).
    const gs = hash.match(/osintgraph(?::|%3A)([^&]+)/);
    if (gs) {
      try {
        $('osintgraph-seed').value = decodeURIComponent(gs[1]);
        setTimeout(function () {
          document.querySelector('.nav-btn[data-view="osintgraph"]').classList.add('active');
          document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });
          $('view-osintgraph').classList.add('active');
          initOsintGraph();
          setTimeout(buildOsintGraph, 1200);
        }, 800);
      } catch (e) { /* ignore */ }
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
