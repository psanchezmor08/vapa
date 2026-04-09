# 🚀 INSTALACIÓN VAPA.es EN TU SERVIDOR

## 📥 PASO 1: DESCARGAR EL CÓDIGO

Desde tu servidor (por SSH), ejecuta:

```bash
cd ~
wget https://vapa-dev.preview.emergentagent.com/vapa-es-production.zip
unzip vapa-es-production.zip
cd vapa-es-production
```

---

## 🐳 PASO 2: INSTALAR DOCKER (si no lo tienes)

```bash
# Verificar si Docker ya está instalado
docker --version

# Si NO está instalado, ejecuta:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin -y

# Reiniciar sesión
exit
# Vuelve a conectarte por SSH
```

---

## ⚙️ PASO 3: CONFIGURAR VARIABLES DE ENTORNO

```bash
# Genera una clave secreta
openssl rand -hex 32
# Copia el resultado

# Crea el archivo .env
nano .env
```

**Contenido del .env:**
```env
SECRET_KEY=<pega-la-clave-que-generaste>
REACT_APP_BACKEND_URL=http://<IP-DE-TU-SERVIDOR>:6000
```

Ejemplo:
```env
SECRET_KEY=a1b2c3d4e5f6...
REACT_APP_BACKEND_URL=http://192.168.1.100:6000
```

Guarda: `Ctrl+X` → `Y` → `Enter`

---

## 🚀 PASO 4: ARRANCAR LA APLICACIÓN

```bash
# Construir e iniciar (primera vez: 10-15 minutos)
docker-compose up -d --build
```

**Ver el progreso:**
```bash
docker-compose logs -f
```

Espera hasta ver:
- "Application startup complete" (backend)
- "Compiled successfully" (frontend)

Presiona `Ctrl+C` para salir de los logs.

---

## ✅ PASO 5: VERIFICAR

```bash
# Ver contenedores running
docker ps

# Debes ver 3 contenedores:
# - vapa-frontend
# - vapa-backend  
# - vapa-mongodb
```

**Acceder desde navegador:**
```
http://<IP-DE-TU-SERVIDOR>:6000
```

**Credenciales admin:**
```
Email: admin@vapa.es
Password: admin123
```

---

## 🔧 COMANDOS ÚTILES

```bash
# Ver logs
docker-compose logs -f

# Reiniciar todo
docker-compose restart

# Detener
docker-compose down

# Arrancar de nuevo
docker-compose up -d

# Ver recursos
docker stats
```

---

## 🌐 CONFIGURAR DOMINIO (Opcional)

Si quieres usar `vapa.es` en lugar de la IP:

### 1. Configurar Nginx Reverse Proxy

```bash
sudo apt install nginx -y

sudo nano /etc/nginx/sites-available/vapa.es
```

Contenido:
```nginx
server {
    listen 80;
    server_name vapa.es www.vapa.es;

    location / {
        proxy_pass http://localhost:6000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar
sudo ln -s /etc/nginx/sites-available/vapa.es /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2. Configurar SSL (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d vapa.es -d www.vapa.es
```

---

## 🆘 PROBLEMAS COMUNES

### Puerto 6000 ocupado
```bash
sudo lsof -i :6000
# O cambia el puerto en docker-compose.yml
```

### Contenedor no inicia
```bash
docker-compose logs <nombre-contenedor>
# Ejemplo: docker-compose logs backend
```

### Sin espacio en disco
```bash
df -h
docker system prune -a
```

### Permisos
```bash
sudo chown -R $USER:$USER ~/vapa-es-production
```

---

## 📋 CHECKLIST

- [ ] Docker instalado (`docker --version`)
- [ ] Código descargado y extraído
- [ ] .env configurado con SECRET_KEY e IP
- [ ] `docker-compose up -d --build` ejecutado
- [ ] 3 contenedores running (`docker ps`)
- [ ] Acceso en navegador: `http://IP:6000`
- [ ] Login con admin@vapa.es / admin123 ✅

---

## 🎯 INCLUYE

✅ 12 Herramientas técnicas (incluyendo Timestamp y Regex)
✅ Blog con búsqueda
✅ Sistema de admin completo
✅ Autenticación JWT
✅ MongoDB
✅ Todo optimizado para producción

---

**¡Listo para funcionar en tu servidor!** 🚀
