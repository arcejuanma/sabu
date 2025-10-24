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
    A --> G[🏪 Supermercados Preferidos]
    
    B --> H[🛍️ Productos en la Lista]
    B --> I[⏰ Frecuencia de Compra]
    B --> J[🔄 Criterios de Sustitución]
    
    H --> K[🏪 Supermercados]
    H --> L[💰 Precios]
    H --> M[🏷️ Descuentos]
    
    K --> N[🎯 Promociones del Super]
    K --> O[📊 Beneficios Unitarios]
    K --> P[📊 Beneficios por Cantidad]
    
    C --> Q[🏦 Banco]
    C --> R[💎 Tipo de Tarjeta]
    C --> S[🎁 Beneficios Bancarios]
    
    M --> T[📅 Válido hasta]
    M --> U[💵 Descuento %]
    M --> V[🔢 Monto máximo]
    
    S --> W[👥 Segmento VIP]
    S --> X[💳 Tarjeta Gold/Platinum]
    S --> Y[📅 Solo miércoles]
    S --> Z[💰 Hasta $20k/mes]
    
    F --> AA[💳 Cupo Bancario]
    F --> BB[📊 Tracking Mensual]
    
    J --> CC[🔒 Exacto]
    J --> DD[⚖️ Calidad Similar]
    J --> EE[💰 Precio Significativo]
    J --> FF[🏷️ Solo Precio]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec
    style F fill:#f0f4ff
    style G fill:#e8f5e8
    style J fill:#f3e5f5
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
- **Database Structure**: `supabase/schema.sql`
- **Modelo Simplificado**: `MODELO_SIMPLIFICADO.md`
- **Criterios de Sustitución**: `CRITERIOS_SUSTITUCION.md`
- **Beneficios Híbridos**: `BENEFICIOS_HIBRIDOS.md`
- **Magic Link Setup**: `MAGIC_LINK_SETUP.md`
- **Deployment Guide**: `DEPLOYMENT.md`