# HackerBrain OS - Installation and Usage Tutorial (English)

**Language / Idioma:** [English](TUTORIAL.md) | [Espanol](TUTORIAL_ES.md)

This guide walks you through installing HackerBrain OS, connecting the local
assistant engine, and using the main features.

> WARNING: This tool is intended for authorized security testing only.
> Unauthorized access to computer systems is illegal. The author assumes
> no liability for misuse of this software.

> IMPORTANT: HackerBrain OS is a LOCAL application. Everything runs on this
> machine and consumes significant CPU/RAM/disk resources, especially while
> the assistant engine model is loaded and during inference. Plan your
> hardware accordingly.

---

## Table of contents

1. [Requirements](#1-requirements)
2. [Installation](#2-installation)
3. [Start the application](#3-start-the-application)
4. [Configure the local assistant engine](#4-configure-the-local-assistant-engine)
5. [Interface tour](#5-interface-tour)
6. [Using the terminal](#6-using-the-terminal)
7. [Scan helpers](#7-scan-helpers)
8. [Memory, timeline and reports](#8-memory-timeline-and-reports)
9. [PRO activation](#9-pro-activation)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Requirements

- Kali Linux 2024.1+ (or any Linux distribution with the security toolset)
- Python 3.10 or newer
- The standard tools you plan to use must be in `PATH` (nmap, nuclei, etc.)
- Enough free RAM/disk for the assistant engine model you intend to load
- Internet only for the initial `pip install`; the application itself runs offline

Hardware note: the conversational engine needs a machine that can actually
run a local model (capable CPU/GPU and enough RAM). The author's own machine
does not run it; this project targets users whose hardware can. All other
features (tools, memory, vault, reports) run on any Kali/Parrot box even
without the engine.

Check your Python version:

```bash
python3 --version
```

## 2. Installation

```bash
git clone https://github.com/Cyt3rTo0ls/hackerbrain-os.git
cd hackerbrain-os
./install.sh
```

What `install.sh` does:

1. Verifies that Python 3.10+ is present (with a clear error otherwise).
2. Creates a Python virtual environment (`.venv`).
3. Installs all dependencies from `requirements.txt`.
4. Creates the folder structure (`data/`, `ui/assets/`, `reports/`, ...).
5. Initializes the local SQLite database (`data/memory.db`).
6. Sets the correct file permissions.
7. Probes for a local assistant engine on ports 8080, 8010 and 8011.

If you prefer to install manually:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 3. Start the application

```bash
./install.sh run     # start on http://127.0.0.1:8080
./install.sh stop    # stop it
```

Or manually:

```bash
source .venv/bin/activate
uvicorn app:app --host 127.0.0.1 --port 8080
```

Open your browser at `http://127.0.0.1:8080`.

The status bar at the top shows:

- the current project name
- the session timer
- the version (v1.0.0 LOCAL)
- the assistant engine state (`engine: online` / `engine: offline (local)`)
- your license tier (FREE / PRO)

## 4. Configure the local assistant engine

The assistant engine is an OpenAI-compatible chat-completions API server that
runs on your machine. HackerBrain OS probes these endpoints in order:

1. `http://127.0.0.1:8080` (default, from `data/config.yaml`)
2. `http://127.0.0.1:8010`
3. `http://127.0.0.1:8011`
4. `http://127.0.0.1:11434`

To change the endpoint, edit `data/config.yaml`:

```yaml
engine:
  url: "http://127.0.0.1:8080"
  fallback_ports: [8010, 8011, 11434]
```

You can also override the URL with the environment variable `HB_ENGINE_URL`.

If no engine is reachable, HackerBrain OS still works: tools, memory, vault
and reports do not depend on it. Only conversational analysis (questions and
autonomous decisions) is disabled until an engine is available.

## 5. Interface tour

The interface has four zones:

- **Status bar** (top): project, session timer, version, engine state, license.
- **Sidebar** (left): navigation between TERMINAL, VULNERABILITIES, VAULT,
  REPORTS and MEMORY.
- **Main panel** (center): the active view.
- **Timeline panel** (right): every significant event with timestamps.

The language toggle (EN/ES) is in the status bar. The choice is remembered
by your browser.

## 6. Using the terminal

The prompt (`>`) accepts both commands and plain-language questions.

Commands:

```bash
> whoami
> nmap -sV -T4 192.168.1.0/24
> searchsploit --list
> target 10.10.10.1
> status
```

- `target <host>` sets the working target (shown in the context of the
  assistant engine).
- Any tool that is in your `PATH` can be executed directly. Output is
  truncated for display but captured in full for the session.
- High-risk destructive commands (for example `rm -rf /`) are blocked by a
  safety filter.
- Toggle verbose mode: `verbose on` / `verbose off` (or the VERBOSE button
  in the status bar). When enabled, the terminal shows how long the assistant
  engine is thinking for each step (for example `[engine thought for 12.4s]`)
  and how long each command took to run.

Questions (English or Spanish):

```text
> what is the best way to enumerate ports on a Windows host?
> que herramienta usarias para enumerar subdominios y por que?
```

The assistant engine analyzes the previous output and answers, or proposes
the next step. If it proposes a command, review it and run it manually.
The autonomous agent always asks before executing anything high-risk.

Natural-language scanning (executed locally, not text-only):

```text
> escanea solo los dispositivos conectados a mi red
> scan my network for live hosts
> escanea los puertos de 192.168.1.50
```

Scan requests are detected in English and Spanish. If you say "mi red" /
"my network" without an explicit target, HackerBrain OS reads your routing
table, detects the local subnet (the interface behind the default route)
and runs a real host discovery (or port scan) against it. Live hosts are
stored in memory with their MAC vendor when available.

### Autonomous pentest / bug-bounty mode

HackerBrain OS is not limited to scans. Ask for an engagement in plain
language (English or Spanish) and the agent executes it locally, step by
step:

```text
> enumerate subdomains of example.com
> fuzz directories on example.com
> scan for vulnerabilities on 10.10.10.1
> haz reconocimiento a 10.10.10.1
> analiza los headers de https://example.com
> busca credenciales por defecto en 10.10.10.1
```

For every step the local engine selects the tool and the exact command, the
agent runs it, the engine analyzes the output and decides the next step (up
to 3 steps per request). High-risk actions (exploitation, brute force,
credential attacks, MITM) are gated: the agent shows the proposed command
and asks for explicit confirmation before executing it. Reply `yes`/`si` to
run it or `no` to cancel. This keeps the tool safe for authorized
engagements only.

## 7. Scan helpers

Instead of typing raw tool commands, you can use the built-in helpers:

```bash
> scan 10.10.10.0/24            # nmap port scan (default ports 1-1000)
> scan 10.10.10.1 1-65535       # with explicit port range
> vulnscan https://target.com   # nuclei template scan
> recon target.com              # quick recon: ports + vuln scan if web is up
```

## 8. Memory, timeline and reports

- **Memory**: hosts, credentials (encrypted), vulnerabilities and notes are
  stored locally in `data/memory.db`. The free tier stores up to 50 entries
  and wipes them when the session ends; PRO keeps them across sessions.
- **Timeline**: every scan, chat and event is logged with a UTC timestamp.
  PRO can export it with forensic timestamps.
- **Reports**: PRO can generate Executive, Technical, PCI-DSS and HIPAA
  reports in PDF, DOCX, HTML or Markdown. Reports are written to `reports/`.

## 9. PRO activation

1. Send **35 USDT** (one-time, permanent) to the TON wallet:
   `UQCznm2Z1o56J51EfNSnO922mzOQRhOF3m_o5T9Qx8WhK4w9`
2. Contact **@Cyt3rTo0ls** on Telegram.
3. Send a screenshot of the payment.
4. Receive a 6-digit activation key.
5. Enter it in the PRO activation modal (top bar button).

PRO unlocks: unlimited engine usage, encrypted vault, report generation,
persistent memory, unlimited projects, plugins, webhooks, snapshots,
IoT/exposed-services scanning, and more.

### PRO activation is PERMANENT and single-use

- The key is **bound to this machine**: once activated, PRO stays active
  across restarts and sessions. You never re-enter the key.
- Keys are **single-use**: the first machine that activates a key consumes
  it, so the same key cannot be sold twice. If a key is shared/stolen, the
  seller can revoke it globally and it stops working everywhere.

### PRO training (teach the assistant)

PRO users can teach the assistant their preferences. Entries are stored
locally and injected into the engine context on every turn:

```
train preference: always use -sV service detection
train target: 10.0.0.5 is the production box
> training            # list entries
```

Or via the UI (PRO section). This is lightweight context injection -
no model weights are modified, everything stays local.

### Global IoT map (PRO, Shodan)

PRO includes an interactive world map of exposed devices. Open the **IoT MAP**
tab in the sidebar, paste **your own Shodan API key** (free tier works), and
search with Shodan query syntax:

```
cameras
routers
port:3389 country:BR
product:"Hikvision"
"default password"
```

Each result is a marker on a zoomable world map. Click a host for full
details: owner organization, ISP, ASN, city/country, open ports, service
banners and known CVEs. The same search works from the terminal:

```
shodan cameras port:554
```

The key is stored locally (`data/shodan.key`, mode 600) and validated
against the Shodan API on save; it is never uploaded anywhere.

### Extra recon commands

```
dns example.com                 # A/AAAA/MX/NS/TXT/SOA/CNAME enumeration
dnsspoof example.com            # DNS spoofing/cache-poisoning test (authorized labs)
```

Every scan reports an **estimated duration** up front (verbose line
`[estimated duration: ~X min]`), so you know how long a step will take,
including how rate limits stretch the time.

### Minimum censorship

HackerBrain OS does not censor professional tooling: iptables/ufw, dd, mkfs
and all exploit/post-exploitation tools run freely. Only commands that would
destroy the local host itself are blocked. The engine marks a step as
high-risk only for truly irreversible actions, so routine sqlmap/hydra/
exploit steps don't trigger confirmations. To disable the confirmation gate
totally (persistent): `aggressive on` / `aggressive off`.

## 9b. OSINT (open-source intelligence)

HackerBrain OS ships a full OSINT module (`osint <target>` auto-routes the
target type) that uses the Kali/Parrot OSINT toolset when installed and
falls back to pure-Python implementations, so every command works on any
box. Only public sources are queried (WHOIS, DNS, certificate-transparency
logs, public breach APIs).

```
osint example.com               # auto: domain -> whois+dns+subdomains+emails
osint 8.8.8.8                   # auto: IP -> whois+geo+reverse DNS
osint alice@example.com         # auto: email -> MX + breach + dorks
osint torvalds                  # auto: username -> social profiles
email alice@example.com         # email intelligence (MX, breach check, dorks)
user torvalds                   # username search across social networks
subdomains example.com          # crt.sh + amass + sublist3r + theHarvester
whois example.com               # registration data
ip 8.8.8.8                      # geolocation + WHOIS + reverse DNS
meta ./photo.jpg                # EXIF/GPS/author metadata of a local file
phone "+34 600 000 000"         # phone OSINT (phoneinfoga if installed)
dork example.com                # Google dorks for the target
breach alice@example.com        # breach exposure check (HIBP)
```

Notes:
- `subdomains`, `osint <domain>` and `user` run several sources in
  parallel with bounded timeouts (~35-40s max), so a slow passive source
  never blocks the command.
- Breach checks use HIBP's k-anonymity range API (only the first 5 chars
  of the SHA-1 hash leave the machine); the full breach API needs a key.
- OSINT is passive and legal against authorized targets; dorks are queries
  only - respect each platform's terms of service.

## 10. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `engine: offline (local)` | No engine on the probed ports. Start your local chat-completions API server, or point `engine.url` at it. |
| `Error: Python 3.10+ is required` | Your system Python is older. Install a newer Python and re-run `./install.sh`. |
| `pip` fails to install | Check network access; then `source .venv/bin/activate && pip install -r requirements.txt`. |
| `tool 'X' is not installed` | The tool is not in `PATH`. Install it (e.g. `sudo apt install X`) and refresh the tools list. |
| Reports require PRO | Reports, vault and persistent memory are PRO features. Activate PRO. |
| High CPU/RAM usage | Expected. The engine runs locally and consumes significant resources while a model is loaded. |

---

Spanish version: [TUTORIAL_ES.md](TUTORIAL_ES.md)
English README: [README.md](README.md)
