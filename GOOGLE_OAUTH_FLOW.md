# 🔄 Flujo de Google OAuth - SABU

## 📱 Flujo Visual del Usuario

```
1. Usuario abre SABU
   ↓
2. Ve pantalla de Login
   ↓
3. Hace clic en "Continuar con Google"
   ↓
4. Redirección a Google OAuth
   ↓
5. Ve pantalla de Google con:
   - Logo de SABU
   - "SABU quiere acceder a tu cuenta"
   - Botones: "Permitir" / "Cancelar"
   ↓
6. Usuario hace clic en "Permitir"
   ↓
7. Google redirecciona a Supabase
   ↓
8. Supabase procesa el token
   ↓
9. Supabase redirecciona a SABU Dashboard
   ↓
10. Usuario ve su Dashboard personalizado
```

## 🔧 Configuración Técnica

### Google Cloud Console
```
Proyecto: SABU-Auth
Tipo: Aplicación Web
Orígenes: localhost:3000, tu-dominio.vercel.app
Redirect: https://tu-proyecto.supabase.co/auth/v1/callback
```

### Supabase Dashboard
```
Provider: Google
Client ID: [de Google Console]
Client Secret: [de Google Console]
Site URL: http://localhost:3000
Redirect URLs: /dashboard
```

### Frontend React
```javascript
// Un solo botón hace todo
<button onClick={() => supabase.auth.signInWithOAuth({ 
  provider: 'google',
  options: { redirectTo: '/dashboard' }
})}>
  Continuar con Google
</button>
```

## 🎯 Ventajas de esta Configuración

✅ **Sin publicación**: App en modo "Testing"
✅ **Usuarios externos**: Cualquiera puede hacer login
✅ **Gratis**: Hasta 100 usuarios en testing
✅ **Fácil**: Un solo botón en el frontend
✅ **Seguro**: Tokens JWT automáticos
✅ **Escalable**: Fácil pasar a producción

## 🚨 Puntos Críticos

1. **URIs exactas**: Deben coincidir perfectamente
2. **Usuarios de prueba**: Agregar emails en Google Console
3. **Variables de entorno**: Configurar correctamente
4. **Redirect URLs**: Incluir localhost y producción

## 📊 Estados de la App

### Modo Testing (Desarrollo)
- ✅ Hasta 100 usuarios
- ✅ Solo usuarios de prueba
- ✅ No requiere verificación
- ✅ Ideal para MVP

### Modo Production (Lanzamiento)
- ✅ Usuarios ilimitados
- ✅ Cualquier usuario
- ✅ Requiere verificación de Google
- ✅ Para lanzamiento real
