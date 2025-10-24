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

**¿Primera vez?** Sigue la guía completa en [SETUP.md](SETUP.md)

```bash
# 1. Clonar y instalar
git clone <tu-repo-url>
cd SABU

# 2. Frontend
cd frontend && npm install

# 3. Backend  
cd ../backend && npm install

# 4. Ejecutar
# Terminal 1: cd frontend && npm run dev
# Terminal 2: cd backend && npm run dev
```

## 📱 URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **Health Check**: http://localhost:4000/api/health

## 🛠️ Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Auth**: Magic Link (email sin contraseña)
- **Deploy**: Vercel + Render (100% GRATIS)

## 📚 Documentación
- **Setup Completo**: [SETUP.md](SETUP.md) - Guía paso a paso
- **Business Context**: [business-context.md](business-context.md) - Idea de negocio
- **Requirements**: [requirements.md](requirements.md) - Problemas core del MVP
- **Modelo Final**: [MODELO_FINAL.md](MODELO_FINAL.md) - Estructura de base de datos
- **Criterios de Sustitución**: [CRITERIOS_SUSTITUCION.md](CRITERIOS_SUSTITUCION.md) - Flexibilidad por producto
- **Beneficios Híbridos**: [BENEFICIOS_HIBRIDOS.md](BENEFICIOS_HIBRIDOS.md) - Descuentos bancarios + supermercado