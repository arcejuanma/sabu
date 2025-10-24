# 🔍 Debug Magic Link

## Verificar configuración actual

### 1. Verificar variables de entorno
```bash
# En el terminal de Vercel o local
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### 2. Verificar en el navegador
Abre las DevTools (F12) y ejecuta:
```javascript
// Verificar configuración de Supabase
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY)

// Verificar URL actual
console.log('Current origin:', window.location.origin)
```

### 3. Verificar configuración en Supabase
1. Ve a **Authentication** → **URL Configuration**
2. Verifica que:
   - **Site URL** = `https://sabu-eight.vercel.app`
   - **Redirect URLs** incluye `https://sabu-eight.vercel.app/dashboard`

### 4. Probar Magic Link paso a paso
1. Abre `https://sabu-eight.vercel.app`
2. Ingresa tu email
3. Revisa el email recibido
4. Haz clic en el link
5. Verifica a qué URL te redirige

### 5. Verificar logs en Supabase
1. Ve a **Authentication** → **Logs**
2. Busca el intento de login
3. Verifica si hay errores

## Posibles problemas

### Problema 1: Variables de entorno incorrectas
**Síntoma:** Error al conectar con Supabase
**Solución:** Verificar que las variables estén configuradas en Vercel

### Problema 2: Redirect URL incorrecta
**Síntoma:** 404 al hacer clic en el Magic Link
**Solución:** Configurar Redirect URLs en Supabase

### Problema 3: Site URL incorrecta
**Síntoma:** Magic Link no funciona
**Solución:** Cambiar Site URL en Supabase

### Problema 4: Caché del navegador
**Síntoma:** Cambios no se reflejan
**Solución:** Limpiar caché o usar modo incógnito

## Comandos útiles

```bash
# Verificar deploy en Vercel
vercel ls

# Ver logs de Vercel
vercel logs

# Verificar variables de entorno
vercel env ls
```
