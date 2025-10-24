# 🔧 Configuración de Variables de Entorno

## Para el Frontend

### Opción 1: Archivo .env.local (Recomendado)
Crea un archivo `.env.local` en la carpeta `frontend/` con:

```bash
# En frontend/.env.local
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### Opción 2: Modificar archivo de configuración
Edita `frontend/src/config/env.js` y reemplaza los valores:

```javascript
export const config = {
  supabase: {
    url: 'https://tu-proyecto.supabase.co',
    anonKey: 'tu_anon_key_aqui'
  }
}
```

## Para el Backend

### Opción 1: Archivo .env (Recomendado)
Crea un archivo `.env` en la carpeta `backend/` con:

```bash
# En backend/.env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
PORT=4000
```

### Opción 2: Variables de sistema
```bash
export SUPABASE_URL=https://tu-proyecto.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
export PORT=4000
```

## Cómo obtener las keys de Supabase

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Ve a **Settings** → **API**
3. Copia:
   - **Project URL** → `VITE_SUPABASE_URL` / `SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

## Verificar configuración

### Frontend:
```bash
cd frontend
npm run dev
# Debería mostrar: "Cargando SABU..." sin errores
```

### Backend:
```bash
cd backend
npm run dev
# Debería mostrar: "Server running on port 4000"
```

## Seguridad

- ❌ **NUNCA** subas archivos `.env` al repositorio
- ✅ **SÍ** sube `.env.example` como plantilla
- ✅ **SÍ** agrega `.env*` al `.gitignore`
