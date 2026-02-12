## comando para crear la imagen 
```bash
docker build -t juris-frontend .
```

## comandos para construir el contenedor 
```bash
docker run -d \
  --name juris-frontend \
  --env-file .env \
  --network proxy_network \
  -p 3003:3003 \
  juris-frontend
```