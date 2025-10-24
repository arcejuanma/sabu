# 🚀 Configuración para Desarrollo Local

## Configuración de Supabase para Desarrollo

### 1. Redirect URLs en Supabase
En **Authentication** → **URL Configuration**, agrega estas URLs:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:**
```
http://localhost:3000/
http://localhost:3000
https://sabu-eight.vercel.app/
https://sabu-eight.vercel.app
```

### 2. Variables de Entorno Local
Crea un archivo `.env.local` en la carpeta `frontend/`:

```bash
# frontend/.env.local
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 3. Ejecutar en Desarrollo
```bash
# Desde la carpeta frontend/
npm run dev
```

La aplicación se ejecutará en `http://localhost:3000`

### 4. Magic Link en Desarrollo
- **Local:** Magic Link redirige a `http://localhost:3000/`
- **Producción:** Magic Link redirige a `https://sabu-eight.vercel.app/`

### 5. Verificación
1. Abre `http://localhost:3000`
2. Ingresa tu email
3. Revisa el email recibido
4. El link debería redirigir a `localhost:3000`

## Configuración Automática

El código detecta automáticamente el entorno:

```javascript
// Detectar si estamos en desarrollo local
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const redirectUrl = isLocal 
  ? 'http://localhost:3000/' 
  : `${window.location.origin}/`
```

## Troubleshooting

### Problema: Magic Link no funciona en localhost
**Solución:** Verificar que `http://localhost:3000/` esté en Redirect URLs de Supabase

### Problema: Variables de entorno no se cargan
**Solución:** Verificar que el archivo `.env.local` esté en `frontend/` y tenga el prefijo `VITE_`

### Problema: Puerto diferente
**Solución:** Si usas otro puerto (ej: 5173), actualiza la configuración en Supabase y en el código
