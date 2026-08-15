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

## IMPORTANT: LOCAL APPLICATION - RESOURCE CONSUMPTION

HackerBrain OS is a **100% LOCAL, OFFLINE application**. Nothing runs in the
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

## FEATURES

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

---

## INSTALLATION

Requirements: Python 3.10+ on Kali Linux 2024.1+ (or any Linux with the
security toolset). ~2 GB free disk for dependencies; the assistant engine
adds several GB depending on the model.

```bash
git clone https://github.com/Cyt3rTo0ls/hackerbrain-os.git
cd hackerbrain-os
./install.sh
```

`install.sh` verifies Python, creates a virtualenv, installs dependencies,
creates the folder structure, initializes the SQLite database, sets file
permissions and checks for a local assistant engine.

### Start the application

```bash
source .venv/bin/activate
uvicorn app:app --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000` in your browser.

### Configure the local assistant engine

Edit `data/config.yaml`:

```yaml
engine:
  url: "http://127.0.0.1:8080"     # your local chat-completions endpoint
  fallback_ports: [8010, 8011, 11434]
```

HackerBrain OS probes the main URL, then the fallback ports. If no engine is
reachable, tools, memory, vault and reports still work; conversational
analysis is skipped. Remember: the engine runs locally and consumes
significant CPU/RAM.

---

## USAGE

The terminal prompt (`>`) accepts both commands and questions.

- Type a tool command directly: `nmap -sV -T4 192.168.1.0/24`
- Use the scan helpers: `scan <target>`, `vulnscan <target>`, `recon <target>`
- Ask questions in plain language (English or Spanish): the assistant engine
  analyzes previous output and suggests the next step.
- Set a working target: `target 10.10.10.1`
- `status` shows engine connectivity, quotas and detected tools.

Memory panel tracks hosts, credentials, vulnerabilities and notes. The
timeline panel records every event with timestamps.

---

## PRO ACTIVATION

1. Send **35 USDT** (one-time, permanent) to the TON wallet:
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
receiving the HackerBrain API (`hb.executor`, `hb.memory`, `hb.vault`,
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
hackerbrain-os/
├── app.py                 # FastAPI application (UI, WebSocket, REST, key middleware)
├── generate_key.py        # owner-only key minting tool
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
├── plugins/               # Python plugins (PRO)
└── playbooks/             # playbook definitions
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
Price: **35 USDT** one-time, permanent.

WARNING: This tool is intended for authorized security testing only.
Unauthorized access to computer systems is illegal.
