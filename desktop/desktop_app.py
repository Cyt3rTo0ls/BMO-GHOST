#!/usr/bin/env python3
"""
HackerBrain OS - desktop_app.py

Native desktop window for HackerBrain OS. Starts the local FastAPI server
(if not already running), waits for it to be ready and opens the UI in a
pywebview window. Closing the window shuts the server down again.

Requires pywebview (installed automatically by run.sh).

WARNING: This tool is intended for authorized security testing only.
"""

from __future__ import annotations

import argparse
import os
import socket
import subprocess
import sys
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PYTHON = sys.executable

APP_URL = "http://127.0.0.1"


def _port_free(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.4)
        return s.connect_ex(("127.0.0.1", port)) != 0


def _server_up(port: int) -> bool:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.5)
            s.connect(("127.0.0.1", port))
        return True
    except Exception:
        return False


def _start_server(port: int) -> "subprocess.Popen | None":
    """Start uvicorn in a subprocess; returns the process or None if already up."""
    if _server_up(port):
        return None
    proc = subprocess.Popen(
        [PYTHON, "-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", str(port)],
        cwd=BASE_DIR,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )
    # wait up to 30s for the server to accept connections
    for _ in range(60):
        if _server_up(port):
            return proc
        time.sleep(0.5)
    proc.kill()
    raise RuntimeError("Server did not start within 30s.")


def main() -> int:
    parser = argparse.ArgumentParser(description="HackerBrain OS desktop app")
    parser.add_argument("--port", type=int, default=8080, help="server port (default 8080)")
    parser.add_argument("--debug", action="store_true", help="enable webview devtools")
    args = parser.parse_args()

    proc = None
    try:
        proc = _start_server(args.port)
    except RuntimeError as exc:
        print("[ERROR] %s" % exc, file=sys.stderr)
        return 1

    url = "%s:%d" % (APP_URL, args.port)

    # Import pywebview lazily so the CLI still works without a display.
    import webview  # type: ignore

    window = webview.create_window(
        "HackerBrain OS - Local Pentesting Assistant",
        url,
        width=1280,
        height=820,
        min_size=(980, 640),
        background_color="#0b0f14",
    )
    webview.start(debug=args.debug)

    # Window closed: stop the server we started (leave a pre-existing one).
    if proc is not None:
        try:
            proc.terminate()
            proc.wait(timeout=5)
        except Exception:
            try:
                proc.kill()
            except Exception:
                pass
    return 0


if __name__ == "__main__":
    sys.exit(main())
