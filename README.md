```
 _   _            _            _                _             ____   _____
| | | | __ _  ___| | _____  __| | ___ _ __   __| | ___ _ __  | __ ) / ____|
| |_| |/ _` |/ __| |/ / _ \/ _` |/ _ \ '_ \ / _` |/ _ \ '__| |  _ \| (___
|  _  | (_| | (__|   <  __/ (_| |  __/ | | | (_| |  __/ |    | |_) |\___ \
|_| |_|\__,_|\___|_|\_\___|\__,_|\___|_| |_|\__,_|\___|_|    |____/|_____/

        LOCAL PENTESTING COMMAND CENTER
```

Local pentesting assistant with autonomous attack capabilities for authorized
security testing. A sober, terminal-grade web interface that orchestrates the
standard Kali Linux / Parrot OS toolset on your own machine, backed by a local
assistant engine that analyzes output and proposes the next step.

Author: **Cyt3rTo0ls** - License: **AGPL-3.0**

---

## README LANGUAGE / IDIOMA

This repository is documented in two languages.
Este repositorio esta documentado en dos idiomas.

| English | Espanol |
| --- | --- |
| [README (English)](README.md) | [README (Espanol)](README_ES.md) |
| [TUTORIAL (English)](TUTORIAL.md) | [TUTORIAL (Espanol)](TUTORIAL_ES.md) |

---

## IMPORTANT: LOCAL APPLICATION - RESOURCE CONSUMPTION

BMO-GHOST is a **100% LOCAL, OFFLINE application**. Nothing runs in the
cloud and no data leaves your machine:

- The web UI, the assistant engine and every database (SQLite) run on your host.
- The assistant engine is a **local chat-completions API server** (a local
  model runner or a local wrapper) reachable at `localhost` (see
  `data/config.yaml` -> `engine`).
- **This consumes significant system resources.** Loading a local model and
  running inference uses heavy CPU, RAM and disk. A small 3B-parameter model
  typically needs several GB of RAM; larger models need much more. Long sessions
  keep the model warm in memory, which adds to steady-state usage.
- Plan your hardware before long engagements. If the engine is offline, the
  tool keeps working (tools, memory, vault, reports) without conversational
  analysis.
- Hardware note: the author's own machine does NOT run the assistant engine
  model. This project is aimed at users whose hardware CAN run a local model
  (a desktop/workstation with a capable CPU/GPU and enough RAM). The rest of
  the platform runs on any Kali/Parrot box; only the conversational engine
  needs the heavier hardware.

---

## LEGAL WARNING

> WARNING: This tool is intended for authorized security testing only.
> Unauthorized access to computer systems is illegal. The author assumes
> no liability for misuse of this software.

You are responsible for having written permission to test every target you
scan, enumerate or attack. Unauthorized scanning or exploitation is a crime
in most jurisdictions. Use this tool exclusively on systems you own or are
explicitly contracted to assess.

---

## SCREENSHOTS

Main dashboard (terminal view):

![BMO-GHOST dashboard](images/dashboard.png)

Dashboard in Spanish (`#es`):

![BMO-GHOST dashboard ES](images/dashboard_es.png)

PRO features view, visible from the free tier (sidebar -> PRO, or `#pro`):

![BMO-GHOST PRO features](images/pro_features.png)

PRO features view in Spanish:

![BMO-GHOST PRO features ES](images/pro_features_es.png)

Vulnerabilities view with severity filters:

![BMO-GHOST vulnerabilities](images/vulns.png)

Memory view with stats and stored entities:

![BMO-GHOST memory](images/memory.png)

---

## FEATURES

The free version shows the full PRO capability list in the interface
(sidebar -> PRO). Free users can always see what PRO unlocks.

### FREE (open source)

| Feature | Free |
| --- | --- |
| Assistant engine queries | 20 per day |
| Memory entries | 50 (wiped at session end) |
| Active projects | 2 |
| Report export | No |
| Session length | 1 hour |
| Recon tools | Basic |
| Dark professional interface | Yes |
| Conversational terminal | Yes |
| Current-session timeline | Yes |

### PRO (key activation)

| Feature | PRO |
| --- | --- |
| Assistant engine | Unlimited |
| Autonomous agent (asks before executing attacks) | Yes |
| Encrypted credential vault (AES-256) | Yes |
| Professional reports (PDF / DOCX / HTML / Markdown) | Yes |
| Persistent memory across sessions | Yes |
| Unlimited projects | Yes |
| Exportable timeline with forensic timestamps | Yes |
| Severity auto-tagging | Yes |
| Semantic memory search | Yes |
| Session snapshots | Yes |
| Mitigation suggestions per finding | Yes |
| Teacher mode (step-by-step) | Yes |
| Local REST API for automation | Yes |
| Slack / Discord / Telegram webhooks | Yes |
| Python plugin system | Yes |
| Scheduled scan scheduler | Yes |
| Custom PoC integration | Yes |
| Gamification (technical achievements) | Yes |
| LAN multi-user collaboration | Yes |
| Playbook marketplace | Yes |
| All Kali Linux / Parrot OS tools | Yes |
| IoT / exposed-services scanning (MQTT, OPC-UA, Modbus, CoAP, TR-069, RTSP) | Yes |
| Global IoT map with Shodan (your key, interactive 3D globe + filters) | Yes |
| OSINT relationship graph (Maltego-style, ordered entities) | Yes |
| Reverse face search (FaceCheck ID, your own key) | Yes |
| Fake identity generator (fakenamegenerator.com style, 5 locales) | Yes |
| LSB steganography (hide data inside images) | Yes |
| IP obfuscation (decimal / octal / hex / IPv6-mapped) | Yes |
| Favicon fingerprinting (Shodan-style hash pivot) | Yes |
| Subdomain takeover scanner (S3, GitHub Pages, Heroku, Azure) | Yes |
| Email spoofing posture (SPF / DMARC / DKIM grading) | Yes |
| Homograph domain generator (typosquat + punycode) | Yes |
| CORS misconfiguration scanner | Yes |
| TTL / CDN infrastructure fingerprint | Yes |
| Realistic User-Agent generator | Yes |
| Offline license-key generator (Luhn checksum) | Yes |
| Phone mode from the web dashboard (open port + PIN for the APK) | Yes |
| Reverse-shell generator (bash, python, nc, php, perl, ruby, powershell) | Yes |
| msfvenom payload factory (Windows/Linux/Android/php/python/macOS) | Yes |
| Phishing page cloner (authorized social-engineering tests) | Yes |
| VBA macro generator (AV-lab simulations) | Yes |
| Persistence script generator (cron, systemd, bashrc, LD_PRELOAD) | Yes |
| Keylogger script generator (authorized lab testing) | Yes |
| Wireless audit workflow (WPA handshake capture + deauth) | Yes |

---

## INSTALLATION

Requirements: Python 3.10+ on Kali Linux 2024.1+ (or any Linux with the
security toolset). ~2 GB free disk for dependencies; the assistant engine
adds several GB depending on the model.

```bash
git clone https://github.com/Cyt3rTo0ls/BMO-GHOST.git
cd BMO-GHOST
./install.sh
```

`install.sh` verifies Python, creates a virtualenv, installs dependencies,
creates the folder structure, initializes the SQLite database, sets file
permissions and checks for a local assistant engine.

### Project website

Official site (info, screenshots, tutorials):
**https://cyt3rto0ls.github.io/BMO-GHOST**

### Automatic install (opens your browser for you)

The installer does everything in one command: creates the virtualenv,
installs dependencies, **obfuscates the code** with PyArmor (the runtime
runs from `dist/`), initializes the database, starts the local server and
**opens Firefox (or your default Kali browser) automatically**:

```bash
./install.sh          # install everything (venv, deps, obfuscation, DB)
./install.sh once     # install (if needed) + start + open your browser
./install.sh run      # start the server only (uses the obfuscated dist/)
./install.sh stop     # stop the server
./install.sh obfuscate  # regenerate the obfuscated build (dist/)
```

Open `http://127.0.0.1:8080` in your browser (or let `./install.sh once`
do it for you). The code runs from the obfuscated `dist/` build; the source
tree is kept as the development copy.

### Which AI gets installed?

**None, by default.** The installer does NOT install any AI model. BMO-GHOST
reuses any local chat-completions API server that is already running on your
machine (Ollama, LM Studio, llama.cpp, a local proxy, ...) — it probes the
URL in `data/config.yaml` and the fallback ports (8010, 8011, 11434).

To auto-install the AI engine **sized to your hardware**, run:

```bash
./install.sh engine
```

It detects your hardware components (NVIDIA GPU + VRAM, AMD GPU + VRAM,
Apple Silicon, or CPU-only with RAM/cores) and downloads the model that fits
best, based on the VRAM/RAM rule of thumb: a ~N-billion-parameter model needs
roughly N GB of free VRAM/RAM (3b ~2-3 GB, 7b ~5-6 GB, 14b ~9-11 GB).

| Detected hardware | Model installed |
| --- | --- |
| NVIDIA GPU >= 16 GB VRAM  | `qwen2.5:14b` |
| NVIDIA GPU 8-16 GB VRAM   | `qwen2.5:7b`  |
| AMD GPU >= 16 GB VRAM     | `qwen2.5:14b` |
| AMD GPU 8-16 GB VRAM      | `qwen2.5:7b`  |
| Intel Arc A770 (16 GB)    | `qwen2.5:14b` |
| Intel Arc A750/A580 (8 GB)| `qwen2.5:7b`  |
| Intel Arc A310/A380 (6 GB)| `qwen2.5:7b`  |
| Intel iGPU (Iris/UHD)     | same as CPU-only (shared RAM) |
| Apple Silicon, RAM >= 16 GB | `qwen2.5:7b` |
| Apple Silicon, RAM < 16 GB  | `qwen2.5:3b` |
| CPU-only, RAM >= 32 GB & 8+ cores | `qwen2.5:14b` |
| CPU-only, RAM 8-32 GB      | `qwen2.5:7b`  |
| CPU-only, RAM < 8 GB       | `qwen2.5:3b`  |

You can force a specific model with `HB_MODEL=qwen2.5:14b ./install.sh engine`.

If an engine is already detected, `./install.sh engine` installs nothing and
just reports which one BMO-GHOST will use. You can also point
`data/config.yaml -> engine.url` at any other local chat-completions API:

```yaml
engine:
  url: "http://127.0.0.1:11434"   # e.g. Ollama
  fallback_ports: [8010, 8011, 11434]
```

BMO-GHOST probes the main URL, then the fallback ports. If no engine is
reachable, tools, memory, vault and reports still work; conversational
analysis is skipped. Remember: the engine runs locally and consumes
significant CPU/RAM.

---

## USAGE

Full step-by-step guides: [TUTORIAL.md](TUTORIAL.md) (English) and
[TUTORIAL_ES.md](TUTORIAL_ES.md) (Espanol). The interface includes a
language selector (EN/ES) in the status bar, a verbose mode toggle that
shows how long the assistant engine is thinking for each step, and the
free tier can browse all PRO capabilities from the sidebar (PRO view).

The terminal prompt (`>`) accepts both commands and questions.

- Type a tool command directly: `nmap -sV -T4 192.168.1.0/24`
- Use the scan helpers: `scan <target>`, `vulnscan <target>`, `iotscan <target>`, `recon <target>`
- Use the OSINT helpers: `osint <target>` (auto-routes domain/email/username/IP/phone),
  `email <addr>`, `user <username>`, `subdomains <domain>`, `whois <domain>`, `ip <addr>`,
  `meta <file>`, `phone <number>`, `dork <domain>`, `breach <email>`
- Ask questions in plain language (English or Spanish): the assistant engine
  analyzes previous output and suggests the next step.
- Set a working target: `target 10.10.10.1`
- `status` shows engine connectivity, quotas and detected tools.

### OSINT module

Open-source intelligence over public sources (WHOIS, DNS, certificate
transparency, HIBP k-anonymity breach checks, social profile probing),
using the Kali/Parrot OSINT toolset (theHarvester, amass, sublist3r,
sherlock, phoneinfoga, exiftool...) when installed and pure-Python
fallbacks when not. See [TUTORIAL.md](TUTORIAL.md) section 9b for the full
command list.

### PRO grey-tools kit (obscure but legal)

Techniques that almost no other tool ships, all offline except where noted.
Authorized testing only - the operator is solely responsible for lawful use.

```text
> fakeid es female                 # fake identity (5 locales: en/es/fr/de/it)
> stego <base64-data> [tag]        # LSB steganography: hide data in an image
> stego extract <base64-png>       # recover the hidden payload
> ipobf 8.8.8.8                    # IP in decimal/octal/hex/IPv6-mapped forms
> favhash example.com              # Shodan-style favicon hash (pivot identical servers)
> subto example.com                # subdomain takeover fingerprints (S3/GH Pages/Heroku/Azure)
> mailcheck example.com            # SPF / DMARC / DKIM email-spoofing posture
> homograph google.com             # typosquat + punycode lookalike domains
> cors example.com [origin]        # CORS misconfiguration probes
> ttl example.com                  # TTL / CDN infrastructure fingerprint
> uagen                            # realistic User-Agent strings
> licgen BMO                       # offline license key (Luhn checksum)
> licgen verify BMO-XXXX-...       # validate a key without any server
```

### PRO grey-tools kit 2 - online recon (no API key)

```text
> crtsh example.com            # subdomains from certificate transparency (crt.sh + CertSpotter fallback)
> certinfo example.com         # live TLS cert: issuer, SANs, expiry, TLS version
> webtitle https://example.com # status, final URL, title, server, tech hints
> robots https://example.com   # robots.txt parser (hidden path recon)
> cookies https://example.com  # cookie flag audit (HttpOnly/Secure/SameSite)
> banner example.com 80        # TCP banner grab (version disclosure)
> dnssec example.com           # DNSSEC signed? algorithms in use
> dnsbrute example.com         # local subdomain brute (60+ names, invisible to web logs)
> torcheck 8.8.8.8             # is the IP a Tor exit node?
> asn 8.8.8.8                  # ASN / network ownership (bgpview + ip-api fallback)
```

### PRO grey-tools kit 3 - offline crypto / wordlist / intel

```text
> xor <hex|text> [key]         # XOR cipher; no key = single-byte brute force (English scoring)
> basecrack <string>           # recursive base16/32/58/64/85 decoding
> hashid <hash>                # identify hash type (MD5/NTLM/SHA*/bcrypt/phpass...)
> entropy <hex|text>           # Shannon entropy (spot encrypted/obfuscated payloads)
> jwt <token>                  # decode JWT + crack weak HS256 secrets
> mimetype <hex|base64>        # magic-byte file type detection (offline)
> leet <word>                  # leetspeak variants for cracking wordlists
> caseperm <word>              # case permutations (bounded)
> numgen <word>                # number-pattern variants (years/dates/sequences)
> pwstrength <password>        # password strength scorer (zxcvbn-lite)
> ioc <text>                   # extract IPs/domains/URLs/emails/hashes/paths from any text
> defang <url>                 # hxxp:// + [.] for safe report sharing (and refang)
> uuid [n]                     # UUID v4 generator + version/variant parser
> macvendor <mac>              # MAC vendor lookup (built-in OUI table, offline)
```

### PRO offense lab (authorized red-team tooling)

Every tool below only generates commands, scripts and configs - nothing
attacks anything by itself. Run them only against hosts you own or have
written authorization to test.

```text
> evade 10.0.0.5 4444          # AV-evasion payload factory (msfvenom encoders + UPX)
> privesc linux                # privilege-escalation checklist (also: privesc windows)
> lateral 10.0.0.1 admin       # lateral movement (impacket, SSH pivots, chisel)
> exfil your-server.com        # exfiltration techniques for DLP testing
> phishmail a@b.com c@d.com    # phishing email generator (authorized sims)
> rubberducky GUI r,STRING notepad,ENTER
> smuggle <base64> file.pdf    # HTML smuggling generator (lab)
> c2 10.0.0.5 8443             # minimal C2 server + agent pair (lab)
> mimikatz logonpasswords      # mimikatz command builder (lab)
> impacket secretsdump 10.0.0.1 admin
> llmnr eth0                   # LLMNR/NBT-NS poisoning launcher (internal lab)
> rogueap Free-WiFi wlan0      # rogue AP configs (hostapd + dnsmasq)
> ransomlab /tmp/sandbox       # ransomware SIMULATOR (AES + restore, sandbox only)
> ransomlab decrypt /tmp/sandbox <KEY>
> beefhook http://your-beef:3000
> tunnel ssh-d 10.0.0.1        # pivoting (ssh -L/-R/-D, chisel, iodine, socat)
```

### PRO RAT / botnet lab (authorized testing only)

Everything below only generates scripts and configs for your own lab
(CTF boxes, malware-analysis sandbox, owned infra). Nothing attacks
anything by itself; the operator is solely responsible for legal use.

```text
> rat 10.0.0.5 4444 python     # minimal polling RAT agent (python|powershell)
> botnet 5 10.0.0.5 4444       # botnet lab: N agents + control panel + README
> beacongen 10.0.0.5 443       # C2 beacon with jitter + User-Agent rotation
> loader hta                   # downloader/loader (staged|hta|macro|vba)
> c2server 8443                # lab C2/exfil receiver (collects agent results)
> persisthook cron             # persistence snippets (registry|cron|systemd|launchd)
```

Proven end-to-end in this lab: generated the C2 receiver, generated the
agent, the agent polled `/task`, ran `id`, and the result landed in
`/tmp/bmo_c2_results.log`.

### Autonomous pentest / bug-bounty mode

Ask for an engagement in plain language and the agent plans and executes it
locally, step by step:

```text
> enumerate subdomains of example.com
> fuzz directories on example.com
> scan for vulnerabilities on 10.10.10.1
> haz reconocimiento a 10.10.10.1
> analiza los headers de https://example.com
```

For each step the engine chooses the tool and command, the agent executes it
locally, the engine analyzes the output and decides the next step (up to 3
steps per request). **High-risk actions (exploitation, brute force, etc.) are
never executed without explicit confirmation**: the agent proposes the
command and waits for your `yes` / `no` before running it. This matches the
PRO autonomous-agent behavior described in the features table.

### Minimum censorship / aggressive mode

The tool is designed for professional, authorized engagements and does not
second-guess the operator: firewall changes (iptables/ufw), disk imaging
(dd), lab formatting (mkfs) and all standard exploit/post-exploitation
tooling run freely. Only commands that would destroy the local host itself
(`rm -rf /`, writing to raw block devices) are blocked. The engine is
instructed to mark a command as high-risk only when it is truly
irreversible, so routine sqlmap/hydra/exploit steps do not trigger the
confirmation gate.

If you want zero confirmation prompts during autonomous mode, enable
aggressive mode (persistent across restarts):

```
> aggressive on
> aggressive off
```

When ON, the confirmation gate is skipped and you take full responsibility
for every command the engine runs.

**Stealth mode** (persistent across restarts) makes every operation
invisible on the target: low-and-slow rates, passive-first, no OS
fingerprinting and a minimal footprint (including quiet privilege
escalation):

```
> stealth on
> stealth off
> status          # shows stealth: ON (invisible)
```

**Reasoning modes** control how deeply BMO thinks before answering
(persistent across restarts, also selectable in the TOOLKIT view):

```
> mode live       # fast single pass, minimal latency
> mode medio      # plan + verify findings (default)
> mode agresivo   # deep reasoning: plan -> execute -> self-critique -> verify
> mode            # show current mode
```

In **agresivo** the engine runs a second self-critique pass over its own
answer (cross-checks hallucinated commands and unsafe claims) and the
autonomous loop runs up to 6 verified steps instead of 3 - higher latency,
best accuracy. In **live** it answers with a single fast pass.

**History cleanup** — wipe stored data by category, from the chat or the
TOOLKIT view (CLEAR HISTORY button):

```
> clear vulns        # vulnerabilities only
> clear scans        # scanned hosts only
> clear creds        # credential vault
> clear notes        # memory notes
> clear timeline     # activity timeline
> clear all          # everything
> clear chat         # conversation context only
```

**Vulnerability confirmation:** when a scan finds something, the AI runs a
live verification command and only reports findings it can confirm, with a
confidence percentage — no unverified claims.

Memory panel tracks hosts, credentials, vulnerabilities and notes. The
timeline panel records every event with timestamps.

---

## PRO ACTIVATION

1. Send **15 USDT** (one-time, permanent) to the TON wallet:
   `UQCznm2Z1o56J51EfNSnO922mzOQRhOF3m_o5T9Qx8WhK4w9`
2. Contact **@Cyt3rTo0ls** on Telegram.
3. Send a screenshot of the payment.
4. Receive a 6-digit activation key.
5. Enter the key in the application (PRO activation modal, top bar).

The key is validated locally against a mathematical relation; invalid keys
produce a generic rejection. PRO state is stored per local session.

A Telegram bot (`bot_handler.py`) is included for purchase support:

```bash
export TELEGRAM_BOT_TOKEN="your-bot-token"
export TELEGRAM_OWNER_ID="your-telegram-id"
python3 bot_handler.py
```

Commands: `/start`, `/buy`, `/activate`, `/key` (owner only).

---

## PLUGINS

Place Python plugins in `plugins/`. Each plugin exposes a `register(hb)` hook
receiving the BMO-GHOST API (`hb.executor`, `hb.memory`, `hb.vault`,
`hb.report`, `hb.agent`). Plugins are loaded at startup when PRO is active.

```python
# plugins/example_plugin.py
def register(hb):
    def my_action(target):
        return hb.executor.execute("nmap -sV " + target)
    hb.register_command("myaction", my_action)
```

Playbooks (reusable scan sequences, YAML/JSON) go in `playbooks/`.

---

## PROJECT STRUCTURE

```
BMO-GHOST/
├── app.py                 # FastAPI application (UI, WebSocket, REST, key middleware)
├── key_validator.py       # public key validation entry point
├── bot_handler.py         # Telegram support bot
├── install.sh             # installer
├── sales_page.html        # purchase / activation page
├── requirements.txt
├── core/
│   ├── agent.py           # orchestrator
│   ├── assistant_client.py# local engine client (chat-completions)
│   ├── tools_executor.py  # tool detection + safe execution
│   ├── scanner.py         # nmap / nuclei wrappers
│   ├── memory.py          # SQLite memory + FTS5 + AES-256 credentials
│   ├── vault.py           # AES-256 credential vault (PBKDF2)
│   ├── report_generator.py# PDF / DOCX / HTML / Markdown reports
│   ├── timeline.py        # event timeline
│   └── key_validator.py   # 6-digit key validation logic
├── ui/
│   ├── dashboard.html
│   └── assets/ (style.css, app.js, terminal.js)
├── data/
│   └── config.yaml        # engine, limits, payment, security config
├── images/                # interface screenshots (EN/ES)
├── plugins/               # Python plugins (PRO)
├── playbooks/             # playbook definitions
├── TUTORIAL.md            # installation and usage guide (English)
└── TUTORIAL_ES.md         # guia de instalacion y uso (Espanol)
```

---

## CONTRIBUTION

Pull requests are welcome. Keep the code sober, commented in technical
English, and emoji-free. Follow the existing structure. Security researchers
with responsible-disclosure experience are preferred.

---

## LICENSE

AGPL-3.0. See `LICENSE`. This software is provided "as is", without warranty
of any kind. You are responsible for using it legally.

---

## CONTACT

Telegram: **@Cyt3rTo0ls**
Wallet (TON / USDT): `UQCznm2Z1o56J51EfNSnO922mzOQRhOF3m_o5T9Qx8WhK4w9`
Price: **15 USDT** one-time, permanent.

WARNING: This tool is intended for authorized security testing only.
Unauthorized access to computer systems is illegal.
