# 🐳 Despliegue de VAPA.es con Docker y Portainer

Esta guía te ayudará a desplegar VAPA.es en tu servidor usando Portainer desde GitHub.

---

## 📋 Requisitos Previos

- ✅ Servidor con Docker instalado
- ✅ Portainer instalado y corriendo
- ✅ Puerto 6000 disponible
- ✅ Código en GitHub

---

## 🚀 Método 1: Despliegue desde GitHub con Portainer

### Paso 1: Subir Código a GitHub

Sigue las instrucciones de `GITHUB_GUIDE.md` para subir tu código.

### Paso 2: Acceder a Portainer

1. Abre tu Portainer: `http://TU_IP:9000`
2. Inicia sesión con tus credenciales
3. Selecciona tu entorno (generalmente "local")

### Paso 3: Crear Stack desde Git

1. En el menú lateral, haz clic en **"Stacks"**
2. Clic en **"+ Add stack"**
3. Nombra tu stack: `vapa-es`

### Paso 4: Configurar Repository

Selecciona **"Git Repository"** y configura:

```
Repository URL: https://github.com/TU_USUARIO/vapa-es
Repository reference: refs/heads/main
Compose path: docker-compose.yml
```

**Nota:** Si tu repositorio es privado, necesitarás agregar credenciales de autenticación.

### Paso 5: Variables de Entorno

En la sección **"Environment variables"**, agrega:

```env
SECRET_KEY=tu-clave-secreta-super-segura-aqui
REACT_APP_BACKEND_URL=http://TU_IP:6000
```

**Genera una SECRET_KEY segura:**
```bash
openssl rand -hex 32
```

### Paso 6: Deploy

1. Scroll hasta abajo
2. Habilita **"Auto-update"** (opcional, para updates automáticos)
3. Clic en **"Deploy the stack"**
4. Espera a que se construyan las imágenes (puede tomar 5-10 minutos la primera vez)

### Paso 7: Verificar Estado

1. Ve a **"Containers"** en el menú lateral
2. Deberías ver 3 contenedores:
   - ✅ `vapa-frontend` (running)
   - ✅ `vapa-backend` (running)
   - ✅ `vapa-mongodb` (running)

### Paso 8: Acceder a la Aplicación

Abre en tu navegador:
```
http://TU_IP:6000
```

---

## 🚀 Método 2: Despliegue Manual con Docker Compose

Si prefieres no usar Portainer, puedes hacer el despliegue manual:

### Paso 1: Clonar Repositorio

```bash
cd /opt
git clone https://github.com/TU_USUARIO/vapa-es.git
cd vapa-es
```

### Paso 2: Configurar Variables de Entorno

```bash
cp .env.docker .env
nano .env
```

Edita:
```env
SECRET_KEY=tu-clave-secreta-super-segura-aqui
REACT_APP_BACKEND_URL=http://TU_IP:6000
```

### Paso 3: Construir e Iniciar

```bash
docker-compose up -d --build
```

### Paso 4: Verificar Estado

```bash
docker-compose ps
docker-compose logs -f
```

### Paso 5: Acceder

```
http://TU_IP:6000
```

---

## 📊 Comandos Útiles

### Ver Logs en Tiempo Real

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Solo MongoDB
docker-compose logs -f mongodb
```

### Reiniciar Servicios

```bash
# Reiniciar todo
docker-compose restart

# Reiniciar solo backend
docker-compose restart backend

# Reiniciar solo frontend
docker-compose restart frontend
```

### Reconstruir Contenedores

```bash
# Si cambias código
docker-compose up -d --build

# Forzar reconstrucción sin cache
docker-compose build --no-cache
docker-compose up -d
```

### Detener y Eliminar

```bash
# Detener sin eliminar
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener, eliminar contenedores Y volúmenes (⚠️ borra la BD)
docker-compose down -v
```

---

## 🔧 Configuración de Variables de Entorno

### Variables Importantes

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SECRET_KEY` | Clave secreta para JWT | `abc123...` (32+ caracteres) |
| `REACT_APP_BACKEND_URL` | URL del backend para el frontend | `http://192.168.1.100:6000` |

### Cambiar Puerto

Si quieres usar otro puerto en lugar del 6000:

1. Edita `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "TU_PUERTO:80"  # Cambia TU_PUERTO
```

2. Actualiza `REACT_APP_BACKEND_URL`:
```env
REACT_APP_BACKEND_URL=http://TU_IP:TU_PUERTO
```

3. Reconstruye:
```bash
docker-compose up -d --build
```

---

## 🌐 Configurar Dominio (Opcional)

Si tienes un dominio (ejemplo: vapa.es):

### Opción 1: Usar Nginx Reverse Proxy

Crear archivo `/etc/nginx/sites-available/vapa`:

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

Activar:
```bash
sudo ln -s /etc/nginx/sites-available/vapa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Opción 2: Cambiar Puerto de Docker a 80

```yaml
frontend:
  ports:
    - "80:80"
```

### SSL con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d vapa.es -d www.vapa.es
```

---

## 🗄️ Backup de MongoDB

### Crear Backup

```bash
# Backup manual
docker-compose exec mongodb mongodump --out=/data/backup

# Copiar backup al host
docker cp vapa-mongodb:/data/backup ./mongodb-backup
```

### Restaurar Backup

```bash
# Copiar backup al contenedor
docker cp ./mongodb-backup vapa-mongodb:/data/restore

# Restaurar
docker-compose exec mongodb mongorestore /data/restore
```

### Backup Automático (Cron)

Crear script `/opt/backup-vapa.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/vapa"

mkdir -p $BACKUP_DIR
cd /opt/vapa-es

docker-compose exec -T mongodb mongodump --archive > $BACKUP_DIR/vapa_$DATE.archive

# Mantener solo últimos 7 días
find $BACKUP_DIR -name "vapa_*.archive" -mtime +7 -delete
```

Agregar a crontab:
```bash
chmod +x /opt/backup-vapa.sh
crontab -e

# Backup diario a las 2 AM
0 2 * * * /opt/backup-vapa.sh
```

---

## 🔍 Troubleshooting

### Contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs backend
docker-compose logs frontend

# Verificar estado
docker-compose ps
```

### Error de conexión a MongoDB

```bash
# Verificar que MongoDB esté corriendo
docker-compose ps mongodb

# Ver logs de MongoDB
docker-compose logs mongodb

# Reiniciar MongoDB
docker-compose restart mongodb
```

### Frontend no se conecta al Backend

1. Verifica `REACT_APP_BACKEND_URL` en variables de entorno
2. Debe apuntar a la URL externa (no `localhost` interno de Docker)
3. Reconstruye el frontend después de cambiar variables:
   ```bash
   docker-compose up -d --build frontend
   ```

### Puerto 6000 ya en uso

```bash
# Ver qué está usando el puerto
sudo lsof -i :6000
sudo netstat -tulpn | grep 6000

# Cambiar puerto en docker-compose.yml
```

### Base de datos vacía después de reiniciar

Verifica que los volúmenes persistan:
```bash
docker volume ls | grep vapa
docker volume inspect vapa_mongodb_data
```

---

## 📈 Monitorización con Portainer

### Ver Recursos

1. Ve a **"Containers"**
2. Selecciona un contenedor (ejemplo: `vapa-backend`)
3. Puedes ver:
   - Logs en tiempo real
   - Estadísticas de CPU/RAM
   - Variables de entorno
   - Puertos expuestos

### Restart Automático

Los contenedores están configurados con `restart: unless-stopped`, por lo que:
- ✅ Se reinician automáticamente si fallan
- ✅ Se inician al arrancar el servidor
- ❌ No se reinician si los detienes manualmente

---

## ✅ Checklist de Despliegue

- [ ] Código subido a GitHub
- [ ] Portainer accesible
- [ ] Puerto 6000 disponible
- [ ] Variables de entorno configuradas
- [ ] SECRET_KEY generada y segura
- [ ] REACT_APP_BACKEND_URL apunta a IP/dominio correcto
- [ ] Stack creado en Portainer desde GitHub
- [ ] 3 contenedores corriendo (frontend, backend, mongodb)
- [ ] Aplicación accesible en http://TU_IP:6000
- [ ] Login funciona (admin@vapa.es / admin123)
- [ ] Cambiar contraseña de admin
- [ ] (Opcional) Configurar dominio
- [ ] (Opcional) Configurar SSL
- [ ] (Opcional) Configurar backups

---

## 🎯 Credenciales por Defecto

```
Email: admin@vapa.es
Password: admin123
```

**⚠️ IMPORTANTE:** Cambia estas credenciales después del primer login desde el panel de admin.

---

## 🔄 Actualizar desde GitHub

Si tienes Auto-update habilitado en Portainer:
- Los cambios en GitHub se desplegarán automáticamente

Si no, para actualizar manualmente:

### Desde Portainer:
1. Ve a **"Stacks"**
2. Selecciona `vapa-es`
3. Clic en **"Pull and redeploy"**

### Desde Terminal:
```bash
cd /opt/vapa-es
git pull
docker-compose up -d --build
```

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `docker-compose logs -f`
2. Verifica variables de entorno
3. Asegúrate de que los 3 contenedores estén running
4. Verifica conectividad de red

---

**¡Tu VAPA.es está listo para producción con Docker!** 🐳🚀
