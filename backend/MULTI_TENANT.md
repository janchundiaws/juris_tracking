# Arquitectura Multi-Tenant

## Descripción General

Este proyecto implementa una arquitectura **multi-tenant** basada en **subdominios**, donde cada tenant (cliente/organización) tiene sus datos aislados y accede al sistema a través de un subdominio único.

## Características

- ✅ **Detección automática de tenant** por subdominio (sin selección manual)
- ✅ **Aislamiento completo de datos** a nivel de base de datos
- ✅ **Sequelize hooks** para filtrado automático por tenant
- ✅ **Middleware de Express** para detección de tenant en cada request
- ✅ **Soporte para desarrollo local** (localhost/127.0.0.1)
- ✅ **Configuración personalizada por tenant** (JSONB settings)

## Cómo Funciona

### 1. Detección de Tenant

El sistema detecta el tenant automáticamente desde el header `Host` de cada request HTTP:

```
https://acme.juristracking.com → tenant: acme
https://lawfirm.juristracking.com → tenant: lawfirm
http://localhost:3003 → tenant: default (desarrollo)
```

**Middleware:** `backend/src/middleware/tenant.js`
- `tenantMiddleware`: Requerido para todas las rutas API (excepto públicas)
- `optionalTenantMiddleware`: Opcional para rutas de autenticación

### 2. Aislamiento de Datos

Todos los modelos principales incluyen `tenant_id`:
- Users
- Lawyers
- Creditors
- Judicial Processes
- Documents
- Activities
- Roles

**Modelos sin tenant (compartidos):**
- Provincie
- Maestro

### 3. Filtrado Automático

El sistema usa **Sequelize hooks** para filtrar automáticamente por tenant:

```javascript
// backend/src/middleware/tenantScope.js

// Hook beforeFind - Agrega filtro tenant_id automáticamente
model.addHook('beforeFind', (options) => {
  if (options.tenantId) {
    options.where = {
      ...options.where,
      tenant_id: options.tenantId
    };
  }
});

// Hook beforeCreate - Asigna tenant_id automáticamente
model.addHook('beforeCreate', (instance, options) => {
  if (options.tenantId && !instance.tenant_id) {
    instance.tenant_id = options.tenantId;
  }
});
```

## Instalación y Configuración

### 1. Ejecutar Migración SQL

```bash
cd backend
psql -U postgres -d juris_tracking -f base_datos/migration_multi_tenant.sql
```

Esta migración:
- Crea la tabla `tenants`
- Agrega columna `tenant_id` a todas las tablas principales
- Crea índices para mejorar performance
- Asigna un tenant por defecto a los datos existentes
- Configura restricciones de FK con CASCADE

### 2. Configurar Variables de Entorno

```bash
# .env
DEFAULT_TENANT_SUBDOMAIN=default
TENANT_DOMAIN=juristracking.com
NODE_ENV=development
```

### 3. Reiniciar el Servidor

```bash
npm run dev
```

## Uso en las Rutas

### Ejemplo de Consulta con Tenant

```javascript
// Antes (sin multi-tenant)
const users = await User.findAll();

// Después (con multi-tenant)
const users = await User.findAll({
  tenantId: req.tenantId
});
```

### Ejemplo de Creación con Tenant

```javascript
// Antes (sin multi-tenant)
const user = await User.create({
  username: 'john',
  email: 'john@example.com'
});

// Después (con multi-tenant)
const user = await User.create({
  username: 'john',
  email: 'john@example.com'
}, { tenantId: req.tenantId });
```

### Usando el Helper `withTenant`

```javascript
const { withTenant } = require('../middleware/tenantScope');

// Opción 1: Manual
const users = await User.findAll({ tenantId: req.tenantId });

// Opción 2: Con helper
const users = await User.findAll(withTenant(req.tenantId));
```

## Flujo de Request

```
1. Cliente hace request → https://acme.juristracking.com/api/usuarios
2. tenantMiddleware extrae subdomain → "acme"
3. Busca tenant en DB → SELECT * FROM tenants WHERE subdomain = 'acme'
4. Asigna req.tenant y req.tenantId
5. Ruta ejecuta query → User.findAll({ tenantId: req.tenantId })
6. Hook beforeFind agrega filtro → WHERE tenant_id = 'uuid-del-tenant'
7. Respuesta solo contiene datos del tenant "acme"
```

## Rutas Públicas y de Autenticación

```javascript
// Rutas públicas (sin tenant requerido)
/api/health
/api-docs

// Rutas de autenticación (tenant opcional)
/api/auth/login
/api/auth/registro

// Todas las demás rutas (tenant requerido)
/api/usuarios
/api/lawyers
/api/judicial-processes
etc.
```

## Gestión de Tenants

### Obtener Información del Tenant Actual

```http
GET /api/tenants
Authorization: Bearer {token}
```

### Actualizar Configuración del Tenant

```http
PUT /api/tenants
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "ACME Law Firm",
  "settings": {
    "timezone": "America/Mexico_City",
    "language": "es",
    "theme": "dark"
  }
}
```

## Modelo de Tenant

```javascript
{
  id: UUID,
  name: String,           // Nombre de la organización
  subdomain: String,      // Subdominio único (acme, lawfirm, etc.)
  domain: String,         // Dominio personalizado opcional
  status: Enum,           // active, inactive, suspended
  settings: JSONB,        // Configuración personalizada
  created_at: Timestamp,
  updated_at: Timestamp
}
```

## Desarrollo Local

Para desarrollo local, el sistema usa el tenant `default`:

```bash
# Acceder a
http://localhost:3003/api/usuarios
# Se asigna automáticamente al tenant "default"
```

Si quieres probar con subdominios locales, edita `/etc/hosts`:

```
127.0.0.1   acme.localhost
127.0.0.1   lawfirm.localhost
```

Y accede a:
```
http://acme.localhost:3003
http://lawfirm.localhost:3003
```

## Seguridad

- ✅ **Aislamiento total de datos**: Un tenant no puede ver datos de otro
- ✅ **Validación en middleware**: Tenant requerido antes de acceder a rutas protegidas
- ✅ **Validación en hooks**: Doble verificación a nivel de ORM
- ✅ **FK CASCADE**: Al eliminar un tenant, se eliminan todos sus datos
- ✅ **Índices en tenant_id**: Queries optimizados

## Próximos Pasos

- [ ] Frontend: Configurar CORS para múltiples subdominios
- [ ] Frontend: Extraer subdomain del window.location.hostname
- [ ] Panel de administración de tenants
- [ ] Endpoint para crear nuevos tenants (solo super admin)
- [ ] Métricas por tenant
- [ ] Backups por tenant

## Troubleshooting

### "Tenant no encontrado"
- Verificar que el tenant exista en la tabla `tenants`
- Verificar que el subdomain coincida exactamente (case-sensitive)
- En desarrollo, verificar que el tenant "default" exista

### "tenant_id cannot be null"
- Verificar que estás pasando `{ tenantId: req.tenantId }` en las opciones de Sequelize
- Verificar que el middleware de tenant se aplicó correctamente

### Datos de otros tenants aparecen
- Verificar que el hook `beforeFind` está aplicado al modelo
- Verificar que todas las consultas incluyen `tenantId` en opciones
- Revisar logs del middleware de tenant
