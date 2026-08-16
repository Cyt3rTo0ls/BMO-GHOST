# HackerBrain OS — Desktop App (programa nativo)

La versión desktop es un **programa de escritorio real** (no una web en una
ventana): interfaz nativa con tkinter (incluido en Python, **cero
dependencias extra**), que usa el agente directamente en proceso — **sin
servidor web, sin webview, sin WebKit y sin navegador**. Funciona en
cualquier Linux con Python 3.10+.

Incluye:
- **Terminal integrado** (comandos y preguntas, EN/ES) conectado al agente
- **Barra de estado**: engine, licencia PRO, número de herramientas
- **Paneles laterales**: vulnerabilidades, memoria y línea de tiempo
- **Activación PRO** con modal (licencia persistente)
- **Selector de idioma** EN/ES en la barra superior
- Instalación automática con **barra de progreso** y **desinstalador**

## Requisitos

- Python 3.10+ (se detecta y crea el venv automáticamente)
- No necesita WebKit/GTK/pywebview (a diferencia de la versión anterior)

## Instalación y arranque

```bash
cd hackerbrain-os
./desktop/run.sh            # instala (barra de progreso) y abre la app nativa
```

`run.sh` hace todo solo:
1. Ejecuta `desktop/installer.py` — ventana con **barra de progreso real**
   (Python check → venv → dependencias → carpetas de datos)
2. Abre la **app nativa** (`desktop/native_app.py`) en una ventana propia

Al cerrar la ventana, el programa termina (no queda ningún servidor).

## Desinstalar

```bash
./desktop/run.sh --uninstall    # o -u
```

Elimina el venv, los paquetes y los marcadores de instalación.
**Tus datos se conservan** (`data/`, `reports/`, `exports/`, keys y la
licencia PRO incluida): al reinstalar, la app vuelve con tu licencia activa.

## Uso manual

```bash
./desktop/run.sh --install      # forzar reinstalación (barra de progreso)
./desktop/run.sh --lang es      # abrir la app en español
./desktop/run.sh --web          # alternativa: interfaz web en el navegador
python3 desktop/native_app.py --lang en   # abrir la app directamente
```

## Descargar desde la web

El instalador se descarga como script único desde el sitio oficial
(GitHub Pages): botón **⬇ DOWNLOAD DESKTOP** en
`https://cyt3rto0ls.github.io/hackerbrain-os/`:

```bash
chmod +x hackerbrain-os-run.sh
./hackerbrain-os-run.sh               # clona + instala todo + abre la app
./hackerbrain-os-run.sh --uninstall   # desinstala (conserva tus datos)
```

## Estructura

```
desktop/
├── run.sh            # lanzador + instalador + desinstalador
├── installer.py      # instalador con barra de progreso (tkinter)
├── native_app.py     # APP NATIVA (tkinter, agente en proceso, sin servidor)
├── desktop_app.py    # (legacy) ventana webview - ya no se usa por defecto
└── README.md         # este archivo
```

WARNING: Herramienta para pruebas de seguridad autorizadas únicamente.
