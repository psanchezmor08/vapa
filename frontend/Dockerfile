FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (para cache)
COPY package.json ./
COPY yarn.lock ./

# Instalar dependencias
RUN yarn install --frozen-lockfile --network-timeout 100000

# Copiar el resto del código
COPY . .

# Argumentos de build (se pasan desde docker-compose)
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Build de producción
RUN yarn build

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar build al directorio de Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Comando para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]
