#!/bin/bash

echo "🚀 SABU - Setup Boilerplate MVP"
echo "================================"

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install
cd ..

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd backend
npm install
cd ..

echo "✅ Setup completado!"
echo ""
echo "Para ejecutar en desarrollo:"
echo "1. Terminal 1: cd frontend && npm run dev"
echo "2. Terminal 2: cd backend && npm run dev"
echo ""
echo "URLs:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:4000"
echo "- Health: http://localhost:4000/api/health"
