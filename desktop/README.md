# HackerBrain OS — Desktop App

La versión desktop abre la **interfaz web COMPLETA** (la misma bonita y
funcional de `http://127.0.0.1:8080`: mapa IoT, grafo OSINT, terminal,
paneles...) en una **ventana nativa de escritorio** con pywebview —
sin necesidad de abrir el navegador.

La instalación es automática y, si falta, **instala también WebKit2 GTK**
(la librería del sistema que necesita la ventana nativa) con sudo, para que
el desktop funcione en cualquier máquina sin errores de "WebKit missing".

## Requisitos

- Python 3.10+ (se detecta y crea el venv automáticamente)
- En la primera ejecución puede pedir la contraseña sudo una vez, para
  instalar `python3-gi gir1.2-webkit2-4.1` si no están presentes

## Instalación y arranque

```bash
cd hackerbrain-os
./desktop/run.sh            # instala (barra de progreso) y abre la ventana nativa con la UI completa
```

`run.sh` hace todo solo:
1. Ejecuta `desktop/installer.py` — ventana con **barra de progreso real**
   (Python check → venv → dependencias → pywebview + PyGObject →
   WebKit2 GTK del sistema → carpetas de datos)
2. Abre la **interfaz completa** en la ventana nativa (`desktop_app.py`)

Al cerrar la ventana, el servidor local se detiene solo.

## Modos alternativos

```bash
./desktop/run.sh --lite     # app ligera (tkinter, agente en proceso, sin servidor)
./desktop/run.sh --web      # interfaz web en el navegador
./desktop/run.sh --lang es  # pista de idioma
./desktop/run.sh --port 9000
```

Si WebKit2 no está disponible y no se pudo instalar, `run.sh` cae a la app
ligera (`--lite`) en vez de abrir el navegador.

## Desinstalar

```bash
./desktop/run.sh --uninstall    # o -u
```

Elimina el venv, los paquetes y los marcadores de instalación.
**Tus datos se conservan** (`data/`, `reports/`, `exports/`, keys y la
licencia PRO incluida): al reinstalar, la app vuelve con tu licencia activa.

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
├── installer.py      # instalador con barra de progreso (tkinter) + WebKit2 auto
├── desktop_app.py    # ventana nativa con la UI COMPLETA (pywebview)
├── native_app.py     # app ligera tkinter (fallback --lite)
└── README.md         # este archivo
```

WARNING: Herramienta para pruebas de seguridad autorizadas únicamente.
