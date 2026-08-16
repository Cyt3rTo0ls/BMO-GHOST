#!/usr/bin/env bash
# HackerBrain OS - Desktop launcher.
# Installs everything automatically (venv, dependencies, WebKit2 GTK) with
# a live progress bar window, then opens the FULL web interface in a
# native desktop window (pywebview) - no browser needed. If WebKit2 is not
# available it falls back to the lightweight tkinter app (--lite) or the
# browser (--web).
#
# Usage:
#   ./desktop/run.sh                # install (progress bar) + open native window (full UI)
#   ./desktop/run.sh --install      # force reinstall (shows progress bar)
#   ./desktop/run.sh --uninstall    # remove the app from this machine
#   ./desktop/run.sh --lite         # lightweight tkinter app instead
#   ./desktop/run.sh --web          # launch the web UI in the browser
#   ./desktop/run.sh --lang es      # language hint (native app)
#   ./desktop/run.sh --port 9000    # server port
#
# WARNING: intended for authorized security testing only.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="$ROOT_DIR/.venv"
PYTHON_BIN="${PYTHON_BIN:-python3}"

# ---- standalone download mode ---------------------------------------- #
# If this script was downloaded alone (not inside the repo), clone the
# repository automatically so the download link works on its own.
if [ ! -f "$ROOT_DIR/app.py" ]; then
    echo "HackerBrain OS standalone installer"
    echo "The repository is not present yet - cloning it now..."
    DEST="${HB_INSTALL_DIR:-$HOME/hackerbrain-os}"
    if [ ! -d "$DEST/.git" ]; then
        git clone --depth 1 https://github.com/Cyt3rTo0ls/hackerbrain-os.git "$DEST" || {
            echo "[ERROR] Could not clone the repository (need git + network)." >&2
            exit 1
        }
    fi
    echo "Repository ready at $DEST"
    ROOT_DIR="$DEST"
    VENV_DIR="$ROOT_DIR/.venv"
fi

# ---- uninstall --------------------------------------------------------- #
if [ "${1:-}" = "--uninstall" ] || [ "${1:-}" = "-u" ]; then
    echo "HackerBrain OS uninstaller"
    echo "This will remove:"
    echo "  - the virtual environment ($VENV_DIR)"
    echo "  - installed Python packages (from that venv)"
    echo "  - the desktop install marker"
    echo "Your data (data/, reports/, exports/, keys) is KEPT."
    read -r -p "Continue? [y/N] " ans
    case "$ans" in
        y|Y|yes|YES|s|S|si|SI)
            if [ -d "$VENV_DIR" ]; then
                echo "[1/3] Removing virtual environment..."
                rm -rf "$VENV_DIR"
                echo "      removed $VENV_DIR"
            else
                echo "[1/3] No virtual environment found (nothing to remove)."
            fi
            echo "[2/3] Cleaning __pycache__ and bytecode caches..."
            find "$ROOT_DIR" -type d -name "__pycache__" -prune -exec rm -rf {} + 2>/dev/null || true
            find "$ROOT_DIR" -name "*.pyc" -delete 2>/dev/null || true
            echo "[3/3] Removing desktop markers..."
            rm -f "$ROOT_DIR/data/.desktop_ready" 2>/dev/null || true
            echo ""
            echo "HackerBrain OS has been uninstalled from this machine."
            echo "Your data was kept. Run ./desktop/run.sh to reinstall."
            exit 0
            ;;
        *)
            echo "Uninstall cancelled."
            exit 1
            ;;
    esac
fi

# ---- dependency check -------------------------------------------------- #
if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
    echo "[ERROR] $PYTHON_BIN not found. Install Python 3.10+ first." >&2
    exit 1
fi

# ---- install with progress bar (first run or forced) ------------------- #
NEEDS_INSTALL=false
if [ ! -x "$VENV_DIR/bin/python" ] || [ ! -f "$VENV_DIR/.desktop_ready" ]; then
    NEEDS_INSTALL=true
fi
if [ "${1:-}" = "--install" ] || [ "${1:-}" = "-i" ]; then
    NEEDS_INSTALL=true
fi

if $NEEDS_INSTALL; then
    echo "HackerBrain OS first-run setup..."
    "$PYTHON_BIN" "$ROOT_DIR/desktop/installer.py"
    if [ $? -ne 0 ]; then
        echo "[ERROR] Installation failed. Check the messages above." >&2
        exit 1
    fi
    # shift away the --install flag so the app args stay clean
    if [ "${1:-}" = "--install" ] || [ "${1:-}" = "-i" ]; then
        shift || true
    fi
fi

VENV_PY="$VENV_DIR/bin/python"
if [ ! -x "$VENV_PY" ]; then
    echo "[ERROR] venv python not found at $VENV_PY" >&2
    exit 1
fi

# ---- web mode (browser) --------------------------------------------- #
if [ "${1:-}" = "--web" ] || [ "${1:-}" = "-w" ]; then
    echo "[web] Starting server on http://127.0.0.1:${PORT:-8080}"
    cd "$ROOT_DIR"
    exec "$VENV_PY" -m uvicorn app:app --host 127.0.0.1 --port "${PORT:-8080}" \
        --app-dir "$ROOT_DIR"
fi

# ---- lightweight mode (tkinter, in-process agent) --------------------- #
if [ "${1:-}" = "--lite" ] || [ "${1:-}" = "-l" ]; then
    echo "[lite] Starting lightweight native app (tkinter)..."
    cd "$ROOT_DIR"
    exec "$VENV_PY" "$ROOT_DIR/desktop/native_app.py" "$@"
fi

# ---- default: full web UI in a native window (pywebview) ------------- #
# The complete interface (maps, graphs, OSINT, IoT, terminal, panels)
# rendered in a real desktop window. Requires WebKit2 GTK, which the
# installer sets up automatically (may ask for sudo once).
if "$VENV_PY" -c "import gi; gi.require_version('Gtk','3.0'); import webview" >/dev/null 2>&1; then
    echo "[launch] Starting HackerBrain OS (full interface, native window)..."
    cd "$ROOT_DIR"
    exec "$VENV_PY" "$ROOT_DIR/desktop/desktop_app.py" "$@"
fi

# WebKit2 missing: fall back to the lightweight tkinter app instead of
# opening a browser.
echo "[warn] WebKit2 GTK not available - using the lightweight app."
echo "       (Run './desktop/run.sh --web' for the browser, or reinstall"
echo "       with './desktop/run.sh --install' to auto-install WebKit2)"
cd "$ROOT_DIR"
exec "$VENV_PY" "$ROOT_DIR/desktop/native_app.py" "$@"
