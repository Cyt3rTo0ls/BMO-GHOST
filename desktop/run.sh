#!/usr/bin/env bash
# HackerBrain OS - Desktop launcher.
# Installs everything automatically (venv, dependencies, pywebview) and
# opens the native desktop window. No browser required.
#
# Usage:
#   ./desktop/run.sh            # install + open desktop app
#   ./desktop/run.sh --debug    # open with devtools
#   ./desktop/run.sh --port 9000
#
# WARNING: intended for authorized security testing only.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="$ROOT_DIR/.venv"
PYTHON_BIN="${PYTHON_BIN:-python3}"

# ---- dependency check ------------------------------------------------- #
if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
    echo "[ERROR] $PYTHON_BIN not found. Install Python 3.10+ first." >&2
    exit 1
fi

# ---- create venv + install deps (first run only) ---------------------- #
if [ ! -x "$VENV_DIR/bin/python" ]; then
    echo "[1/4] Creating virtual environment..."
    "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

VENV_PY="$VENV_DIR/bin/python"
if [ ! -f "$VENV_DIR/.desktop_ready" ]; then
    echo "[2/4] Installing dependencies (requirements.txt + pywebview)..."
    "$VENV_PY" -m pip install --upgrade pip -q
    "$VENV_PY" -m pip install -r "$ROOT_DIR/requirements.txt" -q
    "$VENV_PY" -m pip install pywebview -q
    # create the data folders the app expects
    mkdir -p "$ROOT_DIR/data" "$ROOT_DIR/plugins" "$ROOT_DIR/playbooks" \
             "$ROOT_DIR/reports" "$ROOT_DIR/exports"
    touch "$VENV_DIR/.desktop_ready"
fi

# ---- verify webview runtime (Linux) ----------------------------------- #
if [ "$(uname -s)" = "Linux" ]; then
    if ! "$VENV_PY" -c "import gi; gi.require_version('Gtk','3.0'); import webview" >/dev/null 2>&1; then
        echo "[WARN] WebKit2 GTK runtime missing."
        echo "       Install it with: sudo apt install python3-gi gir1.2-webkit2-4.1"
        echo "       (Continuing with the browser fallback in 5s...)"
        sleep 5
        echo "[3/4] Starting server..."
        "$VENV_PY" -m uvicorn app:app --host 127.0.0.1 --port "${PORT:-8080}" \
            --app-dir "$ROOT_DIR" >/dev/null 2>&1 &
        sleep 3
        echo "[4/4] Opening browser: http://127.0.0.1:${PORT:-8080}"
        xdg-open "http://127.0.0.1:${PORT:-8080}" 2>/dev/null || true
        wait
        exit 0
    fi
fi

# ---- launch the native desktop window --------------------------------- #
echo "[3/4] Starting server and desktop window..."
echo "[4/4] Opening HackerBrain OS..."
cd "$ROOT_DIR"
exec "$VENV_PY" "$ROOT_DIR/desktop/desktop_app.py" "$@"
