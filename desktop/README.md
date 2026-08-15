# HackerBrain OS — Desktop App

La versión desktop envuelve la aplicación web local en una ventana nativa
(Linux GTK / WebKit2, macOS Cocoa/WebKit, Windows Edge WebView2) usando
`pywebview`. No necesita navegador: instala automáticamente las
dependencias, arranca el servidor local y muestra la interfaz en una
ventana propia.

## Requisitos

- Python 3.10+ (se detecta y se crea el venv automáticamente)
- Linux: `python3-gi`, `gir1.2-webkit2-4.1` (GTK + WebKit2)
  ```bash
  sudo apt install python3-gi gir1.2-webkit2-4.1
  ```

## Instalación y arranque automático

```bash
cd hackerbrain-os
./desktop/run.sh            # instala lo necesario y abre la app desktop
```

`run.sh` hace todo solo:
1. Crea el entorno virtual (`.venv`) si no existe
2. Instala `requirements.txt` + `pywebview`
3. Arranca el servidor FastAPI en `127.0.0.1:8080`
4. Abre la interfaz en una ventana nativa (1200×800, título y modo app)

Al cerrar la ventana, el servidor se detiene solo.

## Uso manual

```bash
./desktop/run.sh --debug     # ventana con menú de desarrollador
./desktop/run.sh --port 9000 # servidor en otro puerto
```

## Estructura

```
desktop/
├── run.sh            # instalador + lanzador automático
├── desktop_app.py    # ventana nativa (pywebview) + gestión del servidor
└── README.md         # este archivo
```

WARNING: Herramienta para pruebas de seguridad autorizadas únicamente.
