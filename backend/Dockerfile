# Etapa base con Node.js
FROM node:18-alpine AS base

# Instalar dependencias del sistema necesarias para Playwright y PostgreSQL
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    postgresql-client

# Configurar Playwright para usar Chromium instalado
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Etapa de dependencias
FROM base AS dependencies

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar node_modules para la etapa de producción
RUN cp -R node_modules /prod_node_modules

# Instalar todas las dependencias (incluyendo dev) para construcción si es necesario
RUN npm ci

# Etapa de producción
FROM base AS production

WORKDIR /app

# Copiar dependencias de producción
COPY --from=dependencies /prod_node_modules ./node_modules

# Copiar código fuente
COPY . .

# Crear usuario no-root para ejecutar la aplicación
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3003

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando por defecto
CMD ["npm", "start"]
