#!/usr/bin/env bash
#
# HackerBrain OS - installer
#
# WARNING: This tool is intended for authorized security testing only.
# Unauthorized access to computer systems is illegal. The author assumes
# no liability for misuse of this software.
#
# HackerBrain OS is a LOCAL application. Everything runs on this machine:
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
# ./install.sh run   -> start the application
# ./install.sh stop  -> stop the application
CMD="${1:-install}"

# --- run / stop shortcuts (before the banner, so stop stays clean) --------
if [ "$CMD" = "run" ]; then
    if [ ! -x "$VENV_DIR/bin/uvicorn" ]; then
        echo "[ERROR] Not installed yet. Run ./install.sh first." >&2
        exit 1
    fi
    echo "[INFO] Starting HackerBrain OS on http://127.0.0.1:8080"
    cd "$ROOT_DIR"
    exec "$VENV_DIR/bin/python" -m uvicorn app:app --host 127.0.0.1 --port 8080
fi

if [ "$CMD" = "stop" ]; then
    pkill -f 'uvicorn app:app' 2>/dev/null || true
    echo "[OK] HackerBrain OS stopped."
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
HackerBrain OS - local pentesting assistant
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
    info "HackerBrain OS keeps working: core tools, memory, vault and reports"
    info "do not require the engine. Install a local chat-completions API"
    info "server and point data/config.yaml -> engine.url at it"
    info "to enable conversational analysis. This is expected to consume"
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

# --- done ----------------------------------------------------------------
cat <<'DONE'

[OK] Installation complete.
     Start the application with:  ./install.sh run
     Stop it with:                ./install.sh stop
     Open:                        http://127.0.0.1:8080

     Note: HackerBrain OS is LOCAL. The assistant engine runs on this
     machine and consumes significant CPU/RAM/disk resources.
DONE
