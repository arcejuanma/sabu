# 🔧 Configuración de Redirect URLs en Supabase

## Problema
El Magic Link te redirige a `localhost` en lugar de tu dominio de Vercel.

## Solución

### 1. Ir a Supabase Dashboard
1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Navega a **Authentication** → **URL Configuration**

### 2. Configurar Site URL
En **Site URL**, cambia de:
```
http://localhost:5173
```
A tu dominio de Vercel:
```
https://tu-app.vercel.app
```

### 3. Configurar Redirect URLs
En **Redirect URLs**, agrega:
```
https://tu-app.vercel.app/
https://tu-app.vercel.app
```

### 4. Configurar en el código (opcional)
También puedes actualizar el código para usar el dominio correcto:

```javascript
// En frontend/src/hooks/useAuth.js
const signInWithMagicLink = async (email) => {
  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: `${window.location.origin}/`
    }
  })
  // ...
}
```

## URLs de Ejemplo

Si tu app de Vercel es `https://sabu-app.vercel.app`:

**Site URL:**
```
https://sabu-app.vercel.app
```

**Redirect URLs:**
```
https://sabu-app.vercel.app/
https://sabu-app.vercel.app
```

## Verificación

Después de hacer los cambios:
1. **Guarda** la configuración en Supabase
2. **Espera 1-2 minutos** para que se propague
3. **Prueba** el Magic Link nuevamente
4. Debería redirigir a tu dominio de Vercel

## Nota Importante

- Los cambios pueden tardar unos minutos en aplicarse
- Si sigues teniendo problemas, verifica que el dominio de Vercel esté correcto
- Puedes tener múltiples URLs en Redirect URLs (localhost para desarrollo, Vercel para producción)
