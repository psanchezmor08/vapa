# 🐳 Resumen de Archivos Docker - VAPA.es

## ✅ Archivos Creados para Docker

### 1. **backend/Dockerfile**
- Imagen base: Python 3.11-slim
- Instala todas las dependencias de Python
- Expone puerto 8001 para FastAPI

### 2. **frontend/Dockerfile**
- Multi-stage build:
  - Stage 1: Node.js para construir React
  - Stage 2: Nginx para servir archivos estáticos
- Expone puerto 80 internamente

### 3. **frontend/nginx.conf**
- Configuración de Nginx para:
  - Servir archivos estáticos del frontend
  - Proxy al backend en `/api/*`
  - React Router (todas las rutas a index.html)
  - Headers de seguridad
  - Compresión gzip

### 4. **docker-compose.yml**
- Orquesta 3 servicios:
  - **mongodb**: Base de datos
  - **backend**: API FastAPI
  - **frontend**: React + Nginx
- Puerto expuesto: **6000**
- Red privada entre contenedores
- Volúmenes persistentes para MongoDB
- Health checks para todos los servicios

### 5. **.env.docker**
- Variables de entorno para Docker:
  - `SECRET_KEY`: Clave JWT (cambiar en producción)
  - `REACT_APP_BACKEND_URL`: URL del backend

### 6. **.dockerignore**
- Excluye archivos innecesarios del build:
  - node_modules, venv, build, logs, etc.
  - Optimiza tamaño de imágenes

### 7. **DOCKER_DEPLOYMENT.md**
- Guía completa de despliegue con:
  - Instrucciones para Portainer
  - Comandos Docker Compose
  - Configuración de variables
  - Troubleshooting
  - Backups de MongoDB
  - SSL con Let's Encrypt

---

## 🚀 Despliegue Rápido

### Opción 1: Con Portainer (Recomendado)

1. Sube código a GitHub
2. En Portainer: Stacks → Add stack → Git Repository
3. URL: `https://github.com/TU_USUARIO/vapa-es`
4. Variables:
   ```
   SECRET_KEY=tu-clave-segura
   REACT_APP_BACKEND_URL=http://TU_IP:6000
   ```
5. Deploy the stack
6. Accede a `http://TU_IP:6000`

### Opción 2: Docker Compose Manual

```bash
git clone https://github.com/TU_USUARIO/vapa-es.git
cd vapa-es
cp .env.docker .env
# Editar .env con tus valores
docker-compose up -d --build
```

---

## 📊 Arquitectura

```
┌─────────────────────────────────────────┐
│  Puerto 6000 (Externo)                  │
└───────────────┬─────────────────────────┘
                │
        ┌───────▼────────┐
        │   Frontend     │  Nginx en puerto 80
        │  (React App)   │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │    Backend     │  FastAPI en puerto 8001
        │   (API REST)   │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │    MongoDB     │  Puerto 27017 (interno)
        │   (Database)   │
        └────────────────┘

Red interna: vapa-network
Volumen persistente: mongodb_data
```

---

## 🔧 Variables de Entorno Importantes

| Variable | Donde se usa | Ejemplo |
|----------|--------------|---------|
| `SECRET_KEY` | Backend JWT | `abc123def456...` |
| `REACT_APP_BACKEND_URL` | Frontend build | `http://192.168.1.100:6000` |
| `MONGO_URL` | Backend | `mongodb://mongodb:27017` |
| `DB_NAME` | Backend | `vapa_production` |

---

## 📦 Tamaños de Imágenes (Aproximados)

- **Backend**: ~150 MB
- **Frontend**: ~25 MB (Nginx + build estático)
- **MongoDB**: ~600 MB

**Total**: ~775 MB

---

## 🔄 Workflow de Actualización

1. Hacer cambios en código
2. Commit y push a GitHub
3. En Portainer: "Pull and redeploy"
4. O manualmente: `docker-compose up -d --build`

---

## ✅ Checklist Pre-Deployment

- [ ] Código en GitHub
- [ ] `SECRET_KEY` generada (32+ caracteres)
- [ ] `REACT_APP_BACKEND_URL` configurada correctamente
- [ ] Puerto 6000 disponible en el servidor
- [ ] Docker y Docker Compose instalados
- [ ] (Opcional) Portainer instalado

---

## 🆘 Solución Rápida de Problemas

### Contenedor no inicia
```bash
docker-compose logs [servicio]
```

### Rebuild completo
```bash
docker-compose down
docker-compose up -d --build --force-recreate
```

### Limpiar todo (⚠️ borra datos)
```bash
docker-compose down -v
docker system prune -a
```

---

## 📞 Documentación Completa

Lee `DOCKER_DEPLOYMENT.md` para:
- Instrucciones detalladas de Portainer
- Configuración de dominio y SSL
- Backups automatizados
- Monitorización
- Troubleshooting avanzado

---

**¡Tu VAPA.es está listo para Docker!** 🐳
