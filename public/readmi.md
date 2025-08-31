# MoviTour - Backend y Frontend Integrado

Este proyecto es una aplicación web para la gestión de tours, que incluye un backend en Node.js (Express) con PostgreSQL y un frontend básico en HTML, CSS (TailwindCSS) y JavaScript.

## Características

*   **Autenticación de Usuarios:** Registro e inicio de sesión con JWT.
*   **Gestión de Ciudades:** Consulta de ciudades disponibles.
*   **Gestión de Ofertas:** Consulta y búsqueda de ofertas de tours.
*   **Gestión de Reservas:** Creación y consulta de reservas (requiere autenticación).
*   **Dashboard:** Panel de control para usuarios autenticados con un resumen de sus reservas.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

*   **Node.js:** Versión 16 o superior.
*   **npm (Node Package Manager):** Viene incluido con Node.js.
*   **PostgreSQL:** Un servidor de base de datos PostgreSQL.
*   **pgAdmin (Opcional):** Una herramienta gráfica para gestionar tu base de datos PostgreSQL.

## Configuración de la Base de Datos

1.  **Crear la Base de Datos:**
    Abre tu cliente PostgreSQL (por ejemplo, `psql` o pgAdmin) y crea una nueva base de datos. El nombre por defecto que usa la aplicación es `proyecto_integrador`.

    ```sql
    CREATE DATABASE proyecto_integrador;
    ```

2.  **Ejecutar el Script SQL:**
    El archivo `bd.psql` contiene el esquema de la base de datos y algunos datos de ejemplo. Ejecuta este script en tu base de datos `proyecto_integrador`.

    Puedes hacerlo desde la terminal:
    ```bash
    psql -U <tu_usuario_postgres> -d proyecto_integrador -f bd.psql
    ```
    Reemplaza `<tu_usuario_postgres>` con tu nombre de usuario de PostgreSQL.

## Configuración del Proyecto

1.  **Clonar el Repositorio (si aplica):**
    ```bash
    git clone <url_del_repositorio>
    cd Proyecto_integrador
    ```

2.  **Instalar Dependencias:**
    Navega a la raíz del proyecto e instala todas las dependencias del backend.

    ```bash
    npm install
    ```

3.  **Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto (`Proyecto_integrador/.env`) y configura las variables de entorno necesarias para la conexión a la base de datos y la clave secreta de JWT.

    ```
    # Variables de entorno para la base de datos
    DB_HOST=localhost
    DB_USER=vega
    DB_PASSWORD=1234
    DB_DATABASE=proyecto_integrador
    DB_PORT=5432

    # Clave secreta para JWT (¡CAMBIAR EN PRODUCCIÓN POR UNA MÁS SEGURA!)
    JWT_SECRET=tu_clave_secreta_super_segura
    ```
    Asegúrate de que los valores de `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `DB_HOST` y `DB_PORT` coincidan con tu configuración de PostgreSQL.

## Ejecutar la Aplicación

1.  **Iniciar el Backend:**
    Desde la raíz del proyecto, ejecuta el siguiente comando para iniciar el servidor backend.

    ```bash
    npm run dev
    ```
    Esto iniciará el servidor en `http://localhost:3000`. Verás un mensaje en la consola indicando que el servidor está funcionando y la base de datos conectada.

2.  **Abrir el Frontend:**
    El frontend es una aplicación estática en HTML/CSS/JavaScript. Simplemente abre los archivos HTML directamente en tu navegador web.

    *   Para la página principal: Abre `Proyecto_integrador/Fronted/index.html`
    *   Para iniciar sesión: Abre `Proyecto_integrador/Fronted/Login.html`
    *   Para registrarse: Abre `Proyecto_integrador/Fronted/registro.html`
    *   Para ver ofertas: Abre `Proyecto_integrador/Fronted/ofertas.html`
    *   Para el dashboard (requiere login): Abre `Proyecto_integrador/Fronted/Dashboard.html`

    **Nota:** Debido a las políticas de seguridad del navegador (CORS), es posible que necesites un servidor web local para servir los archivos del frontend si experimentas problemas. Sin embargo, tu backend ya tiene CORS configurado para permitir solicitudes desde cualquier origen (`app.use(cors());`), por lo que abrir los archivos directamente debería funcionar en la mayoría de los casos.

## Endpoints de la API (Backend)

El backend expone los siguientes endpoints:

### Autenticación

*   `POST /api/auth/register`: Registra un nuevo usuario.
*   `POST /api/auth/login`: Inicia sesión y devuelve un token JWT.

### Ciudades

*   `GET /api/ciudades`: Obtiene todas las ciudades activas.
*   `GET /api/ciudades/:id`: Obtiene una ciudad específica por ID.

### Ofertas

*   `GET /api/ofertas`: Obtiene todas las ofertas activas.
*   `GET /api/ofertas/buscar?ciudad=...&fecha=...&hora=...`: Busca ofertas con filtros opcionales.
*   `GET /api/ofertas/:id`: Obtiene una oferta específica por ID.

### Reservas (Requieren Autenticación JWT)

*   `POST /api/reservas`: Crea una nueva reserva. Requiere `Authorization: Bearer <token>`.
*   `GET /api/reservas`: Obtiene todas las reservas del usuario autenticado. Requiere `Authorization: Bearer <token>`.

### Utilidades

*   `GET /api/health`: Verifica el estado del servidor.

## Notas Adicionales

*   **Seguridad:** La clave `JWT_SECRET` en el archivo `.env` debe ser una cadena de caracteres larga y compleja, y no debe ser compartida ni expuesta en un entorno de producción.
*   **Desarrollo vs. Producción:** El comando `npm run dev` usa `nodemon` para reiniciar el servidor automáticamente con cada cambio. Para producción, usarías `npm start`.
*   **Frontend:** El frontend es una aplicación de una sola página (SPA) simple. Para un proyecto más grande, se recomendaría usar un framework como React, Angular o Vue.js y un servidor de desarrollo para el frontend.