```
 _   _            _            _                _             ____   _____
| | | | __ _  ___| | _____  __| | ___ _ __   __| | ___ _ __  | __ ) / ____|
| |_| |/ _` |/ __| |/ / _ \/ _` |/ _ \ '_ \ / _` |/ _ \ '__| |  _ \| (___
|  _  | (_| | (__|   <  __/ (_| |  __/ | | | (_| |  __/ |    | |_) |\___ \
|_| |_|\__,_|\___|_|\_\___|\__,_|\___|_| |_|\__,_|\___|_|    |____/|_____/

        CENTRO LOCAL DE PENTESTING
```

Asistente local de pentesting con capacidades de ataque autonomo para pruebas
de seguridad autorizadas. Una interfaz web sobria, de estilo terminal, que
orquesta el set de herramientas estandar de Kali Linux / Parrot OS en tu propia
maquina, respaldada por un assistant engine local que analiza la salida y
propone el siguiente paso.

Autor: **Cyt3rTo0ls** - Licencia: **AGPL-3.0**

---

## IDIOMA DEL README / README LANGUAGE

Este repositorio esta documentado en dos idiomas.
This repository is documented in two languages.

| Espanol | English |
| --- | --- |
| [README (Espanol)](README_ES.md) | [README (English)](README.md) |
| [TUTORIAL (Espanol)](TUTORIAL_ES.md) | [TUTORIAL (English)](TUTORIAL.md) |

---

## IMPORTANTE: APLICACION LOCAL - CONSUMO DE RECURSOS

HackerBrain OS es una aplicacion **100% LOCAL y OFFLINE**. Nada se ejecuta en la
nube y ningun dato sale de tu maquina:

- La interfaz web, el assistant engine y todas las bases de datos (SQLite) se
  ejecutan en tu equipo.
- El assistant engine es un **servidor local de API de chat-completions** (un
  runner de modelos local o un wrapper) accesible en `localhost` (ver
  `data/config.yaml` -> `engine`).
- **Esto consume bastantes recursos del sistema.** Cargar un modelo local y
  ejecutar inferencia usa mucha CPU, RAM y disco. Un modelo pequeno de 3B
  parametros normalmente necesita varios GB de RAM; los modelos grandes mucho
  mas. Las sesiones largas mantienen el modelo caliente en memoria, lo que
  aumenta el uso continuo.
- Planifica tu hardware antes de sesiones largas. Si el engine esta offline, la
  herramienta sigue funcionando (herramientas, memoria, vault, informes) sin
  analisis conversacional.
- Nota de hardware: la maquina del autor NO ejecuta el modelo del assistant
  engine. Este proyecto apunta a usuarios cuyo hardware SI puede ejecutar un
  modelo local (un equipo de escritorio/workstation con CPU/GPU capaz y
  suficiente RAM). El resto de la plataforma corre en cualquier equipo
  Kali/Parrot; solo el engine conversacional necesita el hardware mas potente.

---

## ADVERTENCIA LEGAL

> ADVERTENCIA: Esta herramienta es solo para pruebas de seguridad autorizadas.
> El acceso no autorizado a sistemas informaticos es ilegal. El autor no se
> hace responsable del mal uso de este software.

Eres responsable de tener permiso por escrito para probar cada objetivo que
escanee, enumere o ataque. El escaneo o la explotacion no autorizados son un
delito en la mayoria de las jurisdicciones. Usa esta herramienta exclusivamente
en sistemas que poseas o para los que tengas un contrato explicito de
evaluacion.

---

## CAPTURAS DE PANTALLA

Dashboard principal (vista terminal):

![HackerBrain OS dashboard](images/dashboard.png)

Dashboard en espanol (`#es`):

![HackerBrain OS dashboard ES](images/dashboard_es.png)

Vista de funciones PRO, visible desde la version gratuita (sidebar -> PRO, o
`#pro`):

![HackerBrain OS PRO features](images/pro_features.png)

Vista de funciones PRO en espanol:

![HackerBrain OS PRO features ES](images/pro_features_es.png)

Vista de vulnerabilidades con filtros por severidad:

![HackerBrain OS vulnerabilities](images/vulns.png)

Vista de memoria con estadisticas y entidades guardadas:

![HackerBrain OS memory](images/memory.png)

---

## CARACTERISTICAS

La version gratuita muestra la lista completa de capacidades PRO en la
interfaz (sidebar -> PRO). Los usuarios gratuitos siempre pueden ver que
desbloquea PRO.

### GRATIS (open source)

| Caracteristica | Gratis |
| --- | --- |
| Consultas al assistant engine | 20 por dia |
| Entradas de memoria | 50 (se borran al cerrar sesion) |
| Proyectos activos | 2 |
| Exportacion de informes | No |
| Duracion de sesion | 1 hora |
| Herramientas de reconocimiento | Basico |
| Interfaz oscura profesional | Si |
| Terminal conversacional | Si |
| Linea de tiempo de sesion actual | Si |

### PRO (activacion con key)

| Caracteristica | PRO |
| --- | --- |
| Assistant engine | Ilimitado |
| Agente autonomo (pregunta antes de ejecutar ataques) | Si |
| Vault de credenciales cifrado (AES-256) | Si |
| Informes profesionales (PDF / DOCX / HTML / Markdown) | Si |
| Memoria persistente entre sesiones | Si |
| Proyectos ilimitados | Si |
| Linea de tiempo exportable con marcas forenses | Si |
| Auto-etiquetado por severidad | Si |
| Busqueda semantica en memoria | Si |
| Snapshots de sesion | Si |
| Sugerencias de mitigacion por hallazgo | Si |
| Modo Teacher (explicaciones paso a paso) | Si |
| API REST local para automatizacion | Si |
| Webhooks a Slack / Discord / Telegram | Si |
| Sistema de plugins en Python | Si |
| Scheduler de escaneos automaticos | Si |
| Integracion de PoCs personalizados | Si |
| Gamificacion (logros tecnicos) | Si |
| Colaboracion multiusuario en red local | Si |
| Marketplace de playbooks | Si |
| Todas las herramientas de Kali Linux / Parrot OS | Si |
| Escaneo de IoT / servicios expuestos (MQTT, OPC-UA, Modbus, CoAP, TR-069, RTSP) | Si |

---

## INSTALACION

Requisitos: Python 3.10+ en Kali Linux 2024.1+ (o cualquier Linux con el set
de herramientas de seguridad). ~2 GB de disco libre para dependencias; el
assistant engine anade varios GB segun el modelo.

```bash
git clone https://github.com/Cyt3rTo0ls/hackerbrain-os.git
cd hackerbrain-os
./install.sh
```

`install.sh` verifica Python, crea un virtualenv, instala las dependencias,
crea la estructura de carpetas, inicializa la base de datos SQLite, ajusta los
permisos de archivos y comprueba si hay un assistant engine local.

### Arrancar la aplicacion

```bash
source .venv/bin/activate
uvicorn app:app --host 127.0.0.1 --port 8000
```

Abre `http://127.0.0.1:8000` en tu navegador.

### Configurar el assistant engine local

Edita `data/config.yaml`:

```yaml
engine:
  url: "http://127.0.0.1:8080"     # tu endpoint local de chat-completions
  fallback_ports: [8010, 8011, 11434]
```

HackerBrain OS prueba la URL principal y luego los puertos alternativos. Si no
hay ningun engine accesible, las herramientas, la memoria, el vault y los
informes siguen funcionando; el analisis conversacional se omite. Recuerda: el
engine corre localmente y consume bastante CPU/RAM.

---

## USO

Guia completa paso a paso: [TUTORIAL_ES.md](TUTORIAL_ES.md) (Espanol) y
[TUTORIAL.md](TUTORIAL.md) (English). La interfaz incluye un selector de
idioma (EN/ES) en la barra de estado, un modo verbose que muestra cuanto tarda
el assistant engine en pensar en cada paso, y la version gratuita puede ver
todas las capacidades PRO desde el sidebar (vista PRO).

El prompt de la terminal (`>`) acepta tanto comandos como preguntas.

- Escribe un comando de herramienta directamente: `nmap -sV -T4 192.168.1.0/24`
- Usa los ayudantes de escaneo: `scan <objetivo>`, `vulnscan <objetivo>`, `iotscan <objetivo>`, `recon <objetivo>`
- Haz preguntas en lenguaje natural (espanol o ingles): el assistant engine
  analiza la salida anterior y sugiere el siguiente paso.
- Fija un objetivo de trabajo: `target 10.10.10.1`
- `status` muestra la conectividad del engine, las cuotas y las herramientas
  detectadas.

### Modo autonomo de pentesting / bug bounty

Pide una tarea en lenguaje natural y el agente la planifica y ejecuta
localmente, paso a paso:

```text
> enumerar subdominios de example.com
> fuzzear directorios en example.com
> buscar vulnerabilidades en 10.10.10.1
> haz reconocimiento a 10.10.10.1
> analiza los headers de https://example.com
```

En cada paso el engine elige la herramienta y el comando, el agente lo ejecuta
localmente, el engine analiza la salida y decide el siguiente paso (hasta 3
pasos por peticion). **Las acciones de alto riesgo (explotacion, fuerza bruta,
etc.) nunca se ejecutan sin confirmacion explicita**: el agente propone el
comando y espera tu `si` / `no` antes de ejecutarlo. Esto coincide con el
comportamiento del agente autonomo PRO descrito en la tabla de caracteristicas.

El panel de memoria registra hosts, credenciales, vulnerabilidades y notas. El
panel de linea de tiempo registra cada evento con marca de tiempo.

---

## ACTIVACION PRO

1. Envia **35 USDT** (pago unico, permanente) a la wallet TON:
   `UQCznm2Z1o56J51EfNSnO922mzOQRhOF3m_o5T9Qx8WhK4w9`
2. Contacta con **@Cyt3rTo0ls** por Telegram.
3. Envia una captura del pago.
4. Recibe una key de activacion de 6 digitos.
5. Introducela en la aplicacion (modal de activacion PRO, barra superior).

La key se valida localmente contra una relacion matematica; las keys invalidas
producen un rechazo generico. El estado PRO se guarda por sesion local.

Se incluye un bot de Telegram (`bot_handler.py`) para soporte de compra:

```bash
export TELEGRAM_BOT_TOKEN="tu-bot-token"
export TELEGRAM_OWNER_ID="tu-telegram-id"
python3 bot_handler.py
```

Comandos: `/start`, `/buy`, `/activate`, `/key` (solo el dueno).

---

## PLUGINS

Coloca los plugins de Python en `plugins/`. Cada plugin expone un hook
`register(hb)` que recibe la API de HackerBrain (`hb.executor`, `hb.memory`,
`hb.vault`, `hb.report`, `hb.agent`). Los plugins se cargan al inicio cuando
PRO esta activo.

```python
# plugins/example_plugin.py
def register(hb):
    def my_action(target):
        return hb.executor.execute("nmap -sV " + target)
    hb.register_command("myaction", my_action)
```

Los playbooks (secuencias de escaneo reutilizables, YAML/JSON) van en
`playbooks/`.

---

## ESTRUCTURA DEL PROYECTO

```
hackerbrain-os/
├── app.py                 # Aplicacion FastAPI (UI, WebSocket, REST, middleware de key)
├── generate_key.py        # herramienta de generacion de keys (solo dueno)
├── key_validator.py       # punto de entrada publico de validacion de key
├── bot_handler.py         # bot de soporte de Telegram
├── install.sh             # instalador
├── sales_page.html        # pagina de compra / activacion
├── requirements.txt
├── core/
│   ├── agent.py           # orquestador
│   ├── assistant_client.py# cliente del engine local (chat-completions)
│   ├── tools_executor.py  # deteccion de herramientas + ejecucion segura
│   ├── scanner.py         # wrappers de nmap / nuclei
│   ├── memory.py          # memoria SQLite + FTS5 + credenciales AES-256
│   ├── vault.py           # vault de credenciales AES-256 (PBKDF2)
│   ├── report_generator.py# informes PDF / DOCX / HTML / Markdown
│   ├── timeline.py        # linea de tiempo de eventos
│   └── key_validator.py   # logica de validacion de keys de 6 digitos
├── ui/
│   ├── dashboard.html
│   └── assets/ (style.css, app.js, terminal.js)
├── data/
│   └── config.yaml        # config de engine, limites, pago, seguridad
├── images/                # capturas de pantalla (EN/ES)
├── plugins/               # plugins de Python (PRO)
├── playbooks/             # definiciones de playbooks
├── TUTORIAL_ES.md         # guia de instalacion y uso (Espanol)
└── TUTORIAL.md            # installation and usage guide (English)
```

---

## CONTRIBUCION

Las pull requests son bienvenidas. Manten el codigo sobrio, comentado en
ingles tecnico y sin emojis. Sigue la estructura existente. Se prefieren
investigadores de seguridad con experiencia en divulgacion responsable.

---

## LICENCIA

AGPL-3.0. Ver `LICENSE`. Este software se proporciona "tal cual", sin garantia
de ningun tipo. Eres responsable de usarlo legalmente.

---

## CONTACTO

Telegram: **@Cyt3rTo0ls**
Wallet (TON / USDT): `UQCznm2Z1o56J51EfNSnO922mzOQRhOF3m_o5T9Qx8WhK4w9`
Precio: **35 USDT** pago unico, permanente.

ADVERTENCIA: Esta herramienta es solo para pruebas de seguridad autorizadas.
El acceso no autorizado a sistemas informaticos es ilegal.
