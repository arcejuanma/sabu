# SABU - Boilerplate MVP

## 🎯 Objetivo
Construir tu idea de negocio como MVP funcional para presentar a inversores.

## 📊 Estructura de Base de Datos

```mermaid
graph TD
    A[👤 Usuario] --> B[🛒 Lista de Compras]
    A --> C[💳 Tarjetas y Billeteras]
    A --> D[📱 Notificaciones]
    A --> E[📊 Historial de Ahorros]
    A --> F[🎫 Cupos Mensuales]
    
    B --> G[🛍️ Productos en la Lista]
    B --> H[⏰ Frecuencia de Compra]
    
    G --> I[🏪 Supermercados]
    G --> J[💰 Precios]
    G --> K[🏷️ Descuentos]
    
    I --> L[📍 Sucursales Cercanas]
    I --> M[🎯 Promociones del Super]
    
    C --> N[🏦 Banco]
    C --> O[💎 Tipo de Tarjeta]
    C --> P[🎁 Beneficios Bancarios]
    
    K --> Q[📅 Válido hasta]
    K --> R[💵 Descuento %]
    K --> S[🔢 Monto máximo]
    
    P --> T[👥 Segmento VIP]
    P --> U[💳 Tarjeta Gold/Platinum]
    P --> V[📅 Solo miércoles]
    P --> W[💰 Hasta $20k/mes]
    
    F --> X[💳 Cupo Bancario]
    F --> Y[🏪 Cupo Super]
    F --> Z[📊 Tracking Mensual]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec
    style F fill:#f0f4ff
```

## 🚀 Setup Rápido

### 1. Clonar y instalar
```bash
git clone <tu-repo-url>
cd SABU

# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

### 2. Ejecutar en desarrollo
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev
# → http://localhost:3000

# Terminal 2 - Backend
cd backend
npm run dev
# → http://localhost:4000
```

## 📱 URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **Health Check**: http://localhost:4000/api/health

## 📋 Próximos Pasos
1. Configurar Supabase
2. Agregar tu idea de negocio
3. Crear interfaz mobile
4. Deploy a producción
5. Pitch a inversores

## 🛠️ Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: Supabase
- **Deploy**: Vercel + Render (100% GRATIS)

## 📚 Documentación
- **Business Context**: `business-context.md`
- **Requirements**: `requirements.md`
- **Database Structure**: `database-structure.md`
- **Deployment Guide**: `DEPLOYMENT.md`