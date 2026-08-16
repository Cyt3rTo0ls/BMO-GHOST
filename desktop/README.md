# HackerBrain OS — Desktop App

La versión desktop envuelve la aplicación web local en una ventana nativa
(Linux GTK / WebKit2, macOS Cocoa/WebKit, Windows Edge WebView2) usando
`pywebview`. No necesita navegador: instala automáticamente las
dependencias con una **barra de progreso en vivo**, arranca el servidor
local y muestra la interfaz en una ventana propia.

## Requisitos

- Python 3.10+ (se detecta y se crea el venv automáticamente)
- Linux: `python3-gi`, `gir1.2-webkit2-4.1` (GTK + WebKit2)
  ```bash
  sudo apt install python3-gi gir1.2-webkit2-4.1
  ```

## Instalación y arranque automático

```bash
cd hackerbrain-os
./desktop/run.sh            # instala lo necesario (con barra de progreso) y abre la app desktop
```

`run.sh` hace todo solo:
1. Ejecuta `desktop/installer.py` — una ventana de instalación con
   **barra de progreso real** que muestra cada paso:
   Python check → venv → `requirements.txt` → pywebview → carpetas de datos
2. Arranca el servidor FastAPI en `127.0.0.1:8080`
3. Abre la interfaz en una ventana nativa (1200×800, título y modo app)

Al cerrar la ventana, el servidor se detiene solo.

## Desinstalar

```bash
./desktop/run.sh --uninstall    # o -u
```

Elimina el entorno virtual, los paquetes instalados y los marcadores de
instalación. **Tus datos se conservan** (`data/`, `reports/`, `exports/`,
keys y licencia PRO incluida): al reinstalar, la app vuelve exactamente
como estaba, con la licencia PRO activa.

## Uso manual

```bash
./desktop/run.sh --install      # forzar reinstalación (muestra la barra de progreso)
./desktop/run.sh --debug        # ventana con menú de desarrollador
./desktop/run.sh --port 9000    # servidor en otro puerto
python3 desktop/installer.py    # solo instalación (ventana con progreso)
python3 desktop/installer.py --no-ui   # instalación silenciosa (CLI)
```

## Descargar desde la web

El instalador se puede descargar como script único desde el sitio oficial
(GitHub Pages): botón **⬇ DOWNLOAD DESKTOP** en
`https://cyt3rto0ls.github.io/hackerbrain-os/`:

```bash
chmod +x hackerbrain-os-run.sh
./hackerbrain-os-run.sh               # instala todo y abre la app
./hackerbrain-os-run.sh --uninstall   # desinstala (conserva tus datos)
```

## Estructura

```
desktop/
├── run.sh            # lanzador + instalador + desinstalador
├── installer.py      # instalador con barra de progreso (tkinter)
├── desktop_app.py    # ventana nativa (pywebview) + gestión del servidor
└── README.md         # este archivo
```

WARNING: Herramienta para pruebas de seguridad autorizadas únicamente.
