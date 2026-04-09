# Guía de Despliegue a Producción - VAPA.es

Esta guía detalla cómo migrar el código de desarrollo local a tu servidor de producción vapa.es.

## 📦 Preparación

### 1. Archivos a Transferir

Copia estos archivos/carpetas a tu servidor:
```
/app/backend/          (todo el contenido)
/app/frontend/         (todo el contenido)
/app/README.md
/app/start-local.sh
```

**NO copies:**
- `node_modules/`
- `venv/`
- `build/`
- `.git/`
- `logs/`
- `data/`

## 🔧 Configuración en Servidor

### Paso 1: Conectar al Servidor

```bash
ssh usuario@vapa.es
```

### Paso 2: Preparar Directorio

```bash
cd /var/www/
mkdir -p vapa.es
cd vapa.es
```

### Paso 3: Copiar Archivos

Desde tu máquina local:
```bash
# Opción 1: SCP
scp -r backend/ frontend/ README.md usuario@vapa.es:/var/www/vapa.es/

# Opción 2: rsync (recomendado)
rsync -avz --exclude 'node_modules' --exclude 'venv' --exclude '.git' \
  ./ usuario@vapa.es:/var/www/vapa.es/
```

### Paso 4: Configurar Variables de Entorno

#### Backend (.env)
```bash
cd /var/www/vapa.es/backend
nano .env
```

Contenido:
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="vapa_production"
CORS_ORIGINS="https://vapa.es,https://www.vapa.es"
SECRET_KEY="tu-clave-secreta-segura-generada-aqui"
```

Para generar SECRET_KEY segura:
```bash
openssl rand -hex 32
```

#### Frontend (.env)
```bash
cd /var/www/vapa.es/frontend
nano .env
```

Contenido:
```env
REACT_APP_BACKEND_URL=https://vapa.es
```

**IMPORTANTE:** El backend debe estar accesible desde la misma URL (vapa.es) usando rutas /api/*

### Paso 5: Instalar Dependencias

#### Backend
```bash
cd /var/www/vapa.es/backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

#### Frontend
```bash
cd /var/www/vapa.es/frontend

# Instalar yarn si no está instalado
npm install -g yarn

# Instalar dependencias
yarn install

# Crear build de producción
yarn build
```

Esto generará la carpeta `build/` con archivos estáticos optimizados.

## 🌐 Configuración de Nginx

### Configuración Completa

```bash
sudo nano /etc/nginx/sites-available/vapa.es
```

Contenido:
```nginx
# Redirigir HTTP a HTTPS
server {
    listen 80;
    server_name vapa.es www.vapa.es;
    return 301 https://$server_name$request_uri;
}

# Configuración HTTPS principal
server {
    listen 443 ssl http2;
    server_name vapa.es www.vapa.es;

    # Certificados SSL (usar Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/vapa.es/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vapa.es/privkey.pem;
    
    # Configuración SSL segura
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Frontend estático
    root /var/www/vapa.es/frontend/build;
    index index.html;

    # Logs
    access_log /var/log/nginx/vapa.es.access.log;
    error_log /var/log/nginx/vapa.es.error.log;

    # Archivos estáticos
    location /static/ {
        alias /var/www/vapa.es/frontend/build/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Logo y assets
    location /logovapa.png {
        alias /var/www/vapa.es/frontend/build/logovapa.png;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Google AdSense
    location /ads.txt {
        alias /var/www/vapa.es/frontend/build/ads.txt;
    }

    # API Backend (proxy a FastAPI)
    location /api/ {
        proxy_pass http://127.0.0.1:8001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # React Router (todas las rutas a index.html)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Activar Configuración

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/vapa.es /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 🔒 Configurar SSL (HTTPS)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d vapa.es -d www.vapa.es

# Verificar renovación automática
sudo certbot renew --dry-run
```

## 🚀 Configurar Backend como Servicio

### Opción 1: Systemd (Recomendado)

```bash
sudo nano /etc/systemd/system/vapa-backend.service
```

Contenido:
```ini
[Unit]
Description=VAPA.es Backend FastAPI
After=network.target mongodb.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/vapa.es/backend
Environment="PATH=/var/www/vapa.es/backend/venv/bin"
ExecStart=/var/www/vapa.es/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Activar servicio:
```bash
sudo systemctl daemon-reload
sudo systemctl enable vapa-backend
sudo systemctl start vapa-backend
sudo systemctl status vapa-backend
```

### Opción 2: PM2

```bash
# Instalar PM2
npm install -g pm2

# Iniciar backend
cd /var/www/vapa.es/backend
source venv/bin/activate
pm2 start "uvicorn server:app --host 0.0.0.0 --port 8001" --name vapa-backend

# Guardar configuración
pm2 save
pm2 startup
```

## 🗄️ MongoDB en Producción

### Configuración Segura

```bash
# Editar configuración de MongoDB
sudo nano /etc/mongod.conf
```

Configuración:
```yaml
# Network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1

# Security
security:
  authorization: enabled

# Storage
storage:
  dbPath: /var/lib/mongodb
```

### Crear Usuario Admin para MongoDB

```bash
mongo

use admin
db.createUser({
  user: "vapa_admin",
  pwd: "contraseña-segura-aqui",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

use vapa_production
db.createUser({
  user: "vapa_user",
  pwd: "contraseña-segura-aqui",
  roles: [ { role: "readWrite", db: "vapa_production" } ]
})
exit
```

Actualizar backend/.env:
```env
MONGO_URL="mongodb://vapa_user:contraseña-segura-aqui@localhost:27017/vapa_production"
```

```bash
# Reiniciar MongoDB
sudo systemctl restart mongod
```

## 📊 Monitorización

### Logs del Sistema

```bash
# Backend (systemd)
sudo journalctl -u vapa-backend -f

# Backend (PM2)
pm2 logs vapa-backend

# Nginx
sudo tail -f /var/log/nginx/vapa.es.access.log
sudo tail -f /var/log/nginx/vapa.es.error.log
```

### Configurar Logrotate

```bash
sudo nano /etc/logrotate.d/vapa
```

Contenido:
```
/var/log/nginx/vapa.es*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null
    endscript
}
```

## 🔄 Actualizaciones Futuras

### Script de Actualización

Crea `update.sh`:
```bash
#!/bin/bash

echo "Actualizando VAPA.es..."

# Backup
echo "Creando backup..."
mongodump --db=vapa_production --out=/backups/vapa_$(date +%Y%m%d_%H%M%S)

# Detener servicios
echo "Deteniendo servicios..."
sudo systemctl stop vapa-backend

# Actualizar backend
cd /var/www/vapa.es/backend
source venv/bin/activate
pip install -r requirements.txt

# Actualizar frontend
cd /var/www/vapa.es/frontend
yarn install
yarn build

# Reiniciar servicios
echo "Reiniciando servicios..."
sudo systemctl start vapa-backend
sudo systemctl reload nginx

echo "Actualización completa!"
```

```bash
chmod +x update.sh
```

## 🛡️ Seguridad Adicional

### Firewall (UFW)

```bash
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable
```

### Fail2Ban (Protección contra ataques)

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 📈 Google AdSense

1. Coloca tu archivo `ads.txt` en `/var/www/vapa.es/frontend/public/ads.txt`
2. Reconstruye el frontend: `yarn build`
3. El archivo estará disponible en `https://vapa.es/ads.txt`

## ✅ Checklist Final

- [ ] Variables de entorno configuradas (backend y frontend)
- [ ] Dependencias instaladas (backend y frontend)
- [ ] Frontend construido (`yarn build`)
- [ ] Nginx configurado y activo
- [ ] SSL configurado (HTTPS)
- [ ] Backend corriendo como servicio
- [ ] MongoDB configurado y seguro
- [ ] Firewall configurado
- [ ] Logs funcionando
- [ ] Backup configurado
- [ ] ads.txt colocado (si aplica)
- [ ] Cambiar credenciales de admin por defecto

## 🆘 Troubleshooting

### Backend no inicia
```bash
# Ver logs
sudo journalctl -u vapa-backend -n 50

# Verificar puerto 8001
sudo netstat -tulpn | grep 8001

# Verificar permisos
ls -la /var/www/vapa.es/backend
```

### Frontend no carga
```bash
# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx

# Ver logs
sudo tail -n 100 /var/log/nginx/vapa.es.error.log
```

### MongoDB problemas
```bash
# Verificar estado
sudo systemctl status mongod

# Ver logs
sudo tail -n 100 /var/log/mongodb/mongod.log

# Reiniciar
sudo systemctl restart mongod
```

### API no responde
```bash
# Verificar que backend está corriendo
curl http://localhost:8001/api/

# Verificar proxy de Nginx
curl https://vapa.es/api/
```

## 📞 Soporte

Si tienes problemas durante el deployment, revisa:
1. Logs de Nginx
2. Logs del backend
3. Configuración de variables de entorno
4. Permisos de archivos

---

**¡Tu aplicación VAPA.es está lista para producción!** 🚀
