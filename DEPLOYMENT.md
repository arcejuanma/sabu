# 🚀 Deployment Guide - SABU

## Opción 1: Deployment Automático (Recomendado)

### 1. Configurar GitHub Secrets
Ve a tu repo en GitHub → Settings → Secrets and variables → Actions

**Agregar estos secrets:**
- `VERCEL_TOKEN`: Token de Vercel
- `VERCEL_ORG_ID`: ID de organización
- `VERCEL_PROJECT_ID`: ID del proyecto

### 2. Push a main
```bash
git add .
git commit -m "feat: initial setup"
git push origin main
```

### 3. Verificar deployment
- GitHub Actions ejecutará automáticamente
- Frontend se deployará en Vercel
- Backend se deployará en Render (automático)

## Opción 2: Deployment Manual

### Frontend (Vercel)
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

### Backend (Render)
```bash
# Render se conecta automáticamente a GitHub
# Solo necesitas configurar en el dashboard de Render
```

## URLs de Producción
- **Frontend**: https://tu-app.vercel.app
- **Backend**: https://tu-app.onrender.com
- **Health Check**: https://tu-app.onrender.com/api/health

## Variables de Entorno en Producción

### Vercel (Frontend)
- `VITE_SUPABASE_URL`: URL de Supabase
- `VITE_SUPABASE_ANON_KEY`: Key anónima
- `VITE_API_URL`: URL del backend

### Render (Backend)
- `SUPABASE_URL`: URL de Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key
- `PORT`: 4000

## Verificar que funciona
1. Frontend carga sin errores
2. Backend responde en /api/health
3. Conexión a Supabase funciona
4. Variables de entorno configuradas

## Troubleshooting
- Verificar que todos los secrets estén configurados
- Revisar logs en GitHub Actions
- Verificar variables de entorno en Vercel/Render
- Probar endpoints manualmente
