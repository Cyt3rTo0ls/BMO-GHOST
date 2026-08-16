#!/usr/bin/env python3
"""
HackerBrain OS - desktop/installer.py

Native installer window with a real progress bar. Runs the setup steps
(venv, pip dependencies, pywebview, data folders) and shows live progress.
Uses tkinter only (ships with Python), so the installer works even before
any dependency is installed.

Usage:
  python3 desktop/installer.py            # install with progress window
  python3 desktop/installer.py --no-ui    # install silently (no window)

WARNING: This tool is intended for authorized security testing only.
"""

from __future__ import annotations

import os
import subprocess
import sys
import threading

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VENV_DIR = os.path.join(BASE_DIR, ".venv")
READY_MARK = os.path.join(VENV_DIR, ".desktop_ready")

STEPS = [
    ("Checking Python 3.10+", 0.05),
    ("Creating virtual environment", 0.20),
    ("Installing dependencies (requirements.txt)", 0.55),
    ("Installing pywebview (native window)", 0.80),
    ("Creating data / plugins / reports folders", 0.92),
    ("Finalizing installation", 1.00),
]


class Installer:
    """Runs the setup steps; used by both the CLI and the GUI."""

    def __init__(self, on_progress=None, on_log=None) -> None:
        self.on_progress = on_progress or (lambda pct, label: None)
        self.on_log = on_log or (lambda line: None)

    def _log(self, line: str) -> None:
        self.on_log(line)

    def _report(self, pct: float, label: str) -> None:
        self.on_progress(pct, label)

    def _run(self, cmd, **kw) -> subprocess.CompletedProcess:
        self._log("$ " + " ".join(cmd))
        return subprocess.run(cmd, **kw)

    def install(self) -> bool:
        """Run all steps. Returns True on success."""
        try:
            self._report(0.0, STEPS[0][0])

            # 1. Python check
            py = sys.executable
            ver = sys.version_info
            if ver < (3, 10):
                self._log("[ERROR] Python 3.10+ required (found %d.%d)." % (ver[0], ver[1]))
                self._report(1.0, "Python 3.10+ required - install a newer Python")
                return False
            self._log("Python %d.%d.%d OK" % (ver[0], ver[1], ver[2]))

            # 2. venv
            self._report(*STEPS[1][:2])
            if not os.path.isdir(os.path.join(VENV_DIR, "bin")):
                r = self._run([py, "-m", "venv", VENV_DIR])
                if r.returncode != 0:
                    self._report(1.0, "Failed to create the virtual environment")
                    return False
                self._log("virtualenv created at .venv")
            else:
                self._log("virtualenv already exists (.venv)")

            venv_py = os.path.join(VENV_DIR, "bin", "python")
            if not os.path.exists(venv_py):
                venv_py = py

            # 3. dependencies
            self._report(*STEPS[2][:2])
            if not os.path.exists(READY_MARK):
                r = self._run(
                    [venv_py, "-m", "pip", "install", "--upgrade", "pip", "-q"],
                    stdout=subprocess.DEVNULL,
                )
                if r.returncode != 0:
                    self._log("[WARN] pip upgrade failed; continuing")
                r = self._run(
                    [venv_py, "-m", "pip", "install", "-r",
                     os.path.join(BASE_DIR, "requirements.txt"), "-q"],
                    stdout=subprocess.DEVNULL,
                )
                if r.returncode != 0:
                    self._report(1.0, "pip install failed - check your network")
                    return False
                self._log("requirements.txt installed")
            else:
                self._log("dependencies already installed")

            # 4. pywebview
            self._report(*STEPS[3][:2])
            try:
                import webview  # noqa: F401
                self._log("pywebview already available")
            except Exception:
                r = self._run(
                    [venv_py, "-m", "pip", "install", "pywebview", "-q"],
                    stdout=subprocess.DEVNULL,
                )
                if r.returncode != 0:
                    self._log("[WARN] pywebview install failed (browser fallback will be used)")
                else:
                    self._log("pywebview installed")

            # 5. folders
            self._report(*STEPS[4][:2])
            for folder in ("data", "plugins", "playbooks", "reports", "exports"):
                os.makedirs(os.path.join(BASE_DIR, folder), exist_ok=True)
            self._log("data folders ready")

            # 6. ready marker
            self._report(*STEPS[5][:2])
            try:
                os.makedirs(VENV_DIR, exist_ok=True)
                with open(READY_MARK, "w", encoding="utf-8") as fh:
                    fh.write("installed by installer.py\n")
            except OSError:
                pass
            self._log("installation complete")
            return True
        except Exception as exc:  # pragma: no cover - defensive
            self._log("[ERROR] %s" % exc)
            self._report(1.0, "Installation error: %s" % exc)
            return False


# --------------------------------------------------------------------------- #
# GUI (tkinter) - only used when a display is available and --no-ui is absent
# --------------------------------------------------------------------------- #
def _gui() -> int:
    import tkinter as tk
    from tkinter import ttk

    root = tk.Tk()
    root.title("HackerBrain OS - Installing")
    root.geometry("560x260")
    root.configure(bg="#0b0f14")
    root.resizable(False, False)

    title = tk.Label(
        root, text="HackerBrain OS", fg="#00e5c7", bg="#0b0f14",
        font=("Helvetica", 18, "bold"),
    )
    title.pack(pady=(24, 4))
    sub = tk.Label(
        root, text="Installing everything automatically...",
        fg="#8ea0bd", bg="#0b0f14", font=("Helvetica", 11),
    )
    sub.pack()

    bar = ttk.Progressbar(root, length=480, mode="determinate", maximum=100)
    bar.pack(pady=22)

    status = tk.Label(root, text="Preparing...", fg="#c8d6e5", bg="#0b0f14", font=("Helvetica", 10))
    status.pack()

    logbox = tk.Text(
        root, height=4, bg="#070b12", fg="#7f8ea8", font=("Courier", 9),
        relief="flat", padx=10, pady=6,
    )
    logbox.pack(fill="x", padx=40, pady=(14, 0))

    done = {"value": False}

    def on_progress(pct: float, label: str) -> None:
        def _apply():
            bar["value"] = int(pct * 100)
            status.config(text=label)
        root.after(0, _apply)

    def on_log(line: str) -> None:
        def _apply():
            logbox.insert("end", line + "\n")
            logbox.see("end")
        root.after(0, _apply)

    installer = Installer(on_progress=on_progress, on_log=on_log)

    def worker():
        ok = installer.install()
        done["value"] = True

        def _finish():
            if ok:
                status.config(text="Installation complete. Starting the app...", fg="#00ff66")
                root.after(900, root.destroy)
            else:
                status.config(text="Installation failed - check the log above.", fg="#ff0055")
                root.after(1200, root.destroy)
        root.after(0, _finish)

    threading.Thread(target=worker, daemon=True).start()
    root.mainloop()
    return 0 if done["value"] else 1


def main() -> int:
    if "--no-ui" in sys.argv or not os.environ.get("DISPLAY"):
        inst = Installer(on_log=lambda l: print(l))
        return 0 if inst.install() else 1
    return _gui()


if __name__ == "__main__":
    sys.exit(main())
