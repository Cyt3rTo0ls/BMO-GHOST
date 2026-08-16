# HackerBrain OS - Tutorial de instalacion y uso (Espanol)

**Idioma / Language:** [Espanol](TUTORIAL_ES.md) | [English](TUTORIAL.md)

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
3. Instala todas las dependencias desde `requirements.txt` (incluido PyArmor).
4. **Ofusca el codigo** con PyArmor en `dist/` (la app corre desde ese build ofuscado).
5. Crea la estructura de carpetas (`data/`, `ui/assets/`, `reports/`, ...).
6. Inicializa la base de datos SQLite local (`data/memory.db`).
7. Ajusta los permisos de archivos.
8. Comprueba si hay un assistant engine local en los puertos 8080, 8010 y 8011.

Instalacion manual alternativa:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 3. Arrancar la aplicacion (abre Firefox por ti)

```bash
./install.sh once        # instala (si hace falta) + arranca + abre tu navegador
./install.sh run         # arranca el servidor en http://127.0.0.1:8080 (dist/ ofuscado)
./install.sh stop        # lo detiene
./install.sh obfuscate   # regenera el build ofuscado (dist/)
```

`./install.sh once` hace todo y **abre Firefox (o tu navegador por defecto
de Kali) automaticamente** en `http://127.0.0.1:8080`. El servidor ejecuta
el codigo ofuscado desde `dist/`; el arbol de codigo fuente se conserva
como copia de desarrollo.

O manualmente:

```bash
source .venv/bin/activate
uvicorn app:app --host 127.0.0.1 --port 8080
```

Abre el navegador en `http://127.0.0.1:8080`.

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
- Activa o desactiva el modo verbose: `verbose on` / `verbose off` (o el boton
  VERBOSE de la barra de estado). Cuando esta activo, la terminal muestra
  cuanto tarda el assistant engine en pensar en cada paso (por ejemplo
  `[engine thought for 12.4s]`) y cuanto tardo cada comando en ejecutarse.

Preguntas (en ingles o espanol):

```text
> what is the best way to enumerate ports on a Windows host?
> que herramienta usarias para enumerar subdominios y por que?
```

El assistant engine analiza la salida anterior y responde, o propone el
siguiente paso. Si propone un comando, revisalo y ejecutalo manualmente.
El agente autonomo siempre pregunta antes de ejecutar algo de alto riesgo.

Escaneo en lenguaje natural (se ejecuta de verdad, no solo texto):

```text
> escanea solo los dispositivos conectados a mi red
> scan my network for live hosts
> escanea los puertos de 192.168.1.50
```

Las peticiones de escaneo se detectan en espanol e ingles. Si dices "mi red"
sin objetivo explicito, HackerBrain OS lee tu tabla de rutas, detecta la
subred local (la interfaz de la ruta por defecto) y ejecuta un descubrimiento
de hosts real (o escaneo de puertos) contra ella. Los hosts vivos se guardan
en memoria con su fabricante MAC cuando esta disponible.

### Modo autonomo de pentesting / bug bounty

HackerBrain OS no se limita a escaneos. Pide una tarea en lenguaje natural
(espanol o ingles) y el agente la ejecuta localmente, paso a paso:

```text
> enumerar subdominios de example.com
> fuzzear directorios en example.com
> buscar vulnerabilidades en 10.10.10.1
> haz reconocimiento a 10.10.10.1
> analiza los headers de https://example.com
> busca credenciales por defecto en 10.10.10.1
```

En cada paso el engine local elige la herramienta y el comando exacto, el
agente lo ejecuta, el engine analiza la salida y decide el siguiente paso
(hasta 3 pasos por peticion). Las acciones de alto riesgo (explotacion,
fuerza bruta, ataques de credenciales, MITM) estan protegidas: el agente
muestra el comando propuesto y pide confirmacion explicita antes de
ejecutarlo. Responde `si`/`yes` para ejecutarlo o `no` para cancelarlo.
Esto mantiene la herramienta segura para pruebas autorizadas.

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

1. Envia **20 USDT** (pago unico, permanente) a la wallet TON:
   `UQCznm2Z1o56J51EfNSnO922mzOQRhOF3m_o5T9Qx8WhK4w9`
2. Contacta con **@Cyt3rTo0ls** por Telegram.
3. Envia una captura del pago.
4. Recibe una key de activacion de 6 digitos.
5. Introducela en el modal de activacion PRO (boton de la barra superior).

PRO desbloquea: uso ilimitado del assistant engine, vault cifrado, generacion
de informes, memoria persistente, proyectos ilimitados, plugins, webhooks,
snapshots, escaneo de IoT/servicios expuestos y mas.

### La activacion PRO es PERMANENTE y de un solo uso

- La key queda **ligada a esta maquina**: una vez activada, PRO sigue activo
  entre reinicios y sesiones. Nunca vuelves a introducir la key.
- Las keys son de **un solo uso**: la primera maquina que activa una key la
  consume, asi que la misma key no puede venderse dos veces. Si una key se
  comparte o roba, el vendedor puede revocarla globalmente y deja de
  funcionar en todos lados.

### Entrenamiento PRO (enseña al asistente)

Los usuarios PRO pueden enseñar al asistente sus preferencias. Las entradas
se guardan localmente y se inyectan en el contexto del engine en cada turno:

```
train preference: usa siempre deteccion de servicios -sV
train target: 10.0.0.5 es la maquina de produccion
> training            # lista las entradas
```

O desde la UI (seccion PRO). Es una inyeccion ligera de contexto - no se
modifican pesos del modelo, todo permanece local.

### Grafo de relaciones OSINT (PRO, estilo Maltego)

PRO incluye una pestana **OSINT GRAPH** que construye un grafo de relaciones
ordenado y con colores (como Maltego) desde cualquier entidad semilla.
Escribe un email, dominio, IP, usuario o telefono y el grafo se expande:

```
alice@example.com   -> parte local + dominio + estado de brechas + dorks
example.com         -> registrador/org + subdominios + emails + IPs (-> geo)
8.8.8.8             -> org duena + geo + reverse DNS
torvalds            -> perfiles sociales (GitHub, X, Reddit, Telegram...) + dorks
```

Los tipos de nodo tienen colores (email, dominio, subdominio, IP, usuario,
telefono, org, social, brecha, meta) con leyenda, las aristas llevan la
etiqueta del tipo de relacion, y el grafo tiene zoom / arrastre. Tambien
desde el terminal: `graph example.com` (anade `depth 3` para expandir mas).

### Busqueda inversa de caras (PRO, FaceCheck ID)

En la misma pestana OSINT GRAPH hay un panel **FaceCheck ID**: pega tu
propia FaceCheck ID API key (se guarda local, modo 600) y busca cualquier
cara por URL de imagen o ruta local para encontrar donde aparece en linea:

```
facecheck https://example.com/foto.jpg
facecheck /home/usuario/foto.jpg
```

Los resultados muestran el sitio de origen, la puntuacion y la URL (abre en
una pestana nueva). La key nunca se sube a ningun sitio.

### Mapa IoT global (PRO, Shodan)

PRO incluye un mapa mundial interactivo de dispositivos expuestos. Abre la
pestana **IoT MAP** en el sidebar, pega **tu propia Shodan API key** (la capa
gratuita funciona) y busca con sintaxis de consulta de Shodan:

```
cameras
routers
port:3389 country:BR
product:"Hikvision"
"default password"
```

Cada resultado es un marcador en un mapa mundial con zoom. Haz clic en un
host para ver el detalle completo: organizacion duena, ISP, ASN,
ciudad/pais, puertos abiertos, banners de servicios y CVEs conocidos. La
misma busqueda funciona desde el terminal:

```
shodan cameras port:554
```

La key se guarda localmente (`data/shodan.key`, modo 600) y se valida
contra la API de Shodan al guardarla; nunca se sube a ningun sitio.

### Comandos extra de reconocimiento

```
dns example.com                 # enumeracion A/AAAA/MX/NS/TXT/SOA/CNAME
dnsspoof example.com            # prueba de DNS spoofing/envenenamiento (labs autorizados)
```

Cada escaneo informa una **duracion estimada** por adelantado (linea verbose
`[estimated duration: ~X min]`), para que sepas cuanto tardara cada paso,
incluyendo como el rate limit alarga el tiempo.

### Minima censura

HackerBrain OS no censura el toolset profesional: iptables/ufw, dd, mkfs y
todas las herramientas de explotacion/post-explotacion se ejecutan libremente.
Solo se bloquean los comandos que destruirian el propio host local. El engine
marca un paso como alto riesgo solo para acciones realmente irreversibles, asi
los pasos rutinarios de sqlmap/hydra/explotacion no disparan confirmaciones.
Para desactivar el gate de confirmacion por completo (persistente):
`aggressive on` / `aggressive off`.

## 9b. OSINT (inteligencia de fuentes abiertas)

HackerBrain OS incluye un modulo OSINT completo (`osint <objetivo>`
auto-detecta el tipo de objetivo) que usa el toolset OSINT de Kali/Parrot
cuando esta instalado y cae a implementaciones en Python puro, asi que cada
comando funciona en cualquier maquina. Solo se consultan fuentes publicas
(WHOIS, DNS, logs de transparencia de certificados, APIs publicas de
filtraciones).

```
osint example.com               # auto: dominio -> whois+dns+subdominios+emails
osint 8.8.8.8                   # auto: IP -> whois+geo+reverse DNS
osint alice@example.com         # auto: email -> MX + brechas + dorks
osint torvalds                  # auto: usuario -> perfiles sociales
email alice@example.com         # inteligencia de email (MX, check de brechas, dorks)
user torvalds                   # busqueda de usuario en redes sociales
subdomains example.com          # crt.sh + amass + sublist3r + theHarvester
whois example.com               # datos de registro del dominio
ip 8.8.8.8                      # geolocalizacion + WHOIS + reverse DNS
meta ./foto.jpg                 # metadatos EXIF/GPS/autor de un archivo local
phone "+34 600 000 000"         # OSINT de telefono (phoneinfoga si esta instalado)
dork example.com                # Google dorks para el objetivo
breach alice@example.com        # comprobacion de exposicion en brechas (HIBP)
```

Notas:
- `subdomains`, `osint <dominio>` y `user` ejecutan varias fuentes en
  paralelo con timeouts acotados (~35-40s max), asi una fuente pasiva lenta
  nunca bloquea el comando.
- El check de brechas usa la API de rango de HIBP con k-anonimato (solo
  los primeros 5 caracteres del hash SHA-1 salen de la maquina); la API
  completa de brechas necesita una key.
- El OSINT es pasivo y legal contra objetivos autorizados; los dorks son
  solo consultas - respeta los terminos de servicio de cada plataforma.

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
README en espanol: [README_ES.md](README_ES.md)
