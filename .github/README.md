# GitHub Actions - SABU

## Secrets Requeridos

Para que el deployment automático funcione, necesitas configurar estos secrets en GitHub:

### Vercel (Frontend)
- `VERCEL_TOKEN`: Token de Vercel
- `VERCEL_ORG_ID`: ID de tu organización en Vercel
- `VERCEL_PROJECT_ID`: ID del proyecto en Vercel

### Railway (Backend)
- `RAILWAY_TOKEN`: Token de Railway
- `RAILWAY_SERVICE_ID`: ID del servicio en Railway

## Cómo obtener los tokens

### Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Settings → Tokens → Create Token
3. Copia el token y agrégalo como `VERCEL_TOKEN`

### Railway
1. Ve a [railway.app](https://railway.app)
2. Settings → Tokens → Create Token
3. Copia el token y agrégalo como `RAILWAY_TOKEN`

## Deployment Manual

Si prefieres deployment manual:

### Frontend (Vercel)
```bash
cd frontend
npx vercel --prod
```

### Backend (Railway)
```bash
cd backend
npx railway login
npx railway up
```
