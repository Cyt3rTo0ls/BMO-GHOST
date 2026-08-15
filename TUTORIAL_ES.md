# HackerBrain OS - Tutorial de instalacion y uso (Espanol)

Esta guia explica como instalar HackerBrain OS, conectar el assistant engine
local y usar las funciones principales.

> ADVERTENCIA: Esta herramienta es solo para pruebas de seguridad autorizadas.
> El acceso no autorizado a sistemas informaticos es ilegal. El autor no se
> hace responsable del mal uso de este software.

> IMPORTANTE: HackerBrain OS es una aplicacion LOCAL. Todo se ejecuta en esta
> maquina y consume bastantes recursos de CPU/RAM/disco, especialmente mientras
> el modelo del assistant engine esta cargado y durante la inferencia. Planifica
> tu hardware en consecuencia.

---

## Contenido

1. [Requisitos](#1-requisitos)
2. [Instalacion](#2-instalacion)
3. [Arrancar la aplicacion](#3-arrancar-la-aplicacion)
4. [Configurar el assistant engine local](#4-configurar-el-assistant-engine-local)
5. [Recorrido por la interfaz](#5-recorrido-por-la-interfaz)
6. [Usar la terminal](#6-usar-la-terminal)
7. [Ayudantes de escaneo](#7-ayudantes-de-escaneo)
8. [Memoria, linea de tiempo e informes](#8-memoria-linea-de-tiempo-e-informes)
9. [Activacion PRO](#9-activacion-pro)
10. [Solucion de problemas](#10-solucion-de-problemas)

---

## 1. Requisitos

- Kali Linux 2024.1+ (o cualquier distribucion Linux con el set de herramientas
  de seguridad)
- Python 3.10 o superior
- Las herramientas que vayas a usar deben estar en el `PATH` (nmap, nuclei, etc.)
- Suficiente RAM/disco libre para el modelo del assistant engine que quieras cargar
- Internet solo para el `pip install` inicial; la aplicacion en si funciona offline

Nota de hardware: el motor conversacional necesita una maquina que pueda
ejecutar un modelo local (CPU/GPU capaz y suficiente RAM). La maquina del
autor no lo ejecuta; este proyecto apunta a usuarios cuyo hardware si puede.
El resto de funciones (herramientas, memoria, vault, informes) corren en
cualquier equipo Kali/Parrot aunque no haya engine.

Comprueba tu version de Python:

```bash
python3 --version
```

## 2. Instalacion

```bash
git clone https://github.com/Cyt3rTo0ls/hackerbrain-os.git
cd hackerbrain-os
./install.sh
```

Lo que hace `install.sh`:

1. Verifica que Python 3.10+ esta instalado (con un mensaje claro si no).
2. Crea un entorno virtual de Python (`.venv`).
3. Instala todas las dependencias desde `requirements.txt`.
4. Crea la estructura de carpetas (`data/`, `ui/assets/`, `reports/`, ...).
5. Inicializa la base de datos SQLite local (`data/memory.db`).
6. Ajusta los permisos de archivos.
7. Comprueba si hay un assistant engine local en los puertos 8080, 8010 y 8011.

Instalacion manual alternativa:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 3. Arrancar la aplicacion

```bash
source .venv/bin/activate
uvicorn app:app --host 127.0.0.1 --port 8000
```

Abre el navegador en `http://127.0.0.1:8000`.

La barra de estado superior muestra:

- el nombre del proyecto actual
- el temporizador de sesion
- la version (v1.0.0 LOCAL)
- el estado del assistant engine (`engine: online` / `engine: offline (local)`)
- tu nivel de licencia (FREE / PRO)

## 4. Configurar el assistant engine local

El assistant engine es un servidor de API de chat-completions que se ejecuta en
tu maquina. HackerBrain OS prueba estos endpoints en orden:

1. `http://127.0.0.1:8080` (por defecto, desde `data/config.yaml`)
2. `http://127.0.0.1:8010`
3. `http://127.0.0.1:8011`
4. `http://127.0.0.1:11434`

Para cambiar el endpoint, edita `data/config.yaml`:

```yaml
engine:
  url: "http://127.0.0.1:8080"
  fallback_ports: [8010, 8011, 11434]
```

Tambien puedes forzar la URL con la variable de entorno `HB_ENGINE_URL`.

Si no hay ningun engine accesible, HackerBrain OS sigue funcionando: las
herramientas, la memoria, el vault y los informes no dependen de el. Solo se
desactiva el analisis conversacional (preguntas y decisiones autonomas) hasta
que haya un engine disponible.

## 5. Recorrido por la interfaz

La interfaz tiene cuatro zonas:

- **Barra de estado** (arriba): proyecto, temporizador, version, estado del
  engine, licencia.
- **Panel lateral** (izquierda): navegacion entre TERMINAL, VULNERABILITIES,
  VAULT, REPORTS y MEMORY.
- **Panel principal** (centro): la vista activa.
- **Panel de linea de tiempo** (derecha): cada evento significativo con
  marca de tiempo.

El selector de idioma (EN/ES) esta en la barra de estado. La eleccion se
recuerda en tu navegador.

## 6. Usar la terminal

El prompt (`>`) acepta tanto comandos como preguntas en lenguaje natural.

Comandos:

```bash
> whoami
> nmap -sV -T4 192.168.1.0/24
> searchsploit --list
> target 10.10.10.1
> status
```

- `target <host>` fija el objetivo de trabajo (visible en el contexto del
  assistant engine).
- Cualquier herramienta que este en tu `PATH` se puede ejecutar directamente.
  La salida se recorta para la pantalla pero se captura completa para la sesion.
- Los comandos destructivos de alto riesgo (por ejemplo `rm -rf /`) estan
  bloqueados por un filtro de seguridad.

Preguntas (en ingles o espanol):

```text
> what is the best way to enumerate ports on a Windows host?
> que herramienta usarias para enumerar subdominios y por que?
```

El assistant engine analiza la salida anterior y responde, o propone el
siguiente paso. Si propone un comando, revisalo y ejecutalo manualmente.
El agente autonomo siempre pregunta antes de ejecutar algo de alto riesgo.

## 7. Ayudantes de escaneo

En lugar de escribir comandos crudos, puedes usar los ayudantes integrados:

```bash
> scan 10.10.10.0/24            # escaneo de puertos con nmap (puertos 1-1000 por defecto)
> scan 10.10.10.1 1-65535       # con rango de puertos explicito
> vulnscan https://target.com   # escaneo de vulnerabilidades con nuclei
> recon target.com              # reconocimiento rapido: puertos + vuln scan si hay web
```

## 8. Memoria, linea de tiempo e informes

- **Memoria**: hosts, credenciales (cifradas), vulnerabilidades y notas se
  guardan localmente en `data/memory.db`. La version gratuita guarda hasta 50
  entradas y las borra al terminar la sesion; PRO las conserva entre sesiones.
- **Linea de tiempo**: cada escaneo, chat y evento se registra con marca de
  tiempo UTC. PRO puede exportarla con marcas forenses.
- **Informes**: PRO genera informes Executive, Technical, PCI-DSS y HIPAA en
  PDF, DOCX, HTML o Markdown. Se escriben en `reports/`.

## 9. Activacion PRO

1. Envia **35 USDT** (pago unico, permanente) a la wallet TON:
   `UQCznm2Z1o56J51EfNSnO922mzOQRhOF3m_o5T9Qx8WhK4w9`
2. Contacta con **@Cyt3rTo0ls** por Telegram.
3. Envia una captura del pago.
4. Recibe una key de activacion de 6 digitos.
5. Introducela en el modal de activacion PRO (boton de la barra superior).

PRO desbloquea: uso ilimitado del assistant engine, vault cifrado, generacion
de informes, memoria persistente, proyectos ilimitados, plugins, webhooks,
snapshots, escaneo de IoT/servicios expuestos y mas.

## 10. Solucion de problemas

| Sintoma | Causa / solucion |
| --- | --- |
| `engine: offline (local)` | No hay engine en los puertos probados. Arranca tu servidor de API de chat-completions local o apunta `engine.url` a el. |
| `Error: Python 3.10+ is required` | Tu Python del sistema es antiguo. Instala una version mas nueva y vuelve a ejecutar `./install.sh`. |
| Fallo al instalar con `pip` | Comprueba la conexion a internet; luego `source .venv/bin/activate && pip install -r requirements.txt`. |
| `tool 'X' is not installed` | La herramienta no esta en el `PATH`. Instalala (ej. `sudo apt install X`) y refresca la lista de herramientas. |
| Los informes requieren PRO | Informes, vault y memoria persistente son funciones PRO. Activa PRO. |
| Alto consumo de CPU/RAM | Es lo esperado. El engine corre localmente y consume bastantes recursos mientras hay un modelo cargado. |

---

Version en ingles: [TUTORIAL.md](TUTORIAL.md)
