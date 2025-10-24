# 📧 Configuración Magic Link - SABU

## 🎯 ¿Qué es Magic Link?

**Magic Link** es una forma súper simple de autenticación:
1. Usuario ingresa su email
2. Recibe un link por email
3. Hace clic en el link → ¡Ya está logueado!
4. Sin contraseñas, sin Google, sin complicaciones

## 🚀 Configuración en Supabase

### Paso 1: Ir a Authentication Settings
1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Navega a **Authentication** → **Settings**

### Paso 2: Configurar Email Templates
1. Ve a **Email Templates**
2. Selecciona **Magic Link**
3. Personaliza el template:

**Subject**: `Acceso a SABU - Tu link de ingreso`

**Body**:
```html
<h2>¡Hola! 👋</h2>
<p>Hacé clic en el botón para acceder a SABU:</p>
<p><a href="{{ .ConfirmationURL }}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Acceder a SABU</a></p>
<p>Si no solicitaste este email, podés ignorarlo.</p>
<p>¡Gracias por usar SABU! 💰</p>
```

### Paso 3: Configurar Redirect URLs
1. Ve a **URL Configuration**
2. En **Site URL** agrega: `http://localhost:3000`
3. En **Redirect URLs** agrega:
   ```
   http://localhost:3000/dashboard
   https://tu-dominio.vercel.app/dashboard
   ```

### Paso 4: Configurar Email Provider
1. Ve a **Email** → **Settings**
2. **Enable email confirmations**: ✅ Activado
3. **Enable email change confirmations**: ✅ Activado

## 🔧 Variables de Entorno

### Frontend (.env.local)
```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## 📱 Flujo del Usuario

```
1. Usuario abre SABU
   ↓
2. Ve pantalla de login
   ↓
3. Ingresa su email
   ↓
4. Hace clic en "Enviar Link de Acceso"
   ↓
5. Ve mensaje: "¡Revisá tu email!"
   ↓
6. Recibe email con botón "Acceder a SABU"
   ↓
7. Hace clic en el botón del email
   ↓
8. Es redirigido a SABU Dashboard
   ↓
9. ¡Ya está logueado!
```

## ✅ Ventajas del Magic Link

- ✅ **Súper simple**: Solo email, sin contraseñas
- ✅ **Seguro**: Links temporales y únicos
- ✅ **Sin configuración externa**: No necesita Google Console
- ✅ **Funciona inmediatamente**: Sin verificación
- ✅ **UX excelente**: Un solo clic para acceder
- ✅ **Mobile-friendly**: Funciona perfecto en móviles

## 🎨 Personalización del Email

Puedes personalizar completamente el email:
- **Logo**: Agregar logo de SABU
- **Colores**: Usar colores de marca
- **Texto**: Mensaje personalizado
- **Botón**: Estilo del botón de acceso

## 🔒 Seguridad

- **Links temporales**: Expiran en 1 hora por defecto
- **Un solo uso**: Cada link solo funciona una vez
- **HTTPS**: Todos los links son seguros
- **Rate limiting**: Supabase previene spam

## 🚀 Para Producción

Cuando estés listo para producción:
1. Cambia **Site URL** a tu dominio real
2. Actualiza **Redirect URLs** con tu dominio
3. Personaliza el template de email con tu marca
4. Configura tu propio proveedor de email (opcional)

## 📊 Estadísticas

Supabase te permite ver:
- Cuántos emails se enviaron
- Cuántos usuarios hicieron clic
- Tasa de conversión de login
- Errores de envío

¡Es mucho más simple que Google OAuth y perfecto para un MVP!
