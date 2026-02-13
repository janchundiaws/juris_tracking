# Frontend - JurisTracking

Aplicación React para el sistema de gestión legal JurisTracking.

## 🚀 Desarrollo Local

### Instalar dependencias
```bash
npm install
```

### Ejecutar en modo desarrollo
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 🐳 Docker

### Variables de Entorno

Las variables de entorno en React se inyectan en **tiempo de build**. Configura el archivo `.env`:

```env
REACT_APP_API_URL=https://juris-backend.orb.local/api
```

### Construir la imagen Docker

**IMPORTANTE:** Debes pasar la variable `REACT_APP_API_URL` como argumento de build:

```bash
docker build --build-arg REACT_APP_API_URL=https://juris-backend.orb.local/api -t juris-frontend .
```

### Ejecutar el contenedor

```bash
docker run -d \
  --name juris-frontend \
  --network juris_tracking_juris_net \
  -p 83:80 \
  juris-frontend
```

### Comandos útiles

```bash
# Ver logs del contenedor
docker logs -f juris-frontend

# Detener y eliminar el contenedor
docker stop juris-frontend && docker rm juris-frontend

# Verificar archivos dentro del contenedor
docker exec juris-frontend ls -la /usr/share/nginx/html

# Reconstruir y reiniciar
docker stop juris-frontend && docker rm juris-frontend
docker build --build-arg REACT_APP_API_URL=https://juris-backend.orb.local/api -t juris-frontend .
docker run -d --name juris-frontend --network juris_tracking_juris_net -p 83:80 juris-frontend
```

## 🔧 Configuración

### Nginx

El archivo `nginx.conf` configura:
- Servidor Nginx en puerto 80
- Compresión Gzip para assets
- Cache para archivos estáticos
- Soporte para React Router (SPA)
- Proxy reverso `/api/` → backend
- Headers de seguridad

### Arquitectura

```
Frontend (React) → Nginx:80 → Backend:3003
                     ↓
              /api/* proxied to backend
```

## 🌐 Acceso

- **Desarrollo:** http://localhost:3000
- **Producción (Docker):** http://juris-frontend.orb.local (puerto 83)
- **Health Check:** http://juris-frontend.orb.local/health

## 📝 Notas Importantes

1. **Variables de entorno:** Se inyectan en tiempo de build, no en runtime
2. **Reconstrucción necesaria:** Cualquier cambio en `.env` requiere rebuild de la imagen
3. **Red Docker:** Debe estar en la red `juris_tracking_juris_net` para comunicarse con el backend