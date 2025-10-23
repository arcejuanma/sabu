# 🔐 Configuración de Supabase Auth

## 1. Configurar Google SSO en Supabase

### Paso 1: Ir a Supabase Dashboard
1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Navega a **Authentication** → **Providers**

### Paso 2: Habilitar Google
1. Busca **Google** en la lista de proveedores
2. Haz clic en **Enable**
3. Copia el **Client ID** y **Client Secret**

### Paso 3: Configurar Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API**
4. Ve a **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configura:
   - **Application type**: Web application
   - **Authorized redirect URIs**: `https://your-project-ref.supabase.co/auth/v1/callback`
6. Copia el **Client ID** y **Client Secret** a Supabase

## 2. Variables de Entorno

### Frontend (.env)
```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Backend (.env)
```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 3. Ejecutar el Schema SQL

1. Ve a **SQL Editor** en Supabase
2. Copia y pega el contenido de `supabase/schema.sql`
3. Ejecuta el script completo

## 4. Probar la Autenticación

1. Ejecuta el frontend: `npm run dev`
2. Ve a `http://localhost:3000`
3. Haz clic en "Continuar con Google"
4. Completa el login con Google
5. Deberías ver el Dashboard

## 5. URLs de Redirección

Configura estas URLs en Google Cloud Console:
- **Desarrollo**: `http://localhost:3000/dashboard`
- **Producción**: `https://your-vercel-app.vercel.app/dashboard`
