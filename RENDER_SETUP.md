# 🚀 Render Setup - SABU Backend

## ¿Por qué Render?
- **100% GRATIS** para proyectos pequeños
- **Deploy automático** desde GitHub
- **SSL automático**
- **Dominio personalizado**
- **Sin límites de tiempo** (a diferencia de Railway)

## Paso 1: Crear cuenta en Render
1. Ve a [render.com](https://render.com)
2. **Regístrate** con tu cuenta de GitHub
3. **Conecta** tu repositorio

## Paso 2: Crear Web Service
1. **New** → **Web Service**
2. **Connect GitHub** → Selecciona tu repo
3. **Configuración**:
   - **Name**: `sabu-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: `18`

## Paso 3: Variables de Entorno
En el dashboard de Render, agrega:
- `SUPABASE_URL`: Tu URL de Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Tu service role key
- `PORT`: `4000`

## Paso 4: Deploy Automático
- **Auto-deploy**: Habilitado por defecto
- **Branch**: `main`
- **Deploy**: Automático en cada push

## URLs que obtendrás
- **Backend**: `https://sabu-backend.onrender.com`
- **Health Check**: `https://sabu-backend.onrender.com/api/health`

## Ventajas de Render
✅ **Gratis** para proyectos pequeños
✅ **Deploy automático** desde GitHub
✅ **SSL automático**
✅ **Sin límites de tiempo**
✅ **Fácil configuración**
✅ **Logs en tiempo real**

## Troubleshooting
- **Build fails**: Verificar que `package.json` tenga `"start": "node app.js"`
- **Port error**: Verificar que uses `process.env.PORT || 4000`
- **Timeout**: Render puede tardar 1-2 minutos en el primer deploy
