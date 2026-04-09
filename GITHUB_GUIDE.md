# 🚀 Cómo Subir VAPA.es a GitHub

## Pasos Rápidos

### 1. Descargar el Código
El archivo `vapa-es-code.zip` contiene todo el código necesario.

### 2. Extraer el ZIP
```bash
unzip vapa-es-code.zip -d vapa-es
cd vapa-es
```

### 3. Inicializar Git
```bash
git init
git add .
git commit -m "Initial commit: VAPA.es - Sistema de Herramientas Técnicas"
```

### 4. Crear Repositorio en GitHub
1. Ve a https://github.com/new
2. Crea un repositorio llamado `vapa-es` (o el nombre que prefieras)
3. NO inicialices con README, .gitignore o licencia (ya están incluidos)

### 5. Conectar y Subir
```bash
# Reemplaza 'tu-usuario' con tu usuario de GitHub
git remote add origin https://github.com/tu-usuario/vapa-es.git
git branch -M main
git push -u origin main
```

## ⚠️ Importante: Variables de Entorno

Por seguridad, las variables de entorno están incluidas en el código actual, pero deberías:

### Opción 1: Excluir archivos .env (Recomendado)
```bash
# Antes de hacer commit, elimina los .env del repositorio
git rm --cached backend/.env
git rm --cached frontend/.env
git commit -m "Remove .env files from tracking"
git push
```

Luego, cada desarrollador deberá crear sus propios archivos .env localmente usando `.env.example` como plantilla.

### Opción 2: Mantener .env (Solo para repositorios privados)
Si tu repositorio es privado y quieres mantener las configuraciones:
- Asegúrate de que el repositorio de GitHub sea **PRIVADO**
- Cambia la `SECRET_KEY` en producción

## 📦 Contenido del Paquete

```
vapa-es/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── .env
├── README.md
├── DEPLOYMENT.md
├── IMPORTANT_INFO.md
├── start-local.sh
├── .gitignore
└── .env.example
```

## 🔧 Trabajar desde GitHub

Una vez subido a GitHub, cualquier persona puede clonar y trabajar:

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/vapa-es.git
cd vapa-es

# Configurar variables de entorno
cp .env.example backend/.env
cp .env.example frontend/.env
# Editar los archivos .env según necesidad

# Iniciar desarrollo
chmod +x start-local.sh
./start-local.sh
```

## 🌐 GitHub Pages (Opcional)

Si quieres hospedar el frontend en GitHub Pages:

```bash
cd frontend
yarn build

# Instalar gh-pages
yarn add -D gh-pages

# Agregar a package.json
"homepage": "https://tu-usuario.github.io/vapa-es",
"scripts": {
  "predeploy": "yarn build",
  "deploy": "gh-pages -d build"
}

# Desplegar
yarn deploy
```

## 🔐 Recomendaciones de Seguridad

1. **Nunca subas claves API reales a repositorios públicos**
2. Usa `.env.example` para documentar las variables necesarias
3. Agrega `.env` a `.gitignore` (ya está incluido)
4. Para producción, usa variables de entorno del servidor
5. Cambia la `SECRET_KEY` en producción

## 📝 Comandos Git Útiles

```bash
# Ver estado
git status

# Agregar cambios
git add .

# Hacer commit
git commit -m "Descripción de cambios"

# Subir cambios
git push

# Ver historial
git log --oneline

# Crear rama
git checkout -b feature/nueva-caracteristica

# Cambiar de rama
git checkout main
```

## 🎯 Siguiente Paso

Una vez en GitHub, puedes:
- ✅ Clonar en cualquier máquina
- ✅ Colaborar con otros desarrolladores
- ✅ Usar GitHub Actions para CI/CD
- ✅ Desplegar automáticamente
- ✅ Trackear issues y pull requests

---

**¡Listo para GitHub!** 🚀
