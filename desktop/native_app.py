#!/usr/bin/env python3
"""
HackerBrain OS - desktop/native_app.py

Native desktop application (real program, no browser, no webview, no web
server). Uses the Agent directly in-process with tkinter (ships with
Python - zero extra dependencies). Features:

  * integrated terminal (commands + questions, EN/ES)
  * status bar (engine, PRO, quota, tools)
  * side panels: vulnerabilities, memory, timeline
  * PRO activation modal (persistent license)
  * language toggle EN/ES

WARNING: This tool is intended for authorized security testing only.
"""

from __future__ import annotations

import os
import sys
import threading
import time
import tkinter as tk
from tkinter import font as tkfont
from tkinter import ttk

# Make the repo root importable when running from desktop/.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# --------------------------------------------------------------------------- #
# i18n
# --------------------------------------------------------------------------- #
I18N = {
    "en": {
        "title": "HackerBrain OS - Local Pentesting Assistant",
        "terminal": "TERMINAL",
        "prompt": ">",
        "vulns": "VULNERABILITIES",
        "memory": "MEMORY",
        "timeline": "TIMELINE",
        "no_vulns": "No findings yet. Run a scan or ask the agent.",
        "no_memory": "No memory entries yet.",
        "no_timeline": "No events yet.",
        "engine_online": "engine: online",
        "engine_offline": "engine: offline (local)",
        "free": "FREE",
        "pro": "PRO",
        "activate": "ACTIVATE PRO",
        "pro_title": "PRO ACTIVATION",
        "pro_key_ph": "6-digit key",
        "pro_activate": "ACTIVATE",
        "pro_close": "CLOSE",
        "pro_ok": "PRO activated. Welcome.",
        "pro_bad": "Invalid key.",
        "pro_price": "Price: 20 USDT one-time, permanent.\nWallet (TON): UQCznm2Z1o56J51EfNSnO922mzOQRhOF3m_o5T9Qx8WhK4w9\nContact @Cyt3rTo0ls on Telegram.",
        "lang": "ES",
        "quit": "EXIT",
        "banner": "HACKERBRAIN OS - LOCAL PENTESTING COMMAND CENTER\nType a command or question. 'help' for the command list.\n",
    },
    "es": {
        "title": "HackerBrain OS - Asistente Local de Pentesting",
        "terminal": "TERMINAL",
        "prompt": ">",
        "vulns": "VULNERABILIDADES",
        "memory": "MEMORIA",
        "timeline": "LINEA DE TIEMPO",
        "no_vulns": "Aun sin hallazgos. Ejecuta un escaneo o pregunta al agente.",
        "no_memory": "Aun sin entradas de memoria.",
        "no_timeline": "Aun sin eventos.",
        "engine_online": "engine: en linea",
        "engine_offline": "engine: offline (local)",
        "free": "FREE",
        "pro": "PRO",
        "activate": "ACTIVAR PRO",
        "pro_title": "ACTIVACION PRO",
        "pro_key_ph": "clave de 6 digitos",
        "pro_activate": "ACTIVAR",
        "pro_close": "CERRAR",
        "pro_ok": "PRO activado. Bienvenido.",
        "pro_bad": "Clave invalida.",
        "pro_price": "Precio: 20 USDT pago unico, permanente.\nWallet (TON): UQCznm2Z1o56J51EfNSnO922mzOQRhOF3m_o5T9Qx8WhK4w9\nContacta a @Cyt3rTo0ls por Telegram.",
        "lang": "EN",
        "quit": "SALIR",
        "banner": "HACKERBRAIN OS - CENTRO DE MANDO LOCAL DE PENTESTING\nEscribe un comando o pregunta. 'help' para la lista de comandos.\n",
    },
}


class NativeApp:
    """Tkinter desktop app around the Agent (no web server)."""

    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.lang = "en"
        # Import lazily so CLI flags (--lang) still work before heavy imports.
        from core.agent import Agent
        from core.licensing import license_manager
        from core.memory import memory

        self.agent = Agent()
        self.license = license_manager
        self.memory = memory
        self.pro = False
        self._build_ui()
        self._apply_lang()
        self._refresh_status()
        self._refresh_panels()
        self.root.after(100, self._load_license)

    # ------------------------------------------------------------------ #
    # UI construction
    # ------------------------------------------------------------------ #
    def _build_ui(self) -> None:
        self.root.title(I18N["en"]["title"])
        self.root.geometry("1280x800")
        self.root.minsize(980, 620)
        self.root.configure(bg="#0b0f14")
        try:
            self.root.iconphoto(True, tk.PhotoImage(width=1, height=1))
        except Exception:
            pass

        # Fonts
        mono = tkfont.Font(family="Courier", size=11)
        mono_bold = tkfont.Font(family="Courier", size=11, weight="bold")
        small = tkfont.Font(family="Segoe UI", size=9)
        title_f = tkfont.Font(family="Segoe UI", size=12, weight="bold")

        # ---- status bar (top) ---------------------------------------- #
        status = tk.Frame(self.root, bg="#0e1626", height=44)
        status.pack(fill="x", side="top")
        status.pack_propagate(False)
        self.lbl_brand = tk.Label(status, text="HACKERBRAIN OS", fg="#00e5c7", bg="#0e1626", font=title_f)
        self.lbl_brand.pack(side="left", padx=12)
        self.lbl_engine = tk.Label(status, text="engine: ...", fg="#8ea0bd", bg="#0e1626", font=small)
        self.lbl_engine.pack(side="left", padx=10)
        self.lbl_pro = tk.Label(status, text="FREE", fg="#8ea0bd", bg="#0e1626", font=small)
        self.lbl_pro.pack(side="left", padx=10)
        self.lbl_tools = tk.Label(status, text="", fg="#5a6a85", bg="#0e1626", font=small)
        self.lbl_tools.pack(side="left", padx=10)

        self.btn_lang = tk.Button(status, text="ES", command=self._toggle_lang, bg="#0e1626", fg="#c8d6e5",
                                  relief="flat", font=small, padx=8, cursor="hand2")
        self.btn_lang.pack(side="right", padx=6, pady=8)
        self.btn_quit = tk.Button(status, text="EXIT", command=self.root.destroy, bg="#0e1626", fg="#ff5d6c",
                                  relief="flat", font=small, padx=8, cursor="hand2")
        self.btn_quit.pack(side="right", padx=6, pady=8)
        self.btn_pro = tk.Button(status, text="ACTIVATE PRO", command=self._open_pro_modal, bg="#00e5c7",
                                 fg="#04211c", relief="flat", font=small, padx=10, cursor="hand2")
        self.btn_pro.pack(side="right", padx=6, pady=8)

        # ---- main split: terminal | side panels ---------------------- #
        main = tk.Frame(self.root, bg="#0b0f14")
        main.pack(fill="both", expand=True, padx=10, pady=10)

        # left: terminal
        term_frame = tk.Frame(main, bg="#0b0f14")
        term_frame.pack(side="left", fill="both", expand=True)

        term_bar = tk.Frame(term_frame, bg="#0e1626", height=30)
        term_bar.pack(fill="x", side="top")
        term_bar.pack_propagate(False)
        for color in ("#ff5f56", "#ffbd2e", "#27c93f"):
            tk.Label(term_bar, text="  ", bg=color, padx=4).pack(side="left", padx=(6, 0), pady=8)
        self.lbl_term = tk.Label(term_bar, text="TERMINAL", fg="#5a6a85", bg="#0e1626", font=small)
        self.lbl_term.pack(side="left", padx=10)

        self.out = tk.Text(term_frame, bg="#070b12", fg="#c8d6e5", insertbackground="#00e5c7",
                           font=mono, relief="flat", wrap="word", state="disabled",
                           padx=14, pady=10)
        self.out.pack(fill="both", expand=True)
        self.out.tag_configure("prompt", foreground="#00e5c7", font=mono_bold)
        self.out.tag_configure("ok", foreground="#00ff66")
        self.out.tag_configure("err", foreground="#ff5d6c")
        self.out.tag_configure("info", foreground="#8ea0bd")
        self.out.tag_configure("verbose", foreground="#5a6a85")
        self.out.tag_configure("warn", foreground="#ffbd2e")

        input_row = tk.Frame(term_frame, bg="#0b0f14")
        input_row.pack(fill="x", side="bottom", pady=(8, 0))
        self.lbl_prompt = tk.Label(input_row, text=">", fg="#00e5c7", bg="#0b0f14", font=mono_bold)
        self.lbl_prompt.pack(side="left")
        self.entry = tk.Entry(input_row, bg="#0e1626", fg="#e6edf7", insertbackground="#00e5c7",
                              relief="flat", font=mono)
        self.entry.pack(side="left", fill="x", expand=True, ipady=6, padx=(8, 0))
        self.entry.bind("<Return>", self._on_enter)

        # right: side panels (notebook)
        side = tk.Frame(main, bg="#0b0f14", width=330)
        side.pack(side="right", fill="y", padx=(10, 0))
        side.pack_propagate(False)

        nb = ttk.Notebook(side)
        nb.pack(fill="both", expand=True)
        style = ttk.Style()
        try:
            style.theme_use("clam")
            style.configure("TNotebook", background="#0b0f14", borderwidth=0)
            style.configure("TNotebook.Tab", background="#0e1626", foreground="#8ea0bd",
                            padding=(12, 6), font=small)
            style.map("TNotebook.Tab", background=[("selected", "#111c30")],
                      foreground=[("selected", "#00e5c7")])
        except Exception:
            pass

        self.txt_vulns = tk.Text(nb, bg="#0b0f14", fg="#c8d6e5", font=mono, relief="flat",
                                 wrap="word", state="disabled", padx=10, pady=8)
        nb.add(self.txt_vulns, text="VULNERABILITIES")

        self.txt_memory = tk.Text(nb, bg="#0b0f14", fg="#c8d6e5", font=mono, relief="flat",
                                  wrap="word", state="disabled", padx=10, pady=8)
        nb.add(self.txt_memory, text="MEMORY")

        self.txt_timeline = tk.Text(nb, bg="#0b0f14", fg="#c8d6e5", font=mono, relief="flat",
                                    wrap="word", state="disabled", padx=10, pady=8)
        nb.add(self.txt_timeline, text="TIMELINE")

        self.nb = nb
        self._print_banner()

    # ------------------------------------------------------------------ #
    # Output helpers
    # ------------------------------------------------------------------ #
    def _print_banner(self) -> None:
        self._emit(self.t("banner"), "info")

    def _emit(self, text: str, tag: str = "info") -> None:
        self.out.config(state="normal")
        self.out.insert("end", text + "\n", tag)
        self.out.see("end")
        self.out.config(state="disabled")

    def _print(self, text: str, tag: str = "info") -> None:
        for line in (text or "").splitlines():
            self._emit(line, tag)

    def t(self, key: str) -> str:
        return I18N[self.lang].get(key, I18N["en"].get(key, key))

    # ------------------------------------------------------------------ #
    # Input handling (runs the agent in a worker thread)
    # ------------------------------------------------------------------ #
    def _on_enter(self, _event=None) -> None:
        raw = self.entry.get().strip()
        if not raw:
            return
        self.entry.delete(0, "end")
        self._emit(self.t("prompt") + " " + raw, "prompt")
        threading.Thread(target=self._run_agent, args=(raw,), daemon=True).start()

    def _run_agent(self, raw: str) -> None:
        try:
            result = self.agent.handle(raw)
        except Exception as exc:
            self.root.after(0, lambda: self._print("[error] %s" % exc, "err"))
            return
        out = result.get("output") or result.get("error") or ""
        tag = "ok" if result.get("ok") else "err"
        if result.get("needs_confirmation"):
            tag = "warn"
        self.root.after(0, lambda: self._print(out, tag))
        for line in result.get("verbose", []) or []:
            self.root.after(0, lambda l=line: self._emit(l, "verbose"))
        self.root.after(0, self._refresh_status)
        self.root.after(0, self._refresh_panels)

    # ------------------------------------------------------------------ #
    # Status + panels
    # ------------------------------------------------------------------ #
    def _load_license(self) -> None:
        try:
            self.pro = bool(self.license.is_pro())
        except Exception:
            self.pro = False
        self._refresh_status()

    def _refresh_status(self) -> None:
        try:
            engine = self.agent.assistant.is_available()
        except Exception:
            engine = False
        self.lbl_engine.config(
            text=self.t("engine_online") if engine else self.t("engine_offline"),
            fg="#00ff66" if engine else "#ff5d6c",
        )
        self.lbl_pro.config(text=self.t("pro") if self.pro else self.t("free"),
                            fg="#00e5c7" if self.pro else "#8ea0bd")
        self.btn_pro.config(text=self.t("pro") if self.pro else self.t("activate"),
                            bg="#111c30" if self.pro else "#00e5c7",
                            fg="#8ea0bd" if self.pro else "#04211c")
        try:
            tools = len(self.agent.executor.tool_names())
            self.lbl_tools.config(text="%d tools" % tools)
        except Exception:
            pass

    def _refresh_panels(self) -> None:
        # vulnerabilities
        try:
            vulns = self.memory.list_vulnerabilities()
            lines = [self.t("vulns")]
            if not vulns:
                lines.append("  " + self.t("no_vulns"))
            for v in vulns[-12:]:
                sev = str(v.get("severity") or "?").upper()
                lines.append("  [%s] %s:%s  %s" % (sev, v.get("host") or "?", v.get("port") or "?",
                                                   (v.get("description") or v.get("template") or "")[:40]))
            self._set_text(self.txt_vulns, "\n".join(lines))
        except Exception:
            pass
        # memory
        try:
            hosts = self.memory.list_hosts()
            creds = self.memory.list_credentials()
            lines = [self.t("memory")]
            lines.append("  hosts: %d" % len(hosts))
            for h in hosts[-8:]:
                lines.append("    %s %s" % (h.get("ip", "?"), h.get("hostname") or ""))
            lines.append("  credentials: %d" % len(creds))
            self._set_text(self.txt_memory, "\n".join(lines))
        except Exception:
            self._set_text(self.txt_memory, self.t("no_memory"))
        # timeline
        try:
            from core.timeline import timeline

            events = timeline.events(limit=30)
            lines = [self.t("timeline")]
            if not events:
                lines.append("  " + self.t("no_timeline"))
            for e in events:
                lines.append("  %s %s %s" % (e.get("ts", "")[11:19] if e.get("ts") else "",
                                             e.get("kind", "")[:12], (e.get("detail") or "")[:50]))
            self._set_text(self.txt_timeline, "\n".join(lines))
        except Exception:
            pass

    @staticmethod
    def _set_text(widget: tk.Text, text: str) -> None:
        widget.config(state="normal")
        widget.delete("1.0", "end")
        widget.insert("1.0", text)
        widget.config(state="disabled")

    # ------------------------------------------------------------------ #
    # PRO activation modal
    # ------------------------------------------------------------------ #
    def _open_pro_modal(self) -> None:
        if self.pro:
            return
        modal = tk.Toplevel(self.root)
        modal.title(self.t("pro_title"))
        modal.configure(bg="#0b0f14")
        modal.geometry("460x300")
        modal.resizable(False, False)
        modal.transient(self.root)

        tk.Label(modal, text=self.t("pro_title"), fg="#00e5c7", bg="#0b0f14",
                 font=("Segoe UI", 13, "bold")).pack(pady=(18, 6))
        tk.Label(modal, text=self.t("pro_price"), fg="#8ea0bd", bg="#0b0f14",
                 font=("Segoe UI", 9), justify="left").pack(pady=4, padx=24)

        key_entry = tk.Entry(modal, bg="#0e1626", fg="#e6edf7", insertbackground="#00e5c7",
                             relief="flat", font=("Courier", 12), justify="center")
        key_entry.pack(pady=12, ipady=6, ipadx=40)

        def do_activate() -> None:
            key = key_entry.get().strip()
            if not key:
                return
            try:
                res = self.license.activate(key)
            except Exception as exc:
                res = {"ok": False, "error": str(exc)}
            if res.get("ok"):
                self.pro = True
                self._refresh_status()
                tk.Label(modal, text=self.t("pro_ok"), fg="#00ff66", bg="#0b0f14").pack(pady=6)
                modal.after(900, modal.destroy)
            else:
                tk.Label(modal, text=self.t("pro_bad"), fg="#ff5d6c", bg="#0b0f14").pack(pady=6)

        btns = tk.Frame(modal, bg="#0b0f14")
        btns.pack(pady=10)
        tk.Button(btns, text=self.t("pro_activate"), command=do_activate, bg="#00e5c7", fg="#04211c",
                  relief="flat", padx=16, pady=6, cursor="hand2").pack(side="left", padx=6)
        tk.Button(btns, text=self.t("pro_close"), command=modal.destroy, bg="#111c30", fg="#8ea0bd",
                  relief="flat", padx=16, pady=6, cursor="hand2").pack(side="left", padx=6)

    # ------------------------------------------------------------------ #
    # Language
    # ------------------------------------------------------------------ #
    def _toggle_lang(self) -> None:
        self.lang = "es" if self.lang == "en" else "en"
        self._apply_lang()

    def _apply_lang(self) -> None:
        self.root.title(self.t("title"))
        self.lbl_term.config(text=self.t("terminal"))
        self.lbl_prompt.config(text=self.t("prompt"))
        self.btn_quit.config(text=self.t("quit"))
        self.btn_lang.config(text=self.t("lang"))
        try:
            self.nb.tab(0, text=self.t("vulns"))
            self.nb.tab(1, text=self.t("memory"))
            self.nb.tab(2, text=self.t("timeline"))
        except Exception:
            pass
        self._refresh_status()
        self._refresh_panels()


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(description="HackerBrain OS native desktop app")
    parser.add_argument("--lang", choices=["en", "es"], default="en")
    args = parser.parse_args()

    root = tk.Tk()
    app = NativeApp(root)
    app.lang = args.lang
    app._apply_lang()
    root.mainloop()
    return 0


if __name__ == "__main__":
    sys.exit(main())
