# Stage 1: Build Flutter Web
FROM google/dart:latest AS flutter_build

WORKDIR /app

# Instalar Flutter SDK
RUN git clone --depth 1 https://github.com/flutter/flutter.git /flutter
ENV PATH="/flutter/bin:/flutter/bin/cache/dart-sdk/bin:${PATH}"

# Descargar Flutter y compilar web
RUN flutter channel stable
RUN flutter upgrade
RUN flutter config --enable-web

# Copiar archivos del proyecto
COPY pubspec.yaml pubspec.lock* ./
RUN flutter pub get

COPY . .

# Compilar para web
RUN flutter build web --release

# Stage 2: Servir con Nginx
FROM nginx:alpine

# Copiar configuración custom de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos compilados
COPY --from=flutter_build /app/build/web /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
