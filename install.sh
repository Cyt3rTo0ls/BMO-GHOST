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
    # ---- detect this machine's hardware components --------------------------
    # RAM, GPU (NVIDIA VRAM / AMD VRAM / Apple Silicon) and CPU decide the
    # right model. The model is then downloaded ONLINE with "ollama pull".
    echo "[INFO] Detecting hardware components to pick the right model..."
    RAM_MB="$(free -m 2>/dev/null | awk '/^Mem:/{print $2}' || echo 8192)"
    CORES="$(getconf _NPROCESSORS_ONLN 2>/dev/null || echo 4)"
    GPU_NAME=""
    GPU_VRAM_MB=0
    GPU_BRAND=""
    # NVIDIA (nvidia-smi is the most reliable source of VRAM)
    if command -v nvidia-smi >/dev/null 2>&1; then
        GPU_NAME="$(nvidia-smi --query-gpu=name --format=csv,noheader 2>/dev/null | head -1)"
        GPU_VRAM_MB="$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits 2>/dev/null | head -1)"
        [ -n "$GPU_NAME" ] && GPU_BRAND="NVIDIA"
    fi
    # AMD (rocm-smi)
    if [ -z "$GPU_BRAND" ] && command -v rocm-smi >/dev/null 2>&1; then
        GPU_NAME="$(rocm-smi --showproductname 2>/dev/null | grep -i 'GPU\[0\]' | sed 's/.*: //')"
        GPU_VRAM_MB="$(rocm-smi --showmeminfo vram 2>/dev/null | grep -oE '[0-9]+' | head -1)"
        [ -n "$GPU_NAME" ] && GPU_BRAND="AMD"
    fi
    # Fallback: lspci (NVIDIA / AMD / Intel discrete)
    if [ -z "$GPU_BRAND" ] && command -v lspci >/dev/null 2>&1; then
        GPU_NAME="$(lspci 2>/dev/null | grep -iE 'vga.*(nvidia|amd|ati)|3d.*(nvidia|amd|ati)' | head -1 | sed 's/^[^:]*: //')"
        case "$GPU_NAME" in
            *[Nn]vidia*) GPU_BRAND="NVIDIA" ;;
            *[Aa][Mm][Dd]*|*[Aa][Tt][Ii]*) GPU_BRAND="AMD" ;;
        esac
    fi
    # Apple Silicon
    APPLE_SILICON=""
    if [ "$(uname -s)" = "Darwin" ] && [ "$(uname -m)" = "arm64" ]; then
        APPLE_SILICON="$(sysctl -n hw.model 2>/dev/null || echo Apple-Silicon)"
    fi
    # ---- pick the model -----------------------------------------------------
    # A ~N-billion-parameter model needs roughly N GB of free VRAM/RAM.
    # Rule of thumb used here (qwen2.5 family, GGUF quantized):
    #   3b -> ~2-3 GB    7b -> ~5-6 GB    14b -> ~9-11 GB
    MODEL="qwen2.5:3b"
    MODEL_REASON="default (lowest requirement)"
    if [ "$GPU_BRAND" = "NVIDIA" ] && [ "$GPU_VRAM_MB" -ge 16384 ]; then
        MODEL="qwen2.5:14b"; MODEL_REASON="NVIDIA GPU with ${GPU_VRAM_MB} MB VRAM"
    elif [ "$GPU_BRAND" = "NVIDIA" ] && [ "$GPU_VRAM_MB" -ge 8192 ]; then
        MODEL="qwen2.5:7b"; MODEL_REASON="NVIDIA GPU with ${GPU_VRAM_MB} MB VRAM"
    elif [ "$GPU_BRAND" = "AMD" ] && [ "$GPU_VRAM_MB" -ge 16384 ]; then
        MODEL="qwen2.5:14b"; MODEL_REASON="AMD GPU with ${GPU_VRAM_MB} MB VRAM"
    elif [ "$GPU_BRAND" = "AMD" ] && [ "$GPU_VRAM_MB" -ge 8192 ]; then
        MODEL="qwen2.5:7b"; MODEL_REASON="AMD GPU with ${GPU_VRAM_MB} MB VRAM"
    elif [ -n "$APPLE_SILICON" ]; then
        if [ "$RAM_MB" -ge 16384 ]; then MODEL="qwen2.5:7b"; else MODEL="qwen2.5:3b"; fi
        MODEL_REASON="Apple Silicon (${APPLE_SILICON})"
    elif [ "$RAM_MB" -ge 32768 ] && [ "$CORES" -ge 8 ]; then
        MODEL="qwen2.5:14b"; MODEL_REASON="CPU-only with ${RAM_MB} MB RAM / ${CORES} cores"
    elif [ "$RAM_MB" -ge 16384 ]; then
        MODEL="qwen2.5:7b"; MODEL_REASON="CPU-only with ${RAM_MB} MB RAM"
    elif [ "$RAM_MB" -ge 8192 ]; then
        MODEL="qwen2.5:7b"; MODEL_REASON="CPU-only with ${RAM_MB} MB RAM (7b fits, a bit slower)"
    else
        MODEL="qwen2.5:3b"; MODEL_REASON="low-RAM CPU-only machine (${RAM_MB} MB RAM)"
    fi
    # Allow an explicit override: HB_MODEL=qwen2.5:14b ./install.sh engine
    if [ -n "${HB_MODEL:-}" ]; then
        MODEL="$HB_MODEL"
        MODEL_REASON="forced by HB_MODEL"
    fi
    # ---- summary + download (online) ---------------------------------------
    echo "[INFO] Hardware detected:"
    echo "       RAM  : ${RAM_MB} MB"
    echo "       CPU  : ${CORES} cores"
    if [ -n "$GPU_BRAND" ]; then
        echo "       GPU  : ${GPU_BRAND} - ${GPU_NAME} (${GPU_VRAM_MB} MB VRAM)"
    elif [ -n "$APPLE_SILICON" ]; then
        echo "       GPU  : Apple Silicon (${APPLE_SILICON})"
    else
        echo "       GPU  : none detected (CPU-only)"
    fi
    echo "[INFO] Selected model: ${MODEL}  (${MODEL_REASON})"
    echo "[INFO] Downloading ${MODEL} ONLINE (ollama pull) - this may take a while..."
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
    if [ ! -f "$ROOT_DIR/core/agent.py" ]; then
        echo "[ERROR] Source tree (core/) not found. 'obfuscate' needs the local source; the public repo only ships dist/." >&2
        exit 1
    fi
    echo "[INFO] Obfuscating the code with PyArmor -> dist/ ..."
    "$VENV_DIR/bin/python" -m pip install --quiet pyarmor 2>/dev/null || true
    ( cd "$ROOT_DIR" && "$VENV_DIR/bin/pyarmor" gen -O dist -r core app.py bot_handler.py key_validator.py )
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
# The repository ships the obfuscated build (dist/). Only regenerate it when
# it is missing AND the plain source tree is available locally. Never run
# pyarmor with -O when the source is absent: it would wipe the shipped dist/.
if [ -f "$ROOT_DIR/dist/app.py" ]; then
    info "Using the existing obfuscated build (dist/)..."
elif [ -f "$ROOT_DIR/app.py" ]; then
    info "Obfuscating the code (PyArmor -> dist/)..."
    python -m pip install --quiet pyarmor 2>/dev/null || true
    (cd "$ROOT_DIR" && "$VENV_DIR/bin/pyarmor" gen -O dist -r core app.py bot_handler.py key_validator.py) \
        || info "[WARN] Obfuscation failed, the app will run from the source tree."
else
    info "[WARN] No obfuscated build (dist/) and no source tree in this checkout; continuing with what is present."
fi

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
