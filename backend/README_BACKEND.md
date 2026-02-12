# Backend JurisTracking - Documentación Completa

## 📦 Características Implementadas

✅ **Autenticación JWT**
✅ **Base de Datos PostgreSQL con Sequelize**
✅ **Gestión de Usuarios (CRUD)**
✅ **Documentación Swagger/OpenAPI**
✅ **Nodemon para desarrollo**
✅ **Bcryptjs para seguridad de contraseñas**

## 🗂️ Estructura del Proyecto

```
backend/
├── index.js                           # Servidor principal
├── package.json                       # Dependencias
├── nodemon.json                       # Configuración nodemon
├── .env                               # Variables de entorno
├── POSTGRESQL.md                      # Guía PostgreSQL
├── AUTENTICACION.md                   # Guía Autenticación
├── src/
│   ├── config/
│   │   ├── database.js               # Configuración Sequelize + PostgreSQL
│   │   └── swagger.js                # Configuración Swagger/OpenAPI
│   ├── middleware/
│   │   └── auth.js                   # Middleware JWT
│   ├── models/
│   │   └── Usuario.js                # Modelo de Usuario
│   └── routes/
│       └── usuarios.js               # Rutas de usuarios (registro, login, CRUD)
└── node_modules/
```

## 🚀 Quick Start

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar PostgreSQL

```bash
# En macOS
brew install postgresql@15
brew services start postgresql@15
createdb juris_tracking
```

### 3. Configurar variables de entorno (.env)
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=tu_secret_key_super_segura

DB_HOST=localhost
DB_PORT=5432
DB_NAME=juris_tracking
DB_USER=postgres
DB_PASSWORD=postgres
```

### 4. Iniciar servidor
```bash
npm run dev
```

El servidor estará en: `http://localhost:3001`
Swagger estará en: `http://localhost:3001/api-docs`

## 📚 Endpoints Disponibles

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/usuarios/registro` | Registrar nuevo usuario |
| POST | `/api/usuarios/login` | Login de usuario |

### Usuarios (Requieren Token JWT)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios` | Obtener todos los usuarios |
| GET | `/api/usuarios/{id}` | Obtener usuario por ID |
| PUT | `/api/usuarios/{id}` | Actualizar usuario |
| DELETE | `/api/usuarios/{id}` | Eliminar usuario |

### Sistema

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Health check del servidor |
| GET | `/api-docs` | Documentación Swagger interactiva |

## 🔑 Flujo de Autenticación

### 1. Registrar Usuario
```bash
curl -X POST http://localhost:3001/api/usuarios/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "rol": "abogado"
  }'
```

**Respuesta:**
```json
{
  "message": "Usuario registrado exitosamente",
  "usuario": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "abogado"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Usar Token en Rutas Protegidas
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/usuarios
```

## 🗄️ Base de Datos

### Tabla de Usuarios
```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'usuario', 'abogado') DEFAULT 'usuario',
  activo BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Conexión Sequelize
- **Host:** localhost
- **Puerto:** 5432
- **Base de datos:** juris_tracking
- **Usuario:** postgres
- **Contraseña:** postgres

## 📝 Scripts npm

```bash
npm start      # Iniciar servidor en producción
npm run dev    # Iniciar servidor con nodemon (desarrollo)
npm test       # Ejecutar tests
```

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcryptjs
- ✅ Tokens JWT con expiración configurable (24h por defecto)
- ✅ Middleware de autenticación en rutas protegidas
- ✅ Validación de email único
- ✅ Validación de datos en entrada

## 📖 Documentación Adicional

- [POSTGRESQL.md](POSTGRESQL.md) - Guía completa de PostgreSQL y Sequelize
- [AUTENTICACION.md](AUTENTICACION.md) - Guía de autenticación JWT

## 🛠️ Próximos Pasos

1. **Crear modelos adicionales:** Casos, Documentos, Eventos
2. **Implementar relaciones:** Usuario → Casos, Casos → Documentos
3. **Agregar validaciones:** Más validaciones de negocio
4. **Tests:** Implementar tests con Jest/Mocha
5. **Rate Limiting:** Proteger endpoints contra ataques
6. **Logging:** Sistema de logs con Winston
7. **Caché:** Redis para caché de datos frecuentes

## 🆘 Troubleshooting

**Error: "connect ECONNREFUSED"**
- PostgreSQL no está corriendo
- Solución: `brew services start postgresql@15`

**Error: "Table 'usuarios' doesn't exist"**
- La base de datos no está sincronizada
- Solución: Reinicia el servidor para que sincronice automáticamente

**Error: "Email already registered"**
- El email ya existe en la BD
- Solución: Usa un email diferente o elimina el usuario anterior

## 📞 Soporte

Para más información, consulta la documentación oficial:
- [Express.js](https://expressjs.com)
- [Sequelize](https://sequelize.org)
- [PostgreSQL](https://www.postgresql.org)
- [JWT](https://jwt.io)


## comando para crear la imagen 
```bash
docker build -t juris-backend .
```

## comandos para construir el contenedor 
```bash
docker run -d \
  --name juris-backend \
  --env-file .env \
  --network proxy_network \
  -p 3003:3003 \
  juris-backend
```
