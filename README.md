# SABU - Boilerplate MVP

## 🎯 Objetivo
Construir tu idea de negocio como MVP funcional para presentar a inversores.

## 📊 Estructura de Base de Datos

```mermaid
erDiagram
    USUARIOS ||--o{ CARRITOS_X_USUARIO : "tiene"
    USUARIOS ||--o{ MEDIOS_DE_PAGO_X_USUARIO : "tiene"
    USUARIOS ||--o{ HISTORIAL_COMPRAS : "realiza"
    USUARIOS ||--o{ NOTIFICACIONES : "recibe"
    
    CARRITOS_X_USUARIO ||--o{ PRODUCTOS_X_CARRITO : "contiene"
    CARRITOS_X_USUARIO ||--o{ HISTORIAL_COMPRAS : "genera"
    
    PRODUCTOS ||--o{ PRODUCTOS_X_CARRITO : "incluido_en"
    PRODUCTOS ||--o{ PRODUCTOS_X_SUPERMERCADO : "vendido_en"
    PRODUCTOS ||--o{ BENEFICIOS_X_PRODUCTO : "tiene_beneficio"
    PRODUCTOS }o--|| CATEGORIAS_PRODUCTOS : "pertenece_a"
    
    SUPERMERCADOS ||--o{ SUCURSALES : "tiene"
    SUPERMERCADOS ||--o{ PRODUCTOS_X_SUPERMERCADO : "vende"
    SUPERMERCADOS ||--o{ BENEFICIOS_X_MEDIO_DE_PAGO : "tiene_beneficio"
    SUPERMERCADOS ||--o{ BENEFICIOS_X_PRODUCTO : "tiene_beneficio"
    
    MEDIOS_DE_PAGO ||--o{ MEDIOS_DE_PAGO_X_USUARIO : "asignado_a"
    MEDIOS_DE_PAGO ||--o{ BENEFICIOS_X_MEDIO_DE_PAGO : "tiene_beneficio"
    
    SEGMENTOS ||--o{ SEGMENTOS_X_MEDIO_DE_PAGO : "aplica_a"
    SEGMENTOS ||--o{ MEDIOS_DE_PAGO_X_USUARIO : "especifica"
    SEGMENTOS ||--o{ BENEFICIOS_X_MEDIO_DE_PAGO : "especifica"
    
    BENEFICIOS ||--o{ BENEFICIOS_X_MEDIO_DE_PAGO : "aplica_a"
    BENEFICIOS ||--o{ BENEFICIOS_X_PRODUCTO : "aplica_a"
    
    HISTORIAL_COMPRAS }o--|| SUCURSALES : "comprado_en"
    
    USUARIOS {
        uuid id PK
        string nombre
        string telefono
        string email
        string calle
        string altura
        string codigo_postal
        string ciudad
        decimal lat
        decimal lng
    }
    
    CARRITOS_X_USUARIO {
        uuid id PK
        uuid usuario_id FK
        string nombre
        int frecuencia_dias
        timestamp proxima_notificacion
        timestamp ultima_compra
        string estado
    }
    
    PRODUCTOS {
        uuid id PK
        string nombre
        text descripcion
        uuid categoria_id FK
        string marca
    }
    
    SUPERMERCADOS {
        uuid id PK
        string nombre
        boolean activo
    }
    
    MEDIOS_DE_PAGO {
        uuid id PK
        string tipo
        string banco
        string nombre
    }
    
    BENEFICIOS {
        uuid id PK
        string nombre
        string tipo
        decimal valor
        decimal monto_maximo
        date fecha_inicio
        date fecha_fin
        int[] dias_vigencia
    }
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