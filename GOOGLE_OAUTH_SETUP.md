# 🔐 Configuración Google OAuth - Paso a Paso

## 🎯 Objetivo
Configurar Google OAuth para que usuarios externos puedan hacer login sin necesidad de publicar la app.

## 📋 Paso 1: Crear Proyecto en Google Cloud Console

### 1.1 Ir a Google Cloud Console
1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Haz clic en **"Seleccionar proyecto"** (arriba a la izquierda)
3. Haz clic en **"Nuevo proyecto"**

### 1.2 Crear el Proyecto
- **Nombre del proyecto**: `SABU-Auth` (o el que prefieras)
- **Organización**: Dejar en blanco (personal)
- Haz clic en **"Crear"**

## 📋 Paso 2: Configurar OAuth Consent Screen

### 2.1 Ir a OAuth Consent Screen
1. En el menú lateral, busca **"APIs y servicios"**
2. Haz clic en **"Pantalla de consentimiento de OAuth"**
3. Selecciona **"Externo"** (para usuarios externos)
4. Haz clic en **"Crear"**

### 2.2 Información de la App
**Información de la aplicación:**
- **Nombre de la aplicación**: `SABU`
- **Correo electrónico de soporte**: Tu email
- **Correo electrónico de contacto del desarrollador**: Tu email

**Dominios autorizados:**
- **Dominio de la aplicación**: Dejar en blanco por ahora

**Información del desarrollador:**
- **Correo electrónico de contacto**: Tu email

Haz clic en **"Guardar y continuar"**

### 2.3 Scopes (Permisos)
- **Scopes**: Dejar por defecto (email, profile, openid)
- Haz clic en **"Guardar y continuar"**

### 2.4 Usuarios de prueba
**Usuarios de prueba:**
- Agrega tu email personal
- Agrega emails de otros desarrolladores si los tienes
- Haz clic en **"Guardar y continuar"**

### 2.5 Resumen
- Revisa la información
- Haz clic en **"Volver al panel"**

## 📋 Paso 3: Crear Credenciales OAuth

### 3.1 Ir a Credenciales
1. En el menú lateral, **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"+ Crear credenciales"**
3. Selecciona **"ID de cliente de OAuth 2.0"**

### 3.2 Configurar Tipo de Aplicación
**Tipo de aplicación**: **"Aplicación web"**

**Nombre**: `SABU Web App`

**Orígenes de JavaScript autorizados:**
```
http://localhost:3000
http://localhost:5173
https://tu-dominio.vercel.app
```

**URI de redirección autorizadas:**
```
https://tu-proyecto.supabase.co/auth/v1/callback
```

### 3.3 Crear Credenciales
1. Haz clic en **"Crear"**
2. **¡IMPORTANTE!** Copia inmediatamente:
   - **ID de cliente**
   - **Secreto de cliente**

## 📋 Paso 4: Configurar Supabase

### 4.1 Ir a Supabase Dashboard
1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Ve a **"Authentication"** → **"Providers"**
3. Busca **"Google"** y haz clic en **"Enable"**

### 4.2 Configurar Google Provider
**Client ID**: Pega el ID de cliente de Google
**Client Secret**: Pega el secreto de cliente de Google

**Site URL**: `http://localhost:3000` (para desarrollo)

### 4.3 Configurar Redirect URLs
En **"Redirect URLs"** agrega:
```
http://localhost:3000/dashboard
https://tu-dominio.vercel.app/dashboard
```

## 📋 Paso 5: Probar la Configuración

### 5.1 Configurar Variables de Entorno
Crea `frontend/.env.local`:
```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### 5.2 Ejecutar la Aplicación
```bash
cd frontend
npm install
npm run dev
```

### 5.3 Probar el Login
1. Ve a `http://localhost:3000`
2. Haz clic en **"Continuar con Google"**
3. Deberías ver la pantalla de Google OAuth
4. Completa el login
5. Deberías volver al dashboard de SABU

## 🔧 Solución de Problemas

### Error: "redirect_uri_mismatch"
- Verifica que las URIs en Google Console coincidan exactamente
- Asegúrate de incluir `https://tu-proyecto.supabase.co/auth/v1/callback`

### Error: "access_denied"
- Verifica que tu email esté en "Usuarios de prueba"
- O que la app esté en modo "Testing" (no "Production")

### Error: "invalid_client"
- Verifica que el Client ID y Secret sean correctos
- Copia y pega exactamente sin espacios extra

## 🚀 Para Producción

### Cuando estés listo para producción:
1. En Google Console, cambia el estado a **"Production"**
2. Agrega tu dominio real en **"Orígenes autorizados"**
3. Actualiza las **"Redirect URLs"** con tu dominio de producción

## 📝 Notas Importantes

- ✅ **No necesitas publicar la app** para usuarios externos
- ✅ **Modo "Testing"** permite hasta 100 usuarios
- ✅ **Gratis** para desarrollo y MVP
- ✅ **Fácil de escalar** cuando crezca el negocio

## 🎯 Resultado Final

Los usuarios podrán:
1. Hacer clic en "Continuar con Google"
2. Ver la pantalla de Google (con tu logo y nombre)
3. Autorizar la aplicación
4. Volver automáticamente a SABU
5. Ver su dashboard personalizado
