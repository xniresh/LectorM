# 📚 LectorManga

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
</div>

<p align="center">
  LectorManga
</p>

## 📖 Descripción

LectorManga es una aplicación web moderna para leer y organizar tu colección de mangas. Con una interfaz elegante y fácil de usar, te permite explorar, leer y gestionar tus mangas favoritos desde cualquier dispositivo.

### ✨ Características

- 🎨 Diseño moderno con tema claro y oscuro
- 📱 Interfaz responsive para todos los dispositivos
- 📚 Organización de mangas por categorías
- 🔍 Búsqueda rápida de mangas
- 👤 Sistema de autenticación de usuarios
- 📖 Lector de mangas intuitivo
- ❤️ Guarda tus mangas favoritos
- 🕒 Historial de lectura

## 🚀 Instalación y Ejecución

### Requisitos previos

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/downloads)

### Pasos para la instalación

1. Clona el repositorio:

```bash
git clone https://github.com/xniresh/LectorM.git
cd LectorM
```

2. Inicia la aplicación con Docker Compose:

```bash
docker compose up --build -d
```

3. La aplicación estará disponible en:

```
http://localhost:3000
```

## 🔧 Estructura del Proyecto

```
LectorManga/
├── src/                  # Código fuente
│   ├── models/           # Modelos de MongoDB
│   ├── public/           # Archivos estáticos (CSS, JS, imágenes)
│   ├── routes/           # Rutas de la API
│   ├── utils/            # Utilidades
│   ├── views/            # Archivos HTML
│   └── app.js            # Punto de entrada de la aplicación
├── Manga/                # Directorio para almacenar los mangas
├── docker-compose.yml    # Configuración de Docker Compose
├── Dockerfile            # Configuración de Docker
└── package.json          # Dependencias del proyecto
```

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Base de datos**: MongoDB
- **Contenedorización**: Docker, Docker Compose
- **Autenticación**: JWT (JSON Web Tokens)

## 🔐 Variables de Entorno

La aplicación utiliza las siguientes variables de entorno que puedes configurar en el archivo `docker-compose.yml`:

- `NODE_ENV`: Entorno de desarrollo (`development` o `production`)
- `MONGODB_URI`: URI de conexión a MongoDB

## 📂 Rutas de Almacenamiento

En el archivo `docker-compose.yml` se configuran las siguientes rutas de almacenamiento que **debes modificar** según tu sistema:

```yaml
volumes:
  - /home/user/mangas-temp:/app/Manga:ro  # Ruta donde se almacenan los mangas
```
```yaml

services:
  app:
    image: xlokius/lector_manga:latest
    container_name: lector_manga_app
    ports:
      - "3000:3000"
    volumes:
      - /home/user/mangas-temp:/app/Manga:ro
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongodb:27017/mangadb
    depends_on:
      mongodb:
        condition: service_healthy
    command: npm run dev
    networks:
      - lector_manga_network


  mongodb:
    image: mongo:latest
    container_name: lector_manga_mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=mangadb
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 10s
      retries: 5
      start_period: 40s
    networks:
        - lector_manga_network



volumes:
  mongodb_data:



networks:
  lector_manga_network:
    driver: bridge


```
**⚠️ Importante**: Debes cambiar estas rutas por directorios que existan en tu sistema. Por ejemplo:

- En Linux/Mac: `/ruta/a/tu/carpeta/Manga` y `/ruta/a/tu/carpeta/MongoDB`
- En Windows: `C:\ruta\a\tu\carpeta\Manga` y `C:\ruta\a\tu\carpeta\MongoDB`

Asegúrate de que estas carpetas existan antes de iniciar la aplicación o Docker las creará automáticamente.


---

<p align="center">
  Hecho con ❤️ por <a href="https://github.com/xniresh">xniresh</a>
</p>
