# 🚀 Setup SABU - Guía Completa

## 🎯 ¿Qué es SABU?

SABU es una plataforma que te ayuda a ahorrar en tus compras del supermercado combinando descuentos bancarios y promociones de supermercados. Los usuarios pueden configurar qué tan flexibles son con cada producto para maximizar sus ahorros.

## 📋 Requisitos Previos

- **Node.js** 18.x o superior
- **Git** instalado
- **Cuenta de Supabase** (gratis)
- **Editor de código** (VS Code recomendado)

## 🚀 Setup Rápido (5 minutos)

### 1. Clonar el Repositorio
```bash
git clone <tu-repo-url>
cd SABU
```

### 2. Instalar Dependencias
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 3. Configurar Supabase

#### 3.1 Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Haz clic en "New Project"
4. Elige un nombre: `SABU`
5. Elige región: **South America (São Paulo)**
6. Crea una contraseña segura para la base de datos
7. Haz clic en "Create new project"

#### 3.2 Configurar Base de Datos
1. Ve a **SQL Editor** en tu proyecto de Supabase
2. Copia y pega el contenido de `supabase/schema.sql`
3. Haz clic en **Run** para ejecutar el script
4. Deberías ver: "SABU Database V4 - Modelo Simplificado creado exitosamente!"

#### 3.3 Configurar Magic Link (Email sin contraseña)
1. Ve a **Authentication** → **Settings**
2. En **Site URL** agrega: `http://localhost:3000`
3. En **Redirect URLs** agrega: `http://localhost:3000/dashboard`
4. Ve a **Email Templates** → **Magic Link**
5. Personaliza el template (opcional)

#### 3.4 Obtener Variables de Entorno
1. Ve a **Settings** → **API**
2. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

### 4. Configurar Variables de Entorno

#### 4.1 Frontend
Crea `frontend/.env.local`:
```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

#### 4.2 Backend
Crea `backend/.env`:
```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
PORT=4000
```

### 5. Ejecutar la Aplicación

#### 5.1 Frontend
```bash
cd frontend
npm run dev
# → http://localhost:3000
```

#### 5.2 Backend
```bash
cd backend
npm run dev
# → http://localhost:4000
```

## 🎉 ¡Listo! Tu aplicación está funcionando

### URLs de la Aplicación:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **Health Check**: http://localhost:4000/api/health

### Flujo de Usuario:
1. **Abrir** http://localhost:3000
2. **Ingresar email** para recibir Magic Link
3. **Revisar email** y hacer clic en el link
4. **Ver Dashboard** de SABU

## 🛠️ Estructura del Proyecto

```
SABU/
├── frontend/           # React + Vite
│   ├── src/
│   │   ├── components/ # Componentes React
│   │   ├── hooks/      # Hooks personalizados
│   │   └── lib/        # Configuración Supabase
│   └── package.json
├── backend/            # Node.js + Express
│   ├── app.js         # Servidor principal
│   └── package.json
├── supabase/
│   └── schema.sql     # Estructura de base de datos
├── .cursor/           # Configuración para Cursor AI
└── README.md          # Documentación principal
```

## 📊 Base de Datos

### Características:
- **22 tablas** optimizadas para MVP
- **Modelo híbrido** de beneficios
- **Criterios de sustitución** por producto
- **Supermercados preferidos** por usuario
- **Sin geolocalización** (simplificado)

### Tablas Principales:
- `usuarios` - Datos del usuario
- `supermercados_preferidos_usuario` - Supermercados seleccionados
- `beneficios_bancarios` - Descuentos bancarios complejos
- `beneficios_super_unitarios` - Descuentos por porcentaje
- `beneficios_super_cantidad` - Descuentos por cantidad
- `criterios_sustitucion` - Niveles de flexibilidad
- `cupos_usuario` - Tracking mensual de cupos

## 🎯 Funcionalidades del MVP

### 1. Autenticación
- **Magic Link** (email sin contraseña)
- **Dashboard** personalizado
- **Logout** seguro

### 2. Configuración de Usuario
- **Selección de supermercados** preferidos
- **Medios de pago** y segmentos
- **Criterios de sustitución** por producto

### 3. Carritos de Compra
- **Listas de productos** con frecuencia
- **Criterios de sustitución** por producto
- **Sugerencias** de productos similares

### 4. Beneficios
- **Bancarios**: Descuentos por tarjeta y segmento
- **Supermercado**: Descuentos unitarios y por cantidad
- **Combinación**: Aplicación automática de ambos

### 5. Tracking
- **Cupos mensuales** por usuario
- **Historial de compras** y ahorros
- **Notificaciones** de ofertas

## 🔧 Comandos Útiles

### Desarrollo:
```bash
# Instalar dependencias
npm install

# Ejecutar frontend
cd frontend && npm run dev

# Ejecutar backend
cd backend && npm run dev

# Ver logs
npm run dev --verbose
```

### Base de Datos:
```bash
# Ejecutar schema en Supabase
# Copiar contenido de supabase/schema.sql
# Pegar en SQL Editor de Supabase
# Ejecutar script completo
```

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Supabase connection failed"
```bash
# Verificar variables de entorno
# Verificar que el proyecto de Supabase esté activo
# Verificar que el schema se haya ejecutado correctamente
```

### Error: "Magic Link not working"
```bash
# Verificar configuración en Supabase:
# - Site URL: http://localhost:3000
# - Redirect URLs: http://localhost:3000/dashboard
# - Email templates configurados
```

## 📚 Documentación Adicional

- **Business Context**: `business-context.md`
- **Requirements**: `requirements.md`
- **Modelo Final**: `MODELO_FINAL.md`
- **Criterios de Sustitución**: `CRITERIOS_SUSTITUCION.md`
- **Beneficios Híbridos**: `BENEFICIOS_HIBRIDOS.md`

## 🚀 Próximos Pasos

1. **Explorar** el código y entender la estructura
2. **Configurar** tu proyecto de Supabase
3. **Ejecutar** la aplicación localmente
4. **Probar** el flujo de Magic Link
5. **Comenzar** a desarrollar nuevas funcionalidades

## 💡 Tips para Estudiantes

- **Usa Cursor AI** para ayuda con el código
- **Lee la documentación** antes de empezar
- **Prueba** cada funcionalidad paso a paso
- **No te preocupes** por errores, son normales
- **Pregunta** cuando tengas dudas

¡Listo para empezar a desarrollar SABU! 🎉
