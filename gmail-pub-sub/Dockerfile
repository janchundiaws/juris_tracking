# Usar Node.js 20 LTS como imagen base
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el código fuente
COPY . .

# Exponer el puerto (se puede sobrescribir con variable de entorno)
EXPOSE 3000

# Variables de entorno por defecto (se pueden sobrescribir)
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar la aplicación
CMD ["node", "index.js"]
