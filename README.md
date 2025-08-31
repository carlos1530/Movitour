# API Documentation - MoviTour

## Configuración Inicial

### 1. Instalación de dependencias
```bash
npm install
```

### 2. Configuración de la base de datos
Ejecuta el script SQL proporcionado en PostgreSQL para crear las tablas necesarias.

### 3. Variables de entorno
Crea un archivo `.env` basado en `.env.example` y configura tus credenciales.

### 4. Ejecutar el servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Endpoints Disponibles

### 🔐 Autenticación

#### POST `/api/auth/register`
Registra un nuevo usuario.

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@email.com",
  "password": "1234"
}
```

**Respuesta exitosa:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@email.com"
  }
}
```

#### POST `/api/auth/login`
Inicia sesión de usuario.

**Body:**
```json
{
  "email": "juan@email.com",
  "password": "1234"
}
```

**Respuesta exitosa:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@email.com"
  }
}
```

### 🏙️ Ciudades

#### GET `/api/ciudades`
Obtiene todas las ciudades disponibles.

**Respuesta:**
```json
{
  "ciudades": [
    {
      "id": 1,
      "nombre": "Barranquilla",
      "descripcion": "Barranquilla es conocida como la Puerta de Oro de Colombia...",
      "imagen_url": "./Imagenes/barranquilla.jpg"
    }
  ]
}
```

#### GET `/api/ciudades/:id`
Obtiene una ciudad específica por ID.

### 🎯 Ofertas

#### GET `/api/ofertas`
Obtiene todas las ofertas disponibles.

**Respuesta:**
```json
{
  "ofertas": [
    {
      "id": 1,
      "titulo": "Tour Carnaval de Barranquilla",
      "descripcion": "Vive la experiencia del Carnaval...",
      "precio": "150000.00",
      "fecha_disponible": "2025-02-15",
      "hora_disponible": "09:00:00",
      "cupos_disponibles": 10,
      "ciudad_nombre": "Barranquilla"
    }
  ]
}
```

#### GET `/api/ofertas/buscar?ciudad=Cartagena&fecha=2025-02-28&hora=14:00`
Busca ofertas con filtros opcionales.

**Query Parameters:**
- `ciudad` (opcional): Nombre de la ciudad
- `fecha` (opcional): Fecha en formato YYYY-MM-DD
- `hora` (opcional): Hora en formato HH:MM

#### GET `/api/ofertas/:id`
Obtiene una oferta específica por ID.

### 📋 Reservas (Requieren Autenticación)

**Header requerido:** `Authorization: Bearer <token>`

#### POST `/api/reservas`
Crea una nueva reserva.

**Body:**
```json
{
  "oferta_id": 1,
  "cantidad_personas": 2
}
```

**Respuesta exitosa:**
```json
{
  "message": "Reserva creada exitosamente",
  "reserva": {
    "id": 1,
    "usuario_id": 1,
    "oferta_id": 1,
    "fecha_reserva": "2025-01-15T10:30:00.000Z",
    "estado": "pendiente",
    "cantidad_personas": 2,
    "total": "300000.00"
  }
}
```

#### GET `/api/reservas`
Obtiene todas las reservas del usuario autenticado.

**Respuesta:**
```json
{
  "reservas": [
    {
      "id": 1,
      "fecha_reserva": "2025-01-15T10:30:00.000Z",
      "estado": "pendiente",
      "cantidad_personas": 2,
      "total": "300000.00",
      "titulo": "Tour Carnaval de Barranquilla",
      "descripcion": "Vive la experiencia...",
      "fecha_disponible": "2025-02-15",
      "hora_disponible": "09:00:00",
      "ciudad_nombre": "Barranquilla"
    }
  ]
}
```

### 🔧 Utilidades

#### GET `/api/health`
Verifica el estado del servidor.

**Respuesta:**
```json
{
  "message": "Servidor MoviTour funcionando correctamente",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

## Códigos de Estado HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Notas de Implementación

1. **Autenticación:** Utiliza JWT tokens con expiración de 24 horas
2. **Encriptación:** Las contraseñas se almacenan usando bcrypt
3. **Transacciones:** Las reservas se manejan con transacciones para mantener consistencia
4. **CORS:** Configurado para permitir requests del frontend
5. **Validaciones:** Se incluyen validaciones básicas en todos los endpoints

## Ejemplo de Uso con JavaScript

```javascript
// Login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@email.com',
    password: '1234'
  })
});
const { token } = await response.json();

// Crear reserva
await fetch('http://localhost:3000/api/reservas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    oferta_id: 1,
    cantidad_personas: 2
  })
});
```