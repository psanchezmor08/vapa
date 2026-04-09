# 🚀 INICIO RÁPIDO - Portainer con GitHub

## Para Despliegue en tu Servidor (Puerto 6000)

### Paso 1: Descargar Paquete Docker
```
https://vapa-dev.preview.emergentagent.com/download.html
```
Descarga: **vapa-es-docker.zip** (~3.2 MB)

### Paso 2: Subir a GitHub
```bash
unzip vapa-es-docker.zip -d vapa-es
cd vapa-es
git init
git add .
git commit -m "Initial commit: VAPA.es"
git remote add origin https://github.com/TU_USUARIO/vapa-es.git
git push -u origin main
```

### Paso 3: Desplegar en Portainer

1. **Accede a Portainer**: `http://TU_IP:9000`

2. **Stacks → Add stack**

3. **Configurar:**
   - Name: `vapa-es`
   - Build method: **Git Repository**
   - Repository URL: `https://github.com/TU_USUARIO/vapa-es`
   - Repository reference: `refs/heads/main`
   - Compose path: `docker-compose.yml`

4. **Environment variables:**
   ```
   SECRET_KEY=crea-una-clave-super-segura-aqui-32-caracteres
   REACT_APP_BACKEND_URL=http://TU_IP:6000
   ```

5. **Deploy the stack**

6. **Espera 5-10 minutos** (primera vez construye las imágenes)

### Paso 4: Verificar

En Portainer → Containers, debes ver:
- ✅ vapa-frontend (running)
- ✅ vapa-backend (running)  
- ✅ vapa-mongodb (running)

### Paso 5: Acceder

```
http://TU_IP:6000
```

**Credenciales:**
- Email: admin@vapa.es
- Password: admin123

---

## 🔑 Generar SECRET_KEY Segura

```bash
openssl rand -hex 32
```

Copia el resultado y úsalo en las variables de entorno de Portainer.

---

## 📋 Contenido del Puerto 6000

- Frontend React (página principal)
- Backend API (en `/api/*`)
- 10 Herramientas técnicas
- Sistema de blog con CMS

---

## 🆘 ¿Problemas?

### Contenedor no inicia
1. Ve a Containers en Portainer
2. Selecciona el contenedor
3. Haz clic en "Logs"
4. Lee el error

### Backend no se conecta
Verifica `REACT_APP_BACKEND_URL` en las variables:
- Debe ser: `http://TU_IP:6000`
- NO usar `localhost` si accedes desde otra máquina

### Puerto 6000 ocupado
```bash
sudo lsof -i :6000
# O cambiar puerto en docker-compose.yml
```

---

## 📚 Documentación Completa

- **DOCKER_DEPLOYMENT.md**: Guía completa paso a paso
- **DOCKER_SUMMARY.md**: Resumen técnico
- **README.md**: Documentación general del proyecto

---

## 🔄 Actualizar Código

1. Haz cambios y push a GitHub
2. En Portainer: Stacks → vapa-es → "Pull and redeploy"

---

**¡Listo en 5 pasos!** 🎉
