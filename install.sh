#!/usr/bin/env bash
#
# BMO-GHOST - installer
#
# WARNING: This tool is intended for authorized security testing only.
# Unauthorized access to computer systems is illegal. The author assumes
# no liability for misuse of this software.
#
# BMO-GHOST is a LOCAL application. Everything runs on this machine:
# the web UI, the SQLite databases and the assistant engine. No data leaves
# your host. Running the assistant engine locally consumes significant
# CPU, RAM and disk resources, especially during model loading and inference.
# Plan your hardware accordingly before enabling long sessions.
#
set -euo pipefail

# --- paths ---------------------------------------------------------------
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$ROOT_DIR/.venv"
DATA_DIR="$ROOT_DIR/data"
UI_DIR="$ROOT_DIR/ui"
CORE_DIR="$ROOT_DIR/core"

# --- commands -------------------------------------------------------------
# ./install.sh          -> install everything (venv, deps, DB)
# ./install.sh run      -> start the application + open Firefox/browser
# ./install.sh once     -> install (if needed) + start + open browser
# ./install.sh stop     -> stop the application
# ./install.sh engine   -> OPTIONAL: auto-install the local AI engine (Ollama)
#                          + a model sized to your hardware (RAM), if no
#                          engine is already running. Nothing is installed
#                          by default: BMO-GHOST reuses any local
#                          chat-completions API you already have.
CMD="${1:-install}"

# --- open the default browser (Firefox on Kali by default) ----------------
open_browser() {
    URL="http://127.0.0.1:${PORT:-8080}"
    echo "[INFO] Opening $URL in your browser (Firefox by default on Kali)..."
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$URL" >/dev/null 2>&1 || true
    elif command -v firefox >/dev/null 2>&1; then
        firefox "$URL" >/dev/null 2>&1 || true
    elif command -v chromium >/dev/null 2>&1; then
        chromium "$URL" >/dev/null 2>&1 || true
    else
        echo "[WARN] No browser opener found. Open manually: $URL"
    fi
}

# --- run / stop shortcuts (before the banner, so stop stays clean) --------
if [ "$CMD" = "run" ]; then
    if [ ! -x "$VENV_DIR/bin/python" ]; then
        echo "[ERROR] Not installed yet. Run ./install.sh (without arguments) first." >&2
        exit 1
    fi
    echo "[INFO] Starting BMO-GHOST on http://127.0.0.1:${PORT:-8080}"
    cd "$ROOT_DIR"
    # Prefer the obfuscated build (dist/); fall back to the source tree.
    if [ -f "$ROOT_DIR/dist/app.py" ]; then
        APP_DIR="$ROOT_DIR/dist"
        echo "[INFO] Running obfuscated build (dist/)..."
    else
        APP_DIR="$ROOT_DIR"
        echo "[INFO] Obfuscated build not found, running from source..."
    fi
    # start the server detached (survives terminal close), then open the browser
    setsid nohup bash -c "cd '$APP_DIR' && '$VENV_DIR/bin/python' -m uvicorn app:app \
        --host 127.0.0.1 --port '${PORT:-8080}'" \
        >/tmp/bmo_ghost.log 2>&1 &
    SERVER_PID=$!
    echo "$SERVER_PID" > "$DATA_DIR/.server_pid" 2>/dev/null || true
    sleep 2
    open_browser
    echo "[INFO] Server running (PID $SERVER_PID). Stop it with: ./install.sh stop"
    echo "[INFO] Log: /tmp/bmo_ghost.log"
    exit 0
fi

if [ "$CMD" = "once" ]; then
    # one-shot: make sure it's installed, then run + open browser
    if [ ! -x "$VENV_DIR/bin/python" ] || [ ! -f "$DATA_DIR/.installed" ]; then
        exec "$0" install
    fi
    exec "$0" run
fi

if [ "$CMD" = "stop" ]; then
    pkill -f 'uvicorn app:app' 2>/dev/null || true
    pkill -f 'bmo_ghost.log' 2>/dev/null || true
    rm -f "$DATA_DIR/.server_pid" 2>/dev/null || true
    echo "[OK] BMO-GHOST stopped."
    exit 0
fi

if [ "$CMD" = "engine" ]; then
    # OPTIONAL local AI engine: detect an existing engine first; only if none
    # is found, install Ollama and pull a model sized to this machine's RAM.
    echo "[INFO] Checking for an existing local engine..."
    FOUND=""
    for port in 8010 8011 11434; do
        if curl -s --max-time 3 "http://127.0.0.1:${port}/health" >/dev/null 2>&1; then
            FOUND="$port"
            break
        fi
    done
    if [ -n "$FOUND" ]; then
        echo "[OK] A local chat-completions engine is already running on port ${FOUND}."
        echo "     BMO-GHOST will use it (see data/config.yaml -> engine.url)."
        echo "     Nothing was installed."
        exit 0
    fi
    echo "[INFO] No engine found. Installing the local AI runtime (Ollama)..."
    if ! command -v ollama >/dev/null 2>&1; then
        curl -fsSL https://ollama.com/install.sh | sh || fail "Ollama installation failed."
    fi
    # Pick the model based on this machine's RAM (components).
    RAM_MB="$(free -m 2>/dev/null | awk '/^Mem:/{print $2}' || echo 8192)"
    if [ "$RAM_MB" -lt 8192 ]; then
        MODEL="qwen2.5:3b"          # low-RAM machines (<= 8 GB)
    elif [ "$RAM_MB" -lt 16384 ]; then
        MODEL="qwen2.5:7b"          # mid-range (8-16 GB)
    else
        MODEL="qwen2.5:14b"         # powerful machines (16 GB+)
    fi
    echo "[INFO] Detected ${RAM_MB} MB RAM -> pulling ${MODEL} ..."
    ollama pull "$MODEL" || fail "Model pull failed."
    if command -v systemctl >/dev/null 2>&1 && [ "$(id -u)" -eq 0 ]; then
        systemctl enable ollama >/dev/null 2>&1 || true
        systemctl start ollama >/dev/null 2>&1 || true
    fi
    # Point BMO-GHOST at Ollama (11434) in data/config.yaml.
    if [ -f "$DATA_DIR/config.yaml" ]; then
        sed -i 's|^  url: .*|  url: "http://127.0.0.1:11434"|' "$DATA_DIR/config.yaml" 2>/dev/null || true
        echo "[OK] data/config.yaml -> engine.url set to http://127.0.0.1:11434"
    fi
    echo "[OK] Local AI engine ready (${MODEL}). Start BMO-GHOST with: ./install.sh once"
    exit 0
fi

if [ "$CMD" = "obfuscate" ]; then
    if [ ! -x "$VENV_DIR/bin/python" ]; then
        echo "[ERROR] Not installed yet. Run ./install.sh (without arguments) first." >&2
        exit 1
    fi
    echo "[INFO] Obfuscating the code with PyArmor -> dist/ ..."
    "$VENV_DIR/bin/python" -m pip install --quiet pyarmor 2>/dev/null || true
    ( cd "$ROOT_DIR" && "$VENV_DIR/bin/pyarmor" gen -O dist -r core app.py bot_handler.py )
    echo "[OK] Obfuscated build ready in dist/ (used automatically by ./install.sh run)."
    exit 0
fi

# --- helpers -------------------------------------------------------------
fail() {
    echo "[ERROR] $*" >&2
    exit 1
}

info() {
    echo "[INFO] $*"
}

# --- legal notice --------------------------------------------------------
cat <<'LEGAL'
BMO-GHOST - local pentesting assistant
WARNING: This tool is intended for authorized security testing only.
Unauthorized access to computer systems is illegal. The author assumes
no liability for misuse of this software.

This application runs 100% LOCAL. It consumes significant system
resources (CPU/RAM/disk) because the assistant engine is executed
on this machine, offline.
LEGAL

# --- python check --------------------------------------------------------
info "Checking Python version..."
if ! command -v python3 >/dev/null 2>&1; then
    fail "Python 3 was not found. Install Python 3.10 or newer first."
fi

PY_VERSION="$(python3 -c 'import sys; print("%d.%d" % (sys.version_info[0], sys.version_info[1]))')"
PY_MAJOR="${PY_VERSION%%.*}"
PY_MINOR="${PY_VERSION#*.}"

if [ "$PY_MAJOR" -lt 3 ] || { [ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 10 ]; }; then
    fail "Python 3.10+ is required. Detected version: $PY_VERSION"
fi
info "Python $PY_VERSION detected (3.10+ required)."

# --- virtualenv ----------------------------------------------------------
if [ ! -d "$VENV_DIR" ]; then
    info "Creating virtual environment..."
    python3 -m venv "$VENV_DIR" || fail "Failed to create virtual environment."
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate" || fail "Failed to activate virtual environment."

# --- dependencies --------------------------------------------------------
info "Installing dependencies (pip install -r requirements.txt)..."
python -m pip install --upgrade pip >/dev/null 2>&1 || true
python -m pip install -r "$ROOT_DIR/requirements.txt" || fail "Dependency installation failed."

# --- obfuscation ---------------------------------------------------------
info "Obfuscating the code (PyArmor -> dist/)..."
python -m pip install --quiet pyarmor 2>/dev/null || true
(cd "$ROOT_DIR" && "$VENV_DIR/bin/pyarmor" gen -O dist -r core app.py bot_handler.py) \
    || info "[WARN] Obfuscation failed, the app will run from the source tree."

# --- folder structure ----------------------------------------------------
info "Creating folder structure..."
mkdir -p "$DATA_DIR" "$UI_DIR/assets" "$CORE_DIR" \
    "$ROOT_DIR/plugins" "$ROOT_DIR/playbooks" "$ROOT_DIR/reports" "$ROOT_DIR/exports"
touch "$DATA_DIR/.keep"

# --- assistant engine check ----------------------------------------------
ENGINE_OK=0
for port in 8080 8010 8011; do
    if curl -s --max-time 3 "http://127.0.0.1:${port}/health" >/dev/null 2>&1; then
        info "Local assistant engine detected on port ${port}."
        ENGINE_OK=1
        break
    fi
done

if [ "$ENGINE_OK" -eq 0 ]; then
    info "No local assistant engine detected on 127.0.0.1:8080/8010/8011."
    info "BMO-GHOST keeps working: core tools, memory, vault and reports"
    info "do not require the engine. To auto-install one sized to your"
    info "hardware run: ./install.sh engine   (installs Ollama + a model"
    info "chosen by your RAM: qwen2.5:3b / 7b / 14b)."
    info "Or point data/config.yaml -> engine.url at any local"
    info "chat-completions API server. This is expected to consume"
    info "significant CPU/RAM while a model is loaded."
fi

# --- database initialization ---------------------------------------------
info "Initializing SQLite database..."
python - "$ROOT_DIR" <<'PYEOF' || fail "Database initialization failed."
import os
import sqlite3
import sys

root = sys.argv[1]
db_path = os.path.join(root, "data", "memory.db")
conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.executescript(
    """
    CREATE TABLE IF NOT EXISTS hosts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip TEXT NOT NULL,
        hostname TEXT DEFAULT '',
        os TEXT DEFAULT '',
        ports TEXT DEFAULT '[]',
        services TEXT DEFAULT '[]',
        first_seen TEXT DEFAULT (datetime('now')),
        last_seen TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS credentials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host TEXT DEFAULT '',
        username TEXT NOT NULL,
        password_enc BLOB DEFAULT NULL,
        source TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS vulnerabilities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cve_id TEXT DEFAULT '',
        host TEXT DEFAULT '',
        port INTEGER DEFAULT 0,
        severity TEXT DEFAULT 'LOW',
        description TEXT DEFAULT '',
        poc_available INTEGER DEFAULT 0,
        mitigation TEXT DEFAULT '',
        found_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT DEFAULT '',
        body TEXT DEFAULT '',
        updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        started_at TEXT DEFAULT (datetime('now')),
        ended_at TEXT DEFAULT '',
        project TEXT DEFAULT 'default'
    );
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS timeline (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts TEXT DEFAULT (datetime('now')),
        kind TEXT DEFAULT 'event',
        detail TEXT DEFAULT ''
    );
    """
)
conn.commit()
conn.close()
print("SQLite database ready at data/memory.db")
PYEOF

# --- permissions ---------------------------------------------------------
info "Setting file permissions..."
chmod 755 "$ROOT_DIR/install.sh" "$ROOT_DIR/app.py" 2>/dev/null || true
chmod 644 "$ROOT_DIR/requirements.txt" "$ROOT_DIR/README.md" 2>/dev/null || true

# --- mark installed -------------------------------------------------------
touch "$DATA_DIR/.installed" 2>/dev/null || true

# --- done ----------------------------------------------------------------
cat <<'DONE'

[OK] Installation complete. The code was obfuscated into dist/ and the
     server will run from that obfuscated build.

     Start everything and open Firefox/browser:  ./install.sh once
     Start the server only:                      ./install.sh run
     Stop it:                                    ./install.sh stop
     Re-obfuscate the code:                      ./install.sh obfuscate
     Open:                                       http://127.0.0.1:8080

     ABOUT THE AI:
       BMO-GHOST does NOT install an AI by default. It reuses any local
       chat-completions API already on your machine (Ollama, LM Studio,
       llama.cpp, a custom proxy on ports 8010/8011/11434, ...).
       To auto-install the engine + a model sized to your hardware:
           ./install.sh engine
       (it picks qwen2.5:3b/7b/14b based on your RAM).

     Note: BMO-GHOST is LOCAL. The assistant engine runs on this
     machine and consumes significant CPU/RAM/disk resources.
DONE
