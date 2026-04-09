#!/bin/bash

# Script de Desarrollo Local para VAPA.es
# Este script configura y ejecuta el entorno de desarrollo completo

echo "========================================="
echo "  VAPA.es - Script de Desarrollo Local  "
echo "========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependencias
echo "1. Verificando dependencias..."

if ! command_exists node; then
    echo -e "${RED}✗ Node.js no está instalado${NC}"
    echo "  Por favor instala Node.js desde: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js instalado${NC}"

if ! command_exists python3; then
    echo -e "${RED}✗ Python 3 no está instalado${NC}"
    echo "  Por favor instala Python 3"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 instalado${NC}"

if ! command_exists mongod; then
    echo -e "${YELLOW}⚠ MongoDB no está instalado${NC}"
    echo "  Instalando MongoDB..."
    # Instrucciones varían según el SO
    echo "  Por favor instala MongoDB manualmente desde: https://www.mongodb.com/try/download/community"
    exit 1
fi
echo -e "${GREEN}✓ MongoDB instalado${NC}"

echo ""
echo "2. Configurando variables de entorno..."

# Crear .env para backend si no existe
if [ ! -f backend/.env ]; then
    echo "Creando backend/.env..."
    cat > backend/.env << EOF
MONGO_URL="mongodb://localhost:27017"
DB_NAME="vapa_database"
CORS_ORIGINS="*"
SECRET_KEY="vapa-jwt-secret-key-2025-change-in-production"
EOF
    echo -e "${GREEN}✓ backend/.env creado${NC}"
else
    echo -e "${GREEN}✓ backend/.env ya existe${NC}"
fi

# Crear .env para frontend si no existe
if [ ! -f frontend/.env ]; then
    echo "Creando frontend/.env..."
    cat > frontend/.env << EOF
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
ENABLE_HEALTH_CHECK=false
EOF
    echo -e "${GREEN}✓ frontend/.env creado${NC}"
else
    echo -e "${GREEN}✓ frontend/.env ya existe${NC}"
fi

echo ""
echo "3. Instalando dependencias..."

# Backend
echo "Instalando dependencias de Python..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt -q
cd ..
echo -e "${GREEN}✓ Dependencias de Python instaladas${NC}"

# Frontend
echo "Instalando dependencias de Node.js..."
cd frontend
if ! command_exists yarn; then
    npm install -g yarn
fi
yarn install --silent
cd ..
echo -e "${GREEN}✓ Dependencias de Node.js instaladas${NC}"

echo ""
echo "4. Iniciando servicios..."

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "Deteniendo servicios..."
    kill $MONGO_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Servicios detenidos correctamente${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar MongoDB
echo "Iniciando MongoDB..."
mkdir -p data/db
mongod --dbpath data/db --quiet &
MONGO_PID=$!
sleep 3
echo -e "${GREEN}✓ MongoDB iniciado (PID: $MONGO_PID)${NC}"

# Iniciar Backend
echo "Iniciando Backend FastAPI..."
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 3
echo -e "${GREEN}✓ Backend iniciado en http://localhost:8001 (PID: $BACKEND_PID)${NC}"

# Iniciar Frontend
echo "Iniciando Frontend React..."
cd frontend
yarn start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo -e "${GREEN}✓ Frontend iniciando en http://localhost:3000${NC}"

echo ""
echo "========================================="
echo -e "${GREEN}  ✓ VAPA.es está corriendo localmente  ${NC}"
echo "========================================="
echo ""
echo "URLs de acceso:"
echo "  • Frontend: http://localhost:3000"
echo "  • Backend API: http://localhost:8001"
echo "  • API Docs: http://localhost:8001/docs"
echo ""
echo "Credenciales de admin:"
echo "  • Email: admin@vapa.es"
echo "  • Password: admin123"
echo ""
echo "Logs guardados en:"
echo "  • Backend: logs/backend.log"
echo "  • Frontend: logs/frontend.log"
echo ""
echo -e "${YELLOW}Presiona Ctrl+C para detener todos los servicios${NC}"
echo ""

# Esperar indefinidamente
wait
