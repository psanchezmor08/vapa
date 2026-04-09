# VAPA.es - Sistema de Herramientas Técnicas

![VAPA Logo](frontend/public/logovapa.png)

Sistema profesional de herramientas técnicas para administradores de sistemas, con calculadora de subredes, generadores de contraseñas, QR, hash, y más. Incluye un sistema de blog con CMS completo.

## 🚀 Características

### Herramientas (10 disponibles)
1. **Calculadora de Subredes IPv4** - Cálculo completo de redes, máscaras, rangos IP
2. **Generador QR** - Crear códigos QR personalizados
3. **Generador de Contraseñas** - Contraseñas seguras con múltiples opciones
4. **Convertidor Base64** - Encode/decode de texto
5. **Generador de Hash** - MD5, SHA-1, SHA-256, SHA-512
6. **Validador JSON** - Validar y formatear JSON
7. **Convertidor de Unidades** - Bytes, KB, MB, GB, TB
8. **Generador UUID** - Crear UUIDs únicos
9. **Codificador URL** - URL encoding/decoding
10. **Analizador de Puertos** - Información de puertos comunes

### Sistema de Blog
- ✅ Sistema de gestión de contenido (CMS)
- ✅ Autenticación JWT
- ✅ Roles de usuario (admin, editor, viewer)
- ✅ Crear, editar y eliminar posts
- ✅ Soporte Markdown
- ✅ Posts publicados/borrador

## 🛠️ Stack Tecnológico

**Backend:**
- FastAPI (Python)
- MongoDB (Motor async driver)
- JWT Authentication
- Pydantic models

**Frontend:**
- React 19
- React Router v7
- Tailwind CSS
- Axios
- React Markdown

## 📋 Requisitos

- Node.js 16+
- Python 3.9+
- MongoDB 4.4+
- yarn (recomendado) o npm

## 🚀 Inicio Rápido - Desarrollo Local

### Opción 1: Script Automático (Recomendado)

```bash
# Hacer ejecutable el script
chmod +x start-local.sh

# Ejecutar
./start-local.sh
```

El script automáticamente:
- Verifica dependencias
- Configura variables de entorno
- Instala todas las dependencias
- Inicia MongoDB, Backend y Frontend
- Muestra logs en tiempo real

### Opción 2: Manual

#### 1. Configurar MongoDB
```bash
# Crear directorio para datos
mkdir -p data/db

# Iniciar MongoDB
mongod --dbpath data/db
```

#### 2. Backend (Terminal 2)
```bash
cd backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### 3. Frontend (Terminal 3)
```bash
cd frontend

# Instalar dependencias
yarn install

# Iniciar desarrollo
yarn start
```

## 🌐 URLs de Acceso

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001
- **API Docs:** http://localhost:8001/docs
- **OpenAPI JSON:** http://localhost:8001/openapi.json

## 🔐 Credenciales de Admin

Por defecto, el sistema crea un usuario administrador:

- **Email:** admin@vapa.es
- **Password:** admin123

**⚠️ IMPORTANTE:** Cambia estas credenciales en producción.

## 📁 Estructura del Proyecto

```
vapa.es/
├── backend/
│   ├── server.py          # FastAPI app principal
│   ├── requirements.txt   # Dependencias Python
│   └── .env              # Variables de entorno
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   │   ├── tools/    # Herramientas
│   │   │   ├── Navbar.js
│   │   │   └── Footer.js
│   │   ├── pages/        # Páginas principales
│   │   ├── services/     # API client
│   │   ├── contexts/     # React contexts
│   │   ├── App.js        # App principal
│   │   └── App.css       # Estilos globales
│   ├── public/
│   │   └── logovapa.png  # Logo de VAPA
│   ├── package.json
│   └── .env              # Variables de entorno
├── start-local.sh         # Script de inicio
├── logs/                  # Logs de desarrollo
└── README.md
```

## 🎨 Diseño y Branding

### Colores
- **Verde Lima Principal:** `#cdff00`
- **Degradado de fondo:** Verde oscuro a negro
- **Acentos:** Variaciones de verde

### Logo
El logo de VAPA está ubicado en `frontend/public/logovapa.png`

## 📝 Variables de Entorno

### Backend (.env)
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="vapa_database"
CORS_ORIGINS="*"
SECRET_KEY="vapa-jwt-secret-key-2025-change-in-production"
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
ENABLE_HEALTH_CHECK=false
```

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario (requiere admin)
- `GET /api/auth/me` - Obtener usuario actual

### Blog
- `GET /api/blog/posts` - Listar posts
- `GET /api/blog/posts/{id}` - Obtener post
- `POST /api/blog/posts` - Crear post (requiere auth)
- `PUT /api/blog/posts/{id}` - Actualizar post (requiere auth)
- `DELETE /api/blog/posts/{id}` - Eliminar post (requiere auth)

### Herramientas
- `POST /api/tools/subnet-calculator` - Calcular subred
- `POST /api/tools/qr-generator` - Generar QR
- `POST /api/tools/password-generator` - Generar contraseña
- `POST /api/tools/base64` - Convertir Base64
- `POST /api/tools/hash` - Generar hash
- `POST /api/tools/json-validator` - Validar JSON
- `POST /api/tools/unit-converter` - Convertir unidades
- `GET /api/tools/uuid-generator` - Generar UUID
- `POST /api/tools/url-encoder` - Codificar URL
- `POST /api/tools/port-analyzer` - Analizar puerto

## 🚀 Deployment a Producción

### 1. Configurar Variables de Entorno

**Backend:**
```env
MONGO_URL="mongodb://tu-servidor:27017"
DB_NAME="vapa_production"
CORS_ORIGINS="https://vapa.es"
SECRET_KEY="genera-una-clave-secreta-segura-aqui"
```

**Frontend:**
```env
REACT_APP_BACKEND_URL=https://api.vapa.es
```

### 2. Build del Frontend
```bash
cd frontend
yarn build
```

### 3. Configurar Servidor Web

**Nginx ejemplo:**
```nginx
# Frontend
server {
    listen 80;
    server_name vapa.es www.vapa.es;
    root /var/www/vapa.es/frontend/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}

# Backend API
server {
    listen 80;
    server_name api.vapa.es;

    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Configurar HTTPS
```bash
# Usando Certbot (Let's Encrypt)
sudo certbot --nginx -d vapa.es -d www.vapa.es -d api.vapa.es
```

### 5. Proceso del Backend con PM2
```bash
# Instalar PM2
npm install -g pm2

# Iniciar backend
cd backend
pm2 start "uvicorn server:app --host 0.0.0.0 --port 8001" --name vapa-backend
pm2 save
pm2 startup
```

### 6. Google AdSense
Coloca tu archivo `ads.txt` en `frontend/public/ads.txt` antes del build.

## 🧪 Testing

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
yarn test
```

## 📊 Monitorización

Los logs se guardan en:
- Backend: `logs/backend.log`
- Frontend: `logs/frontend.log`

Para producción, considera usar:
- **Sentry** para error tracking
- **LogRocket** para session replay
- **Google Analytics** para analytics

## 🛡️ Seguridad

- ✅ JWT tokens para autenticación
- ✅ Bcrypt para hashing de contraseñas
- ✅ CORS configurado
- ✅ Validación de inputs con Pydantic
- ⚠️ Cambiar SECRET_KEY en producción
- ⚠️ Configurar CORS restrictivo en producción
- ⚠️ Usar HTTPS en producción

## 🤝 Contribuir

Este es un proyecto personal. Para sugerencias o mejoras, contacta al administrador.

## 📄 Licencia

© 2025 VAPA.es - Todos los derechos reservados

## 📞 Soporte

Para soporte técnico o consultas, visita:
- Website: https://vapa.es
- Email: admin@vapa.es

---

**Desarrollado con ❤️ para profesionales IT**
